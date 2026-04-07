## Why

The Shopify chat widget can render a literal `null` prefix at the start of assistant responses during streaming. This is a visible customer-facing defect in the storefront chat experience and creates an inconsistency with the working Next.js frontend used elsewhere in the Salus stack.

## What Changes

- Define the expected rendering behavior for streamed assistant responses in the Shopify chat widget.
- Ensure the widget initializes and updates assistant message buffers without surfacing placeholder values such as `null`.
- Preserve current typing, streaming, and error states while preventing malformed assistant message text from appearing in the UI.

## Capabilities

### New Capabilities
- `chat-widget-stream-rendering`: Defines how the Shopify storefront chat widget must initialize, accumulate, and display streamed assistant responses.

### Modified Capabilities

## Impact

- Affected code: `assets/widget.js`
- Affected behavior: storefront AI chat widget message rendering during streaming
- No API contract changes are expected
- No new dependencies are expected
