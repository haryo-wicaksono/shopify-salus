## ADDED Requirements

### Requirement: Streamed assistant responses SHALL initialize from empty text
The Shopify chat widget SHALL initialize any assistant streaming text accumulator to empty text before token concatenation begins. Pre-creating an assistant message bubble SHALL NOT cause placeholder values from internal state to appear in rendered output.

#### Scenario: Assistant bubble is created before the first token arrives
- **WHEN** the widget enters bot streaming mode and creates the assistant message node before receiving any token
- **THEN** the backing assistant text state SHALL be empty text
- **AND** the rendered assistant bubble SHALL appear blank until token content is received

#### Scenario: First token is appended to a new assistant response
- **WHEN** the first streamed assistant token is appended
- **THEN** the rendered assistant message SHALL begin with that token's content
- **AND** the rendered assistant message SHALL NOT begin with `null`
- **AND** the rendered assistant message SHALL NOT begin with `undefined`

### Requirement: Streamed token updates SHALL preserve valid assistant text rendering
The Shopify chat widget SHALL append streamed token content onto the current assistant response without exposing malformed intermediate values, while preserving existing typing, streaming, and error states.

#### Scenario: Empty or missing token content is received
- **WHEN** a stream event contains an empty or missing token payload
- **THEN** the widget SHALL append empty text rather than a placeholder value
- **AND** the existing assistant response text SHALL remain unchanged

#### Scenario: Stream completes after multiple token events
- **WHEN** multiple assistant token events are received and rendered in sequence
- **THEN** the final assistant bubble SHALL equal the ordered concatenation of the token contents
- **AND** no internal placeholder value SHALL appear anywhere in the rendered assistant text
