---
id: b293bba4-6dad-42bd-bee9-dcdcae669a1d
subject: >-
  Now I understand. Looking at the hook code: 1. It extracts keywords from the
  prompt (line 86) 2....
applies_to: global
occurred_at: '2025-11-29T22:58:58.372Z'
content_hash: b025a742117e1f5a
---
## Thought

Now I understand. Looking at the hook code:

1. It extracts keywords from the prompt (line 86)
2. Searches for matching memories (lines 95-99)
3. If results are found, it outputs them to stdout (lines 109-120)
4. If NO results, it just exits with `process.exit(0)` (lines 101-104)

The problem is:
- When the hook runs and finds NO matches, it exits cleanly without outputting anything
- The "Success" message I'm seeing is likely from Claude Code's hook system indicating the hook ran successfully - not the hook's own output

So the hook IS running, but:
1. Either no memories match the keywords extracted from "stew"-related prompts
2. Or there's an issue with the search/index

Let me check the logs to see what's happening - or better, let me check if there's a memory with "stew" as an actual keyword. When we listed memories earlier, the one about stew had keywords: "search", "memory", "user", "conversations", "sausages" - notably NOT "stew"!

So the flow is:
1. User asks about stew
2. Hook extracts "stew" as a keyword
3. Hook searches for memories with "stew" keyword
4. No memories have "stew" as a keyword (the one mentioning stew only has "sausages" as a keyword)
5. Hook exits with no output
6. Claude Code shows "Success" because the hook ran without error

The user should create a memory with "stew" as an actual keyword for it to be found.

I should explain this to the user.

## Output

Now I see the issue. Looking at the hook code:

**The flow:**
1. Hook extracts keywords from your prompt (line 86)
2. Searches for matching memories (line 99)
3. If results found → outputs to stdout (lines 109-120)
4. If NO results → just `process.exit(0)` with no output (lines 101-104)

**The problem:** The "Success" message I'm seeing is from Claude Code confirming the hook *ran* without error - it's not the hook's output. When the hook finds no matches, it outputs nothing.

**Why no matches for "stew"?** Looking at that earlier memory:
```
id: 4c4aac06-e155-4a68-b3d7-28429e0ede60
keywords: ["search", "memory", "user", "conversations", "sausages"]
```

The word "stew" isn't actually a keyword in any memory - it's only mentioned in the content. The search is keyword-based, not full-text.

**To verify**, you could check the log file:
