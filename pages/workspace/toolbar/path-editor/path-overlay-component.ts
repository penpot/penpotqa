import {
  type Point,
  type Segment,
  TOLERANCE,
  isNear,
  pathNumbers,
  segmentKey,
  snapSegmentsTo,
  snapTo,
  sortPoints,
} from '@pages/workspace/toolbar/path-editor/path-geometry';
import { expect, type Locator, type Page } from '@playwright/test';

type Modifier = 'Shift' | 'Control' | 'Alt';

/**
 * SVG overlay the path editor draws on the canvas (`g.path-editor`): the nodes,
 * segments and handlers of the path being edited.
 *
 * The overlay has no ARIA roles or test ids, so its elements are reached with CSS
 * (`g.path-node`, `g.path-segment`, `g.handler`). Its coordinates are design
 * coordinates: every method takes and returns design positions and converts them
 * to screen pixels with the overlay's screen CTM, so the same test works at any
 * zoom or scroll.
 *
 * The editor shows selection only by painting nodes and segments with
 * `--app-pink`; there is no ARIA state to read.
 */
export class PathOverlayComponent {
  readonly page: Page;
  readonly root: Locator;
  readonly insertionPreview: Locator;
  readonly pendingSegment: Locator;

  constructor(page: Page) {
    this.page = page;
    this.root = page.locator('g.path-editor');
    // Node shown when hovering near the middle of a segment in Move mode.
    this.insertionPreview = this.root.locator('g.hover-point circle.path-point');
    // Dashed line from the last node to the pointer while drawing.
    this.pendingSegment = this.root.locator('g.preview path');
  }

  // ---------------------------------------------------------------------------
  // Pointer actions (all positions in design coordinates)
  // ---------------------------------------------------------------------------

  async toScreen(point: Point): Promise<Point> {
    return this.root.evaluate((editor, { x, y }) => {
      const ctm = (editor as unknown as SVGGraphicsElement).getScreenCTM()!;
      const p = new DOMPoint(x, y).matrixTransform(ctm);
      return { x: p.x, y: p.y };
    }, point);
  }

  /**
   * Moves the pointer to `point`. The editor highlights what is under the pointer
   * on hover and acts on that on click, so always hover before pressing.
   */
  async hoverAt(point: Point) {
    const screen = await this.toScreen(point);
    await this.page.mouse.move(screen.x, screen.y, { steps: 5 });
  }

  async clickAt(point: Point, modifiers: Modifier[] = []) {
    await this.hoverAt(point);
    for (const key of modifiers) await this.page.keyboard.down(key);
    await this.page.mouse.down();
    await this.page.mouse.up();
    for (const key of modifiers) await this.page.keyboard.up(key);
  }

  /**
   * Drags from `point` by `delta`. The intermediate steps are needed for the
   * editor to start a drag instead of treating it as a click.
   *
   * Node snapping is on by default, so the dragged element can land a little
   * off `delta` when it gets near another node's X or Y: pick deltas that keep
   * it clear of other nodes, or turn snapping off.
   */
  async dragBy(point: Point, delta: Point) {
    const start = await this.toScreen(point);
    const end = await this.toScreen({ x: point.x + delta.x, y: point.y + delta.y });
    await this.page.mouse.move(start.x, start.y, { steps: 5 });
    await this.page.mouse.down();
    await this.page.mouse.move(end.x, end.y, { steps: 10 });
    await this.page.mouse.up();
  }

  async clickNode(node: Point, modifiers: Modifier[] = []) {
    await this.clickAt(node, modifiers);
  }

  async dragNode(node: Point, delta: Point) {
    await this.dragBy(node, delta);
  }

  /** Drags the handler whose end is at `handler`. */
  async dragHandler(handler: Point, delta: Point) {
    await this.dragBy(handler, delta);
  }

  /**
   * Point at `fraction` of the length of the segment between nodes `from` and
   * `to` (any direction). Unlike the bounding-box centre, it is always on the
   * stroke, also for curves.
   */
  async getSegmentPoint(from: Point, to: Point, fraction: number): Promise<Point> {
    return this.root.evaluate(
      (editor, { from, to, fraction, tolerance }) => {
        const near = (a: number[], b: { x: number; y: number }) =>
          Math.abs(a[0] - b.x) <= tolerance && Math.abs(a[1] - b.y) <= tolerance;
        const numbers = (path: SVGPathElement) =>
          path
            .getAttribute('d')!
            .match(/-?[\d.]+(e-?\d+)?/g)!
            .map(Number);
        const segment = Array.from(
          editor.querySelectorAll<SVGPathElement>(
            'g.path-segment path[pointer-events="stroke"]',
          ),
        ).find((path) => {
          const n = numbers(path);
          const start = n.slice(0, 2);
          const end = n.slice(-2);
          return (
            (near(start, from) && near(end, to)) ||
            (near(start, to) && near(end, from))
          );
        });
        if (!segment) {
          throw new Error(
            `No segment between (${from.x}, ${from.y}) and (${to.x}, ${to.y})`,
          );
        }
        // Measure from `from`, whatever direction the segment is drawn in.
        const t = near(numbers(segment).slice(0, 2), from) ? fraction : 1 - fraction;
        const p = segment.getPointAtLength(segment.getTotalLength() * t);
        return { x: p.x, y: p.y };
      },
      { from, to, fraction, tolerance: TOLERANCE },
    );
  }

  /**
   * Clicks the segment between `from` and `to`. Clicks at a quarter of its length
   * by default: in Move mode, clicking near the middle inserts a node instead of
   * selecting the segment.
   */
  async clickSegment(
    from: Point,
    to: Point,
    { fraction = 0.25, modifiers = [] as Modifier[] } = {},
  ) {
    await this.clickAt(await this.getSegmentPoint(from, to, fraction), modifiers);
  }

  async dragSegment(from: Point, to: Point, delta: Point, { fraction = 0.25 } = {}) {
    await this.dragBy(await this.getSegmentPoint(from, to, fraction), delta);
  }

  // ---------------------------------------------------------------------------
  // State read from the overlay
  // ---------------------------------------------------------------------------

  /** Distinct node positions. A node shared by two subpaths (e.g. the start
   * and end of a closed path) is drawn twice but returned once. */
  async getNodes({ selectedOnly = false } = {}): Promise<Point[]> {
    const nodes = await this.root
      .locator('g.path-node circle.path-point')
      .evaluateAll(
        (circles, selectedOnly) =>
          circles
            .filter(
              (c) => !selectedOnly || c.getAttribute('style')!.includes('app-pink'),
            )
            .map((c) => ({
              x: Number(c.getAttribute('cx')),
              y: Number(c.getAttribute('cy')),
            })),
        selectedOnly,
      );
    return nodes.filter(
      (node, i) => nodes.findIndex((other) => isNear(node, other, 0.01)) === i,
    );
  }

  /** Segments drawn by the editor. Each `g.path-segment` holds the segment's
   * transparent hit area (`pointer-events="stroke"`) and, while it is hovered or
   * selected, a second, visible copy of it used as highlight.
   *
   * Zero-length straight segments are left out: after a node of a closed path
   * moves, the editor also draws the path's closing command (`Z`) as a segment
   * from the start node to itself, until the editor is reopened. */
  async getSegments({ selectedOnly = false } = {}): Promise<Segment[]> {
    return this.root.locator('g.path-segment').evaluateAll(
      (groups, selectedOnly) =>
        groups
          .filter(
            (g) =>
              !selectedOnly || g.querySelector('path[style*="app-pink"]') !== null,
          )
          .map((g) => {
            const d = g
              .querySelector('path[pointer-events="stroke"]')!
              .getAttribute('d')!;
            const n = d.match(/-?[\d.]+(e-?\d+)?/g)!.map(Number);
            return {
              from: { x: n[0], y: n[1] },
              to: { x: n[n.length - 2], y: n[n.length - 1] },
              isCurve: d.includes('C'),
            };
          })
          .filter((s) => s.isCurve || s.from.x !== s.to.x || s.from.y !== s.to.y),
      selectedOnly,
    );
  }

  /**
   * Text key of the whole path as drawn: every node, segment (with its curve
   * handles) and handler, rounded to 0.1. Two keys are equal when the path looks
   * the same, e.g. to check that undo brings back an earlier state exactly.
   */
  async getStateKey(): Promise<string> {
    return this.root.evaluate((editor) => {
      const r = (v: string | null) => Number(v).toFixed(1);
      const all = (selector: string) =>
        Array.from(editor.querySelectorAll(selector));
      const nodes = all('g.path-node circle.path-point').map(
        (c) => `${r(c.getAttribute('cx'))},${r(c.getAttribute('cy'))}`,
      );
      const segments = all('g.path-segment path[pointer-events="stroke"]').map((p) =>
        p.getAttribute('d')!.replace(/-?\d+(\.\d+)?/g, (n) => Number(n).toFixed(1)),
      );
      const handlers = all('g.handler line').map(
        (l) => `${r(l.getAttribute('x2'))},${r(l.getAttribute('y2'))}`,
      );
      return [nodes.join(' '), segments.join(' '), handlers.join(' ')].join(' | ');
    });
  }

  // ---------------------------------------------------------------------------
  // Checks
  // ---------------------------------------------------------------------------

  async isVisible() {
    await expect(this.root, 'Path editor is open').toBeVisible();
  }

  async isHidden() {
    await expect(this.root, 'Path editor is closed').toBeHidden();
  }

  /** Checks the path has exactly these node positions (any order). */
  async checkNodes(expected: Point[], { selectedOnly = false } = {}) {
    await expect
      .poll(async () => snapTo(await this.getNodes({ selectedOnly }), expected), {
        message: `${selectedOnly ? 'Selected nodes' : 'Path nodes'} match`,
      })
      .toEqual(sortPoints(expected));
  }

  async checkSelectedNodes(expected: Point[]) {
    await this.checkNodes(expected, { selectedOnly: true });
  }

  /** Checks the path has exactly these segments, given by their end nodes (any
   * order, any direction). */
  async checkSegments(expected: [Point, Point][], { selectedOnly = false } = {}) {
    await expect
      .poll(
        async () =>
          snapSegmentsTo(await this.getSegments({ selectedOnly }), expected),
        { message: `${selectedOnly ? 'Selected segments' : 'Path segments'} match` },
      )
      .toEqual(expected.map(segmentKey).sort());
  }

  async checkSelectedSegments(expected: [Point, Point][]) {
    await this.checkSegments(expected, { selectedOnly: true });
  }

  async checkSegmentIsCurve(from: Point, to: Point, isCurve: boolean) {
    await expect
      .poll(
        async () => {
          const segment = (await this.getSegments()).find(
            (s) =>
              (isNear(s.from, from) && isNear(s.to, to)) ||
              (isNear(s.from, to) && isNear(s.to, from)),
          );
          return segment?.isCurve;
        },
        {
          message: `Segment (${from.x}, ${from.y}) → (${to.x}, ${to.y}) is ${isCurve ? 'curved' : 'straight'}`,
        },
      )
      .toBe(isCurve);
  }

  /** Checks a handler ends at `expected`. */
  async checkHandlerAt(expected: Point) {
    await expect
      .poll(
        async () => {
          const handlers = await this.root
            .locator('g.handler line')
            .evaluateAll((lines) =>
              lines.map((l) => ({
                x: Number(l.getAttribute('x2')),
                y: Number(l.getAttribute('y2')),
              })),
            );
          return handlers.some((h) => isNear(h, expected));
        },
        { message: `Handler at (${expected.x}, ${expected.y})` },
      )
      .toBe(true);
  }

  /** Checks the insertion preview node is shown at `expected`. */
  async checkInsertionPreviewAt(expected: Point) {
    await expect(this.insertionPreview, 'Insertion preview is shown').toBeVisible();
    await expect
      .poll(
        async () =>
          snapTo(
            [
              {
                x: Number(await this.insertionPreview.getAttribute('cx')),
                y: Number(await this.insertionPreview.getAttribute('cy')),
              },
            ],
            [expected],
          ),
        { message: 'Insertion preview position' },
      )
      .toEqual([expected]);
  }

  /** Checks the dashed pending segment goes from `from` to `to`. */
  async checkPendingSegment(from: Point, to: Point) {
    await expect(this.pendingSegment, 'Pending segment is shown').toBeVisible();
    await expect
      .poll(
        async () => {
          const n = pathNumbers((await this.pendingSegment.getAttribute('d')) ?? '');
          return snapTo(
            [
              { x: n[0], y: n[1] },
              { x: n[n.length - 2], y: n[n.length - 1] },
            ],
            [from, to],
          );
        },
        { message: 'Pending segment end points' },
      )
      .toEqual(sortPoints([from, to]));
  }
}
