# Convert a PDA to a context-free grammar

Open a PDA, choose **Convert → PDA → CFG**, and select final-state or empty-stack acceptance. Both modes require the entire input to be consumed. The conversion opens a separate grammar document.

The converter introduces a protected bottom marker and internal states, then normalizes transitions to one popped symbol and at most two pushed symbols. It handles empty pops, multiple popped symbols, long pushes, and multiple input symbols. A variable `[p,A,q]` represents strings that take the normalized PDA from p to q while removing A and leaving the stack below A untouched. The variable legend identifies the states and stack symbol. Useless and duplicate productions are removed.

Choose **Parse a word** to search for a derivation. The source PDA result is shown alongside the grammar result, using the original acceptance choice and a saved copy of the source machine. Pause, resume and cancel work as in ordinary derivation search. A search limit is inconclusive; neither the grammar nor the PDA is reported as rejecting merely because its search limit was reached.

**Export grammar JSON** preserves named-variable identities, the variable legend and source snapshot. **Export readable grammar** produces a reference text file. Named-variable grammars currently support derivation search and a read-only production view; LL/SLR/CYK and editing remain available for the original single-character grammars. The extended grammar is not exported as ordinary JFLAP XML, which cannot preserve these token identities. Original grammar files keep their existing behavior.

Construction stops with an explicit error if it would exceed 50,000 productions. Derivation search also has configurable work and length bounds. Validation includes bounded language comparisons with the source simulator, both acceptance modes, empty-stack recovery, uppercase terminals and non-normalized stack operations; these fixtures are checks, not a proof of full JFLAP parity.
