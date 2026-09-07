import { ColorPalettePage } from '@pages/workspace/color-palette-page';
import { DesignPanelPage } from '@pages/workspace/design-panel-page';
import { expect } from '@playwright/test';
import { mainAccountFileTest } from 'fixtures';
import { qase } from 'playwright-qase-reporter/playwright';

let colorPalettePage: ColorPalettePage;
let designPanelPage: DesignPanelPage;

mainAccountFileTest.beforeEach(async ({ page }) => {
  designPanelPage = new DesignPanelPage(page);
  colorPalettePage = new ColorPalettePage(page);
});

mainAccountFileTest.describe(() => {
  mainAccountFileTest.beforeEach(async ({ mainPage }) => {
    await mainPage.clickCreateBoardButton();
    await mainPage.clickViewportTwice();
    await mainPage.waitForChangeIsSaved();
    await mainPage.isCreatedLayerVisible();
  });

  mainAccountFileTest(qase([786], 'Add fill to board'), async ({ mainPage }) => {
    await mainAccountFileTest.step('Verify default board fill values', async () => {
      await designPanelPage.isFillHexCodeSet('#FFFFFF');
      await designPanelPage.isFillOpacitySet('100');
    });

    await mainAccountFileTest.step('Verify board fill screenshot', async () => {
      await expect(mainPage.viewport).toHaveScreenshot('board-fill.png', {
        mask: mainPage.maskViewport(),
      });
    });
  });

  mainAccountFileTest(
    qase([791], 'Change fill color for board'),
    async ({ mainPage }) => {
      await mainAccountFileTest.step('Change board fill color', async () => {
        await designPanelPage.clickFillColorIcon();
        await colorPalettePage.modalSetHex('FF0000');
        await mainPage.clickViewportTwice();
        await mainPage.waitForChangeIsSaved();
      });

      await mainAccountFileTest.step('Verify changed board fill', async () => {
        await designPanelPage.isFillHexCodeSet('#ff0000');
        await designPanelPage.isFillOpacitySet('100');
        await expect(mainPage.viewport).toHaveScreenshot('board-changed-fill.png', {
          mask: mainPage.maskViewport(),
        });
      });
    },
  );

  mainAccountFileTest(
    qase([796], 'Change fill opacity for board'),
    async ({ mainPage }) => {
      await mainAccountFileTest.step('Change board fill opacity', async () => {
        await designPanelPage.changeOpacityForFill('70');
        await mainPage.clickViewportTwice();
        await mainPage.waitForChangeIsSaved();
      });

      await mainAccountFileTest.step('Verify changed board opacity', async () => {
        await designPanelPage.isFillHexCodeSet('#FFFFFF');
        await designPanelPage.isFillOpacitySet('70');
        await expect(mainPage.viewport).toHaveScreenshot(
          'board-changed-opacity.png',
          {
            mask: mainPage.maskViewport(),
          },
        );
      });
    },
  );

  mainAccountFileTest(qase([811], 'Remove fill for board'), async ({ mainPage }) => {
    await mainAccountFileTest.step('Remove board fill', async () => {
      await designPanelPage.clickRemoveFillButton();
      await mainPage.waitForChangeIsSaved();
    });

    await mainAccountFileTest.step('Verify removed board fill', async () => {
      await expect(mainPage.viewport).toHaveScreenshot('board-removed-fill.png', {
        mask: mainPage.maskViewport(),
      });
    });
  });
});

mainAccountFileTest.describe(() => {
  mainAccountFileTest.beforeEach(async ({ mainPage }) => {
    await mainPage.createDefaultClosedPath();
    await mainPage.isCreatedLayerVisible();
  });

  mainAccountFileTest(qase([790], 'Add fill to path'), async ({ mainPage }) => {
    await mainAccountFileTest.step('Add fill to path', async () => {
      await designPanelPage.clickAddFillButton();
      await mainPage.waitForChangeIsSaved();
    });

    await mainAccountFileTest.step(
      'Verify path fill values and screenshot',
      async () => {
        await designPanelPage.isFillHexCodeSet('#B1B2B5');
        await designPanelPage.isFillOpacitySet('100');
        await mainPage.waitForResizeHandlerVisible();
        await expect(mainPage.viewport).toHaveScreenshot('path-fill.png', {
          mask: mainPage.maskViewport(),
        });
      },
    );
  });

  mainAccountFileTest(
    qase([795], 'Change fill color for path'),
    async ({ mainPage }) => {
      await mainAccountFileTest.step('Change path fill color', async () => {
        await designPanelPage.clickAddFillButton();
        await mainPage.waitForChangeIsSaved();
        await designPanelPage.clickFillColorIcon();
        await colorPalettePage.setHex('#FF0000');
        await mainPage.clickOnDesignTab();
        await mainPage.waitForChangeIsSaved();
      });

      await mainAccountFileTest.step('Verify changed path fill', async () => {
        await designPanelPage.isFillHexCodeSet('#FF0000');
        await designPanelPage.isFillOpacitySet('100');
        await expect(mainPage.viewport).toHaveScreenshot('path-changed-fill.png', {
          mask: mainPage.maskViewport(),
        });
      });
    },
  );

  mainAccountFileTest(
    qase([800], 'Change fill opacity for path'),
    async ({ mainPage }) => {
      await mainAccountFileTest.step('Change path fill opacity', async () => {
        await designPanelPage.clickAddFillButton();
        await designPanelPage.changeOpacityForFill('70');
        await mainPage.clickOnDesignTab();
        await mainPage.waitForChangeIsSaved();
      });

      await mainAccountFileTest.step('Verify changed path opacity', async () => {
        await designPanelPage.isFillHexCodeSet('#B1B2B5');
        await designPanelPage.isFillOpacitySet('70');
        await mainPage.waitForResizeHandlerVisible();
        await expect(mainPage.viewport).toHaveScreenshot(
          'path-changed-opacity.png',
          {
            mask: mainPage.maskViewport(),
          },
        );
      });
    },
  );

  mainAccountFileTest(qase([815], 'Remove fill for path'), async ({ mainPage }) => {
    await mainAccountFileTest.step('Remove path fill', async () => {
      await designPanelPage.clickAddFillButton();
      await mainPage.waitForChangeIsSaved();
      await designPanelPage.clickRemoveFillButton();
      await mainPage.waitForChangeIsSaved();
      await mainPage.clickOnDesignTab();
    });

    await mainAccountFileTest.step('Verify removed path fill', async () => {
      await expect(mainPage.viewport).toHaveScreenshot('path-removed-fill.png', {
        mask: mainPage.maskViewport(),
      });
    });
  });
});

mainAccountFileTest.describe(() => {
  mainAccountFileTest.beforeEach(async ({ mainPage }) => {
    await mainPage.clickCreateRectangleButton();
    await mainPage.clickViewportTwice();
    await mainPage.waitForChangeIsSaved();
    await mainPage.isCreatedLayerVisible();
  });

  mainAccountFileTest(qase([787], 'Add fill to shape'), async ({ mainPage }) => {
    await mainAccountFileTest.step('Verify default shape fill values', async () => {
      await designPanelPage.isFillHexCodeSet('#B1B2B5');
      await designPanelPage.isFillOpacitySet('100');
    });

    await mainAccountFileTest.step('Verify shape fill screenshot', async () => {
      await expect(mainPage.viewport).toHaveScreenshot('rectangle-fill.png', {
        mask: mainPage.maskViewport(),
      });
    });
  });

  mainAccountFileTest(
    qase([797], 'Change fill opacity for shape'),
    async ({ mainPage }) => {
      await mainAccountFileTest.step('Change shape fill opacity', async () => {
        await designPanelPage.changeOpacityForFill('70');
        await mainPage.clickViewportTwice();
      });

      await mainAccountFileTest.step('Verify changed shape opacity', async () => {
        await designPanelPage.isFillHexCodeSet('#B1B2B5');
        await designPanelPage.isFillOpacitySet('70');
        await mainPage.waitForResizeHandlerVisible();
        await expect(mainPage.viewport).toHaveScreenshot(
          'rectangle-changed-opacity.png',
          {
            mask: mainPage.maskViewport(),
          },
        );
      });
    },
  );

  mainAccountFileTest(qase([812], 'Remove fill for shape'), async ({ mainPage }) => {
    await mainAccountFileTest.step('Remove shape fill', async () => {
      await designPanelPage.clickRemoveFillButton();
      await mainPage.waitForChangeIsSaved();
    });

    await mainAccountFileTest.step('Verify removed shape fill', async () => {
      await expect(mainPage.viewport).toHaveScreenshot(
        'rectangle--removed-fill.png',
        {
          mask: mainPage.maskViewport(),
        },
      );
    });
  });

  mainAccountFileTest(
    qase([792], 'Change fill color for shape'),
    async ({ mainPage }) => {
      await mainAccountFileTest.step('Change shape fill color', async () => {
        await designPanelPage.clickFillColorIcon();
        await colorPalettePage.setHex('#FF0000');
        await mainPage.clickViewportTwice();
        await mainPage.waitForChangeIsSaved();
      });

      await mainAccountFileTest.step('Verify changed shape fill', async () => {
        await designPanelPage.isFillHexCodeSet('#FF0000');
        await designPanelPage.isFillOpacitySet('100');
        await expect(mainPage.viewport).toHaveScreenshot(
          'rectangle-changed-fill.png',
          {
            mask: mainPage.maskViewport(),
          },
        );
      });
    },
  );
});
