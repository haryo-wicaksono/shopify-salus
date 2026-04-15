# Theme Editor Header/Footer Investigation

## Summary

This note captures the investigation into why some Shopify theme instances do not show the `Header` and `Footer` section groups in Theme Editor, and in some cases also show no thumbnail in the Themes list.

This file is intentionally gitignored. It is a local working note, not a source-of-truth artifact for the repo.

## Observed Behavior

- `main` and `development` can show `Header` and `Footer` in Theme Editor.
- Many feature/test themes created after the chat widget work do not show `Header` and `Footer`. This chat widget theme itself still shows header and footer, and thumbnnail exists on theme list.
- Some affected themes also show no thumbnail in the Shopify Themes list.
- A fresh repo-based test branch still reproduced the missing header behavior after importing as a theme.

## Initial Hypothesis

The first suspicion was that homepage hero work caused the issue, because the problem was noticed around that time.

## What Was Checked

### Header/footer section group wiring

The theme still uses section groups at the layout level:

- `layout/theme.liquid` renders `header-group`
- `layout/theme.liquid` renders `footer-group`
- `sections/header-group.json` exists
- `sections/footer-group.json` exists

This means the core section-group mechanism was not removed.

### Hero commit history

Checked:

- `4fa90d3` `fix: level homepage hero slides`

Result:

- It only changed `sections/homepage-hero-carousel.liquid`
- It did not change:
  - `layout/theme.liquid`
  - `sections/header-group.json`
  - `sections/footer-group.json`
  - `sections/header.liquid`

Conclusion:

- The homepage hero commit is not the direct cause of missing header/footer groups.

### Commits after the chat-widget baseline

Starting point referenced by user:

- merged chat-widget baseline around `43a351d`

Relevant later commits touching header/footer/layout files:

1. `f1d48db` `feat: chatbot widget`
- touched only `layout/theme.liquid`

2. `b3e74d2` `feat: update chatbot widget lead capture flow`
- touched only `layout/theme.liquid`

3. `eb19f1d` `fix: revert widget backend URL from cloudflare tunnel to production`
- touched only `layout/theme.liquid`

4. `6fa3882` `feat: update product page chat trigger`
- touched only `layout/theme.liquid`

5. `ab51a8e` `Update from Shopify for theme shopify-salus/main`
- changed `sections/header-group.json`
- mostly content/config reordering and menu block changes

6. `4de093b` `feat: update footer logo`
- changed `sections/footer-group.json`
- logo-only change

7. `e8f213e` `feat: refine header navigation and search behavior`
- changed `sections/header.liquid`
- added desktop nav/search swap behavior

8. `66c53c4` `fix: restore original header navigation`
- changed `sections/header.liquid`
- reverted most of the prior experimental header logic

### Fresh development-based branch test

A clean branch was created from `development`:

- `feat/header-editor-test`

Cherry-picked:

- `0cc10a2` `feat: restore homepage nav menu behavior`
- `aea2373` `feat: redesign header navigation and desktop mega menu groups`

Result reported by user:

- Header still did not show in Theme Editor

Conclusion:

- The problem is not explained by feature-branch ancestry alone.
- The current regression is reproducible from a fresh `development` base plus the new header work.

## Root Cause

The actual smoking gun is a JSON syntax error in the `header.liquid` schema.

Exact location:

- `sections/header.liquid`
- schema line around file line `1759`

Broken entry:

```json
"limit":4,
```

The trailing comma made the `{% schema %}` JSON invalid.

Shopify parses section schema as strict JSON. A trailing comma is enough to make the entire section schema invalid, which explains the observed behavior:

- the storefront can still render Liquid output
- but Theme Editor cannot register the section correctly
- therefore the `Header` section group disappears from the editor
- preview/theme indexing can also fail or behave inconsistently, which plausibly explains missing thumbnails on affected themes

## Revised Conclusion

At this point:

- the homepage hero work is not the cause
- branch ancestry is not the cause
- schema size/complexity was a red herring
- the reproducible current cause is the invalid trailing comma in `sections/header.liquid`

There may still have been older theme-instance instability around the chat-widget period, but the current missing-header regression on fresh imports is explained by the schema JSON error.

## Recommended Next Verification Step

1. Remove the trailing comma in `sections/header.liquid`
2. Import or push the corrected theme
3. Verify whether `Header` and `Footer` return in Theme Editor
4. Verify whether the theme thumbnail also returns for newly created test themes

If header/footer return after this one-character fix, the root-cause hypothesis is confirmed.

## Useful Branches / Commits Mentioned

- `development`
- `feat/homepage-nav-menu`
- `feat/header-editor-test`
- `43a351d`
- `4fa90d3`
- `e8f213e`
- `66c53c4`
- `0cc10a2`
- `aea2373`
