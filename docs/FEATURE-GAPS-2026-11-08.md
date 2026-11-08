# JFLAP 7.1 feature gaps and implementation tasks

Comparison: 8 November 2026. Repository baseline: `bd1440ede6b14b9e3eb253d3c2d33972e11737f8` (GitHub main when cloned).

**30 missing or partial feature task units were identified at this baseline. Exactly one, Task 67, is completed in this feature commit; 29 remain.** Two dormant-code investigations are listed separately. This list supersedes the old 27 October audit for current pending work.

## Scope and evidence

The comparison is against the independent JavaScript workbench. The repository already ships the original JAR in Original mode; that does not constitute an independent implementation. The original SHA-256 is `a22c095ddc56b18163e8ebeeef165b3a04cb570f35eb46b96105166e06c99406`.

REA opened the supplied archive, inventoried all 1,109 regular files and extracted them for inspection. Inventory: `ev_f4306d84dec7e0d9cfe46eab0c381add1715daebbbe6384cb91092b19b0ba6a1`; inspection: `ev_2eb1d6807365d84461c035ea3ba5983d766d56024c648c7bbc78412837939cec`; extraction: `ev_dcb0049b47f1dbd712905e9c9b939c200f5b64c86200c293a87d52d410327d94`. Manifest: `agm_58cebb392316e90574268a4a6cd83cb829520d13a6a0b5103b7f30ba67072765`. Full REA records accompany this report in `rea-evidence.json`.

Original help and changelog were compared with all workbench modules, UI routing and existing regression checks. Selected JVM bytecode was inspected with the installed JDK; `original-bytecode.txt` accompanies the report. REA establishes artifact identity and inventory, not Java execution. The code-level observations and comparison judgments are supplementary analyst findings, not claims that REA executed these features.

The task table covers all confirmed gaps found in this static user-facing feature/workflow audit, including desktop presentation controls. It is not proof that no undocumented behavior differs. Original runtime behavior, every legacy file variant and every algorithm input were not exhaustively exercised. Explicit resource limits, alternate visuals and deliberate normalization choices are documented differences rather than automatically separate missing features.

## Tasks

Each row is an actionable local task with an acceptance criterion. IDs preserve the existing backlog and add 68–75. `[x]` means implemented and tested in this change; `[ ]` means pending. Tasks are tracked in this repository; no separate GitHub issues or chats were created.

| Task | Status | Feature and acceptance criterion | Original evidence | Workbench boundary |
|---|---|---|---|---|
| 42 | [ ] | **Original Turing building-block XML.** Implement original nested tags and block references; import a Java-produced fixture, execute it, export and reopen it without losing references. | `file/xml/TMBBTransducer.class; TMTransducer.class` (T04) | `js/files.js` |
| 44 | [ ] | **Save / Save As file association.** Retain a chosen writable handle and save back to it; Save As changes association; unsupported browsers get an explicit download fallback. | `DOCS/filemenu.html` (F05) | `js/app.js` |
| 48 | [ ] | **Persistent operation tabs and separate document views.** Keep multiple operations and their histories alive; dismiss one independently; isolate document windows/views and edits. | `DOCS/filemenu.html` (F06) | `js/app.js` |
| 49 | [ ] | **Human-first / computer-first pumping games.** Implement both turn sequences, legal moves, opponent roles and terminal outcomes for regular and context-free games. | `pumping/; gui/pumping/` (P01) | `js/pumping.js; app.js` |
| 50 | [ ] | **Regular pumping opponent strategies.** Port each regular exercise’s strategy and explanations; exercise every opponent role with per-language fixtures, beyond finite-exponent heuristics. | `pumping/reg/` (P02) | `js/pumping.js` |
| 51 | [ ] | **Context-free pumping opponent strategies.** Port each context-free exercise’s strategy and explanations; add per-language fixtures and resolve the documented W1CW2CW3CW4 description discrepancy. | `pumping/cf/` (P02) | `js/pumping.js` |
| 52 | [ ] | **Pumping game XML persistence.** Round-trip all moves, roles and current phase through original-compatible XML; resume the saved game. | `file/xml/*Pumping*; pumping/` (P03) | `js/files.js; app.js` |
| 53 | [ ] | **L-system named colors and RGB/HSB triples.** Match original named palette and numeric triples, including non-CSS names; test resulting RGB values and malformed input. | `DOCS/gui.lsystem.DisplayPane.html` (L01,L02) | `js/lsystem.js` |
| 54 | [ ] | **L-system hue shifts.** Preserve saturation/brightness during hue changes and leave achromatic colors unchanged; test wrapping and branch state. | `DOCS/gui.lsystem.DisplayPane.html` (L03) | `js/lsystem.js` |
| 55 | [ ] | **L-system parameter table and picker.** Offer original parameter names and editable table values; retain values through rendering and saving. | `DOCS/gui.lsystem.LSystemInputPane.html` (L04) | `js/app.js` |
| 56 | [ ] | **Incremental L-system rendering and actual-size view.** Display live progress without blocking input; provide scrollable extent-based drawing as well as fitted viewing. | `DOCS/gui.lsystem.DisplayPane.html` (L05) | `js/app.js; lsystem.js` |
| 57 | [ ] | **Graph rotation, reflections and fit.** Implement original reflection axes, rotation and Fill Screen With Graph; retain valid geometry and undo each transformation. | `gui.menu.MenuBarCreator` (V05) | `js/app.js` |
| 58 | [ ] | **Degree-tree and hierarchy-tree layouts.** Implement both tree layouts with defined disconnected-graph behavior; preserve states and transitions. | `gui.menu.MenuBarCreator` (V02) | `js/automata.js` |
| 59 | [ ] | **Two-circle and random-algorithm layouts.** Add two-circle placement and random selection among layout algorithms, distinct from random coordinates. | `gui.menu.MenuBarCreator` (V03,V04) | `js/automata.js; app.js` |
| 60 | [ ] | **GEM layout.** Implement the original layout family with bounded convergence; test representative dense and disconnected graphs. | `gui.menu.MenuBarCreator` (V01) | `js/automata.js` |
| 61 | [ ] | **Grammar production table controls.** Add editable production columns, adjustable widths and dedicated text-size controls without losing productions. | `ChangeLog.txt; DOCS/gui.grammar.GrammarInputPane.html` (G09) | `js/app.js` |
| 62 | [ ] | **JPG / GIF / BMP image export.** Export actual files in all three formats; check decoded format, dimensions and visible graph content. | `gui.action.SaveGraphJPGAction / GIFAction / BMPAction` (F03) | `js/app.js` |
| 63 | [ ] | **Grammar and parse-diagram image export.** Export displayed grammars and normal/inverted parse or derivation diagrams, preserving complete bounds. | `ChangeLog.txt` (F04) | `js/app.js` |
| 64 | [ ] | **Empty-string display preference.** Switch lambda/epsilon consistently across editors, simulation and parsing tables without changing stored language semantics. | `gui.environment.Profile; gui.action.NewAction$NewDialog` (U01) | `js/app.js` |
| 65 | [ ] | **Original interface palettes.** Expose original palette choices, apply them consistently and persist the choice. | `gui.action.ColorChooserAction` (U02) | `js/app.js; ../style.css` |
| 66 | [ ] | **Context-sensitive help.** Route help to the active editor or operation; verify all supported modes and a sensible default. | `DOCS/index.html; gui/environment/` (U03) | `js/app.js` |
| 67 | [x] | **Shift+Enter transition continuation.** Save a valid transition, then open a blank draft with identical endpoints; support editing/new edges, self-loops and each machine type; cancellation, validation and undo must remain correct. | `DOCS/gui.editor.EditorPane.html` (U04) | `js/app.js` |
| 68 | [ ] | **State-label visibility and bulk clearing.** Hide/show labels, retain hover text while hidden, and clear all state labels with undo. | `DOCS/gui.editor.EditorPane.html` (NEW) | `js/app.js` |
| 69 | [ ] | **Guided PDA to CFG construction.** Build productions from selected PDA transitions; provide Hint, Show All and remaining-transition help, and gate export on completion. | `DOCS/gui.grammar.automata.ConvertPane.html` (C01 residual) | `js/app.js; pda-grammar.js` |
| 70 | [ ] | **Freely constructed graphical LR item automaton.** Create and reposition item-set nodes, draw goto links to new/existing nodes, choose items and apply closure; validate semantics independently of supplied canonical state numbering. | `DOCS/gui.grammar.parse.LRParseTableDerivationPane.html` (G05 residual) | `js/lr-items.js; app.js` |
| 71 | [ ] | **Linked selection in guided conversions.** Selecting productions highlights originating states/transitions and vice versa; source selections build corresponding results and identify unfinished objects. | `DOCS/gui.grammar.automata.ConvertPane.html; DOCS/gui.grammar.convert.ConvertPane.html` (C07 residual) | `js/app.js` |
| 72 | [ ] | **Minimization: Complete Subtree.** Recursively complete only the selected partition subtree, leave unrelated groups untouched, and preserve language equivalence. | `DOCS/gui.minimize.MinimizePane.html` (C04 residual) | `js/minimization-exercise.js` |
| 73 | [ ] | **Graphical minimization partition editing.** Add/remove child groups and toggle source-state membership by clicking; Check Node validates the selected partition; retain undo. | `DOCS/gui.minimize.MinimizePane.html` (C04 residual) | `js/minimization-exercise.js; app.js` |
| 74 | [ ] | **Detachable editor toolbar.** Provide a movable/detachable equivalent of the original toolbar while preserving tool selection, keyboard use and an accessible reattach path. | `DOCS/gui.editor.EditorPane.html` (NEW desktop presentation) | `js/app.js; ../style.css` |
| 75 | [ ] | **Combine non-FA automata.** Expose combination for PDA, Mealy, Moore and compatible Turing machines; reject mismatched tape counts, preserve outputs and discard the appended initial marker. | `gui.menu.MenuBarCreator; gui.action.CombineAutomaton; gui.action.AutomatonAction` (NEW) | `js/app.js` |

## Corrected false positives and dormant code

- **43 — Open URL: excluded.** `OpenURLAction.actionPerformed` immediately returns. A menu registration exists only when `Universe.CHOOSER` is null; this does not make the stub a working feature. The earlier audit inferred too much from the label.
- **46 — Lenore codec: excluded.** `decode` throws “This codec is not implemented yet”; `encode` returns its destination and `canEncode` is false.
- **45 — Optional investigation: JFLAP 3 import.** [ ] A real decoder exists, but the shipped registry registers only XMLCodec and the legacy decoder is unreferenced outside its own class. Obtain a historical fixture and establish intended invocation before implementing import. Export is a stub and is not an original parity target.
- **47 — Optional investigation: serialized structures.** [ ] A real object-stream decoder exists, but it is not registered in the supplied application's open workflow. Establish fixtures and a data-only compatibility boundary before implementing migration. `canEncode` is false and the corresponding selectable encoder is XMLCodec; do not claim original selectable serialized export.

## Existing functionality excluded from the missing list

The source and regression suite contain implementations corresponding to Tasks 01–41: simulation controls and closure stepping; batch inputs; tape choices and Turing patterns; resumable and manual grammar search; converters; parse trees/derivation graphs; editable FIRST/FOLLOW and LL/SLR exercises; guided subset, minimization and regex conversion; guided FA/grammar and CFG/PDA conversions; and grammar transformations. The old audit marks many of these missing because it predates those commits. Checking a task complete does not establish all of the original interaction details: residual guided-control gaps are explicitly captured in Tasks 69–73.

Already-present families also include the twelve structure choices, basic graph editing, local XML/JSON files, Mealy/Moore simulation, language equivalence, nested-machine simulation, L-system rewriting/3D drawing, pumping predicates, undo/redo, notes and SVG/PNG export. They are not new missing-feature tasks.

## Exactly one implementation: Task 67

Transition dialogs now support Shift+Enter to validate and save the current transition and immediately open a blank draft between the same states. Ordinary Enter applies and closes from an input/select field. Escape cancels the current draft. Each successful save has its own undo checkpoint; invalid Turing entries do not save or start another transition. The temporary keyboard handler is removed when the dialog closes so other dialogs keep their existing behavior. An inline hint explains the shortcuts.

Validation: the existing browser suite reports **147 passed, 0 failed**. Additional real Chromium keyboard checks pass for FA, self-loops, PDA, Mealy, Moore, one-tape and three-tape TM; new-edge dragging; repeated continuation; ordinary Enter; Escape; invalid TM input; undo/redo; and handler cleanup. No browser errors were observed. Reproduce with `python tests/transition-keyboard.py` in an environment with Python Playwright and Chromium installed. These are test-only prerequisites; the application still has no build/runtime dependency on them.

Only this feature was implemented. Remaining tasks are intentionally pending. The implementation, tests and audit are included together in the Task 67 commit. No additional feature task was started.
