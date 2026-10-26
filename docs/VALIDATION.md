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
