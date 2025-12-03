---
id: fa816a37-87ae-4df0-bc0d-cef5e6f51e4a
subject: >-
  I can see that "sausages" and "stew" keywords ARE in the index, with memory
  IDs. The issue must be...
applies_to: global
occurred_at: '2025-11-29T22:34:53.676Z'
content_hash: ccac728a3af34798
---
## Thought

I can see that "sausages" and "stew" keywords ARE in the index, with memory IDs. The issue must be with how `searchByKeywords` works - let me check the search. The log shows that a search for "sausages stew" returned 0 results, but there are clearly memories with those keywords.Looking at the `searchByKeywords` method in search.ts, I see it uses Fuse.js for fuzzy matching. The issue might be that the fuzzy threshold is set too high - the keywords need to exactly match. Let me check the fuzzy threshold and test with a lower threshold. Actually, in the search code:

```typescript
const fuse = new Fuse(allKeywords, {
  threshold: 1 - threshold, // Fuse uses 0 = exact, 1 = match anything
  includeScore: true,
});
```

If `threshold` from config is 0.6 (60% match), then `1 - 0.6 = 0.4` is passed to Fuse. In Fuse.js, lower threshold means stricter matching (0 = exact, 1 = anything). So a threshold of 0.4 should match "sausages" exactly.

Wait, but the keywords should be exact matches in this case. Let me trace through what's happening...

Actually, the issue might be that when I run the test with `cwd` pointing to the local-recall project itself, it's looking in `/Users/joe/Code/Syntessera/local-recall/local-recall` for the memories, which is where they are. And the index does have "sausages" as a keyword...

Let me look more closely at the search code again. The issue might be in how the results are processed. Let me also check if the config is being loaded properly.

Let me run a simpler test to see what's happening.

## Output

Interesting - the index has "sausages" and "stew" keywords. The search should find them. Let me debug further:
