import { mainAccountFileTest } from 'fixtures';
import { expect } from '@playwright/test';
import { ColorPalettePage } from '@pages/workspace/color-palette-page';
import { DesignPanelPage } from '@pages/workspace/design-panel-page';
import { AssetsPanelPage } from '@pages/workspace/assets-panel-page';
import { qase } from 'playwright-qase-reporter/playwright';

let colorPalettePage: ColorPalettePage;
let designPanelPage: DesignPanelPage;
let assetsPanelPage: AssetsPanelPage;

mainAccountFileTest.beforeEach(async ({ page, mainPage }) => {
  colorPalettePage = new ColorPalettePage(page);
  designPanelPage = new DesignPanelPage(page);
  assetsPanelPage = new AssetsPanelPage(page);
  await mainPage.clickMoveButton();
});

mainAccountFileTest(
  qase([816], 'Hide/show rulers via main menu and shortcut CTRL SHIFT R'),
  async ({ mainPage }) => {
    await mainPage.pressHideShowRulersShortcut();
    await expect(mainPage.viewport).toHaveScreenshot('viewport-hidden-rulers.png', {
      mask: mainPage.maskViewport(),
    });
    await mainPage.pressHideShowRulersShortcut();
    await expect(mainPage.viewport).toHaveScreenshot('viewport-default.png', {
      mask: mainPage.maskViewport(),
    });
  },
);

mainAccountFileTest(
  qase([819], 'Hide/show color palette - file library check'),
  async ({ mainPage }) => {
    await assetsPanelPage.clickAssetsTab();
    await assetsPanelPage.clickAddFileLibraryColorButton();
    await colorPalettePage.setHex('#ffff00');
    await colorPalettePage.clickSaveColorStyleButton();
    await mainPage.clickViewportOnce();
    await mainPage.waitForChangeIsSaved();

    await mainPage.clickOnMainThenViewMenuItem();
    await mainPage.clickShowColorPaletteMainMenuSubItem();
    await mainPage.isColorsPaletteDisplayed();
    await colorPalettePage.openColorPaletteMenu();
    await colorPalettePage.selectColorPaletteMenuOption('File library');
    await expect(mainPage.typographiesColorsBottomPanel).toHaveScreenshot(
      'colors-file-library.png',
    );
    await mainPage.clickOnMainThenViewMenuItem();
    await mainPage.clickHideColorPaletteMainMenuSubItem();
    await mainPage.isColorsPaletteNotDisplayed();
  },
);

mainAccountFileTest(qase([820], 'Hide/show board names'), async ({ mainPage }) => {
  await mainPage.clickCreateBoardButton();
  await mainPage.clickViewportTwice();
  await mainPage.waitForChangeIsSaved();
  await mainPage.isCreatedLayerVisible();
  await mainPage.clickOnMainThenViewMenuItem();
  await mainPage.clickHideBoardNamesMainMenuSubItem();
  await expect(mainPage.viewport).toHaveScreenshot('board-hide-name.png', {
    mask: mainPage.maskViewport(),
  });
  await mainPage.clickOnMainThenViewMenuItem();
  await mainPage.clickShowBoardNamesMainMenuSubItem();
  await expect(mainPage.viewport).toHaveScreenshot('board-show-name.png', {
    mask: mainPage.maskViewport(),
  });
});

mainAccountFileTest(
  qase([822], 'Hide/show UI via main menu and shortcut "/"'),
  async ({ mainPage }) => {
    await expect(mainPage.viewport).toHaveScreenshot('canvas-show-ui.png', {
      mask: mainPage.maskViewport(),
    });
    await mainPage.clickOnMainThenViewMenuItem();
    await mainPage.clickShowHideUIMainMenuSubItem();
    await expect(mainPage.viewport).toHaveScreenshot('canvas-hide-ui.png', {
      mask: mainPage.maskViewport(),
    });
    await mainPage.pressHideShowUIShortcut();
    await expect(mainPage.viewport).toHaveScreenshot('canvas-show-ui.png', {
      mask: mainPage.maskViewport(),
    });
  },
);

mainAccountFileTest(
  qase([827], 'Select all via main menu and shortcut CTRL A'),
  async ({ mainPage }) => {
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
  },
);
