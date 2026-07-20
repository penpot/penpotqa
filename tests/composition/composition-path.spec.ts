import { mainTest } from 'fixtures';
import { MainPage } from '@pages/workspace/main-page';
import { ColorPalettePage } from '@pages/workspace/color-palette-page';
import { expect } from '@playwright/test';
import { TeamPage } from '@pages/dashboard/team-page';
import { DashboardPage } from '@pages/dashboard/dashboard-page';
import { DesignPanelPage } from '@pages/workspace/design-panel-page';
import { LayersPanelPage } from '@pages/workspace/layers-panel-page';
import { createTeamName } from 'helpers/teams/create-team-name';
import { qase } from 'playwright-qase-reporter/playwright';

const teamName = createTeamName();

let dashboardPage: DashboardPage;
let designPanelPage: DesignPanelPage;
let layersPanelPage: LayersPanelPage;
let mainPage: MainPage;
let teamPage: TeamPage;
let colorPalettePage: ColorPalettePage;

mainTest.beforeEach(async ({ page }) => {
  teamPage = new TeamPage(page);
  dashboardPage = new DashboardPage(page);
  mainPage = new MainPage(page);
  colorPalettePage = new ColorPalettePage(page);
  designPanelPage = new DesignPanelPage(page);
  layersPanelPage = new LayersPanelPage(page);

  await teamPage.createTeam(teamName);
  await teamPage.isTeamSelected(teamName);
  await dashboardPage.createFileViaPlaceholder();
  await mainPage.isMainPageLoaded();
});

mainTest(qase([487], 'Create Path (Toolbar) - closed'), async () => {
  await mainPage.createDefaultClosedPath();
  await mainPage.isCreatedLayerVisible();
  await expect(mainPage.viewport).toHaveScreenshot('path-closed.png', {
    mask: mainPage.maskViewport(),
  });
});

mainTest(qase([489], 'Create Path (Toolbar) - opened'), async () => {
  await mainPage.createDefaultOpenPath();
  await mainPage.isCreatedLayerVisible();
  await expect(mainPage.viewport).toHaveScreenshot('path-opened.png', {
    mask: mainPage.maskViewport(),
  });
});

mainTest(qase([1755], 'Add a cap for path'), async () => {
  await mainPage.createDefaultOpenPath();
  await mainPage.isCreatedLayerVisible();
  await designPanelPage.changeCap('Arrow', 'first');
  await designPanelPage.changeCap('Triangle', 'second');
  await mainPage.waitForChangeIsSaved();
  await mainPage.waitForResizeHandlerVisible();
  await expect(mainPage.viewport).toHaveScreenshot('path-opened-with-cap.png', {
    mask: mainPage.maskViewport(),
  });
});

mainTest(
  qase([501], 'Add edit and remove Stroke Caps to Path (arrow, marker)'),
  async () => {
    await mainTest.step('Create and select Path layer', async () => {
      await mainPage.createDefaultOpenPath();
      await mainPage.waitForChangeIsSaved();
      await layersPanelPage.selectLayerByName('Path');
    });

    await mainTest.step('Add Arrow (first) and Diamond (second) caps', async () => {
      await designPanelPage.changeCap('Arrow', 'first');
      await designPanelPage.changeCap('Diamond', 'second');
      await mainPage.waitForChangeIsSaved();
      await layersPanelPage.selectLayerByName('Path');
      await mainPage.focusLayerViaShortcut();
      await expect(mainPage.viewport).toHaveScreenshot(
        'path-opened-with-arrow-and-diamond.png',
        {
          mask: mainPage.maskViewport(),
        },
      );
      await mainPage.focusLayerViaShortcut();
    });

    await mainTest.step(
      'Switch caps and verify Diamond (first) and Arrow (second)',
      async () => {
        await designPanelPage.clickSwitchCapButton();
        await mainPage.clickViewportOnce();
        await layersPanelPage.selectLayerByName('Path');
        await mainPage.waitForChangeIsSaved();
        await mainPage.focusLayerViaShortcut();
        await expect(mainPage.viewport).toHaveScreenshot(
          'path-opened-with-diamond-and-arrow.png',
          {
            mask: mainPage.maskViewport(),
          },
        );
        await mainPage.focusLayerViaShortcut();
      },
    );

    await mainTest.step('Remove caps and verify None on both', async () => {
      await designPanelPage.changeCap('None', 'first');
      await designPanelPage.changeCap('None', 'second');
      await mainPage.clickViewportOnce();
      await layersPanelPage.selectLayerByName('Path');
      await mainPage.waitForChangeIsSaved();
      await mainPage.focusLayerViaShortcut();
      await expect(mainPage.viewport).toHaveScreenshot('path-opened-with-none.png', {
        mask: mainPage.maskViewport(),
      });
      await mainPage.focusLayerViaShortcut();
    });
  },
);

mainTest.describe(() => {
  mainTest.beforeEach(async () => {
    await mainPage.createDefaultClosedPath();
  });

  mainTest(qase([497], 'Add, hide, unhide and delete Blur to Path'), async () => {
    await designPanelPage.clickAddBlurButton();
    await mainPage.waitForChangeIsSaved();
    await mainPage.waitForResizeHandlerVisible();
    await expect(mainPage.viewport).toHaveScreenshot('path-blur-default.png', {
      mask: mainPage.maskViewport(),
    });
    await designPanelPage.hideBlur();
    await mainPage.waitForChangeIsSaved();
    await mainPage.waitForResizeHandlerVisible();
    await expect(mainPage.viewport).toHaveScreenshot('path-blur-hide.png', {
      mask: mainPage.maskViewport(),
    });
    await designPanelPage.unhideBlur();
    await mainPage.waitForChangeIsSaved();
    await mainPage.waitForResizeHandlerVisible();
    await expect(mainPage.viewport).toHaveScreenshot('path-blur-unhide.png', {
      mask: mainPage.maskViewport(),
    });
    await designPanelPage.removeBlur();
    await mainPage.waitForChangeIsSaved();
    await mainPage.waitForResizeHandlerVisible();
    await expect(mainPage.viewport).toHaveScreenshot('path-blur-remove.png', {
      mask: mainPage.maskViewport(),
    });
  });

  mainTest(qase([498], 'Add and edit Blur to Path'), async () => {
    await designPanelPage.clickAddBlurButton();
    await designPanelPage.changeValueForBlur('55');
    await mainPage.waitForChangeIsSaved();
    await mainPage.isCornerHandleVisible();
    await expect(mainPage.viewport).toHaveScreenshot('path-blur.png', {
      mask: mainPage.maskViewport(),
    });
  });

  mainTest(qase([512], 'Change rotation (Design page in the right)'), async () => {
    await designPanelPage.changeRotationForLayer('90');
    await mainPage.waitForChangeIsSaved();
    await mainPage.isCornerHandleVisible();
    await expect(mainPage.viewport).toHaveScreenshot('path-rotated-90.png', {
      mask: mainPage.maskViewport(),
    });
    await designPanelPage.changeRotationForLayer('120');
    await mainPage.waitForChangeIsSaved();
    await mainPage.isCornerHandleVisible();
    await expect(mainPage.viewport).toHaveScreenshot('path-rotated-120.png', {
      mask: mainPage.maskViewport(),
    });
    await designPanelPage.changeRotationForLayer('45');
    await mainPage.waitForChangeIsSaved();
    await mainPage.isCornerHandleVisible();
    await expect(mainPage.viewport).toHaveScreenshot('path-rotated-45.png', {
      mask: mainPage.maskViewport(),
    });
    await designPanelPage.changeRotationForLayer('360');
    await mainPage.waitForChangeIsSaved();
    await mainPage.isCornerHandleVisible();
    await expect(mainPage.viewport).toHaveScreenshot('path-rotated-359.png', {
      mask: mainPage.maskViewport(),
    });
  });

  mainTest(qase([513], 'Delete Path (From right click)'), async () => {
    await mainPage.isCreatedLayerVisible();
    await mainPage.deleteLayerViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await mainPage.isCreatedLayerVisible(false);
  });

  mainTest(qase([2543], 'Delete Path (From Keyboard)'), async () => {
    await mainPage.isCreatedLayerVisible();
    await mainPage.deleteLayerViaShortcut();
    await mainPage.waitForChangeIsSaved();
    await mainPage.isCreatedLayerVisible(false);
  });

  mainTest(
    qase([518], 'Hide and show path (From right click and icons)'),
    async ({ page }) => {
      const path1 = 'Path #1';
      const path2 = 'Path #2';
      await layersPanelPage.doubleClickLayerOnLayersTab('Path');
      await layersPanelPage.typeNameCreatedLayerAndEnter(path1);
      await mainPage.waitForChangeIsSaved();
      await mainPage.clickCreatePathButton();
      await mainPage.clickViewportByCoordinates(200, 300);
      await mainPage.clickViewportByCoordinates(300, 500);
      await mainPage.clickViewportByCoordinates(100, 200);
      await mainPage.clickViewportByCoordinates(200, 300);
      await mainPage.clickOnDesignTab();
      await mainPage.waitForChangeIsSaved();
      await layersPanelPage.doubleClickLayerOnLayersTab('Path');
      await layersPanelPage.typeNameCreatedLayerAndEnter(path2);
      await mainPage.clickViewportOnce();
      await layersPanelPage.hideUnhideLayerByIconOnLayersTab(path1);
      await mainPage.waitForChangeIsUnsaved();
      await mainPage.waitForChangeIsSaved();
      await expect(mainPage.viewport).toHaveScreenshot('path-first-hide.png', {
        mask: mainPage.maskViewport(),
      });
      await mainPage.clickViewportOnce();
      await layersPanelPage.hideLayerViaRightClickOnLayersTab(path2);
      await mainPage.waitForChangeIsUnsaved();
      await mainPage.waitForChangeIsSaved();
      await expect(mainPage.viewport).toHaveScreenshot('path-second-hide.png', {
        mask: mainPage.maskViewport(),
      });
      await layersPanelPage.hideUnhideLayerByIconOnLayersTab(path2, false);
      await mainPage.waitForChangeIsUnsaved();
      await mainPage.waitForChangeIsSaved();
      await expect(mainPage.viewport).toHaveScreenshot('path-second-show.png', {
        mask: mainPage.maskViewport(),
      });
      await layersPanelPage.unHideLayerViaRightClickOnLayersTab(path1);
      await mainPage.waitForChangeIsUnsaved();
      await mainPage.waitForChangeIsSaved();
      await expect(mainPage.viewport).toHaveScreenshot('path-first-show.png', {
        mask: mainPage.maskViewport(),
      });
    },
  );

  mainTest(
    qase(
      [525],
      'Flip Vertical and Flip Horizontal path (From right click and Shortcut Shift +V Shift + H)',
    ),
    async () => {
      await mainPage.flipVerticalViaRightClick();
      await mainPage.waitForChangeIsSaved();
      await expect(mainPage.viewport).toHaveScreenshot('path-flipped-vertical.png', {
        mask: mainPage.maskViewport(),
      });
      await mainPage.flipHorizontalViaRightClick();
      await mainPage.waitForChangeIsSaved();
      await expect(mainPage.viewport).toHaveScreenshot(
        'path-flipped-vertical-horizontal.png',
        {
          mask: mainPage.maskViewport(),
        },
      );
      await mainPage.flipVerticalViaShortcut();
      await mainPage.waitForChangeIsSaved();
      await expect(mainPage.viewport).toHaveScreenshot(
        'path-flipped-horizontal.png',
        {
          mask: mainPage.maskViewport(),
        },
      );
      await mainPage.flipHorizontalViaShortcut();
      await mainPage.waitForChangeIsSaved();
      await expect(mainPage.viewport).toHaveScreenshot('path-non-flipped-jpeg.png', {
        mask: mainPage.maskViewport(),
      });
    },
  );

  mainTest(qase([537], 'Selection to board'), async () => {
    await mainPage.selectionToBoardViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot('path-to-board.png', {
      mask: mainPage.maskViewport(),
    });
  });
});

mainTest.describe(() => {
  mainTest.beforeEach(async () => {
    await mainPage.createDefaultOpenPath();
  });
});
