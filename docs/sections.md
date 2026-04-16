## Sections and Snippets Overview

This is a non-exhaustive map of key sections/snippets to help navigate the theme.

### High-impact Sections
- `sections/header.liquid`: Navigation, mega menus, promos, localization.
- `sections/main-product.liquid`: PDP layout, media gallery, buy box, badges.
- `sections/main-collection-products.liquid`: Collection grid, filters, sorting.
- `sections/slideshow.liquid` and `navigation-slideshow.liquid`: Hero/media carousels.
- `sections/featured-product.liquid`, `featured-collection.liquid`: Merchandising.
- `sections/testimonials.liquid`, `promo-grid.liquid`, `rich-text.liquid`: Content blocks.

### Product Experience
- Snippets: `product-media.liquid`, `price.liquid`, `variant-picker.liquid`, `product-inventory.liquid`.
- JS: `variant-picker.js`, `product-form.js`, `media-gallery.js`, `cart-items.js`.

### Search and Navigation
- Sections: `predictive-search.liquid`.
- Snippets: `predictive-search-tab-panel.liquid`, `predictive-search-tab-button.liquid`, `mobile-desktop-nav.liquid`.
- JS: `predictive-search.js`, `search-form.js`, `quick-nav.js`.
- Header navigation note: `sections/header.liquid` owns both the desktop Gemini mega menu and the mobile pane-stack drawer. The mobile Gemini drawer is emitted as a sibling stack container inside `<main-menu>`, while the legacy `section.settings.menu` list remains the fallback when no `desktop_nav_item` blocks are configured.

### Cart and Checkout UX
- Sections: `main-cart.liquid`.
- Snippets: `cart-items.liquid`.
- JS/CSS: `cart-items.js`, `cart-items.css`, `sticky-atc-panel.js`.

### Utilities
- Snippets: `icon.liquid` and many `icon-*.liquid` variants, `price-as-money.liquid`.
- Assets: `instant-page.js`, `side-drawer.js`, `modal.js`.

### Stylesheets
- Global: `assets/main.css`, `assets/responsive.css`.
- Feature: `product.css`, `media-gallery.css`, `price-range.css`, etc.
