# JFLAP 7.1 reverse-engineering report

## Target and method

The supplied `JFLAP7.1.jar` is a ZIP/JAR, 2,659,743 bytes, SHA-256 `a22c095ddc56b18163e8ebeeef165b3a04cb570f35eb46b96105166e06c99406`. The manifest declares `gui.Main` as its entry point.

REA `open_binary` bound this exact artifact. `inspect_artifact(detail: summary)` inventoried 1,109 file entries and 55 directories, represented as 1,164 occurrences including the root and 1,154 unique content nodes. No inventory integrity contradictions were reported.

- Complete inspection: `ev_2eb1d6807365d84461c035ea3ba5983d766d56024c648c7bbc78412837939cec`
- Inventory: `ev_f4306d84dec7e0d9cfe46eab0c381add1715daebbbe6384cb91092b19b0ba6a1`
- Summary: `ev_c25f787934ff9af87542b1363d060b9d30b9825331d840654109e10d65939062`

REA’s archive inspection proves identities and contained entries. It does **not** prove runtime semantics. It covers central-directory ZIP entries, not arbitrary non-entry bytes. The complete evidence bundle was exported locally before closing the archive session. A provider-neutral replay snapshot is unavailable for this archive-only route; that does not invalidate the exported evidence bundle.

For semantics, Python’s ZIP reader extracted the bundled help and the installed JDK’s `javap -c -p` disassembled selected classes. This supplemental bytecode inspection is not presented as a REA decompiler result. No source recovery was invented. The original application was subsequently launched through the browser compatibility runtime.

## Finding ledger

| Finding | Evidence beyond archive identity | Strength and limits |
|---|---|---|
| Twelve launch choices | `gui.action.NewAction$NewDialog` button-construction constants and original chooser screenshot | Static observation, then launch UI observed |
| Menus depend on document type | `gui.menu.MenuBarCreator` constructors and action registrations | Static observation; not every menu combination exercised |
| Editor tools: state, transition, attribute, delete | `DOCS/gui.editor.EditorPane.html`, editor classes | Documented behavior; reconstructed UI tested separately |
| PDA initial stack is Z | `PDAStepByStateSimulator.getInitialConfigurations`, bytecode offsets 13–16 | Direct bytecode observation |
| PDA supports final-state or empty-stack acceptance | `PDAStepByStateSimulator` constructor and configuration creation | Direct bytecode observation |
| PDA transition checks read-prefix and pop-prefix, then pushes replacement | `PDAStepByStateSimulator.stepConfiguration`, offsets 121–180 around string and stack updates | Direct bytecode observation |
| Moore output includes initial-state output | `MooreStepByStateSimulator.getInitialConfigurations`, offsets 21–38 | Direct bytecode observation; web regression verified |
| FA labels allow ranges and multi-symbol input | `FSALabelHandler`, ChangeLog, subset-conversion help | Static/documented; web tests cover both |
| Multi-tape XML permits 1–5 tapes | `TMTransducer` / `TMBBTransducer` validation and tape attributes | Direct bytecode observation |
| TM acceptance and stay preferences | `gui.environment.Profile`, ChangeLog | Static/documented; web has final/halt/both, final transitions |
| Turing read macros include wildcard, negation and assignment | `TMSimulator.matches`, `varToChar` operations | Bytecode observed; original mode preserves these, web literal simulator does not |
| Original blocks have special XML tagging/reference behavior | `AutomatonTransducer` block/tag handling | Observed compatibility gap; new nested JSON is not a claim of exact legacy block XML support |
| Original LR workflow uses item closure and FOLLOW reductions | `LRParseTableGenerator`, LR table help | Web implements SLR, not falsely advertised as canonical LR(1) |
| L-systems use whitespace-delimited tokens and simultaneous context rules | `DOCS/gui.lsystem.LSystemInputPane.html`, `Renderer`, `Turtle` | Documented with matching constants; web tests sample rewrite/turtle behavior |
| Pumping module has 13 regular and 13 CF exercises | Concrete `pumping.reg.*` and `pumping.cf.*` classes; descriptions and membership bytecode | Inventory and selective semantic inspection; computer strategies not ported one-for-one |
| Original built-in help is incomplete for newer actions | `DOCS/index.html` and `DOCS/nohelp.html` | Explicit documentation limitation |

## Architecture

`automata.*` owns states, transitions and configurations. Type-specific subpackages implement FA/PDA/TM/transducer semantics. `grammar.*` implements productions, transformations and parsing; `regular.*` holds formal regular expressions; `pumping.*` holds language-specific games. `file.xml.*` transduces models to/from JFLAP structure XML. `gui.environment.*` wraps each model with editor and operation tabs. `gui.action.*` and `gui.menu.*` select actions supported by each environment. Swing editors/viewers display models while operation panes maintain their own conversion or simulation state.

The browser workbench mirrors that separation: algorithm modules, XML codec, examples, and an SVG/DOM application layer. Native JavaScript was chosen for the new interface; it requires no build tooling. A separately labeled CheerpJ mode runs the original JAR to retain workflows not independently reconstructed.

## Scope of conclusions

The guide covers all top-level feature families and the known action groups in this artifact. It is not a claim to have audited every method, exception path or undocumented format. Static help and bytecode were used as evidence, not as agent instructions. Embedded requests to email maintainers were not carried out. Only the human user’s task authorized analysis, implementation and GitHub publication.
