# Qase notes for PENPOT

What the Qase MCP returns and accepts in the PENPOT project, found by trial
and error (November 2026). Read it before the first search or write of a run;
it saves the failed calls. If something here stops matching what Qase
returns, trust Qase and fix this file.

## Enum values

Searches and `qase_get` return enums as numbers. Writes accept the number or
the label, but the labels aren't always obvious, so prefer the number.

| Field      | Values                                                            |
| ---------- | ----------------------------------------------------------------- |
| type       | 3 = Regression, 12 = Non-regression                               |
| behavior   | 1 = Not set, 2 = Positive, 3 = Negative (many older cases have 1) |
| automation | 0 = Not automated, 1 = To be automated, 2 = Automated             |
| priority   | 0 = Not set, 1 = High, 2 = Medium, 3 = Low                        |
| status     | 0 = Actual; Draft and Deprecated not confirmed yet (use labels)   |
| layer      | 1 = E2E                                                           |
| severity   | 0 = Not set                                                       |

To confirm one, group by it on a filter you know, e.g.
`SELECT (behavior, COUNT(id)) entity = "case" and project = "PENPOT" and (behavior = "positive" or behavior = "negative") GROUP BY behavior`.

## Custom fields

IDs are stable but look them up by title in `qase_project_context` anyway.

| Field (ID)            | Type        | Format in a write (`custom_field`)                                |
| --------------------- | ----------- | ----------------------------------------------------------------- |
| Penpot Release (2)    | multiselect | option IDs joined by commas: `"12,18"` (2.14 + 2.20)              |
| Is smoke (6)          | selectbox   | `"1"` = Yes, `"2"` = No (required)                                |
| Revision reason (9)   | multiselect | option IDs joined by commas                                       |
| To be reviewed (10)   | checkbox    | `"1"` = ticked                                                    |
| Revision comment (13) | string      | plain text                                                        |
| Test File (16)        | text        | `[<file name>](<url>)`; `"None"` is how many cases mark "no file" |

Penpot Release options so far: 2.4 = 1, 2.5 = 3 … 2.19 = 17, 2.20 = 18,
future release = 2 (read the full list from `qase_project_context`).

A read returns a multiselect as **one entry per value** (`{"id": 2, "value":
"12"}, {"id": 2, "value": "18"}`); join them with commas to write them back.

## Writing cases

- `qase_case_upsert` with `id` **replaces the whole step list**. Send every
  step, unchanged ones included; each step gets a new internal hash, which
  only matters for results recorded against old steps.
- Fields you leave out of an update kept their value (seen with description
  and preconditions). Whether leaving out a custom field keeps it hasn't been
  tested, so always send the case's other custom fields unchanged.
- After every write, read the case back and compare it with the backup.

## QQL limits

- Cases have no `steps` attribute: you can't search step text. Search
  `title`, `description` or `preconditions` instead.
- Custom fields can't go inside aggregate functions (`FIRST(cf[...])`), but
  they work in `GROUP BY` and in the filter:
  `SELECT (cf["Test File"], COUNT(id)) ... GROUP BY cf["Test File"]`.
- There's no `suite` entity: list suites with `qase_project_context`
  (`full: true` for more than 100).
- Checkbox and select values compare by their stored value, not the label,
  so `cf["To be reviewed"] = "Yes"` finds nothing; use `is not empty` and
  read the values.
- Plain case searches return every step of every case; prefer aggregate
  queries (`SELECT (id, FIRST(title), FIRST(type), FIRST(automation)) ...
GROUP BY id`).

## Backups

The tool output can't be piped into a file, so a backup is written by
copying the `qase_get` JSON into the scratchpad. To avoid copying mistakes,
derive later backups from earlier ones with a script when you know exactly
what changed, and check any backup against a fresh `qase_get` (at least
`updated_at` and the fields you're about to change) before relying on it.
