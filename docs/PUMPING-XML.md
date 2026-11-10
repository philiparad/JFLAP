# Pumping game persistence (Task 52)

New pumping documents save as .jff XML. Save reuses a chosen file; Download copy produces a separate file. Open resumes a saved game. Games also persist through browser reloads, and files opened as JSON retain JSON format. Only submitted moves are saved; unfinished text in an input field is not a move.

The saved state retains the exercise, first player, current turn, moves, completed attempts and pending retries. Restoring replays validated saved moves, recalculating outcomes without making fresh random choices. Restart clears the game and imported case progress. Changing the exercise clears incompatible progress.

## Original format

REA identified the supplied JFLAP7.1.jar by SHA-256 `a22c095ddc56b18163e8ebeeef165b3a04cb570f35eb46b96105166e06c99406`. Its pumping XML codecs use structure types `regular pumping lemma` and `context-free pumping lemma`, exact original exercise titles in `name`, and `Human`/`Computer` first-player values. The file stores m, w, i and decomposition lengths; unset m/i use -1. Repeated attempt elements store plain-text summaries. Context-free case records contain four lengths and an exponent.

The browser reads and writes those original fields and preserves imported attempt summaries and CF case records. Case records remain data; this task does not introduce the original case-analysis interface. Original files have no explicit turn or full move log, so their current turn is inferred from populated values. Imported summary-only attempts cannot reconstruct earlier individual moves.

Browser exports additionally contain `web-name` (the document name) and `web-game` (versioned JSON text inside XML). The original reader ignores these elements, verified with the original Java codec. They preserve exact pending computer turns, retry state, move history and computed attempts when reopened in the browser. Opening and resaving through original JFLAP can discard these extra details; the original fields remain usable. A browser-imported native completed attempt is not duplicated in the native attempt list when exported again.

Snapshot validation enforces role/turn order and legal moves, rejects conflicting native and extension fields, and checks language/type consistency. Invalid files report an error rather than inventing progress. Existing legacy JSON documents containing only a language still open as unstarted games; the historical CF AnBn identifier is normalized to AnBnCF.

## Verification

- 198 browser regression checks, including all 26 exercises, both roles and every game phase, XML/JSON round trips, history, snapshots and malformed-state rejection.
- `python tests/pumping-persistence.py`: real downloads, Open, page reload, retry and restart at every phase for regular/CF games in both roles.
- `python tests/pumping-xml.py --java-home <JDK-path>`: 16 original Java-generated XML states pass browser import/export and original Java decoding, including role, attempts and CF cases; UI Open/Download also passes.
- Existing keyboard and file-saving workflows remain covered. Python Playwright/Chromium and Java are test-only prerequisites; the app has no new runtime dependency.
