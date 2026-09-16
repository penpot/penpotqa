import { BasePage } from '@pages/base-page';
import { AssetsPanelPage } from '@pages/workspace/assets-panel-page';
import { DesignPanelPage } from '@pages/workspace/design-panel-page';
import { LayersPanelPage } from '@pages/workspace/layers-panel-page';
import { PagesPanelPage } from '@pages/workspace/panels-features/pages-panel-page';
import { expect } from '@playwright/test';
import { demoAccountFileTest } from 'fixtures';
import { qase } from 'playwright-qase-reporter/playwright';

let basePage: BasePage;
let layersPanelPage: LayersPanelPage;
let assetsPanelPage: AssetsPanelPage;
let designPanelPage: DesignPanelPage;
let pagesPanelPage: PagesPanelPage;

demoAccountFileTest.beforeEach(async ({ page }) => {
  basePage = new BasePage(page);
  layersPanelPage = new LayersPanelPage(page);
  assetsPanelPage = new AssetsPanelPage(page);
  designPanelPage = new DesignPanelPage(page);
  pagesPanelPage = new PagesPanelPage(page);
});

demoAccountFileTest(qase([832], 'Create new page'), async ({ mainPage }) => {
  await demoAccountFileTest.step('Add a new page', async () => {
    await pagesPanelPage.clickAddPageButton();
    await mainPage.waitForChangeIsSaved();
    await mainPage.clickMoveButton();
  });

  await demoAccountFileTest.step(
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

demoAccountFileTest(qase([833], 'Rename page'), async ({ mainPage }) => {
  await demoAccountFileTest.step('Add a second page', async () => {
    await pagesPanelPage.clickAddPageButton();
    await mainPage.waitForChangeIsSaved();
  });

  await demoAccountFileTest.step('Rename first page', async () => {
    await pagesPanelPage.renamePageViaRightClick('NewFirstPage');
    await mainPage.waitForChangeIsSaved();
    await pagesPanelPage.isFirstPageNameDisplayed('NewFirstPage');
  });

  await demoAccountFileTest.step('Rename second page', async () => {
    await pagesPanelPage.renamePageViaRightClick('NewSecondPage', false);
    await mainPage.waitForChangeIsSaved();
    await pagesPanelPage.isSecondPageNameDisplayed('NewSecondPage');
  });
});

demoAccountFileTest(qase([834], 'Duplicate page'), async ({ mainPage }) => {
  await demoAccountFileTest.step('Duplicate the first page', async () => {
    await pagesPanelPage.duplicatePageViaRightClick();
    await mainPage.waitForChangeIsSaved();
  });

  await demoAccountFileTest.step('Verify duplicated page names', async () => {
    await pagesPanelPage.isFirstPageNameDisplayed('Page 1');
    await pagesPanelPage.isSecondPageNameDisplayed('Page 1 (copy)');
  });
});

demoAccountFileTest(
  qase([835], 'Switch between pages'),
  async ({ page, mainPage }) => {
    await demoAccountFileTest.step('Navigate to second page', async () => {
      await pagesPanelPage.clickAddPageButton();
      await pagesPanelPage.clickOnPageOnLayersPanel(2);
      await mainPage.clickMoveButton();
      await mainPage.clickViewportTwice();
      await mainPage.waitForChangeIsSaved();
    });

    await demoAccountFileTest.step('Verify second page canvas', async () => {
      await expect(page).toHaveScreenshot('canvas-second-page-selected.png', {
        mask: [
          mainPage.guides,
          mainPage.guidesFragment,
          mainPage.toolBarWindow,
          mainPage.usersSection,
        ],
      });
    });

    await demoAccountFileTest.step('Navigate back to first page', async () => {
      await pagesPanelPage.clickOnPageOnLayersPanel();
      await mainPage.clickMoveButton();
      await mainPage.clickViewportTwice();
      await mainPage.waitForChangeIsSaved();
    });

    await demoAccountFileTest.step('Verify first page canvas', async () => {
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

demoAccountFileTest(
  qase([836], 'Collapse/expand pages list'),
  async ({ mainPage }) => {
    await demoAccountFileTest.step(
      'Add a second page and collapse the pages list',
      async () => {
        await pagesPanelPage.clickAddPageButton();
        await mainPage.waitForChangeIsSaved();
        await pagesPanelPage.clickCollapseExpandPagesButton();
        await mainPage.waitForChangeIsSaved();
        await mainPage.clickMoveButton();
      },
    );

    await demoAccountFileTest.step('Verify pages list is collapsed', async () => {
      await expect(pagesPanelPage.pagesBlock).toHaveScreenshot('hidden-pages.png');
    });

    await demoAccountFileTest.step(
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

demoAccountFileTest(qase([837], 'Delete page'), async ({ mainPage }) => {
  await demoAccountFileTest.step('Add two extra pages', async () => {
    await pagesPanelPage.clickAddPageButton();
    await mainPage.waitForChangeIsSaved();
    await pagesPanelPage.clickAddPageButton();
    await mainPage.waitForChangeIsSaved();
  });

  await demoAccountFileTest.step(
    'Delete second page via right-click and verify',
    async () => {
      await pagesPanelPage.deleteSecondPageViaRightClick();
      await mainPage.waitForChangeIsSaved();
      await pagesPanelPage.isFirstPageNameDisplayed('Page 1');
      await pagesPanelPage.isSecondPageNameDisplayed('Page 3');
    },
  );

  await demoAccountFileTest.step(
    'Delete second page via trash icon and verify',
    async () => {
      await pagesPanelPage.deleteSecondPageViaTrashIcon('Page 3');
      await mainPage.waitForChangeIsSaved();
      await pagesPanelPage.isFirstPageNameDisplayed('Page 1');
      await pagesPanelPage.isSecondPageAddedToAssetsPanel(false);
    },
  );
});

demoAccountFileTest(
  qase([839], 'Create 3 pages, delete 2nd page, undo delete (CTRL Z)'),
  async () => {
    await demoAccountFileTest.step(
      'Create three pages and delete the second',
      async () => {
        await pagesPanelPage.clickAddPageButton();
        await pagesPanelPage.clickAddPageButton();
        await pagesPanelPage.deleteSecondPageViaRightClick();
        await pagesPanelPage.isSecondPageNameDisplayed('Page 2', false);
      },
    );

    await demoAccountFileTest.step(
      'Undo deletion and verify page is restored',
      async () => {
        await pagesPanelPage.clickShortcutCtrlZ();
        await pagesPanelPage.isSecondPageNameDisplayed('Page 2', true);
      },
    );
  },
);

demoAccountFileTest(
  qase(
    [1526],
    'Add a component from local library to Page 1 and Page 2, edit component on Page 2 and click "Reset overrides"',
  ),
  async ({ mainPage }) => {
    await demoAccountFileTest.step('Create a component on Page 1', async () => {
      await mainPage.createDefaultRectangleByCoordinates(300, 300);
      await mainPage.createComponentViaRightClick();
      await mainPage.waitForChangeIsSaved();
    });

    await demoAccountFileTest.step(
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

    await demoAccountFileTest.step(
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

demoAccountFileTest(
  qase(
    [1527],
    'Add a component from local library to Page 1 and Page 2, edit component on Page 2 and click "Update main component"',
  ),
  async ({ mainPage }) => {
    await demoAccountFileTest.step('Create a component on Page 1', async () => {
      await mainPage.createDefaultRectangleByCoordinates(200, 200);
      await mainPage.createComponentViaRightClick();
      await mainPage.waitForChangeIsSaved();
    });

    await demoAccountFileTest.step(
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

    await demoAccountFileTest.step(
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

    await demoAccountFileTest.step(
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

demoAccountFileTest(
  qase(
    [2804, 2811, 2812],
    'Create separator page, move by drag & drop and delete it',
  ),
  async ({ mainPage }) => {
    await demoAccountFileTest.step(
      `2804 Render separator as horizontal line for empty page named '---' in sitemap`,
      async () => {
        await demoAccountFileTest.step(
          `Create a second page, to have: Page 1 > Page 2`,
          async () => {
            await pagesPanelPage.clickAddPageButton();
            await mainPage.waitForChangeIsSaved();

            await pagesPanelPage.checkNamedPagesCountIs(2);
            await pagesPanelPage.checkSeparatorPagesCountIs(0);
          },
        );

        await demoAccountFileTest.step(
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

    await demoAccountFileTest.step(
      `2811 Drag-and-drop: moving a separator within sitemap preserves separator rendering`,
      async () => {
        await demoAccountFileTest.step(
          `Create another page, to have: Page 1 > --- > Page 2 > Page 3`,
          async () => {
            await pagesPanelPage.clickAddPageButton();
            await pagesPanelPage.clickAddPageButton();
            await mainPage.waitForChangeIsSaved();
          },
        );

        await demoAccountFileTest.step(
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

        await demoAccountFileTest.step(
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

    await demoAccountFileTest.step(
      `2812 Deleting a separator removes it from sitemap without affecting adjacent pages`,
      async () => {
        await pagesPanelPage.deleteSeparatorWithIndexViaRightClick(0);

        await pagesPanelPage.checkNamedPagesCountIs(3);
        await pagesPanelPage.checkSeparatorPagesCountIs(0);
      },
    );
  },
);

demoAccountFileTest(
  qase(
    [3599, 3602, 3600, 3604],
    'Multi-select pages via Shift/Ctrl+click and bulk-delete them',
  ),
  async ({ mainPage }) => {
    let initialPageId: string;

    await demoAccountFileTest.step(
      '3599, Select a range of pages using Shift+click',
      async () => {
        await demoAccountFileTest.step(
          'Create 3 extra pages (4 total)',
          async () => {
            await pagesPanelPage.clickAddPageButton();
            await pagesPanelPage.clickAddPageButton();
            await pagesPanelPage.clickAddPageButton();
            await mainPage.waitForChangeIsSaved();
          },
        );

        await demoAccountFileTest.step(
          'Click on Page 1, it opens and is the only page selected',
          async () => {
            await pagesPanelPage.getPageListItemByName('Page 1').click();
            initialPageId = await pagesPanelPage.getCurrentPageId();
            await pagesPanelPage.isPageNameSelected('Page 1');
            await pagesPanelPage.checkSelectedPagesCountIs(1);
          },
        );

        await demoAccountFileTest.step(
          'Shift+click on Page 3 to select the range without changing the current workspace page',
          async () => {
            await pagesPanelPage.shiftClickPageByName('Page 3');
            await pagesPanelPage.isPageNameSelected('Page 1');
            await pagesPanelPage.isPageNameSelected('Page 2');
            await pagesPanelPage.isPageNameSelected('Page 3');
            await pagesPanelPage.isPageNameSelected('Page 4', false);
            await pagesPanelPage.checkSelectedPagesCountIs(3);
            expect(
              await pagesPanelPage.getCurrentPageId(),
              'Workspace should stay on the originally opened page',
            ).toBe(initialPageId);
          },
        );

        await demoAccountFileTest.step(
          'Shift+click on Page 4 to extend the range without changing the current workspace page',
          async () => {
            await pagesPanelPage.shiftClickPageByName('Page 4');
            await pagesPanelPage.isPageNameSelected('Page 1');
            await pagesPanelPage.isPageNameSelected('Page 2');
            await pagesPanelPage.isPageNameSelected('Page 3');
            await pagesPanelPage.isPageNameSelected('Page 4');
            await pagesPanelPage.checkSelectedPagesCountIs(4);
            expect(
              await pagesPanelPage.getCurrentPageId(),
              'Workspace should stay on the originally opened page',
            ).toBe(initialPageId);
          },
        );
      },
    );

    await demoAccountFileTest.step(
      '3602, Delete multiple selected pages at once and undo the bulk delete',
      async () => {
        await demoAccountFileTest.step(
          'Narrow the range from 3599 down to Page 1 through Page 3 with one more Shift+click',
          async () => {
            await pagesPanelPage.shiftClickPageByName('Page 3');
            await pagesPanelPage.isPageNameSelected('Page 1');
            await pagesPanelPage.isPageNameSelected('Page 2');
            await pagesPanelPage.isPageNameSelected('Page 3');
            await pagesPanelPage.isPageNameSelected('Page 4', false);
            await pagesPanelPage.checkSelectedPagesCountIs(3);
          },
        );

        await demoAccountFileTest.step(
          'Right-click a selected page and verify only "Delete pages" is offered',
          async () => {
            await pagesPanelPage
              .getPageListItemByName('Page 3')
              .click({ button: 'right' });
            await pagesPanelPage.isBulkDeleteContextMenuVisible();
          },
        );

        await demoAccountFileTest.step(
          'Click "Delete pages" and confirm the dialog',
          async () => {
            await pagesPanelPage.deletePagesMenuItem.click();
            await expect(
              pagesPanelPage.deletePagesDialogTitle,
              '"Delete pages" confirmation dialog should be visible',
            ).toBeVisible();
            await pagesPanelPage.deletePageOkButton.click();
            await mainPage.waitForChangeIsSaved();
          },
        );

        await demoAccountFileTest.step(
          'Verify Page 1, Page 2 and Page 3 were removed in a single action',
          async () => {
            await pagesPanelPage.checkNamedPagesCountIs(1);
            await pagesPanelPage.isFirstPageNameDisplayed('Page 4');
          },
        );

        await demoAccountFileTest.step(
          'Undo and verify all pages are restored at once, in order',
          async () => {
            await pagesPanelPage.clickShortcutCtrlZ();
            await pagesPanelPage.checkNamedPagesCountIs(4);
            await pagesPanelPage.isFirstPageNameDisplayed('Page 1');
            await pagesPanelPage.isSecondPageNameDisplayed('Page 2');
          },
        );
      },
    );

    await demoAccountFileTest.step(
      '3600, Toggle individual page selection using Ctrl/Cmd+click',
      async () => {
        await demoAccountFileTest.step(
          'Click on Page 1, it opens and is the only page selected',
          async () => {
            await pagesPanelPage.getPageListItemByName('Page 1').click();
            initialPageId = await pagesPanelPage.getCurrentPageId();
            await pagesPanelPage.checkSelectedPagesCountIs(1);
          },
        );

        await demoAccountFileTest.step(
          'Ctrl/Cmd+click on Page 2 adds it to the selection without changing the current workspace page',
          async () => {
            await pagesPanelPage.ctrlClickPageByName('Page 2');
            await pagesPanelPage.isPageNameSelected('Page 1');
            await pagesPanelPage.isPageNameSelected('Page 2');
            await pagesPanelPage.checkSelectedPagesCountIs(2);
            expect(
              await pagesPanelPage.getCurrentPageId(),
              'Workspace should stay on the originally opened page',
            ).toBe(initialPageId);
          },
        );

        await demoAccountFileTest.step(
          'Ctrl/Cmd+click on Page 4 adds it to the selection',
          async () => {
            await pagesPanelPage.ctrlClickPageByName('Page 4');
            await pagesPanelPage.isPageNameSelected('Page 1');
            await pagesPanelPage.isPageNameSelected('Page 2');
            await pagesPanelPage.isPageNameSelected('Page 4');
            await pagesPanelPage.isPageNameSelected('Page 3', false);
            await pagesPanelPage.checkSelectedPagesCountIs(3);
          },
        );

        await demoAccountFileTest.step(
          'Ctrl/Cmd+click on Page 2 again removes it from the selection',
          async () => {
            await pagesPanelPage.ctrlClickPageByName('Page 2');
            await pagesPanelPage.isPageNameSelected('Page 2', false);
            await pagesPanelPage.isPageNameSelected('Page 1');
            await pagesPanelPage.isPageNameSelected('Page 4');
            await pagesPanelPage.checkSelectedPagesCountIs(2);
          },
        );
      },
    );

    await demoAccountFileTest.step(
      '3604, Delete all pages while keeping at least one page in the file',
      async () => {
        await demoAccountFileTest.step(
          'Select all 4 pages using Shift+click',
          async () => {
            await pagesPanelPage.getPageListItemByName('Page 1').click();
            await pagesPanelPage.shiftClickPageByName('Page 4');
            await pagesPanelPage.checkSelectedPagesCountIs(4);
          },
        );

        await demoAccountFileTest.step(
          'Delete the selected pages and confirm the dialog',
          async () => {
            await pagesPanelPage.deleteSelectedPagesViaRightClick('Page 2');
            await mainPage.waitForChangeIsSaved();
          },
        );

        await demoAccountFileTest.step(
          'Verify exactly one page remains: Page 1, with no error shown',
          async () => {
            await pagesPanelPage.checkNamedPagesCountIs(1);
            await pagesPanelPage.isFirstPageNameDisplayed('Page 1');
            await pagesPanelPage.isPageNameSelected('Page 1');
          },
        );
      },
    );
  },
);
