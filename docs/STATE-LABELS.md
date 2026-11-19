# State-label controls

Use **View → Hide state labels** or **Show state labels** to control auxiliary labels beneath states. State names and Moore outputs remain visible. Hover titles include the state name and full label, including when the label is hidden.

Visibility applies throughout the workbench, including simulation and conversion graphs, and is remembered in this browser. Existing operation panes update without restarting their computations. SVG and raster image exports use the same visibility setting. Hiding labels changes neither the saved machine nor its undo history.

In the Editor, **View → Clear all state labels** removes every auxiliary label in the active machine. One Undo restores all cleared labels; Redo clears them again. An empty clear does not consume an undo step. State names, outputs, transitions, notes and labels inside nested building blocks are unchanged. Enter a nested block to clear its labels separately.

The shipped original editor help describes hide/show labels, hover tooltips and clearing all labels. The web workbench exposes these controls in View; bulk clearing is restricted to the editable Editor operation.

## Validation

244 browser regressions pass. Automated checks cover escaped hover text, unaffected outputs/behavior, nested-label isolation and exported image bounds. Focused Chrome checks cover visibility persistence, bulk clear/undo/redo and switching visibility during an active simulation.
