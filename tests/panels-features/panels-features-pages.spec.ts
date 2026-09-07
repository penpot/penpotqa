import { BasePage } from '@pages/base-page';
import { AssetsPanelPage } from '@pages/workspace/assets-panel-page';
import { DesignPanelPage } from '@pages/workspace/design-panel-page';
import { LayersPanelPage } from '@pages/workspace/layers-panel-page';
import { PagesPanelPage } from '@pages/workspace/panels-features/pages-panel-page';
import { expect } from '@playwright/test';
import { mainAccountFileTest } from 'fixtures';
import { qase } from 'playwright-qase-reporter/playwright';

let basePage: BasePage;
let layersPanelPage: LayersPanelPage;
let assetsPanelPage: AssetsPanelPage;
let designPanelPage: DesignPanelPage;
let pagesPanelPage: PagesPanelPage;

mainAccountFileTest.beforeEach(async ({ page }) => {
  basePage = new BasePage(page);
  layersPanelPage = new LayersPanelPage(page);
  assetsPanelPage = new AssetsPanelPage(page);
  designPanelPage = new DesignPanelPage(page);
  pagesPanelPage = new PagesPanelPage(page);
});

mainAccountFileTest(qase([832], 'Create new page'), async ({ mainPage }) => {
  await mainAccountFileTest.step('Add a new page', async () => {
    await pagesPanelPage.clickAddPageButton();
    await mainPage.waitForChangeIsSaved();
    await mainPage.clickMoveButton();
  });

  await mainAccountFileTest.step(
    'Verify two pages are shown in the panel',
    async () => {
      await pagesPanelPage.isFirstPageAddedToAssetsPanel();
      await pagesPanelPage.isSecondPageAddedToAssetsPanel();
      await expect(pagesPanelPage.pagesBlock).toHaveScreenshot(
        'page-1-and-page-2.png',
      );
    },
  );
});

mainAccountFileTest(qase([833], 'Rename page'), async ({ mainPage }) => {
  await mainAccountFileTest.step('Add a second page', async () => {
    await pagesPanelPage.clickAddPageButton();
    await mainPage.waitForChangeIsSaved();
  });

  await mainAccountFileTest.step('Rename first page', async () => {
    await pagesPanelPage.renamePageViaRightClick('NewFirstPage');
    await mainPage.waitForChangeIsSaved();
    await pagesPanelPage.isFirstPageNameDisplayed('NewFirstPage');
  });

  await mainAccountFileTest.step('Rename second page', async () => {
    await pagesPanelPage.renamePageViaRightClick('NewSecondPage', false);
    await mainPage.waitForChangeIsSaved();
    await pagesPanelPage.isSecondPageNameDisplayed('NewSecondPage');
  });
});

mainAccountFileTest(qase([834], 'Duplicate page'), async ({ mainPage }) => {
  await mainAccountFileTest.step('Duplicate the first page', async () => {
    await pagesPanelPage.duplicatePageViaRightClick();
    await mainPage.waitForChangeIsSaved();
  });

  await mainAccountFileTest.step('Verify duplicated page names', async () => {
    await pagesPanelPage.isFirstPageNameDisplayed('Page 1');
    await pagesPanelPage.isSecondPageNameDisplayed('Page 1 (copy)');
  });
});

mainAccountFileTest(
  qase([835], 'Switch between pages'),
  async ({ page, mainPage }) => {
    await mainAccountFileTest.step('Navigate to second page', async () => {
      await pagesPanelPage.clickAddPageButton();
      await pagesPanelPage.clickOnPageOnLayersPanel(2);
      await mainPage.clickMoveButton();
      await mainPage.clickViewportTwice();
      await mainPage.waitForChangeIsSaved();
    });

    await mainAccountFileTest.step('Verify second page canvas', async () => {
      await expect(page).toHaveScreenshot('canvas-second-page-selected.png', {
        mask: [
          mainPage.guides,
          mainPage.guidesFragment,
          mainPage.toolBarWindow,
          mainPage.usersSection,
        ],
      });
    });

    await mainAccountFileTest.step('Navigate back to first page', async () => {
      await pagesPanelPage.clickOnPageOnLayersPanel();
      await mainPage.clickMoveButton();
      await mainPage.clickViewportTwice();
      await mainPage.waitForChangeIsSaved();
    });

    await mainAccountFileTest.step('Verify first page canvas', async () => {
      await expect(page).toHaveScreenshot('canvas-first-page-selected.png', {
        mask: [
          mainPage.guides,
          mainPage.guidesFragment,
          mainPage.toolBarWindow,
          mainPage.usersSection,
        ],
      });
    });
  },
);

mainAccountFileTest(
  qase([836], 'Collapse/expand pages list'),
  async ({ mainPage }) => {
    await mainAccountFileTest.step(
      'Add a second page and collapse the pages list',
      async () => {
        await pagesPanelPage.clickAddPageButton();
        await mainPage.waitForChangeIsSaved();
        await pagesPanelPage.clickCollapseExpandPagesButton();
        await mainPage.waitForChangeIsSaved();
        await mainPage.clickMoveButton();
      },
    );

    await mainAccountFileTest.step('Verify pages list is collapsed', async () => {
      await expect(pagesPanelPage.pagesBlock).toHaveScreenshot('hidden-pages.png');
    });

    await mainAccountFileTest.step(
      'Expand the pages list and verify both pages are shown',
      async () => {
        await pagesPanelPage.clickCollapseExpandPagesButton();
        await mainPage.waitForChangeIsSaved();
        await pagesPanelPage.clickMoveButton();
        await expect(pagesPanelPage.pagesBlock).toHaveScreenshot(
          'page-1-and-page-2.png',
        );
        await pagesPanelPage.isFirstPageNameDisplayed('Page 1');
        await pagesPanelPage.isSecondPageNameDisplayed('Page 2');
      },
    );
  },
);

mainAccountFileTest(qase([837], 'Delete page'), async ({ mainPage }) => {
  await mainAccountFileTest.step('Add two extra pages', async () => {
    await pagesPanelPage.clickAddPageButton();
    await mainPage.waitForChangeIsSaved();
    await pagesPanelPage.clickAddPageButton();
    await mainPage.waitForChangeIsSaved();
  });

  await mainAccountFileTest.step(
    'Delete second page via right-click and verify',
    async () => {
      await pagesPanelPage.deleteSecondPageViaRightClick();
      await mainPage.waitForChangeIsSaved();
      await pagesPanelPage.isFirstPageNameDisplayed('Page 1');
      await pagesPanelPage.isSecondPageNameDisplayed('Page 3');
    },
  );

  await mainAccountFileTest.step(
    'Delete second page via trash icon and verify',
    async () => {
      await pagesPanelPage.deleteSecondPageViaTrashIcon('Page 3');
      await mainPage.waitForChangeIsSaved();
      await pagesPanelPage.isFirstPageNameDisplayed('Page 1');
      await pagesPanelPage.isSecondPageAddedToAssetsPanel(false);
    },
  );
});

mainAccountFileTest(
  qase([839], 'Create 3 pages, delete 2nd page, undo delete (CTRL Z)'),
  async () => {
    await mainAccountFileTest.step(
      'Create three pages and delete the second',
      async () => {
        await pagesPanelPage.clickAddPageButton();
        await pagesPanelPage.clickAddPageButton();
        await pagesPanelPage.deleteSecondPageViaRightClick();
        await pagesPanelPage.isSecondPageNameDisplayed('Page 2', false);
      },
    );

    await mainAccountFileTest.step(
      'Undo deletion and verify page is restored',
      async () => {
        await pagesPanelPage.clickShortcutCtrlZ();
        await pagesPanelPage.isSecondPageNameDisplayed('Page 2', true);
      },
    );
  },
);

mainAccountFileTest(
  qase(
    [1526],
    'Add a component from local library to Page 1 and Page 2, edit component on Page 2 and click "Reset overrides"',
  ),
  async ({ mainPage }) => {
    await mainAccountFileTest.step('Create a component on Page 1', async () => {
      await mainPage.createDefaultRectangleByCoordinates(300, 300);
      await mainPage.createComponentViaRightClick();
      await mainPage.waitForChangeIsSaved();
    });

    await mainAccountFileTest.step(
      'Add component from library to Page 2',
      async () => {
        await pagesPanelPage.clickAddPageButton();
        await mainPage.waitForChangeIsSaved();
        await pagesPanelPage.clickOnPageOnLayersPanel(2);
        await mainPage.waitForChangeIsSaved();
        await assetsPanelPage.clickAssetsTab();
        await assetsPanelPage.expandComponentsBlockOnAssetsTab();
        await assetsPanelPage.dragComponentOnCanvas(100, 100);
        await mainPage.waitForChangeIsSaved();
        await layersPanelPage.openLayersTab();
      },
    );

    await mainAccountFileTest.step(
      'Edit component and reset overrides',
      async () => {
        await layersPanelPage.clickCopyComponentOnLayersTab();
        await designPanelPage.changeHeightAndWidthForLayer('100', '150');
        await mainPage.waitForChangeIsSaved();
        await basePage.resetOverridesViaRightClick();
        await mainPage.waitForChangeIsSaved();
        await expect(mainPage.viewport).toHaveScreenshot(
          'page-copies-component-reset-overrides.png',
          {
            mask: mainPage.maskViewport(),
          },
        );
      },
    );
  },
);

mainAccountFileTest(
  qase(
    [1527],
    'Add a component from local library to Page 1 and Page 2, edit component on Page 2 and click "Update main component"',
  ),
  async ({ mainPage }) => {
    await mainAccountFileTest.step('Create a component on Page 1', async () => {
      await mainPage.createDefaultRectangleByCoordinates(200, 200);
      await mainPage.createComponentViaRightClick();
      await mainPage.waitForChangeIsSaved();
    });

    await mainAccountFileTest.step(
      'Add component from library to Page 2',
      async () => {
        await pagesPanelPage.clickAddPageButton();
        await mainPage.waitForChangeIsSaved();
        await pagesPanelPage.clickOnPageOnLayersPanel(2);
        await assetsPanelPage.clickAssetsTab();
        await assetsPanelPage.expandComponentsBlockOnAssetsTab();
        await assetsPanelPage.dragComponentOnCanvas(500, 500);
        await mainPage.waitForChangeIsSaved();
        await layersPanelPage.openLayersTab();
      },
    );

    await mainAccountFileTest.step(
      'Edit component fill color and update main component',
      async () => {
        await layersPanelPage.clickCopyComponentOnLayersTab();
        await designPanelPage.clickComponentFillColorIcon();
        await designPanelPage.setComponentColor('#243E8E');
        await mainPage.waitForChangeIsSaved();
        await layersPanelPage.clickCopyComponentOnLayersTab();
        await mainPage.waitForChangeIsSaved();
        await layersPanelPage.updateMainComponentViaRightClick();
        await mainPage.waitForChangeIsSaved();
      },
    );

    await mainAccountFileTest.step(
      'Navigate to Page 1 and verify updated component',
      async () => {
        await pagesPanelPage.clickOnPageOnLayersPanel(1);
        await expect(mainPage.viewport).toHaveScreenshot(
          'page-copies-component-update-main.png',
          {
            mask: mainPage.maskViewport(),
          },
        );
      },
    );
  },
);

mainAccountFileTest(
  qase(
    [2804, 2811, 2812],
    'Create separator page, move by drag & drop and delete it',
  ),
  async ({ mainPage }) => {
    await mainAccountFileTest.step(
      `2804 Render separator as horizontal line for empty page named '---' in sitemap`,
      async () => {
        await mainAccountFileTest.step(
          `Create a second page, to have: Page 1 > Page 2`,
          async () => {
            await pagesPanelPage.clickAddPageButton();
            await mainPage.waitForChangeIsSaved();

            await pagesPanelPage.checkNamedPagesCountIs(2);
            await pagesPanelPage.checkSeparatorPagesCountIs(0);
          },
        );

        await mainAccountFileTest.step(
          `Rename Page 2 to '---' to make it a Separator page, to have: Page 1 > ---`,
          async () => {
            await pagesPanelPage.renamePageViaRightClick('---', false);
            await mainPage.waitForChangeIsSaved();

            await pagesPanelPage.checkNamedPagesCountIs(1);
            await pagesPanelPage.checkSeparatorPagesCountIs(1);
          },
        );
      },
    );

    await mainAccountFileTest.step(
      `2811 Drag-and-drop: moving a separator within sitemap preserves separator rendering`,
      async () => {
        await mainAccountFileTest.step(
          `Create another page, to have: Page 1 > --- > Page 2 > Page 3`,
          async () => {
            await pagesPanelPage.clickAddPageButton();
            await pagesPanelPage.clickAddPageButton();
            await mainPage.waitForChangeIsSaved();
          },
        );

        await mainAccountFileTest.step(
          `Drag-and-drop the separator page after Page 2, to have: Page 1 > Page 2 > --- > Page 3`,
          async () => {
            await pagesPanelPage.dragSeparatorWithIndexBeyondPage(0, 'Page 2');
            await mainPage.waitForChangeIsSaved();
            await pagesPanelPage.checkNamedPagesCountIs(3);
            await pagesPanelPage.checkSeparatorPagesCountIs(1);
            await expect(pagesPanelPage.pagesBlock).toHaveScreenshot(
              'separator-between-two-pages.png',
            );
          },
        );

        await mainAccountFileTest.step(
          `Click a normal page above and below the separator to confirm navigation still works`,
          async () => {
            await pagesPanelPage.clickOnPageOnLayersPanel(1);
            await pagesPanelPage.isPageNameSelected('Page 1');
            await pagesPanelPage.clickOnPageOnLayersPanel(3);
            await pagesPanelPage.isPageNameSelected('Page 3');
          },
        );
      },
    );

    await mainAccountFileTest.step(
      `2812 Deleting a separator removes it from sitemap without affecting adjacent pages`,
      async () => {
        await pagesPanelPage.deleteSeparatorWithIndexViaRightClick(0);

        await pagesPanelPage.checkNamedPagesCountIs(3);
        await pagesPanelPage.checkSeparatorPagesCountIs(0);
      },
    );
  },
);
