import { expect } from '@playwright/test';
import { mainAccountFileTest } from 'fixtures';
import { qase } from 'playwright-qase-reporter/playwright';

mainAccountFileTest.beforeEach(async ({ page, mainPage }) => {
  await mainPage.clickMoveButton();
});

mainAccountFileTest(
  qase([850], 'Zoom via top right menu'),
  async ({ page, mainPage }) => {
    await mainAccountFileTest.step('Zoom in and verify screenshot', async () => {
      await mainPage.increaseZoom(1);
      await mainPage.clickViewportOnce();
      await expect(page).toHaveScreenshot('canvas-zoom-in.png', {
        mask: [
          mainPage.usersSection,
          mainPage.guides,
          mainPage.guidesFragment,
          mainPage.toolBarWindow,
        ],
      });
    });

    await mainAccountFileTest.step('Zoom out and verify screenshot', async () => {
      await mainPage.decreaseZoom(2);
      await mainPage.clickViewportOnce();
      await expect(page).toHaveScreenshot('canvas-zoom-out.png', {
        mask: [
          mainPage.usersSection,
          mainPage.guides,
          mainPage.guidesFragment,
          mainPage.toolBarWindow,
        ],
      });
    });
  },
);

mainAccountFileTest(
  qase([852], 'Reset zoom via top right menu'),
  async ({ page, mainPage }) => {
    await mainAccountFileTest.step('Zoom in and verify screenshot', async () => {
      await mainPage.increaseZoom(1);
      await mainPage.clickViewportOnce();
      await expect(page).toHaveScreenshot('canvas-zoom-in.png', {
        mask: [
          mainPage.usersSection,
          mainPage.guides,
          mainPage.guidesFragment,
          mainPage.toolBarWindow,
        ],
      });
    });

    await mainAccountFileTest.step(
      'Reset zoom and verify default screenshot',
      async () => {
        await mainPage.resetZoom();
        await expect(page).toHaveScreenshot('canvas-zoom-default.png', {
          mask: [
            mainPage.usersSection,
            mainPage.guides,
            mainPage.guidesFragment,
            mainPage.toolBarWindow,
          ],
        });
      },
    );
  },
);

mainAccountFileTest(
  qase([854], 'Zoom to fit all via top right menu'),
  async ({ page, mainPage }) => {
    await mainAccountFileTest.step('Create board and ellipse', async () => {
      await mainPage.clickCreateBoardButton();
      await mainPage.clickViewportTwice();
      await mainPage.waitForChangeIsSaved();
      await page.mouse.wheel(0, 1000);
      await mainPage.clickCreateEllipseButton();
      await mainPage.clickViewportTwice();
      await mainPage.waitForChangeIsSaved();
    });

    await mainAccountFileTest.step(
      'Zoom to fit all and verify screenshot',
      async () => {
        await mainPage.zoomToFitAll();
        await mainPage.clickViewportTwice();
        await expect(page).toHaveScreenshot('canvas-zoom-to-fit-all.png', {
          mask: [
            mainPage.usersSection,
            mainPage.guides,
            mainPage.guidesFragment,
            mainPage.toolBarWindow,
          ],
        });
      },
    );
  },
);

mainAccountFileTest(
  qase([856], 'Zoom to selected via top right menu'),
  async ({ mainPage }) => {
    await mainAccountFileTest.step('Create board and zoom to selected', async () => {
      await mainPage.clickCreateBoardButton();
      await mainPage.clickViewportByCoordinates(900, 100);
      await mainPage.waitForChangeIsSaved();
      await mainPage.zoomToFitSelected();
      await mainPage.clickViewportTwice();
    });

    await mainAccountFileTest.step(
      'Verify zoom to selected screenshot',
      async () => {
        await expect(mainPage.viewport).toHaveScreenshot(
          'canvas-zoom-to-selected.png',
          {
            mask: mainPage.maskViewport(),
          },
        );
      },
    );
  },
);
