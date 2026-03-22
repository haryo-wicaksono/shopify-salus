# Shopify Theme: Enterprise (Customized)

This project is a highly customized Shopify theme based on the **Enterprise** theme by Clean Canvas (v1.5.2). It is designed for large-scale e-commerce stores, utilizing a modular architecture with Liquid templates, Web Components-based JavaScript, and specialized integrations for product options and metafields.

## Project Overview

*   **Platform:** Shopify Online Store 2.0
*   **Base Theme:** Enterprise by Clean Canvas
*   **Core Technologies:** Liquid, JSON (Templates/Config), JavaScript (ES6+), CSS
*   **Key Libraries:**
    *   **Swiper & Slick:** For carousels and sliders.
    *   **jQuery (v3.6.0):** Used selectively for legacy or specific plugin support.
    *   **Affirm:** Financing/Payment messaging integration.
    *   **LiveChat:** Customer support integration.
    *   **Google Fonts:** Poppins (primary font).
*   **Custom Integrations:**
    *   **Globo Product Options:** Advanced product customization and option management.
    *   **Metafields Guru:** Comprehensive system for rendering technical specifications and comparison features.
    *   **Intelligems:** (Found in codebase, potentially used for A/B testing or pricing optimization).
*   **Modern Documentation Assistants:**
    *   **Context7 MCP:** Managed via Upstash, provides real-time library documentation and code snippets for Liquid, Swiper, and Shopify CLI.
    *   **Context-Mode MCP:** Local indexing and analysis server for managing large-scale documentation and codebase context.


## Building and Running

This project uses the **Shopify CLI** for development and deployment.

### Development Commands

*   **Serve Locally:**
    ```bash
    shopify theme dev --store <store-name>.myshopify.com
    ```
    Starts a local development server with hot reloading. Use `--theme-editor-sync` to see changes from the online editor reflected locally.
*   **Push to Theme:**
    ```bash
    shopify theme push --theme <id>
    ```
    Pushes local changes to a specific theme ID. Use `--unpublished` to create a new theme or `--ignore "config/settings_data.json"` to prevent overwriting settings.
*   **Pull from Theme:**
    ```bash
    shopify theme pull --theme <id> --live
    ```
    Pulls the latest changes from the remote theme. Use meticulously for syncing theme editor updates.
*   **Login & Authentication:**
    ```bash
    shopify login --store <store-url>
    shopify logout
    ```

## Project Structure

*   `assets/`: Contains all static assets (CSS, JS, images). Key custom logic is often added to `custom.js` or `script.js`.
*   `config/`: Theme settings schema (`settings_schema.json`) and store data (`settings_data.json`).
*   `layout/`: Top-level layout files, primarily `theme.liquid`.
*   `sections/`: Reusable, customizable blocks. Custom sections (e.g., `abx-gallery-dynamic.liquid`) are located here.
*   `snippets/`: Small, reusable Liquid partials.
*   `templates/`: JSON and Liquid templates for specific page types (products, collections, etc.).
*   `docs/`: Extensive project-specific documentation:
    *   `architecture.md`: Detailed technical overview.
    *   `development.md`: Workflow and best practices.
    *   `metafields-guru.md`: Guide for the specification and comparison system.
    *   `globo-product-options.md`: Guide for Globo integration.

## Development Conventions

### JavaScript (Web Components & Events)
The theme follows a "code splitting" architecture and utilizes **Web Components**. It broadcasts many custom events for extensibility:
*   `on:variant:change`: Fires when a product variant is switched.
*   `on:cart:add`: Fires when an item is added to the cart.
*   `on:line-item:change`: Fires when cart quantities are updated.
*   `dispatch:cart-drawer:open`: Trigger this to open the cart drawer.

Custom JS should ideally be added to `assets/custom.js` or through modular scripts in `assets/`.

### Styling
*   **Modular CSS:** Prefer component-specific CSS files (e.g., `product-card.css`) over large monolithic files.
*   **Custom CSS:** Primary custom overrides are located in `assets/custom.css`.
*   **Variables:** Global styles are driven by CSS variables defined in `layout/theme.liquid` based on theme settings.

### Liquid & Shopify 2.0
*   All new pages should use JSON templates where possible to allow section reordering in the Shopify Editor.
*   Use `data-attributes` for binding JS behavior to Liquid elements.
*   Keep section settings minimal and rely on global theme settings for consistency.

## Modern Development Workflows (MCP)

This project is optimized for AI-assisted development using **Model Context Protocol (MCP)**. These tools enhance the development experience by providing context-aware documentation and code analysis.

### Context7 (Documentation Server)
Use Context7 to retrieve up-to-date documentation for any library used in the theme.
*   **Usage:** Query for API references (e.g., `Liquid filters`, `Swiper.js API`) directly through the agent.
*   **Configuration:** Managed via `~/.gemini/antigravity/mcp_config.json` with an Upstash API key.

### Context-Mode (Indexing Server)
Context-Mode manages large-scale context by indexing documentation and codebase files.
*   **Tools:**
    *   `ctx_index`: Index larger files or search results for fast retrieval.
    *   `ctx_search`: Search across indexed data to find specific implementation patterns.
    *   `ctx_execute`: Run code in a sandboxed environment to process data or test logic.

## Key Custom Features

1.  **Product Sidebar (Questions Box):** A custom sticky sidebar on product pages (defined in `sections/main-product.liquid`) that provides quick access to chat, email, and "Add to Cart", morphing into a sticky footer on mobile.
2.  **Metafield Specifications:** Leverages Metafields Guru to render detailed product data in accordions and comparison grids.
3.  **Custom Carousels:** Extensive use of Swiper.js for product galleries, testimonials, and blog sliders. Modern components utilize Swiper's Web Components (`swiper-container`) where possible.
4.  **Product Redirects:** Hardcoded redirects in `theme.liquid` for specific product paths to the `/collections/all` page.

