// Quote-request phone push + suggested reply (2026-10-28, Jack: "询价快速通道").
// Every new quote request buzzes Jack's phone through ntfy within seconds, so a buyer who found us through AI search
// hears back while they are still looking. The push carries no personal data — ntfy.sh is a public relay and the topic
// is the only secret (env.NTFY_TOPIC; unset = no push; optional env.NTFY_TOKEN authenticates). Name, email and the ready-to-send reply stay in the owner email,
// which goes to Jack's own mailbox. Jack sends every reply himself; nothing here writes to the buyer.

export const BOOKING_LINK = 'https://cal.com/aimanjack/ai-workflow-call';
const MAILBOX_URL = 'https://outlook.office.com/mail/';
const one = (s, max) => String(s ?? '').replace(/\s+/g, ' ').trim().slice(0, max);

// Push body: company (or the email's domain), group size, format/tool page, timing. No person name, no email address,
// and none of the free-text "workflows" message — it can hold anything the visitor typed.
export function ownerPushPayload(topic, v, { quick, companyDomain }) {
  const who = one(quick ? companyDomain : v.company || companyDomain, 60) || 'unknown company';
  const facts = [v.attendees ? `${v.attendees} 人` : null, one(quick ? v.tool : v.format, 40) || null, quick ? null : one(v.timing, 40) || null].filter(Boolean);
  return {
    topic,
    title: `新询价：${who}`,
    message: `${facts.join(' · ') || '网站报价表单'}\n详情和建议回复在邮箱（主题 [quote request]）。早回早接单。`,
    priority: 5,
    tags: ['moneybag'],
    click: MAILBOX_URL,
    actions: [{ action: 'view', label: '打开邮箱', url: MAILBOX_URL, clear: true }],
  };
}

export async function ownerPush(env, v, opts) {
  const topic = typeof env.NTFY_TOPIC === 'string' ? env.NTFY_TOPIC.trim() : '';
  if (!topic) return;
  // Anonymous ntfy.sh publishes are rate-limited per IP, and Cloudflare's shared egress IPs get 429 (seen 2026-10-28).
  // An ntfy.sh access token (NTFY_TOKEN secret) moves the limit to Jack's own account.
  const headers = { 'content-type': 'application/json' };
  if (typeof env.NTFY_TOKEN === 'string' && env.NTFY_TOKEN.trim()) headers.authorization = `Bearer ${env.NTFY_TOKEN.trim()}`;
  const r = await fetch(env.NTFY_URL || 'https://ntfy.sh/', { method: 'POST', signal: AbortSignal.timeout(8000),
    headers, body: JSON.stringify(ownerPushPayload(topic, v, opts)) });
  await r.body?.cancel();
  if (!r.ok) throw Object.assign(new Error('owner push'), { status: r.status });
}

// A first reply Jack can send as is (Reply in Outlook goes to the visitor via reply_to). Plain, short, no price,
// one link: the same 20-minute call the site offers on /book/. Chinese requests get a Chinese reply.
export function suggestedReply(v, { quick }) {
  const first = one(v.name, 40).split(' ')[0] || '';
  if (v.lang === 'zh') {
    return [`${first ? first + '，' : ''}你好！`, '',
      `谢谢你发来${quick ? '' : (one(v.company, 60) ? ` ${one(v.company, 60)} ` : '')}AI 培训的询价${v.attendees ? `（${v.attendees} 人）` : ''}。`,
      '我想先花 20 分钟听听你们每天哪些工作最花时间，再告诉你培训具体怎么安排。',
      `你可以在这里直接选时间：${BOOKING_LINK}`,
      '或者回我两个你方便的时间也行。', '', 'Jack'].join('\n');
  }
  const team = quick ? 'your team' : one(v.company, 60) || 'your team';
  return [`Hi ${first || 'there'},`, '',
    `Thanks for reaching out about AI training for ${team}${v.attendees ? ` (${v.attendees} people)` : ''}.`,
    'The best next step is a 20-minute call. I want to hear which daily work takes the most time, then I can tell you exactly what the session would cover.',
    `You can pick a time here: ${BOOKING_LINK}`,
    'Or reply with two times that work for you.', '', 'Jack'].join('\n');
}
