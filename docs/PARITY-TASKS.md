# Prioritized feature-parity tasks

This is the active implementation backlog. The earlier TASKS.md records the initial release, not full parity. Audit IDs refer to FEATURE-GAP-AUDIT.md. All items below are pending unless checked.

Order: everyday simulation and teaching workflows first, missing algorithms and file compatibility next, specialist exercises and presentation refinements last. Prerequisites appear before dependent work. No parallel implementation: implement one row, run its checks, commit it to GitHub main successfully, then start the next row. A failed check or commit must be resolved first. Completion never means that Original mode merely contains the feature.

| Task | Done | Scope and acceptance check | Audit |
|---|---|---|---|
| 01 | [x] | Live simulation graph: highlight active states and nested-block location without changing execution. | S05 |
| 02 | [x] | Freeze/thaw/remove configurations; frozen-only frontier stays paused and branches remain individually controllable. | S02–S04 |
| 03 | [x] | Resume after search limit without losing pending branches; match uninterrupted result. | S07 |
| 04 | [x] | Keep looking after acceptance; show subsequent distinct accepting traces without repeating the last result. | S06 |
| 05 | [x] | FA closure stepping, including initial closure and epsilon cycles; match ordinary simulation. | S01 |
| 06 | [x] | PDA closure stepping with stack-aware configurations and bounded infinite epsilon growth. | S01 |
| 07 | [x] | Import input-string files into machine runs, preserving blank lines and tape separators. | B03 |
| 08 | [x] | Multi-machine batch testing: selected open models, result matrix and CSV. | B01 |
| 09 | [x] | Batch add/remove/edit machine files and imported input files. | B02 |
| 10 | [x] | Grammar multiple brute-force parsing with per-input result and derivation. | B04 |
| 11 | [x] | Grammar multiple CYK parsing with per-input charts. | B05 |
| 12 | [x] | Tape-count chooser (1–5); create, edit, simulate and round-trip each count. | T02 |
| 13 | [x] | Turing Stay preference, retaining existing S moves until edited as original does. | T03 |
| 14 | [x] | Turing wildcard and negated-read syntax from original bytecode; literal/blank fixtures. | T01 |
| 15 | [x] | Turing variable assignment/reuse; branch-local bindings and multi-tape fixtures. | T01 |
| 16 | [x] | Incremental grammar search with pause/resume/cancel and progress; preserve results. | G08 |
| 17 | [ ] | User-controlled grammar rewrites: choose production and occurrence; undo derivation. | G01 |
| 18 | [ ] | Structured grammar-variable representation for generated converters; preserve old files. | Compatibility |
| 19 | [ ] | PDA→CFG core conversion with explicit supported normalization and language tests. | C01 |
| 20 | [ ] | PDA→CFG UI, variable legend, export and derived-word checks. | C01 |
| 21 | [ ] | Turing→unrestricted grammar core construction and bounded semantic fixtures. | C02 |
| 22 | [ ] | Turing-generated grammar UI and parsing workflow. | C02 |
| 23 | [ ] | Context-free parse-tree data and drawing, normal/inverted views. | G02 |
| 24 | [ ] | Unrestricted derivation graph with grouped multiple-parent replacements. | G02 |
| 25 | [ ] | Synchronize parse step with highlighted tree node and table cell. | G07 |
| 26 | [ ] | Editable FIRST/FOLLOW exercise with validation and selected-cell assistance. | G03 |
| 27 | [ ] | Editable LL table exercise, Do Selected/Step/All and validation. | G04 |
| 28 | [ ] | Editable LR table exercise and explicit conflict-action choices. | G04,G06 |
| 29 | [ ] | Interactive LR item sets, closure and goto diagram construction. | G05 |
| 30 | [ ] | Guided NFA→DFA subset-state and transition exercise. | C03 |
| 31 | [ ] | Guided minimization partition tree and result construction. | C04 |
| 32 | [ ] | Interactive FA→regex elimination order and intermediate graphs. | C05 |
| 33 | [ ] | Interactive regex decomposition and NFA construction. | C06 |
| 34 | [ ] | Guided FA→grammar production construction and checking. | C07 |
| 35 | [ ] | Guided right-linear grammar→FA construction and checking. | C07 |
| 36 | [ ] | Guided CFG→PDA LL construction and checking. | C07 |
| 37 | [ ] | Guided CFG→PDA LR construction and checking. | C07 |
| 38 | [ ] | Nullable-set and lambda-removal exercise. | C08 |
| 39 | [ ] | Unit-dependency and unit-removal exercise. | C08 |
| 40 | [ ] | Useful-variable/dependency and useless-removal exercise. | C08 |
| 41 | [ ] | Interactive terminal replacement and binarization for CNF. | C08 |
| 42 | [ ] | Original building-block XML tags/references with round-trip fixtures. | T04 |
| 43 | [ ] | Open URL with explicit network errors and browser CORS limitations. | F01 |
| 44 | [ ] | Save/Save As file handles where supported; explicit download fallback. | F05 |
| 45 | [ ] | Original JFLAP 3 codec fixtures and import/export. | F02 |
| 46 | [ ] | Original Lenore codec fixtures and supported conversion. | F02 |
| 47 | [ ] | Java serialized model compatibility via bounded data-only reader and fixtures. | F02 |
| 48 | [ ] | Persistent operation tabs and separate document windows, isolated histories. | F06 |
| 49 | [ ] | Pumping game state machine with human/computer-first roles. | P01 |
| 50 | [ ] | Port regular-language opponent strategies and explanations, one fixture per exercise. | P02 |
| 51 | [ ] | Port context-free opponent strategies and explanations, one fixture per exercise. | P02 |
| 52 | [ ] | Pumping XML persistence for complete ongoing game state. | P03 |
| 53 | [ ] | L-system exact named palette and RGB/HSB triples. | L01,L02 |
| 54 | [ ] | L-system hue shifts preserving saturation/brightness. | L03 |
| 55 | [ ] | L-system parameter table and picker. | L04 |
| 56 | [ ] | Incremental rendering progress and scrollable actual-size drawing. | L05 |
| 57 | [ ] | Graph rotation, all reflection axes and fit-to-view. | V05 |
| 58 | [ ] | Degree-tree and hierarchy-tree layouts including disconnected graphs. | V02 |
| 59 | [ ] | Two-circle layout and random layout-algorithm selection. | V03,V04 |
| 60 | [ ] | GEM layout with convergence bounds. | V01 |
| 61 | [ ] | Grammar table, text-size control and adjustable columns. | G09 |
| 62 | [ ] | JPG/GIF/BMP image export with decoded-image checks. | F03 |
| 63 | [ ] | Grammar/parse-diagram image export. | F04 |
| 64 | [ ] | Empty-string display preference across editors, simulations and tables. | U01 |
| 65 | [ ] | Selectable original interface palettes. | U02 |
| 66 | [ ] | Context help routed to each active operation. | U03 |
| 67 | [ ] | Shift+Enter transition continuation with keyboard checks. | U04 |

## Commit gate

Every feature commit updates its checkbox and the implementation notes below. The actual commit history is the authority for successful commits. Keep unverified or partial work unchecked. Algorithm changes must pass the browser regression suite; UI changes also need a focused browser interaction. No React or NodeJS application/build dependency is introduced.

## Implementation notes

Backlog created from the 27 October audit. Original mode remains available while this independent port is developed.

Task 01: live simulation graph and nested-view selector. Browser check: Start/Step highlighted q0 at input position 1; existing 54 regression checks passed.

Task 02: Freeze, thaw and remove selected configurations are implemented. Frozen-only searches pause. Browser freeze/thaw/step check and 58 regression tests passed.

Task 03: Search limits retain the pending step and all branches. Continue search adds budget. Browser limit-to-acceptance check and 61 tests passed.

Task 04: Keep looking discovers further accepting traces, retaining distinct merged histories. Repeated configurations within each trace are suppressed and this bound is explained in the UI. Browser check and 64 tests passed.

Task 05: FA Step with Closure expands initial and post-input closures with traces and resumable limits. Browser closure run and 67 tests passed.

Task 06: PDA closure stepping distinguishes stacks, bounds infinite epsilon growth and preserves acceptance found before a limit. Browser aabb acceptance and 71 tests passed.

Task 07: Load input-string files into Multiple Run, preserving blank lines and tape separators and normalizing BOM/line endings. Four-line file browser check and 73 tests passed.

Task 08: Batch Test compares selected same-type machines on shared inputs, isolates per-machine errors and exports CSV. Browser two-machine matrix and 76 tests passed.

Task 09: Batch supports adding model files, removing members without deleting documents, editing members and importing shared inputs. Browser add/edit/remove/input preservation checks and 76 tests passed.

Task 10: Multiple Parse runs brute-force grammar searches and exposes each derivation. Input-file loading is included; unfinished searches remain limits. Browser derivation check and 78 tests passed.

Task 11: Multiple Parse offers CYK with per-input charts and normalized grammar, including empty-word checks. Browser four-input results/chart and 80 tests passed.

Task 12: Multi-tape creation offers 1–5 tapes and displays tape count. Browser five-tape creation and 82 tests including all tape-count XML simulations passed.

Task 13: 83 tests pass. Browser verified disabled Stay choices, cancel preserving existing S, and Apply converting edited S to R. Fixed SVG selection redraw so double-click editing reliably opens.

Task 14: 85 tests pass. Added ~ wildcard on all tapes and single-tape !a negation per TMSimulator.matches bytecode. Blank and literal punctuation, execution, multi-tape matching and XML round-trip checked. Browser verified !□ editing.

Task 15: 88 tests pass. Single-tape a,b}x capture, later variable writes, blank capture, unchanged ~ writes, branch isolation and restart tested. Multi-tape assignment explicitly rejected to match original scope. Browser capture editing and accepted run verified. See TURING-PATTERNS.md.

Task 16: 92 tests pass. Incremental breadth-first search supports progress, pause, resume, cancellation and expansion of count and form-length bounds. Tests compare resumed derivations and immutable grammar snapshots. Browser resumed a 100-form limit to accepted with 145 forms and 71 derivation steps. Leaving the view cancels ongoing work.
