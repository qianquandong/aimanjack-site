import { SITE } from '../config.mjs';
import { L } from '../layout.mjs';
import { eyebrow, pageHero, breadcrumb, transcript, industryCards, faq, faqJsonLd, finalCta, INDUSTRIES, SERVICE_LD, BUSINESS_REF, T } from '../components.mjs';

const index = {
  en: { title: 'AI Receptionist by Industry: Salons, Med Spas, Clinics | AI Man Jack', description: 'How the AI receptionist handles calls for salons, med spas, clinics, home-service and repair businesses in Dallas–Fort Worth: real call scenarios, example transcripts and what each business needs to set up.',
    crumb: 'Use cases', h1: 'Built for businesses that run on appointments.', sub: 'Each page below shows the calls that industry actually gets, how the AI handles them, and what it needs from you. No two are the same.' },
  zh: { title: '按行业看 AI 前台：美发、医美、诊所 | AI Man Jack', description: 'AI 前台怎么接达拉斯—沃斯堡美发美容、医美 spa、诊所、上门服务和维修商家的电话：真实来电场景、示例对话，以及各行业需要准备什么。',
    crumb: '适用行业', h1: '为靠预约吃饭的生意而做。', sub: '下面每一页都写这个行业真实会接到的电话、AI 怎么处理、需要你准备什么。没有两页是一样的。' },
};

// Each vertical: differentiated scenarios, transcript, needs, FAQ (PRD §12 decision).
const V = {
  salons: {
    en: { title: 'AI Receptionist for Salons and Barbershops in DFW | AI Man Jack', description: 'An AI receptionist for hair, nail and lash salons and barbershops in Dallas–Fort Worth: quotes approved prices, books with the right stylist, handles reschedules, and hands off when it should.',
      h1: 'The phone rings while your hands are in someone’s hair.', sub: 'The AI answers, quotes only the prices you approved, books with the right stylist, and takes a message for anything else.',
      scen: [['Price check', 'How much is a balayage?', 'Quotes the approved starting price and the usual duration, then offers to check times. It does not haggle or estimate.'], ['Book with a specific stylist', 'Can I get Maria on Saturday?', 'On Growth and Pro, checks Maria’s open slots inside her hours, offers two, confirms one, records name and phone.'], ['Running late or rescheduling', 'I’m 15 minutes late, can I still come?', 'States your late policy as you wrote it, offers the next slot if needed, and texts you the change.']],
      lines: [['c', '“Can I get a balayage Saturday with Maria?”'], ['a', '“Maria has 10:00 and 1:30 on Saturday. Balayage takes about three hours and starts at $180. Which time works?”'], ['c', '“1:30.”'], ['a', '“Done. Saturday at 1:30 with Maria. Can I get your name and a phone number for the confirmation?”']],
      result: 'Booked · Saturday · 1:30 PM · Maria',
      needs: ['Service menu with durations and starting prices you will quote', 'Stylists or barbers, and which services each one takes', 'Deposit, late and no-show policy in your words', 'Walk-in policy and the hours the AI may book', 'Which questions go to a message instead of an answer', 'Fallback: message, transfer, or a text to you'],
      faq: [['Can it book with a specific stylist?', 'Yes on Growth and Pro, inside the hours and services you set for that stylist. Starter answers questions and takes messages but does not book.'], ['Will it quote prices?', 'Only the starting prices you approved. For anything that depends on hair length or condition, it says so and offers a consultation slot.'], ['Does it take deposits?', 'No payments are taken on the call. It states your deposit policy and you collect the deposit the way you do today.'], ['What about walk-ins?', 'It states your walk-in policy and offers the next open slot if you allow it.']],
    },
    zh: { title: 'DFW 美发店和理发店的 AI 前台 | AI Man Jack', description: '面向达拉斯—沃斯堡美发、美甲、美睫店和理发店的 AI 前台：只报确认过的价格、约到对的发型师、处理改期，该交接的时候交接。',
      h1: '你手还在客人头发上，电话响了。', sub: 'AI 接起来，只报你确认过的价格，约到对的发型师，其他的留言给你。',
      scen: [['问价', '染个 balayage 多少钱？', '报确认过的起步价和大致时长，再问要不要看时间。不还价，不估价。'], ['指定发型师', '周六能约 Maria 吗？', 'Growth 和 Pro 方案里，查 Maria 工作时间内的空位，给两个，确认一个，记下姓名和电话。'], ['迟到或改期', '我要晚 15 分钟，还能来吗？', '按你写的原话说明迟到规定，需要的话给下一个时段，并把变动短信发给你。']],
      lines: [['c', '周六能约 Maria 做 balayage 吗？'], ['a', 'Maria 周六有 10:00 和 1:30。balayage 大约三小时，$180 起。哪个时间方便？'], ['c', '1:30。'], ['a', '好的，周六 1:30，Maria。方便留个姓名和电话发确认吗？']],
      result: '已预约 · 周六 · 1:30 PM · Maria',
      needs: ['服务菜单，含时长和你愿意报的起步价', '发型师或理发师名单，各自做哪些项目', '用你的话写的定金、迟到和爽约规定', 'Walk-in 规定，以及 AI 可以约的时间段', '哪些问题只留言、不回答', '兜底方式：留言、转接或短信通知你'],
      faq: [['能指定发型师预约吗？', 'Growth 和 Pro 方案可以，在你为该发型师设定的时间和项目范围内。Starter 只回答问题和留言，不预约。'], ['它会报价吗？', '只报你确认过的起步价。看发长和发质才能定的，它会说明，并给一个咨询时段。'], ['收定金吗？', '通话里不收钱。它说明你的定金规定，定金还是你现在的方式收。'], ['Walk-in 怎么办？', '说明你的 walk-in 规定；你允许的话，给下一个空位。']],
    },
  },
  'med-spas': {
    en: { title: 'AI Receptionist for Med Spas in Dallas–Fort Worth | AI Man Jack', description: 'An AI receptionist for med spas in DFW: books consultations, shares only approved treatment information, never gives medical advice, and routes sensitive questions to your staff.',
      h1: 'Consultations booked. Medical questions handed to a person.', sub: 'The AI answers what you approved about treatments, pricing and prep, books the consultation, and sends everything clinical to your staff.',
      scen: [['Treatment pricing', 'How much is Botox?', 'Gives the approved per-unit or starting price, says a consultation sets the final plan, and offers a consultation time.'], ['Book a consultation', 'I want to ask about laser for my face.', 'On Growth and Pro, books a consultation with the provider you assigned, and reads back any intake steps you wrote.'], ['Clinical question', 'Is this safe while I’m pregnant?', 'Does not answer. Says the provider needs to answer that, offers a callback or transfer, and texts your staff the question.']],
      lines: [['c', '“Do you do lip filler, and what does it cost?”'], ['a', '“We do. Lip filler starts at $550 per syringe, and the provider confirms the plan at a consultation. Would you like to book one?”'], ['c', '“Thursday after work.”'], ['a', '“Thursday I have 5:30 and 6:15 with Dr. Lee. Which one?”'], ['c', '“5:30.”']],
      result: 'Consultation booked · Thursday · 5:30 PM',
      needs: ['Treatment list with the pricing you are willing to state', 'Which treatments require a consultation first', 'Providers, their schedules and what each one performs', 'Intake steps or forms the caller must complete', 'The line between an approved answer and a clinical question', 'Fallback for clinical questions: transfer or callback'],
      faq: [['Will it answer medical questions?', 'No. It shares only the treatment information you approved. Anything about suitability, side effects or medications goes to your provider through the fallback you choose.'], ['Is this HIPAA compliant?', 'We make no compliance certification claim. Sensitive or regulated workflows are discussed before setup so you can decide what the AI may handle.'], ['Can it book consultations?', 'Yes on Growth and Pro, with the provider and duration rules you set.'], ['Can it explain pricing?', 'Only the pricing you approved, with the note that a consultation confirms the plan.']],
      callout: 'Sensitive workflows are discussed before setup. No compliance certification is claimed.',
    },
    zh: { title: '达拉斯—沃斯堡医美 spa 的 AI 前台 | AI Man Jack', description: '面向 DFW 医美 spa 的 AI 前台：预约咨询、只说确认过的项目信息、不给医疗建议，敏感问题转给你的员工。',
      h1: '咨询约好了。医疗问题交给人。', sub: 'AI 回答你确认过的项目、价格和准备事项，约好咨询，临床问题全部交给你的员工。',
      scen: [['项目价格', 'Botox 多少钱？', '报确认过的按单位或起步价，说明最终方案由咨询确定，再给一个咨询时段。'], ['预约咨询', '我想问问面部激光。', 'Growth 和 Pro 方案里，约到你指定的医生，并复述你写的登记步骤。'], ['临床问题', '怀孕期间做这个安全吗？', '不回答。说明需要医生来答，给回电或转接，并把问题短信发给你的员工。']],
      lines: [['c', '你们做唇部填充吗？多少钱？'], ['a', '做。唇部填充每支 $550 起，具体方案由医生在咨询时确认。要约个咨询吗？'], ['c', '周四下班以后。'], ['a', '周四 Dr. Lee 有 5:30 和 6:15。哪个？'], ['c', '5:30。']],
      result: '咨询已预约 · 周四 · 5:30 PM',
      needs: ['项目清单，以及你愿意说的价格', '哪些项目必须先咨询', '医生名单、排班，各自做哪些项目', '来电者需要完成的登记步骤或表格', '确认过的回答和临床问题之间的界线', '临床问题的兜底：转接或回电'],
      faq: [['它会回答医疗问题吗？', '不会。它只说你确认过的项目信息。关于适不适合、副作用或用药的问题，通过你选的兜底方式交给医生。'], ['符合 HIPAA 吗？', '我们不做合规认证的声明。涉及敏感或受监管的流程，安装前先聊清楚，由你决定 AI 可以处理什么。'], ['能预约咨询吗？', 'Growth 和 Pro 方案可以，按你设定的医生和时长规则。'], ['能解释价格吗？', '只说你确认过的价格，并注明最终方案由咨询确认。']],
      callout: '敏感流程安装前先聊。不做任何合规认证的声明。',
    },
  },
  clinics: {
    en: { title: 'AI Receptionist for Dental, Chiropractic and PT Clinics | AI Man Jack', description: 'An AI receptionist for dental, chiropractic, physical therapy and acupuncture clinics in DFW: new-patient scheduling, approved insurance answers, reschedules, and an emergency protocol you define.',
      h1: 'New patients booked. Emergencies routed the way you decide.', sub: 'The AI schedules new and existing patients, answers from your approved insurance list, and follows your protocol for anything urgent.',
      scen: [['New patient', 'Are you taking new patients, and do you take Aetna?', 'Confirms from your approved insurance list, explains the new-patient visit length, and books it on Growth and Pro.'], ['Reschedule', 'I need to move my Tuesday adjustment.', 'Finds the existing time by name and phone, offers alternatives inside the provider’s hours, and confirms the change.'], ['Pain or urgent', 'My tooth broke and it really hurts.', 'Follows your emergency protocol: transfer to staff during hours, or read the after-hours instruction you wrote.']],
      lines: [['c', '“I’m a new patient. Do you take Delta Dental?”'], ['a', '“Yes, Delta Dental is accepted. A new-patient visit is about an hour. I have Wednesday at 9:00 or Friday at 2:00.”'], ['c', '“Friday.”'], ['a', '“Friday at 2:00. Please arrive ten minutes early for forms. Can I get your name and date of birth for the chart?”']],
      result: 'New patient booked · Friday · 2:00 PM',
      needs: ['Accepted insurance list, exactly as you want it stated', 'Appointment types and durations: new patient, follow-up, adjustment', 'Provider schedules and which visits each provider takes', 'Emergency protocol: transfer number and after-hours instruction', 'What patient details the AI may collect on the call', 'Questions that must go to staff'],
      faq: [['Will it answer insurance questions?', 'Only from the list you approved, and it does not verify coverage. It can note the plan and tell the patient your front desk confirms benefits.'], ['What about emergencies?', 'It follows the protocol you write: transfer to staff during hours, and after hours it reads your instruction, which may include directing the caller to emergency services.'], ['Is this HIPAA compliant?', 'We make no compliance certification claim. Which patient details the AI may collect is decided with you before setup.'], ['Can patients reschedule?', 'Yes on Growth and Pro, following the provider’s hours and your notice rules.']],
      callout: 'Sensitive workflows are discussed before setup. No compliance certification is claimed.',
    },
    zh: { title: '牙科、脊椎和物理治疗诊所的 AI 前台 | AI Man Jack', description: '面向 DFW 牙科、脊椎、物理治疗和针灸诊所的 AI 前台：新患者排期、按确认过的保险清单回答、改期，以及由你定的急诊处理规则。',
      h1: '新患者约好了。急诊按你定的规则转。', sub: 'AI 给新老患者排期，按你确认过的保险清单回答，紧急情况按你的规则处理。',
      scen: [['新患者', '你们接新患者吗？收 Aetna 吗？', '按你确认过的保险清单回答，说明新患者初诊时长，Growth 和 Pro 方案里直接约上。'], ['改期', '我周二的调整要挪一下。', '按姓名和电话找到原预约，在医生时间内给出备选，确认变动。'], ['疼痛或紧急', '我牙崩了，特别疼。', '按你的急诊规则走：营业时间内转给员工，下班后读你写的说明。']],
      lines: [['c', '我是新患者，你们收 Delta Dental 吗？'], ['a', '收，Delta Dental 可以用。新患者初诊大约一小时。周三 9:00 或周五 2:00 有空。'], ['c', '周五。'], ['a', '周五 2:00。请提前十分钟到填表。方便留个姓名和出生日期建档吗？']],
      result: '新患者已预约 · 周五 · 2:00 PM',
      needs: ['接受的保险清单，按你想要的说法写', '预约类型和时长：新患者、复诊、调整', '医生排班，各自接哪类就诊', '急诊规则：转接号码和下班后的说明', 'AI 在电话里可以收集哪些患者信息', '必须交给员工的问题'],
      faq: [['它会回答保险问题吗？', '只按你确认过的清单答，不核保。它可以记下保险计划，并告诉患者由前台确认福利。'], ['急诊怎么办？', '按你写的规则走：营业时间内转给员工，下班后读你的说明，说明里可以包括让来电者联系急救。'], ['符合 HIPAA 吗？', '我们不做合规认证的声明。AI 可以收集哪些患者信息，安装前和你一起定。'], ['患者能改期吗？', 'Growth 和 Pro 方案可以，按医生时间和你的通知规则。']],
      callout: '敏感流程安装前先聊。不做任何合规认证的声明。',
    },
  },
  'home-services': {
    en: { title: 'AI Receptionist for Home Services in DFW: HVAC, Plumbing, Cleaning | AI Man Jack', description: 'An AI receptionist for HVAC, plumbing, cleaning and lawn businesses in Dallas–Fort Worth: confirms your service area, captures the job details, books arrival windows, and flags urgent calls.',
      h1: 'You’re under a house. The AI books the next one.', sub: 'It checks the service area, captures what is broken and where, books an arrival window you defined, and pushes urgent calls to you.',
      scen: [['Service area', 'Do you come out to Frisco?', 'Checks the zip or city against your list, then asks what the job is.'], ['Estimate or repair visit', 'My AC is blowing warm air.', 'Captures address, problem, system type if you ask for it, and books an arrival window. States your trip fee if you approved one.'], ['Urgent', 'Water is coming through the ceiling.', 'Treats it as urgent per your rule: transfer during hours, or text you immediately with the address and callback number.']],
      lines: [['c', '“My AC isn’t cooling. Can someone come today?”'], ['a', '“I can help with that. What’s the address?” … “Thanks. Today’s 2 to 5 window is open, and the diagnostic visit is $89. Should I book it?”'], ['c', '“Yes.”'], ['a', '“Booked for today, 2 to 5. A technician will text before arriving.”']],
      result: 'Visit booked · Today · 2–5 PM window',
      needs: ['Service area by zip code or city', 'Job types you take, and what to ask for each one', 'Arrival windows and how many jobs per window', 'Trip or diagnostic fee you are willing to quote', 'What counts as urgent, and what to do with it', 'Where bookings should land: calendar or dispatch sheet'],
      faq: [['Can it quote a job?', 'Only flat items you approved, such as a trip fee or a diagnostic. Everything else becomes a captured estimate request with the details you asked for.'], ['Does it book arrival windows?', 'Yes on Growth and Pro, using the windows and capacity you define.'], ['What about after-hours emergencies?', 'Your rule decides: text you the details immediately, transfer to an on-call number, or take a message for the morning.'], ['Does it assign technicians?', 'No. It captures the job and books the window; you dispatch.']],
    },
    zh: { title: 'DFW 上门服务的 AI 前台：空调、水管、保洁 | AI Man Jack', description: '面向达拉斯—沃斯堡空调、水管、保洁和草坪商家的 AI 前台：确认服务范围、记下活的细节、约上门时间窗，标出紧急来电。',
      h1: '你还在房子底下，AI 已经约好下一家。', sub: '它查服务范围，记下哪里坏了、在哪儿，约你定好的上门时间窗，紧急来电马上推给你。',
      scen: [['服务范围', '你们去 Frisco 吗？', '按你的清单核对邮编或城市，再问是什么活。'], ['估价或维修上门', '我的空调吹的是热风。', '记下地址、问题，需要的话记系统类型，约一个上门时间窗。你确认过的话，报出上门费。'], ['紧急', '天花板在漏水。', '按你的规则当紧急处理：营业时间内转接，或者立刻把地址和回电号码短信发给你。']],
      lines: [['c', '空调不制冷了，今天能来人吗？'], ['a', '可以。地址是？……好的。今天 2 到 5 点这个时间窗有空，上门检查 $89。要约上吗？'], ['c', '约。'], ['a', '约好了，今天 2 到 5 点。技师到之前会先发短信。']],
      result: '上门已预约 · 今天 · 2–5 PM',
      needs: ['按邮编或城市划的服务范围', '你接的活的类型，每种要问什么', '上门时间窗，每个窗口接几单', '你愿意报的上门费或检查费', '什么算紧急，紧急了怎么办', '预约落到哪里：日历还是派工表'],
      faq: [['它能报价吗？', '只报你确认过的固定项目，比如上门费或检查费。其他都变成一条估价请求，附上你要的细节。'], ['能约上门时间窗吗？', 'Growth 和 Pro 方案可以，用你定的时间窗和容量。'], ['下班后的紧急情况呢？', '按你的规则：立刻把信息短信发给你、转到值班号码，或者留言等早上处理。'], ['它会派技师吗？', '不会。它记下活、约好时间窗，派工由你来。']],
    },
  },
  'repair-services': {
    en: { title: 'AI Receptionist for Repair Shops in DFW: Auto, Phone, Appliance | AI Man Jack', description: 'An AI receptionist for auto, phone, appliance and shoe repair shops in Dallas–Fort Worth: says what you fix, quotes approved ranges, books drop-offs, and takes messages for status checks.',
      h1: 'The bay is loud. The AI still hears the phone.', sub: 'It tells callers what you repair, quotes only the ranges you approved, books drop-off times, and takes a message when someone asks if their item is ready.',
      scen: [['Do you fix this?', 'Do you replace iPhone 15 screens?', 'Answers from your list of what you repair and what you do not, with the approved price range and turnaround.'], ['Drop-off appointment', 'Can I bring my car in Saturday for brakes?', 'On Growth and Pro, books a drop-off slot inside your intake hours and reads back what to bring.'], ['Is it ready yet?', 'Is my washer done?', 'Cannot see your work orders. Takes name and ticket number as a message, or transfers if you prefer.']],
      lines: [['c', '“Do you replace iPhone 15 screens, and how long does it take?”'], ['a', '“Yes. An iPhone 15 screen is $189 to $229 depending on the part, and it usually takes about an hour. Want to book a drop-off?”'], ['c', '“Tomorrow at lunch.”'], ['a', '“Tomorrow I have 12:00 and 12:30 drop-offs. Which one?”'], ['c', '“12.”']],
      result: 'Drop-off booked · Tomorrow · 12:00 PM',
      needs: ['What you repair and what you turn away', 'Price ranges and turnaround you are willing to state', 'Drop-off hours and how many intakes per slot', 'What the customer must bring: keys, charger, receipt', 'Status-check policy: message or transfer', 'Parts and warranty questions you want routed to staff'],
      faq: [['Can it check if my repair is ready?', 'Not unless your shop system is connected, which is not yet tested. It takes the name and ticket as a message, or transfers to you.'], ['Will it quote repairs?', 'Only the ranges you approved. It says the final price is confirmed after inspection.'], ['Does it book appointments or just drop-offs?', 'Whichever you run. Drop-off slots, bay appointments or both, on Growth and Pro.'], ['What about parts questions?', 'Routed to staff through the fallback you choose.']],
    },
    zh: { title: 'DFW 维修店的 AI 前台：汽车、手机、家电 | AI Man Jack', description: '面向达拉斯—沃斯堡汽车、手机、家电和修鞋店的 AI 前台：说清楚你修什么，只报确认过的价格区间，约送修时间，查进度的留言。',
      h1: '车间再吵，AI 也听得见电话。', sub: '它告诉来电者你修什么，只报你确认过的区间，约送修时间；有人问「修好了吗」，就留言。',
      scen: [['你们修这个吗？', '你们换 iPhone 15 屏幕吗？', '按你修什么、不修什么的清单回答，附上确认过的价格区间和周期。'], ['送修预约', '周六能把车送来换刹车吗？', 'Growth 和 Pro 方案里，在你的收件时间内约一个送修时段，并复述要带什么。'], ['修好了吗？', '我的洗衣机好了吗？', '看不到你的工单。记下姓名和单号留言，或者按你的意思转接。']],
      lines: [['c', '你们换 iPhone 15 屏幕吗？要多久？'], ['a', '换。iPhone 15 屏幕 $189 到 $229，看配件，通常一小时左右。要约个送修时间吗？'], ['c', '明天中午。'], ['a', '明天有 12:00 和 12:30 两个送修时段。哪个？'], ['c', '12 点。']],
      result: '送修已预约 · 明天 · 12:00 PM',
      needs: ['你修什么，不修什么', '你愿意说的价格区间和周期', '送修时间和每个时段收几件', '顾客要带的东西：钥匙、充电器、收据', '查进度的规定：留言还是转接', '想交给员工的配件和保修问题'],
      faq: [['它能查我的东西修好没？', '除非接上你的店内系统，而这还没测过。它记下姓名和单号留言，或者转给你。'], ['它会报维修价吗？', '只报你确认过的区间，并说明最终价格检查后确认。'], ['约的是预约还是送修？', '你怎么运营就怎么约。送修时段、工位预约，或者两种都有，Growth 和 Pro 方案里。'], ['配件问题呢？', '通过你选的兜底方式交给员工。']],
    },
  },
};

const vertical = (lang, slug) => {
  const c = V[slug][lang], ind = INDUSTRIES.find((i) => i.slug === slug)[lang], t = T[lang];
  const bc = breadcrumb(lang, [[index[lang].crumb, '/industries/'], [ind.name, `/industries/${slug}/`]]);
  return {
    title: c.title, description: c.description,
    body: `<div class="wrap">${bc.html}</div>${pageHero(lang, { eyebrow: ind.name, h1: c.h1, sub: c.sub })}
<section class="section"><div class="wrap">${eyebrow(lang === 'zh' ? '真实来电场景' : 'Real call scenarios')}<h2>${lang === 'zh' ? '这家店会接到的三种电话' : 'Three calls this business gets'}</h2><div class="scenarios">${c.scen.map(([h, q, p]) => `<div class="card"><h3>${h}</h3><q>${q}</q><p>${p}</p></div>`).join('')}</div>${c.callout ? `<p class="callout">${c.callout}</p>` : ''}</div></section>
<section class="section soft"><div class="wrap split"><div>${eyebrow(lang === 'zh' ? '示例通话' : 'Example call')}<h2>${lang === 'zh' ? '从头到尾' : 'Start to finish'}</h2><p class="lead">${lang === 'zh' ? '价格、人员和时段都来自店主确认过的信息。' : 'Prices, people and slots all come from the owner’s approved sheet.'}</p></div>${transcript(lang, c.lines, c.result)}</div></section>
<section class="section"><div class="wrap"><h2>${lang === 'zh' ? '需要你准备什么' : 'What it needs from you'}</h2><ul class="needs">${c.needs.map((n) => `<li>${n}</li>`).join('')}</ul></div></section>
<section class="section soft"><div class="wrap narrow"><h2>${lang === 'zh' ? '证据' : 'Proof'}</h2><p class="lead">${lang === 'zh' ? '这个行业的试点数据整理中。目前的真实项目见' : 'Pilot results for this industry are coming soon. Current real deployments are on the'} <a href="${L(lang, '/case-studies/')}">${lang === 'zh' ? '案例页' : 'case studies page'}</a>${lang === 'zh' ? '。' : '.'}</p></div></section>
${faq(lang, c.faq)}
<section class="section"><div class="wrap"><h2>${lang === 'zh' ? '其他行业' : 'Other industries'}</h2>${industryCards(lang, { heading: false })}</div></section>
${finalCta(lang)}`,
    jsonld: [SERVICE_LD(lang, { '@id': `${SITE}${lang === 'zh' ? '/zh' : ''}/industries/${slug}/#service`, name: c.title.split(' | ')[0], description: c.description, url: `${SITE}${lang === 'zh' ? '/zh' : ''}/industries/${slug}/` }), BUSINESS_REF, faqJsonLd(c.faq), bc.ld],
  };
};

const indexPage = (lang) => {
  const c = index[lang], bc = breadcrumb(lang, [[c.crumb, '/industries/']]);
  return { title: c.title, description: c.description,
    body: `<div class="wrap">${bc.html}</div>${pageHero(lang, { eyebrow: c.crumb, h1: c.h1, sub: c.sub, ctas: false })}<section class="wrap" style="padding-bottom:64px">${industryCards(lang, { heading: false, hl: 'h2' })}</section>${finalCta(lang)}`,
    jsonld: [BUSINESS_REF, bc.ld] };
};

export const pages = [
  { path: '/industries/', priority: 0.7, en: indexPage('en'), zh: indexPage('zh') },
  ...INDUSTRIES.map((i) => ({ path: `/industries/${i.slug}/`, priority: 0.7, en: vertical('en', i.slug), zh: vertical('zh', i.slug) })),
];
