# Qase V2 CSV import format

The format the team's original Claude.ai prompt produced. Every rule below
exists because breaking it made Qase reject the file ("Invalid file
structure") or show stray quote marks, so follow it exactly.

## Import mode

The first column is `v2.id`, so the file must be imported with Source Type =
**Qase.io** (current V2 format), not "Qase.io CSV [deprecated]" (V1). With V1,
the step quote-encoding shows up as literal quote marks.

## Columns, in order

```
v2.id,title,description,preconditions,postconditions,steps_type,steps_actions,steps_result,steps_data,priority,severity,type,layer,behavior,automation_status,status,is_flaky
```

Headers are lowercase and never quoted. Output only raw CSV, starting with
the header row, one test case per row.

## Quoting

- Quote only text fields that contain newlines, commas or special characters.
- `preconditions` and `postconditions` are always quoted, even when empty
  (`""`) or a single bullet.
- Inside a quoted field, escape a double quote by doubling it (`""`).
- Enum fields — `steps_type`, `priority`, `severity`, `type`, `layer`,
  `behavior`, `automation_status`, `status`, `is_flaky` — are never quoted.
- Values are lowercase, except proper nouns and the text fields `title`,
  `description`, `preconditions`, `postconditions`, `steps_actions`,
  `steps_result`, `steps_data`.

## Fields

- **v2.id**: empty, unquoted. Qase fills it.
- **title**: quoted.
- **description**: quoted.
- **preconditions**: markdown bullets, one per real line starting with `* `;
  never a single comma-separated sentence. Plain CSV quoting — bullets are not
  individually wrapped in `""`. Empty → `""`.
- **postconditions**: same format as preconditions; `""` unless there is real
  cleanup or state to restore.
- **steps_type**: `classic`.
- **steps_actions**: Qase's step encoding. Each step's text is wrapped in a
  doubled-quote pair (Qase's step boundary marker), each numbered step is on
  its own real line, and there is a trailing newline after the last step.
  The whole field is CSV-quoted. With `\n` standing for a real newline:
  `"1. ""action 1""\n2. ""action 2""\n"`
- **steps_result**: same encoding, one result per step number.
  `"1. ""result 1""\n2. ""result 2""\n"`
- **steps_data**: one empty quoted entry per step, matching the step count
  exactly. Never leave it blank when steps exist — a mismatch triggers
  "Invalid file structure". For 3 steps: `"1. """"\n2. """"\n3. """"\n"`
- **priority** `high`, `medium` or `low` as agreed in the preview,
  **severity** `undefined`, **type** `regression` or `nonregression` as
  agreed, **layer** `e2e` or `api`, **behavior** `positive` or `negative`,
  **automation_status** `to-be-automated` or `is-not-automated` as agreed,
  **status** `actual`, **is_flaky** `no`. Is smoke is a custom field and
  isn't in the CSV: set it in Qase after the import, together with To be
  reviewed.

## No double quotes inside step text

The `""` pair around each step is the step boundary. Any extra `""` inside a
step's text breaks the parser. Quote specific names with single quotes
instead: write `Click the 'Montserrat' item`, not
`Click the ""Montserrat"" item`, and `displays 1 minute ago`, not
`displays ""1 minute ago""`. This applies only to `steps_actions` and
`steps_result`; title, description, preconditions and postconditions use
normal CSV quoting and may contain quoted words.

## Example row

Shown with real newlines inside the multi-line fields:

```
v2.id,title,description,preconditions,postconditions,steps_type,steps_actions,steps_result,steps_data,priority,severity,type,layer,behavior,automation_status,status,is_flaky
,"Draw a line using the toolbar Line tool with press-and-drag","Verify that a user can draw a line by selecting the Line tool from the toolbar and performing a single press-and-drag gesture.","* User is logged in to Penpot
* User has an open project with an empty canvas","",classic,"1. ""Open a Penpot project and go to the workspace canvas.""
2. ""Click the Line tool icon in the toolbar.""
3. ""Press and drag from a starting point to an ending point on the canvas, then release.""
","1. ""Workspace canvas is displayed with the toolbar visible.""
2. ""The Line tool is activated and highlighted in the toolbar.""
3. ""A straight line shape is drawn between the start and end points in a single gesture.""
","1. """"
2. """"
3. """"
",undefined,undefined,nonregression,e2e,positive,is-not-automated,actual,no
```

## Self-check before handing the file over

Parse it with Python's `csv` module and confirm, for every row: 17 columns,
`v2.id` empty, and the same step count in `steps_actions`, `steps_result` and
`steps_data`.
