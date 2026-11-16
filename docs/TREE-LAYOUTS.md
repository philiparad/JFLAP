# Tree layouts (Task 58)

View now includes Degree-tree layout and Hierarchy-tree layout. Degree-tree treats connections as undirected and starts with the highest-degree remaining state. Hierarchy-tree follows outgoing transitions and starts with the lowest incoming-degree remaining state, excluding self-loops from that priority. Equal priorities use document order. Parallel edges count as one neighbor.

Each root is expanded breadth-first. Any unvisited states start additional trees, covering disconnected components, isolated states and directed cycles. States share centered depth rows with deterministic sibling order and unique positions. Traversal is iterative, including for deep chains. The editor fits the complete result and creates one undo entry. Transitions, labels, initial/final flags, notes and nested building-block contents are preserved; only the current graph's state positions change.

## Evidence and validation

Static inspection of the original `TreeLayoutAlgorithm`, its two comparator classes, `Level.processChildren` and `AutomatonDirectedGraph.toDegree` establishes degree-descending and incoming-degree-ascending root priorities, repeated roots for remaining vertices, and level traversal. This uses the supplied JAR identity from the REA inventory in [the refreshed audit](FEATURE-GAPS-2026-11-08.md). Browser sibling ordering and centered row spacing replace the original VertexChain alignment and Swing screen normalization. Exact original coordinates and crossing minimization are not claimed.

216 regression checks pass. New tests distinguish the two root policies, verify deterministic unique positions for disconnected components, self-loops, parallel edges and cycles, preserve accepted languages, and cover empty graphs and a 1,500-state chain without recursive traversal. Browser interaction verified both View actions and exact restoration of coordinates with Undo. Disconnected cases were verified in the browser regression suite; the separate file-picker workflow was not used as validation evidence.
