import { DashboardPage } from '@pages/dashboard/dashboard-page';
import { TeamPage } from '@pages/dashboard/team-page';
import { ColorPalettePage } from '@pages/workspace/color-palette-page';
import { DesignPanelPage } from '@pages/workspace/design-panel-page';
import { LayersPanelPage } from '@pages/workspace/layers-panel-page';
import { MainPage } from '@pages/workspace/main-page';
import { expect } from '@playwright/test';
import { mainTest } from 'fixtures';
import { createTeamName } from 'helpers/teams/create-team-name';
import { qase } from 'playwright-qase-reporter/playwright';

const teamName = createTeamName();

let colorPalettePage: ColorPalettePage;
let dashboardPage: DashboardPage;
let designPanelPage: DesignPanelPage;
let layersPanelPage: LayersPanelPage;
let mainPage: MainPage;
let teamPage: TeamPage;

mainTest.beforeEach(async ({ page }) => {
  teamPage = new TeamPage(page);
  mainPage = new MainPage(page);
  dashboardPage = new DashboardPage(page);
  colorPalettePage = new ColorPalettePage(page);
  designPanelPage = new DesignPanelPage(page);
  layersPanelPage = new LayersPanelPage(page);
  await teamPage.createTeam(teamName);
  await teamPage.isTeamSelected(teamName);
  await dashboardPage.createFileViaPlaceholder();
  await mainPage.isMainPageLoaded();
});

mainTest(qase([275], 'Create Rectangle (Shortcut R)'), async () => {
  await mainTest.step(
    'Press R shortcut and verify rectangle tool is active',
    async () => {
      await mainPage.pressKeyboardShortcut('R');
    },
  );

  await mainTest.step(
    'Click on canvas and verify rectangle with default size is created',
    async () => {
      await mainPage.clickViewportTwice();
      await mainPage.waitForChangeIsSaved();
      await mainPage.isCreatedLayerVisible();
      await designPanelPage.checkSizeWidth('100');
      await designPanelPage.checkSizeHeight('100');
    },
  );
});

mainTest.describe(() => {
  mainTest.beforeEach(async () => {
    await mainTest.slow();
    await mainPage.clickCreateRectangleButton();
    await mainPage.clickViewportTwice();
    await mainPage.waitForChangeIsSaved();
  });

  mainTest(qase([274], 'Create Rectangle (Toolbar)'), async () => {
    await mainTest.step('Verify rectangle layer is created', async () => {
      await mainPage.isCreatedLayerVisible();
      await expect(mainPage.viewport).toHaveScreenshot('rectangle.png', {
        mask: mainPage.maskViewport(),
      });
    });
  });

  mainTest(qase([2544], 'Delete Rectangle (From Keyboard)'), async () => {
    await mainTest.step(
      'Verify rectangle is visible and delete via keyboard',
      async () => {
        await mainPage.isCreatedLayerVisible();
        await mainPage.deleteLayerViaShortcut();
        await mainPage.waitForChangeIsSaved();
      },
    );

    await mainTest.step('Verify rectangle is deleted', async () => {
      await mainPage.isCreatedLayerVisible(false);
    });
  });

  mainTest(
    qase([278], 'Change border radius multiple values (Design page in the right)'),
    async () => {
      await mainTest.step('Set independent corner radii and verify', async () => {
        await designPanelPage.clickIndividualCornersRadiusButton();
        await designPanelPage.changeIndependentCorners('30', '60', '90', '120');
        await mainPage.waitForChangeIsSaved();
        await expect(mainPage.viewport).toHaveScreenshot(
          'rectangle-changed-corners.png',
          { mask: mainPage.maskViewport() },
        );
      });

      await mainTest.step('Reset corner radii and verify default', async () => {
        await designPanelPage.changeIndependentCorners('0', '0', '0', '0');
        await mainPage.waitForChangeIsSaved();
        await expect(mainPage.viewport).toHaveScreenshot('rectangle.png', {
          mask: mainPage.maskViewport(),
        });
      });
    },
  );

  mainTest(qase([319], 'Transform Rectangle to Path'), async () => {
    await mainTest.step('Transform rectangle to path via right click', async () => {
      await mainPage.transformToPathViaRightClick();
      await mainPage.waitForChangeIsUnsaved();
      await mainPage.waitForChangeIsSaved();
    });

    await mainTest.step(
      'Verify path component is visible on layers tab',
      async () => {
        await layersPanelPage.isPathComponentOnLayersTabVisible();
      },
    );
  });

  mainTest(
    qase(
      [324],
      'Create component and detach instance (Right click and shortcut Ctrl+Shift+K)',
    ),
    async () => {
      await mainTest.step(
        'Create component from rectangle via right click',
        async () => {
          await mainPage.createComponentViaRightClick();
          await mainPage.waitForChangeIsSaved();
        },
      );

      await mainTest.step(
        'Verify component appears with included rectangle',
        async () => {
          await layersPanelPage.isMainComponentOnLayersTabVisibleWithName(
            'Rectangle',
          );
        },
      );

      await mainTest.step('Copy created rectangle component twice', async () => {
        await mainPage.duplicateLayerViaRightClick();
        await mainPage.waitForChangeIsSaved();
        await layersPanelPage.checkCopyComponentLayerCount(1);
        await mainPage.duplicateLayerViaRightClick();
        await mainPage.waitForChangeIsSaved();
        await layersPanelPage.checkCopyComponentLayerCount(2);
      });

      await mainTest.step(
        'Detach a rectangle copy instance via right click',
        async () => {
          await layersPanelPage.detachInstanceFirstCopyComponentViaRightClick();
          await mainPage.waitForChangeIsSaved();
        },
      );

      await mainTest.step(
        'Verify one copy instance was detached (copy count is 1)',
        async () => {
          await layersPanelPage.checkCopyComponentLayerCount(1);
        },
      );

      await mainTest.step(
        'Select remaining rectangle copy and detach instance via shortcut',
        async () => {
          await layersPanelPage.clickCopyComponentOnLayersTab();
          await mainPage.detachInstanceViaShortcut();
          await mainPage.waitForChangeIsSaved();
        },
      );

      await mainTest.step(
        'Verify all copy instances were detached (copy count is 0)',
        async () => {
          await layersPanelPage.checkCopyComponentLayerCount(0);
        },
      );
    },
  );
});

mainTest(qase([2255], 'Select and deselect rectangles'), async () => {
  await mainTest.step('Create four rectangles on canvas', async () => {
    await mainPage.createDefaultRectangleByCoordinates(400, 800);
    await mainPage.createDefaultRectangleByCoordinates(400, 200, true);
    await mainPage.createDefaultRectangleByCoordinates(100, 600, true);
    await mainPage.createDefaultRectangleByCoordinates(700, 600, true);
    await mainPage.clickViewportTwice();
    await mainPage.waitForChangeIsSaved();
  });

  await mainTest.step(
    'Select all and deselect one, verify three selected',
    async () => {
      await mainPage.pressSelectAllShortcut();
      await mainPage.deselectElement();
      await expect(mainPage.viewport).toHaveScreenshot(
        'three-rectangle-selected.png',
        {
          mask: mainPage.maskViewport(),
        },
      );
    },
  );

  await mainTest.step('Deselect further and verify one selected', async () => {
    await mainPage.deselectElement();
    await mainPage.deselectElement();
    await expect(mainPage.viewport).toHaveScreenshot('one-rectangle-selected.png', {
      mask: mainPage.maskViewport(),
    });
  });
});
