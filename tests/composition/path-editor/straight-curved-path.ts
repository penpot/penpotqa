import type { Point } from '@pages/workspace/toolbar/path-editor/path-geometry';

// Contents of documents/straight-curved-path.penpot: one closed path "Path" with
// four nodes, a straight top segment A-B and curved segments B-C, C-D and D-A.
export const A: Point = { x: 375, y: 282 };
export const B: Point = { x: 880, y: 282 };
export const C: Point = { x: 880, y: 642 };
export const D: Point = { x: 375, y: 642 };
export const PATH_NODES = [A, B, C, D];
export const PATH_SEGMENTS: [Point, Point][] = [
  [A, B],
  [B, C],
  [C, D],
  [D, A],
];

// End of the B-C handle of node C.
export const C_HANDLER: Point = { x: 687.4445190429688, y: 488.888916015625 };

// Empty canvas spots, clear of the path toolbar (top of the viewport) and far
// enough from any node's X or Y to avoid node snapping.
export const EMPTY_POINT: Point = { x: 620, y: 180 };
export const POINTER_POINT: Point = { x: 700, y: 210 };
