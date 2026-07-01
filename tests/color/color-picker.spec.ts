import { mainTest } from 'fixtures';
import { MainPage } from '@pages/workspace/main-page';
import { ColorPalettePage } from '@pages/workspace/color-palette-page';
import { expect } from '@playwright/test';
import { TeamPage } from '@pages/dashboard/team-page';
import { DashboardPage } from '@pages/dashboard/dashboard-page';
import { DesignPanelPage } from '@pages/workspace/design-panel-page';
import { AssetsPanelPage } from '@pages/workspace/assets-panel-page';
import { qase } from 'playwright-qase-reporter/playwright';
import { createTeamName } from 'helpers/teams/create-team-name';

const teamName = createTeamName();

let mainPage: MainPage;
let colorPalettePage: ColorPalettePage;
let teamPage: TeamPage;
let dashboardPage: DashboardPage;
let designPanelPage: DesignPanelPage;
let assetsPanelPage: AssetsPanelPage;

mainTest.beforeEach(async ({ page }) => {
  teamPage = new TeamPage(page);
  assetsPanelPage = new AssetsPanelPage(page);
  designPanelPage = new DesignPanelPage(page);
  colorPalettePage = new ColorPalettePage(page);
  dashboardPage = new DashboardPage(page);
  mainPage = new MainPage(page);
  await teamPage.createTeam(teamName);
  await teamPage.isTeamSelected(teamName);
  await dashboardPage.createFileViaPlaceholder();
  await mainPage.isMainPageLoaded();
  await mainPage.clickMoveButton();
});

mainTest(qase([1029], 'Open color picker from Stroke menu'), async () => {
  await mainTest.step('Create default closed path', async () => {
    await mainPage.createDefaultClosedPath();
  });

  await mainTest.step(
    'Open color picker from stroke menu and verify it is displayed',
    async () => {
      await designPanelPage.clickStrokeColorBullet();
      await colorPalettePage.isColorPalettePopUpOpened();
    },
  );
});

mainTest(qase([1030], 'Open color picker from Fill menu'), async () => {
  await mainTest.step('Create board', async () => {
    await mainPage.clickCreateBoardButton();
    await mainPage.clickViewportTwice();
    await mainPage.waitForChangeIsSaved();
  });

  await mainTest.step(
    'Open color picker from fill menu and verify it is displayed',
    async () => {
      await designPanelPage.clickFillColorIcon();
      await colorPalettePage.isColorPalettePopUpOpened();
    },
  );
});

mainTest(qase([1031], 'Open color picker from Canvas background menu'), async () => {
  await mainTest.step('Open color picker from canvas background menu', async () => {
    await designPanelPage.clickCanvasBackgroundColorIcon();
  });

  await mainTest.step('Verify color picker is displayed', async () => {
    await colorPalettePage.isColorPalettePopUpOpened();
  });
});

mainTest(qase([1045], 'Open Color palette from shortcut'), async () => {
  await mainTest.step('Create board and add recent colors', async () => {
    await mainPage.clickCreateBoardButton();
    await mainPage.clickViewportTwice();
    await mainPage.waitForChangeIsSaved();
    await designPanelPage.clickFillColorIcon();
    await colorPalettePage.setHex('#FF0000');
    await mainPage.clickViewportTwice();
    await mainPage.waitForChangeIsSaved();
    await designPanelPage.clickFillColorIcon();
    await colorPalettePage.setHex('#B1B2B5');
    await mainPage.clickViewportTwice();
    await mainPage.waitForChangeIsSaved();
  });

  await mainTest.step(
    'Open color palette via shortcut and verify it is displayed',
    async () => {
      await mainPage.pressColorsPaletteShortcut();
      await mainPage.isColorsPaletteDisplayed();
      await expect(
        mainPage.typographiesColorsBottomPanel,
        'Colors panel should be visible',
      ).toHaveScreenshot('colors-panel.png');
    },
  );

  await mainTest.step(
    'Close color palette via shortcut and verify it is hidden',
    async () => {
      await mainPage.pressColorsPaletteShortcut();
      await mainPage.isColorsPaletteNotDisplayed();
    },
  );
});

mainTest(
  qase([1046, 1040], 'Open Color palette from toolbar. Type valid color code.'),
  async () => {
    await mainTest.step('Create board and add recent colors', async () => {
      await mainPage.clickCreateBoardButton();
      await mainPage.clickViewportTwice();
      await mainPage.waitForChangeIsSaved();
      await designPanelPage.clickFillColorIcon();
      await colorPalettePage.setHex('#FF0000');
      await mainPage.clickViewportTwice();
      await mainPage.waitForChangeIsSaved();
      await designPanelPage.clickFillColorIcon();
      await colorPalettePage.setHex('#B1B2B5');
      await mainPage.clickViewportTwice();
      await mainPage.waitForChangeIsSaved();
    });

    await mainTest.step(
      'Open color palette from sidebar and verify it is displayed',
      async () => {
        await mainPage.openCloseColorsPaletteFromSidebar();
        await mainPage.isColorsPaletteDisplayed();
        await expect(
          mainPage.typographiesColorsBottomPanel,
          'Colors panel should be visible',
        ).toHaveScreenshot('colors-panel.png');
      },
    );

    await mainTest.step(
      'Close color palette from sidebar and verify it is hidden',
      async () => {
        await mainPage.openCloseColorsPaletteFromSidebar();
        await mainPage.isColorsPaletteNotDisplayed();
      },
    );

    await mainTest.step('Create rectangle', async () => {
      await mainPage.clickCreateRectangleButton();
      await mainPage.clickViewportTwice();
      await mainPage.waitForChangeIsSaved();
    });

    await mainTest.step(
      'Open color picker from fill section and type valid color code #FF0000',
      async () => {
        await designPanelPage.clickFillColorIcon();
        await colorPalettePage.isColorPalettePopUpOpened();
        await colorPalettePage.setHex('#FF0000');
        await mainPage.clickViewportTwice();
        await mainPage.waitForChangeIsSaved();
      },
    );

    await mainTest.step('Verify rectangle fill color changed to red', async () => {
      await designPanelPage.isFillHexCodeSet('#FF0000');
    });
  },
);

mainTest(
  qase([1054], 'Open color picker from add or edit color in assets'),
  async () => {
    await mainTest.step('Open color picker from assets panel', async () => {
      await assetsPanelPage.clickAssetsTab();
      await assetsPanelPage.clickAddFileLibraryColorButton();
    });

    await mainTest.step('Verify color picker is displayed', async () => {
      await colorPalettePage.isColorPalettePopUpOpened();
    });
  },
);

mainTest(
  qase([1996], 'Delete linear gradient stop (from color picker stops list)'),
  async () => {
    await mainTest.step('Create board and open gradient color picker', async () => {
      await mainPage.clickCreateBoardButton();
      await mainPage.clickViewportTwice();
      await mainPage.waitForChangeIsSaved();
      await designPanelPage.clickFillColorIcon();
      await colorPalettePage.isColorPalettePopUpOpened();
      await colorPalettePage.selectColorGradient();
    });

    await mainTest.step('Add gradient stop', async () => {
      await colorPalettePage.colorPaletteAddStop();
      await mainPage.waitForChangeIsSaved();
    });

    await mainTest.step(
      'Remove gradient stop and verify two stops remain',
      async () => {
        await colorPalettePage.colorPaletteRemoveStop(1);
        await colorPalettePage.checkGradientStops(2);
      },
    );
  },
);
