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
   - **Clusters failures by root cause**, not by test: it normalizes each error message (strips timestamps, ids, line numbers, etc.) so the same underlying bug filed from different tests/runs hashes to the same cluster. Screenshot/visual-diff failures are clustered **strictly per spec file** instead — the error text (snapshot name, diff stats) is never part of that fingerprint, so every `toHaveScreenshot` failure in one file collapses into a single cluster/task no matter how many different diffs it covers.
   - Creates the release story in Taiga if it doesn't exist yet (subject `[release <tag>] Daily failures triage`, tagged `needs-triage` + `release-<tag>`, optionally linked under `epic_ref`).
   - Adds **one task per new cluster** (or per file, if `group_by: file`) — see "What's in a task" below.
   - For clusters already known and still failing, comments on the story instead of creating a new task, so it doesn't spam duplicates.
   - **Auto-closes tasks for clusters whose error is no longer seen in the next triaged run** — closed status, assigned to `qa.integrations.bot`, with a comment explaining why. If someone already closed the task manually (see "Triage convention" below), it just adds a verification comment instead. This tracks every task it creates (in both `group_by: cluster` and `group_by: file` mode) so nothing is silently un-closeable — see "Ad-hoc closing" below for sweeping a backlog or fixing a stray task by hand.
5. **Saves the updated state** back to S3 so the next run knows what's open, closed, and how many consecutive runs each cluster has failed/passed. State is saved even if the run throws partway through (a Taiga hiccup, a network blip), so a failed run doesn't strand already-created tasks out of state and cause duplicates on the next run.
6. **Posts a digest** (new clusters / still-failing clusters / resolved clusters, plus flaky count, run id, and app version) to the job summary and to Mattermost.

**Re-running is safe.** Run it again with the same tag and it only adds _new_ clusters and closes _resolved_ ones — nothing gets duplicated.

### Ad-hoc closing

Two ways to close resolved tasks without filing a full triage:

- **`close_only` workflow input** — tick it when running "Report triage" from the Actions tab. Runs the same pipeline (finds the report, pulls state) but skips creating any new story/task; it only sweeps and closes tasks whose error is no longer present in the given run. Do not combine with `reset_state` — the workflow rejects that combination outright, since resetting state right before a close-only sweep would wipe out the very data it needs to know what's resolved.
- **`--close-ref <taskRef> [--close-ref <taskRef> ...]`** — CLI only (not wired into the workflow), force-closes specific Taiga tasks by their visible ref number (`#1234`), bypassing `results.json`/state entirely. Escape hatch for one-off closes or tasks that predate this tracking (e.g. old `group_by: file` tasks created before per-file tracking existed). Does **not** write `.triage/digest.md` or post to Mattermost.

Running `--close-only` by hand from a checkout works the same way, with the same Taiga env vars as the scheduled workflow:

```bash
TAIGA_URL=... TAIGA_USERNAME=... TAIGA_PASSWORD=... TAIGA_PROJECT=... \
  npx tsx scripts/triage.ts --results results.json --state .triage/state.json --close-only
```

### Debugging a run

Every run logs a one-line summary of its inputs (results path, state path, mode, run id, app version, flags) at the top of the job log. The run id of the `results.json` being triaged (the daily regression run, not the triage workflow's own run) is also stamped into the digest, Taiga story/task descriptions, and the Mattermost post, so it's always traceable back to its source without decoding the report URL.

### What's in a task

Each task represents one failure cluster and includes:

- A one-line subject: the concise error + affected spec file(s) + test count, e.g. `expect(locator).toBeVisible() failed @ Cancel subscription — checkout.spec.ts (3 tests)`
- Spec files affected, and a **Qase IDs affected** summary line aggregating every Qase ID across the cluster's tests — including tests tagged with more than one ID (`qase([1234, 1235], ...)`), which are listed in full rather than truncated to the first
- The full list of failing tests in that cluster, each with its own Qase ID(s) (if tagged) and retry count
- The raw error for the cluster
- The run id and a link to the full HTML report for the triaged run

In `group_by: file` mode, tasks are per spec file instead, listing every failing test in that file (Qase IDs appear inline per test rather than as a separate summary line).

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
| `close_only`    | ❌       | `true` to sweep and close resolved tasks only — files nothing new. Cannot be combined with `reset_state` (the run fails fast if both are ticked).  |

### Good to know

- Requires the **PRE** environment (grants access to the Mattermost webhook secret).
- Needs `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` / `AWS_REGION` and Taiga secrets configured in repo settings — nothing to set up per run.
- Resolved tasks in Taiga are auto-assigned to `qa.integrations.bot`.
- If no completed scheduled daily run exists on `main`, the job fails early with a clear error.
