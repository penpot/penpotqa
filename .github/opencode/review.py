"""Helpers for the OpenCode review workflow (opencode-agent.yml).

prompt  <diff> <annotated-out> <lines-out>
    Writes the diff with the new-file line number in front of every line that can
    get an inline comment, and a JSON map {path: [commentable lines]}.

payload <answer> <lines> <head-sha> <header> <review-out>
    Turns the model's JSON answer into a GitHub review payload. Findings on lines
    outside the diff go to the review body instead, because a single invalid line
    makes GitHub reject the whole review.
"""

import json
import re
import sys

HUNK = re.compile(r"^@@ -\d+(?:,\d+)? \+(\d+)(?:,\d+)? @@")
NO_FINDINGS = "No issues found against the team skills."


def annotate(diff_path, annotated_path, lines_path):
    lines, out, path, new_line = {}, [], None, 0
    with open(diff_path, encoding="utf-8", errors="replace") as diff:
        for raw in diff:
            line = raw.rstrip("\n")
            if line.startswith("diff --git"):
                path = None
            elif line.startswith("+++ "):
                path = line[6:] if line.startswith("+++ b/") else None
                if path:
                    out.append(f"\n### {path}")
            elif path is None or line.startswith("--- "):
                continue
            elif match := HUNK.match(line):
                new_line = int(match.group(1))
                out.append(line)
            elif line.startswith(("+", " ")):
                lines.setdefault(path, []).append(new_line)
                out.append(f"{new_line:>5} {line}")
                new_line += 1
            elif line.startswith("-"):
                out.append(f"      {line}")
    with open(annotated_path, "w", encoding="utf-8") as annotated:
        annotated.write("\n".join(out) + "\n")
    with open(lines_path, "w", encoding="utf-8") as lines_file:
        json.dump(lines, lines_file)


def parse_answer(answer_path):
    with open(answer_path, encoding="utf-8") as answer:
        text = answer.read().strip()
    # Some models wrap the JSON in a Markdown code fence.
    text = re.sub(r"^```(?:json)?\s*|\s*```$", "", text)
    data = json.loads(text)
    findings = data.get("findings", [])
    if not isinstance(findings, list):
        raise ValueError("findings must be a list")
    return findings


def comment_body(finding):
    body = f"**{finding.get('skill', 'team skill')}** — {finding.get('reason', '').strip()}"
    suggestion = finding.get("suggestion")
    if isinstance(suggestion, str) and suggestion.strip():
        body += f"\n\n```suggestion\n{suggestion.rstrip()}\n```"
    return body


def payload(answer_path, lines_path, head, header, review_path):
    with open(lines_path, encoding="utf-8") as lines_file:
        commentable = {path: set(lines) for path, lines in json.load(lines_file).items()}
    comments, outside = [], []
    for finding in parse_answer(answer_path):
        path, line = finding.get("path"), finding.get("line")
        start = finding.get("start_line")
        valid = (
            isinstance(line, int)
            and line in commentable.get(path, set())
            and (start is None or (isinstance(start, int) and start < line
                                   and start in commentable[path]))
        )
        if not valid:
            outside.append(f"- `{path}:{line}` {comment_body(finding)}")
            continue
        comment = {"path": path, "line": line, "side": "RIGHT", "body": comment_body(finding)}
        if start is not None:
            comment.update(start_line=start, start_side="RIGHT")
        comments.append(comment)

    body = [header, ""]
    if not comments and not outside:
        body.append(NO_FINDINGS)
    else:
        body.append(f"{len(comments) + len(outside)} finding(s) against the team skills.")
    if outside:
        body += ["", "Findings outside the diff lines:", *outside]
    review = {"commit_id": head, "event": "COMMENT", "body": "\n".join(body),
              "comments": comments}
    with open(review_path, "w", encoding="utf-8") as review_file:
        json.dump(review, review_file)


if __name__ == "__main__":
    command, *args = sys.argv[1:]
    {"prompt": annotate, "payload": payload}[command](*args)
