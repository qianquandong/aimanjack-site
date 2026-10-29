# Aimanjack bilingual AI training article queue

This pack contains ten complete article topics in English and Chinese: five proposed revisions of existing articles and five new articles. Every manuscript is a draft. No manuscript has owner approval yet. Existing article URLs and original publication dates are preserved. New dates are set only when an approved article is actually released.

Open `review/index.html` to read the twenty language versions. Each article page shows its release-bundle SHA-256. That digest binds both languages, the original production source baseline, URL/date plan and the directory-copy correction in `index-copy.json`. Regenerate the review after changing any part of the bundle.

## Recommended cadence

Publish at most one topic per week, English and Chinese together, on Wednesday at 09:00 America/Chicago. This is an operational starting point that leaves time for review and observation, not a proven optimum for ranking or conversion. A substantive update to an existing topic occupies the same weekly slot as a new topic. An empty or unapproved queue produces a no-op.

The primary trigger remains Wednesday at 09:00 Dallas time, including daylight saving changes. Because GitHub can delay or drop scheduled events, staggered triggers at :17 and :47 retry later on Wednesday. They skip release work when the weekly topic is already verified or no approved topic is due. Every publication entry point, including a pending deployment retry, refuses deployment outside Wednesday 09:00–23:59 America/Chicago; a delayed task crossing into Thursday cannot publish. These retries improve resilience but do not turn GitHub scheduling into an exact-time delivery guarantee.

Order: costs and formats; choosing a trainer; evaluating results; sales practice; marketing practice; employee AI policy; first task; office managers; curriculum; ChatGPT versus agents. The ordering prioritizes buying questions and distinct practice examples. It has not been scored using search volume or conversion data.

## Owner approval and revocation

1. Read both languages and the directory wording at the bottom of the review index.
2. Open GitHub Actions → **Approved bilingual blog publisher** → **Run workflow**, using the `production` branch.
3. Choose `approve`, enter the article slug, paste its exact release-bundle SHA-256 and enter the earliest release date as `YYYY-MM-DD` in Dallas time. Only repository owner `qianquandong` can record approval. Approval records a decision; it does not deploy immediately.
4. The Wednesday job publishes the first approved, due topic in queue order, subject to the weekly limit. `publish` can also retry the same due release manually; it cannot approve a draft or bypass the weekly limit. `dry-run` never approves, commits or deploys.
5. To withdraw approval before release, dispatch `revoke` with the slug. Edits to either language, the release plan, directory copy or `src/config.mjs` invalidate the old approval. Review the revised version again.

An instruction to write a draft or configure this scheduler is not approval of the article. Do not run `approve` on behalf of the owner without an explicit decision covering that version. Do not infer approval from a preview being opened.

### Reapproval after a service or renderer change

The 2026-10-21 investigation and exact proposed version are documented in `docs/blog-approval-reconciliation-2026-10-21.md`. Existing approval records remain authoritative; a review file or a new hash is not approval.

A queue item may name `directory-copy/<its-own-slug>.json` instead of the original shared `index-copy.json`. That entire per-topic plan and the queue-item change are included in the bilingual release-bundle digest. This permits the owner to review the exact current renderer after the original directory correction has already shipped, without changing historical plans or accepting arbitrary renderer drift. Both approval and publication still require the reviewed renderer hash. The owner approval workflow now checks that renderer before recording a decision.

`approval_blocked` is a failing monitor result requiring owner review. Its GET-only page-presence evidence does not authorize release. A stale due approval also fails the publisher planning step with `run_required=false`, instead of producing a misleading green no-op. No deployment step is selected in that case. Full content, metadata, discovery and protected-page verification remain required before `verified` can be reported.

## Cloud setup and release checks

The workflow runs on GitHub-hosted infrastructure; the desktop can be off. It needs `CLOUDFLARE_ACCOUNT_ID` and a dedicated token with Cloudflare Pages Edit access to Aimanjack's account in GitHub Actions secrets. The owner saved this token as `CLOUDFLARE_PAGES_EDIT`; the workflow accepts that name or `CLOUDFLARE_API_TOKEN`. Never copy a personal local OAuth session into GitHub. Set repository variable `BLOG_AUTOPUBLISH_ENABLED=true` only after the cloud dry-run and credential check. Missing credentials stop an eligible release before its source or branch is changed. The read-only credential check confirms project access, not a production write.

The job starts on the latest clean `production`, validates all drafts, runs the existing build and offline tests, checks the selected article against its original production baseline, and creates an ordinary fast-forward release commit. A concurrent production change stops the push; no reset or force push is used. Only the chosen article, its approved directory-copy change and generated discovery files may change. No branch protection is weakened.

The deployment still runs the existing `sh deploy.sh --production`, including its complete test gate and IndexNow request. Afterwards, the job checks the actual `aimanjack.com` English and Chinese pages, approved content, metadata, indexability, sitemap and first-party links. Training, booking and contact pages must remain unchanged. Verification uses GET requests only; it never submits appointments, sends emails, runs booking smoke tests or changes backend/DNS configuration.

The release ledger records the deployed version and production verification. A release committed but not verified stays pending and blocks the next manuscript. A retry must still have valid approval and the same released source; it cannot overwrite another person's changes. A failed run is a failure, not a successful publication. It does not automatically roll back unrelated work.

## Evidence and public packaging

The drafts use the current four-session starting price of $499 per person, four live 90-minute sessions, separately scoped workshops/onsite days, separate tool subscriptions and travel outside DFW. Only the four-session program includes the review two weeks after the final session. Training excludes software development and CRM/ERP configuration/integration. Those facts remain controlled by `src/config.mjs` and existing service pages.

Practice inputs and reference outputs are explicitly labeled as synthetic teaching examples. They are not client results or transcripts from an observed class. No completed corporate-training ROI, net time saving, sales lift, marketing return, certification or current Google rating is invented. The existing scheduling implementation remains distinct from training evidence.

The first approved release also changes the resource-directory wording from an assertion that every article records a real classroom event to an accurate description of guides and labeled exercises. The complete before/after wording is reviewable in `index-copy.json` and included in every approval digest; it is not applied by this setup alone.

`editorial/` is excluded from production and read-only preview staging. Draft sources, review pages, approval records and the ledger must never become public static assets.

## Local checks

```sh
node scripts/editorial-queue.mjs check
node scripts/editorial-queue.mjs review
node scripts/publish-approved-blog.mjs dry-run
node scripts/build.mjs
node --test tests/*.test.mjs
```

Before future publication, reconcile changes in the current article, blog renderer or service facts. Do not change baseline hashes just to make a release pass: that changes the approval digest and requires another owner review.
