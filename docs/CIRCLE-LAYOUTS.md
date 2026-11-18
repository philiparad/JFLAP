# Two-circle and random layout selection (Task 59)

View offers Two-circle layout and Choose random layout algorithm. Both fit the result, create a single undo entry and preserve machine semantics. The status message names the algorithm applied. The existing Random layout command still scatters positions; the new chooser selects an algorithm instead.

Two-circle grouping treats edges as undirected and parallel edges as one neighbor. States with more than two neighbors begin on the inner ring. Outer states linked to two inner members are promoted repeatedly until stable. If there is no initial inner group, all states form a single ring, matching the original fallback. A lone inner state sits at the center. Outer members are ordered by their first inner neighbor, then document order; isolated members are retained. Ring radii grow with membership to avoid coincident positions. Notes, transitions and nested block contents remain unchanged.

Random selection currently covers circle, spiral, random-position, degree-tree, hierarchy-tree, two-circle and GEM. Each has an equal selection interval. Grid is a browser-specific layout and is not included in the original-family random chooser.

## Evidence and checks

Static inspection of the supplied JAR's `TwoCircleLayoutAlgorithm.assignToCircles` establishes degree-based grouping, repeated promotion and the all-inner fallback. `LayoutAlgorithmFactory.getRandomLayoutAlgorithm` selects among seven original algorithms, including GEM. Artifact identity comes from the REA inventory recorded in [the refreshed audit](FEATURE-GAPS-2026-11-08.md). The browser uses deterministic circular spacing and neighbor ordering rather than the original CircleChain shuffling; exact desktop pixel placement is not claimed.

219 regressions pass, including hub/leaf placement, isolated members, shared-neighbor promotion, empty/singleton behavior, deterministic geometry, language preservation and every random-selection interval. Browser interaction verified both menu actions, the algorithm status and undo restoration. The preview uses a low-degree graph, so its correct two-circle result is the single-ring fallback.
