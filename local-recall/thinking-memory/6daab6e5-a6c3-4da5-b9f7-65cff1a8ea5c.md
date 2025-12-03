---
id: 6daab6e5-a6c3-4da5-b9f7-65cff1a8ea5c
subject: >-
  I see there are old functions that are now unused: -
  `generateSubject(category: string, content:...
applies_to: global
occurred_at: '2025-11-29T21:22:34.555Z'
content_hash: 75bf141de56ef62f
---
## Thought

I see there are old functions that are now unused:
- `generateSubject(category: string, content: string)` - the old one with category prefix
- `generateKeywords(category: string, content: string)` - the old category-based keywords
- `extractContextAroundMatch` - no longer needed since we store full messagesI need to remove these. Also I have a naming conflict - I created a new `generateSubject(content: string)` function but there's still the old `generateSubject(category: string, content: string)`. Let me remove the old unused functions.

## Output

I need to remove the old unused functions. There's also a naming conflict with `generateSubject`:
