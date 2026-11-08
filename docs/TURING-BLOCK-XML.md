# Original Turing building-block XML (Task 42)

The workbench now reads original `<block>` states with `<tag>` references to named machine elements anywhere in the structure. It also continues to read the earlier web inline `<state><automaton>…` representation. Saving a machine containing blocks writes the original named-definition representation and `turingbb` type.

Original artifact: bundled JFLAP 7.1, SHA-256 `a22c095ddc56b18163e8ebeeef165b3a04cb570f35eb46b96105166e06c99406`. The prior REA inventory is `ev_f4306d84dec7e0d9cfe46eab0c381add1715daebbbe6384cb91092b19b0ba6a1`. Implementation was informed by JVM bytecode for `AutomatonTransducer`, `TMBBTransducer`, `TMTransducer` and `TransducerFactory`, and checked against the actual original codec, not just synthetic XML.

## Preserved behavior

- State IDs, names, coordinates (including zero), initial/final markers, labels, nested machines and notes.
- Named references, including repeated references to the same definition. Imported instances remain independently editable, as they are in the original decoder. Identical instances reuse the original name on export; if one changes, it receives a distinct definition name so neither edit is lost. Incidental document-view names do not split references.
- Empty referenced definitions represent ordinary leaf states, without an invalid nested simulation call.
- `transition block="true"` means read-only branching: write `~` (unchanged) and stay on the same tape cell. The flag is preserved on export. Editing its effective write or move produces an ordinary transition instead of silently discarding the edit.
- Earlier web inline blocks migrate on save. Invalid, missing or ambiguous references, cycles, invalid tape indices and mismatched nested tape counts produce explicit errors.

## Format limits and original quirks

The original `TransducerFactory` chooses the ordinary TM reader whenever a `<tapes>` tag exists, ahead of checking for blocks. Single-tape block exports therefore omit `<tapes>`, just as the original encoder does. Multi-tape block documents remain supported for web import/export/simulation, but JFLAP 7.1's ordinary file-opening route cannot reliably reopen them; no original multi-tape block compatibility is claimed. Ordinary multi-tape machines retain their existing format.

References resolve within the supplied XML, without loading external files. Import permits at most 64 nested levels and 20,000 expanded states. Cyclic model objects are rejected on export. Invalid or conflicting definition names are replaced with distinct XML-safe names. Recursive references are not a supported execution model.

## Validation

`tests/fixtures/original-blocks.jff` was generated using the unchanged JAR through `tests/BlockCodecFixture.java`. It includes shared references, nested leaf definitions, a read-only block transition and escaped state text.

The browser suite passes **151 tests, 0 failures**. New tests check the original fixture's acceptance/rejection and tape result in the web simulator, reference preservation, independently edited instances, nested two-tape web round trips, labels/notes, inline migration and malformed-reference rejection. The existing transition-keyboard interaction checks also pass.

`tests/block-xml.py` generates a fresh fixture with the original Java codec, imports it through the file picker, enters/exits its nested editor, downloads the exported file, verifies its references and flags using the original Java decoder, and imports it back into the browser. This check passes without browser errors.

Run the cross-codec check with Python Playwright/Chromium and an existing JDK:

```text
python tests/block-xml.py --java-home "C:/Program Files/Java/jdk1.8.0_202"
```

The Java test is a file-codec oracle, not an assertion of full original simulator equivalence. An exploratory direct `TMSimulator.simulateInput` probe did not terminate and was stopped; it is excluded from the passing codec checks. Simulation assertions above use the workbench's bounded runner. No new application runtime or build dependency is introduced.
