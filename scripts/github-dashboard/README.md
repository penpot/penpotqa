# Penpot GitHub QA Dashboard — Automated Test Coverage vs. Real Bugs

Regenerates the analysis CSV files and the HTML dashboard (`out/penpot-qa-dashboard.html`) with a single command, using the canonical data sources below.

| Source                                                      | Access                                | Purpose                                                               |
| ----------------------------------------------------------- | ------------------------------------- | --------------------------------------------------------------------- |
| Qase `/v1/suite/PENPOT`                                     | REST API, paginated in batches of 100 | Suite hierarchy and complete test inventory (`cases_count`)           |
| Qase `/v1/case/PENPOT?type=regression&automation=automated` | REST API, paginated in batches of 100 | Regression test cases and automation status                           |
| GitHub Project v2 #8 (penpot organization)                  | GraphQL                               | Issues with Type (Bug/Feature/Enhancement), Status, labels, and dates |
| `flaky-history.json` (public S3 object, plain GET)          | HTTPS                                 | Per-Qase-ID flaky/failed occurrences, fed daily by `flaky-tally.ts`   |

> The GraphQL API is the only way to retrieve the **Status** field from the Project (used by the `-status:Rejected` filter in View 10). The REST Issues API does not expose this information.

## Installation

The primary implementation is written in TypeScript (Node >= 18, with no runtime dependencies):

```bash
npm install          # Only installs tsx
```

(`pipeline.py` is also provided as an alternative Python implementation. It requires `requests` and `pandas`.)

## Tokens

- **Qase:** Settings → API Tokens. Read access to the PENPOT project is sufficient.
- **GitHub:** A classic Personal Access Token (PAT) with the `read:project` scope, or a fine-grained token with the **Organization → Projects: Read** permission. Since the repository is public, the `repo` scope is not required.

```bash
export QASE_API_TOKEN="..."
export GITHUB_TOKEN="ghp_..."
npx tsx scripts/pipeline.ts
```

## Output (`out/`)

- `YYYY-MM-DD-github-dashboard.html` — Self-contained dashboard (no external dependencies)
- `decision-matrix.csv` — Area × (inventory, tests, bugs, decision)
- `mapped-bugs.csv` / `mapped-features.csv` — Each issue mapped to an `area` and `map_method`
- `monthly-trend.csv`
- `regression-tests.csv`
- `flaky-tests.csv` — Regression tests that flaked or failed in CI at least once in the last `window_days` (see below), tallied per Qase ID

The `.github/workflows/github-dashboard.yml` workflow additionally bundles this
whole directory (inputs + `out/`) into a `YYYY-MM-DD-github-dashboard.zip`,
published next to the HTML and linked from its "download raw data" link.

## Maintaining the Issue-to-Area Mapping

All mapping logic is stored in `mapping.json`; no code changes are required.

1. **`label_map`**: Maps exact GitHub labels to an area (highest confidence). Whenever the team introduces a new area label (for example, `IOP xxx`), add it here.
2. **`keyword_map`**: Regular expressions matched against issue titles, evaluated in order (most specific first). Periodically review issues whose `map_method` is `"keyword"` or `"none"` in `mapped-bugs.csv`.
3. **`exclude_labels`**: GitHub labels (case-insensitive) that remove an issue from the matrix entirely, before area mapping runs — use it for labels like `self-hosted` or `no qa` that mark issues as out of scope for QA tracking.

## Running It Every Sprint

Cron (every Monday at 08:00):

```cron
0 8 * * 1 cd /path/to/qa-dashboard-pipeline && QASE_API_TOKEN=... GITHUB_TOKEN=... python pipeline.py
```

Or using GitHub Actions — see `.github/workflows/github-dashboard.yml` for the
actual workflow (store the tokens as repository secrets):

```yaml
name: github-dashboard
on:
  schedule: [{ cron: '30 4 * * 1' }]
  workflow_dispatch:

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20

      - run: npm ci || npm install

      - run: npx tsx scripts/github-dashboard/github_dashboard
        env:
          QASE_TOKEN: ${{ secrets.QASE_API_TOKEN }}
          GITHUB_TOKEN: ${{ secrets.QA_GH_PROJECT_TOKEN }}

      - uses: actions/upload-artifact@v4
        with:
          name: github-dashboard
          path: scripts/github-dashboard/out/
```

> **Note:** The default `GITHUB_TOKEN` provided by GitHub Actions cannot access organization Projects. A Personal Access Token (PAT) stored as a repository secret is required.

## Test reliability (flaky / failing tests)

`playwright_pre_daily.yml`'s "Update flaky-test history" step runs
`flaky-tally.ts` right after each daily regression run, tallying flaky/failed
occurrences per Qase ID from that run's `results.json` and merging them into a
rolling `flaky-history.json` aggregate on S3 (public GET, no credentials
needed to read it):

```bash
npx tsx scripts/github-dashboard/flaky-tally.ts \
  --results playwright-report/results.json \
  --history /tmp/flaky-history.json \
  --run-id "$GITHUB_RUN_ID" \
  --date "$(date -u +%F)" \
  --out /tmp/flaky-history.json
```

Only tests that actually flaked or failed get an entry, so the file stays
proportional to the tests that are a problem, not the full Qase inventory.
Occurrences older than `--window-days` (default 30) are dropped on every
merge, and a test drops out entirely once it has no occurrences left in the
window. `github_dashboard.ts` fetches this aggregate, joins it against the
regression tests by Qase ID (`buildReliabilityRows`), and writes
`flaky-tests.csv` plus the "Test reliability" section in the HTML dashboard.

This is a **count of occurrences, not a rate** — there's no denominator of
clean runs, since only failing/flaky tests are recorded. A test that has run
20 times and flaked once looks the same as one that has run 3 times and
flaked once. A future iteration could walk every test in `results.json`
(not just failures) to get a proper flake-rate denominator.

> **Note:** the raw `run-<id>/` folders on S3 (which hold each day's
> `results.json`) appear to expire after roughly 10 days — check with
> `curl -I .../run-<id>/results.json` before assuming an old run is still
> fetchable. `flaky-history.json` itself has no such expiry since it's a
> small aggregate file, not a full report.

### Bootstrapping the history

`flaky-history.json` starts empty and takes a few weeks to become useful on
its own. It was originally bootstrapped by replaying the daily runs still on
S3 at the time through `flaky-tally.ts` chronologically, then publishing the
result directly to S3 — the one-off script and seed data used for that are
gone now that the object exists; `playwright_pre_daily.yml`'s daily step
maintains it from here.

If `flaky-history.json` is ever lost or needs reseeding (e.g. after an S3
incident), rebuild it the same way: run `flaky-tally.ts` once per historical
`run-<id>/results.json` still available on S3, oldest first, chaining
`--history`/`--out` to the same file each time, then `aws s3 cp` the result
to `s3://kaleidos-qa-reports/flaky-history.json`.

## Possible Enhancements

- Cross-reference the `penpotqa` repository by extracting `qase([ids])` annotations from `.spec.js` files to distinguish between **tests marked as automated in Qase** and **tests actually implemented in Playwright**.
- Keep a historical archive of `decision-matrix.csv` snapshots to visualize coverage trends over time, rather than only the current state.
- Walk every test (not just failures) in `results.json` to compute a real flake **rate** per Qase ID, not just raw occurrence counts.

## Data Quality Notes

Both pipeline implementations **deduplicate Qase entities by ID**. This is necessary because of two real-world scenarios:

1. **Pagination drift:** If entities are created or deleted while the API is being paginated, offsets can shift, causing the same entity to appear more than once.
2. **Duplicate rows in Qase CSV exports:** The CSV export generated by the Qase UI may contain duplicate rows. In one real export, 200 duplicated rows were detected (889 rows exported, but only 689 unique test cases).
