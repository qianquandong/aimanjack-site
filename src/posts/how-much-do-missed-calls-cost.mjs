// seo-blog workflow, backlog R11 (AI receptionist line). Every fact comes from aimanjack.com/tools/missed-call-calculator/,
// /pricing/, /ai-receptionist/ or knowledge/marketing/approved-claims.md. The three examples are made-up inputs run through the
// calculator's own formula (weeks per month = 4.33), labelled as examples in both languages. No first-person anecdotes: stories.md is empty.
export const post = {
  slug: 'how-much-do-missed-calls-cost',
  date: '2026-09-18',
  updated: undefined,
  status: 'hidden',   // receptionist-era post: URL keeps resolving, noindex, off the index (PRD 2026-09-18 §52)
  en: {
    keyword: 'how much do missed calls cost',
    title: 'How Much Do Missed Calls Cost? 3 Examples | AI Man Jack',
    description: 'How much do missed calls cost a salon, clinic or repair shop? The formula, three worked examples, and one case where an AI receptionist is not worth it.',
    h1: 'How much do missed calls cost? Run the math on your own numbers',
    sub: 'A vendor will happily give you a big number. This post shows the four-line formula behind our free calculator, runs it on three example businesses, and shows the one where the honest answer is "do not buy anything".',
    takeaways: [
      'The cost of missed calls is four multiplications: calls per day × share unanswered × business days, then × share who would have booked × average ticket.',
      'A month is 4.33 weeks (52 ÷ 12), so weekly missed calls × 4.33 gives missed calls per month.',
      'The share of missed callers who would have booked drives the result most, so enter a conservative number and test a lower one.',
      'A business that books mostly through an app, with a phone that rarely rings, will get a small number, and that is the correct result.',
      'The formula ignores callers who try again (the real cost is lower) and repeat visits from a recovered customer (the real cost is higher).',
    ],
    sections: `
<h2>What counts as a missed call</h2>
<p>Before you can answer "how much do missed calls cost?", you need to know what counts as one. A missed call is any call where a person who wanted something did not get a person. Four kinds cover almost all of them: the call went to voicemail, the line was busy, it came in after hours, or it rang while the only person at the desk was with a customer.</p>
<p>The last one is the one owners forget. A stylist with color in someone's hair, a dental assistant chairside, a mechanic under a car: the phone rings and nobody is free. Those calls do not show up as "after hours", but they are missed all the same.</p>
<p>So count all four kinds. Our <a href="/tools/missed-call-calculator/">missed call calculator</a> asks for exactly that as one number: the share of calls that go unanswered.</p>

<h2>How much do missed calls cost? The formula</h2>
<p>The math is four lines. Nothing in it is a secret, and you can do it on a napkin.</p>
<ol>
<li><strong>Missed calls per week</strong> = calls per business day × share unanswered × business days per week.</li>
<li><strong>Missed calls per month</strong> = missed calls per week × 4.33, because 52 weeks ÷ 12 months is 4.33.</li>
<li><strong>Lost bookings per month</strong> = missed calls per month × share of missed callers who would have booked.</li>
<li><strong>Lost revenue per month</strong> = lost bookings × average value of one appointment, before costs. Multiply by 12 for the year.</li>
</ol>
<p>The calculator adds one more line: how many recovered bookings a month would cover the monthly fee of the Starter plan on our <a href="/pricing/">pricing page</a>. It divides that fee by your average ticket and rounds up. The one-time setup fee is not in that line.</p>

<h2>Three worked examples</h2>
<p>These inputs are invented to show how the formula behaves. They are not customer data and not an industry average. Your own numbers are the only ones that matter.</p>
<table>
<thead><tr><th>Example inputs</th><th>A: busy appointment shop</th><th>B: small repair shop</th><th>C: app-booked studio</th></tr></thead>
<tbody>
<tr><td>Calls per business day</td><td>20</td><td>10</td><td>4</td></tr>
<tr><td>Share unanswered</td><td>1 in 4</td><td>1 in 10</td><td>1 in 10</td></tr>
<tr><td>Share of missed callers who would have booked</td><td>3 in 10</td><td>1 in 5</td><td>1 in 5</td></tr>
<tr><td>Average ticket</td><td>$150</td><td>$80</td><td>$40</td></tr>
<tr><td>Business days per week</td><td>5</td><td>6</td><td>5</td></tr>
<tr><td><strong>Missed calls per month</strong></td><td>108</td><td>26</td><td>9</td></tr>
<tr><td><strong>Lost bookings per month</strong></td><td>32</td><td>5</td><td>2</td></tr>
<tr><td><strong>Lost revenue per month</strong></td><td>$4,871</td><td>$416</td><td>$69</td></tr>
<tr><td><strong>Lost revenue per year</strong></td><td>$58,455</td><td>$4,988</td><td>$831</td></tr>
</tbody>
</table>
<p><strong>Example A</strong> is the one vendors like to show. Two recovered bookings a month would cover the Starter monthly fee. <strong>Example B</strong> is a lot smaller, and three recovered bookings a month would cover the same fee: a closer call that depends on how many of those five lost bookings a receptionist of any kind would really save.</p>
<p><strong>Example C</strong> is the honest one. At these numbers the plan would cost more than the calls being lost. The calculator says so in plain words, because an AI receptionist is not for everyone.</p>

<h2>How to get your own numbers in one week</h2>
<ol>
<li><strong>Pull missed calls from your phone system.</strong> Most carrier portals show missed calls and voicemails per day. If yours does not, keep a tally for one normal week: calls that hit voicemail, rang out, or came in after hours.</li>
<li><strong>Use a normal day, not your busiest.</strong> A Saturday rush makes the number look scarier than your month really is. Divide the week's calls by the days you were open.</li>
<li><strong>Listen to your voicemails.</strong> Of the last twenty, how many were someone trying to book, reschedule, or ask a price? That ratio is a better guess for "would have booked" than anything a vendor tells you.</li>
<li><strong>Use the ticket before costs, then be strict about it.</strong> A first visit may be worth less than a regular's visit. If most callers are new customers, use the first-visit number.</li>
<li><strong>Run it twice.</strong> Enter your numbers in the <a href="/tools/missed-call-calculator/">calculator</a>, then cut the "would have booked" share in half and run it again. If the lower result still bothers you, the problem is real.</li>
</ol>

<h2>When this math does not work</h2>
<p>It overstates the cost when callers try again. Someone who wanted an appointment at your business may simply call back an hour later. The formula counts that person as lost. If your callers are loyal regulars, your real number is smaller than the calculator's.</p>
<p>It understates the cost when a recovered customer keeps coming back. A new salon client who books once and returns for the next cut is worth far more than one ticket. The formula only counts the first visit.</p>
<p>It does not work at all for businesses where the phone is not how bookings start. If most appointments come through an app or a website, a low result is the correct answer, and the money is better spent elsewhere.</p>
<p>And answering a call is not the same as booking it. On our Starter plan the AI answers approved questions, takes messages and transfers calls, but does not book; your team still has to call people back. Booking, rescheduling and cancelling are on the Growth and Pro plans. Also, some calls should never be handled by an AI at all: the <a href="/ai-receptionist/">AI receptionist</a> does not give medical or legal advice, and on those calls it runs the fallback the business chose during setup (take a message, transfer to a number on file, or text the owner the caller's details).</p>

<h2>What to do with the number</h2>
<p>If the number is small, fix the cheap things first. Record a voicemail greeting that tells people how to book online. Forward the phone to a cell during the lunch rush. Call back every voicemail the same day.</p>
<p>If the number is large, compare it with what it costs to answer those calls: a second person at the desk, an answering service, or an AI receptionist. The full plan list, setup fees and per-minute overage for ours are on the <a href="/pricing/">pricing page</a>, and the scenarios for salons, clinics, med spas, home services and repair shops are on the <a href="/industries/">industries page</a>.</p>

<h2>What to do in the next 14 days</h2>
<ul>
<li>Log every missed call for one normal week, including the ones that rang while you were with a customer. A tally sheet next to the phone is enough.</li>
<li>Listen to your last twenty voicemails and count how many were booking requests. That is your "would have booked" share.</li>
<li>Put both numbers in the calculator, run it once as is and once with the booking share cut in half, and write down both results.</li>
</ul>
<p>If you want to hear what answering those calls sounds like, call our demo line at (469) 517-2968. It answers in English, Spanish and Chinese, 24/7, with no signup. Ask it for a price, book a time, then change the time.</p>
`,
    faq: [
      ['How much do missed calls cost a small business?', 'It depends on five numbers: calls per day, the share you miss, business days per week, the share of missed callers who would have booked, and your average ticket. Multiply them, using 4.33 weeks per month. A business with few calls and a low ticket can get a very small number, and that is a valid answer.'],
      ['How do I find out how many calls I miss?', 'Your phone system or carrier portal usually shows missed calls and voicemails per day. If it does not, count for one normal week: calls that went to voicemail, rang out, or came in after hours, then divide by total calls.'],
      ['What share of missed callers would have booked?', 'Nobody can give you that number for your business, and a vendor who does is guessing. Listen to your last twenty voicemails and count the booking requests. Then run the math again with half that share to see a conservative result.'],
      ['Does an AI receptionist recover every missed call?', 'No. It answers from information the business approved, books on plans that include booking, and hands off to a person when it is unsure. Some callers still hang up, and on a plan without booking your team has to call people back.'],
      ['Is the missed call calculator free?', 'Yes. It runs in your browser, stores nothing, and needs no signup. A "copy a link" button puts your inputs in the page address so you can share them.'],
    ],
    pillar: ['AI receptionist for appointment businesses', '/ai-receptionist/'],
    related: [['Missed call calculator', '/tools/missed-call-calculator/'], ['Pricing', '/pricing/'], ['Scenarios by industry', '/industries/'], ['Integrations', '/integrations/']],
    sources: [],
  },
  zh: {
    keyword: '漏接电话损失',
    title: '漏接电话损失多少？三组例子算给你看 | AI Man Jack',
    description: '美发店、诊所、维修店漏接电话损失多少？给你四行公式和三组示例，用你自己的数就能算；其中一组算下来，根本不值得装 AI 前台。',
    h1: '漏接电话损失多少钱？拿你自己的数算一遍',
    sub: '销售总能报给你一个吓人的数。这篇把我们免费计算器背后的四行公式摊开，拿三家示例店各算一遍，其中一家算出来的实话是：什么都别买。',
    takeaways: [
      '漏接电话的损失就是几步乘法：每天来电 × 没接到的比例 × 每周营业天数，再乘会预约的比例，再乘客单价。',
      '一个月按 4.33 周算（52 ÷ 12），每周漏接数乘 4.33 就是每月漏接数。',
      '对结果影响最大的是「漏接的人里本来会预约的比例」，往保守了填，再拿更低的数试一次。',
      '预约大多走 app、电话很少响的店，算出来的数会很小，这就是对的结果。',
      '公式没算会再打一次的人（真实损失更小），也没算接回来的客人以后再来的钱（真实损失更大）。',
    ],
    sections: `
<h2>什么算漏接</h2>
<p>有人打电话想办事，结果没找到人，这就算漏接。基本就四种：进了语音信箱、占线、下班后打来、电话响的时候前台唯一的人正在招呼客人。</p>
<p>最后一种老板最容易忘。发型师手上正给客人上色，牙医助理在椅子边忙，师傅躺在车底下，电话响了，没人腾得出手。这些电话不算「下班后」，可一样是漏接。</p>
<p>所以算漏接电话损失之前，先把这四种都数进去。我们的<a href="/zh/tools/missed-call-calculator/">漏接电话计算器</a>把它们合成一个数来问：没接到的比例。</p>

<h2>漏接电话损失怎么算：四行公式</h2>
<p>一共四行，没有任何秘密，拿张纸就能算。</p>
<ol>
<li><strong>每周漏接</strong> = 每个营业日来电数 × 没接到的比例 × 每周营业天数。</li>
<li><strong>每月漏接</strong> = 每周漏接 × 4.33，因为 52 周 ÷ 12 个月就是 4.33。</li>
<li><strong>每月丢掉的预约</strong> = 每月漏接 × 漏接的人里本来会预约的比例。</li>
<li><strong>每月损失</strong> = 丢掉的预约 × 一次预约的平均价值（不扣成本）。再乘 12 就是一年。</li>
</ol>
<p>计算器还多算了一行：每个月接回来几单预约，就够付<a href="/zh/pricing/">价格页</a>上 Starter 方案的月费。算法是月费除以客单价，向上取整。一次性安装费没算在这一行里。</p>

<h2>三组示例，算给你看</h2>
<p>下面的数字是编出来演示公式的，不是客户数据，也不是行业平均。真正有用的只有你自己店里的数。</p>
<table>
<thead><tr><th>示例输入</th><th>A：生意忙的预约店</th><th>B：小维修店</th><th>C：靠 app 预约的工作室</th></tr></thead>
<tbody>
<tr><td>每个营业日来电</td><td>20</td><td>10</td><td>4</td></tr>
<tr><td>没接到的比例</td><td>四个里一个</td><td>十个里一个</td><td>十个里一个</td></tr>
<tr><td>漏接的人里会预约的比例</td><td>十个里三个</td><td>五个里一个</td><td>五个里一个</td></tr>
<tr><td>客单价</td><td>$150</td><td>$80</td><td>$40</td></tr>
<tr><td>每周营业天数</td><td>5</td><td>6</td><td>5</td></tr>
<tr><td><strong>每月漏接</strong></td><td>108</td><td>26</td><td>9</td></tr>
<tr><td><strong>每月丢掉的预约</strong></td><td>32</td><td>5</td><td>2</td></tr>
<tr><td><strong>每月损失</strong></td><td>$4,871</td><td>$416</td><td>$69</td></tr>
<tr><td><strong>每年损失</strong></td><td>$58,455</td><td>$4,988</td><td>$831</td></tr>
</tbody>
</table>
<p><strong>A 店</strong>是销售最爱拿出来讲的那种。每个月接回两单，就够付 Starter 的月费。<strong>B 店</strong>的数小得多，每月要接回三单才够付同样的月费。这就难说了，要看那丢掉的五单里，不管请人还是装 AI，到底能救回几单。</p>
<p><strong>C 店</strong>才是说实话的那个。按这组数，方案的钱比漏接的损失还多。计算器会直接这么告诉你，因为 AI 前台本来就不是每家店都需要。</p>

<h2>一周内拿到你自己的数</h2>
<ol>
<li><strong>从电话系统里调漏接记录。</strong>多数运营商后台能看到每天的漏接和语音留言。看不到的话，挑平常的一周自己记：进语音信箱的、响到没人接的、下班后打来的。</li>
<li><strong>按平常的一天算，别按最忙的那天。</strong>周六高峰会让数字比整个月的实际情况吓人得多。一周的来电除以开门的天数就行。</li>
<li><strong>把语音留言听一遍。</strong>最近二十条里，有几条是想约时间、改时间或者问价格的？这个比例拿来填「会预约的比例」，比销售告诉你的任何数都靠谱。</li>
<li><strong>客单价按不扣成本的算，但要算得严一点。</strong>新客第一次来的钱可能比老客少。打电话来的大多是新客，就用新客第一单的数。</li>
<li><strong>算两遍。</strong>把你的数填进<a href="/zh/tools/missed-call-calculator/">计算器</a>，然后把「会预约的比例」砍一半再算一次。低的那个数你看了还心疼，那这个问题就是真的。</li>
</ol>

<h2>什么时候这笔账不灵</h2>
<p>客人会再打一次的时候，这笔账算多了。想约个时间的客人，没打通，可能过一个钟头就再打过来。公式把这个人算成丢了。你的客人要是熟客居多，真实损失比计算器算的小。</p>
<p>接回来的客人会一直来的时候，这笔账算少了。一个新客在美发店约了一次，之后会一直回来剪，值的远不止一单的钱。公式只算了第一次。</p>
<p>预约压根不从电话开始的店，这笔账就不适用。大部分预约走 app 或网站的话，算出来很小就是对的结果，钱花在别处更值。</p>
<p>还有一点：接起电话不等于约成了。我们的 Starter 方案里，AI 回答你确认过的问题、留言、转接，但不做预约，还得你的人回电话。预约、改期、取消在 Growth 和 Pro 方案里。另外有些电话本来就不该让 AI 处理：<a href="/zh/ai-receptionist/">AI 前台</a>不给医疗或法律建议，这类来电会走店里配置好的兜底流程（留言、转接到一个事先留的号码，或把来电信息短信发给老板）。</p>

<h2>算出来之后怎么办</h2>
<p>数字小，就先做便宜的事。把语音留言的问候改成告诉客人怎么在网上约。午饭高峰把电话转到手机上。每条语音留言当天回拨。</p>
<p>数字大，就拿它跟接这些电话的成本比一比：多请一个前台、找人工接听服务，或者装 AI 前台。我们各个方案的月费、安装费和超出分钟的价格都在<a href="/zh/pricing/">价格页</a>上；美发、诊所、医美、上门服务和维修店的具体场景，在<a href="/zh/industries/">行业页</a>上。</p>

<h2>接下来 14 天能做的</h2>
<ul>
<li>挑平常的一周，把每个漏接都记下来，包括你正在招呼客人时响的那些。电话旁边放张纸，来一个划一道就够了。</li>
<li>听最近二十条语音留言，数一数有几条是想预约的。这就是你「会预约的比例」。</li>
<li>把两个数填进计算器，原样算一次，预约比例砍一半再算一次，两个结果都写下来。</li>
</ul>
<p>想听听这些电话被接起来是什么样，打我们的演示线 (469) 517-2968。英语、西班牙语、中文都能接，24 小时在线，不用注册。问个价格，约个时间，再改一次。</p>
`,
    faq: [
      ['小生意漏接电话一个月损失多少？', '看五个数：每天来电、没接到的比例、每周营业天数、漏接的人里会预约的比例、客单价。把它们乘起来，一个月按 4.33 周算。来电少、客单价低的店，算出来可能很小，这也是有效的答案。'],
      ['怎么知道自己漏接了多少电话？', '电话系统或运营商后台一般能看到每天的漏接和语音留言。看不到的话，挑平常的一周数一下：进语音信箱的、响到没人接的、下班后打来的，再除以总来电数。'],
      ['漏接的人里有多少本来会预约？', '这个比例没人能替你的店给出来，给你数的销售也是在猜。把最近二十条语音留言听一遍，数数有几条是想预约的。再按一半的比例算一次，看看保守的结果。'],
      ['装了 AI 前台，漏接的电话都能接回来吗？', '不能。它按店里确认过的信息回答，在含预约的方案里直接约时间，拿不准就转给人。还是会有人挂电话；方案里不含预约的话，还得你的人回电话。'],
      ['漏接电话计算器收费吗？', '免费。算法在你的浏览器里跑，不存任何数据，也不用注册。「复制链接」按钮会把你填的数放进网址里，方便转给别人。'],
    ],
    pillar: ['给预约制生意的 AI 前台', '/ai-receptionist/'],
    related: [['漏接电话计算器', '/tools/missed-call-calculator/'], ['价格', '/pricing/'], ['各行业场景', '/industries/'], ['对接', '/integrations/']],
    sources: [],
  },
};
