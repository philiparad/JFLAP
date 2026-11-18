# Grammar production table

The single-character grammar editor now has editable Left side and Right side columns, an arrow column, row removal, and an automatically growing blank final row. Blank right sides mean lambda. Row order is retained and the first production remains the start rule. The Add production toolbar action focuses the blank row.

Valid cell changes apply when focus leaves the cell, through the existing grammar validation and undo mechanism. Apply grammar also applies the current draft. Duplicate application of unchanged productions no longer consumes an undo entry. Invalid drafts leave the last valid model intact and display the existing error message; correct the draft before saving. As before, an applied grammar must contain at least one production.

Production text size (10–32 pixels) and each column width (80–800 pixels) are independently adjustable. Adjust columns estimates widths from the current text and font size, with the same width bounds. These presentation settings are retained in browser storage, independently of grammar files and undo history. Wide tables scroll horizontally. This is a browser approximation of desktop sizing rather than a pixel-identical reproduction.

Edit productions as text retains the existing multiline editor, arrows, lambda/epsilon normalization and alternative-rule syntax. Text edits refresh the table. A malformed text draft disables the stale table until corrected, so cell editing cannot overwrite that draft. The table uses the same single-character grammar semantics as the original editor; generated named-variable conversion reports retain their separate read-only representation.

Evidence: the shipped `DOCS/gui.grammar.GrammarInputPane.html`, retained at [original/gui.grammar.GrammarInputPane.html](original/gui.grammar.GrammarInputPane.html), specifies editable columns, blank lambda right sides, first-row start selection and automatic row growth. The earlier REA-backed task audit identifies text size and column adjustment from the original changelog. Artifact identity and static-analysis limitations are recorded in [the audit](FEATURE-GAPS-2026-11-08.md).

Validation: 225 browser regressions pass. New DOM checks exercise row editing and automatic growth, lambda and rule order, deletion, text/table synchronization, malformed-draft protection and recovery, and sizing persistence without production changes. Browser interaction verified production editing, Undo, text-size adjustment and automatic column sizing.
