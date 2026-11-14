# Prioritized feature-parity tasks

**8 November update:** See [the refreshed audit](FEATURE-GAPS-2026-11-08.md) for the current 30-task feature-gap list, corrected false positives and dormant-code boundaries.

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
| 17 | [x] | User-controlled grammar rewrites: choose production and occurrence; undo derivation. | G01 |
| 18 | [x] | Structured grammar-variable representation for generated converters; preserve old files. | Compatibility |
| 19 | [x] | PDA→CFG core conversion with explicit supported normalization and language tests. | C01 |
| 20 | [x] | PDA→CFG UI, variable legend, export and derived-word checks. | C01 |
| 21 | [x] | Turing→unrestricted grammar core construction and bounded semantic fixtures. | C02 |
| 22 | [x] | Turing-generated grammar UI and parsing workflow. | C02 |
| 23 | [x] | Context-free parse-tree data and drawing, normal/inverted views. | G02 |
| 24 | [x] | Unrestricted derivation graph with grouped multiple-parent replacements. | G02 |
| 25 | [x] | Synchronize parse step with highlighted tree node and table cell. | G07 |
| 26 | [x] | Editable FIRST/FOLLOW exercise with validation and selected-cell assistance. | G03 |
| 27 | [x] | Editable LL table exercise, Do Selected/Step/All and validation. | G04 |
| 28 | [x] | Editable LR table exercise and explicit conflict-action choices. | G04,G06 |
| 29 | [x] | Interactive LR item sets, closure and goto diagram construction. | G05 |
| 30 | [x] | Guided NFA→DFA subset-state and transition exercise. | C03 |
| 31 | [x] | Guided minimization partition tree and result construction. | C04 |
| 32 | [x] | Interactive FA→regex elimination order and intermediate graphs. | C05 |
| 33 | [x] | Interactive regex decomposition and NFA construction. | C06 |
| 34 | [x] | Guided FA→grammar production construction and checking. | C07 |
| 35 | [x] | Guided right-linear grammar→FA construction and checking. | C07 |
| 36 | [x] | Guided CFG→PDA LL construction and checking. | C07 |
| 37 | [x] | Guided CFG→PDA LR construction and checking. | C07 |
| 38 | [x] | Nullable-set and lambda-removal exercise. | C08 |
| 39 | [x] | Unit-dependency and unit-removal exercise. | C08 |
| 40 | [x] | Useful-variable/dependency and useless-removal exercise. | C08 |
| 41 | [x] | Interactive terminal replacement and binarization for CNF. | C08 |
| 42 | [x] | Original building-block XML tags/references with round-trip fixtures. | T04 |
| 43 | — | Excluded: original Open URL action is a no-op. See refreshed audit. | F01 |
| 44 | [x] | Save/Save As file handles where supported; explicit download fallback. | F05 |
| 45 | — | Dormant decoder investigation only; not registered. Export is a stub. See refreshed audit. | F02 |
| 46 | — | Excluded: original Lenore decoder explicitly unimplemented. See refreshed audit. | F02 |
| 47 | — | Dormant object-stream decoder investigation; not registered in Open. See refreshed audit. | F02 |
| 48 | [x] | Persistent operation tabs and separate document windows, isolated histories. | F06 |
| 49 | [x] | Pumping game state machine with human/computer-first roles. | P01 |
| 50 | [x] | Port regular-language opponent strategies and explanations, one fixture per exercise. | P02 |
| 51 | [x] | Port context-free opponent strategies and explanations, one fixture per exercise. | P02 |
| 52 | [x] | Pumping XML persistence for complete ongoing game state. | P03 |
| 53 | [x] | L-system exact named palette and RGB/HSB triples. | L01,L02 |
| 54 | [x] | L-system hue shifts preserving saturation/brightness. | L03 |
| 55 | [x] | L-system parameter table and picker. | L04 |
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
| 67 | [x] | Shift+Enter transition continuation with keyboard checks. | U04 |

| 68 | [ ] | State-label visibility and bulk clearing: Hide/show labels, retain hover text while hidden, and clear all state labels with undo. | NEW |
| 69 | [ ] | Guided PDA to CFG construction: Build productions from selected PDA transitions; provide Hint, Show All and remaining-transition help, and gate export on completion. | C01 residual |
| 70 | [ ] | Freely constructed graphical LR item automaton: Create and reposition item-set nodes, draw goto links to new/existing nodes, choose items and apply closure; validate semantics independently of supplied canonical state numbering. | G05 residual |
| 71 | [ ] | Linked selection in guided conversions: Selecting productions highlights originating states/transitions and vice versa; source selections build corresponding results and identify unfinished objects. | C07 residual |
| 72 | [ ] | Minimization: Complete Subtree: Recursively complete only the selected partition subtree, leave unrelated groups untouched, and preserve language equivalence. | C04 residual |
| 73 | [ ] | Graphical minimization partition editing: Add/remove child groups and toggle source-state membership by clicking; Check Node validates the selected partition; retain undo. | C04 residual |
| 74 | [ ] | Detachable editor toolbar: Provide a movable/detachable equivalent of the original toolbar while preserving tool selection, keyboard use and an accessible reattach path. | NEW desktop presentation |
| 75 | [ ] | Combine non-FA automata: Expose combination for PDA, Mealy, Moore and compatible Turing machines; reject mismatched tape counts, preserve outputs and discard the appended initial marker. | NEW |

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

Task 17: 94 tests pass. Added Manual Derivation tab with production and occurrence choice, history, undo and restart. Tests cover repeated and overlapping occurrences, unrestricted rules, blank result and invalid selections. Browser verified S to aabb and undo to aaSbb.

Task 18: 98 tests pass. Added explicit variable/terminal tokens, atomic multi-character names, legacy migration, token-aware derivation adapters and validated JSON persistence. Forty-variable and uppercase-terminal fixtures pass. Named-variable documents display safely and save JSON; original character grammars and XML remain unchanged. Conversion workflows follow in tasks 19-20.

Task 19: 102 tests pass. PDA-to-CFG core normalizes no-pop, multi-pop and long pushes with a protected bottom symbol; supports final-state and empty-stack acceptance, empty languages and explicit production bounds. Tested both languages through length four plus stack recovery and uppercase terminals. Sound CFG terminal pruning improves generated-grammar search.

Task 20: 102 tests pass. Added PDA conversion acceptance chooser, generated grammar view and variable legend, JSON/readable export, resumable parsing and source-PDA comparison. Browser verified accepted aabb, rejected aab, and JSON download/reopen preserving grammar and legend. Named grammars currently use a read-only view and derivation search; see PDA-TO-GRAMMAR.md.

Task 21: 106 tests pass. Added paired-cell Turing-to-unrestricted-grammar construction and production-based derivation search. Fixtures compare simulator languages and replay actual grammar steps, including overwrite, blank input, left expansion, Stay and nondeterminism. Explicit scope: single tape, no blocks or assignments, final-state acceptance. Static original converter evidence and differences documented in TURING-TO-GRAMMAR.md.

Task 22: 106 tests pass. Added Turing conversion menu and alphabet chooser, paired-cell explanation, JSON/text export and generated-grammar parsing with source comparison. Browser verified unary input 11 accepts with a 16-step derivation ending in the original input. General search offers incremental pause/resume; fixed-input search is separately bounded.

Task 23: 110 tests pass. Added CFG parse-tree reconstruction for derivation, LL, SLR and CYK results, including epsilon and repeated occurrences. Normal/inverted SVG views retain node identity and terminal yield. Browser verified both orientations. Unrestricted multi-parent rewrites are excluded from CFG trees and follow in task 24.

Task 24: 113 tests pass. Added unrestricted derivation graphs with grouped multi-parent rewrite junctions, unchanged-symbol links and explicit epsilon replacements. Supports ordinary and named-token grammars; validates occurrences and caps large displays. Browser verified S to xABy to xcy with AB replaced together.

Task 25: 115 tests pass. Parser traces identify LL/SLR lookup cells and tree nodes for expansions, terminal matches, shifts, reductions and acceptance. Added synchronized highlighting, previous-step navigation and selectable trace rows; orientation survives stepping. Unrestricted graphs highlight the active rewrite and participating symbols. Browser verified LL and SLR lookup selection and terminal-match behavior.

Task 26: 117 tests pass. Added FIRST/FOLLOW exercise with editable sets, selected-cell checking and assistance, complete validation and reset. Answers remain while switching tabs and reset when the grammar changes. Browser verified missing epsilon feedback, selected fill and correct complete sets.

Task 27: 119 tests pass. Added editable LL table exercise with numbered productions, validation, Do selected, Step, Do all and reset. Conflicts require every applicable production and remain explicit after completion. Browser verified one-cell stepping and complete table validation.

Task 28: 121 tests pass. Added editable SLR action/goto tables, validation and selected/step/all assistance. Conflicts retain all actions and require explicit validated choices before parsing. Browser verified complete-table parsing, blocked unresolved conflicts and accepted aaa after choosing a shift.

Task 29: 123 tests pass. Added editable canonical LR(0) item sets and goto transitions, closure from entered items, goto assistance, selected/step/all completion, validation and a diagram of entered edges. Browser verified closure, goto and complete construction. State slots and canonical numbering are supplied rather than freely drawn.

Task 30: 125 tests pass. Added guided subset construction with checked destination IDs, epsilon closures, one-transition and state-expansion assistance, completion and export of the constructed DFA. Empty targets are checked and omitted in the partial DFA. Tests verify source/result language equivalence and normalization. Browser verified missing-state feedback, a correct subset, completion and opening the exported DFA.

Task 31: 127 tests pass. Added guided stable-partition refinement with checked symbol-based splits, partition tree, undo/reset and assistance. Result states represent stable partitions; checked transitions must be completed before export. Tests cover equivalent states, rejected oversplitting, trap states and language equivalence. Browser verified incorrect/correct split feedback, transition validation and result export.

Task 32: 129 tests pass. Added selectable FA-to-regex elimination order, generalized intermediate graphs, current edge expressions and before/via/after updates, undo/reset, completion and expression export. Tests verify both elimination orders preserve language, epsilon/empty cases and atomic size limits. Browser verified selected q2 elimination, undo, complete expression and opening the result. Literal regex-operator input symbols are explicitly unsupported by the existing expression notation.

Task 33: 131 tests pass. Added selectable regex-edge decomposition for union, concatenation, star, epsilon and empty language, decomposition tree, intermediate graph, undo/reset, assistance and guarded NFA export. Tests compare both expansion orders to the automatic converter. Browser verified decomposition, undo and opening the completed NFA.

Task 34: 133 tests pass. Added guided transition/final-state production entry with field checking, selected/step/all assistance and checked grammar export. Named variables support uppercase terminals and more than 26 states. An explicit supplied start rule preserves empty-language cases. Tests cover normalization and grammar acceptance; browser verified incorrect/correct answers, completion and opening the exported grammar.

Task 35: 135 tests pass. Added guided right-linear grammar-to-FA path entry, selected/step/all assistance, checked intermediate graph and export. Supports legacy and named-variable grammars, epsilon/unit rules and multi-symbol words split into literal symbol edges. Tests verify language equivalence, named uppercase terminals and rejected nonregular input. Browser verified correction feedback, complete paths and exported FA.

Task 36: 137 tests pass. Added guided top-down CFG-to-PDA transition entry, field checking, selected/step/all assistance and export. Uses a fresh protected stack-bottom marker and final-state acceptance. Preview labels show read/pop/push fields. Tests cover language acceptance/rejection, malformed grammars and grammar variable Z; browser verified corrections, stack labels and export. Named-token grammars remain outside this exercise scope.

Task 37: 139 tests pass. Added separate guided bottom-up CFG-to-PDA exercise with shift and reversed-production reduction checks, epsilon reductions, protected stack marker, completion and export. LL and LR answers stay separate. Tests cover acceptance/rejection, reduction order and empty productions; browser verified labels and result export. This is nondeterministic bottom-up construction, not deterministic LR table parsing.

Task 38: 141 tests pass. Added nullable-variable set checks, discovery-round hints, transformed-production checking and assistance, reset and guarded export. Preserves a nullable start production to retain the empty word. Tests cover nullable chains, repeated occurrences, missing/extra productions and language results. Browser verified missing-set feedback, completed productions and export.

Task 39: 143 tests pass. Added per-variable unit-closure checking, dependency graph, selected/all assistance, replacement-production validation and guarded export. Handles cycles, epsilon rules and right-side-only variables. Empty-language export preserves the original start with a nonterminating non-unit placeholder. Browser verified incorrect/correct dependency sets, replacement rules and export.

Task 40: 145 tests pass. Added generating-variable and post-pruning reachability checks, discovery/dependency hints, remaining-production validation and assistance, reset and guarded export. Tests cover cycles, epsilon and empty-language start preservation. Browser verified missing-set feedback, pruning order and export. Empty-language documents explicitly use a non-generating placeholder because the editor requires a start rule.

Task 41: 147 tests pass. Added interactive CNF terminal replacement and selected production binarization with checked fresh names, undo/reset, step/all assistance and export. Automatic start isolation, lambda/unit/useless preparation is visible. Tests verify language preservation, nullable-start isolation and empty-language binary representation; browser verified name collision feedback, undo, completion and export.

Task 67 (8 November 2026): Shift+Enter continuation in transition dialogs, ordinary Enter apply, cancellation and validation isolation. Existing 147 browser regressions and focused Chromium keyboard tests passed. Exactly one feature implemented; delivered with its tests and refreshed audit in the Task 67 commit. See FEATURE-GAPS-2026-11-08.md.

Task 42: original named Turing block references, empty definitions, read-only block transitions and compatible single-tape export. Legacy inline files still import. 151 browser tests and keyboard interaction checks passed; a Java-generated fixture passed browser import/nested editing/export and original Java codec reopening. Multi-tape block web round trips are supported; the original loader limitation is documented in TURING-BLOCK-XML.md.

Task 44: document file associations with Open, Save and Save As on supported browsers; explicit Download copy/fallback elsewhere. Cancellation, write failures and Save and close preserve unsaved documents. Handles survive undo but remain session-local and outside model serialization. 159 regression tests, real Chromium file-handle UI checks, keyboard checks and the original Java block codec round trip passed. See SAVING-FILES.md for browser scope and test boundaries.


Task 48 (9 November 2026): operation tabs retain inputs, results and progress across tab/document switches; individual tabs can be dismissed. Documents retain independent undo/redo histories. Separate windows edit independent copies with private reload storage. Background grammar searches pause until resumed. Source changes invalidate obsolete results. See [workspace behavior and validation](WORKSPACES.md). Only Task 48 was implemented in this continuation.


Task 49 (9 November 2026): human-first and computer-first pumping rounds for regular and context-free exercises, enforced turns and legal moves, visible move/attempt history, retry and restart. 163 regression checks and four real Chromium game workflows pass. The generic opponent remains bounded; original per-language strategies and ranges remain Tasks 50/51, and game XML persistence remains Task 52. See [pumping games](PUMPING-GAMES.md). Only Task 49 was implemented in this continuation.


Task 50 (9 November 2026): all 13 regular pumping opponents now use the original ranges, witness formulas, decomposition choices, exponent choices and per-exercise explanations. 3,109 controlled original-Java observations match; 177 regressions and both-role Chromium checks for every regular exercise pass. Original AB2n shortest-witness behavior is preserved and explained. Context-free strategy Task 51 remains pending. See [regular opponent evidence](REGULAR-PUMPING-EVIDENCE.md). Only Task 50 was implemented in this continuation.


Task 51 (9 November 2026): all 13 context-free pumping opponents now use original per-exercise ranges, witness formulas, split and exponent policies and explanations. 13,371 original-Java observations and 192 regressions pass; Chromium covers both roles for every exercise and rejected-split retry. W1CW2CW3CW4 follows executable equality semantics, with the contradictory description documented. XML persistence Task 52 remains pending. See [CF opponent evidence](CF-PUMPING-EVIDENCE.md). Only Task 51 was implemented in this continuation.


Task 52 (10 November 2026): pumping games save as original-compatible XML, with a validated browser extension for exact turns, moves and retries. JSON and browser reloads also restore progress. Original attempt summaries and CF case records survive round trips; restart clears game progress. 198 regression checks, every-turn browser persistence flows and 16 original-Java XML compatibility states pass. See [pumping XML](PUMPING-XML.md). Only Task 52 was implemented in this continuation.


Task 53 (10 November 2026): original L-system named palette and RGB/HSB triples now resolve to explicit RGB for line and polygon drawing, assignments and color commands. 247 original-Java color observations are tested, with intentional rejection of nonfinite NaN inputs documented; 202 regressions and real Chromium render/export/error checks pass. Hue-shift Task 54 remains pending. See [L-system colors](LSYSTEM-COLORS.md). Only Task 53 was implemented in this continuation.


Task 54 (10 November 2026): L-system hue shifts now derive from the current RGB color and retain saturation/brightness; gray colors remain unchanged. Line/polygon direction, parameter/explicit increments, wrapping, assignments and branch restoration are covered. 205 regressions pass with 432 original-Java sequences (one documented Java wrap bug intentionally corrected), plus Chromium rendering/export checks. See [L-system colors](LSYSTEM-COLORS.md). Only Task 54 was implemented in this continuation.

Task 55: 14 November 2026: added editable L-system parameter rows, recognized-name picker with first-match focus, custom names, removal, synchronized text editing and default hints. Last duplicate wins; invalid text is explicit. 207 regressions pass; browser checks cover rendering, validation, saved XML and reload. See LSYSTEM-PARAMETERS.md. Only Task 55 was implemented in this continuation.
