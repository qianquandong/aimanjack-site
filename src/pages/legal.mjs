import { EMAIL } from '../config.mjs';
import { breadcrumb, BUSINESS_REF } from '../components.mjs';

// /privacy and /sms-terms: English text is unchanged from the previous site (A2P review pages).
// Chinese versions are translations of the same text. /terms is new; Jack reviews before production.

const privacy = {
  en: { title: 'Privacy Policy | AI Man Jack', description: 'How AI Man Jack collects and uses information from calls and text messages, including SMS consent and opt-out.', crumb: 'Privacy', h1: 'Privacy Policy', body: `
<p class="meta">Last updated: July 22, 2026</p>
<p>AI Man Jack ("we", "us") provides AI education, websites, and workflow automation services, including a missed-call text-back service for local businesses. This policy explains what information we collect and how we use it.</p>
<h2>Information we collect</h2>
<p>When you call or text a business phone number powered by our service, we process your phone number and the content of your text messages solely to deliver the service: acknowledging missed calls and relaying conversations between you and the business.</p>
<h2>SMS/text messaging</h2>
<p><strong>No mobile information will be shared with third parties or affiliates for marketing or promotional purposes.</strong> Text messaging originator opt-in data and consent will not be sold or shared with any third parties.</p>
<p>Messages are sent from <strong>(469) 425-4142</strong> only to phone numbers that have called or texted us first. Message frequency: one message per missed call, plus any replies in a conversation you initiate. Message and data rates may apply. Reply STOP at any time to opt out of receiving messages, or reply HELP for help.</p>
<h2>How we use information</h2>
<p>We use your phone number only to send the messages described above on behalf of the business you contacted. We do not sell personal information, and we do not use it for advertising.</p>
<h2>Contact</h2>
<p>Questions? Email <a href="mailto:${EMAIL}">${EMAIL}</a>.</p>
<p><a href="/">&larr; Back to home</a> · <a href="/sms-terms">SMS Terms &amp; Conditions</a> · <a href="/terms">Terms of Service</a></p>` },
  zh: { title: '隐私政策 | AI Man Jack', description: 'AI Man Jack 如何收集和使用来电与短信中的信息，包括短信同意与退订方式。', crumb: '隐私', h1: '隐私政策', body: `
<p class="meta">最后更新：2026 年 7 月 22 日</p>
<p>AI Man Jack（「我们」）提供 AI 教育、网站和工作流自动化服务，包括面向本地商家的漏接来电短信回复服务。本政策说明我们收集哪些信息，以及如何使用。</p>
<h2>我们收集的信息</h2>
<p>当你拨打或发短信到由我们服务支持的商家号码时，我们只为提供服务而处理你的电话号码和短信内容：确认漏接的来电，并在你和商家之间传递对话。</p>
<h2>短信</h2>
<p><strong>手机信息不会为营销或推广目的与第三方或关联方共享。</strong>短信发起方的同意数据不会出售或共享给任何第三方。</p>
<p>短信仅从 <strong>(469) 425-4142</strong> 发给先拨打或发短信给我们的号码。发送频率：每次漏接一条，加上你发起的对话中的回复。可能产生短信和数据费用。随时回复 STOP 退订，回复 HELP 获取帮助。</p>
<h2>我们如何使用信息</h2>
<p>我们只用你的电话号码代表你联系的商家发送上述短信。我们不出售个人信息，也不用于广告。</p>
<h2>联系</h2>
<p>有问题？发邮件到 <a href="mailto:${EMAIL}">${EMAIL}</a>。</p>
<p><a href="/zh/">&larr; 返回首页</a> · <a href="/zh/sms-terms">短信条款</a> · <a href="/zh/terms">服务条款</a></p>` },
};

const sms = {
  en: { title: 'SMS Terms & Conditions | AI Man Jack', description: 'Program description, consent, message frequency and opt-out for text messages from AI Man Jack at (469) 425-4142.', crumb: 'SMS terms', h1: 'SMS Terms &amp; Conditions', body: `
<p class="meta">Last updated: July 22, 2026</p>
<h2>Program description</h2>
<p>AI Man Jack's missed-call text-back service sends a text message on behalf of a business when you call that business and your call goes unanswered. The message acknowledges your call and may include a link to book online. You can reply to the message to continue the conversation with the business.</p>
<h2>Consent</h2>
<p>You receive messages only after you place a phone call to, or send a text message to, a participating business. By calling or texting <strong>(469) 425-4142</strong> (or the phone number of a business using this service), you consent to receive SMS messages from AI Man Jack, including an automated reply when your call is not answered. Consent is not a condition of any purchase.</p>
<h2>Message frequency</h2>
<p>One message per missed call, plus replies in conversations you initiate. Message and data rates may apply.</p>
<h2>Opt out and help</h2>
<p>Reply <strong>STOP</strong> at any time to stop receiving messages. Reply <strong>HELP</strong> for help, or email <a href="mailto:${EMAIL}">${EMAIL}</a>.</p>
<h2>Privacy</h2>
<p>See our <a href="/privacy">Privacy Policy</a>. No mobile information will be shared with third parties or affiliates for marketing or promotional purposes.</p>
<p><a href="/">&larr; Back to home</a></p>` },
  zh: { title: '短信条款 | AI Man Jack', description: 'AI Man Jack 通过 (469) 425-4142 发送短信的项目说明、同意方式、发送频率和退订方法。', crumb: '短信条款', h1: '短信条款', body: `
<p class="meta">最后更新：2026 年 7 月 22 日</p>
<h2>项目说明</h2>
<p>AI Man Jack 的漏接来电短信回复服务，会在你拨打某家商家而无人接听时，代表该商家发送一条短信。短信确认收到你的来电，可能附带在线预约链接。你可以回复这条短信，继续和商家对话。</p>
<h2>同意</h2>
<p>只有在你先拨打或发短信给参与的商家之后，才会收到短信。拨打或发短信到 <strong>(469) 425-4142</strong>（或使用本服务的商家号码），即表示你同意接收来自 AI Man Jack 的短信，包括来电无人接听时的自动回复。同意不是任何购买的前提条件。</p>
<h2>发送频率</h2>
<p>每次漏接一条，加上你发起的对话中的回复。可能产生短信和数据费用。</p>
<h2>退订和帮助</h2>
<p>随时回复 <strong>STOP</strong> 停止接收短信。回复 <strong>HELP</strong> 获取帮助，或发邮件到 <a href="mailto:${EMAIL}">${EMAIL}</a>。</p>
<h2>隐私</h2>
<p>见我们的<a href="/zh/privacy">隐私政策</a>。手机信息不会为营销或推广目的与第三方或关联方共享。</p>
<p><a href="/zh/">&larr; 返回首页</a></p>` },
};

const terms = {
  en: { title: 'Terms of Service | AI Man Jack', description: 'Terms for AI Man Jack LLC’s AI receptionist and website services: fees, included minutes, cancellation, ownership of website, domain and data, service limits and contact.', crumb: 'Terms', h1: 'Terms of Service', body: `
<p class="meta">Last updated: September 9, 2026 · AI Man Jack LLC, Dallas, Texas</p>
<p>These terms describe the AI receptionist and website services sold on this site. Your signed service agreement states the exact scope for your business and prevails over this page where they differ.</p>
<h2>1. The service</h2>
<p>AI Man Jack LLC ("we") configures and operates an AI phone receptionist for your business, and, on plans that include it, builds and hosts a website. The AI answers from information you approve, captures caller details, and on plans that include booking, books appointments through the connected workflow. Plan contents are listed on the <a href="/pricing/">pricing page</a>.</p>
<h2>2. Fees</h2>
<ul>
<li>A one-time setup fee for the selected plan, due before setup begins.</li>
<li>A monthly fee, billed in advance, which includes the plan’s voice minutes for that month. Unused minutes do not roll over.</li>
<li>Voice overage at $0.45 per minute, billed with the following month.</li>
<li>Any messaging or third-party charges are confirmed in writing before contracting. Nothing is added silently.</li>
</ul>
<h2>3. Your responsibilities</h2>
<ul>
<li>Provide accurate hours, services, prices and policies, and tell us when they change.</li>
<li>Authorize call forwarding or the use of a new number for the AI.</li>
<li>Remain responsible for the content of the answers you approve and for laws that apply to your business, including any notice requirements for recorded calls and any rules that apply to health, legal or financial information.</li>
</ul>
<h2>4. Service limits</h2>
<p>The AI answers only from approved information and may still make mistakes. When it should not answer, it runs the fallback you chose: message, transfer, or a text to you. We do not guarantee call volume, bookings, revenue, search rankings or AI-assistant recommendations. We aim for continuous availability but do not guarantee uptime; if a phone or booking connection fails, the fallback runs and we are notified.</p>
<h2>5. Term and cancellation</h2>
<p>Service is month to month. You may cancel at any time with the notice stated in your service agreement. On cancellation, included hosting ends, forwarding is switched off, and you keep your website files and your domain. The AI phone number is provided by us and remains ours after cancellation; a number you forwarded to the AI is yours and is simply no longer forwarded.</p>
<h2>6. Data</h2>
<p>Call and message data is processed to deliver the service and is not sold. See the <a href="/privacy">Privacy Policy</a> and <a href="/sms-terms">SMS Terms</a>.</p>
<h2>7. Liability</h2>
<p>To the extent permitted by Texas law, our total liability for any claim relating to the service is limited to the fees you paid in the three months before the claim, and we are not liable for indirect or consequential losses, including lost bookings or revenue.</p>
<h2>8. Governing law and contact</h2>
<p>These terms are governed by the laws of the State of Texas. Questions: <a href="mailto:${EMAIL}">${EMAIL}</a>.</p>
<p><a href="/">&larr; Back to home</a></p>` },
  zh: { title: '服务条款 | AI Man Jack', description: 'AI Man Jack LLC 的 AI 前台和网站服务条款：费用、包含分钟数、取消、网站/域名/数据归属、服务边界和联系方式。', crumb: '服务条款', h1: '服务条款', body: `
<p class="meta">最后更新：2026 年 9 月 9 日 · AI Man Jack LLC，德州达拉斯</p>
<p>本条款说明本站销售的 AI 前台和网站服务。你签署的服务协议写明你店铺的具体范围；两者不一致时，以服务协议为准。</p>
<h2>1. 服务内容</h2>
<p>AI Man Jack LLC（「我们」）为你的店铺配置并运营 AI 电话前台；在包含建站的方案里，还负责搭建和托管网站。AI 按你确认的信息回答、记录来电者信息；在包含预约的方案里，通过接好的流程完成预约。各方案内容见<a href="/zh/pricing/">价格页</a>。</p>
<h2>2. 费用</h2>
<ul>
<li>所选方案的一次性安装费，安装开始前支付。</li>
<li>月费预付，包含该月的方案内通话分钟。未用完的分钟不累积。</li>
<li>超出部分每分钟 $0.45，随下月账单收取。</li>
<li>如有短信或第三方费用，签约前书面确认。不会悄悄加。</li>
</ul>
<h2>3. 你的责任</h2>
<ul>
<li>提供准确的营业时间、服务、价格和规定，有变动及时告知。</li>
<li>授权呼叫转接，或者同意 AI 使用新号码。</li>
<li>你确认的回答内容由你负责；适用于你店铺的法律也由你负责遵守，包括通话录音的告知要求，以及涉及健康、法律或金融信息的规定。</li>
</ul>
<h2>4. 服务边界</h2>
<p>AI 只按确认过的信息回答，仍可能出错。它不该答的时候，按你选的兜底方式处理：留言、转接或短信通知你。我们不保证来电量、预约数、营收、搜索排名或 AI 助手推荐。我们尽力保持持续可用，但不保证在线率；电话或预约对接故障时，兜底流程接上，我们会收到通知。</p>
<h2>5. 期限和取消</h2>
<p>服务按月。你可以随时取消，通知期见服务协议。取消后，包含的托管停止，转接关闭，网站文件和域名归你。AI 号码由我们提供，取消后仍归我们；你转接给 AI 的自有号码归你，只是不再转接。</p>
<h2>6. 数据</h2>
<p>通话和短信数据仅用于提供服务，不出售。见<a href="/zh/privacy">隐私政策</a>和<a href="/zh/sms-terms">短信条款</a>。</p>
<h2>7. 责任限制</h2>
<p>在德州法律允许的范围内，我们对与服务相关的任何索赔的全部责任，以索赔前三个月你支付的费用为上限；对间接或衍生损失，包括错失的预约或营收，不承担责任。</p>
<h2>8. 适用法律和联系</h2>
<p>本条款适用德克萨斯州法律。问题请发邮件到 <a href="mailto:${EMAIL}">${EMAIL}</a>。</p>
<p><a href="/zh/">&larr; 返回首页</a></p>` },
};

const legalPage = (lang, path, c) => {
  const bc = breadcrumb(lang, [[c.crumb, path]]);
  return { title: c.title, description: c.description, body: `<div class="wrap">${bc.html}</div><section class="wrap prose" style="padding:32px 24px 80px"><h1>${c.h1}</h1>${c.body}</section>`, jsonld: [BUSINESS_REF, bc.ld] };
};

export const pages = [
  { path: '/privacy', priority: 0.3, changefreq: 'yearly', en: legalPage('en', '/privacy', privacy.en), zh: legalPage('zh', '/privacy', privacy.zh) },
  { path: '/sms-terms', priority: 0.3, changefreq: 'yearly', en: legalPage('en', '/sms-terms', sms.en), zh: legalPage('zh', '/sms-terms', sms.zh) },
  { path: '/terms', priority: 0.3, changefreq: 'yearly', en: legalPage('en', '/terms', terms.en), zh: legalPage('zh', '/terms', terms.zh) },
];
