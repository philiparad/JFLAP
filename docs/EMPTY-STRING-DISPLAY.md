# Empty-string display

Choose **Edit → Preferences → Empty-string display** to use λ (lambda, default) or ε (epsilon). The choice is saved in this browser and restored after reload.

The selected glyph is used for empty transitions and outputs, grammar and regular-expression text, simulation/configuration results, batch rows, FIRST/FOLLOW and parse tables, guided grammar exercises, parse/derivation diagrams and grammar image exports. Both glyphs remain accepted as empty-string notation in existing input parsers. Empty production cells stay empty; their hints identify the selected glyph.

This is a presentation preference. It does not rewrite stored documents, undo history, XML, transition semantics, acceptance or parsing algorithms. Quoted terminal literals and named variables in angle brackets retain their exact spelling. Document/state names, notes and Turing blank squares are unaffected.

Applying a changed glyph refreshes the active operation. Re-run a simulation or parser to produce fresh results; cached operation views refresh when reopened.

## Validation

236 browser regressions pass. Focused Chrome checks cover persistence after reload, grammar editing, nullable-production completion, FIRST/FOLLOW, accepted parsing and epsilon input in multiple runs.
