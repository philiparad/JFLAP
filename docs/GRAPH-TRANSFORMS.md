# Graph transformations (Task 57)

The View menu provides reflections across horizontal and vertical center lines and both diagonals, rotation by a signed number of degrees, and Fit graph to view. Positive rotation is clockwise. Fit is also available on the editor toolbar. Every operation creates one undo entry; redo restores it. Invalid angles or nonfinite coordinates are rejected before changing the document.

Transformations move the current graph's states and notes, preserving state identifiers, initial/final markers, transition labels and simulation behavior. Nested building-block contents are not changed unless that block is the current editor. Reflections reverse signed transition curvature, including automatically curved reverse/parallel edges. State text, initial arrows and self-loop glyphs remain upright.

Rotations use the mean position of states and notes, so applying the inverse angle restores their positions within floating-point precision. Reflections use their bounding-box center. Fit centers and uniformly scales positions, then measures the rendered SVG to include text, notes, arrows, loops and curved transitions in the viewport. A fitted editor has a fixed 520-pixel canvas height so a long document sidebar cannot push the graph far below the visible controls. Zoom still works around the fitted graph. View fitting is presentation state; transformed coordinates are saved with the model.

## Evidence and checks

Static inspection of the supplied JAR's `gui.menu.MenuBarCreator` identifies four reflection axes, Rotate The Graph and Fill Screen With Graph. `automata.graph.layout.VertexMover` confirms signed-angle input and screen normalization. This uses the artifact identity and prior REA inventory recorded in [the refreshed audit](FEATURE-GAPS-2026-11-08.md). The browser adapts the pivot and viewport to its SVG editor; exact Swing pixel placement is not claimed.

213 regression checks pass. New cases cover inverse arbitrary-angle rotation, all four reflection involutions, language preservation, curved edges, nested-block isolation, empty/singleton/collinear graphs, distant coordinates and rejection without mutation. Browser checks verified reflection undo, rotation followed by fit, undoing both changes back to the original coordinates, and a fitted view containing the graph and its loop labels. The original desktop UI was not executed for this task.
