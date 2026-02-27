import { Locator, Page } from '@playwright/test';

/**
 * Playwright common UI actions that can be flaky in CI environments.
 */
export enum FlakyAction {
  click = 'click',
  clear = 'clear',
  type = 'type',
  fill = 'fill',
  press = 'press',
  blur = 'blur',
  pressSequentially = 'pressSequentially',
}

/**
 * Options for the `safeDo` and `safeAction` helpers that stabilize flaky UI interactions.
 */
export interface SafeActionOptions {
  /**
   * A locator to hover before interacting with the target.
   * Useful when the target locator spawns a tooltip on hover.
   */
  hoverLocator?: Locator | null;

  /**
   * Time (ms) to wait after making sure element is visible.
   * Helps stabilize DOM in CI.
   */
  stableWait?: number;

  /**
   * Scroll target into view before acting.
   */
  scroll?: boolean;

  /**
   * Use noWaitAfter for actions that shouldn't trigger navigation.
   * Default is true because most UI panel actions don't navigate.
   */
  noWaitAfter?: boolean;
}

/**
 * Safely performs a UI action on a potentially (CI-only) flaky element.
 *
 * This helper is designed for UIs where:
 *  - Hovering a button/input triggers tooltips that overlap elements
 *  - A panel sidebar auto-scrolls when interacting with elements
 *  - The DOM rerenders immediately after hover/click
 *  - GitHub CI introduces layout jitter or race conditions
 *  - Playwright incorrectly waits for a navigation to occur ("scheduled navigations")
 *
 * The function stabilizes the DOM before performing the action by:
 *  - Hovering a stable container section instead of the target element
 *  - Scrolling the target into view
 *  - Adding small stability delays (useful on CI)
 *  - Disabling Playwright's automatic navigation waiting (noWaitAfter)
 *
 * @param page
 *    The Playwright Page object executing the action.
 *
 * @param target
 *    The locator representing the element that should receive the action.
 *    This is *never* hovered directly to avoid triggering tooltips.
 *
 * @param perform
 *    A callback function that performs the actual action.
 *    It receives an object with `{ noWaitAfter: boolean }` and should pass
 *    that into the locator action, e.g.:
 *
 *        opts => target.click(opts)
 *        opts => target.clear(opts)
 *        opts => target.type("hello", opts)
 *
 * @param opts
 *   Optional settings for the safe action, from the `SafeActionOptions` interface
 *
 * @returns
 *    The result of the provided `perform` action.
 *
 * @example
 *    // Safe click on a button that normally triggers a tooltip
 *    await safeDo(
 *      page,
 *      addBlurButton,
 *      opts => addBlurButton.click(opts),
 *      { hoverLocator: blurSection }
 *    );
 */
async function safeDo(
  page: Page,
  target: Locator,
  perform: (opts: { noWaitAfter: boolean }) => Promise<any>,
  opts: SafeActionOptions = {},
): Promise<any> {
  const {
    hoverLocator = null,
    stableWait = 50,
    scroll = true,
    noWaitAfter = true,
  } = opts;

  // 1. Hover non-target element (prevents tooltip overlap)
  if (hoverLocator) {
    try {
      await hoverLocator.hover({ trial: true }).catch(() => {});
      await hoverLocator.hover().catch(() => {});
    } catch (_) {
      // ignore hover failures
    }
  }

  // 2. Scroll into view (avoid inspector auto-scroll)
  if (scroll) {
    try {
      await target.scrollIntoViewIfNeeded().catch(() => {});
    } catch (_) {}
  }

  // 3. Ensure visibility
  await target.waitFor({ state: 'visible' });

  // 4. Stabilize DOM on CI
  if (stableWait > 0) {
    await page.waitForTimeout(stableWait);
  }

  // 5. Perform the action with noWaitAfter by default (just for those functions that allow it)
  if (perform in [FlakyAction.fill, FlakyAction.press, FlakyAction.blur]) {
    return await perform();
  }
  return await perform({ noWaitAfter });
}

/**
 * Convenience wrapper around `safeDo` for common UI actions.
 *
 * It avoids writing the perform callback repeatedly for common actions like click/type,
 * while still allowing custom options to be passed.
 *
 * @param page
 *    The Playwright Page object executing the action.
 *
 * @param locator
 *    The locator representing the element that should receive the action.
 *
 * @param flakyAction
 *    The action to perform on the locator.
 *
 * @param flakyActionArgs
 *    Arguments to pass to the action.
 *
 * @param opts
 *    Optional settings for the safe action, from the `SafeActionOptions` interface.
 *
 * @returns
 *    The result of the provided action.
 *
 * @example
 *    // To be used from the POMs like this:
 *    await safeAction(this.page, locator, safeActionType, actionArgs, {
 *      hoverLocator,
 *      ...options,
 *    });
 */
export async function safeAction(
  page: Page,
  locator: Locator,
  flakyAction: FlakyAction,
  flakyActionArgs: [...any[]] = [],
  opts: SafeActionOptions = {},
) {
  return await safeDo(
    page,
    locator,
    (o) => locator[flakyAction](...flakyActionArgs, o),
    opts,
  );
}
