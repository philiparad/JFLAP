# L-system parameter table (Task 55)

The Editor now has editable Name and Value columns, row removal, an Add custom parameter button and a picker for angle, angleIncrement, color, distance, hueChange, lineIncrement, lineWidth and polygonColor. Choosing an existing name focuses its first value without overwriting it; a new name is inserted with an empty value. Help beside the table explains each recognized parameter and its default when omitted.

Names are case-sensitive. Custom parameters remain available to drawing expressions. If a name occurs more than once, its last row wins when applied. Blank names are ignored. The text editor remains available and synchronizes with the table. Malformed text disables table editing until corrected, so an invalid line is not silently discarded. Apply changes commits the draft to the document; Render system applies it automatically. Save and XML use the applied values, following the existing editor workflow.

## Evidence and validation

The original packaged `gui.lsystem.LSystemInputPane.html` describes the two-column editor and name picker. Static inspection of `LSystemInputPane.setEditing` confirms first-match focus and blank-value insertion; `ParameterTableModel.getParameters` confirms blank-name exclusion and last-duplicate precedence. Defaults come from packaged `gui.lsystem.DisplayPane.html`. These are supplementary static findings against the JAR identified by the REA evidence in [the refreshed audit](FEATURE-GAPS-2026-11-08.md), not a claim of original UI runtime observation.

207 browser regression checks pass. Added cases cover custom names, case, expressions, duplicate precedence, picker insertion/focus selection and XML round trips. Browser interaction verified that choosing distance keeps two rows and focuses its value, adding color/custom foo changes the rendered color and line lengths, removal updates text, malformed text disables controls and corrected text clears feedback. An actual downloaded XML file retained distance=30, color=dukeBlue and foo=7; reload retained the applied values. No renderer algorithm was changed.
