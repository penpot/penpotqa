import { mainTest } from 'fixtures';
import { MainPage } from '@pages/workspace/main-page';
import { expect } from '@playwright/test';
import { ColorPalettePage } from '@pages/workspace/color-palette-page';
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
  dashboardPage = new DashboardPage(page);
  colorPalettePage = new ColorPalettePage(page);
  designPanelPage = new DesignPanelPage(page);
  assetsPanelPage = new AssetsPanelPage(page);
  mainPage = new MainPage(page);
  await teamPage.createTeam(teamName);
  await teamPage.isTeamSelected(teamName);
  await dashboardPage.createFileViaPlaceholder();
  await mainPage.isMainPageLoaded();
  await mainPage.clickMoveButton();
});

mainTest.afterEach(async () => {
  await mainPage.backToDashboardFromFileEditor();
  await teamPage.deleteTeam(teamName);
});

mainTest(qase(817, "Hide/show grids via shortcut CTRL '"), async () => {
  await mainPage.clickCreateBoardButton();
  await mainPage.clickViewportTwice();
  await mainPage.waitForChangeIsSaved();
  await mainPage.isCreatedLayerVisible();

  await designPanelPage.clickAddGridButton();
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot('square-grid-default.png', {
    mask: mainPage.maskViewport(),
  });
  await mainPage.pressHideShowGridsShortcut();
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot('square-grid-hide.png', {
    mask: mainPage.maskViewport(),
  });
  await mainPage.pressHideShowGridsShortcut();
  await mainPage.waitForChangeIsSaved();
  await expect(mainPage.viewport).toHaveScreenshot('square-grid-default.png', {
    mask: mainPage.maskViewport(),
  });
});

mainTest(qase(816, 'Hide/show rulers via main menu'), async () => {
  await mainPage.clickMainMenuButton();
  await mainPage.clickViewMainMenuItem();
  await mainPage.clickHideRulersMainMenuSubItem();
  await mainPage.clickViewportOnce();
  await expect(mainPage.viewport).toHaveScreenshot('viewport-hidden-rulers.png', {
    mask: mainPage.maskViewport(),
  });
  await mainPage.clickMainMenuButton();
  await mainPage.clickViewMainMenuItem();
  await mainPage.clickShowRulersMainMenuSubItem();
  await mainPage.clickViewportOnce();
  await expect(mainPage.viewport).toHaveScreenshot('viewport-default.png', {
    mask: mainPage.maskViewport(),
  });
});

mainTest(qase(816, 'Hide/show rulers via shortcut CTRL SHIFT R'), async () => {
  await mainPage.clickViewportTwice();
  await mainPage.pressHideShowRulersShortcut();
  await expect(mainPage.viewport).toHaveScreenshot('viewport-hidden-rulers.png', {
    mask: mainPage.maskViewport(),
  });
  await mainPage.pressHideShowRulersShortcut();
  await expect(mainPage.viewport).toHaveScreenshot('viewport-default.png', {
    mask: mainPage.maskViewport(),
  });
});

mainTest(qase(819, 'Hide/show color palette - file library check'), async () => {
  await assetsPanelPage.clickAssetsTab();
  await assetsPanelPage.clickAddFileLibraryColorButton();
  await colorPalettePage.setHex('#ffff00');
  await colorPalettePage.clickSaveColorStyleButton();
  await mainPage.clickViewportOnce();
  await mainPage.waitForChangeIsSaved();

  await mainPage.clickMainMenuButton();
  await mainPage.clickViewMainMenuItem();
  await mainPage.clickShowColorPaletteMainMenuSubItem();
  await mainPage.isColorsPaletteDisplayed();
  await colorPalettePage.openColorPaletteMenu();
  await colorPalettePage.selectColorPaletteMenuOption('File library');
  await expect(mainPage.typographiesColorsBottomPanel).toHaveScreenshot(
    'colors-file-library.png',
  );
  await mainPage.clickMainMenuButton();
  await mainPage.clickViewMainMenuItem();
  await mainPage.clickHideColorPaletteMainMenuSubItem();
  await mainPage.isColorsPaletteNotDisplayed();
});

mainTest(qase(820, 'Hide/show board names'), async () => {
  await mainPage.clickCreateBoardButton();
  await mainPage.clickViewportTwice();
  await mainPage.waitForChangeIsSaved();
  await mainPage.isCreatedLayerVisible();
  await mainPage.clickMainMenuButton();
  await mainPage.clickViewMainMenuItem();
  await mainPage.clickHideBoardNamesMainMenuSubItem();
  await expect(mainPage.viewport).toHaveScreenshot('board-hide-name.png', {
    mask: mainPage.maskViewport(),
  });
  await mainPage.clickMainMenuButton();
  await mainPage.clickViewMainMenuItem();
  await mainPage.clickShowBoardNamesMainMenuSubItem();
  await expect(mainPage.viewport).toHaveScreenshot('board-show-name.png', {
    mask: mainPage.maskViewport(),
  });
});

mainTest(qase(821, 'Hide/show pixel grid via main menu'), async () => {
  await mainPage.clickViewportTwice();
  await mainPage.increaseZoom(10);
  await expect(mainPage.viewport).toHaveScreenshot('canvas-show-pixel-grid.png', {
    mask: mainPage.maskViewport(),
  });
  await mainPage.clickMainMenuButton();
  await mainPage.clickViewMainMenuItem();
  await mainPage.clickHidePixelGridMainMenuSubItem();
  await expect(mainPage.viewport).toHaveScreenshot('canvas-hide-pixel-grid.png', {
    mask: mainPage.maskViewport(),
  });
  await mainPage.clickMainMenuButton();
  await mainPage.clickViewMainMenuItem();
  await mainPage.clickShowPixelGridMainMenuSubItem();
  await expect(mainPage.viewport).toHaveScreenshot('canvas-show-pixel-grid.png', {
    mask: mainPage.maskViewport(),
  });
});

mainTest(qase(821, 'Hide/show pixel grid via shortcut SHIFT ,'), async () => {
  await mainPage.clickViewportTwice();
  await mainPage.increaseZoom(10);
  await expect(mainPage.viewport).toHaveScreenshot('canvas-show-pixel-grid.png', {
    mask: mainPage.maskViewport(),
  });
  await mainPage.pressHideShowPixelGridShortcut();
  await expect(mainPage.viewport).toHaveScreenshot('canvas-hide-pixel-grid.png', {
    mask: mainPage.maskViewport(),
  });
  await mainPage.pressHideShowPixelGridShortcut();
  await expect(mainPage.viewport).toHaveScreenshot('canvas-show-pixel-grid.png', {
    mask: mainPage.maskViewport(),
  });
});

mainTest(qase(822, 'Hide/show UI via main menu and shortcut "/"'), async () => {
  await expect(mainPage.viewport).toHaveScreenshot('canvas-show-ui.png', {
    mask: mainPage.maskViewport(),
  });
  await mainPage.clickMainMenuButton();
  await mainPage.clickViewMainMenuItem();
  await mainPage.clickShowHideUIMainMenuSubItem();
  await expect(mainPage.viewport).toHaveScreenshot('canvas-hide-ui.png', {
    mask: mainPage.maskViewport(),
  });
  await mainPage.pressHideShowUIShortcut();
  await expect(mainPage.viewport).toHaveScreenshot('canvas-show-ui.png', {
    mask: mainPage.maskViewport(),
  });
});

mainTest(qase(827, 'Select all via main menu and shortcut CTRL A'), async () => {
  await mainPage.createDefaultRectangleByCoordinates(250, 350);
  await mainPage.createDefaultEllipseByCoordinates(100, 600);
  await mainPage.clickViewportTwice();
  await expect(mainPage.viewport).toHaveScreenshot('layers-all-unselected.png', {
    mask: mainPage.maskViewport(),
  });
  await mainPage.clickMainMenuButton();
  await mainPage.clickEditMainMenuItem();
  await mainPage.clickSelectAllMainMenuSubItem();
  await expect(mainPage.viewport).toHaveScreenshot('layers-all-selected.png', {
    mask: mainPage.maskViewport(),
  });
  await mainPage.clickViewportTwice();
  await expect(mainPage.viewport).toHaveScreenshot('layers-all-unselected.png', {
    mask: mainPage.maskViewport(),
  });
  await mainPage.pressSelectAllShortcut();
  await expect(mainPage.viewport).toHaveScreenshot('layers-all-selected.png', {
    mask: mainPage.maskViewport(),
  });
});
