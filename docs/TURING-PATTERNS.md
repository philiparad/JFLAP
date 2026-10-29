# Turing transition patterns

Read a literal symbol or leave the field empty for a blank cell. `□` also denotes blank. `~` reads any symbol, including blank, on every tape. In a write field, `~` leaves the cell unchanged.

On a single tape, `!a` matches anything except `a`; `!□` matches nonblank cells. `a,b}x` matches either listed symbol and stores the matched symbol in variable `x`. A later write field containing `x` writes the stored symbol. `□}x` captures blank. An unbound write symbol is a literal. Read fields remain literal/pattern matches: variable substitution applies to writes. A bound variable cannot be a choice on the left of an assignment.

Each simulation branch owns its bindings, and starting a new simulation clears them. Multi-tape machines support literals and `~`, but assignment and negation require one tape, matching the original simulator's separate multi-tape path.

Evidence: JFLAP7.1.jar, `automata.turing.TMSimulator.matches` and `stepConfiguration`, inspected in saved bytecode. The web implementation deliberately uses per-configuration bindings instead of the original simulator-wide map so nondeterministic branches cannot contaminate each other. It rejects malformed patterns instead of reproducing assertion-dependent behavior.
