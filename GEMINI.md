# GEMINI.md - Shopify Salus Theme

## Project Overview
This project is a customized Shopify theme for Salus, based on the **Enterprise** theme (v1.5.2) by Clean Canvas. It follows the **Shopify Online Store 2.0** (OS 2.0) architecture, utilizing JSON templates and modular sections.

- **Main Technologies:** Liquid (templating), JavaScript (ES6+), CSS, JSON (configuration and templates).
- **Core Architecture:** Standard Shopify theme structure (`layout/`, `sections/`, `snippets/`, `assets/`, `config/`, `locales/`, `templates/`).
- **Key Integrations:**
  - **Globo Product Options:** Custom product options and variants.
  - **Metafields Guru:** Advanced product specifications and comparison logic.

## Building and Running
Development is managed using the **Shopify CLI**.

### Key Commands
- **Authenticate:** `shopify login --store salus-uk.myshopify.com`
- **Local Development:** `shopify theme dev` (Starts a local development server with hot-reloading).
- **Deploy Changes:** `shopify theme push --unpublished` (Pushes changes to a new theme on the store).
- **Download Theme:** `shopify theme pull --theme <theme-id>` (Pulls the latest theme version from Shopify).

## Development Conventions

### Coding Style
- **Liquid:** Use OS 2.0 best practices. Prefer `sections` for main page components and `snippets` for reusable UI fragments (icons, buttons, product cards).
- **CSS:** Component-based CSS is preferred. Smaller, specific CSS files are stored in `assets/` and included as needed (e.g., `product.css`, `cart-items.css`, `media-gallery.css`).
- **JavaScript:**
  - Use data attributes for binding behavior to DOM elements.
  - Scripts are modularized in `assets/` (e.g., `variant-picker.js`, `cart-drawer.js`, `predictive-search.js`).
  - Core utilities and global behaviors are in `assets/main.js`.
- **Theme Editor:** Ensure all new sections and blocks are configurable via `settings_schema.json` and follow the theme's aesthetic.

### Testing Practices
- **Manual Verification:** Test changes in the theme editor and across different devices/browsers.
- **Preview Themes:** Always use unpublished preview themes for staging features before merging into the main branch.

## Directory Structure
- `assets/`: Contains all CSS, JS, and image assets.
- `config/`: Theme settings schema (`settings_schema.json`) and store configuration.
- `docs/`: Comprehensive documentation for architecture, development workflow, and specific app integrations.
- `layout/`: Global wrappers (e.g., `theme.liquid`).
- `sections/`: Reusable, modular blocks for building pages.
- `snippets/`: Small Liquid partials.
- `templates/`: JSON-based templates for different page types (product, collection, index, etc.).

## Key Files
- `layout/theme.liquid`: The main entry point for the theme's HTML structure.
- `assets/main.js` & `assets/main.css`: Core theme styling and logic.
- `config/settings_schema.json`: Defines the configuration options available in the Shopify Theme Editor.
- `docs/development.md`: Detailed setup and workflow instructions.
