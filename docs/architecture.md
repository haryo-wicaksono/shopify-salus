## Architecture Overview

This theme follows Shopify Online Store 2.0 conventions and extends the Enterprise theme by Clean Canvas.

### Key Folders
- `layout/`: Global wrappers and HTML shell.
- `sections/`: Modular, customizable blocks that can be assigned to templates.
- `snippets/`: Reusable partials used by sections/templates.
- `assets/`: Static assets (CSS, JS, images, SVGs).
- `templates/`: Route-level templates (JSON/Liquid) composing sections.
- `config/`: Theme settings schema and store-specific settings data.
- `locales/`: Translation files for theme text.

### Entry Points
- `layout/theme.liquid`: Global layout, header/footer, script/style includes.
- `sections/header.liquid`: Complex navigation and header logic.
- `sections/main-product.liquid`: Product PDP composition and dynamic features.

### JavaScript
- `assets/main.js`: Core behavior and utilities.
- Feature scripts: `variant-picker.js`, `product-form.js`, `predictive-search.js`, `cart-items.js`, etc.

### Styles
- `assets/main.css`, `responsive.css`, component styles like `product.css`, `cart-items.css`.

### Configuration
- `config/settings_schema.json`: Defines theme settings and editor controls.
- `config/settings_data.json`: Store-specific values for settings.

### Conventions
- Prefer snippets for repeated UI.
- Keep section settings minimal and use presets where possible.
- Use data attributes to bind JS behavior.

## Theme Structure and Dependencies

This theme uses an exhaustive 8-layer dependency mapping system to track relationships between templates, sections, snippets, assets, theme settings, and Shopify data objects.

For a visual representation of the theme's architecture, see [docs/THEME-STRUCTURE.md](THEME-STRUCTURE.md).

### Dependency Layers
1. **Structural:** JSON Templates and Section Groups.
2. **Liquid:** Tags like `{% render %}`, `{% include %}`, and `{% section %}`.
3. **Assets:** `asset_url` references and `<script>/<link>` tags.
4. **Web Components:** HTML custom elements mapped to their JS source.
5. **Dynamic AJAX:** Section and snippet fetches in JS.
6. **Conditional:** Dependencies wrapped in `{% if %}` logic.
7. **Data & App Coupling:** Dependencies on Collection handles and Metafields.
8. **State Persistence:** `localStorage` and `sessionStorage` key mapping.

To refresh the dependency manifest and visualization, run:
```bash
npm run theme:audit
```

