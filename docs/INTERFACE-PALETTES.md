# Interface palettes

Use **Edit → Preferences → Interface palette**. Six original JFLAP choices are available alongside Workbench, the default for existing browser users. The choice is saved in browser preferences; an unknown saved name falls back to Workbench.

## Original color evidence

Names and RGB assignments were recovered from the bundled, unmodified `vendor/JFLAP7.1.jar`, using JDK `javap -c -p gui.action.ColorChooserAction` and its inner classes `$1` through `$6`. The assigned fields are `StateDrawer.STATE_COLOR`, `StateDrawer.HIGHLIGHT_COLOR`, `TransitionTool.COLOR`, `CurvedArrow.ARROW_COLOR` and `CurvedArrow.HIGHLIGHT_COLOR`.

| Palette | State | Highlighted state | Transition tool | Arrow | Highlighted arrow |
| --- | --- | --- | --- | --- | --- |
| Original | #ffff96 | #64c8c8 | #5f5f5f | #000000 | #ff0000 |
| Blue | #e1ffff | #91dbe3 | #747880 | #747880 | #566178 |
| Green | #baffb8 | #7ce678 | #dba0a1 | #dba0a1 | #c26767 |
| Orange | #ffbe79 | #cc7b2a | #6e6356 | #6e6356 | #615e54 |
| Purple | #e6e6fa | #988dfc | #00005e | #00005e | #6495ed |
| Pink | #ffd6db | #faadb2 | #747880 | #747880 | #c7b9c0 |

The graph assignments match the original. Browser shell accents, panels, tables and text use related colors chosen for readable contrast; the web layout does not reproduce Swing chrome. Accepted/rejected/inconclusive result colors retain their semantic meaning. L-system drawing colors remain part of the L-system document.

Changes apply immediately to editors, simulation graphs, conversion previews and parse/derivation diagrams. They do not edit documents or reset active/cached operation progress. Exported diagrams and grammar images include the selected palette without depending on the page that created them.

## Validation

238 browser regressions pass. Tests check original RGB values in rendered graphs, all palette SVG/PNG round trips, parse highlights, unchanged diagram markup and an invalid-preference fallback. Focused Chrome checks cover the chooser, simulation progress, cached tabs, reload persistence and primary-button accents.
