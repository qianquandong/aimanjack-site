import { TPL_ZH } from './zh.mjs';
// AI template library. One object → one page at /templates/<slug>/ (template: src/pages/templates.mjs).
//
// @typedef {Object} Template
// @property {string} slug
// @property {string} title
// @property {string} description   card text + meta description
// @property {'sales'|'marketing'|'operations'|'leadership'} category
// @property {string[]} roles
// @property {string[]} tools
// @property {string} body          the copyable template
// @property {string[]} inputs      what the user must gather first
// @property {string[]} howTo
// @property {string[]} tips        customisation
// @property {string[]} workflows   related workflow slugs (first one is the parent)
// @property {string[]} related     other template slugs
// @property {boolean} [standalone] a planning worksheet rather than the prompt half of a workflow (changes the page's framing sentence)
export const TEMPLATES = [
  {
    slug: 'sales-meeting-prep', title: 'Sales Meeting Prep Prompt', category: 'sales', roles: ['Account executive', 'Account manager'], tools: ['ChatGPT', 'Claude', 'Copilot'],
    description: 'A copy-and-paste prompt that turns your call notes into a deal status, likely objections, five questions and a sendable agenda.',
    body: `ROLE: You are preparing me for a customer meeting. Be direct. No filler.

CONTEXT
- My company sells: [ONE SENTENCE]
- Customer: [COMPANY], contact: [NAME, TITLE]
- Opportunity: [STAGE], [AMOUNT], target close [DATE]
- Meeting goal: [WHAT I WANT TO LEAVE WITH]

FROM MY NOTES BELOW, PRODUCE
1. State of the deal in 3 lines: what they want / what is blocking / what I owe them
2. Three likely objections. For each: the line in my notes that suggests it, and a one-sentence response
3. Five questions that move the deal (decision process, timeline, other stakeholders, cost of doing nothing, first 90 days)
4. A 3-item agenda with minutes, phrased so I can send it to the customer

RULES
- Use only my notes. If they do not support an answer, write "not in notes".
- No invented facts about the customer.

NOTES
[PASTE CALL NOTES + EMAIL THREAD]`,
    inputs: ['Last call notes', 'The recent email thread', 'Opportunity stage, amount and close date', 'What you want out of this meeting'],
    howTo: ['Fill the bracketed fields. The meeting goal matters most — without it you get a generic agenda.', 'Paste notes as they are; do not tidy them first.', 'Read section 1 before anything else. If it is wrong, your notes are incomplete.', 'Send the agenda to the customer the day before.'],
    tips: ['Add "Our three most common objections are: …" to the context so responses use your real answers.', 'For renewals, replace section 3 with "five questions about usage and value received".', 'Keep a version per product line with the context block pre-filled.'],
    workflows: ['sales-meeting-preparation', 'prospect-research'], related: ['prospect-research', 'follow-up-email'],
  },
  {
    slug: 'prospect-research', title: 'Prospect Research Template', category: 'sales', roles: ['SDR', 'Account executive'], tools: ['ChatGPT', 'Claude', 'Copilot'],
    description: 'A sourced one-page account brief from a company’s public pages and your CRM notes. Every claim cites where it came from.',
    body: `ROLE: Research assistant for a B2B sales rep. Accuracy over completeness.

WHAT I SELL: [ONE SENTENCE]
WHO BUYS IT: [ROLE / COMPANY TYPE]

USING ONLY THE SOURCES BELOW, WRITE A ONE-PAGE BRIEF
1. What they sell, and to whom (2 sentences)
2. What changed in the last 12 months — bullets, each ending with (source: …)
3. The contact — role, likely priorities, what they are probably measured on
4. One specific reason to reach out now — must cite a source
5. Two opening lines I could use, each referencing a sourced fact
6. Unknowns I should ask about

RULES
- If it is not in the sources, write "unknown". Do not use your own knowledge of this company.
- Company and role only. Nothing personal about the contact.

SOURCES
[ABOUT PAGE TEXT]
[PRODUCT / SERVICES PAGE TEXT]
[NEWS OR CAREERS PAGE TEXT]
[CONTACT'S LINKEDIN HEADLINE + SUMMARY]
[MY CRM NOTES]`,
    inputs: ['Text from 2–4 of the company’s public pages', 'The contact’s LinkedIn headline and summary', 'Anything already in your CRM'],
    howTo: ['Paste page text rather than URLs unless your tool browses reliably.', 'Check the two facts you plan to quote yourself.', 'Save the brief into the CRM account note.'],
    tips: ['Add a "Trigger events we care about" list (new facility, hiring, funding, new leader) so section 4 looks for those.', 'For existing customers, swap section 4 for "expansion signals".'],
    workflows: ['prospect-research', 'sales-meeting-preparation'], related: ['sales-meeting-prep', 'follow-up-email'],
  },
  {
    slug: 'follow-up-email', title: 'Follow-Up Email Prompt', category: 'sales', roles: ['Account executive', 'Customer success'], tools: ['ChatGPT', 'Claude', 'Copilot'],
    description: 'Drafts a short post-meeting email from your notes — decisions, owners, dates, one next step — in your own voice, with no invented commitments.',
    body: `Write a follow-up email from the call notes below.

FORMAT
- Under 150 words
- Line 1: thanks, one sentence, specific to this call
- Then: what we decided
- Then: who owes what by when (two short lists: "From me" / "From you")
- Last: ONE next step with a proposed date

VOICE
- Match my two sample emails: sentence length, greeting, sign-off
- No "I hope this finds you well", no "circling back", no exclamation marks

HARD RULES
- Do not add any commitment, date or number that is not in my notes
- If the notes lack an owner or a date, leave a [BRACKET] for me to fill

MY SAMPLE EMAILS
[PASTE TWO, NAMES REMOVED]

CALL NOTES
[PASTE]`,
    inputs: ['Call notes (decisions, promises, dates)', 'Two emails you wrote and liked'],
    howTo: ['Run it within an hour of the call.', 'Read only the commitments against your notes — that is where errors cost you.', 'Fill any [BRACKET], then send.'],
    tips: ['Save your two sample emails in the tool’s custom instructions so you stop pasting them.', 'For internal meetings, change "From you" to named owners.'],
    workflows: ['sales-follow-up', 'meeting-notes-to-action-items'], related: ['sales-meeting-prep', 'prospect-research'],
  },
  {
    slug: 'customer-interview-analysis', title: 'Customer Interview Analysis Template', category: 'marketing', roles: ['Product marketer', 'Researcher', 'Founder'], tools: ['Claude', 'ChatGPT'],
    description: 'Codes interview transcripts into themes with verbatim quotes and counts, and lists what does not fit — analysis only, no recommendations.',
    body: `You are analysing customer interviews. Analysis only — no recommendations.

RESEARCH QUESTION: [WHAT WE ARE TRYING TO LEARN]
INTERVIEWS: [N] transcripts, anonymised as Customer A, B, C…

PASS 1 — per transcript
For each customer list:
- Problems mentioned
- Current workarounds
- What they tried before
- Their exact words for the problem
Verbatim quotes only, in quotation marks, with the customer label.

PASS 2 — across transcripts
- Themes, each with: count (e.g. "4 of 7"), two verbatim quotes, customer labels
- Order by count

PASS 3 — what does not fit
- Statements that contradict the themes
- Things only one customer said that seem important

RULES
- A quote must be word-for-word from the transcript. If unsure, leave it out.
- Do not merge two customers' statements into one quote.

TRANSCRIPTS
[PASTE]`,
    inputs: ['At least four anonymised transcripts', 'The research question', 'Confirmation that your AI tool is approved for customer data'],
    howTo: ['Anonymise first: replace names and companies with labels.', 'Spot-check three quotes against the transcripts.', 'Recount one theme by hand.', 'Bring the "does not fit" list to the readout — it prevents overconfidence.'],
    tips: ['Add segment labels (Customer A — enterprise, ops) and ask for themes by segment.', 'For churn interviews, add "what would have kept them" to pass 1.'],
    workflows: ['customer-research', 'competitive-research'], related: ['content-repurposing', 'weekly-executive-summary'],
  },
  {
    slug: 'weekly-executive-summary', title: 'Weekly Executive Summary Template', category: 'leadership', roles: ['Chief of staff', 'Department head', 'PMO'], tools: ['Copilot', 'ChatGPT', 'Claude'],
    description: 'Merges team updates into a one-page leadership brief: what changed, what is at risk, what needs a decision — and what was cut.',
    body: `Merge the team updates below into a one-page brief for [AUDIENCE].

INCLUSION TEST
Include an item only if it changes a date, a number, a risk, or needs a decision.
Everything else is activity. Cut it.

SECTIONS
1. What changed this week — max 5 bullets, most important first
2. At risk — table: Item | Why | Owner | What would fix it
3. Decisions needed — for each: the question / options / owner's recommendation / needed by
4. Dropped from this brief — one line listing what you cut

RULES
- Keep each team's own status words. Do not soften "at risk" into "being monitored".
- Copy numbers exactly.
- Under 300 words.

TEAM UPDATES
[PASTE]`,
    inputs: ['This week’s updates from each team, in any format', 'Who the brief is for'],
    howTo: ['Ask teams for four lines each: shipped, slipped, risk, need. It halves the editing.', 'Send every "at risk" line back to its team before leadership sees it.', 'Keep section 4. Visible omissions build trust in the brief.'],
    tips: ['Add last week’s brief and ask for "what moved since last week".', 'For a monthly version, change the inclusion test to "changes the quarter’s outcome".'],
    workflows: ['executive-brief', 'internal-document-summary'], related: ['ai-use-case-discovery-worksheet', 'sop-builder'],
  },
  {
    slug: 'content-repurposing', title: 'Content Repurposing Workflow Template', category: 'marketing', roles: ['Content marketer', 'Founder'], tools: ['ChatGPT', 'Claude'],
    description: 'A two-step prompt: extract the five strongest claims from a finished piece, then write one LinkedIn post, one email and one short script — one claim each.',
    body: `STEP 1 — run this first
Read SOURCE. List the 5 most specific claims in it.
After each claim, quote the sentence that supports it.
Stop and wait for me to choose three.

STEP 2 — after I choose
For each chosen claim write ONE format:

LINKEDIN POST
- Under 120 words. Line 1 is the claim. Short paragraphs.
- No hashtags, no emojis. End with a genuine question.

EMAIL
- Subject line under 45 characters
- Under 100 words, one link, one ask

60-SECOND SCRIPT
- Spoken language. Sentences under 15 words.
- Hook in the first 5 seconds, one example, one takeaway

RULES
- Facts only from SOURCE. No new statistics.
- Match the voice of MY SAMPLES.
- Delete any opening sentence that is a warm-up.

MY SAMPLES
[PASTE TWO PIECES YOU LIKE]

SOURCE
[PASTE THE FINISHED PIECE]`,
    inputs: ['One finished long piece you own', 'Two short pieces in your voice'],
    howTo: ['Run step 1 and choose claims you would defend out loud.', 'Assign one claim per format. Do not let one post carry all three.', 'Cut the first sentence of each draft before publishing.'],
    tips: ['Swap formats for your channels (newsletter intro, sales one-liner, slide).', 'Add "banned words: …" with the phrases your brand never uses.'],
    workflows: ['content-repurposing', 'customer-research'], related: ['customer-interview-analysis', 'weekly-executive-summary'],
  },
  {
    slug: 'sop-builder', title: 'SOP Builder Template', category: 'operations', roles: ['Operations manager', 'Team lead'], tools: ['ChatGPT', 'Claude', 'Copilot'],
    description: 'Turns a transcript of an expert explaining a task into a structured SOP, plus a list of the gaps to take back to the expert.',
    body: `Below is a transcript of an experienced colleague explaining how to do: [TASK NAME].
Audience for the SOP: someone competent who has never done this task.

WRITE THE SOP
1. Purpose — one sentence
2. When to use this / when not to
3. Before you start — access, files, information
4. Steps — numbered, one action per step, each starts with a verb, includes where to click or look
5. Decision points — "If …, then …"
6. Common mistakes and how to spot them
7. Who to ask, and what to tell them

THEN LIST GAPS
Every place the explanation assumed knowledge, skipped a step, or said something like "you just know".
Write each gap as a question for the expert.

RULES
- Do not invent steps to fill gaps.
- Do not include passwords, keys or personal data even if spoken in the transcript.

TRANSCRIPT
[PASTE]`,
    inputs: ['A transcript of the expert doing or explaining the task (10 minutes is plenty)', 'The task name and who the SOP is for'],
    howTo: ['Record once, transcribe automatically, paste as is.', 'Take the GAPS list back to the expert; fold the answers in.', 'Give the SOP to a newcomer. Each question they ask is a missing line.', 'Add an owner and a review date.'],
    tips: ['Ask for a checklist version (steps only) for people who already know the task.', 'For software tasks, add "include the menu path for every click".'],
    workflows: ['sop-creation', 'meeting-notes-to-action-items'], related: ['weekly-executive-summary', 'ai-use-case-discovery-worksheet'],
  },
  {
    slug: 'ai-use-case-discovery-worksheet', title: 'AI Use Case Discovery Worksheet', category: 'leadership', standalone: true, roles: ['Team lead', 'Department head', 'Anyone starting with AI'], tools: ['No AI tool needed'],
    description: 'The four-question scoring sheet used to open every AI Man Jack session: list three weekly tasks, score them, pick the narrowest one that passes.',
    body: `AI USE CASE DISCOVERY WORKSHEET
Fill this in per person. No AI tool needed. About 15 minutes.

STEP 1 — List three tasks you repeat every week
Not the hardest part of your job. The most repetitive.
  Task A: ______________________
  Task B: ______________________
  Task C: ______________________

STEP 2 — Score each task. Yes = 1, No = 0.
                                                         A    B    C
1. Does it happen often enough to matter?               [ ]  [ ]  [ ]
2. Can the input and the output be described clearly?   [ ]  [ ]  [ ]
3. Can a knowledgeable person check the result quickly? [ ]  [ ]  [ ]
4. Can it be tested without sensitive information?       [ ]  [ ]  [ ]
                                              TOTAL      __   __   __

A task that scores under 4 is not a first task. It may be a third.

STEP 3 — Of the tasks scoring 4, pick the NARROWEST
Good:  "Prepare a five-point meeting brief from these approved notes."
Bad:   "Run my department."

  My first task: ______________________

STEP 4 — Write the work instruction (five parts)
  Goal:              ______________________
  Approved source:   ______________________
  Constraints:       ______________________
  Output format:     ______________________
  Flag for a human:  ______________________

STEP 5 — Before anyone uses the output
  Who checks it?     ______________________
  Who signs off?     ______________________
  Review in 2 weeks: keep / change / stop`,
    inputs: ['Fifteen minutes', 'An honest list of what you actually do each week'],
    howTo: ['Have three people on a team fill it in separately, then compare.', 'Pick the single highest-scoring, narrowest task across the team.', 'Write its five-part instruction and run it once. The person who normally does the task grades the output.', 'If nobody’s name goes in "who signs off", the workflow is not ready.'],
    tips: ['Leadership teams often score every task low on frequency. That is a real result: a briefing may fit better than a workshop.', 'Re-run quarterly; the second and third tasks are usually worth more than the first.'],
    workflows: ['executive-brief', 'meeting-notes-to-action-items'], related: ['weekly-executive-summary', 'sop-builder'],
  },
  // ── Planning worksheets: one per AI Readiness Assessment area (the result screen sends people here first). `standalone` = not a prompt.
  {
    slug: 'team-ai-training-brief', title: 'Team AI Training Brief', category: 'leadership', standalone: true, roles: ['Department head', 'HR / L&D', 'Team lead'], tools: ['No AI tool needed'],
    description: 'A one-page brief to fill in before any AI training: who is in the room, what each role repeats every week, which tools are approved, and what people should be able to do afterwards.',
    body: `TEAM AI TRAINING BRIEF
Fill in before booking or designing any AI training. About 20 minutes. One page.

1. THE TEAM
   Team / department:        ______________________
   Number of people:         ______
   Roles in the room:        ______________________
   How many write code:      ______   (the rest are who this is for)

2. WHERE PEOPLE ARE TODAY   (tick one per row)
                                  Never   Tried it   Weekly   Daily
   Most of the team uses AI:       [ ]      [ ]       [ ]      [ ]
   The manager uses AI:            [ ]      [ ]       [ ]      [ ]

3. WORK THAT REPEATS EVERY WEEK   (one line per role — the raw material for training)
   Role: ____________  Task: ______________________________
   Role: ____________  Task: ______________________________
   Role: ____________  Task: ______________________________

4. TOOLS AND DATA
   AI tools the company has approved:       ______________________
   Information that must not go into them:  ______________________
   (If either line is blank, settle that first. Training on an unapproved tool teaches the wrong habit.)

5. AFTER TRAINING, PEOPLE SHOULD BE ABLE TO
   [ ] pick tasks that are worth AI, and skip the ones that are not
   [ ] write a work instruction the model can follow
   [ ] turn a one-off chat into a workflow that runs again next week
   [ ] check an output before it is used, and know who signs off
   Other: ______________________

6. HOW WE WILL KNOW IT WORKED   (two weeks after)
   Which workflows should exist:      ______________________
   Who checks whether they are used:  ______________________

7. LOGISTICS
   Format:  [ ] 90 minutes   [ ] half day   [ ] multi-week
   Onsite or remote: __________   Language: __________   Preferred dates: __________`,
    inputs: ['Twenty minutes with the team’s manager', 'A rough list of what each role does every week', 'The name of whoever approves software'],
    howTo: ['Fill it in with the manager, not for them. Section 3 is the part only they know.', 'If section 4 has blanks, stop and resolve them; everything else depends on it.', 'Send the finished page to whoever is running the training — it replaces the first discovery call.', 'Keep it. Section 6 is what you review two weeks after the session.'],
    tips: ['Run one brief per department. Sales and operations never share section 3.', 'For a leadership team, replace section 3 with “decisions we make every month”. If the list is short, a 90-minute session fits better than a workshop.'],
    workflows: ['executive-brief', 'meeting-notes-to-action-items'], related: ['ai-use-case-discovery-worksheet', 'two-week-workflow-review'],
  },
  {
    slug: 'ai-workflow-one-pager', title: 'AI Workflow One-Pager', category: 'operations', standalone: true, roles: ['Workflow owner', 'Team lead', 'Operations manager'], tools: ['No AI tool needed'],
    description: 'Turn a one-off chat into a repeatable workflow on one page: trigger, inputs, steps, the instruction, who reviews, who owns it, and when it gets reviewed.',
    body: `AI WORKFLOW ONE-PAGER
One page per workflow. If it does not fit on a page, it is two workflows.

NAME:        ______________________
OWNER:       ______________________   (one person, by name)
REVIEWER:    ______________________   (who checks the output before it is used)

1. TRIGGER — when does this run?
   ______________________   (e.g. "every Friday at 2pm", "after each customer call")

2. INPUTS — what goes in, and where it comes from
   Input: ______________________   Source: ______________________
   Input: ______________________   Source: ______________________
   Anything sensitive in these inputs?  [ ] No   [ ] Yes → stop, check the data boundaries first

3. STEPS
   1. ______________________   (person / AI)
   2. ______________________   (person / AI)
   3. ______________________   (person / AI)
   4. ______________________   (person / AI)

4. THE INSTRUCTION — five parts
   Goal:              ______________________
   Approved source:   ______________________
   Constraints:       ______________________
   Output format:     ______________________
   Flag for a human:  ______________________

5. REVIEW — what the reviewer checks, every time
   [ ] Every claim traces to the source
   [ ] Format followed
   [ ] Numbers match
   [ ] ______________________

6. WHERE THE OUTPUT GOES
   ______________________   (channel, folder, system — not "my chat history")

7. WHEN IT FAILS
   If the output is wrong:        ______________________
   If the tool is unavailable:    ______________________

FIRST REVIEW DATE: __________   Decision then:  keep / change / stop`,
    inputs: ['One task you have already done with AI at least twice', 'The prompt you used, however rough', 'The name of someone who can judge the output quickly'],
    howTo: ['Write it for a task that already works in chat. This page makes it repeatable; it does not make it work.', 'Name one owner and one reviewer. “The team” is nobody.', 'Fill section 5 with what the reviewer actually looks at, then time one review. If it takes longer than doing the task by hand, the workflow is not ready.', 'Put the first review date in a calendar before you file the page.'],
    tips: ['Keep all one-pagers in one shared folder. That folder is your AI workflow register.', 'If step 3 has more than six steps, split it.'],
    workflows: ['sop-creation', 'meeting-notes-to-action-items'], related: ['two-week-workflow-review', 'approved-source-inventory'],
  },
  {
    slug: 'approved-source-inventory', title: 'Approved Source Inventory', category: 'operations', standalone: true, roles: ['Operations manager', 'Team lead', 'Knowledge owner'], tools: ['No AI tool needed'],
    description: 'A one-page list of the documents AI is allowed to read for your team’s work: what each one is, where it lives, who owns it, and when it was last checked.',
    body: `APPROVED SOURCE INVENTORY
The documents an AI workflow may treat as true. If a source is not on this list, the model should not be answering from it.

TEAM: ______________________      LAST UPDATED: __________      KEPT BY: ______________________

| # | Source (what it is)            | Where it lives        | Owner      | Last checked | OK for AI tool? |
|---|--------------------------------|-----------------------|------------|--------------|-----------------|
| 1 | e.g. Current price list        | Shared drive > Sales  | __________ | __________   | Yes / No        |
| 2 | e.g. Returns policy            | __________            | __________ | __________   | Yes / No        |
| 3 | e.g. Onboarding SOP            | __________            | __________ | __________   | Yes / No        |
| 4 |                                |                       |            |              |                 |
| 5 |                                |                       |            |              |                 |

FOR EACH SOURCE, THREE CHECKS
   [ ] One current version exists (not four copies in four inboxes)
   [ ] Someone by name is responsible for keeping it right
   [ ] It contains nothing that is off-limits for the approved AI tool

GAPS — things people keep asking AI about that have NO approved source
   1. ______________________   → who will write it: __________  by: __________
   2. ______________________   → who will write it: __________  by: __________
   3. ______________________   → who will write it: __________  by: __________

RULE FOR WORKFLOWS
   Every workflow names its source from this list. "The model knows" is not a source.`,
    inputs: ['A list of the questions your team most often asks AI, or each other', 'Access to the shared drive or wiki where documents actually live', 'Thirty minutes'],
    howTo: ['Start from the questions, not the folders: for each common question, which document answers it?', 'Where the answer is “nobody wrote that down”, put it under GAPS with a name and a date.', 'Mark “OK for AI tool” only after checking the document against your data boundaries.', 'Review quarterly. A source nobody has checked in a year is a guess.'],
    tips: ['The GAPS list is usually the most valuable output. Each gap is an SOP waiting to be written.', 'Link each row to the file, so the inventory doubles as a reading list for new hires.'],
    workflows: ['sop-creation', 'internal-document-summary'], related: ['sop-builder', 'ai-data-boundaries-one-pager'],
  },
  {
    slug: 'ai-tool-approval-checklist', title: 'AI Tool Approval Checklist', category: 'leadership', standalone: true, roles: ['Department head', 'IT lead', 'Operations manager'], tools: ['No AI tool needed'],
    description: 'A one-page checklist for approving one AI tool for a team: what it will be used for, what the vendor does with your data, who pays, who has access, and what you tell everyone.',
    body: `AI TOOL APPROVAL CHECKLIST
Goal: end "everyone uses their personal account" by approving ONE tool, in writing. One page per tool.

TOOL: ______________________     PLAN / TIER: ______________________     DATE: __________
REQUESTED BY: ______________________     DECISION OWNER: ______________________

1. WHAT IT IS FOR
   Three tasks it will be used for first:
   a. ______________________   b. ______________________   c. ______________________

2. DATA — read the vendor's current terms for THIS plan; do not rely on memory
   [ ] Does the vendor train its models on what we enter?        Yes / No / Opt-out available
   [ ] How long is our data retained?                            ______________________
   [ ] Where is it stored / processed?                           ______________________
   [ ] Can we delete it?                                         Yes / No
   [ ] Is there an admin console and an audit log?               Yes / No
   Link to the terms we read: ______________________   Date read: __________

3. ACCESS
   [ ] Company accounts, not personal ones
   [ ] Single sign-on or at least company email addresses
   [ ] Who gets a seat first: ______________________
   [ ] What happens to an account when someone leaves: ______________________

4. COST
   Per seat / month: ______   Seats: ______   Owner of the budget line: ______________________

5. BOUNDARIES
   [ ] The data boundaries one-pager exists and names this tool
   [ ] People know what must never go into it

6. DECISION
   [ ] Approved for: ______________________
   [ ] Approved with conditions: ______________________
   [ ] Not approved, because: ______________________
   Review again on: __________

7. TELL EVERYONE — one message, sent the same day
   "We have approved ______ for ______. Use your company account. Do not put ______ into it.
    Questions go to ______. Personal AI accounts are not for company work from ______."

This checklist organises a decision. It is not legal or security advice; involve counsel and IT for regulated data.`,
    inputs: ['The tool’s current terms and privacy page for the exact plan you would buy', 'Someone who can speak for IT or security, even informally', 'The three tasks people want it for'],
    howTo: ['Approve one tool first. Comparing five delays the day people stop using personal accounts.', 'Fill section 2 from the vendor’s pages on the day, and paste the link: terms differ by plan and change.', 'Do section 7 the same day as section 6. An approval nobody hears about changes nothing.', 'Set the review date. Tools and terms move every few months.'],
    tips: ['If the answer in section 2 is “trains on our data, no opt-out”, the decision is usually a different plan, not a different tool.', 'Keep approved checklists in the same folder as your workflow one-pagers.'],
    workflows: ['executive-brief', 'internal-document-summary'], related: ['ai-data-boundaries-one-pager', 'team-ai-training-brief'],
  },
  {
    slug: 'ai-data-boundaries-one-pager', title: 'AI Data Boundaries One-Pager', category: 'leadership', standalone: true, roles: ['Department head', 'Operations manager', 'Compliance lead'], tools: ['No AI tool needed'],
    description: 'One page every employee can read in two minutes: which AI tools are approved, what must never go into them, what needs a check first, and which outputs need a named person to sign off.',
    body: `AI DATA BOUNDARIES — ONE PAGE
Everyone on the team should be able to read this in two minutes and answer three questions:
which tools, which information, who signs off.

TEAM: ______________________     OWNER OF THIS PAGE: ______________________     DATE: __________

1. APPROVED TOOLS — use these, with your company account
   ______________________      ______________________
   Anything else is not approved for company work. Ask: ______________________

2. NEVER GOES INTO AN AI TOOL
   [ ] Passwords, keys, access tokens
   [ ] Government ID numbers, bank and card details
   [ ] Health information about any person
   [ ] Customer data we hold under a contract or NDA that forbids it
   [ ] Unreleased financial results
   [ ] ______________________
   [ ] ______________________

3. CHECK FIRST — ask the owner of this page before using
   [ ] Customer names with anything about their account
   [ ] Employee information (HR, pay, performance)
   [ ] Contracts and legal correspondence
   [ ] ______________________

4. FINE TO USE
   [ ] Public information
   [ ] Our own published material
   [ ] Internal documents on the Approved Source Inventory marked "OK for AI tool"
   [ ] Anonymised data (names and identifiers removed BEFORE it goes in)

5. SIGN-OFF — a named person checks before the output is used
   Output                                  Who signs off
   Anything sent to a customer             ______________________
   Anything with a number in it            ______________________
   Anything that goes to leadership        ______________________
   ______________________                  ______________________

6. IF SOMETHING WENT IN THAT SHOULD NOT HAVE
   Tell ______________________ the same day. No blame for reporting; the problem is not reporting.

REVIEW THIS PAGE ON: __________

This page records a team's working rules. It is not legal advice. For regulated data, have counsel review it.`,
    inputs: ['Your list of approved tools (or the decision that there are none yet)', 'Any contracts or NDAs that restrict what you may do with customer data', 'One person willing to own the page'],
    howTo: ['Write section 2 first, in plain words. If people need a lawyer to read it, they will not follow it.', 'Put real names in section 5. A role that nobody holds signs off nothing.', 'Walk the team through it in ten minutes, then pin it where the work happens.', 'Ask three people a week later which tools are approved. If they cannot answer, the page has not landed.'],
    tips: ['When a manager answers “written guidance” on the readiness assessment and the team answers “no guidance”, this is the page that is missing or unread.', 'Regulated industries: treat this as the summary of your policy, not the policy.'],
    workflows: ['internal-document-summary', 'customer-research'], related: ['ai-tool-approval-checklist', 'approved-source-inventory'],
  },
  {
    slug: 'two-week-workflow-review', title: 'Two-Week AI Workflow Review', category: 'leadership', standalone: true, roles: ['Workflow owner', 'Team lead', 'Department head'], tools: ['No AI tool needed'],
    description: 'The review run two weeks after a workflow starts: was it used on real work, was it accurate enough, where did checking take too long — then one decision: keep, change or stop.',
    body: `TWO-WEEK AI WORKFLOW REVIEW
Fifteen minutes, two weeks after a workflow starts. One sheet per workflow. Ends in one decision.

WORKFLOW: ______________________     OWNER: ______________________     REVIEW DATE: __________
STARTED ON: __________               REVIEWER DURING THESE TWO WEEKS: ______________________

1. WAS IT USED ON REAL WORK?
   Times it ran in two weeks:  ______        Times the task came up:  ______
   If it ran less than half the time, why?   ______________________

2. WAS THE OUTPUT ACCURATE ENOUGH TO USE?
   Used as it was:                 ______ times
   Used after edits:               ______ times     Typical edit: ______________________
   Thrown away:                    ______ times     Why: ______________________

3. WHAT DID THE REVIEWER CATCH?
   ______________________
   ______________________
   Did anything wrong get past review?   [ ] No   [ ] Yes → what: ______________________

4. WHERE DID IT TAKE TOO LONG?
   [ ] Gathering the inputs     [ ] Running it     [ ] Checking the output     [ ] Fixing the output
   Note: ______________________

5. DID THE BOUNDARIES HOLD?
   [ ] Only approved tools were used
   [ ] Nothing off-limits went in
   [ ] Sign-off happened before the output was used

6. DECISION — tick one
   [ ] KEEP      as it is. Next review: __________
   [ ] CHANGE    what: ______________________   by whom: __________   re-review: __________
   [ ] STOP      because: ______________________

Attendance and enthusiasm are not measures. Count what ran, what was usable, and what review caught.`,
    inputs: ['The workflow’s one-pager', 'The owner and the reviewer in the same conversation', 'Rough counts — tallies from memory are fine for a first review'],
    howTo: ['Book it on the day the workflow starts, not when someone remembers.', 'Answer sections 1 and 2 with counts, even rough ones. “It’s going well” is not an answer.', 'Section 4 tells you what to change: if checking is the slow part, tighten the output format; if inputs are, fix the source.', 'Choose one box in section 6. “Keep and change” is “change”.'],
    tips: ['STOP is a good outcome. It frees the team for the task that scored second on the discovery worksheet.', 'After three clean reviews, move the workflow to quarterly.'],
    workflows: ['executive-brief', 'meeting-notes-to-action-items'], related: ['ai-workflow-one-pager', 'weekly-executive-summary'],
  },
];

TEMPLATES.forEach((t) => { t.zh = TPL_ZH[t.slug]; });
export const templateBySlug = Object.fromEntries(TEMPLATES.map((t) => [t.slug, t]));
