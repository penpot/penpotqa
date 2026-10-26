/** A position in design coordinates: the units of the X/Y fields in the Design tab. */
export type Point = { x: number; y: number };

/** A path segment as drawn by the path editor, between two node positions. */
export type Segment = { from: Point; to: Point; isCurve: boolean };

/** Max distance (design units) for an actual position to match an expected one. */
export const TOLERANCE = 0.5;

export const isNear = (a: Point, b: Point, tolerance = TOLERANCE) =>
  Math.abs(a.x - b.x) <= tolerance && Math.abs(a.y - b.y) <= tolerance;

export const round = (p: Point): Point => ({
  x: Math.round(p.x * 100) / 100,
  y: Math.round(p.y * 100) / 100,
});

export const sortPoints = (points: Point[]) =>
  [...points].sort((a, b) => a.x - b.x || a.y - b.y);

/** Replaces each actual point by the expected point it matches, so that a
 * toEqual() diff only shows the real mismatches, not floating-point noise. */
export const snapTo = (actual: Point[], expected: Point[]) =>
  sortPoints(actual.map((a) => expected.find((e) => isNear(a, e)) ?? round(a)));

/** Order-independent text key of a segment, e.g. "375,282 → 880,282". */
export const segmentKey = ([a, b]: Point[]) =>
  sortPoints([a, b])
    .map((p) => `${p.x},${p.y}`)
    .join(' → ');

/** Same as snapTo() for segments, as sorted keys; direction is ignored. */
export const snapSegmentsTo = (actual: Segment[], expected: [Point, Point][]) =>
  actual
    .map(({ from, to }) => segmentKey(snapTo([from, to], expected.flat())))
    .sort();

/** Numbers of an SVG path `d` attribute, in order. */
export const pathNumbers = (d: string) =>
  (d.match(/-?[\d.]+(e-?\d+)?/g) ?? []).map(Number);
