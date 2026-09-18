// UI chrome strings. Page copy lives in src/pages/*.mjs.
// Convention (2026-09-14, t_a88dd404): the demo line is an AI demo, not a person.
// Speaker name in transcripts/live-call mockups reads "AI" (not "Jessy"). CTAs say
// "Call our AI demo" / "Text the AI demo" so visitors don't think they're calling
// a real receptionist named Jessy. Email CTA keeps "Email Jack" — Jack is real.
export const T = {
  en: {
    htmlLang: 'en', ogLocale: 'en_US', otherLang: '中文', otherLangCode: 'zh',
    skip: 'Skip to content', menu: 'Menu', close: 'Close',
    nav: { training: 'AI training', services: 'AI services', how: 'How it works', useCases: 'Use cases', pricing: 'Pricing', cases: 'Case studies', about: 'About' },
    cta: {
      // Primary call CTA — was 'Call Jessy'. Now makes the AI demo nature obvious.
      call: 'Call our AI demo',
      callNow: 'Call now',
      email: 'Email Jack',
      book: 'Book a 30-minute call',
      seeHow: 'See how it works', viewPricing: 'View pricing', readCase: 'Read the case study',
      // SMS CTA — was 'Text Jessy'.
      text: 'Text the AI demo',
      noSignup: 'No signup. Just call.', callYourself: 'Call it yourself',
    },
    demo: {
      // Live-call mockup copy. Speaker name = "AI" so screen readers and the
      // visible "who" label read consistently (no fake person).
      try: 'Try our AI demo line', alwaysOn: 'Always on, 24/7', langs: 'English · Español · 中文',
      live: 'Live call', role: 'AI demo · 24/7', customer: 'Customer', ai: 'AI', booked: 'Appointment booked',
      example: 'Example conversation',
    },
    modal: {
      // Dialog title — was 'Call Jessy, the AI receptionist'.
      title: 'Call our AI demo line',
      scan: 'Scan with your phone to call, or dial the number.',
      tryAsking: 'Try asking', prompts: ['Ask about price.', 'Ask for an appointment.', 'Try changing the time.'],
      copy: 'Copy number', copied: 'Number copied', qrAlt: 'QR code that dials the AI demo line',
    },
    // Sticky call label — was 'Call Jessy'.
    sticky: 'Call our AI demo',
    footer: {
      product: 'Services', solutions: 'Solutions', company: 'Company', location: 'Location',
      how: 'How it works', pricing: 'Pricing', integrations: 'Integrations', cases: 'Case studies', product_page: 'AI receptionist',
      salon: 'Salon & beauty', local: 'Local service businesses', training: 'Team training',
      about: 'About', blog: 'Blog', contact: 'Contact', privacy: 'Privacy', terms: 'Terms', sms: 'SMS terms',
      loc: 'Dallas–Fort Worth, Texas', serves: 'Serving Dallas, Fort Worth, Plano, Richardson, Frisco, McKinney, Arlington and the rest of the metroplex.',
      legal: 'By calling or texting (469) 425-4142, you agree to receive SMS messages from AI Man Jack, including an automated reply when we miss your call. Message frequency varies (typically one message per missed call). Message and data rates may apply. Reply STOP to opt out, HELP for help. See our <a href="/privacy">Privacy Policy</a> and <a href="/sms-terms">SMS Terms</a>.',
      newsletter: 'Real Agent Use Cases',
    },
    breadcrumbHome: 'Home',
  },
  zh: {
    htmlLang: 'zh', ogLocale: 'zh_CN', otherLang: 'EN', otherLangCode: 'en',
    skip: '跳到正文', menu: '菜单', close: '关闭',
    nav: { training: 'AI 培训', services: 'AI 服务', how: '怎么运作', useCases: '适用行业', pricing: '价格', cases: '案例', about: '关于' },
    cta: {
      // 主 CTA：明确是 AI 演示，不是真人前台。
      call: '拨打 AI 演示',
      callNow: '现在就打',
      email: '给 Jack 发邮件',
      book: '预约 30 分钟通话',
      seeHow: '看看怎么运作', viewPricing: '看价格', readCase: '看完整案例',
      text: '给 AI 演示发短信',
      noSignup: '不用注册，拿起电话就能试。', callYourself: '你也打一个试试',
    },
    demo: {
      try: '试一下 AI 演示线', alwaysOn: '24 小时都在', langs: '中文 · 英文 · 西班牙语',
      live: '通话中', role: 'AI 演示 · 24 小时', customer: '顾客', ai: 'AI', booked: '预约已确认',
      example: '示例对话',
    },
    modal: {
      title: '拨打 AI 演示线',
      scan: '用手机扫一下就能拨号，或者直接拨这个号码。',
      tryAsking: '可以这样问', prompts: ['问问价格。', '约个时间。', '再改一次时间。'],
      copy: '复制号码', copied: '号码已复制', qrAlt: '扫码拨打 AI 演示线的二维码',
    },
    sticky: '拨打 AI 演示',
    footer: {
      product: '服务', solutions: '行业', company: '公司', location: '所在地',
      how: '怎么运作', pricing: '价格', integrations: '对接', cases: '案例', product_page: 'AI 前台',
      salon: '美发美容', local: '本地服务商家', training: '团队培训',
      about: '关于', blog: '博客', contact: '联系', privacy: '隐私', terms: '服务条款', sms: '短信条款',
      loc: '德州达拉斯—沃斯堡', serves: '服务 Dallas、Fort Worth、Plano、Richardson、Frisco、McKinney、Arlington 及整个都会区。',
      legal: '拨打或发短信到 (469) 425-4142，即表示你同意接收来自 AI Man Jack 的短信，包括我们漏接你电话时的自动回复。发送频率不定（通常每次漏接一条）。可能产生短信和数据费用。回复 STOP 退订，回复 HELP 获取帮助。详见我们的<a href="/zh/privacy">隐私政策</a>和<a href="/zh/sms-terms">短信条款</a>。',
      newsletter: 'Real Agent Use Cases',
    },
    breadcrumbHome: '首页',
  },
};