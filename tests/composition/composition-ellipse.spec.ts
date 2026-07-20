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
  layersPanelPage = new LayersPanelPage(page);
  colorPalettePage = new ColorPalettePage(page);
  designPanelPage = new DesignPanelPage(page);
  teamPage = new TeamPage(page);
  dashboardPage = new DashboardPage(page);
  mainPage = new MainPage(page);
  await teamPage.createTeam(teamName);
  await teamPage.isTeamSelected(teamName);
  await dashboardPage.createFileViaPlaceholder();
  await mainPage.isMainPageLoaded();
});

mainTest(qase([328], 'Create Ellipse (Shortcut E)'), async () => {
  await mainTest.step(
    'Press E shortcut and verify ellipse tool is active',
    async () => {
      await mainPage.pressKeyboardShortcut('E');
    },
  );

  await mainTest.step(
    'Click on canvas and verify ellipse with default size is created',
    async () => {
      await mainPage.clickViewportTwice();
      await mainPage.waitForChangeIsSaved();
      await mainPage.isCreatedLayerVisible();
      await layersPanelPage.isLayerNameDisplayed('Ellipse');
      await designPanelPage.checkSizeWidth('100');
      await designPanelPage.checkSizeHeight('100');
    },
  );
});

mainTest.describe(() => {
  mainTest.beforeEach(async () => {
    mainTest.slow();
    await mainPage.clickCreateEllipseButton();
    await mainPage.clickViewportTwice();
    await mainPage.waitForChangeIsSaved();
  });

  mainTest(qase([327], 'Create Ellipse (Toolbar)'), async () => {
    await mainTest.step('Verify ellipse layer is created', async () => {
      await mainPage.isCreatedLayerVisible();
      await expect(mainPage.viewport).toHaveScreenshot('ellipse.png', {
        mask: mainPage.maskViewport(),
      });
    });
  });

  mainTest(qase([334], 'Add, hide, unhide and delete Blur to ellipse'), async () => {
    await mainTest.step('Set fill color and add blur', async () => {
      await designPanelPage.clickFillColorIcon();
      await colorPalettePage.setHex('#304d6a');
      await mainPage.waitForChangeIsSaved();
      await designPanelPage.clickAddBlurButton();
      await mainPage.waitForChangeIsSaved();
      await mainPage.waitForResizeHandlerVisible();
    });

    await mainTest.step('Verify blur is applied', async () => {
      await expect(mainPage.viewport).toHaveScreenshot('ellipse-blur-default.png', {
        mask: mainPage.maskViewport(),
      });
    });

    await mainTest.step('Hide blur and verify', async () => {
      await designPanelPage.hideBlur();
      await mainPage.waitForChangeIsSaved();
      await mainPage.waitForResizeHandlerVisible();
      await expect(mainPage.viewport).toHaveScreenshot('ellipse-blur-hide.png', {
        mask: mainPage.maskViewport(),
      });
    });

    await mainTest.step('Unhide blur and verify', async () => {
      await designPanelPage.unhideBlur();
      await mainPage.waitForChangeIsSaved();
      await mainPage.waitForResizeHandlerVisible();
      await expect(mainPage.viewport).toHaveScreenshot('ellipse-blur-unhide.png', {
        mask: mainPage.maskViewport(),
      });
    });

    await mainTest.step('Remove blur and verify', async () => {
      await designPanelPage.removeBlur();
      await mainPage.waitForChangeIsSaved();
      await mainPage.waitForResizeHandlerVisible();
      await expect(mainPage.viewport).toHaveScreenshot('ellipse-blur-remove.png', {
        mask: mainPage.maskViewport(),
      });
    });
  });

  mainTest(qase([335], 'Add and edit Blur to ellipse'), async () => {
    await mainTest.step('Add blur and change value', async () => {
      await designPanelPage.clickAddBlurButton();
      await designPanelPage.changeValueForBlur('55');
      await mainPage.waitForChangeIsSaved();
      await mainPage.waitForResizeHandlerVisible();
    });

    await mainTest.step('Verify blur appearance', async () => {
      await expect(mainPage.viewport).toHaveScreenshot('ellipse-blur.png', {
        mask: mainPage.maskViewport(),
      });
    });
  });

  mainTest(qase([351], 'Delete ellipse (From Rightclick)'), async () => {
    await mainTest.step(
      'Verify ellipse is visible and delete via right click',
      async () => {
        await mainPage.isCreatedLayerVisible();
        await mainPage.deleteLayerViaRightClick();
        await mainPage.waitForChangeIsSaved();
      },
    );

    await mainTest.step('Verify ellipse is deleted', async () => {
      await mainPage.isCreatedLayerVisible(false);
    });
  });

  mainTest(qase([2539], 'Delete ellipse (From Keyboard)'), async () => {
    await mainTest.step(
      'Verify ellipse is visible and delete via keyboard',
      async () => {
        await mainPage.isCreatedLayerVisible();
        await mainPage.deleteLayerViaShortcut();
        await mainPage.waitForChangeIsSaved();
      },
    );

    await mainTest.step('Verify ellipse is deleted', async () => {
      await mainPage.isCreatedLayerVisible(false);
    });
  });

  mainTest(qase([353], 'Change rotation (Design page in the right)'), async () => {
    await mainTest.step('Rotate to 90 degrees and verify', async () => {
      await designPanelPage.changeRotationForLayer('90');
      await mainPage.waitForChangeIsUnsaved();
      await mainPage.waitForChangeIsSaved();
      await mainPage.waitForResizeHandlerVisible();
      await expect(mainPage.viewport).toHaveScreenshot('ellipse-rotated-90.png', {
        mask: mainPage.maskViewport(),
      });
    });

    await mainTest.step('Rotate to 120 degrees and verify', async () => {
      await designPanelPage.changeRotationForLayer('120');
      await mainPage.waitForChangeIsUnsaved();
      await mainPage.waitForChangeIsSaved();
      await mainPage.waitForResizeHandlerVisible();
      await expect(mainPage.viewport).toHaveScreenshot('ellipse-rotated-120.png', {
        mask: mainPage.maskViewport(),
      });
    });

    await mainTest.step('Rotate to 45 degrees and verify', async () => {
      await designPanelPage.changeRotationForLayer('45');
      await mainPage.waitForChangeIsUnsaved();
      await mainPage.waitForChangeIsSaved();
      await mainPage.waitForResizeHandlerVisible();
      await expect(mainPage.viewport).toHaveScreenshot('ellipse-rotated-45.png', {
        mask: mainPage.maskViewport(),
      });
    });

    await mainTest.step('Rotate to 360 degrees and verify', async () => {
      await designPanelPage.changeRotationForLayer('360');
      await mainPage.waitForChangeIsUnsaved();
      await mainPage.waitForChangeIsSaved();
      await mainPage.waitForResizeHandlerVisible();
      await expect(mainPage.viewport).toHaveScreenshot('ellipse-rotated-359.png', {
        mask: mainPage.maskViewport(),
      });
    });
  });

  mainTest(qase([369], 'Transform ellipse to Path'), async () => {
    await mainTest.step('Transform ellipse to path via right click', async () => {
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

  mainTest(qase([376], 'Selection to board'), async () => {
    await mainTest.step('Move selection to board via right click', async () => {
      await mainPage.selectionToBoardViaRightClick();
      await mainPage.waitForChangeIsSaved();
    });

    await mainTest.step('Verify ellipse is placed inside board', async () => {
      await expect(mainPage.viewport).toHaveScreenshot('ellipse-to-board.png', {
        mask: mainPage.maskViewport(),
      });
    });
  });
});
