# Classifying test cases: type, smoke, automation, priority

The team's conventions, used to classify every case in the preview. For a new
feature, decide each field case by case from the criteria below; don't fall
back to a default without checking them.

## Type: regression or non-regression

Most cases are (and will be) regression, because the regression plan is the
one run most often. Non-regression is for non-core functionality and corner
cases. A case can also be smoke at the same time (see below).

A case is **regression** when it is:

- the **main flow** of a main feature (email app: sending emails);
- a feature that contributes significantly to the user experience — the app
  could work without it, but the experience would be unsatisfactory (email
  app: filtering emails);
- a feature that adds little direct value for the end user but matters to
  keep code quality and **avoid technical debt** (email app: sending
  automation);
- a flow that has been **defective before** — it had bugs (email app:
  multiple sending).

Otherwise it is **non-regression** (the default when none of the above apply).

## Is smoke: yes or no

A smoke test checks that the main functions work and catches critical
failures early. Smoke cases are a small subset of the regression cases.

A case is **smoke** when it:

- checks a basic or critical functionality, or the main flow of a main
  feature (email app: sending emails);
- covers a flow that has been defective before (email app: multiple sending).

Otherwise **no**. Keep the set small: smoke is the quick check before a
release, not a second regression plan.

## Other types

The "Other types" custom field (Performance, Security, Accessibility) isn't
used yet. Leave it empty.

## Automation: to be automated or manual

Mark a case **to be automated** when it meets the criteria below, otherwise
leave it **manual** (not automated). Overall, automated cases should be about
30–40% of all scenarios: weigh the time saved against the cost of
maintaining the test.

Criteria that favour automating:

- **Business criticality**: business-critical or contributing to the user
  experience, covering the most common scenarios — not edge or corner cases.
- **Repetitive**: run repeatedly (regression cases are strong candidates).
- **Long to run manually**.

### User journey tiers

| Tier | Journey             | What it covers                                                         | Automation priority                                             |
| ---- | ------------------- | ---------------------------------------------------------------------- | --------------------------------------------------------------- |
| 1    | Access              | Registration, login, logout, password recovery                         | Must automate — blocks all other journeys                       |
| 2    | File management     | Create / open / rename / duplicate / delete project and file           | Must automate — daily core action for every user                |
| 3    | Design              | Draw shapes, set fill/stroke/opacity, use text tool, apply constraints | Must automate — the product's primary value                     |
| 4    | Components & Assets | Create component, edit main, propagate to copies, swap, libraries      | Must automate — high regression risk, complex logic             |
| 5    | Layout              | Flex and Grid layout creation and configuration via the design panel   | Must automate — recent feature, high regression risk            |
| 6    | Prototyping         | Add interactions, flows, preview                                       | Should automate — core differentiator but lower daily frequency |
| 7    | Collaboration       | Comments, multiplayer presence, shared edit                            | Do not automate — UX-dependent, multi-user complexity           |
| 8    | Export / Handoff    | Export SVG, PNG, PDF; inspect panel; developer view                    | Do not automate — requires external visual verification         |

### Failure impact scale

| Impact   | Definition                                          | Penpot examples                                                                    | Automate?                      |
| -------- | --------------------------------------------------- | ---------------------------------------------------------------------------------- | ------------------------------ |
| Critical | The user cannot complete their work; data loss risk | Cannot open file, save fails silently, component changes not persisted             | Yes — highest priority         |
| High     | Core feature broken; user must use a workaround     | Fill colour not applied, grid layout collapses, copy of component loses properties | Yes                            |
| Medium   | Feature degraded but usable                         | Panel input misaligned, keyboard shortcut inconsistent, tooltip missing            | Selective — only if repetitive |
| Low      | Cosmetic or rare edge case                          | Icon colour off by one shade, error message wording, uncommon negative path        | No — manual or exploratory     |

### Examples

| Test case                                           | Journey tier   | Impact   | Decision | Reason                                               |
| --------------------------------------------------- | -------------- | -------- | -------- | ---------------------------------------------------- |
| Log in with valid credentials                       | 1 — Access     | Critical | Automate | Blocks all other work                                |
| Create a project and open a new file                | 2 — File mgmt  | Critical | Automate | Daily first action                                   |
| Apply fill colour to a rectangle                    | 3 — Design     | High     | Automate | Core design action, high regression risk             |
| Edit main component — copies inherit shadow changes | 4 — Components | High     | Automate | Async propagation adds mild instability              |
| Add row to grid layout via design panel             | 5 — Layout     | High     | Automate | Panel input is stable; hover-handle variant excluded |
| Export element with non-visible drop shadow         | 8 — Export     | Medium   | Exclude  | Requires an external visual check outside Penpot     |
| Restore the password after account deleted          | 1 — Access     | Low      | Exclude  | Rare negative path; low business impact on failure   |
| Resize grid cell via hover handle                   | 5 — Layout     | Medium   | Exclude  | Pixel-hunting; same feature covered by panel input   |

### What to exclude

- **Third-party interactions**: file upload and sharing, cloud storage or
  external services complicate automation.
- **Multi-user and collaboration scenarios**: hard to automate and more about
  user experience — left for manual checking.
- **Export cases**: the result has to be checked outside Penpot, visually,
  before and after — manual.
- **Potential instability**: cases that need precise positioning or visual
  appearance of shapes, text or images. Moderately unstable cases are still
  taken (CI reruns failures twice), but overly unstable ones are excluded —
  for example pixel-hunting a hover handle when the same function is
  available as a panel input that is covered instead.

Reference cases in PENPOT: 1754 (export with a non-visible shadow — manual),
1747 (grid area via the resize-cell hover handle — excluded, the panel input
is covered), 489 (create path from the toolbar — unstable but automated),
1445 (main component shadow changes on copies — unstable but automated),
214 (restore password after account deleted — rare negative, excluded).

## Priority

The conventions above don't define priority. Until the team does, derive it
from the failure impact of what the case checks, and say so in the preview:

| Failure impact | Priority |
| -------------- | -------- |
| Critical, High | high     |
| Medium         | medium   |
| Low            | low      |
