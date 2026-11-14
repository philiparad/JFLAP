# Incremental L-system rendering (Task 56)

Rendering now yields to the browser every 256 processed symbols during expansion and turtle drawing. Progress reports the current substitution generation or drawing count; new shapes appear in batches. Pause/Resume retains the generator and turtle state. Cancel stops the job and labels the drawing incomplete; Draw starts a fresh job. Leaving the operation or document pauses unfinished work, which can be resumed on return. Source edits invalidate old cached results through the existing workspace mechanism.

Actual size is the default: one drawing unit occupies one CSS pixel, with scrollbars for drawings larger than the viewport. Fit to view is available without recomputing or changing the geometry. Bounds include stroke padding and are accumulated without spreading large arrays into Math.min/Math.max. SVG export is enabled only for completed jobs and stores explicit actual dimensions independently of the current view mode.

The original packaged `gui.lsystem.DisplayPane.html` specifies rendering progress and scrollbars for oversized drawings. This task uses that previously extracted shipped help and the REA artifact identity recorded in [the refreshed audit](FEATURE-GAPS-2026-11-08.md). Pause, resume, cancellation and a fit option are browser usability choices; they are not claimed as newly observed original UI behavior.

## Checks and limits

210 regression checks pass, including all previous color/hue fixtures and new checks for incremental branch/polygon/color state, deterministic random-choice order, generation progress, empty drawings and symbol limits. Synchronous and incremental callers now share the same generator implementation.

Browser checks completed a 59,049-shape drawing, paused/resumed expansion, retained the paused operation across tab switches, automatically paused on departure, cancelled a job with export disabled, and scrolled the actual-size drawing. A separate 729-shape drawing exported successfully; its downloaded SVG was parsed to verify every shape, explicit dimensions and removal of fit-view styling.

Depth remains limited to 0–10 and expansion to 200,000 symbols; the initial axiom now has the same symbol limit. Rendering rejects nonfinite coordinates or dimensions over 10,000,000 CSS pixels with explicit feedback. Work is cooperatively batched, not moved to a background worker: parsing one exceptionally large production or polygon can still take longer than a normal batch, and many SVG nodes can strain browser resources. Partial drawings are not exportable. Progress reserves 40% for expansion and 60% for drawing, so it measures work phases rather than elapsed time.
