// UI chrome strings. Page copy lives in src/pages/*.mjs.
// The `demo` block is only read by the legacy receptionist pages (noindex); nothing indexable uses it.
export const T = {
  en: {
    htmlLang: 'en', ogLocale: 'en_US', otherLang: '中文', otherLangCode: 'zh',
    skip: 'Skip to content', menu: 'Menu', close: 'Close',
    nav: { training: 'Training', useCasesNav: 'Use Cases', tools: 'Free Tools', templates: 'Templates', resources: 'Resources', about: 'About', how: 'How it works', useCases: 'Use cases', pricing: 'Pricing' },   // last three: legacy pages only
    cta: {
      plan: 'Book a Workshop',
      how: 'See How Training Works', tools: 'Explore Free Tools',
      email: 'Email Jack',
      book: 'Book a 30-minute call',
      text: 'Text Jack',
      // Legacy receptionist CTAs (noindex pages only).
      call: 'Call our AI demo', callNow: 'Call now', seeHow: 'See how it works', viewPricing: 'View pricing', readCase: 'Read the case study',
      noSignup: 'No signup. Just call.', callYourself: 'Call it yourself',
    },
    demo: {
      try: 'Try our AI demo line', alwaysOn: 'Always on, 24/7', langs: 'English · Español · 中文',
      live: 'Live call', role: 'AI demo · 24/7', customer: 'Customer', ai: 'AI', booked: 'Appointment booked',
      example: 'Example conversation',
    },
    sticky: 'Book a Workshop',
    footer: {
      product: 'Product', useCases: 'Use Cases', resources: 'Resources', company: 'Company',
      training: 'Training', tools: 'Free Tools', templates: 'Templates', workflows: 'AI Workflows',
      sales: 'Sales', marketing: 'Marketing', operations: 'Operations', leadership: 'Leadership',
      guides: 'AI training guides', cases: 'Case studies', newsletter: 'Real Agent Use Cases ↗', integrations: 'Integrations',
      about: 'About Jack', contact: 'Contact', book: 'Book a workshop', privacy: 'Privacy', terms: 'Terms', sms: 'SMS terms',
      loc: 'Dallas–Fort Worth, Texas', serves: 'Onsite across Dallas, Fort Worth, Plano, Richardson, Frisco, McKinney and Arlington. Remote sessions anywhere.',
      legal: 'By calling or texting (469) 425-4142, you agree to receive SMS messages from AI Man Jack, including an automated reply when we miss your call. Message frequency varies (typically one message per missed call). Message and data rates may apply. Reply STOP to opt out, HELP for help. See our <a href="/privacy">Privacy Policy</a> and <a href="/sms-terms">SMS Terms</a>.',
    },
    breadcrumbHome: 'Home',
  },
  zh: {
    htmlLang: 'zh', ogLocale: 'zh_CN', otherLang: 'EN', otherLangCode: 'en',
    skip: '跳到正文', menu: '菜单', close: '关闭',
    nav: { training: '培训', useCasesNav: '应用场景', tools: '免费工具', templates: '模板', resources: '资源', about: '关于', how: '怎么运作', useCases: '适用行业', pricing: '价格' },
    cta: {
      plan: '预约工作坊',
      how: '看看培训怎么上', tools: '看看免费工具',
      email: '给 Jack 发邮件',
      book: '预约 30 分钟通话',
      text: '给 Jack 发短信',
      call: '拨打 AI 演示', callNow: '现在就打', seeHow: '看看怎么运作', viewPricing: '看价格', readCase: '看完整案例',
      noSignup: '不用注册，拿起电话就能试。', callYourself: '你也打一个试试',
    },
    demo: {
      try: '试一下 AI 演示线', alwaysOn: '24 小时都在', langs: '中文 · 英文 · 西班牙语',
      live: '通话中', role: 'AI 演示 · 24 小时', customer: '顾客', ai: 'AI', booked: '预约已确认',
      example: '示例对话',
    },
    sticky: '预约工作坊',
    footer: {
      product: '产品', useCases: '应用场景', resources: '资源', company: '公司',
      training: '培训', tools: '免费工具', templates: '模板', workflows: 'AI 工作流',
      sales: '销售', marketing: '市场', operations: '运营', leadership: '管理层',
      guides: 'AI 培训指南', cases: '案例', newsletter: 'Real Agent Use Cases ↗', integrations: '对接',
      about: '关于 Jack', contact: '联系', book: '预约工作坊', privacy: '隐私', terms: '服务条款', sms: '短信条款',
      loc: '德州达拉斯—沃斯堡', serves: 'Dallas、Fort Worth、Plano、Richardson、Frisco、McKinney、Arlington 均可上门；远程不限地区。',
      legal: '拨打或发短信到 (469) 425-4142，即表示你同意接收来自 AI Man Jack 的短信，包括我们漏接你电话时的自动回复。发送频率不定（通常每次漏接一条）。可能产生短信和数据费用。回复 STOP 退订，回复 HELP 获取帮助。详见我们的<a href="/zh/privacy">隐私政策</a>和<a href="/zh/sms-terms">短信条款</a>。',
    },
    breadcrumbHome: '首页',
  },
};
