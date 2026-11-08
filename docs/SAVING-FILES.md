# Save and Save As (Task 44)

On browsers that provide file pickers and writable file handles, **Open** retains the selected file's handle. **Save** writes back to that file. For a new document, Save first asks for a destination. **Save As** chooses another destination and associates it with the document only after the write and close succeed. Subsequent saves use the new file.

The Save button's tooltip identifies the associated filename. Associations belong to individual open documents, survive undo/redo, and are kept out of model JSON and browser backups. Imported JSON stays JSON when saved back to its file. Saving a nested block uses that block's own association, never its parent's file.

**File → Download copy** always downloads an unassociated copy. The existing **Save JSON** command is also a separate JSON download. Neither changes the destination used by Save. Without writable-file support, the main button explicitly says **Download** and the status explains that future saves cannot overwrite that downloaded file. Local-file import remains available through the ordinary file input when native open pickers are unavailable.

Cancelling a picker keeps the document open. Permission, write and close errors do not install a new association; failed streams are aborted where possible. Save and close waits for success, and retains the document if it changed while saving. A second save for the same document is rejected while the first is pending. A download notification means the browser was asked to download a copy, not that the user completed that download.

## Browser boundary

File associations last for the current page session. Reloading restores browser-backed models but intentionally does not restore filesystem permissions or handles: use Open or select a destination again. Browser permission prompts remain under browser control. File pickers require a secure context and a user gesture; unsupported browsers use downloads. These API choices follow the [Chrome File System Access documentation](https://developer.chrome.com/docs/capabilities/web-apis/file-system-access).

Original behavior is documented in the supplied JAR's [File menu help](original/filemenu.html): Save reuses a file association and Save As replaces it. This task adapts that behavior to browser capabilities; it does not reproduce native desktop windows or persistent filesystem permissions.

## Validation

- **159 browser regression tests pass**, including eight new asynchronous save-service checks: reuse and Save As; cancellation; permission/write/close errors; download fallback; open-handle and JSON preservation; undo/document isolation; overlapping saves; and cancelled/invalid opens.
- `python tests/save-files.py` checks the actual interface against real Chromium file handles in private origin storage. It verifies edit/save/undo, Save As, cancellation, JSON opening, separate document destinations, successful and failed Save and close, first-save cancellation, explicit downloads, feature-detection fallback and lost associations after reload. No browser errors were observed.
- Native picker selection is substituted deterministically in that automated test; native OS dialogs and real OS permission prompts are not driven. No user files are modified by the test.
- Existing transition-keyboard checks and the original-Java Turing block codec round trip still pass. The codec test now uses Download copy for its export, explicitly avoiding an interactive Save As picker.

The browser app retains its dependency-free runtime. Python, Playwright and the JDK are test-only tools.
