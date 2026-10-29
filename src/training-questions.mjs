// Buyer questions clarify fit and boundaries; they do not create a new offer or promise capacity.
import { OFFERS, QUOTE_URL } from './config.mjs';
import { L } from './layout.mjs';

export function buyerQuestions(lang, context) {
  const zh = lang === 'zh';
  const link = (path, label) => `<a href="${L(lang, path)}">${label}</a>`;
  const questions = {
    method: zh
      ? ['需要 AI agent，还是普通代码和工作流就够？', `先看任务，不预设一定需要 agent。规则固定、输入结构清楚的任务，可以先考虑表格公式或确定性代码；涉及文字理解、但步骤已知的任务，可以测试 AI 工作流。只有下一步需要根据中间结果调整，而且权限、人工审批和停止条件都能控制时，再评估 agent。我们的${link('/case-studies/livestream-agency-scheduling/', '排班案例')}就使用确定性求解器生成草稿，由人审核和发布。培训会帮助团队判断适合哪种方法；需要我们直接搭好时，属于单独的${link('/ai-workflow-build/', 'AI 工作流搭建')}。`]
      : ['Do we need an AI agent, or would code or a workflow be enough?', `Start with the task, not an agent. Fixed rules and structured inputs may be better served by spreadsheet formulas or deterministic code. Language tasks with known steps may suit an AI workflow. Consider an agent when the next action must adapt to intermediate results and permissions, human approvals and stop conditions can be controlled. Our ${link('/case-studies/livestream-agency-scheduling/', 'scheduling case study')} uses a deterministic solver for the draft and a person for review and publication. Training helps the team choose an approach; having us build it is a separate ${link('/ai-workflow-build/', 'AI workflow build')}.`],
    integration: zh
      ? ['培训会直接连接 CRM 或 ERP，并自动更新正式数据吗？', `不包含。培训可以使用经批准的导出数据或模拟材料，练习整理记录、起草跟进和核对报表；不默认访问正式系统，也不开发、配置或对接 CRM、ERP。实际系统连接和自动写入需要另外的实施范围、权限和测试（可以按${link('/ai-workflow-build/', 'AI 工作流搭建')}单独报价），不能把课堂练习当作已经上线的系统集成。`]
      : ['Will the training connect to our CRM or ERP and update live records?', `No. Training can use approved exports or synthetic examples to practise organising notes, drafting follow-ups and checking reports. It does not include access to live systems or building, configuring or integrating a CRM or ERP. A live connection or automatic write-back requires a separate implementation scope, permissions and testing (we quote that as an ${link('/ai-workflow-build/', 'AI workflow build')}); a classroom exercise is not a production integration.`],
    retreat: zh
      ? ['领导力团队的战略会议或 retreat，怎么安排 AI 培训？', `先提供活动日期、地点、参加者岗位、人数、可用时长，以及希望解决的一到两项业务问题。${OFFERS.workshop.minutes} 分钟工作坊可以作为评估起点；是否适合活动、如何安排练习，都先确认。需要三小时或其他时长时，请${link(QUOTE_URL, '申请定制范围与报价')}；时长、内容、档期与费用在确认需求后另行商定。`]
      : ['How should we plan AI training for a leadership or strategy retreat?', `Share the event date, location, attendee roles, headcount, available time and one or two business problems. The ${OFFERS.workshop.minutes}-minute workshop is a starting point to assess, not a promise that it fits every retreat. For three hours or another duration, ${link(QUOTE_URL, 'request a scoped agenda and quote')}; availability, exercises and price are agreed before booking rather than treated as a fixed retreat package.`],
    group: zh
      ? ['约 40 人或多个部门参加，实操怎么安排？', `先区分公司总人数和实际参训人数，并按岗位收集任务、工具权限与基础水平。可讨论共同讲解后按相似任务分组，或拆成多场；分组人数、练习时间和反馈方式都需要课前确认，人数较多时可能需要分场进行，具体辅导范围在书面方案中说明。${link(QUOTE_URL, '申请报价时')}请提供各部门人数、希望练习的任务、设备条件和可用时长。`]
      : ['How would hands-on training work for around 40 people or multiple departments?', `First separate company headcount from the number attending, then collect tasks, tool access and experience levels by role. Discuss a shared introduction followed by groups working on similar tasks, or separate sessions. Group sizes, practice time and feedback arrangements must be agreed in advance; a larger group may need separate sessions rather than individual coaching in a single session. In the ${link(QUOTE_URL, 'quote request')}, include department headcounts, practice tasks, equipment and available time.`],
  };
  const selected = { program: ['method', 'integration'], workshop: ['retreat', 'method'], onsite: ['group', 'method'] }[context];
  if (!selected) throw new Error(`Unknown training question context: ${context}`);
  return selected.map((key) => questions[key]);
}
