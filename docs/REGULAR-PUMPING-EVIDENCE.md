# Regular pumping opponent evidence (Task 50)

The implementation in `js/regular-pumping.js` follows read-only JDK 8 `javap -p -c` inspection of `pumping.reg.*`, `pumping.PumpingLemma`, `pumping.RegularPumpingLemma`, and `pumping.LemmaMath` in the supplied JFLAP7.1.jar. The artifact SHA-256 is `a22c095ddc56b18163e8ebeeef165b3a04cb570f35eb46b96105166e06c99406`.

Each language class supplies `setRange`, `chooseW`, `chooseI` and, when overridden, `chooseDecomposition`. `PumpingLemma.chooseM` draws uniformly from the inclusive range. `LemmaMath.flipCoin` returns 0 or 2 equiprobably. The base regular decomposition chooses a random x length from 0 through m−1 and makes y fill the rest of the first m symbols. These distributions are retained through injectable randomness; matching the Java PRNG's internal seed sequence is not claimed.

The table gives split lengths (|x|, |y|); the remaining suffix is z. Let first(a) or first(b) be the zero-based first occurrence. Let even(m) = m when even, m+1 when odd.

| Exercise | m range | Computer witness | Computer split | Computer exponent |
| --- | --- | --- | --- | --- |
| AnEven | 2–18 | a^even(m) | (0,2) | 0 or 2 |
| NaNb | 2–17 | a^m b^(m+1) | (min(m−1,first(b)),1) | 2 |
| AB2n | 4–10 | (ab)^even(m) | (0,4) | 0 or 2 |
| ABnAk | 2–11 | (ab)^(m+1)a^m | (0,2) | 0 |
| AnBn | 4–18 | a^m b^m | Base random-prefix split | 0 or 2 |
| Palindrome | 2–10 | a^m bb a^m | (min(floor(length/2)−1,m−2),2) | 0 or 2 |
| BBABAnAn | 5–10 | bba(ba)^m a^(m−1) | (1,2) | 0 or 2 |
| B5W | 6–10 | b^5 b^(2(m−5)) a^(3(m−5)) | End E just after third a after prefix: (min(E−5,m−5),5) | 0 or 2 |
| BkABnBAn | 4–15 | b^4 (ab)^floor(m/2) (ba)^floor(m/2) | (0,1) when initial b run >4; otherwise central four symbols if within m; otherwise base random-prefix split | 0 |
| AnBk | 3–10 | a^(m−2)bb for even m; ab^m for odd m | (0,2) if at least two leading a symbols or no b; otherwise (first(b),2) | 0 or 2 |
| AnBkCnk | 2–9 | a^m b^m c^(2m) | Base random-prefix split | 0 or 2 |
| AnBlAk | 2–15 | a^6 b^max(4,m) a^max(4,m) | (0,1) when leading a run >6; otherwise (min(first(b),m−1),1) | 0 |
| B5Wmod | 8–20 | Five b symbols plus independent random a/b symbols until length >=m and suffix length divisible by3 | (5,3) | 0 |

Explanations are plain-text paraphrases of the original `setDescription` methods supplemented with the actual opponent choices. They describe the designated witness argument separately from defensive choices against arbitrary accepted witnesses.

## Observed boundaries

- Original strategies are policies, not unbeatable opponents. Preserve their chosen split and exponent rather than replacing them with finite membership search.
- AB2n selects all of `abab` as y when that shortest accepted word is supplied with m=4. Exponent0 produces the empty word, excluded by the exercise's n>=1 condition. The browser preserves that split and reports membership truthfully; its explanation explicitly notes this edge case rather than repeating the original unconditional pumping claim.
- B5W's scan for the third a assumes an accepted witness with length at least m>=6. That precondition implies the three a symbols exist. The browser adds a defensive error for malformed direct calls instead of reading beyond the string.
- Ranges and witnesses are small enough for the existing game witness bound of 120 symbols. This task does not change context-free strategies or the separate XML game-persistence task.
