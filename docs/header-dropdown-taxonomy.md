# Header Dropdown Taxonomy

This document defines the Shopify navigation structure required for the redesigned header dropdowns and mobile drawer to match the Figma and Gemini references.

## Top-Level Navigation

Use these first-level links in the main header menu:

- `Saunas`
- `Cold Plunges`
- `Accessories`

## Saunas

The `Saunas` menu should use a three-level hierarchy:

```text
Saunas
├── Explore by Series
│   ├── Monarch Series
│   ├── Governor Series
│   ├── Nordic Series
│   ├── Ally Series
│   ├── Renew Series
│   ├── Panorama Series
│   ├── Element Series
│   └── Laurel Series
├── Explore by Type
│   ├── Traditional Saunas
│   ├── Infrared Saunas
│   ├── Hybrid / Combination Saunas
│   ├── Indoor Saunas
│   └── Outdoor Saunas
├── Explore by Capacity
│   ├── 1-2 Person
│   ├── 3-5 Person
│   └── 6-8 Person
└── Explore by Design
    ├── Barrel Design
    ├── Cabin Design
    └── Panoramic / Mirror Design
```

Recommended featured products for the desktop right panel:

- `ally-2-person-traditional-indoor-sauna`
- `monarch-king`
- `nordic-ii-3-person-barrel-sauna`

## Cold Plunges

The `Cold Plunges` menu should use a three-level hierarchy:

```text
Cold Plunges
├── Explore by Model
│   ├── Snowpiercer
│   ├── Dynamic
│   └── Salus Saunas Ice Bath
└── Loki Luxury Series
    ├── Loki Thermo-Ash Ardesia
    ├── Loki Ardesia
    ├── Loki Thermo-Ash Desir Noir
    ├── Loki Thermo-Ash Invisible White
    ├── Loki Diamond Cream
    ├── Loki Ardesia Blanco
    ├── Loki Porfido Marrone
    ├── Loki Grigio Blend
    └── Loki Calacatta Blend
```

Recommended featured products for the desktop right panel:

- `snowpiercer`
- `dynamic`
- `salus-ice-bath`

## Accessories

The `Accessories` top-level link can remain a direct destination or use a simpler taxonomy than the curated sauna and cold plunge dropdowns. It does not require the same grouped rail treatment shown for the other two menus.

## Header Block Configuration

To match the redesigned taxonomy:

- Set the `Saunas` mega-menu block to `Sidebar Mega Menu`.
- Set the `Cold Plunges` mega-menu block to `Sidebar Mega Menu`.
- Keep curated featured products in the block `menu_products` setting instead of deriving them automatically from the active submenu.
- Use the top-level menu link URL as the source for the `Explore All <department>` CTA shown in the desktop left rail and mobile intermediate pane.
