# Pumping games (Tasks 49–50)

Choose a regular or context-free pumping structure, a language and a turn order, then Start game. Submit your moves; Computer move advances the opponent one turn. Illegal moves keep the current turn and show corrective feedback.

| Order | Length m | Witness w | Decomposition | Exponent i | You win the attempt when |
| --- | --- | --- | --- | --- | --- |
| Human first | Human | Computer | Human | Computer | The pumped word remains in the language |
| Computer first | Computer | Human | Computer | Human | The pumped word leaves the language |

Regular decompositions require w = xyz, |xy| <= m and |y| > 0. Context-free decompositions require w = uvxyz, |vxy| <= m and |vy| > 0. Empty fields represent the empty string. The witness must belong to the selected language and have length at least m. Exponents are 0 or integers 2 through 12, matching the original game control.

The screen shows each move, the pumped word, winner and attempt history. Try another split/exponent keeps prior attempts. Restart clears the game and lets you choose a new language/order. Free exploration retains the previous unrestricted workbench. Games survive document switches during the page session; they are not serialized or restored after reload (Task 52).

## Opponent scope

Regular games now use the original per-exercise ranges, witness formulas, decomposition choices and exponent policies for all 13 exercises (Task 50). The screen explains the selected strategy and allowed pumping length. See [the policy table and compatibility boundaries](REGULAR-PUMPING-EVIDENCE.md). Random branches retain their original distributions, without reproducing Java's internal PRNG sequence.

Context-free strategies remain Task 51. The current context-free opponent chooses m = 3, uses the existing sample, and searches legal splits against exponents 0, 2, 3, 4 (at most 5,000 candidates). It falls back to a legal split when none tested survives. It chooses the first counterexample exponent in 0, 2 through 12, or 2 if none is found. Human context-free m is 1 through 20. Both game types limit witnesses to 120 symbols. A round outcome concerns only the displayed split and exponent, never a proof of language class.

## Original evidence

REA opened the supplied JFLAP7.1.jar, identifying archive SHA-256 `a22c095ddc56b18163e8ebeeef165b3a04cb570f35eb46b96105166e06c99406`. Read-only JDK 8 javap bytecode inspection established:

- `gui.pumping.HumanFirstPane$3.actionPerformed`, `pumping.PumpingLemma.setM`, and the human regular/CF input panes' `setI`: human length, computer witness, human decomposition, computer exponent.
- `gui.pumping.ComputerFirstPane.addMGameFeatures`, `$2.actionPerformed`, `$3.actionPerformed`: computer length, validated human witness, computer split, human exponent; exponent 1 is excluded and the maximum is 12.
- `pumping.RegularPumpingLemma.setDecomposition` and `ContextFreePumpingLemma.setDecomposition`: the length and nonempty constraints above.
- Both panes' `displayEnd`: opposite win conditions, displayed pumped word and Won/Failed attempts. Submission permits another attempt; restart clears round inputs.

The original chooses lengths within language-specific ranges and calls language-specific opponent methods. The remaining bounded context-free policy is an explicit implementation choice, not a claim of strategy equivalence.

## Validation

The browser regression suite has 177 passing checks, including illegal phases/actors, invalid lengths/words/splits/exponents, both winners, retry, and both turn orders across every language entry. `python tests/pumping-game.py` runs four Chromium UI workflows (regular/CF, human/computer first), checking feedback, results, retries, document switching, free exploration and restart. Python Playwright and Chromium are test-only dependencies. Existing keyboard regression checks also pass.

Task 50 adds 3,109 controlled observations from the original Java methods. Each regular exercise has a fixture comparison, and integrated games cover both length-range endpoints and random branches. The Chromium script also exercises both roles for all 13 regular exercises. Regenerate the fixture with `python tests/regular-pumping-fixture.py --java-home <JDK-path> --jar <original-JFLAP7.1.jar>`.
