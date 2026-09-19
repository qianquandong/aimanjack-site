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
    slug: 'ai-use-case-discovery-worksheet', title: 'AI Use Case Discovery Worksheet', category: 'leadership', roles: ['Team lead', 'Department head', 'Anyone starting with AI'], tools: ['No AI tool needed'],
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
];

TEMPLATES.forEach((t) => { t.zh = TPL_ZH[t.slug]; });
export const templateBySlug = Object.fromEntries(TEMPLATES.map((t) => [t.slug, t]));
