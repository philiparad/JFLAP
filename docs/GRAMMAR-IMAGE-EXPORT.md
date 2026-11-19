# Grammar and parse-diagram images

Use File → Export SVG, PNG, JPG, GIF or BMP.

- In the grammar Editor, export includes every production in order, with the current table text size. Valid text drafts are included; malformed drafts report an error. Named-variable grammars are also supported.
- In Parse, Multiple Parse or Manual Derivation, export captures the currently displayed parse tree or unrestricted derivation graph. Normal/inverted orientation and the current highlighted step are retained. Build a diagram first; an absent diagram reports an explanatory error.
- All drawing content is measured, including parts outside a scrolling viewport. Export neither edits the grammar nor advances parsing. Grammar images contain productions, not editor controls or the conversion legend.

SVG uses text and vector shapes without foreignObject or external resources. Raster images use the existing codecs, with a white background. Large drawings can always be saved as SVG; raster exports above 10 million pixels are rejected explicitly. Parse labels use the same abbreviated display and full SVG title as the on-screen diagram.

Validation: 233 browser checks pass, with focused Chrome grammar PNG and inverted highlighted parse-tree SVG export checks. See VALIDATION.md.
