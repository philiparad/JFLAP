# Document workspaces

Use **Open operation** to open an operation tab. Switching tabs or documents retains inputs, results, simulation progress and guided work. Each document retains its editor selection, zoom and undo/redo history. The x beside an operation dismisses just that operation; reopening starts fresh. The Editor stays open.

Editing a source invalidates cached computations that depend on it. Searches pause when you leave their tab; return and choose Resume search to continue. This supersedes the earlier cancel-on-navigation behavior. Batch results also invalidate when another participating document changes.

**File > Open copy in new window** opens an independent copy of the current document. Browser settings may present it as a tab or block the popup. Edits and history are independent; the copy uses session storage so it cannot overwrite the original window's browser backup. Reload retains that window's saved model, but operation panes and undo histories are session-only and are reset by reload. File associations are not copied; save the new window separately. Windows are independent copies, not synchronized views.

## Validation

Run `python tests/workspaces.py` with Python Playwright and Chromium installed. It checks retained simulation steps and batch results; dismiss/reopen; independent document undo/redo; invalidation after edits; manual derivation and parsing state; paused/resumed searches; separate window edits, reload and opener isolation; and closing an inactive document without losing the current operation.

The existing 159 browser regressions, transition keyboard interactions, file saving checks and original Java block XML round trip also pass.
