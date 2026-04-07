## 1. Fix Assistant Stream Initialization

- [x] 1.1 Update `assets/widget.js` so the assistant streaming text buffer is initialized to empty text before any token concatenation occurs.
- [x] 1.2 Keep the existing assistant bubble creation and typing-indicator flow intact while ensuring empty or missing token content appends as empty text.

## 2. Validate Storefront Rendering

- [x] 2.1 Manually verify in the Shopify theme preview that a new assistant response never begins with `null` or `undefined`.
- [x] 2.2 Confirm the assistant bubble still streams normally across first token, multi-token, and error cases.
