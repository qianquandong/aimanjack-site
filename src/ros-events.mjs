// Durable delivery of DB-triggered events. No customer email is sent here.
// Only RPC claims may transmit; every retry reuses the same receiver idempotency key.
const q = (o) => new URLSearchParams(o).toString();
export const rosEnabled = env => env.ROS_EVENTS_ENABLED === 'true';
const freeMail = new Set(['gmail.com','googlemail.com','yahoo.com','outlook.com','hotmail.com','live.com','msn.com','icloud.com','me.com','aol.com','proton.me','protonmail.com','gmx.com','mail.com','yandex.com','qq.com','163.com','126.com','zoho.com']);
const code = (s) => /^[a-z0-9_:.-]{1,96}$/.test(String(s)) ? String(s) : 'internal_error';
export async function hmacHex(secret, text) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey('raw',enc.encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign']);
  return Array.from(new Uint8Array(await crypto.subtle.sign('HMAC',key,enc.encode(text))),x=>x.toString(16).padStart(2,'0')).join('');
}
function endpoint(raw, path) {
  try { const u=new URL(raw); return u.protocol==='https:' && !u.username && !u.password && !u.search && !u.hash && (!path || u.pathname===path) ? u.href : null; }
  catch { return null; }
}
function destination(env,target) {
  const url=target==='booking'?env.ROS_BOOKING_WEBHOOK_URL:env.ROS_WEBHOOK_URL;
  const secret=target==='booking'?env.ROS_BOOKING_WEBHOOK_SECRET:env.ROS_WEBHOOK_SECRET;
  return {url:endpoint(url,`/v1/events/${target}`),secret};
}
export function rosProcessor({env,db,fetchImpl=(...a)=>fetch(...a),now=()=>Date.now()}) {
  const rpc=(name,body={})=>db(`rpc/ros_${name}`,{method:'POST',schema:'revenue',body});
  async function eventFor(row) {
    if(row.target==='website') {
      const [r]=await db(`intake_receipts?${q({receipt_id:'eq.'+row.receipt_id,limit:1})}`,{schema:'revenue'});
      if(!r) throw Error('source_missing');
      // Explicit allowlist: never send IP, private hashes, database metadata or delivery state.
      return {event_type:'intake.received',receipt_id:r.receipt_id,received_at:r.received_at,form_version:r.form_version,
        payload:r.payload,consent_request:r.consent_request,consent_newsletter:r.consent_newsletter,
        consent_notice_version:r.consent_notice_version,utm:r.utm,self_reported_source:r.self_reported_source};
    }
    const [b]=await db(`bookings?${q({id:'eq.'+row.booking_id,select:'customer_email',limit:1})}`);
    if(!b) throw Error('source_missing');
    if(!env.EMAIL_HASH_SECRET) throw Error('identity_secret_missing');
    const raw=String(b.customer_email??'').trim().toLowerCase();
    const valid=/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(raw);
    const [local,domain]=valid?raw.split('@'):[];
    const email=valid?`${local.split('+')[0]}@${domain}`:null;
    return {...row.event_data,event_id:row.event_id,email_hmac:email?await hmacHex(env.EMAIL_HASH_SECRET,`email|${email}`):null,
      company_domain:domain&&!freeMail.has(domain)?domain:null,utm:row.event_data.utm??null};
  }
  async function deliver(row) {
    const dest=destination(env,row.target);
    if(!dest.url || !dest.secret) throw Error('destination_not_configured');
    const event=await eventFor(row),body=JSON.stringify(event),t=String(Math.floor(now()/1000));
    const signature=await hmacHex(dest.secret,`${t}.${body}`);
    const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),5000);
    try {
      const r=await fetchImpl(dest.url,{method:'POST',redirect:'error',signal:controller.signal,body,
        headers:{'content-type':'application/json','x-ros-timestamp':t,'x-ros-signature':`sha256=${signature}`,'x-ros-event-id':event.event_id??event.receipt_id}});
      if(!r.ok) { await r.body?.cancel(); throw Error(`receiver_http_${r.status}`); }
      const ack=await r.json();
      if(ack?.ok!==true || !['accepted','duplicate'].includes(ack.outcome)) throw Error('receiver_ack_invalid');
    } catch(e) {
      if(/^(receiver_http_\d{3}|receiver_ack_invalid)$/.test(e.message)) throw e;
      throw Error(controller.signal.aborted?'receiver_timeout':'receiver_network_or_json');
    } finally {clearTimeout(timer);}
  }
  async function alerts() {
    const [r]=await rpc('claim_alert');if(!r) return {due:false};
    const url=endpoint(env.ROS_ALERT_NTFY_URL);
    let ok=false;
    if(url) {
      const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),5000);
      try {
        const response=await fetchImpl(url,{method:'POST',redirect:'error',signal:controller.signal,
          headers:{title:'AI Man Jack customer sync',...(env.ROS_ALERT_NTFY_TOKEN?{authorization:`Bearer ${env.ROS_ALERT_NTFY_TOKEN}`}:{})},
          body:`Customer sync needs review: event #${r.id}, ${r.status}, attempts ${r.attempts}, code ${code(r.last_error??'pending')}. Open /admin/bookings/.`});
        ok=response.ok;await response.body?.cancel();
      }catch{/* next_alert_at keeps failed/missing notifications retryable */}finally{clearTimeout(timer);}
    }
    await rpc('finish_alert',{p_id:r.id,p_token:r.alert_token,p_ok:ok});
    return {due:true,sent:ok,configured:!!url};
  }
  async function process({limit=2}={}) {
    if(!rosEnabled(env)) return {enabled:false,processed:[]};
    const rows=await rpc('claim',{p_limit:Math.max(1,Math.min(2,Number(limit)||2))}),processed=[];
    for(const r of rows) {
      let error=null;try{await deliver(r);}catch(e){error=code(e.message);}
      // Do not swallow a failed acknowledgement write: the lease is recovered next time.
      const saved=await rpc('finish',{p_id:r.id,p_token:r.lease_token,p_ok:!error,p_error:error});
      processed.push({id:r.id,accepted:!error,saved,error});
    }
    return {enabled:true,processed,alert:await alerts()};
  }
  const list=()=>db('ros_events?select=id,target,status,attempts,total_attempts,replays,next_attempt_at,last_error,alerted_at,created_at&status=neq.delivered&order=id.asc&limit=100',{schema:'revenue'});
  const replay=id=>rpc('replay',{p_id:id});
  return {process,list,replay};
}
export async function rosEventsRoute({env,req,id,extra,db}) {
  const auth=req.headers.get('authorization');
  const admin=!!env.ADMIN_TOKEN&&auth===`Bearer ${env.ADMIN_TOKEN}`;
  const processor=typeof env.ROS_EVENT_PROCESS_TOKEN==='string'&&env.ROS_EVENT_PROCESS_TOKEN.length>=32&&auth===`Bearer ${env.ROS_EVENT_PROCESS_TOKEN}`;
  const respond=(status,data)=>new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json','cache-control':'no-store'}});
  if(!admin&&!(processor&&id==='process'&&!extra&&req.method==='POST')) return respond(401,{error:'unauthorized'});
  const p=rosProcessor({env,db});
  if(!id&&!extra&&req.method==='GET') return respond(200,{enabled:rosEnabled(env),events:await p.list()});
  if(id==='process'&&!extra&&req.method==='POST') return respond(200,await p.process());
  if(admin&&/^\d+$/.test(id??'')&&Number.isSafeInteger(Number(id))&&extra==='replay'&&req.method==='POST') {
    if(!rosEnabled(env)) return respond(409,{error:'disabled'});
    const ok=await p.replay(Number(id));return respond(ok?200:409,{ok});
  }
  return respond(404,{error:'not_found'});
}
