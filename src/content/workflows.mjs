// AI workflow library. One object → one page at /workflows/<slug>/ (template: src/pages/workflows.mjs).
//
// @typedef {Object} Workflow
// @property {string} slug            URL segment; never change after publish
// @property {string} title           H1 and card title
// @property {string} description     card text + meta description (120–160 chars)
// @property {'sales'|'marketing'|'operations'|'leadership'} department   parent use-case category
// @property {string} group           sub-heading on the use-case page
// @property {string[]} tools
// @property {'beginner'|'intermediate'} difficulty
// @property {string} outcome         answer-first sentence under the H1
// @property {string[]} before        how the task is usually done today
// @property {[string,string][]} steps  AI-assisted workflow: [step title, what to do]
// @property {string} prompt          the core instruction (short; the full reusable version lives in `template`)
// @property {string} example         illustrative output — fictional names, clearly labelled on the page
// @property {string[]} humanReview   checklist before the output is used
// @property {string[]} notFor        when not to use this workflow
// @property {string[]} related       other workflow slugs
// @property {string} [template]      template slug with the full prompt
// @property {string} [seoTitle]
//
// Rules: no time-saved numbers (none measured), no client names, no outcome claims. Examples use fictional companies.
export const WORKFLOWS = [
  {
    slug: 'prospect-research', title: 'Prospect Research with AI', department: 'sales', group: 'Lead generation',
    description: 'Turn a company website, a LinkedIn profile and your CRM notes into a one-page prospect brief before outreach. Steps, prompt, example and review checklist.',
    tools: ['ChatGPT', 'Claude', 'Copilot'], difficulty: 'beginner',
    outcome: 'Prospect research with AI means handing the model a fixed set of public sources about one account and getting back a one-page brief — what they do, what changed recently, who you are writing to, and one reason to contact them now — that a rep can verify in five minutes.',
    before: ['Open the company site, LinkedIn, a news search and the CRM in separate tabs.', 'Skim each, copy fragments into a note.', 'Write the outreach from memory of what you skimmed; most of the research never reaches the email.'],
    steps: [
      ['Collect the sources, not the conclusions', 'Paste the text of the About page, the product or services page, the contact’s LinkedIn headline and summary, and your CRM history for the account. If your tool can browse, give it the URLs and tell it to use only those.'],
      ['Ask for a brief in a fixed format', 'Five headings, every time: what they sell and to whom, what changed in the last 12 months, the contact’s role and likely priorities, one specific reason to reach out now, and what is unknown.'],
      ['Make it show its sources', 'Require a source after every claim: which pasted document, or which URL. A claim with no source gets deleted, not trusted.'],
      ['Verify the two facts you will quote', 'Pick the two facts you plan to mention in the email and check them yourself. Everything else in the brief is background.'],
      ['Save the brief to the account', 'Paste it into the CRM note so the next person does not redo it.'],
    ],
    prompt: `You are preparing a sales rep for first contact with one account.
Use ONLY the sources pasted below. If something is not in the sources, write "unknown".

Produce a one-page brief with these headings:
1. What they sell, and to whom (2 sentences)
2. What changed in the last 12 months (bullets, each with its source)
3. The contact: role, likely priorities, what they probably get measured on
4. One specific reason to reach out now (must cite a source)
5. Unknowns I should ask about

SOURCES:
[paste website text, LinkedIn summary, CRM notes]`,
    example: `What they sell: Northwind Logistics runs regional LTL freight for mid-size manufacturers across Texas and Oklahoma. (source: About page)
What changed: Opened a Fort Worth cross-dock in March (source: News page). Hiring three dispatch coordinators (source: Careers page).
The contact: Dana Reyes, Director of Operations. Likely measured on on-time delivery and cost per shipment.
Reason to reach out now: New facility plus open dispatch roles suggests the scheduling workload just grew. (source: News + Careers)
Unknowns: Which TMS they run. Whether dispatch is centralised.`,
    humanReview: ['Every claim has a source you can open.', 'The two facts you will quote were checked by you, today.', 'Nothing about the contact is inferred from personal social media.', 'The "reason to reach out" would make sense to the prospect, not only to you.'],
    notFor: ['Accounts where the only source is the model’s own memory — it will invent a plausible company.', 'Regulated outreach where every statement needs compliance review first.', 'Personal details. Research the company and the role, not the person’s private life.'],
    related: ['sales-meeting-preparation', 'sales-follow-up', 'competitive-research'], template: 'prospect-research',
  },
  {
    slug: 'sales-meeting-preparation', title: 'Sales Meeting Preparation with AI', department: 'sales', group: 'Meeting preparation',
    description: 'Prepare a customer meeting in ten minutes: account brief, likely objections, five questions and an agenda, built from your own notes. Prompt and checklist included.',
    tools: ['ChatGPT', 'Claude', 'Copilot'], difficulty: 'beginner',
    outcome: 'AI meeting preparation turns your last call notes, the open opportunity and the prospect brief into four things you can carry into the room: where the deal stands, what they will push back on, five questions worth asking, and an agenda.',
    before: ['Re-read the last email thread ten minutes before the call.', 'Try to remember what was promised.', 'Improvise the agenda.'],
    steps: [
      ['Gather what you already have', 'Last call notes, the email thread, the opportunity stage and amount, and the prospect brief if one exists.'],
      ['Ask for the state of the deal first', 'Three lines: what they want, what is blocking, what you owe them. If the model cannot answer from your notes, your notes are the problem — fix those.'],
      ['Generate objections with evidence', 'Ask for the three most likely objections and, for each, the sentence in your notes that suggests it. Objections with no evidence are generic; drop them.'],
      ['Draft five questions', 'Questions that move the deal: decision process, timeline, who else is involved, what happens if they do nothing, what a good first 90 days looks like.'],
      ['Turn it into an agenda', 'Three items, with minutes. Send it to the customer before the meeting.'],
    ],
    prompt: `From the notes below, prepare me for a customer meeting.

1. State of the deal in 3 lines: what they want / what is blocking / what I owe them
2. Three likely objections. For each, quote the line from my notes that suggests it.
3. Five questions that would move this deal forward
4. A 3-item agenda with minutes, written so I can send it to the customer

If my notes do not support an answer, say so instead of guessing.

NOTES:
[paste call notes, email thread, opportunity details]`,
    example: `State of the deal: They want route planning live before peak season. Blocked on IT security review. I owe them the SOC 2 report and two references.
Objection 1: "We tried a tool like this in 2024." — notes: "Dana mentioned the last rollout stalled at dispatch."
Question 3: "If the security review slips two weeks, does peak season still work?"
Agenda: 1) Security review status (10 min) 2) Pilot scope: one depot or two (15 min) 3) Next steps and owners (5 min)`,
    humanReview: ['What you "owe them" matches what you actually promised.', 'Each objection points at a real line in your notes.', 'The agenda is one the customer would agree to, not a pitch schedule.', 'No confidential pricing or other customers’ names went into the tool.'],
    notFor: ['First meetings with no history — use prospect research instead.', 'Notes that contain information the customer shared under NDA, unless your AI tool is approved for it.'],
    related: ['prospect-research', 'sales-follow-up', 'meeting-notes-to-action-items'], template: 'sales-meeting-prep',
  },
  {
    slug: 'sales-follow-up', title: 'Sales Follow-Up Emails with AI', department: 'sales', group: 'Sales execution',
    description: 'Draft the follow-up email from your call notes while the meeting is still fresh: decisions, owners, dates and the next step, in your own voice. Prompt and review checklist.',
    tools: ['ChatGPT', 'Claude', 'Copilot'], difficulty: 'beginner',
    outcome: 'An AI-assisted follow-up is a first draft written from your call notes within minutes of the meeting: what was decided, who owes what by when, and one clear next step — edited by you before it is sent.',
    before: ['Mean to write the follow-up right after the call.', 'Write it the next morning from memory.', 'Forget one of the three things you promised.'],
    steps: [
      ['Capture notes in a fixed shape', 'During or right after the call: decisions, open questions, promises (yours and theirs), dates. Bullet fragments are enough.'],
      ['Give the model two of your past emails', 'So the draft sounds like you. Two is enough; remove customer names first.'],
      ['Ask for a short email, not a summary', 'Under 150 words: thanks in one line, decisions, who owes what by when, the single next step with a date.'],
      ['Check the promises', 'Read only the commitments and dates against your notes. This is where a wrong draft costs you.'],
      ['Send, then log', 'Paste the sent version into the CRM activity.'],
    ],
    prompt: `Write a follow-up email from the call notes below.

Rules:
- Under 150 words. No "I hope this finds you well."
- Structure: one line of thanks → what we decided → who owes what by when → one next step with a date
- Match the tone of my two sample emails
- Do not add any commitment that is not in my notes

MY SAMPLE EMAILS:
[paste two]

CALL NOTES:
[paste]`,
    example: `Dana — thanks for the time today.

We agreed to pilot at the Fort Worth depot only, starting with outbound routes.
From me: SOC 2 report and two references by Thursday.
From you: a contact in IT security for the review.

Can we hold 30 minutes on the 14th to confirm pilot dates?`,
    humanReview: ['Every commitment and date appears in your notes.', 'Nothing was promised on someone else’s behalf.', 'Names and titles are spelled correctly.', 'It reads like you wrote it.'],
    notFor: ['Emails that carry pricing, legal terms or contract language — write those yourself.', 'Sensitive conversations (a lost deal, a complaint) where tone matters more than speed.'],
    related: ['sales-meeting-preparation', 'meeting-notes-to-action-items', 'prospect-research'], template: 'follow-up-email',
  },
  {
    slug: 'content-repurposing', title: 'Content Repurposing with AI', department: 'marketing', group: 'Content production',
    description: 'Turn one long piece — a webinar, a guide, a talk — into a LinkedIn post, an email and a short script without losing the point. Steps, prompt, example and checklist.',
    tools: ['ChatGPT', 'Claude'], difficulty: 'beginner',
    outcome: 'Content repurposing with AI starts from one finished source and produces several shorter formats, each built around a single claim from the original — instead of three vague summaries of the whole thing.',
    before: ['Publish the long piece once.', 'Plan to cut it into posts "when there is time".', 'It never gets cut.'],
    steps: [
      ['Extract the claims first', 'Ask for the five most specific claims in the source, each with the sentence that supports it. Pick the three you would defend in a meeting.'],
      ['One claim per format', 'A LinkedIn post, an email and a 60-second script each get one claim. Repurposing fails when every format tries to say everything.'],
      ['Give format rules, not adjectives', '"Under 120 words, first line is the claim, no hashtags, ends with a question" works. "Make it engaging" does not.'],
      ['Supply your voice', 'Paste two pieces you wrote and like. Ask it to match sentence length and vocabulary.'],
      ['Cut before you publish', 'Delete the first sentence of each draft. It is usually a warm-up.'],
    ],
    prompt: `SOURCE below is a finished piece of ours.

Step 1. List the 5 most specific claims in it. After each, quote the supporting sentence.
(Stop here and wait for me to choose three.)

Step 2. For the three I choose, write:
- LinkedIn post: under 120 words, first line is the claim, no hashtags, ends with a question
- Email: subject line + under 100 words + one link
- 60-second script: spoken language, short sentences, one example

Use only facts from SOURCE. Match the voice of MY SAMPLES.

MY SAMPLES: [paste two]
SOURCE: [paste]`,
    example: `Claim chosen: "The first AI task should be narrow enough that one person can check the result in a minute."

LinkedIn: The best first AI project is boring. "Summarise these approved notes into five points" beats "transform our department" — because someone can check it in a minute. If nobody can verify the output quickly, the workflow dies after one use. What is the narrowest task on your team's week?`,
    humanReview: ['Each piece makes one claim, and the claim is in the source.', 'No statistic appears that was not in the source.', 'It sounds like your brand, not like a template.', 'Links and names are correct.'],
    notFor: ['Sources you do not own or have no right to adapt.', 'Turning one thin post into ten thinner ones. If the source has one idea, make one more piece.'],
    related: ['customer-research', 'competitive-research', 'executive-brief'], template: 'content-repurposing',
  },
  {
    slug: 'customer-research', title: 'Customer Interview Analysis with AI', department: 'marketing', group: 'Research',
    description: 'Synthesise customer interviews into themes with quotes and counts, without the model inventing a pattern. Steps, prompt, example output and review checklist.',
    tools: ['Claude', 'ChatGPT'], difficulty: 'intermediate',
    outcome: 'AI-assisted interview analysis reads every transcript the same way and returns themes, each backed by verbatim quotes and a count of how many interviews mentioned it — so the team argues about evidence, not about who remembers what.',
    before: ['Five people each remember a different interview.', 'The loudest quote becomes "what customers want".', 'Transcripts sit unread in a folder.'],
    steps: [
      ['Anonymise, then load', 'Replace names and companies with labels (Customer A, B…). Check your AI tool is approved for customer data before pasting anything.'],
      ['Code one transcript at a time', 'For each: problems mentioned, workarounds, words they used for the problem, what they tried before. Verbatim quotes only.'],
      ['Merge into themes with counts', 'Ask for themes across all coded transcripts, with the number of interviews that mention each and two quotes per theme.'],
      ['Ask what does not fit', 'Request the statements that contradict the main themes. Minority signals are where models smooth things over.'],
      ['Spot-check quotes against transcripts', 'Open three quotes at random and find them in the original. If one is paraphrased or missing, rerun with stricter instructions.'],
    ],
    prompt: `Below are [N] anonymised customer interview transcripts.

1. For each transcript: list problems, current workarounds, and the exact words the customer used. Verbatim quotes only, in quotation marks.
2. Across all transcripts: group into themes. For each theme give the count of interviews that mention it (e.g. 4 of 7) and two verbatim quotes with the customer label.
3. List statements that contradict or do not fit the themes.
4. Do not recommend anything. Analysis only.

If a quote is not word-for-word in the transcript, do not use it.

TRANSCRIPTS:
[paste]`,
    example: `Theme 1 — Reporting takes a full day each week (5 of 7)
"I lose every Friday to the same spreadsheet." — Customer C
"Nobody trusts the number until I have rebuilt it by hand." — Customer F

Does not fit: Customer B says reporting is "fine" and the real problem is onboarding new hires.`,
    humanReview: ['Three random quotes were found word-for-word in the transcripts.', 'Counts match: recount one theme by hand.', 'Contradicting statements are listed, not hidden.', 'No customer can be identified from the output.'],
    notFor: ['Fewer than four interviews — read them yourself; there is no pattern to find yet.', 'Deciding what to build. The output is evidence for a decision, not the decision.', 'Any tool not approved for customer data.'],
    related: ['competitive-research', 'content-repurposing', 'executive-brief'], template: 'customer-interview-analysis',
  },
  {
    slug: 'competitive-research', title: 'Competitive Research with AI', department: 'marketing', group: 'Research',
    description: 'Build a side-by-side competitor comparison from their public pages: positioning, pricing, claims and gaps, every cell sourced. Steps, prompt and review checklist.',
    tools: ['ChatGPT', 'Claude', 'Copilot'], difficulty: 'beginner',
    outcome: 'Competitive research with AI compares what competitors publicly say — positioning, audience, pricing, proof — in one table where every cell cites the page it came from, so the comparison can be checked and updated.',
    before: ['Someone makes a comparison slide once a year.', 'It is out of date in a month.', 'Nobody knows where the numbers came from.'],
    steps: [
      ['Fix the list and the pages', 'Three to five competitors. For each: homepage, pricing page, one product page. Same page types for everyone, or the comparison is unfair.'],
      ['Fix the columns before you start', 'Who it is for, the main promise, pricing model, proof they show, what they do not mention.'],
      ['Extract, do not evaluate', 'First pass is quotation: what does each page actually say. Evaluation comes after, and it is yours.'],
      ['Ask for the gaps', 'What does every competitor claim (table stakes), and what does only one claim. That second list is where positioning lives.'],
      ['Date it', 'Put the retrieval date on the table. Rerun quarterly with the same prompt.'],
    ],
    prompt: `Compare the companies below using ONLY the page text I paste for each.

Build a table. Rows = companies. Columns:
- Who it is for (their words)
- Main promise (quote the headline)
- Pricing model (or "not published")
- Proof shown (logos, numbers, case studies — list what is there)
- Notably absent

After the table:
- Claims every company makes
- Claims only one company makes
Cite the page for each cell. Write "not stated" rather than inferring.

PAGES:
[Company A — homepage text, pricing text, product text]
[Company B — …]`,
    example: `| Company | Who it is for | Main promise | Pricing | Proof |
| A | "operations teams at mid-size distributors" (home) | "Plan every route in minutes" (home) | Per vehicle / month (pricing) | 3 logos, 1 case study |
| B | not stated | "AI-powered logistics" (home) | not published | none shown |

Only one company claims: A — named customer results.`,
    humanReview: ['Every cell can be traced to a page you pasted.', '"Not stated" appears where the page is silent.', 'The retrieval date is on the document.', 'Evaluation and opinion are in a separate section, written by you.'],
    notFor: ['Anything behind a login, or material obtained under NDA.', 'Market-share or revenue estimates — the model will guess.', 'A substitute for talking to customers who chose a competitor.'],
    related: ['customer-research', 'prospect-research', 'executive-brief'],
  },
  {
    slug: 'meeting-notes-to-action-items', title: 'Meeting Notes to Action Items with AI', department: 'operations', group: 'Meetings',
    description: 'Turn a transcript or rough notes into decisions, action items with owners and dates, and open questions. Steps, prompt, example output and review checklist.',
    tools: ['Copilot', 'ChatGPT', 'Claude'], difficulty: 'beginner',
    outcome: 'This workflow takes a meeting transcript or rough notes and returns three lists — decisions, actions with an owner and a date, and open questions — and marks every action where the owner or date was not actually said.',
    before: ['Everyone leaves with a different memory of who is doing what.', 'Notes get sent two days later, or not at all.', 'The same topic returns next week.'],
    steps: [
      ['Start from a transcript if you have one', 'Teams, Zoom and Meet can all produce one. Rough typed notes also work; the output will only be as complete as the input.'],
      ['Ask for three lists, nothing else', 'Decisions. Actions (owner, task, date). Open questions. No narrative summary — nobody reads it.'],
      ['Force it to mark the gaps', 'If an owner or date was not stated, the model must write "owner not stated" rather than pick someone. This is the single most useful instruction.'],
      ['Resolve the gaps in the room or right after', 'Assign the unowned actions yourself. That takes two minutes and is the actual value of the exercise.'],
      ['Send within the hour', 'Paste into the channel or email where the team already works.'],
    ],
    prompt: `From the meeting transcript below, produce exactly three lists.

DECISIONS — what was agreed. One line each.
ACTIONS — a table: Owner | Task | Due date.
  If the owner or the date was not explicitly said, write "not stated". Never guess an owner.
OPEN QUESTIONS — raised but not resolved.

No summary paragraph. No recommendations.

TRANSCRIPT:
[paste]`,
    example: `DECISIONS
- Pilot runs at Fort Worth only.

ACTIONS
| Owner | Task | Due |
| Priya | Send security questionnaire to vendor | Fri 12th |
| not stated | Draft pilot success criteria | not stated |

OPEN QUESTIONS
- Who approves the pilot budget?`,
    humanReview: ['Every action with a named owner — that person actually agreed to it.', '"Not stated" items have been assigned by a human.', 'Decisions are decisions, not topics discussed.', 'Nothing confidential (HR, legal) is going to a wider audience than the meeting had.'],
    notFor: ['HR, legal or disciplinary meetings.', 'Meetings recorded without everyone’s knowledge — check your policy and local law first.', 'Replacing the person who owns the follow-up. Someone still has to chase.'],
    related: ['sop-creation', 'executive-brief', 'sales-follow-up'],
  },
  {
    slug: 'sop-creation', title: 'SOP Creation with AI', department: 'operations', group: 'Process documentation',
    description: 'Write a standard operating procedure from a recorded walkthrough or an expert’s spoken explanation, then test it on someone new. Steps, prompt and checklist.',
    tools: ['ChatGPT', 'Claude', 'Copilot'], difficulty: 'beginner',
    outcome: 'SOP creation with AI turns the way an experienced person explains a task out loud into a numbered procedure with prerequisites, steps, decision points and common mistakes — which you then test by having a newcomer follow it.',
    before: ['The process lives in one person’s head.', 'Documentation is always next quarter’s project.', 'New hires learn by interrupting.'],
    steps: [
      ['Record the expert doing it once', 'Screen recording with narration, or a voice memo explaining each step. Ten minutes of talking beats an hour of writing.'],
      ['Transcribe and paste', 'Most recorders transcribe automatically. Leave the rambling in; the model handles it.'],
      ['Ask for a fixed SOP structure', 'Purpose, when to use it, what you need before starting, numbered steps, decision points ("if X, then Y"), common mistakes, who to ask.'],
      ['Ask what is missing', 'Have the model list every place where the expert said "you just know" or skipped a step. Take those questions back to the expert.'],
      ['Test on a newcomer', 'Hand the SOP to someone who has never done the task. Every question they ask is a missing line.'],
    ],
    prompt: `Below is a transcript of an experienced colleague explaining how to do a task.

Write an SOP with these sections:
1. Purpose (one sentence)
2. When to use this / when not to
3. Before you start (access, files, information needed)
4. Steps — numbered, one action per step, start each with a verb
5. Decision points — "If …, then …"
6. Common mistakes
7. Who to ask

Then list GAPS: every place the explanation assumed knowledge or skipped a step. Phrase each as a question for the expert.
Do not invent steps to fill gaps.

TRANSCRIPT:
[paste]`,
    example: `4. Steps
  1. Open the weekly shipments export in the shared drive (Reports > Weekly).
  2. Filter column F to the current week.
  3. Copy the filtered rows into the "Input" tab of the summary workbook.

GAPS
- Step 2: which date counts as "current week" when a week spans two months?
- "Then you fix the usual ones" — which errors, and how?`,
    humanReview: ['A newcomer completed the task using only the SOP.', 'Every GAP question has been answered by the expert and folded in.', 'Steps contain no passwords, keys or personal data.', 'An owner and a review date are on the document.'],
    notFor: ['Safety-critical or regulated procedures without formal review by the responsible person.', 'Processes that change weekly — document the stable part only.'],
    related: ['meeting-notes-to-action-items', 'internal-document-summary', 'executive-brief'], template: 'sop-builder',
  },
  {
    slug: 'internal-document-summary', title: 'Internal Document Summary with AI', department: 'operations', group: 'Knowledge work',
    description: 'Summarise a long internal document for a specific reader and decision, with page references and a list of what the summary leaves out. Prompt and checklist.',
    tools: ['Copilot', 'Claude', 'ChatGPT'], difficulty: 'beginner',
    outcome: 'A useful AI summary is written for one reader and one decision: it says what the document asks of that reader, gives the evidence with page references, and states what it left out — so the reader knows when to open the original.',
    before: ['A 40-page document arrives the day before the meeting.', 'Half the room skims the first three pages.', 'The decision gets made on the executive summary the author wrote to persuade.'],
    steps: [
      ['Name the reader and the decision', '"For the operations director, who must decide whether to approve the pilot budget." A summary with no reader is a shorter version of the same fog.'],
      ['Ask for what the document wants', 'The ask, in one sentence, first. Then the three strongest supporting points and the three biggest risks, each with a page or section reference.'],
      ['Ask what was left out', 'A list of sections not covered by the summary. This is what makes the summary safe to rely on.'],
      ['Check the numbers', 'Every figure in the summary gets checked against the page it cites. Models transpose digits.'],
      ['Attach, do not replace', 'Send the summary with the document, not instead of it.'],
    ],
    prompt: `Summarise the document below for this reader: [ROLE], who needs to decide: [DECISION].

1. What the document asks of this reader (one sentence)
2. Three strongest supporting points — each with section/page reference
3. Three biggest risks or weaknesses — each with reference
4. Numbers that matter (copy exactly, with reference)
5. Sections NOT covered by this summary

Under 250 words. Neutral tone. If the document does not address the decision, say so.

DOCUMENT:
[paste or attach]`,
    example: `Asks: approve $48,000 for a 12-week routing pilot at one depot. (p.2)
Supports: current planning takes two dispatchers most of each morning (p.6) …
Risks: savings estimate assumes all drivers adopt the app in week one (p.14) …
Not covered: Appendix B (vendor security), Appendix C (contract terms).`,
    humanReview: ['Every number matches the cited page.', 'Risks are from the document or clearly marked as the summariser’s.', 'The "not covered" list is present.', 'The document is permitted in the AI tool you used.'],
    notFor: ['Contracts and legal documents where the exact wording is the point.', 'Documents classified above what your AI tool is approved for.', 'Anything you will sign without reading.'],
    related: ['executive-brief', 'sop-creation', 'meeting-notes-to-action-items'],
  },
  {
    slug: 'executive-brief', title: 'Executive Brief Creation with AI', department: 'leadership', group: 'Reporting',
    description: 'Build a one-page weekly brief for leadership from team updates: what changed, what is at risk, what needs a decision. Steps, prompt, example and review checklist.',
    tools: ['Copilot', 'ChatGPT', 'Claude'], difficulty: 'intermediate',
    outcome: 'An AI-assisted executive brief merges several team updates into one page with three sections — what changed, what is at risk, what needs a decision — and drops everything that is merely activity.',
    before: ['Five teams send five formats.', 'A manager spends Friday afternoon merging them.', 'Leadership reads the first paragraph.'],
    steps: [
      ['Standardise the input once', 'Ask each team for the same four lines: shipped, slipped, risk, need. The workflow works on messy input, but this halves the editing.'],
      ['Merge by section, not by team', 'Leadership wants "what is at risk across the business", not "what did marketing do".'],
      ['Define what counts', 'Tell the model: an item belongs only if it changes a date, a number, a risk or requires a decision. Everything else is activity and gets cut.'],
      ['Write decisions as decisions', 'Each decision item: the question, the options, the owner’s recommendation, the date it is needed by.'],
      ['Review with the source owners', 'Anything marked as a risk goes back to the team that reported it before leadership sees it. No one should learn their project is "at risk" from the brief.'],
    ],
    prompt: `Merge the team updates below into a one-page leadership brief.

Include an item ONLY if it changes a date, a number, a risk, or needs a decision. Cut pure activity.

Sections:
1. What changed this week (max 5 bullets, most important first)
2. At risk — item, why, owner, what would fix it
3. Decisions needed — question / options / owner's recommendation / needed by
4. Dropped from this brief (one line listing what you cut, so nothing is hidden)

Do not soften or upgrade status words. Use the team's own wording for risk.

UPDATES:
[paste]`,
    example: `2. At risk
- Fort Worth pilot start (was Oct 6): security review not scheduled. Owner: Priya. Fix: IT contact by Friday.

3. Decisions needed
- Extend pilot to a second depot? Options: yes now / after week 4 data. Ops recommends waiting. Needed by Oct 1.`,
    humanReview: ['Each risk was confirmed with the team that reported it.', 'Status words were not softened by the model.', 'Numbers match the source updates.', 'The "dropped" line is present, so omissions are visible.'],
    notFor: ['Board or investor reporting with legal weight.', 'Performance judgments about individuals.', 'Hiding bad news — the workflow is built to surface it.'],
    related: ['internal-document-summary', 'meeting-notes-to-action-items', 'competitive-research'], template: 'weekly-executive-summary',
  },
];

export const workflowBySlug = Object.fromEntries(WORKFLOWS.map((w) => [w.slug, w]));
