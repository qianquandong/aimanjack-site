// Disposable in-memory PostgreSQL. Never connects to Supabase or reads environment credentials.
import {PGlite} from '@electric-sql/pglite';
import {readFile} from 'node:fs/promises';
export async function fixture(t) {
  const pg=new PGlite();t.after(()=>pg.close());
  await pg.exec('create role anon; create role authenticated; create role service_role;');
  for(const path of ['db/schema.sql','db/migrations/2026-10-08-revenue-intake.sql','db/migrations/2026-10-11-ros-event-outbox.sql'])
    await pg.exec(await readFile(new URL('../'+path,import.meta.url),'utf8'));
  const rows=async(sql,args=[]) => (await pg.query(sql,args)).rows;
  const env={ROS_EVENTS_ENABLED:'true',ROS_BOOKING_WEBHOOK_URL:'https://ros.test/v1/events/booking',ROS_BOOKING_WEBHOOK_SECRET:'test-booking-secret',
    ROS_WEBHOOK_URL:'https://ros.test/v1/events/website',ROS_WEBHOOK_SECRET:'test-intake-secret',EMAIL_HASH_SECRET:'test-shared-identity-secret',
    ROS_ALERT_NTFY_URL:'https://alerts.test/topic',ADMIN_TOKEN:'test-owner-token',ROS_EVENT_PROCESS_TOKEN:'p'.repeat(40)};
  const booking=async(id='b1')=>rows(`insert into booking.bookings(id,business_id,service_id,staff_id,start_at,end_at,customer_name,customer_phone,customer_email,ros_utm)
    values($1,'aimanjack','demo-call','jack',now()+interval '10 days',now()+interval '10 days 20 minutes','Dana Test','+12145550147','Dana+Ops@acme.test','{"utm_source":"email","utm_campaign":"pilot"}') returning *`,[id]);
  const intake=async()=>{
    const p={dedupe_key:'a'.repeat(64),form_version:'test-v1',payload:{name:'Dana Test',email:'dana@acme.test',company:'Acme'},consent_request:true,
      consent_newsletter:false,consent_notice_version:'test-notice',ip_hash:'b'.repeat(64),subject_email_hash:'c'.repeat(64),utm:{utm_source:'email'},self_reported_source:'email'};
    return (await rows('select revenue.record_intake($1::jsonb,$2::jsonb) as r',[JSON.stringify(p),'[]']))[0].r;
  };
  const argNames={claim:['p_limit'],finish:['p_id','p_token','p_ok','p_error'],replay:['p_id'],claim_alert:[],finish_alert:['p_id','p_token','p_ok'],ready:[]};
  const db=async(path,{body={},schema='booking'}={})=>{
    if(path.startsWith('rpc/ros_')){
      const name=path.slice(8);if(!(name in argNames)) throw Error('unexpected_rpc');
      const args=argNames[name].map(k=>body[k]??null),params=args.map((_,i)=>'$'+(i+1)).join(',');
      const many=['claim','claim_alert'].includes(name);
      const result=await rows(`select ${many?'*':'revenue.ros_'+name+'('+params+') as result'}${many?' from revenue.ros_'+name+'('+params+')':''}`,args);
      return many?result:result[0].result;
    }
    const [table,query]=path.split('?'),p=new URLSearchParams(query);
    if(table==='bookings')return rows('select customer_email from booking.bookings where id=$1',[p.get('id').slice(3)]);
    if(table==='intake_receipts')return rows('select * from revenue.intake_receipts where receipt_id=$1',[p.get('receipt_id').slice(3)]);
    if(table==='ros_events')return rows("select id,target,status,attempts,total_attempts,replays,next_attempt_at,last_error,alerted_at,created_at from revenue.ros_events where status<>'delivered' order by id limit 100");
    throw Error('unexpected_path_'+table);
  };
  const due=()=>pg.exec("update revenue.ros_events set next_attempt_at=now()-interval '1 minute',next_alert_at=now()-interval '1 minute'");
  return {pg,rows,db,env,booking,intake,due};
}
