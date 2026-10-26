# Sequential implementation plan

Evidence: REA `ev_2eb1d6807365d84461c035ea3ba5983d766d56024c648c7bbc78412837939cec`, bundled DOCS, and JVM bytecode inspection. Tasks are implemented in the order below. Completion means implemented and checked, not byte-for-byte parity with Java Swing.

1. [x] Identify archive, inventory features, inspect help and selected bytecode.
2. [x] Automaton data model and FA simulation; subset construction, minimization, equivalence, regular expressions.
3. [x] PDA, Mealy, Moore and multi-tape Turing simulation with traces and limits.
4. [x] Grammar editing, derivations, FIRST/FOLLOW, LL and LR tables, CYK and transformations.
5. [x] Conversion bridges between automata, expressions and grammars.
6. [x] L-system expansion and turtle rendering; pumping-lemma workbench.
7. [x] JFLAP XML import/export and browser persistence.
8. [x] Interactive editor, menus, state/transition editing, undo, layouts and simulation UI.
9. [x] Specialized workspaces, examples, educational steps and feature guide.
10. [ ] Algorithm regression suite, browser checks, compatibility and coverage audit.
11. [ ] Publish GitHub repository JFLAP and enable GitHub Pages.

Every known difference or unsupported original feature must be listed in COVERAGE.md. Do not label incomplete fidelity as a full replica.

## Coverage decision

The independent workbench does not reproduce every original workflow. An additional original-JAR mode preserves those implementations through CheerpJ. This decision and all known independent-port gaps are documented in COVERAGE.md, rather than silently marking them as rewritten. Task 5 includes implemented FA/RE/grammar/CFG-to-PDA bridges; PDA-to-CFG and TM-to-grammar remain in Original mode.
