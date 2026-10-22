import { expect, type Locator, type Page } from '@playwright/test';
import { MainPage } from '@pages/workspace/main-page';

/** A position in design coordinates: the units of the X/Y fields in the Design tab. */
export type Point = { x: number; y: number };

/** A path segment as drawn by the path editor, between two node positions. */
export type Segment = { from: Point; to: Point; isCurve: boolean };

type Modifier = 'Shift' | 'Control' | 'Alt';

/** Max distance (design units) for an actual position to match an expected one. */
const TOLERANCE = 0.5;

const isNear = (a: Point, b: Point, tolerance = TOLERANCE) =>
  Math.abs(a.x - b.x) <= tolerance && Math.abs(a.y - b.y) <= tolerance;

const round = (p: Point): Point => ({
  x: Math.round(p.x * 100) / 100,
  y: Math.round(p.y * 100) / 100,
});

const sortPoints = (points: Point[]) =>
  [...points].sort((a, b) => a.x - b.x || a.y - b.y);

/** Replaces each actual point by the expected point it matches, so that a
 * toEqual() diff only shows the real mismatches, not floating-point noise. */
const snapTo = (actual: Point[], expected: Point[]) =>
  sortPoints(actual.map((a) => expected.find((e) => isNear(a, e)) ?? round(a)));

/** Order-independent text key of a segment, e.g. "375,282 → 880,282". */
const segmentKey = ([a, b]: Point[]) =>
  sortPoints([a, b])
    .map((p) => `${p.x},${p.y}`)
    .join(' → ');

/** Same as snapTo() for segments, as sorted keys; direction is ignored. */
const snapSegmentsTo = (actual: Segment[], expected: [Point, Point][]) =>
  actual
    .map(({ from, to }) => segmentKey(snapTo([from, to], expected.flat())))
    .sort();

/**
 * Node and segment operations on the path being edited (path editor, Penpot 2.19+).
 *
 * The editor overlay is an SVG layer with no ARIA roles or test ids, so its nodes
 * and segments are reached with CSS (`g.path-node`, `g.path-segment`). Its
 * coordinates are design coordinates: every method takes and returns design
 * positions and converts them to screen pixels with the overlay's screen CTM, so
 * the same test works at any zoom or scroll.
 *
 * The editor shows selection only by painting nodes and segments with
 * `--app-pink`; there is no ARIA state to read.
 */
export class PathEditorPage extends MainPage {
  readonly pathEditor: Locator;
  readonly insertionPreview: Locator;
  readonly pendingSegment: Locator;
  readonly pathToolbarButtons: Locator;
  readonly drawNodesButton: Locator;
  readonly snapNodesButton: Locator;
  readonly nodeXInput: Locator;
  readonly nodeYInput: Locator;

  constructor(page: Page) {
    super(page);
    this.pathEditor = page.locator('g.path-editor');
    // Node shown when hovering near the middle of a segment in Move mode.
    this.insertionPreview = this.pathEditor.locator(
      'g.hover-point circle.path-point',
    );
    // Dashed line from the last node to the pointer while drawing.
    this.pendingSegment = this.pathEditor.locator('g.preview path');
    this.pathToolbarButtons = this.pathActionsBlock.getByRole('button');
    this.drawNodesButton = page.getByRole('button', { name: 'Draw nodes (P)' });
    this.snapNodesButton = page.getByRole('button', { name: "Snap nodes (Ctrl+')" });
    const rightSidebar = page.getByTestId('right-sidebar');
    this.nodeXInput = rightSidebar.getByTitle('X axis').getByRole('textbox');
    this.nodeYInput = rightSidebar.getByTitle('Y axis').getByRole('textbox');
  }

  /**
   * Activates the Path tool. Unlike MainPage.clickCreatePathButton(), it doesn't
   * click the viewport first: a blank file opens with the Board tool active, so
   * that click creates a board and the Path tool never gets selected. The main
   * toolbar hides as soon as the tool is active, hence the check on the cursor.
   */
  async selectPathTool() {
    await this.pathToolButton.click();
    await this.viewport.hover();
    await expect(this.createPathPointer, 'Path tool is active').toBeVisible();
  }

  /** Selects the layer in the layers tree and opens it in the path editor. */
  async enterPathEditing(layerName = 'Path') {
    await this.page
      .getByTestId('layer-tree')
      .getByText(layerName, { exact: true })
      .click();
    await this.page.keyboard.press('Enter');
    await expect(this.pathEditor, 'Path editor is open').toBeVisible();
  }

  async exitPathEditing() {
    await this.clickOnESC();
    await expect(this.pathEditor, 'Path editor is closed').toBeHidden();
  }

  async isPathEditorOpen() {
    await expect(this.pathEditor, 'Path editor is open').toBeVisible();
  }

  async isPathEditorClosed() {
    await expect(this.pathEditor, 'Path editor is closed').toBeHidden();
  }

  // ---------------------------------------------------------------------------
  // Pointer actions (all positions in design coordinates)
  // ---------------------------------------------------------------------------

  async toScreen(point: Point): Promise<Point> {
    return this.pathEditor.evaluate((editor, { x, y }) => {
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
  async dragBy(point: Point, delta: Point, modifiers: Modifier[] = []) {
    const start = await this.toScreen(point);
    const end = await this.toScreen({ x: point.x + delta.x, y: point.y + delta.y });
    await this.page.mouse.move(start.x, start.y, { steps: 5 });
    for (const key of modifiers) await this.page.keyboard.down(key);
    await this.page.mouse.down();
    await this.page.mouse.move(end.x, end.y, { steps: 10 });
    await this.page.mouse.up();
    for (const key of modifiers) await this.page.keyboard.up(key);
  }

  async clickNode(node: Point, modifiers: Modifier[] = []) {
    await this.clickAt(node, modifiers);
  }

  async dragNode(node: Point, delta: Point) {
    await this.dragBy(node, delta);
  }

  /**
   * Point at `fraction` of the length of the segment between nodes `from` and
   * `to` (any direction). Unlike the bounding-box centre, it is always on the
   * stroke, also for curves.
   */
  async getSegmentPoint(from: Point, to: Point, fraction: number): Promise<Point> {
    return this.pathEditor.evaluate(
      (editor, { from, to, fraction, tolerance }) => {
        const near = (a: number[], b: { x: number; y: number }) =>
          Math.abs(a[0] - b.x) <= tolerance && Math.abs(a[1] - b.y) <= tolerance;
        const paths = Array.from(
          editor.querySelectorAll<SVGPathElement>(
            'g.path-segment path[pointer-events="stroke"]',
          ),
        );
        const segment = paths.find((path) => {
          const n = path
            .getAttribute('d')!
            .match(/-?[\d.]+(e-?\d+)?/g)!
            .map(Number);
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
        const n = segment
          .getAttribute('d')!
          .match(/-?[\d.]+(e-?\d+)?/g)!
          .map(Number);
        const t = near(n.slice(0, 2), from) ? fraction : 1 - fraction;
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

  async dragSegment(
    from: Point,
    to: Point,
    delta: Point,
    { fraction = 0.25, modifiers = [] as Modifier[] } = {},
  ) {
    await this.dragBy(
      await this.getSegmentPoint(from, to, fraction),
      delta,
      modifiers,
    );
  }

  // ---------------------------------------------------------------------------
  // State read from the editor overlay
  // ---------------------------------------------------------------------------

  /** Distinct node positions. A node shared by two subpaths (e.g. the start
   * and end of a closed path) is drawn twice but returned once. */
  async getNodes({ selectedOnly = false } = {}): Promise<Point[]> {
    const nodes = await this.pathEditor
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
    return this.pathEditor.locator('g.path-segment').evaluateAll(
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

  /** Names of the actions shown in the path toolbar, in display order. */
  async getToolbarActions(): Promise<string[]> {
    return this.pathToolbarButtons.evaluateAll((buttons) =>
      buttons.map((b) => b.getAttribute('title')!),
    );
  }

  // ---------------------------------------------------------------------------
  // Checks
  // ---------------------------------------------------------------------------

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
          const d = (await this.pendingSegment.getAttribute('d')) ?? '';
          const n = (d.match(/-?[\d.]+(e-?\d+)?/g) ?? []).map(Number);
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

  async checkNoPendingSegment() {
    await expect(this.pendingSegment, 'No pending segment is shown').toBeHidden();
  }

  /** Checks the path toolbar shows exactly these actions, in this order. */
  async checkToolbarActions(expected: string[]) {
    await expect
      .poll(() => this.getToolbarActions(), { message: 'Path toolbar actions' })
      .toEqual(expected);
  }

  /** The path toolbar marks the active mode/toggle with a CSS class only. */
  async isToolbarButtonToggled(button: Locator, toggled = true) {
    toggled
      ? await expect(button).toHaveClass(/is-toggled/)
      : await expect(button).not.toHaveClass(/is-toggled/);
  }

  async checkNodePositionFields(expected: Point) {
    await expect(this.nodeXInput, 'Node X field').toHaveValue(String(expected.x));
    await expect(this.nodeYInput, 'Node Y field').toHaveValue(String(expected.y));
  }

  async setNodeX(value: number) {
    await this.nodeXInput.fill(String(value));
    await this.nodeXInput.press('Enter');
  }

  async setNodeY(value: number) {
    await this.nodeYInput.fill(String(value));
    await this.nodeYInput.press('Enter');
  }
}
