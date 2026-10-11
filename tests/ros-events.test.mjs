import test from 'node:test';
import assert from 'node:assert/strict';
import {createHmac} from 'node:crypto';
import {fixture} from './ros-test-store.mjs';
import {rosProcessor,rosEventsRoute} from '../src/ros-events.mjs';
const ok=()=>Response.json({ok:true,outcome:'accepted'});

test('source transaction captures immutable booking states; failed outbox insert rolls back source',async t=>{
  const f=await fixture(t);await f.booking();
  await f.pg.exec("update booking.bookings set start_at=start_at+interval '1 day' where id='b1'; update booking.bookings set status='cancelled' where id='b1'; update booking.bookings set status='cancelled' where id='b1';");
  const r=await f.rows('select * from revenue.ros_events order by id');
  assert.deepEqual(r.map(x=>x.event_data.event_type),['booking.created','booking.rescheduled','booking.canceled']);
  assert.notEqual(r[0].event_data.starts_at,r[1].event_data.starts_at);assert.equal(r[0].event_data.utm.utm_campaign,'pilot');
  assert.ok(!JSON.stringify(r).includes('Dana'));assert.ok(!JSON.stringify(r).includes('@'));
  await f.pg.exec("alter table revenue.ros_events add constraint injected_failure check(booking_id <> 'atomic-fail')");
  await assert.rejects(f.booking('atomic-fail'));assert.equal((await f.rows("select * from booking.bookings where id='atomic-fail'")).length,0);
});

test('intake deduplication captures once and erasure cascades pending payload references',async t=>{
  const f=await fixture(t);const a=await f.intake(),b=await f.intake();assert.equal(a.receipt_id,b.receipt_id);
  assert.equal((await f.rows('select * from revenue.ros_events')).length,1);
  const calls=[];const p=rosProcessor({...f,fetchImpl:async(url,opts)=>{calls.push(JSON.parse(opts.body));return ok();}});
  await p.process();assert.equal(calls[0].payload.email,'dana@acme.test');assert.equal(calls[0].receipt_id,a.receipt_id);
  for(const key of ['ip_hash','subject_email_hash','dedupe_key'])assert.ok(!(key in calls[0]));
  await f.rows('select revenue.erase_receipt($1)',[a.receipt_id]);assert.equal((await f.rows('select * from revenue.ros_events')).length,0);
});

test('503 then recovery resends the same event; signed receiver acknowledgement required',async t=>{
  const f=await fixture(t);await f.booking();const calls=[];let fail=true;
  const p=rosProcessor({...f,fetchImpl:async(url,o)=>{calls.push(o);return fail?new Response('{}',{status:503}):ok();}});
  let r=await p.process();assert.equal(r.processed[0].error,'receiver_http_503');
  let [row]=await f.rows('select * from revenue.ros_events');assert.equal(row.status,'retry');assert.equal(row.attempts,1);
  assert.ok(Date.parse(row.next_attempt_at)-Date.now()>50000);
  await p.process();assert.equal(calls.length,1,'backoff honored');
  fail=false;await f.due();r=await p.process();assert.equal(r.processed[0].accepted,true);
  assert.deepEqual(JSON.parse(calls[0].body),JSON.parse(calls[1].body));
  const event=JSON.parse(calls[1].body),h=calls[1].headers;
  assert.equal(h['x-ros-signature'],'sha256='+createHmac('sha256',f.env.ROS_BOOKING_WEBHOOK_SECRET).update(h['x-ros-timestamp']+'.'+calls[1].body).digest('hex'));
  assert.equal(event.email_hmac,createHmac('sha256',f.env.EMAIL_HASH_SECRET).update('email|dana@acme.test').digest('hex'));
  assert.equal(calls[1].redirect,'error');assert.ok(!calls[1].body.includes('@'));
  await p.process();assert.equal(calls.length,2,'delivered event never sent again');
});

test('lost response retries same id; receiver duplicate acknowledgement succeeds',async t=>{
  const f=await fixture(t);await f.booking();let first=true;const ids=[];
  const p=rosProcessor({...f,fetchImpl:async(url,o)=>{ids.push(JSON.parse(o.body).event_id);if(first){first=false;throw Error('response lost');}return Response.json({ok:true,outcome:'duplicate'});}});
  await p.process();await f.due();await p.process();assert.equal(ids[0],ids[1]);
  assert.equal((await f.rows('select status from revenue.ros_events'))[0].status,'delivered');
});

test('lease recovery rejects late worker result; same-booking events wait for their predecessor',async t=>{
  const f=await fixture(t);await f.booking();await f.pg.exec("update booking.bookings set start_at=start_at+interval '1 day' where id='b1'");
  const [first]=await f.db('rpc/ros_claim',{body:{p_limit:2}});assert.ok(first);
  assert.deepEqual(await f.db('rpc/ros_claim',{body:{p_limit:2}}),[]);
  await f.pg.exec("update revenue.ros_events set lease_until=now()-interval '1 minute' where status='sending'");
  const [reclaimed]=await f.db('rpc/ros_claim',{body:{p_limit:2}});assert.equal(reclaimed.id,first.id);assert.notEqual(reclaimed.lease_token,first.lease_token);
  assert.equal(await f.db('rpc/ros_finish',{body:{p_id:first.id,p_token:first.lease_token,p_ok:true}}),false);
  assert.equal(await f.db('rpc/ros_finish',{body:{p_id:first.id,p_token:reclaimed.lease_token,p_ok:true}}),true);
  const [next]=await f.db('rpc/ros_claim',{body:{p_limit:2}});assert.equal(next.event_data.event_type,'booking.rescheduled');
});

test('bounded failures alert; alert failures remain retryable; owner replay preserves identity/history',async t=>{
  const f=await fixture(t);await f.booking();let alertFails=true,eventsFail=true;const alerts=[];
  const p=rosProcessor({...f,fetchImpl:async(url,o)=>{
    if(url.startsWith('https://alerts.test')){alerts.push(o.body);return new Response('',{status:alertFails?503:200});}
    return eventsFail?new Response('',{status:503}):ok();
  }});
  for(let i=0;i<5;i++){await f.due();await p.process();}
  let [r]=await f.rows('select * from revenue.ros_events');assert.equal(r.status,'dead');assert.equal(r.alerted_at,null);assert.equal(alerts.length,1);
  const stable=r.event_id;await p.process();assert.equal(alerts.length,1,'alert backoff');
  alertFails=false;await f.due();await p.process();[r]=await f.rows('select * from revenue.ros_events');assert.ok(r.alerted_at);assert.equal(alerts.length,2);
  assert.ok(!alerts[0].includes('b1'));assert.ok(!alerts[0].includes('dana'));assert.ok(!alerts[0].includes('@'));
  assert.equal(await p.replay(r.id),true);assert.equal((await f.rows('select count(*)::int n from revenue.ros_event_replays'))[0].n,1);
  eventsFail=false;await p.process();[r]=await f.rows('select * from revenue.ros_events');assert.equal(r.event_id,stable);assert.equal(r.status,'delivered');assert.equal(r.total_attempts,6);assert.equal(r.replays,1);
  assert.equal(await p.replay(r.id),false);
});

test('configuration gaps, invalid acknowledgements and missing alert channel stay visible',async t=>{
  const f=await fixture(t);await f.booking();delete f.env.EMAIL_HASH_SECRET;delete f.env.ROS_ALERT_NTFY_URL;
  let calls=0;const p=rosProcessor({...f,fetchImpl:async()=>{calls++;return Response.json({ok:true});}});
  await p.process();assert.equal(calls,0);assert.equal((await p.list())[0].last_error,'identity_secret_missing');
  f.env.EMAIL_HASH_SECRET='test';await f.due();await p.process();assert.equal((await p.list())[0].last_error,'receiver_ack_invalid');
  await f.pg.exec("update revenue.ros_events set status='dead'");const r=await p.process();assert.deepEqual(r.alert,{due:true,sent:false,configured:false});
  assert.equal((await p.list())[0].alerted_at,null);
});

test('disabled processing never touches DB/network; process token cannot list or replay',async()=>{
  const fail=()=>{throw Error('must not access');};assert.deepEqual(await rosProcessor({env:{},db:fail,fetchImpl:fail}).process(),{enabled:false,processed:[]});
  const env={ROS_EVENT_PROCESS_TOKEN:'p'.repeat(40),ADMIN_TOKEN:'owner'};
  const req=(method)=>new Request('https://aimanjack.com/v1/ros-events',{method,headers:{authorization:'Bearer '+env.ROS_EVENT_PROCESS_TOKEN}});
  assert.equal((await rosEventsRoute({env,req:req('GET'),db:fail})).status,401);
  assert.equal((await rosEventsRoute({env,req:req('POST'),id:'1',extra:'replay',db:fail})).status,401);
  assert.equal((await rosEventsRoute({env,req:req('POST'),id:'process',db:fail})).status,200);
});

test('migration is repeatable; roles cannot read or mutate delivery data directly',async t=>{
  const f=await fixture(t);const {readFile}=await import('node:fs/promises');await f.pg.exec(await readFile(new URL('../db/migrations/2026-10-11-ros-event-outbox.sql',import.meta.url),'utf8'));
  assert.equal(await f.db('rpc/ros_ready'),true);
  await f.pg.exec('set role anon');await assert.rejects(f.rows('select * from revenue.ros_events'));await assert.rejects(f.rows('select revenue.ros_claim(1)'));await f.pg.exec('reset role');
  await f.pg.exec('set role service_role');await assert.rejects(f.pg.exec("delete from revenue.ros_events"));await f.pg.exec('reset role');
});
