# Coverage and compatibility

The initial-release table below is retained as a baseline. See [PARITY-TASKS.md](PARITY-TASKS.md) and the updates at the end for subsequently implemented features.

There are two deliberately labeled modes. The **JavaScript workbench is a substantial reconstruction, not a complete independent port**. **Original mode executes the unmodified JFLAP 7.1 JAR** and provides its original feature implementations through a browser runtime. Keeping the original implementations available is different from proving every workflow works under that runtime.

| Feature family | JavaScript workbench | Original mode |
|---|---|---|
| All 12 document choices | Present, multitape defaults to 2 | Original chooser, 1–5-tape chooser |
| State/transition editing and labels | Implemented, redesigned UI | Original Swing UI |
| Undo/redo, notes, layouts | Implemented subset | Original options including GEM/tree/two-circle |
| FA/PDA/TM step and fast simulation | Implemented with bounded searches | Original simulators |
| Closure stepping, freeze/thaw/remove, alternate accepting traces | Not independently ported | Original simulator controls |
| Mealy/Moore output | Implemented, initial Moore output included | Original implementation |
| Multiple-input runs | Implemented per document, CSV export | Original batch/transducer workflows |
| Turing machines | Literal single-symbol read/write, 1–5-tape imported models, L/R/S, final/halt/both, nested JSON blocks | Original macros, blocks, preferences |
| Turing shorthand variables, negation, wildcard | Not independently ported | Original implementation |
| NFA→DFA, trap state, minimization | Automatic, construction data available | Guided construction and validation |
| Equivalence | Product search with distinguishing word | Original minimized-machine comparison |
| Regex↔FA | Implemented automatically | Guided decomposition/elimination |
| FA↔right-linear grammar, CFG→PDA | Implemented | Original workflows |
| PDA→CFG and TM→unrestricted grammar | Not independently ported | Original converters with their constraints |
| Brute-force parsing | Bounded BFS, derivation table | Original pruning, pause/resume, trees |
| LL / LR | LL(1), SLR tables, step traces, conflicts reported | Editable tables, guided item automaton, conflict choices |
| CYK | Implemented with CNF conversion | Original CYK parser |
| Grammar transforms | Implemented; at most 26 variable names, empty word preserved | Original interactive transformation workflow |
| User-controlled parsing and graphical parse trees | Not independently ported | Original implementation |
| L-systems | Context/stochastic expansion, numeric expressions, 3D turtle, polygons, branch state | Original complete renderer |
| L-system colors | CSS colors; hue shortcuts are simplified and RGB/HSB triples not converted | Original palette and HSB/RGB semantics |
| Pumping exercises | 26 language predicates, manual pumping, bounded split search | Original human/computer-first strategies and case explanations |
| XML files | Ordinary FA, PDA, Mealy, Moore, TM, grammar, RE, L-system | Original full codecs including legacy formats |
| Nested-block XML | Web round trip supported; legacy block tags/references are not fully matched | Original XML handling |
| Pumping save format | JSON only | Original pumping XML |
| Image/print | SVG/PNG, browser print | Original image codecs; browser runtime may constrain desktop printing |
| Help | New guide plus bundled original help | Original contextual help |

## Deliberate safeguards and differences

- Search bounds yield **limit/inconclusive**, not a false rejection. Turing repeated configurations yield a loop result where detected.
- Conversion can expand exponentially. Subset construction caps at 2,048 states; L-system expansion caps at 200,000 symbols; pumping split search caps word length at 120 and m at 20.
- The web grammar editor treats A–Z as single-symbol variables; generated complex variable syntax is not supported there.
- Web minimization keeps a complete trap state. Original minimization can omit the trap equivalence class. The accepted language is the same.
- Web grammar normalization preserves the empty word, whereas the original transformation exercise describes restrictions on nullable start symbols.
- The original CF exercise `W1CW2CW3CW4` has inconsistent textual descriptions (one says length ≥5, another nonempty). The web exercise explicitly uses nonempty components; exact original behavior remains available in Original mode.
- The L-system parameter interpreter is a parser, not JavaScript `eval`.
- No server receives model files from the workbench. Original mode downloads its runtime from the CheerpJ CDN and uses a virtual browser filesystem.
- The upstream artifact and license are included; CheerpJ is not self-hosted. Organizational production deployment must use the vendor’s applicable licensing terms.

## What was not established

No exhaustive cross-version comparison, proof of all algorithm implementations, exhaustive original-mode acceptance testing, mobile original-mode certification, or compatibility with all historical JFLAP files was performed. See VALIDATION.md for actual checks.

## Feature-parity updates

- Task 02: Freeze, thaw and remove selected configurations are implemented. Frozen-only searches pause. Browser freeze/thaw/step check and 58 regression tests passed.

- Task 03: Search limits retain the pending step and all branches. Continue search adds budget. Browser limit-to-acceptance check and 61 tests passed.

- Task 04: Keep looking discovers further accepting traces, retaining distinct merged histories. Repeated configurations within each trace are suppressed and this bound is explained in the UI. Browser check and 64 tests passed.

- Task 05: FA Step with Closure expands initial and post-input closures with traces and resumable limits. Browser closure run and 67 tests passed.

- Task 06: PDA closure stepping distinguishes stacks, bounds infinite epsilon growth and preserves acceptance found before a limit. Browser aabb acceptance and 71 tests passed.
