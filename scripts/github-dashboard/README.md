# Penpot GitHub QA Dashboard — Automated Test Coverage vs. Real Bugs

Regenerates the analysis CSV files and the HTML dashboard (`out/penpot-qa-dashboard.html`) with a single command, using the canonical data sources below.

| Source                                                      | Access                                | Purpose                                                               |
| ----------------------------------------------------------- | ------------------------------------- | --------------------------------------------------------------------- |
| Qase `/v1/suite/PENPOT`                                     | REST API, paginated in batches of 100 | Suite hierarchy and complete test inventory (`cases_count`)           |
| Qase `/v1/case/PENPOT?type=regression&automation=automated` | REST API, paginated in batches of 100 | Regression test cases and automation status                           |
| GitHub Project v2 #8 (penpot organization)                  | GraphQL                               | Issues with Type (Bug/Feature/Enhancement), Status, labels, and dates |

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

## Possible Enhancements

- Cross-reference the `penpotqa` repository by extracting `qase([ids])` annotations from `.spec.js` files to distinguish between **tests marked as automated in Qase** and **tests actually implemented in Playwright**.
- Keep a historical archive of `decision-matrix.csv` snapshots to visualize coverage trends over time, rather than only the current state.

## Data Quality Notes

Both pipeline implementations **deduplicate Qase entities by ID**. This is necessary because of two real-world scenarios:

1. **Pagination drift:** If entities are created or deleted while the API is being paginated, offsets can shift, causing the same entity to appear more than once.
2. **Duplicate rows in Qase CSV exports:** The CSV export generated by the Qase UI may contain duplicate rows. In one real export, 200 duplicated rows were detected (889 rows exported, but only 689 unique test cases).
