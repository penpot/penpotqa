# Workflows

GitHub Actions used in this repo. Detailed docs are filled in as we need them — for now only **Report triage** is documented below.

| Workflow                                | File                              | Trigger                    | Docs                           |
| --------------------------------------- | --------------------------------- | -------------------------- | ------------------------------ |
| Report triage                           | `release-triage.yml`              | Manual                     | ⬇️ [see below](#report-triage) |
| Daily Penpot Regression Tests on PRE    | `playwright_pre_daily.yml`        | Scheduled + manual         | _TBD_                          |
| Manual Penpot Tests for PR              | `playwright_pr_manual.yml`        | Manual                     | _TBD_                          |
| Manual Penpot Tests (TESTS environment) | `playwright_tests_manual.yml`     | Manual                     | _TBD_                          |
| GitHub dashboard                        | `github-dashboard.yml`            | ?                          | _TBD_                          |
| OpenCode Agent                          | `opencode-agent.yml`              | ?                          | _TBD_                          |
| CodeQL                                  | `github-code-scanning/codeql`     | Scheduled (GitHub-managed) | —                              |
| Copilot code review                     | `copilot-pull-request-reviewer/*` | On PR (GitHub-managed)     | —                              |
| pages-build-deployment                  | `pages/pages-build-deployment`    | On push (GitHub-managed)   | —                              |

---

## Report triage

Manual GitHub Action that triages QA failures for a release and files them in Taiga.

**File:** `release-triage.yml`

### When to run it

During **freeze week / release promotion**, once there's a scheduled daily PRE run you want triaged for the upcoming release. Typical flow: run it once early in freeze week to open the story, then re-run as needed (e.g. after new daily runs) to pick up newly appearing failures — old ones already triaged won't be touched again.

### What it does

1. **Finds the report to triage** — either the run ID you give it, or (default) the last completed _scheduled_ daily run on `main` from the `playwright_pre_daily.yml` workflow.
2. **Downloads** that run's `results.json` and app version from S3.
3. **Loads previous triage state** for this release tag from S3 (if any exists) — this is how it knows which failures it's already seen.
4. **Runs `scripts/triage.ts`**, which:
   - Parses the Playwright results and separates real failures from flaky tests (failed then passed on retry — flaky ones are counted in the digest but not filed).
   - **Clusters failures by root cause**, not by test: it normalizes each error message (strips timestamps, ids, line numbers, etc.) so the same underlying bug filed from different tests/runs hashes to the same cluster. Screenshot/visual-diff failures are clustered per spec file instead, since their messages carry little identity.
   - Creates the release story in Taiga if it doesn't exist yet (subject `[release <tag>] Daily failures triage`, tagged `needs-triage` + `release-<tag>`, optionally linked under `epic_ref`).
   - Adds **one task per new cluster** (or per file, if `group_by: file`) — see "What's in a task" below.
   - For clusters already known and still failing, comments on the story instead of creating a new task, so it doesn't spam duplicates.
   - **Auto-closes tasks for clusters whose error is no longer seen in the next triaged run** — closed status, assigned to `qa.integrations.bot`, with a comment explaining why. If someone already closed the task manually (see "Triage convention" below), it just adds a verification comment instead.
5. **Saves the updated state** back to S3 so the next run knows what's open, closed, and how many consecutive runs each cluster has failed/passed.
6. **Posts a digest** (new clusters / still-failing clusters / resolved clusters, plus flaky count and app version) to the job summary and to Mattermost.

**Re-running is safe.** Run it again with the same tag and it only adds _new_ clusters and closes _resolved_ ones — nothing gets duplicated.

### What's in a task

Each task represents one failure cluster and includes:

- A one-line subject: the concise error + affected spec file(s) + test count, e.g. `expect(locator).toBeVisible() failed @ Cancel subscription — checkout.spec.ts (3 tests)`
- The full list of failing tests in that cluster, with Qase ID (if tagged) and retry count
- The raw error for each test
- A link to the full HTML report for the triaged run

In `group_by: file` mode, tasks are per spec file instead, listing every failing test in that file.

### Triage convention

**Closing a task in Taiga = "triaged" (reviewed, fix pending).** The workflow respects that: a known cluster with a closed task shows as "triaged" in the digest instead of "needs triage", so it doesn't keep nagging once someone's looked at it. It only gets reopened automatically if it starts failing again as a _new_ cluster later.

### How to run it

1. Go to **Actions → "Report triage" → Run workflow**.
2. Fill in the inputs:

| Input           | Required | What it does                                                                                                                                       |
| --------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `release_tag`   | ✅       | e.g. `2.17`. Taiga story gets tagged `release-2.17`.                                                                                               |
| `report_run_id` | ❌       | Only set if you want to triage a specific run instead of the latest scheduled daily run.                                                           |
| `group_by`      | ❌       | `cluster` (default) or `file` — controls task granularity in the story.                                                                            |
| `epic_ref`      | ❌       | Taiga epic number to link the story under.                                                                                                         |
| `reset_state`   | ❌       | `true` to forget all prior triage state for this tag (treats every failure as new). **Delete the old Taiga story yourself first** if you use this. |

### Good to know

- Requires the **PRE** environment (grants access to the Mattermost webhook secret).
- Needs `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` / `AWS_REGION` and Taiga secrets configured in repo settings — nothing to set up per run.
- Resolved tasks in Taiga are auto-assigned to `qa.integrations.bot`.
- If no completed scheduled daily run exists on `main`, the job fails early with a clear error.
