## Storefront Management Guide

This guide documents what we actively manage on the storefront and exactly where to do it (Shopify Admin vs. theme code). Use this when making changes or handing off work.

### Global Header and Navigation
- What: Mega menus, promo pills, sidebar/mega columns, locale/currency, announcement bars.
- Where (Theme Editor): `sections/header.liquid`, `sections/announcement.liquid`.
- Where (Code): `sections/header.liquid`, assets: `navigation-*.css`, `quick-nav.js`.
- Tips: Keep menu handles consistent. Test hover/focus states and mobile collapse.

### Homepage & Landing Blocks
- What: Hero slides, promo strips, featured collections/products, testimonials, content blocks.
- Where (Theme Editor): `slideshow.liquid`, `promo-strip.liquid`, `featured-collection.liquid`, `featured-product.liquid`, `rich-text.liquid`, `promo-grid.liquid`, `testimonials.liquid`.
- Where (Code): `sections/` files above; styles in `assets/*slideshow*.css`, `promo-*.css`.

### Product Detail Page (PDP)
- What: Media gallery, variant selection, price, inventory, badges, sticky ATC, recommendations, FAQs/specs.
- Where (Theme Editor): `sections/main-product.liquid` settings and blocks; add blocks for specs/FAQs.
- Where (Code):
  - Sections: `main-product.liquid`, `product-details.liquid`, `product-specifications.liquid`, `product-faqs.liquid`, `product-recommendations.liquid`.
  - Snippets: `product-media.liquid`, `price.liquid`, `variant-picker.liquid`, `product-inventory.liquid`, `rating.liquid`.
  - JS: `variant-picker.js`, `product-form.js`, `media-gallery.js`, `sticky-atc-panel.js`, `product-recommendations.js`.
- Tips: Use metafields for product-specific content. Validate variant availability and URL-param syncing.

### Collections and Filtering
- What: Collection banners, product grids, facet filters, sorting, toolbar.
- Where (Theme Editor): `sections/main-collection-banner.liquid`, `main-collection-products.liquid`.
- Where (Code): `sections/main-collection-products.liquid`; snippets: `facet-filters.liquid`, `products-toolbar.liquid`; JS: `facet-filters.js`, `products-toolbar.js`, `price-range.js`.
- Tips: Ensure filter param persistence and deep links. Audit performance on large collections.

### Search and Suggestions
- What: Predictive search dropdown, search results template, tabs/panels.
- Where (Theme Editor): `sections/predictive-search.liquid`, `sections/main-search.liquid`.
- Where (Code): snippets `predictive-search*.liquid`; JS `predictive-search.js`, `search-form.js`.
- Tips: Verify keyboard navigation and ARIA roles. Test mobile.

### Cart and Checkout UX Enhancements
- What: Cart page items, sticky ATC, add-to-cart banners, pickup availability.
- Where (Theme Editor): `sections/main-cart.liquid`, optional `add-to-cart-banner.liquid`.
- Where (Code): snippets `cart-items.liquid`; JS/CSS `cart-items.js/css`, `sticky-atc-panel.js/css`, `pickup-availability.js`.
- Tips: Confirm line item properties, subscriptions, and discounted pricing display.

### Popups and Overlays
- What: Newsletter, promotional, exit-intent, product or page-specific popups.
- Where (Theme Editor): `sections/main-page-popup.liquid`, `product-page-popup.liquid`, `checkout-page-exit-popup.liquid`, `become-a-partner-popup.liquid`, `partner-form-popup.liquid`.
- Where (Code): `sections/pop-up.liquid`, `snippets/popup-with-button.liquid`; JS `pop-up.js`.
- Tips: Avoid double-firing on theme editor reloads. Set sensible frequency/close behavior.

### Content Pages & Resources
- What: Blog, articles, resources list, manuals and videos, FAQs.
- Where (Theme Editor): `sections/main-blog.liquid`, `main-article.liquid`, `main-resource-blog.liquid`, `manual-and-videos.liquid`, `faq.liquid`, `faqs-topic-list.liquid`.
- Where (Code): corresponding `sections/` files; card snippets `manual-and-videos-card.liquid`.
- Tips: For structured data, check `snippets/structured-data-article.liquid`.

### Internationalization (i18n) and Markets
- What: Translations and market-specific settings.
- Where: `locales/` for translations; `config/markets.json` for market config; locale switch in header.
- Tips: Translate new strings and run regression on RTL/LTR if applicable.

### Theme Settings
- What: Colors, typography, buttons, badges, layout spacing.
- Where: `config/settings_schema.json` defines controls; values stored in `config/settings_data.json`.
- Tips: Keep changes backwards compatible. Document any new settings you add.

### Media and Assets
- What: Icons, badges, image galleries, video components.
- Where: `assets/` for media and styles; `snippets/icon*.liquid`; sections like `video.liquid`, `image-slideshow.liquid`.
- Tips: Optimize images, prefer SVG for icons, lazy-load where possible.

### QA Checklist Before Publish
- Header/nav works on mobile/desktop; locale/currency switchers function.
- PDP variants, prices, inventory, ATC, and recommendations function.
- Collection filters and sort persist across navigation.
- Search predictive results accessible via keyboard and screen readers.
- Popups respect frequency and close correctly.
- Cart totals, discounts, and shipping/pickup info accurate.
- No 404s on assets; Lighthouse performance and accessibility pass.

### Ownership Notes
- Admin-managed content: menus, pages, products, collections, blogs, metafields.
- Theme-managed UI/UX: sections, snippets, assets, settings schema.

## Specific Workflows

### Metafields we rely on (namespace.key → usage)
- product.custom.product_tag → PDP/media gallery tag and product card badges
- product.custom.capacity → PDP tag ("X Persons") and product cards
- product.custom.delivery → Product cards ("Delivery")
- product.custom.product_tag_free_shipping → Product cards free shipping badge
- product.custom.owners_manual (URL) → Manuals link in resource cards
- product.custom.product_sections (List of references) → Controls per-product extra sections (FAQ, multi-column)
- product.custom.product_section_list (List of references) → Section gating via `snippets/section_status.liquid`
- product.custom.upsell_product_variants (List) → Cart upsell widgets
- product.custom.cart_product_addons (List) → Cart add-ons
- product.custom.product_discount → Cart upsell discount text/value
- product.custom.real_price (variant) → Tooltip details for Globo integration
- product.custom.amps / product.custom.voltage → Used in `calculator-section.liquid`
- product.descriptors.subtitle → Subtitle on product cards
- product.reviews.rating / product.reviews.rating_count → Rating display on cards/PDP
- product.theme.label → Custom product label; also used in predictive search collections

Tip: Create these metafields in Admin → Settings → Custom data. Use appropriate types (single line text, integer, boolean, URL, list of references).

### Menus and handles
- Main menu setting id: `menu` (default handle: `main-menu`) in `sections/header.liquid`.
- Quicklinks menu setting id: `quicklinks_menu` (no dropdowns; max ~4 links).
- Mega menu activation: driven by link text matches in header settings (Column/Button/Sidebar Mega Menus). Ensure top-level link names match settings.

### Gemini mobile navigation authoring
- Gemini mobile navigation is rendered from `desktop_nav_item`, `desktop_nav_group`, and `desktop_nav_panel` blocks in `sections/header.liquid`, with the pane-stack markup emitted by `snippets/mobile-desktop-nav.liquid`.
- `group_type` now controls mobile rendering directly:
  - `cards` renders a 2-column card grid in the group pane.
  - `feature_image` renders text links first, then the feature banner.
  - `nested_cards` renders text links that drill into entry-specific card-grid panes.
- If a nav item has exactly one group and that group uses `cards`, mobile skips the intermediate group list and shows the card grid directly on the nav item's pane. This is the ACCESSORIES-style collapse.
- `explore_label` and `explore_url` on each `desktop_nav_item` control the bottom pill CTA on that nav item's mobile pane. If `explore_url` is blank, the pill is omitted.
- For `nested_cards`, each authored `entry_N_label` stays visible even when no matching `desktop_nav_panel` exists. Unmapped entries render disabled instead of disappearing, which makes authoring gaps obvious during QA.
- Key mapping rules:
  - Group-level card or banner content uses the `desktop_nav_panel` whose `nested_item_slot` is `none`.
  - Entry-specific `nested_cards` panes use `nested_item_slot = item_N`, matched against the corresponding `entry_N_*` fields on the group block.

### Popups and frequency capping
- Component: `assets/pop-up.js` defines `pop-up` custom element.
- Triggers via `data-trigger`:
  - `delay`: opens after `data-delay` seconds
  - `exit`: opens on mouseleave near top (desktop only)
  - `clipboard`: opens when the user copies text
- Cookie key: `<section-id>-dismissed`; dismissal duration via `data-dismiss-days`.
- `data-show-on-mobile` controls mobile display; otherwise desktop-only per `theme.mediaMatches.md`.

### Collection filters via metafields
- `collection.custom.sauna_type_list` (List) used to render Sauna Type filters in `snippets/facet-filters.liquid`.
