import { Locator, Page } from '@playwright/test';

/**
 * Drags `source` and drops it onto `target` at the given position relative
 * to `target`'s top-left corner.
 *
 * Locator.dragTo() moves the pointer to the drop point in a single jump -
 * one mousemove event. Playwright's own docs on manual dragging
 * (https://playwright.dev/docs/input#dragging-manually) note that pages
 * relying on the dragover event need at least two pointer moves at the drop
 * point to fire it reliably. Penpot's canvas is one of those pages: with
 * only one move, a dropped shape can end up selected in the data model
 * (visible in the design/layers panel) while its selection-outline overlay
 * never renders.
 *
 * The fix is to land on the drop point, nudge off it by a couple of
 * pixels, then move back onto it - three real, distinct pointer moves
 * instead of one. Moving through other UI on the way to the drop point
 * (e.g. interpolating the whole path from source to target) was tried
 * first and made the shape land elsewhere, presumably by crossing other
 * interactive canvas controls mid-drag - so the jiggle happens only once
 * already at the drop point.
 */
export async function dragAndDropOnCanvas(
  page: Page,
  source: Locator,
  target: Locator,
  x: number,
  y: number,
) {
  await source.hover();
  await page.mouse.down();
  await target.hover({ position: { x, y } });
  const targetBox = await target.boundingBox();
  if (!targetBox) {
    throw new Error('Cannot compute bounding box of drag-and-drop target');
  }
  await page.mouse.move(targetBox.x + x + 2, targetBox.y + y + 2, { steps: 3 });
  await page.mouse.move(targetBox.x + x, targetBox.y + y, { steps: 3 });
  await page.mouse.up();
}
