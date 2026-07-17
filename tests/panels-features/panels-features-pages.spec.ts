import { BasePage } from '@pages/base-page';
import { DashboardPage } from '@pages/dashboard/dashboard-page';
import { TeamPage } from '@pages/dashboard/team-page';
import { AssetsPanelPage } from '@pages/workspace/assets-panel-page';
import { DesignPanelPage } from '@pages/workspace/design-panel-page';
import { LayersPanelPage } from '@pages/workspace/layers-panel-page';
import { MainPage } from '@pages/workspace/main-page';
import { PagesPanelPage } from '@pages/workspace/panels-features/pages-panel-page';
import { expect } from '@playwright/test';
import { mainTest } from 'fixtures';
import { createTeamName } from 'helpers/teams/create-team-name';
import { qase } from 'playwright-qase-reporter/playwright';

let teamName: string;
let mainPage: MainPage;
let teamPage: TeamPage;
let dashboardPage: DashboardPage;
let basePage: BasePage;
let layersPanelPage: LayersPanelPage;
let assetsPanelPage: AssetsPanelPage;
let designPanelPage: DesignPanelPage;
let pagesPanelPage: PagesPanelPage;

mainTest.beforeEach(async ({ page }) => {
  teamName = createTeamName();
  teamPage = new TeamPage(page);
  dashboardPage = new DashboardPage(page);
  basePage = new BasePage(page);
  layersPanelPage = new LayersPanelPage(page);
  assetsPanelPage = new AssetsPanelPage(page);
  designPanelPage = new DesignPanelPage(page);
  mainPage = new MainPage(page);
  pagesPanelPage = new PagesPanelPage(page);

  await teamPage.createTeam(teamName);
  await teamPage.isTeamSelected(teamName);
  await dashboardPage.createFileViaPlaceholder();
  await mainPage.isMainPageLoaded();
});

mainTest(qase([832], 'Create new page'), async () => {
  await mainTest.step('Add a new page', async () => {
    await pagesPanelPage.clickAddPageButton();
    await mainPage.waitForChangeIsSaved();
    await mainPage.clickMoveButton();
  });

  await mainTest.step('Verify two pages are shown in the panel', async () => {
    await pagesPanelPage.isFirstPageAddedToAssetsPanel();
    await pagesPanelPage.isSecondPageAddedToAssetsPanel();
    await expect(pagesPanelPage.pagesBlock).toHaveScreenshot(
      'page-1-and-page-2.png',
    );
  });
});

mainTest(qase([833], 'Rename page'), async () => {
  await mainTest.step('Add a second page', async () => {
    await pagesPanelPage.clickAddPageButton();
    await mainPage.waitForChangeIsSaved();
    await mainPage.clickMoveButton();
  });

  await mainTest.step('Rename first page', async () => {
    await pagesPanelPage.renamePageViaRightClick('NewFirstPage');
    await mainPage.waitForChangeIsSaved();
    await pagesPanelPage.isFirstPageNameDisplayed('NewFirstPage');
  });

  await mainTest.step('Rename second page', async () => {
    await pagesPanelPage.renamePageViaRightClick('NewSecondPage', false);
    await mainPage.waitForChangeIsSaved();
    await pagesPanelPage.isSecondPageNameDisplayed('NewSecondPage');
  });
});

mainTest(qase([834], 'Duplicate page'), async () => {
  await mainTest.step('Duplicate the first page', async () => {
    await pagesPanelPage.duplicatePageViaRightClick();
    await mainPage.waitForChangeIsSaved();
  });

  await mainTest.step('Verify duplicated page names', async () => {
    await pagesPanelPage.isFirstPageNameDisplayed('Page 1');
    await pagesPanelPage.isSecondPageNameDisplayed('Page 1 (copy)');
  });
});

mainTest(qase([835], 'Switch between pages'), async ({ page }) => {
  await mainTest.step('Navigate to second page', async () => {
    await pagesPanelPage.clickAddPageButton();
    await pagesPanelPage.clickOnPageOnLayersPanel(2);
    await mainPage.clickMoveButton();
    await mainPage.clickViewportTwice();
    await mainPage.waitForChangeIsSaved();
  });

  await mainTest.step('Verify second page canvas', async () => {
    await expect(page).toHaveScreenshot('canvas-second-page-selected.png', {
      mask: [
        mainPage.guides,
        mainPage.guidesFragment,
        mainPage.toolBarWindow,
        mainPage.usersSection,
      ],
    });
  });

  await mainTest.step('Navigate back to first page', async () => {
    await pagesPanelPage.clickOnPageOnLayersPanel();
    await mainPage.clickMoveButton();
    await mainPage.clickViewportTwice();
    await mainPage.waitForChangeIsSaved();
  });

  await mainTest.step('Verify first page canvas', async () => {
    await expect(page).toHaveScreenshot('canvas-first-page-selected.png', {
      mask: [
        mainPage.guides,
        mainPage.guidesFragment,
        mainPage.toolBarWindow,
        mainPage.usersSection,
      ],
    });
  });
});

mainTest(qase([836], 'Collapse/expand pages list'), async () => {
  await mainTest.step('Add a second page and collapse the pages list', async () => {
    await pagesPanelPage.clickAddPageButton();
    await mainPage.waitForChangeIsSaved();
    await pagesPanelPage.clickCollapseExpandPagesButton();
    await mainPage.waitForChangeIsSaved();
    await mainPage.clickMoveButton();
  });

  await mainTest.step('Verify pages list is collapsed', async () => {
    await expect(pagesPanelPage.pagesBlock).toHaveScreenshot('hidden-pages.png');
  });

  await mainTest.step(
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
});

mainTest(qase([837], 'Delete page'), async () => {
  await mainTest.step('Add two extra pages', async () => {
    await pagesPanelPage.clickAddPageButton();
    await mainPage.waitForChangeIsSaved();
    await pagesPanelPage.clickAddPageButton();
    await mainPage.waitForChangeIsSaved();
  });

  await mainTest.step('Delete second page via right-click and verify', async () => {
    await pagesPanelPage.deleteSecondPageViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await pagesPanelPage.isFirstPageNameDisplayed('Page 1');
    await pagesPanelPage.isSecondPageNameDisplayed('Page 3');
  });

  await mainTest.step('Delete second page via trash icon and verify', async () => {
    await pagesPanelPage.deleteSecondPageViaTrashIcon('Page 3');
    await mainPage.waitForChangeIsSaved();
    await pagesPanelPage.isFirstPageNameDisplayed('Page 1');
    await pagesPanelPage.isSecondPageAddedToAssetsPanel(false);
  });
});

mainTest(
  qase([839], 'Create 3 pages, delete 2nd page, undo delete (CTRL Z)'),
  async () => {
    await mainTest.step('Create three pages and delete the second', async () => {
      await pagesPanelPage.clickAddPageButton();
      await pagesPanelPage.clickAddPageButton();
      await pagesPanelPage.deleteSecondPageViaRightClick();
      await pagesPanelPage.isSecondPageNameDisplayed('Page 2', false);
    });

    await mainTest.step('Undo deletion and verify page is restored', async () => {
      await pagesPanelPage.clickShortcutCtrlZ();
      await pagesPanelPage.isSecondPageNameDisplayed('Page 2', true);
    });
  },
);

mainTest(
  qase(
    [1526],
    'Add a component from local library to Page 1 and Page 2, edit component on Page 2 and click "Reset overrides"',
  ),
  async () => {
    await mainTest.step('Create a component on Page 1', async () => {
      await mainPage.createDefaultRectangleByCoordinates(300, 300);
      await mainPage.createComponentViaRightClick();
      await mainPage.waitForChangeIsSaved();
    });

    await mainTest.step('Add component from library to Page 2', async () => {
      await pagesPanelPage.clickAddPageButton();
      await mainPage.waitForChangeIsSaved();
      await pagesPanelPage.clickOnPageOnLayersPanel(2);
      await assetsPanelPage.clickAssetsTab();
      await assetsPanelPage.expandComponentsBlockOnAssetsTab();
      await assetsPanelPage.dragComponentOnCanvas(100, 100);
      await layersPanelPage.openLayersTab();
      await mainPage.waitForChangeIsSaved();
    });

    await mainTest.step('Edit component and reset overrides', async () => {
      await layersPanelPage.clickCopyComponentOnLayersTab();
      await designPanelPage.changeHeightAndWidthForLayer('100', '150');
      await basePage.resetOverridesViaRightClick();
      await mainPage.waitForChangeIsSaved();
      await expect(mainPage.viewport).toHaveScreenshot(
        'page-copies-component-reset-overrides.png',
        {
          mask: mainPage.maskViewport(),
        },
      );
    });
  },
);

mainTest(
  qase(
    [1527],
    'Add a component from local library to Page 1 and Page 2, edit component on Page 2 and click "Update main component"',
  ),
  async () => {
    await mainTest.step('Create a component on Page 1', async () => {
      await mainPage.createDefaultRectangleByCoordinates(200, 200);
      await mainPage.createComponentViaRightClick();
      await mainPage.waitForChangeIsSaved();
    });

    await mainTest.step('Add component from library to Page 2', async () => {
      await pagesPanelPage.clickAddPageButton();
      await mainPage.waitForChangeIsSaved();
      await pagesPanelPage.clickOnPageOnLayersPanel(2);
      await assetsPanelPage.clickAssetsTab();
      await assetsPanelPage.expandComponentsBlockOnAssetsTab();
      await assetsPanelPage.dragComponentOnCanvas(500, 500);
      await layersPanelPage.openLayersTab();
      await mainPage.waitForChangeIsSaved();
    });

    await mainTest.step(
      'Edit component fill color and update main component',
      async () => {
        await layersPanelPage.clickCopyComponentOnLayersTab();
        await designPanelPage.clickComponentFillColorIcon();
        await designPanelPage.setComponentColor('#243E8E');
        await layersPanelPage.clickCopyComponentOnLayersTab();
        await mainPage.waitForChangeIsSaved();
        await layersPanelPage.updateMainComponentViaRightClick();
        await mainPage.waitForChangeIsUnsaved();
        await mainPage.waitForChangeIsSaved();
      },
    );

    await mainTest.step(
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

mainTest(
  qase(
    [2804, 2811, 2812],
    'Create separator page, move by drag & drop and delete it',
  ),
  async () => {
    await mainTest.step(
      `2804 Render separator as horizontal line for empty page named '---' in sitemap`,
      async () => {
        await mainTest.step(
          `Create a second page, to have: Page 1 > Page 2`,
          async () => {
            await pagesPanelPage.clickAddPageButton();
            await mainPage.waitForChangeIsSaved();

            await pagesPanelPage.checkNamedPagesCountIs(2);
            await pagesPanelPage.checkSeparatorPagesCountIs(0);
          },
        );

        await mainTest.step(
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

    await mainTest.step(
      `2811 Drag-and-drop: moving a separator within sitemap preserves separator rendering`,
      async () => {
        await mainTest.step(
          `Create another page, to have: Page 1 > --- > Page 2 > Page 3`,
          async () => {
            await pagesPanelPage.clickAddPageButton();
            await pagesPanelPage.clickAddPageButton();
            await mainPage.waitForChangeIsSaved();
          },
        );

        await mainTest.step(
          `Drag-and-drop the separator page after Page 2, to have: Page 1 > Page 2 > --- > Page 3`,
          async () => {
            await pagesPanelPage.dragSeparatorWithIndexBeyondPage(0, 'Page 2');

            await expect(pagesPanelPage.pagesBlock).toHaveScreenshot(
              'separator-between-two-pages.png',
            );
            await pagesPanelPage.checkNamedPagesCountIs(3);
            await pagesPanelPage.checkSeparatorPagesCountIs(1);
          },
        );

        await mainTest.step(
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

    await mainTest.step(
      `2812 Deleting a separator removes it from sitemap without affecting adjacent pages`,
      async () => {
        await pagesPanelPage.deleteSeparatorWithIndexViaRightClick(0);

        await pagesPanelPage.checkNamedPagesCountIs(3);
        await pagesPanelPage.checkSeparatorPagesCountIs(0);
      },
    );
  },
);
