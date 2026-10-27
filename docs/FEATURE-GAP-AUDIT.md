# Original JFLAP 7.1 versus the JavaScript workbench

Comparison date: 27 October 2026.

“JFLAP.1.jar” is interpreted as the previously supplied `JFLAP7.1.jar`. Its SHA-256 was rechecked: `a22c095ddc56b18163e8ebeeef165b3a04cb570f35eb46b96105166e06c99406`.

GitHub main was checked and remains at [a288baa](https://github.com/philiparad/JFLAP/commit/a288baa234f1a38e0ca9942bcb930ac1a2d8f09e). This report compares that implementation with the original artifact. It does not modify the application or publish new changes.

The comparison below concerns the **independent HTML/CSS/JavaScript workbench**. The website also provides **Original mode**, which executes the JAR through CheerpJ. Having the original Java code available there does not mean those features have been recreated in JavaScript. Original-mode startup was verified previously; every original workflow has not been tested in that browser runtime.

## Missing features and incomplete original workflows

“Missing” means there is no corresponding independent workbench feature. “Partial” means the core operation exists, but the specified original capability is absent or differs materially.

| ID | Original capability absent from the workbench | Status / what exists instead |
|---|---|---|
| S01 | **Step with Closure** for finite and pushdown automata, separately from Step by State | Partial: individual transition stepping exists; no closure-step mode. |
| S02 | **Freeze** selected running configurations | Missing. |
| S03 | **Thaw** frozen configurations | Missing. |
| S04 | **Remove** selected configurations from a running simulation | Missing. |
| S05 | Display the automaton alongside simulation configurations and highlight current states as execution advances | Partial: configurations and traces exist, but the simulation panel does not display the live graph. |
| S06 | Fast Run **Keep looking** for alternative accepting computations after finding an acceptance | Missing: the runner stops when acceptance is found. It can display several configurations from that frontier, which is not continued searching. |
| S07 | Continue a long-running search after the original runtime's configuration-count prompt | Partial: the web runner terminates with `limit`; there is no continue-from-that-limit control. |
| B01 | **Batch Test** the same inputs against multiple FA/PDA/TM files | Missing: web Multiple Run tests one document at a time. |
| B02 | Original batch controls for adding/removing machine files and editing the selected file | Missing. |
| B03 | **Load Inputs** from an input-string file in the simulator/batch workflow | Missing: web inputs are entered or pasted in a textarea. |
| B04 | **Multiple Brute Force Parse** for grammars | Missing: the grammar parser accepts one input per invocation. |
| B05 | **Multiple CYK Parse** for grammars | Missing: the grammar CYK interface accepts one input per invocation. |
| C01 | **PDA → context-free grammar** conversion | Missing entirely from independent converters. |
| C02 | **Turing machine → unrestricted grammar** conversion and its associated generated-grammar workflow | Missing entirely. |
| C03 | Guided **NFA → DFA** construction: build subset states/transitions yourself and have the construction checked | Partial: automatic subset construction exists, with construction data. |
| C04 | Guided **DFA minimization** using the partition/distinguishability tree and construction of the result | Partial: automatic minimization exists. |
| C05 | Guided **FA → regular expression** elimination: interactively select/collapse states and work through intermediate graphs | Partial: automatic state elimination exists. |
| C06 | Guided **regular expression → NFA** decomposition and interactive construction | Partial: automatic Thompson construction exists. |
| C07 | Guided **FA → grammar**, **right-linear grammar → FA**, and **CFG → PDA (LL/LR)** construction, with selective assistance and validation | Partial: these conversions generate their results automatically. |
| C08 | Interactive grammar-transformation exercises: enter/check nullable sets, unit dependencies, useful-variable dependencies and individual replacement productions | Partial: lambda/unit/useless removal and CNF conversion exist as automatic operations. |
| G01 | **User Control Parse**: choose which production and occurrence to rewrite | Missing. Displaying a precomputed derivation one row at a time is not user-controlled parsing. |
| G02 | Graphical parse trees, including inverted/non-inverted views and grouped multiple-parent nodes for unrestricted derivations | Missing: derivation tables, stacks and a CYK chart exist. |
| G03 | Manually enter **FIRST and FOLLOW** sets and validate each stage | Partial: sets are generated and displayed. |
| G04 | Manually construct/edit **LL and LR parse tables**, including Do Selected / Do Step / Do All assistance | Partial: automatic tables exist; they are read-only. |
| G05 | Graphically construct the **LR item automaton**, including goto transitions, item choices and closure exercises | Partial: generated LR(0) item sets are displayed as text. |
| G06 | Select an action in an ambiguous LR table cell before parsing | Missing: the web parser reports conflicts and refuses to parse with them. |
| G07 | Highlight the parse-table cell and tree node currently used during parsing | Missing: the web trace gives textual actions. |
| G08 | **Pause/Resume** an ongoing brute-force grammar search, with live search progress | Missing: the bounded web search runs synchronously and returns a result. |
| G09 | Grammar-table text-size slider and resizable production-column interface | Missing: the web editor uses a textarea. Browser zoom is available, but is not the original dedicated control. |
| T01 | Turing read/write shorthand: wildcard matching, negated symbols, symbol assignment and variable reuse | Missing: the web simulator compares literal symbols; the editor rejects multi-character read/write fields. |
| T02 | Choose the number of tapes when creating a multi-tape machine | Partial: creation defaults to two tapes. Import supports 1–5 tapes; there is no tape-count chooser. |
| T03 | Preference to disallow **Stay** moves in the transition editor | Missing: the web editor always offers L/R/S. |
| T04 | Exact compatibility with original nested-building-block XML tags and references | Partial: nested editing/simulation and the web's own round trip exist, but they do not implement the complete legacy block schema. |
| P01 | Original human-first/computer-first pumping-game sequence and opponent roles | Partial: the workbench provides witness generation, manual pumping and a split helper, not the full game. |
| P02 | Original language-specific computer strategies and case-by-case explanations | Missing: the split helper only tests a finite set of exponents. |
| P03 | Original pumping-game XML save/load | Missing: web pumping documents use JSON, and that JSON does not preserve a complete ongoing original-style game. |
| L01 | Exact original L-system named color palette, including names without CSS equivalents | Partial: the renderer passes color strings to SVG/CSS. |
| L02 | Original numeric **HSB/RGB color triples** | Missing: triples are not converted into CSS color values. |
| L03 | Original hue-shift semantics preserving saturation/brightness and leaving achromatic colors unchanged | Partial: the web implementation constructs an HSL color with fixed saturation/lightness. |
| L04 | L-system parameter-name picker and editable parameter table | Missing: the web editor uses plain `name = value` text. |
| L05 | Live rendering progress and the original scrollable, extent-based drawing view | Partial: the web renderer runs synchronously and fits the result into an SVG view. |
| V01 | **GEM** graph layout | Missing. |
| V02 | **Tree / Degree** and **Tree / Hierarchy** layouts | Missing. |
| V03 | **Two Circle** graph layout | Missing. |
| V04 | Select a random layout algorithm | Missing: a Random coordinate layout exists, which is a different operation. |
| V05 | Original full reflection set, graph rotation and **Fill Screen With Graph** | Partial: one horizontal-reflection command and zoom controls exist; the other reflection axes, rotation and fit command do not. |
| F01 | **Open URL** for loading a structure | Missing: the workbench imports local XML/JSON files. |
| F02 | Original non-XML/legacy codec compatibility, including JFLAP 3 and serialized structures | Missing in the web decoder, which only handles supported XML structures and JSON. The JAR contains JFLAP3Codec, SerializedCodec and LenoreSystemsCodec; individual historical fixtures were not tested. |
| F03 | Export **JPG, GIF and BMP** images | Missing: web image export supports SVG/PNG. |
| F04 | Image export of grammar displays/parse diagrams | Missing: web image export is restricted to automata, with a separate L-system SVG export. |
| F05 | Desktop **Save/Save As** association with an existing file, allowing later saves back to that file | Partial: web Save downloads a new copy; localStorage supplies browser persistence. |
| F06 | Independent operation tabs that remain open and can be dismissed individually, plus separate structure windows | Partial: the workbench has document switching and fixed mode tabs, not the original per-operation window/tab model. |
| U01 | Configurable empty-string display symbol (**lambda/epsilon**) | Missing as a preference. Both symbols are accepted as input aliases, which is different from choosing the display convention. |
| U02 | Original selectable interface color palettes | Missing: the workbench has a fixed theme. |
| U03 | Context-sensitive help automatically selected for the active operation | Partial: general help, the new guide and the original help files exist, but operation-to-help routing is not reproduced. |
| U04 | Transition-entry shortcut to finish one transition and immediately start another between the same states (Shift+Enter) | Missing: the web modal has an Apply action without this continuation shortcut. |

## Additional compatibility limits, not wholly missing features

- Grammar algorithms treat single A–Z characters as variables, and transformations have a limited pool of fresh names. The complete original conversion-generated variable syntax is not implemented.
- The JavaScript workbench imposes explicit search/construction limits. Examples include 2,048 subset states, bounded parser searches, an L-system UI depth of 10 and a 200,000-symbol expansion limit. These are limits on supported operations, not evidence that the operations themselves are missing.
- Pumping split search limits word length and pumping length and checks only selected exponents. It cannot substitute for the original language-specific strategy implementation or establish a universal pumping claim.
- The original CF exercise W1CW2CW3CW4 has inconsistent descriptions. The web implementation chooses nonempty components; exact agreement with every original exercise strategy was not established.
- Default layout aesthetics, trap-state retention during minimization and grammar normalization details differ. These differences should not be counted as absent language-equivalence, minimization or CNF features.
- Direct desktop printing, filesystem integration and native windows cannot be assumed identical in either browser mode.

## Features that should NOT be marked missing

The workbench has all twelve top-level structure choices. It already implements ordinary FA/PDA/TM simulation; Mealy/Moore output; multiple-input machine runs and trace viewing; lambda/nondeterminism highlighting; language equivalence; automatic NFA/DFA/minimization/regex conversions; FA/regular-grammar and CFG/PDA bridges; FIRST/FOLLOW, LL, SLR and CYK; grammar transformations; nested Turing editing/simulation; L-system rewriting and 3D turtle drawing; pumping-language exercises; ordinary JFLAP XML import/export; undo/redo; notes; transition-curve editing; and several layouts. The gaps above are more specific than these feature-family labels.

## Evidence and confidence

This is a static feature/workflow audit, using the saved REA archive evidence, the JAR's help and changelog, fresh selected JVM bytecode inspection, and the current web source. It is not an exhaustive execution of every possible input or undocumented Java method.

Original evidence:

- REA artifact inspection `ev_2eb1d6807365d84461c035ea3ba5983d766d56024c648c7bbc78412837939cec`; archive identity rechecked by SHA-256.
- `gui.menu.MenuBarCreator`: File/Input/View/Test/Convert action registration and complete layout-menu labels.
- `gui.action.NewAction$NewDialog`: Batch and Preferences menus.
- `gui.action.TestAction`, `BatchMultipleSimulateAction`: multi-file test selection, Load Inputs, Add/Remove File, Edit File and Save Results controls.
- `gui.environment.Profile`, `gui.action.ColorChooserAction`, `automata.turing.TMSimulator`: preference and macro behavior.
- Bundled `ChangeLog.txt`: grammar image export/text sizing and Turing preferences.
- Bundled help for simulation, fast run, deterministic/minimization/regex/grammar conversions, grammar transformations, LL/LR table construction, brute parsing, L-systems and File menu.
- `file.*Codec` and `file.xml.*Transducer` inventory, plus previously inspected block XML bytecode.

Web source at the compared commit:

- [app.js](https://github.com/philiparad/JFLAP/blob/a288baa234f1a38e0ca9942bcb930ac1a2d8f09e/js/app.js): menus, all editor/simulation/parser/renderer/game controls and export restrictions.
- [simulation.js](https://github.com/philiparad/JFLAP/blob/a288baa234f1a38e0ca9942bcb930ac1a2d8f09e/js/simulation.js): literal Turing matching, configuration handling and search stopping.
- [grammar.js](https://github.com/philiparad/JFLAP/blob/a288baa234f1a38e0ca9942bcb930ac1a2d8f09e/js/grammar.js): table generation, conflict handling, parsing and variable conventions.
- [files.js](https://github.com/philiparad/JFLAP/blob/a288baa234f1a38e0ca9942bcb930ac1a2d8f09e/js/files.js): supported import/export formats.
- [lsystem.js](https://github.com/philiparad/JFLAP/blob/a288baa234f1a38e0ca9942bcb930ac1a2d8f09e/js/lsystem.js): color/hue implementation and expansion limits.
- [examples.js](https://github.com/philiparad/JFLAP/blob/a288baa234f1a38e0ca9942bcb930ac1a2d8f09e/js/examples.js): fixed two-tape creation default.

This audit extends the earlier COVERAGE.md: in particular, it adds concrete batch, grammar-batch, layout, preferences, image-export, file-workflow and editing gaps. The previous 54 passing tests do not establish complete feature parity.
