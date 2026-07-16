import { DashboardPage } from '@pages/dashboard/dashboard-page';
import { TeamPage } from '@pages/dashboard/team-page';
import { ColorPalettePage } from '@pages/workspace/color-palette-page';
import { DesignPanelPage } from '@pages/workspace/design-panel-page';
import { MainPage } from '@pages/workspace/main-page';
import { expect } from '@playwright/test';
import { mainTest } from 'fixtures';
import { createTeamName } from 'helpers/teams/create-team-name';
import { qase } from 'playwright-qase-reporter/playwright';

const teamName = createTeamName();

let teamPage: TeamPage;
let mainPage: MainPage;
let colorPalettePage: ColorPalettePage;
let dashboardPage: DashboardPage;
let designPanelPage: DesignPanelPage;

mainTest.beforeEach(async ({ page }) => {
  teamPage = new TeamPage(page);
  dashboardPage = new DashboardPage(page);
  designPanelPage = new DesignPanelPage(page);
  colorPalettePage = new ColorPalettePage(page);
  mainPage = new MainPage(page);
  await teamPage.createTeam(teamName);
  await teamPage.isTeamSelected(teamName);
  await dashboardPage.createFileViaPlaceholder();
  await mainPage.isMainPageLoaded();
});

mainTest.describe(() => {
  mainTest.beforeEach(async () => {
    await mainPage.clickCreateBoardButton();
    await mainPage.clickViewportTwice();
    await mainPage.waitForChangeIsSaved();
    await mainPage.isCreatedLayerVisible();
  });

  mainTest(qase([786], 'Add fill to board'), async () => {
    await mainTest.step('Verify default board fill values', async () => {
      await designPanelPage.isFillHexCodeSet('#FFFFFF');
      await designPanelPage.isFillOpacitySet('100');
    });

    await mainTest.step('Verify board fill screenshot', async () => {
      await expect(mainPage.viewport).toHaveScreenshot('board-fill.png', {
        mask: mainPage.maskViewport(),
      });
    });
  });

  mainTest(qase([791], 'Change fill color for board'), async () => {
    await mainTest.step('Change board fill color', async () => {
      await designPanelPage.clickFillColorIcon();
      await colorPalettePage.modalSetHex('FF0000');
      await mainPage.clickViewportTwice();
      await mainPage.waitForChangeIsSaved();
    });

    await mainTest.step('Verify changed board fill', async () => {
      await designPanelPage.isFillHexCodeSet('#ff0000');
      await designPanelPage.isFillOpacitySet('100');
      await expect(mainPage.viewport).toHaveScreenshot('board-changed-fill.png', {
        mask: mainPage.maskViewport(),
      });
    });
  });

  mainTest(qase([796], 'Change fill opacity for board'), async () => {
    await mainTest.step('Change board fill opacity', async () => {
      await designPanelPage.changeOpacityForFill('70');
      await mainPage.clickViewportTwice();
      await mainPage.waitForChangeIsSaved();
    });

    await mainTest.step('Verify changed board opacity', async () => {
      await designPanelPage.isFillHexCodeSet('#FFFFFF');
      await designPanelPage.isFillOpacitySet('70');
      await expect(mainPage.viewport).toHaveScreenshot('board-changed-opacity.png', {
        mask: mainPage.maskViewport(),
      });
    });
  });

  mainTest(qase([811], 'Remove fill for board'), async () => {
    await mainTest.step('Remove board fill', async () => {
      await designPanelPage.clickRemoveFillButton();
      await mainPage.waitForChangeIsSaved();
    });

    await mainTest.step('Verify removed board fill', async () => {
      await expect(mainPage.viewport).toHaveScreenshot('board-removed-fill.png', {
        mask: mainPage.maskViewport(),
      });
    });
  });
});

mainTest.describe(() => {
  mainTest.beforeEach(async () => {
    await mainPage.createDefaultClosedPath();
    await mainPage.isCreatedLayerVisible();
  });

  mainTest(qase([790], 'Add fill to path'), async () => {
    await mainTest.step('Add fill to path', async () => {
      await designPanelPage.clickAddFillButton();
      await mainPage.waitForChangeIsSaved();
    });

    await mainTest.step('Verify path fill values and screenshot', async () => {
      await designPanelPage.isFillHexCodeSet('#B1B2B5');
      await designPanelPage.isFillOpacitySet('100');
      await mainPage.waitForResizeHandlerVisible();
      await expect(mainPage.viewport).toHaveScreenshot('path-fill.png', {
        mask: mainPage.maskViewport(),
      });
    });
  });

  mainTest(qase([795], 'Change fill color for path'), async () => {
    await mainTest.step('Change path fill color', async () => {
      await designPanelPage.clickAddFillButton();
      await mainPage.waitForChangeIsSaved();
      await designPanelPage.clickFillColorIcon();
      await colorPalettePage.setHex('#FF0000');
      await mainPage.clickOnDesignTab();
      await mainPage.waitForChangeIsSaved();
    });

    await mainTest.step('Verify changed path fill', async () => {
      await designPanelPage.isFillHexCodeSet('#FF0000');
      await designPanelPage.isFillOpacitySet('100');
      await expect(mainPage.viewport).toHaveScreenshot('path-changed-fill.png', {
        mask: mainPage.maskViewport(),
      });
    });
  });

  mainTest(qase([800], 'Change fill opacity for path'), async () => {
    await mainTest.step('Change path fill opacity', async () => {
      await designPanelPage.clickAddFillButton();
      await designPanelPage.changeOpacityForFill('70');
      await mainPage.clickOnDesignTab();
      await mainPage.waitForChangeIsSaved();
    });

    await mainTest.step('Verify changed path opacity', async () => {
      await designPanelPage.isFillHexCodeSet('#B1B2B5');
      await designPanelPage.isFillOpacitySet('70');
      await mainPage.waitForResizeHandlerVisible();
      await expect(mainPage.viewport).toHaveScreenshot('path-changed-opacity.png', {
        mask: mainPage.maskViewport(),
      });
    });
  });

  mainTest(qase([815], 'Remove fill for path'), async () => {
    await mainTest.step('Remove path fill', async () => {
      await designPanelPage.clickAddFillButton();
      await mainPage.waitForChangeIsSaved();
      await designPanelPage.clickRemoveFillButton();
      await mainPage.waitForChangeIsSaved();
      await mainPage.clickOnDesignTab();
    });

    await mainTest.step('Verify removed path fill', async () => {
      await expect(mainPage.viewport).toHaveScreenshot('path-removed-fill.png', {
        mask: mainPage.maskViewport(),
      });
    });
  });
});

mainTest.describe(() => {
  mainTest.beforeEach(async () => {
    await mainPage.clickCreateRectangleButton();
    await mainPage.clickViewportTwice();
    await mainPage.waitForChangeIsSaved();
    await mainPage.isCreatedLayerVisible();
  });

  mainTest(qase([787], 'Add fill to shape'), async () => {
    await mainTest.step('Verify default shape fill values', async () => {
      await designPanelPage.isFillHexCodeSet('#B1B2B5');
      await designPanelPage.isFillOpacitySet('100');
    });

    await mainTest.step('Verify shape fill screenshot', async () => {
      await expect(mainPage.viewport).toHaveScreenshot('rectangle-fill.png', {
        mask: mainPage.maskViewport(),
      });
    });
  });

  mainTest(qase([797], 'Change fill opacity for shape'), async () => {
    await mainTest.step('Change shape fill opacity', async () => {
      await designPanelPage.changeOpacityForFill('70');
      await mainPage.clickViewportTwice();
    });

    await mainTest.step('Verify changed shape opacity', async () => {
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
  });

  mainTest(qase([812], 'Remove fill for shape'), async () => {
    await mainTest.step('Remove shape fill', async () => {
      await designPanelPage.clickRemoveFillButton();
      await mainPage.waitForChangeIsSaved();
    });

    await mainTest.step('Verify removed shape fill', async () => {
      await expect(mainPage.viewport).toHaveScreenshot(
        'rectangle--removed-fill.png',
        {
          mask: mainPage.maskViewport(),
        },
      );
    });
  });

  mainTest(qase([792], 'Change fill color for shape'), async () => {
    await mainTest.step('Change shape fill color', async () => {
      await designPanelPage.clickFillColorIcon();
      await colorPalettePage.setHex('#FF0000');
      await mainPage.clickViewportTwice();
      await mainPage.waitForChangeIsSaved();
    });

    await mainTest.step('Verify changed shape fill', async () => {
      await designPanelPage.isFillHexCodeSet('#FF0000');
      await designPanelPage.isFillOpacitySet('100');
      await expect(mainPage.viewport).toHaveScreenshot(
        'rectangle-changed-fill.png',
        {
          mask: mainPage.maskViewport(),
        },
      );
    });
  });
});
