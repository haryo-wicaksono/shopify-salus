## Context

The Shopify storefront chat widget in `assets/widget.js` renders assistant responses by creating an assistant message node and incrementally appending streamed token content into an in-memory accumulator. Today that accumulator can remain `null` when the assistant bubble is created before the first token arrives, which allows JavaScript string coercion to surface a literal `null` prefix in the rendered message. The backend stream contract is not changing; this is a frontend rendering defect localized to the widget asset.

## Goals / Non-Goals

**Goals:**
- Ensure streamed assistant messages always start from an empty text state.
- Prevent `null`, `undefined`, or other internal placeholder values from appearing in the assistant bubble.
- Preserve the existing widget streaming flow, including typing indicators, optimistic user messages, and error rendering.

**Non-Goals:**
- Changing the chat streaming API or SSE payload format.
- Redesigning the widget UI or altering handoff/session behavior.
- Refactoring unrelated widget state management outside the assistant streaming path.

## Decisions

### Initialize assistant stream state as empty text
The assistant stream accumulator will be treated as an empty string before any token append operation. This removes the coercion path that currently turns `null + token` into a rendered `"null..."` string.

Alternative considered:
- Lazily sanitize only during DOM rendering. Rejected because it masks the state bug instead of fixing the source of the malformed stream state.

### Keep the existing streaming interaction model
The widget will continue to create the assistant message node up front when bot streaming starts, then update that node as tokens arrive. This keeps typing and streaming behavior stable while fixing the initialization bug in the smallest possible surface area.

Alternative considered:
- Delay assistant bubble creation until the first token arrives. Rejected because it would change visible widget behavior and may interact with existing typing indicator timing.

### Preserve defensive token appending
Token handling will continue to tolerate missing token content by falling back to empty text during concatenation. This matches the working Next.js frontend behavior and avoids introducing regressions for partial or empty token events.

## Risks / Trade-offs

- [Small divergence between stored state and rendered state remains possible if future stream paths bypass the helper] → Mitigation: keep assistant buffer initialization and token concatenation in the same rendering path.
- [A future refactor could reintroduce placeholder values with a different sentinel than `null`] → Mitigation: make the spec explicit that rendered assistant output must begin from empty text and must not expose internal placeholders.

## Migration Plan

Update `assets/widget.js`, validate streamed assistant replies in the Shopify theme preview, and publish through the normal theme deployment flow. Rollback is straightforward by restoring the prior widget asset if unexpected rendering regressions appear.

## Open Questions

No open questions at this stage.
