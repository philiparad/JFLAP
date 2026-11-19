# Validation record

## Independent JavaScript workbench

Browser regression suite: **54 passed, 0 failed**, run in the Codex Chromium browser against the local HTTP site. The suite is shipped at `tests/index.html` and has no test framework or Node dependency.

Coverage includes:

- Binary suffix language tested for every string up to length 7; determinization compared on the same set.
- Minimization and FA/regex/grammar round trips checked by language equivalence, including a distinguishing empty word.
- Multi-character transitions, ranges, empty transitions and cycles.
- PDA final-state/empty-stack acceptance; Mealy and initial Moore outputs.
- Single/multi-tape TM behavior, negative tape indices, final/halting acceptance, bounded nontermination and nested blocks including an empty block.
- FIRST/FOLLOW, LL, SLR, conflict detection, unrestricted derivations, CNF/CYK on all {a,b} words through length 5, unit/useless removal and CFG/PDA conversions.
- XML round trips for nine structure variants; malformed XML and escaped text.
- Simultaneous/contextual L-system expansion, turtle branch restoration and expression parsing.
- Pumping decomposition checks, counterexamples, all 26 sample generators and bounded split selection.

Manual browser checks: initial SVG editor rendering; finite-automaton fast run of `1101` accepted in 4 steps / 7 configurations; creation of grammar documents; example loading; LL parsing of `aabb` accepted with a seven-row trace. No browser console errors were reported during these checks.

The tests are independent JavaScript assertions, not an exhaustive differential harness against Java JFLAP. They do not establish complete parity. Two extra regressions were added after fixing nested-block configuration identity and multi-tape diagnostics.

## Original JFLAP mode

CheerpJ 4.3 loaded from the vendor CDN; the exact supplied JAR launched. The twelve-choice JFLAP 7.1 launcher rendered. Opening Finite Automaton produced the original Swing editor and menus. Selecting the State tool and clicking twice created q0 and q1, verified visually.

Not yet exhaustively tested: every converter/game/parser under CheerpJ, all legacy formats, printing, every original keyboard shortcut, and large application workloads. The runtime/file wrapper follows the vendor’s published APIs; full file-import/save/download round trips have not yet been manually exercised.

## Static and packaging checks

- Original JAR identity is recorded in ANALYSIS.md and NOTICE.md; its bytes are unmodified.
- The original license and help are included.
- No React, Node.js, package manager, build system or application backend is used.
- Workbench modules run locally from an HTTP server; original mode additionally requires the external runtime download.
- Coverage gaps are listed in COVERAGE.md and surfaced by the separate Original mode link.

Deployment verification is recorded after GitHub Pages is enabled; do not infer a successful public deployment solely from a local test result.

## Public deployment

GitHub Pages build #1 completed successfully (run 40257711123). The public workbench loaded and the deployed tests reported 54 passed, 0 failed. A live check exposed mojibake in static index labels introduced by a local text-edit encoding mismatch; those labels were corrected in the final verification commit. Public original-mode startup and guide checks are recorded in the final handoff.

## Task 63 — 19 November 2026

233 passed, 0 failed in Chrome. Grammar image checks cover long/all productions, XML escaping, named tokens, empty sides, every raster format, full diagram bounds, highlighting, inversion coordinates and unchanged source data. Focused UI checks exported the example grammar as PNG and its inverted parse tree at the second step as SVG.

## Task 64 — 19 November 2026

236 passed, 0 failed in Chrome. Tests cover glyph selection, protected named-variable/quoted-terminal literals, unchanged XML and grammar semantics, equivalent simulation/parse results and table hints. UI checks verify preference reload persistence, epsilon in FIRST/FOLLOW, parse trees, multiple-run inputs/results and completed nullable-removal productions.

## Task 65 — 19 November 2026

238 passed, 0 failed in Chrome. Original state, state-highlight, arrow and arrow-highlight colors are checked on mounted diagrams for all six original palettes. Every palette is rasterized from standalone SVG with graph and parse-highlight pixel checks. Browser checks confirmed seven choices, switching during a running simulation, cached operation restoration and persistence after reload.

## Task 66 — 19 November 2026

241 passed, 0 failed in Chrome. Help coverage enumerates all editor families and operation routes, every grammar parser and exercise mode, named-variable grammar behavior and the unknown-context fallback. Every help file and guide anchor resolves. UI checks cover the header and Help menu, F1 while focused in a parser input, SLR routing and switching FIRST/FOLLOW ↔ LR item construction. Closing help retains the active operation; no browser errors were observed.

## Task 68 — 19 November 2026

244 passed, 0 failed in Chrome. Tests verify escaped hover text, unchanged machine behavior/outputs and nested labels after clearing, and hidden-label image bounds with retained SVG titles. UI checks hide/show labels, retain hover titles, clear two labels in one operation, undo/redo that change, restore hidden visibility after reload and continue a simulation after changing label visibility.
