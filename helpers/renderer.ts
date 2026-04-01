import { Page } from '@playwright/test';

// Timeout in ms to wait for the WASM renderer to repaint the viewport
const wasmRendererTimeout = 150;

/**
 * Method to use in case of timeout when recovering the viewport after an operation.
 * It ensures that WASM renderer has had time to complete and repaint the viewport.
 */
export async function waitForViewportStable(page: Page) {
  // allow async WASM rendering to settle
  await page.waitForTimeout(wasmRendererTimeout);

  // wait for 2 frames
  await page.evaluate(() => {
    return new Promise((resolve) => {
      requestAnimationFrame(() => {
        requestAnimationFrame(resolve);
      });
    });
  });
}
