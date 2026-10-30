# Turing machine to unrestricted grammar

The web converter uses a paired-cell construction. Each cell stores both its original input symbol and its current tape symbol. Transition productions change the tape track; only final-state cleanup emits the original input track. This generates accepted input strings rather than the machine's output tape.

Supported scope: single-tape machines without nested blocks, final-state acceptance, literal or wildcard/negated reads, literal or unchanged writes, and L/R/S movement. The input alphabet must be explicitly chosen; symbols written as tape markers need not be input symbols. Variable-assignment transitions must be expanded before conversion. Unsupported structures produce an error. This scope is explicit and is not a claim of complete original-converter parity.

Left and right boundary rules extend the tape with blank cells when required, including positions left of the initial head. Nondeterministic transitions produce alternative rewrite rules. Final states initiate a left sweep, then a right sweep, restoring the original input and removing boundary markers. Final-state outgoing transitions are not used.

The specialized derivation search fixes the input-generation phase to the requested word, then searches the generated transition and boundary productions. It does not substitute a simulator's result for a derivation. Every displayed step records the actual production and matching occurrence; tests replay those steps to check that the final terminal string is the input. Configuration and tape-length limits are inconclusive. General unrestricted-grammar search is a separate workflow.

## Evidence and reconstruction choices

Saved artifact: JFLAP7.1.jar, SHA-256 `a22c095ddc56b18163e8ebeeef165b3a04cb570f35eb46b96105166e06c99406`. Supplemental static inspection of `automata.turing.TuringToGrammarConverter` is saved in `work/bytecode/automata.turing.TuringToGrammarConverter.txt` in the analysis workspace. Its `createProductionsForInit` and `createProductionsForTransition` methods construct paired-symbol variables (`V(...)`), initialization productions and direction-specific productions. This is static evidence, not an execution trace.

The browser implementation is an independent reconstruction of the paired-cell idea with explicit tokens and boundary expansion. It does not copy the original production spelling or assertion-dependent behavior. Bounded fixtures compare generated-grammar results with the independent web simulator and replay accepted derivations. They cover blank input, overwriting, left movement, Stay, nondeterminism, wildcard/negation and unchanged writes. They do not establish equivalence for every possible machine.

## Using the workflow

Open a single-tape machine and choose **Convert → Turing machine → grammar**. Confirm the input alphabet; literal read symbols are suggested. The new document shows the alphabet, production count and the meaning of paired cells. Save as JSON to preserve token identities and the source-machine snapshot, or export readable text for reference.

In **Parse**, **Parse generated grammar** searches the fixed-input construction and shows the source machine result separately. **Show all** exposes the complete derivation, including generation, tape simulation and cleanup. **General grammar search** uses the existing incremental unrestricted rewrite search with pause/resume/cancel. The fixed-input search is bounded and does not currently resume; adjust the search limit in Preferences or use the general search when needed. Words outside the chosen alphabet are explicitly identified.
