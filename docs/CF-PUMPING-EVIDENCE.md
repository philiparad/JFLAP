# Context-free pumping opponent evidence (Task 51)

The policies in `js/cf-pumping.js` are reconstructed from read-only JDK 8 `javap -p -c` inspection of the supplied JFLAP7.1.jar, SHA-256 `a22c095ddc56b18163e8ebeeef165b3a04cb570f35eb46b96105166e06c99406`. The inspected entry points are `pumping.cf.*.setRange`, `chooseW`, `chooseDecomposition`, `chooseI`, and the base `ContextFreePumpingLemma.chooseDecompositionWithoutCases`. Per-exercise explanations are plain-text paraphrases supplemented with the observed choices and explicit boundaries.

Every exercise chooses m uniformly within its inclusive range. Coin choices use 0 and 2 with equal probability. Injected random draws let tests replay exact branches; Java's PRNG seed sequence is not reproduced.

The split below lists lengths (u,v,x,y); z is the remaining suffix. A random fallback means the original proposal algorithm, not a finite-exponent membership search.

| Exercise | m range | Witness | Split policy | Exponent |
| --- | --- | --- | --- | --- |
| AnBnCF (original AnBn) | 4–11 | a^m b^m | One a and adjacent b at the center | 2 |
| AnBnCn | 3–11 | a^m b^m c^m | Random fallback | 0 or 2 |
| AkBnCnDj | 3–5 | a^m b^m c^m d^(m+1) | Pair b/c boundary; else a/d boundary; else random | 2 if v+y contains exactly one a, otherwise 0 |
| AnBjAnBj | 3–5 | (a^m b^m)^2 | Two single symbols with gap min(length/2−1,m−2), beginning at 0 when a occurs | 0 |
| AiBjCk | 3–7 | a^(m+1)b^m c^m | First symbol if #a exceeds both other counts by more than one; else random | 0 if v or y contains a, otherwise 2 |
| NagNbeNc | 3–7 | a^(m+1)b^m c^m | First symbol if #a > #b+1; else random | 0 if v or y contains a, otherwise 2 |
| NaNbNc | 3–6 | a^m b^(m+1)c^(m+2) | First c if #c > #b+1; else first b if #b > #a+1; else random | 0 if v+y contains c, otherwise 2 |
| WW | 3–6 | (a^m b^m)^2 | Matching one-symbol duplications in both halves that fit m; else random | 0 |
| WW1WrEquals | 3–10 | a^m b^m a^m | (0,1,0,0) | 0 or 2 |
| WW1WrGrtrThanEq | 1–7 | a^m babab a^m | (floor(length/2),1,0,0) | 0 or 2 |
| W1BnW2 | 2–10 | a^m b^(m+1)a^(m+1) | Rightmost single-symbol deletion preserving membership; else random | 2 if length(u) < m, otherwise 0 |
| W1CW2CW3CW4 | 2–7 | a^m b^m c a^m b^m c a c b | Try first word pair, then second; select a single-symbol or matching two-symbol split; else random | 0 |
| W1VVrW2 | 2–15 | (ab)^floor(m/2) abbbba (ab)^floor(m/2) | Locate balanced embedded palindrome, then its center pair or an outer b | 3 |

## Helper algorithms and boundaries

`WW.chooseDecomposition` compares one-symbol duplications in the first half, in original loop order, to choose equivalent pump locations across the two copies. `W1CW2CW3CW4.checkIfPossibility` uses an analogous comparison for each c-separated pair, with a separator included in the gap. `W1VVrW2.getVVr` scans palindrome end positions from right to left and starts from left to right, accepting the first even palindrome of at least six symbols whose surrounding a counts match. These are preserved policies rather than guaranteed winning strategies.

The base random algorithm chooses u uniformly from 0 through length−1, v from 0 through min(remaining,m), then x and y. Its bounds do not subtract v when budgeting x and y. Consequently it sometimes proposes v+x+y > m; the original setter rejects the proposal and leaves its parts empty. The browser returns a null proposal and keeps the game on the computer's turn with a retryable explanation. It does not invent a legal replacement or report a winner for an invalid split. The finite original-method fixture includes these rejected proposals.

The longest generated witness within the original ranges is below the browser's 120-symbol witness limit. Exponents 0, 2 and 3 fit the existing game control. The strategy functions validate split bounds defensively rather than reproducing Java substring exceptions on malformed direct calls.

## Resolving W1CW2CW3CW4

Some original help/description wording presents unequal word pairs. The executable `W1CW2CW3CW4.isInLang` checks `w1.equals(w2) || w3.equals(w4)`, requires four nonempty a/b words separated by exactly three c symbols, and its witness satisfies equality in the first pair. The browser therefore retains equality, labels it explicitly, and explains the contradictory prose instead of silently changing the executable language. Tests include equal and unequal examples and compare original membership outcomes.

## Validation boundary

The original Java fixture invokes the shipped methods with controlled random draws and records witnesses, splits, exponents and membership outcomes. It exercises every allowed m for each exercise, the smallest two and largest lengths for split/exponent branches, legal boundary decompositions, additional accepted words and rejection cases. Matching these finite observations, supported by bytecode inspection, establishes the tested policy behavior; it is not a universal equivalence proof or a port of the separate case-analysis UI and persistence workflow.
