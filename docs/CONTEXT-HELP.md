# Context-sensitive help

Use **Help for this operation** in the header or Help menu, or press **F1**. The dialog gives short instructions for the active editor or operation. The general Feature guide remains in the Help menu.

Help is resolved when requested, so it follows changes to the active document, operation, parsing algorithm and exercise mode, including restored operation tabs. F1 also works while typing in an editor field. An already open dialog is left intact to protect form edits.

## Context coverage

- Machine editors: finite automata, PDA, Mealy/Moore and single/multiple-tape or building-block Turing machines.
- Simulation, multiple run, inspection, batch comparison and each guided FA conversion.
- Grammar editing and named-variable grammar reading; brute-force, LL(1), SLR and CYK parsing; multiple parsing and manual derivation.
- FIRST/FOLLOW, LL table, SLR table and LR(0) item exercises, and guided grammar transformations/conversions.
- Regular-expression editing/testing and NFA construction, L-system editing/rendering and both pumping-lemma families.

Unknown contexts fall back to a useful general introduction. Named-variable parsing routes to generated-grammar help instead of the single-character parser instructions. Batch CYK receives its own instructions.

Reference links use shipped original help where a corresponding page exists; otherwise they use a relevant bundled feature-guide section. Original links are identified as desktop-control references. The short instructions describe the web workbench, including its SLR parser and free LR item diagram and optional numbered practice.

## Validation

241 browser checks pass. Regression checks enumerate supported contexts and verify every referenced file and guide anchor. Focused Chrome checks confirm editor help, SLR/F1, the Help menu and changing FIRST/FOLLOW/LR item modes. Help does not replace the active operation or its inputs.
