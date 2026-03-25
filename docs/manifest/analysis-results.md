# Theme Audit & Codebase Analysis Results

This document consolidates results from both the exhaustive 8-layer dependency mapping and the initial script-based unused file analysis.

## 1. Exhaustive 8-Layer Dependency Audit
**Generated:** 2026-03-22
**Method:** Static analysis of Liquid, JSON, JS, Shopify Data Objects, and Browser Storage.

### Audit Summary
- **Exhaustive Layers mapped:** 8
- **Zombie Sections detected:** 32
- **Zombie Snippets detected:** 41

### Architectural Insights
The theme architecture is highly modular, with extensive use of:
- **Web Components:** Mapping HTML tags back to their JS source.
- **AJAX Section Loading:** Identifying dynamic fetches for cart and variants.
- **Deep Data Coupling:** Critical dependencies on collection handles (e.g., `uncategorized`) and custom metafields.

### Top Cleanup Candidates (Sections & Snippets)
| Type | Filename |
| :--- | :--- |
| Section | `age-verification-popup` |
| Section | `background-video` |
| Section | `calculator-section` |
| Section | `cart-icon-bubble` |
| Section | `compare-model` |
| Snippet | `cart-drawer` |
| Snippet | `compare-swatches` |
| Snippet | `doc-head-core` |
| Snippet | `filter-icon` |

---

## 2. Legacy Script-Based Analysis
**Generated:** 2026-03-22
**Method:** Filename and basic string matching (`scripts/analyze_unused.py`).

### Unused Assets (12)
These assets were identified as unreferenced by the legacy script and should be verified against the 8-layer manifest before removal:
- `assets/product-recommendations.js`
- `assets/quantity-input.css`
- `assets/copy-to-clipboard.PNG`
- `assets/quantity-input.js`
- `assets/swatches.css.liquid`
- `assets/side-drawer.js`
- `assets/video-btn-icon.svg`
- `assets/product-card.css`
- `assets/slider.js`
- `assets/custom.js`
- `assets/shoppable-image.js`
- `assets/verified-badge.svg`

---

## Next Steps
1. **Verification:** Cross-reference the "Zombie" lists with the [full dependency tree visualization](THEME-STRUCTURE.md).
2. **Shopify Admin Check:** Confirm no page/collection in the live Shopify Admin is using these templates or section types.
3. **Pruning:** Move verified unused files to an archive directory or add them to `.shopifyignore`.
4. **Maintenance:** Run `npm run theme:audit` regularly to keep the architectural map updated.
