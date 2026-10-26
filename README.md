# JFLAP

A browser formal-languages laboratory based on analysis of **JFLAP 7.1**.

- **[JavaScript workbench](https://philiparad.github.io/JFLAP/)** — independent HTML/CSS/JavaScript implementation with an SVG editor and directly testable algorithms.
- **[Original JFLAP 7.1](https://philiparad.github.io/JFLAP/classic.html)** — the supplied, unmodified JAR running client-side through CheerpJ. Use this for the original interface and guided workflows not reproduced in the new workbench.
- **[Feature guide](https://philiparad.github.io/JFLAP/docs/GUIDE.html)** · [Coverage](docs/COVERAGE.md) · [Analysis](docs/ANALYSIS.md) · [Task sequence](docs/TASKS.md) · [Tests](https://philiparad.github.io/JFLAP/tests/)

No React, Node.js, npm, build step, server application, or database. The workbench has no external runtime dependencies. Original mode loads CheerpJ 4.3 from its vendor CDN.

## Run locally

Serve this directory over HTTP, for example with Python:

```sh
python -m http.server 8765
```

Open `http://localhost:8765/`. Browser ES modules and the compatibility runtime require HTTP; double-clicking `index.html` is not supported.

## Workbench features

- Finite automata, PDA, Mealy, Moore, and multi-tape Turing machines; nested Turing blocks.
- State and transition editing, curved edges, labels, notes, layouts, undo/redo, browser persistence, SVG/PNG export.
- Step/fast/batch simulation, accepting traces, stack/tape/output views and explicit inconclusive search limits.
- Subset construction, complete DFA, minimization, equivalence with counterexamples, Thompson construction and state elimination.
- Grammars, bounded unrestricted derivations, FIRST/FOLLOW, LL(1), SLR, CNF, CYK, regular grammar/FA and CFG/PDA conversion.
- L-system rewriting with context rules, stochastic choices, expressions, branching and 3D turtle projections.
- Twenty-six pumping-language exercises with decomposition validation and bounded computer assistance.
- JFLAP XML and JSON import/export. See coverage notes for legacy and nested-file limitations.

## Original mode

`classic.html` executes the original application rather than claiming a JavaScript rewrite of every historical feature. Its original menu logic, exercise validators, converters and pumping strategies are preserved in the JAR. Launch was verified in a Chromium browser; exhaustive testing of every original workflow was not performed.

1. Select **Start original JFLAP** and wait for the runtime download.
2. Select any structure in the original JFLAP chooser.
3. Use the page’s import control; open `/str/filename.jff` in JFLAP.
4. Save work under `/files/filename.jff` in JFLAP, then enter that path in the page’s download field.

The CheerpJ runtime is externally hosted. Its availability and licensing are separate from this repository. Review [CheerpJ licensing](https://cheerpj.com/licensing/) for organizational deployments. No CheerpJ runtime binaries are redistributed here.

## Verification

Open `tests/index.html` to run the browser-native regression suite. It checks algorithms against language predicates, equivalent representations and round trips. These tests do **not** establish complete behavioral parity with JFLAP. See [VALIDATION.md](docs/VALIDATION.md) for the recorded result and manual checks.

## Attribution and distribution

JFLAP 7.1 is by Susan H. Rodger and contributors at Duke University. The included JAR and bundled documentation retain their original [license](vendor/JFLAP-LICENSE.txt). This distribution is free of charge. The new workbench and wrapper are identified as independent additions; the original authors do not endorse them.

Project contact and source: [philiparad/JFLAP](https://github.com/philiparad/JFLAP). Report issues there. See [NOTICE.md](NOTICE.md).
