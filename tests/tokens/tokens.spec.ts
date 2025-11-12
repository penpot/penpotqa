import { mainTest } from '../../fixtures';
import { expect } from '@playwright/test';
import { MainPage } from '../../pages/workspace/main-page';
import { random } from '../../helpers/string-generator';
import { TeamPage } from '../../pages/dashboard/team-page';
import { DashboardPage } from '../../pages/dashboard/dashboard-page';
import { qase } from 'playwright-qase-reporter/playwright';
import { DesignPanelPage } from '../../pages/workspace/design-panel-page';
import { LayersPanelPage } from '../../pages/workspace/layers-panel-page';
import { ColorPalettePage } from '../../pages/workspace/color-palette-page';
import { AssetsPanelPage } from '../../pages/workspace/assets-panel-page';
import { TokensPage } from '@pages/workspace/tokens/tokens-page';
import { SampleData } from '../../helpers/sample-data';

const teamName = random().concat('autotest');
const sampleData = new SampleData();

mainTest.beforeEach(async ({ page, browserName }) => {
  let teamPage: TeamPage = new TeamPage(page);
  let dashboardPage: DashboardPage = new DashboardPage(page);
  let mainPage: MainPage = new MainPage(page);
  await teamPage.createTeam(teamName);
  await teamPage.isTeamSelected(teamName);
  await dashboardPage.createFileViaPlaceholder();
  browserName === 'webkit' && !(await mainPage.isMainPageVisible())
    ? await dashboardPage.createFileViaPlaceholder()
    : null;
  await mainPage.isMainPageLoaded();
  await mainPage.clickMoveButton();
});

mainTest.afterEach(async ({ page }) => {
  const teamPage: TeamPage = new TeamPage(page);
  const mainPage: MainPage = new MainPage(page);
  await mainPage.backToDashboardFromFileEditor();
  await teamPage.deleteTeam(teamName);
});

mainTest.describe(() => {
  let tokensPage: TokensPage;
  let mainPage: MainPage;
  let designPanelPage: DesignPanelPage;

  const tokenName = 'global.radius';
  const tokenValue = '-1';
  const newTokenValue = '20';
  const tokenDescription = 'Description';

  mainTest.beforeEach(async ({ page }) => {
    tokensPage = new TokensPage(page);
    mainPage = new MainPage(page);
    designPanelPage = new DesignPanelPage(page);

    await mainPage.createDefaultRectangleByCoordinates(320, 210);
    await tokensPage.clickTokensTab();
    await tokensPage.tokensComp.createRadiusToken(tokenName, tokenValue);
    await tokensPage.tokensComp.isTokenVisibleWithName(tokenName);
    await tokensPage.tokensComp.clickOnTokenWithName(tokenName);
    await mainPage.waitForChangeIsSaved();
  });

  mainTest(
    qase(2125, 'Apply default "all radius" token to a rectangle (by left click)'),
    async ({ page }) => {
      tokensPage = new TokensPage(page);

      await tokensPage.tokensComp.isTokenAppliedWithName(tokenName);
      await designPanelPage.checkGeneralCornerRadius(tokenValue);
      await expect(mainPage.createdLayer).toHaveScreenshot(
        'rectangle-border-radius-1.png',
      );
      await tokensPage.tokensComp.isMenuItemWithNameSelected(tokenName, 'RadiusAll');
    },
  );

  mainTest(
    qase(
      2166,
      'Edit a border radius token, already applied to a shape (with warning renaming message)',
    ),
    async ({ page }) => {
      tokensPage = new TokensPage(page);

      await tokensPage.tokensComp.isTokenAppliedWithName(tokenName);
      await tokensPage.tokensComp.editToken(
        tokenName,
        newTokenValue,
        tokenDescription,
      );
      await mainPage.waitForChangeIsSaved();
      await designPanelPage.checkGeneralCornerRadius(newTokenValue);
      await tokensPage.tokensComp.isTokenAppliedWithName(tokenName);
      await expect(mainPage.createdLayer).toHaveScreenshot(
        'rectangle-border-radius-20.png',
      );
      await tokensPage.tokensComp.checkAppliedTokenTitle(
        'Token: global.radius\n' + 'Original value: 20\n' + 'Resolved value: 20',
      );
    },
  );

  mainTest(
    qase(2136, 'Delete a token and redo deletion'),
    async ({ page, browserName }) => {
      tokensPage = new TokensPage(page);
      await tokensPage.tokensComp.isTokenAppliedWithName(tokenName);
      await tokensPage.tokensComp.deleteToken(tokenName);
      await tokensPage.tokensComp.isTokenVisibleWithName(tokenName, false);
      await mainPage.clickShortcutCtrlZ(browserName);
      await tokensPage.tokensComp.isTokenVisibleWithName(tokenName, true);
    },
  );
});

mainTest.describe(() => {
  let mainPage: MainPage;
  let tokensPage: TokensPage;
  let designPanelPage: DesignPanelPage;

  const tokenName = 'global.color';
  const tokenValue = sampleData.color.redHexCode;

  mainTest.beforeEach(async ({ page }) => {
    mainPage = new MainPage(page);
    tokensPage = new TokensPage(page);
    designPanelPage = new DesignPanelPage(page);

    await mainPage.createDefaultBoardByCoordinates(320, 210);
    await tokensPage.clickTokensTab();
    await tokensPage.tokensComp.createColorToken(tokenName, tokenValue);
    await tokensPage.tokensComp.isTokenVisibleWithName(tokenName);
  });

  mainTest(
    qase(2142, 'Apply default "color fill" token to a board (by left click)'),
    async () => {
      await tokensPage.tokensComp.clickOnTokenWithName(tokenName);
      await mainPage.waitForChangeIsSaved();
      await tokensPage.tokensComp.isTokenAppliedWithName(tokenName);
      await designPanelPage.isFillHexCodeSetComponent(tokenValue.slice(1));
      await expect(mainPage.createdLayer).toHaveScreenshot('board-color-red.png');
      await tokensPage.tokensComp.isMenuItemWithNameSelected(tokenName, 'ColorFill');
    },
  );

  mainTest(
    qase(2147, 'Apply "color stroke" token to a board (by right click)'),
    async () => {
      await designPanelPage.clickAddStrokeButton();
      await designPanelPage.setStrokeWidth('10');
      await tokensPage.tokensComp.selectMenuItem(tokenName, 'Stroke');
      await mainPage.waitForChangeIsSaved();
      await mainPage.waitForResizeHandlerVisible();
      await tokensPage.tokensComp.isTokenAppliedWithName(tokenName);
      await expect(mainPage.createdLayer).toHaveScreenshot('board-red-stroke.png');
      await tokensPage.tokensComp.isMenuItemWithNameSelected(tokenName, 'Stroke');
    },
  );
});

mainTest(
  qase(2172, 'Apply default "opacity" token to an image (by left click)'),
  async ({ page }) => {
    const mainPage: MainPage = new MainPage(page);
    const tokensPage: TokensPage = new TokensPage(page);

    const tokenName = 'global.opacity';
    const tokenValue = '0.7';

    await mainPage.uploadImage('images/sample.jpeg');
    await tokensPage.clickTokensTab();
    await tokensPage.tokensComp.createOpacityToken(tokenName, tokenValue);
    await tokensPage.tokensComp.isTokenVisibleWithName(tokenName);
    await tokensPage.tokensComp.clickOnTokenWithName(tokenName);
    await mainPage.waitForChangeIsSaved();
    await tokensPage.tokensComp.isTokenAppliedWithName(tokenName);
    await expect(mainPage.createdLayer).toHaveScreenshot('image-opacity-0-7.png');
    await tokensPage.tokensComp.isMenuItemWithNameSelected(tokenName, 'Opacity');
  },
);

mainTest(
  qase(2175, 'Apply default "rotation" token to a text (by left click)'),
  async ({ page, browserName }) => {
    const mainPage: MainPage = new MainPage(page);
    const tokensPage: TokensPage = new TokensPage(page);
    const designPanelPage: DesignPanelPage = new DesignPanelPage(page);

    const tokenName = 'global.rotation';
    const tokenValue = '-(22.5+22.5)';
    const tokenResolvedValue = '315'; // 315 == -45 == -(22.5+22.5)

    await mainPage.createDefaultTextLayerByCoordinates(320, 210, browserName);
    await tokensPage.clickTokensTab();
    await tokensPage.tokensComp.createRotationToken(tokenName, tokenValue);
    await tokensPage.tokensComp.isTokenVisibleWithName(tokenName);
    await tokensPage.tokensComp.clickOnTokenWithName(tokenName);
    await tokensPage.tokensComp.isTokenAppliedWithName(tokenName);
    await designPanelPage.checkRotationForLayer(tokenResolvedValue);
    browserName === 'chromium' ? await mainPage.waitForChangeIsUnsaved() : null;
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.createdLayer).toHaveScreenshot('text-rotated-315.png');
    await tokensPage.tokensComp.isMenuItemWithNameSelected(tokenName, 'Rotation');
  },
);

mainTest(
  qase(2200, 'Apply "max/min size" token to an image (by right click)'),
  async ({ page }) => {
    const mainPage: MainPage = new MainPage(page);
    const tokensPage: TokensPage = new TokensPage(page);
    const designPanelPage: DesignPanelPage = new DesignPanelPage(page);
    const layersPanelPage: LayersPanelPage = new LayersPanelPage(page);

    const tokenName = 'global.sizing';
    const tokenValue = '200';

    await mainPage.uploadImage('images/mini_sample.jpg');
    await tokensPage.clickTokensTab();
    await tokensPage.tokensComp.createSizingToken(tokenName, tokenValue);
    await tokensPage.tokensComp.isTokenVisibleWithName(tokenName);
    await tokensPage.tokensComp.selectMenuItem(tokenName, 'Max Width');
    await tokensPage.tokensComp.selectMenuItem(tokenName, 'Min Height');
    await mainPage.waitForChangeIsSaved();
    await tokensPage.tokensComp.isTokenAppliedWithName(tokenName);
    await expect(mainPage.createdLayer).toHaveScreenshot(
      'image-max-min-size-200.png',
    );
    await mainPage.createDefaultBoardByCoordinates(100, 200, true);
    await designPanelPage.changeHeightAndWidthForLayer('600', '600');
    await mainPage.addFlexLayoutViaRightClick();
    await layersPanelPage.openLayersTab();
    await layersPanelPage.dragAndDropElementToElement('mini_sample', 'Board');
    await mainPage.clickViewportOnce();
    await layersPanelPage.selectLayerByName('mini_sample');
    await designPanelPage.clickOnFlexElementWidth100Btn();
    await designPanelPage.clickOnFlexElementHeight100Btn();
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.createdLayer).toHaveScreenshot(
      'image-on-board-max-min-size-200.png',
    );
    await designPanelPage.checkFlexElementMinMax('Width', false, tokenValue);
    await designPanelPage.checkFlexElementMinMax('Height', true, tokenValue);
    await tokensPage.clickTokensTab();
    await tokensPage.tokensComp.isMenuItemWithNameSelected(tokenName, 'Max Width');
    await tokensPage.tokensComp.isMenuItemWithNameSelected(tokenName, 'Min Height');
  },
);

mainTest(
  qase(2202, 'Apply default "all gaps" token to a grid board (by left click)'),
  async ({ page }) => {
    const mainPage: MainPage = new MainPage(page);
    const tokensPage: TokensPage = new TokensPage(page);
    const designPanelPage: DesignPanelPage = new DesignPanelPage(page);

    const tokenName = 'global.spacing';
    const tokenValue = '-20';

    await mainPage.createDefaultBoardByCoordinates(320, 210);
    await mainPage.addGridLayoutViaRightClick();
    await designPanelPage.isLayoutRemoveButtonExists();
    await mainPage.clickViewportOnce();
    await mainPage.clickCreatedBoardTitleOnCanvas();
    await tokensPage.clickTokensTab();
    await tokensPage.tokensComp.createSpacingToken(tokenName, tokenValue);
    await tokensPage.tokensComp.isTokenVisibleWithName(tokenName);
    await tokensPage.tokensComp.clickOnTokenWithName(tokenName);
    await mainPage.waitForChangeIsSaved();
    await tokensPage.tokensComp.isTokenAppliedWithName(tokenName);
    await designPanelPage.checkRowGap(tokenValue);
    await designPanelPage.checkColumnGap(tokenValue);
    await expect(mainPage.createdLayer).toHaveScreenshot('board-spacing-20.png');
    await tokensPage.tokensComp.isAllMenuItemWithSectionNameSelected(
      tokenName,
      'Gaps',
    );
  },
);

mainTest(
  qase(2215, 'Apply default "stroke width" token to a path (by left click)'),
  async ({ page }) => {
    const mainPage: MainPage = new MainPage(page);
    const tokensPage: TokensPage = new TokensPage(page);
    const designPanelPage: DesignPanelPage = new DesignPanelPage(page);

    const tokenName = 'global.stroke';
    const tokenValue = '5.5';

    await mainPage.createDefaultOpenPath();
    await tokensPage.clickTokensTab();
    await tokensPage.tokensComp.createStrokeWidthToken(tokenName, tokenValue);
    await tokensPage.tokensComp.isTokenVisibleWithName(tokenName);
    await tokensPage.tokensComp.clickOnTokenWithName(tokenName);
    await mainPage.waitForChangeIsSaved();
    await tokensPage.tokensComp.isTokenAppliedWithName(tokenName);
    await designPanelPage.checkStrokeWidth(tokenValue);
    await expect(mainPage.createdLayer).toHaveScreenshot(
      'path-stroke-width-5-5.png',
    );
    await tokensPage.tokensComp.isMenuItemWithNameSelected(
      tokenName,
      'Stroke Width',
    );
  },
);

mainTest(
  qase(2218, 'Apply "X/Y axis" dimension token to a text (by right click)'),
  async ({ page, browserName }) => {
    const mainPage: MainPage = new MainPage(page);
    const tokensPage: TokensPage = new TokensPage(page);
    const designPanelPage: DesignPanelPage = new DesignPanelPage(page);

    const tokenName = 'global.dimension';
    const tokenValue = '550.5';

    const defaultX = '100';
    const defaultY = '200';

    await mainPage.createDefaultTextLayerByCoordinates(100, 200, browserName);
    await tokensPage.clickTokensTab();
    await tokensPage.tokensComp.createDimensionToken(tokenName, tokenValue);
    await tokensPage.tokensComp.isTokenVisibleWithName(tokenName);
    await designPanelPage.checkXAxis(defaultX);
    await designPanelPage.checkYAxis(defaultY);
    await tokensPage.tokensComp.selectMenuItem(tokenName, 'AxisX');
    await tokensPage.tokensComp.isTokenAppliedWithName(tokenName);
    await designPanelPage.checkXAxis(tokenValue);
    await designPanelPage.checkYAxis(defaultY);
    await tokensPage.tokensComp.selectMenuItem(tokenName, 'Y');
    await tokensPage.tokensComp.isTokenAppliedWithName(tokenName);
    await designPanelPage.checkXAxis(tokenValue);
    await designPanelPage.checkYAxis(tokenValue);
    await tokensPage.tokensComp.isMenuItemWithNameSelected(tokenName, 'AxisX');
    await tokensPage.tokensComp.isMenuItemWithNameSelected(tokenName, 'Y');
  },
);

mainTest(
  qase(2224, 'Apply 2 different kind of tokens overriding the same shape property'),
  async ({ page }) => {
    const mainPage: MainPage = new MainPage(page);
    const tokensPage: TokensPage = new TokensPage(page);
    const designPanelPage: DesignPanelPage = new DesignPanelPage(page);

    const dimensionTokenName = 'global.dimension';
    const sizingTokenName = 'global.sizing';

    await mainPage.createDefaultEllipseByCoordinates(100, 200);
    await tokensPage.clickTokensTab();
    await tokensPage.tokensComp.createDimensionToken();
    await tokensPage.tokensComp.isTokenVisibleWithName(dimensionTokenName);
    await tokensPage.tokensComp.createSizingToken();
    await tokensPage.tokensComp.isTokenVisibleWithName(sizingTokenName);

    await tokensPage.tokensComp.clickOnTokenWithName(sizingTokenName);
    await designPanelPage.checkSizeWidth('200');
    await designPanelPage.checkSizeHeight('200');
    await tokensPage.tokensComp.isTokenAppliedWithName(sizingTokenName);
    await tokensPage.tokensComp.isTokenAppliedWithName(dimensionTokenName, false);
    await tokensPage.tokensComp.isMenuItemWithNameSelected(
      sizingTokenName,
      'SizeAll',
    );
    await mainPage.clickBoardOnCanvas();

    await tokensPage.tokensComp.clickOnTokenWithName(dimensionTokenName);
    await designPanelPage.checkSizeWidth('100');
    await designPanelPage.checkSizeHeight('100');
    await tokensPage.tokensComp.isTokenAppliedWithName(dimensionTokenName);
    await tokensPage.tokensComp.isTokenAppliedWithName(sizingTokenName, false);
    await tokensPage.tokensComp.isAllSubMenuItemWithSectionNameSelected(
      dimensionTokenName,
      'Sizing',
      'Size',
    );
    await mainPage.clickBoardOnCanvas();

    await tokensPage.tokensComp.selectMenuItem(sizingTokenName, 'Height');
    await tokensPage.tokensComp.isTokenAppliedWithName(dimensionTokenName);
    await tokensPage.tokensComp.isTokenAppliedWithName(sizingTokenName);
    await designPanelPage.checkSizeWidth('100');
    await designPanelPage.checkSizeHeight('200');
    await tokensPage.tokensComp.isMenuItemWithNameSelected(
      sizingTokenName,
      'Height',
    );
    await mainPage.clickBoardOnCanvas();
    await tokensPage.tokensComp.isSubMenuItemWithNameSelected(
      dimensionTokenName,
      'Sizing',
      'Width',
    );
    await mainPage.clickBoardOnCanvas();
  },
);

mainTest.describe(() => {
  let mainPage: MainPage;
  let tokensPage: TokensPage;
  let designPanelPage: DesignPanelPage;

  const tokenName = 'global.font';
  const tokenValue = '60';
  const newTokenValue = '120';
  const tokenDescription = '120';

  mainTest.beforeEach(async ({ page, browserName }) => {
    mainPage = new MainPage(page);
    tokensPage = new TokensPage(page);
    designPanelPage = new DesignPanelPage(page);

    await mainPage.createDefaultTextLayerByCoordinates(100, 200, browserName);
    await tokensPage.clickTokensTab();
    await tokensPage.tokensComp.createFontSizeToken(tokenName, tokenValue);
    await tokensPage.tokensComp.isTokenVisibleWithName(tokenName);
  });

  mainTest(qase(2358, 'Create a font size token'), async () => {
    await tokensPage.tokensComp.isTokenVisibleWithName(tokenName);
  });

  mainTest(qase(2359, 'Apply a font size token'), async () => {
    await tokensPage.tokensComp.clickOnTokenWithName(tokenName);
    await mainPage.waitForChangeIsSaved();
    await tokensPage.tokensComp.isTokenAppliedWithName(tokenName);
    await mainPage.waitForResizeHandlerVisible();
    await expect(mainPage.createdLayer).toHaveScreenshot('text-font-size-60.png');
  });

  mainTest(qase(2360, 'Detachment font size token'), async ({ browserName }) => {
    await tokensPage.tokensComp.clickOnTokenWithName(tokenName);
    await mainPage.waitForChangeIsSaved();
    await tokensPage.tokensComp.isTokenAppliedWithName(tokenName);
    await mainPage.createDefaultTextLayerByCoordinates(100, 600, browserName);
    await mainPage.waitForChangeIsSaved();
    await tokensPage.tokensComp.clickOnTokenWithName(tokenName);
    await mainPage.waitForChangeIsSaved();
    await tokensPage.tokensComp.isTokenAppliedWithName(tokenName);
    await mainPage.clickViewportByCoordinates(120, 220);
    await tokensPage.tokensComp.clickOnTokenWithName(tokenName);
    await mainPage.waitForChangeIsSaved();
    await tokensPage.tokensComp.isTokenAppliedWithName(tokenName, false);
    await tokensPage.tokensComp.editToken(
      tokenName,
      newTokenValue,
      tokenDescription,
    );
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot('texts-size-60-120.png', {
      mask: [mainPage.guides, mainPage.guidesFragment, mainPage.toolBarWindow],
    });
  });
});

mainTest(
  qase(
    2363,
    'Propagation of (style) changes from a (contained) text component to copies (overriding style by using tokens)',
  ),
  async ({ page, browserName }) => {
    const mainPage: MainPage = new MainPage(page);
    const tokensPage: TokensPage = new TokensPage(page);
    const designPanelPage: DesignPanelPage = new DesignPanelPage(page);
    const layersPanelPage: LayersPanelPage = new LayersPanelPage(page);
    const colorPalettePage: ColorPalettePage = new ColorPalettePage(page);

    const firstTokenName = 'color.random';
    const secondTokenName = 'color.blue';
    const firstTokenValue = sampleData.color.getRandomHexCode();
    const secondTokenValue = sampleData.color.blueHexCode;
    const thirdTokenValue = sampleData.color.greenHexCode;

    await tokensPage.clickTokensTab();
    await tokensPage.tokensComp.createColorToken(firstTokenName, firstTokenValue);
    await tokensPage.tokensComp.isTokenVisibleWithName(firstTokenName);
    await tokensPage.tokensComp.createColorToken(secondTokenName, secondTokenValue);
    await tokensPage.tokensComp.isTokenVisibleWithName(secondTokenName);

    await mainPage.createDefaultTextLayerByCoordinates(100, 200, browserName);
    await mainPage.waitForChangeIsSaved();
    await mainPage.waitForResizeHandlerVisible();
    await tokensPage.tokensComp.clickOnTokenWithName(firstTokenName);
    await tokensPage.tokensComp.isTokenAppliedWithName(firstTokenName);
    await layersPanelPage.openLayersTab();
    await mainPage.pressFlexLayoutShortcut();
    await mainPage.waitForChangeIsSaved();
    await mainPage.waitForResizeHandlerVisible();
    await layersPanelPage.createComponentViaShortcut(browserName, true);
    await mainPage.waitForChangeIsSaved();
    await mainPage.pressCopyShortcut(browserName);
    await mainPage.pressPasteShortcut(browserName);
    await mainPage.waitForChangeIsSaved();

    await layersPanelPage.openLayersTab();
    await layersPanelPage.selectCopyComponentChildLayer();
    await tokensPage.clickTokensTab();
    await tokensPage.tokensComp.clickOnTokenWithName(secondTokenName);
    await tokensPage.tokensComp.isTokenAppliedWithName(secondTokenName);
    await layersPanelPage.openLayersTab();
    await layersPanelPage.clickMainComponentOnLayersTab();
    await layersPanelPage.selectMainComponentChildLayer();

    await designPanelPage.clickFillColorIcon();
    await colorPalettePage.setHex(thirdTokenValue);
    await layersPanelPage.selectMainComponentChildLayer();
    await mainPage.waitForChangeIsSaved();
    await designPanelPage.isFillHexCodeSet(thirdTokenValue.slice(1));

    await tokensPage.clickTokensTab();
    await tokensPage.tokensComp.isTokenAppliedWithName(firstTokenName, false);
    await layersPanelPage.openLayersTab();
    await layersPanelPage.clickCopyComponentOnLayersTab();
    await layersPanelPage.selectCopyComponentChildLayer();
    await tokensPage.clickTokensTab();
    await tokensPage.tokensComp.isTokenAppliedWithName(secondTokenName, true);

    await mainPage.waitForResizeHandlerVisible();
    await expect(mainPage.viewport).toHaveScreenshot('2-texts-color.png', {
      mask: [mainPage.guides, mainPage.guidesFragment, mainPage.toolBarWindow],
    });
  },
);

mainTest.describe(() => {
  let mainPage: MainPage;
  let tokensPage: TokensPage;
  let designPanelPage: DesignPanelPage;

  const tokenName = 'global.font.family';
  const tokenValue = 'Actor';
  const newTokenValue = 'Inter';
  const secondTokenName = 'global.font.family2';

  mainTest.beforeEach(async ({ page, browserName }) => {
    mainPage = new MainPage(page);
    tokensPage = new TokensPage(page);
    designPanelPage = new DesignPanelPage(page);

    await mainPage.createDefaultTextLayerByCoordinates(100, 200, browserName);
    await tokensPage.clickTokensTab();
    await tokensPage.tokensComp.createFontFamilyToken(tokenName, tokenValue);
    await tokensPage.tokensComp.isTokenVisibleWithName(tokenName);
    await tokensPage.tokensComp.clickOnTokenWithName(tokenName);
    await mainPage.waitForChangeIsSaved();
  });

  mainTest(qase(2472, 'Apply a font family token'), async () => {
    await tokensPage.tokensComp.isTokenAppliedWithName(tokenName);
    await designPanelPage.checkFontName(tokenValue);
  });

  mainTest(qase(2475, 'Edit a font family token'), async () => {
    await tokensPage.tokensComp.isTokenAppliedWithName(tokenName);
    await tokensPage.tokensComp.editToken(tokenName, newTokenValue);
    await mainPage.waitForChangeIsSaved();
    await designPanelPage.checkFontName(newTokenValue);
    await tokensPage.tokensComp.isTokenAppliedWithName(tokenName);
    await tokensPage.tokensComp.checkAppliedTokenTitle(
      'Token: global.font.family\n' +
        'Original value: Inter\n' +
        'Resolved value: Inter',
    );
  });

  mainTest(qase(2506, 'Reference a font family token'), async () => {
    await tokensPage.tokensComp.isTokenAppliedWithName(tokenName);
    await designPanelPage.checkFontName(tokenValue);

    await tokensPage.tokensComp.createFontFamilyToken(
      secondTokenName,
      `{${tokenName}}`,
    );
    await tokensPage.tokensComp.isTokenVisibleWithName(secondTokenName);
    await tokensPage.tokensComp.clickOnTokenWithName(secondTokenName);
    await tokensPage.tokensComp.editToken(tokenName, newTokenValue);
    await mainPage.waitForChangeIsSaved();
    await designPanelPage.checkFontName(newTokenValue);
    await tokensPage.tokensComp.isTokenAppliedWithName(secondTokenName);
  });
});

mainTest.describe(() => {
  let mainPage: MainPage;
  let tokensPage: TokensPage;
  let designPanelPage: DesignPanelPage;
  let layersPanelPage: LayersPanelPage;

  mainTest.beforeEach(async ({ page, browserName }) => {
    mainPage = new MainPage(page);
    tokensPage = new TokensPage(page);
    designPanelPage = new DesignPanelPage(page);
    layersPanelPage = new LayersPanelPage(page);

    await mainPage.createDefaultTextLayerByCoordinates(100, 200, browserName);
    await designPanelPage.changeTextFont('Source Sans Pro');
    await designPanelPage.changeTextFontStyle('400');
    await designPanelPage.changeTextFontSize('9');
    await tokensPage.clickTokensTab();
  });

  mainTest(
    qase(
      2558,
      'Apply a Font Weight token to a text not matching a family font style, but with a fallback value',
    ),
    async () => {
      const tokenName = 'extra.black.font.weight';
      const secondTokenName = '500.italic.font.weight';

      await tokensPage.tokensComp.createFontWeightToken(tokenName, 'extra-black');
      await tokensPage.tokensComp.isTokenVisibleWithName(tokenName);
      await tokensPage.tokensComp.createFontWeightToken(
        secondTokenName,
        '500 italic',
      );
      await tokensPage.tokensComp.isTokenVisibleWithName(secondTokenName);

      await tokensPage.tokensComp.clickOnTokenWithName(tokenName);
      await mainPage.checkImportErrorMessage(
        `Error setting font weight/style. This font style does not exist in the current font`,
      );
      await mainPage.closeModalWindow();
      await mainPage.isImportErrorMessageVisible(false);
      await mainPage.waitForChangeIsSaved();
      await tokensPage.tokensComp.isTokenAppliedWithName(tokenName);
      await designPanelPage.checkFontStyle('900');

      await tokensPage.tokensComp.clickOnTokenWithName(secondTokenName);
      await mainPage.checkImportErrorMessage(
        `Error setting font weight/style. This font style does not exist in the current font`,
      );
      await mainPage.waitForChangeIsSaved();
      await tokensPage.tokensComp.isTokenAppliedWithName(secondTokenName);
      await designPanelPage.checkFontStyle('400 Italic');
    },
  );

  mainTest(
    qase(
      2559,
      'Apply a Font Weight token to a text not matching a family font style, with no fallback value',
    ),
    async () => {
      const tokenName = 'extra.black.font.weight';

      await tokensPage.tokensComp.createFontWeightToken(tokenName, '500');
      await tokensPage.tokensComp.isTokenVisibleWithName(tokenName);

      await designPanelPage.changeTextFont('Splash');
      await tokensPage.tokensComp.clickOnTokenWithName(tokenName);
      await mainPage.checkImportErrorMessage(
        `Error setting font weight/style. This font style does not exist in the current font`,
      );
      await mainPage.waitForChangeIsSaved();
      await tokensPage.tokensComp.isTokenAppliedWithName(tokenName);
      await designPanelPage.checkFontStyle('400');
    },
  );

  mainTest(
    qase(
      2562,
      'Edit the value of a Font Weight token already applied to a component text with duplicated copies',
    ),
    async ({ browserName }) => {
      const tokenName = '700.italic.font.weight';
      const newTokenValue = '200';

      await tokensPage.tokensComp.createFontWeightToken(tokenName, '700 Italic');
      await tokensPage.tokensComp.isTokenVisibleWithName(tokenName);
      await tokensPage.tokensComp.clickOnTokenWithName(tokenName);
      await mainPage.waitForChangeIsSaved();
      await tokensPage.tokensComp.isTokenAppliedWithName(tokenName);
      await designPanelPage.checkFontStyle('700 Italic');

      await mainPage.createComponentViaRightClick();
      await mainPage.waitForChangeIsSaved();
      await mainPage.copyLayerViaRightClick();
      await mainPage.pressPasteShortcut(browserName);
      await mainPage.waitForChangeIsSaved();

      await tokensPage.tokensComp.editToken(tokenName, newTokenValue);
      await mainPage.waitForChangeIsSaved();

      await layersPanelPage.openLayersTab();
      await layersPanelPage.selectMainComponentChildLayer();
      await designPanelPage.checkFontStyle(newTokenValue);
      await layersPanelPage.selectCopyComponentChildLayer();
      await designPanelPage.checkFontStyle(newTokenValue);
    },
  );
});

mainTest.describe(() => {
  let mainPage: MainPage;
  let tokensPage: TokensPage;
  let designPanelPage: DesignPanelPage;
  let assetsPanelPage: AssetsPanelPage;

  const tokenName = 'global.letter.spacing';
  const tokenValue = '10';
  const newTokenValue = '5';

  mainTest.beforeEach(async ({ page, browserName }) => {
    mainPage = new MainPage(page);
    tokensPage = new TokensPage(page);
    designPanelPage = new DesignPanelPage(page);
    assetsPanelPage = new AssetsPanelPage(page);

    await mainPage.createDefaultTextLayerByCoordinates(100, 200, browserName);
    await tokensPage.clickTokensTab();
    await tokensPage.tokensComp.createLetterSpacingToken(tokenName, tokenValue);
    await tokensPage.tokensComp.isTokenVisibleWithName(tokenName);
    await tokensPage.tokensComp.clickOnTokenWithName(tokenName);
    await mainPage.waitForChangeIsSaved();
  });

  mainTest(
    qase(2500, 'Apply a Letter Spacing token and override value from Design tab'),
    async () => {
      await tokensPage.tokensComp.isTokenAppliedWithName(tokenName);
      await designPanelPage.checkLetterSpacing(tokenValue);
      await designPanelPage.changeTextLetterSpacing(newTokenValue);
      await mainPage.waitForChangeIsSaved();
      await tokensPage.tokensComp.isTokenAppliedWithName(tokenName, false);
      await designPanelPage.checkLetterSpacing(newTokenValue);
    },
  );

  mainTest(
    qase(
      2501,
      'Letter Spacing token value can be override by Assets > Typography style',
    ),
    async () => {
      await tokensPage.tokensComp.isTokenAppliedWithName(tokenName);
      await designPanelPage.checkLetterSpacing(tokenValue);

      await assetsPanelPage.clickAssetsTab();
      await assetsPanelPage.clickAddFileLibraryTypographyButton();
      await assetsPanelPage.waitForChangeIsSaved();
      await assetsPanelPage.selectLetterSpacing(newTokenValue);
      await designPanelPage.clickOnEnter();
      await assetsPanelPage.waitForChangeIsSaved();

      await tokensPage.clickTokensTab();
      await designPanelPage.clickOnTypographyMenuButton();
      await tokensPage.tokensComp.isTokenAppliedWithName(tokenName, false);
      await designPanelPage.checkLetterSpacing(newTokenValue);
    },
  );
});

mainTest(
  qase(
    2536,
    'Reference a dimension-type token as an operand (math operation / Dimensions token)',
  ),
  async ({ page }) => {
    const mainPage: MainPage = new MainPage(page);
    const tokensPage: TokensPage = new TokensPage(page);

    const tokenName = 'global.letter.spacing';
    const dimensionsToken = 'global.dimension';

    await tokensPage.clickTokensTab();
    await tokensPage.tokensComp.createDimensionToken(dimensionsToken, '2');

    await tokensPage.tokensComp.createLetterSpacingToken(
      tokenName,
      `5px*{${dimensionsToken}}`,
    );
    await tokensPage.tokensComp.isTokenVisibleWithName(tokenName);
    await mainPage.waitForChangeIsSaved();
    await tokensPage.tokensComp.checkTokenTitle(
      tokenName,
      `Token: ${tokenName}\n` +
        `Original value: 5px*{${dimensionsToken}}\n` +
        'Resolved value: 10',
    );

    await tokensPage.tokensComp.editToken(tokenName, `5px/{${dimensionsToken}}`);
    await tokensPage.tokensComp.isTokenVisibleWithName(tokenName);
    await mainPage.waitForChangeIsSaved();
    await tokensPage.tokensComp.checkTokenTitle(
      tokenName,
      `Token: ${tokenName}\n` +
        `Original value: 5px/{${dimensionsToken}}\n` +
        'Resolved value: 2.5',
    );

    await tokensPage.tokensComp.editToken(tokenName, `5px+{${dimensionsToken}}`);
    await tokensPage.tokensComp.isTokenVisibleWithName(tokenName);
    await mainPage.waitForChangeIsSaved();
    await tokensPage.tokensComp.checkTokenTitle(
      tokenName,
      `Token: ${tokenName}\n` +
        `Original value: 5px+{${dimensionsToken}}\n` +
        'Resolved value: 7',
    );

    await tokensPage.tokensComp.editToken(tokenName, `5px-{${dimensionsToken}}`);
    await tokensPage.tokensComp.isTokenVisibleWithName(tokenName);
    await mainPage.waitForChangeIsSaved();
    await tokensPage.tokensComp.checkTokenTitle(
      tokenName,
      `Token: ${tokenName}\n` +
        `Original value: 5px-{${dimensionsToken}}\n` +
        'Resolved value: 3',
    );
  },
);

mainTest(
  qase(
    2485,
    'Reference a Number token as an operand (math operation / Number token)',
  ),
  async ({ page }) => {
    const mainPage: MainPage = new MainPage(page);
    const tokensPage: TokensPage = new TokensPage(page);

    const tokenName = 'global.number';
    const numberToken = 'numberToken';

    await tokensPage.clickTokensTab();
    await tokensPage.tokensComp.createNumberToken(numberToken, '2');
    await mainPage.waitForChangeIsSaved();

    await tokensPage.tokensComp.createNumberToken(tokenName, `5*{${numberToken}}`);
    await tokensPage.tokensComp.isTokenVisibleWithName(tokenName);
    await mainPage.waitForChangeIsSaved();
    await tokensPage.tokensComp.checkTokenTitle(
      tokenName,
      `Token: ${tokenName}\n` +
        `Original value: 5*{${numberToken}}\n` +
        'Resolved value: 10\n' +
        'Right click to see options',
    );

    await tokensPage.tokensComp.editToken(tokenName, `5/{${numberToken}}`);
    await tokensPage.tokensComp.isTokenVisibleWithName(tokenName);
    await mainPage.waitForChangeIsSaved();
    await tokensPage.tokensComp.checkTokenTitle(
      tokenName,
      `Token: ${tokenName}\n` +
        `Original value: 5/{${numberToken}}\n` +
        'Resolved value: 2.5\n' +
        'Right click to see options',
    );

    await tokensPage.tokensComp.editToken(tokenName, `5+{${numberToken}}`);
    await tokensPage.tokensComp.isTokenVisibleWithName(tokenName);
    await mainPage.waitForChangeIsSaved();
    await tokensPage.tokensComp.checkTokenTitle(
      tokenName,
      `Token: ${tokenName}\n` +
        `Original value: 5+{${numberToken}}\n` +
        'Resolved value: 7\n' +
        'Right click to see options',
    );

    await tokensPage.tokensComp.editToken(tokenName, `5-{${numberToken}}`);
    await tokensPage.tokensComp.isTokenVisibleWithName(tokenName);
    await mainPage.waitForChangeIsSaved();
    await tokensPage.tokensComp.checkTokenTitle(
      tokenName,
      `Token: ${tokenName}\n` +
        `Original value: 5-{${numberToken}}\n` +
        'Resolved value: 3\n' +
        'Right click to see options',
    );
  },
);

mainTest(
  qase(2477, 'Apply a Number token (Rotation) and override value from Design tab'),
  async ({ page }) => {
    const mainPage: MainPage = new MainPage(page);
    const tokensPage: TokensPage = new TokensPage(page);
    const designPanelPage: DesignPanelPage = new DesignPanelPage(page);

    const tokenName = 'global.number';
    const tokenValue = '45';
    const newTokenValue = '0';

    await mainPage.createDefaultRectangleByCoordinates(320, 210);
    await tokensPage.clickTokensTab();

    await tokensPage.tokensComp.createNumberToken(tokenName, tokenValue);
    await tokensPage.tokensComp.isTokenVisibleWithName(tokenName);
    await tokensPage.tokensComp.selectMenuItem(tokenName, 'Rotation');
    await mainPage.waitForChangeIsSaved();
    await tokensPage.tokensComp.isTokenAppliedWithName(tokenName);
    await tokensPage.tokensComp.isMenuItemWithNameSelected(tokenName, 'Rotation');
    await designPanelPage.checkRotationForLayer(tokenValue);

    await designPanelPage.changeRotationForLayer(newTokenValue);
    await mainPage.waitForChangeIsSaved();
    await tokensPage.tokensComp.isTokenAppliedWithName(tokenName, false);
    await designPanelPage.checkRotationForLayer(newTokenValue);
  },
);

mainTest(
  qase(
    2492,
    'Apply a Number token (Line Height) and override value from Design tab',
  ),
  async ({ page, browserName }) => {
    const mainPage: MainPage = new MainPage(page);
    const tokensPage: TokensPage = new TokensPage(page);
    const designPanelPage: DesignPanelPage = new DesignPanelPage(page);

    const tokenName = 'global.number';
    const tokenValue = '2';
    const newTokenValue = '1';

    await mainPage.createDefaultTextLayerByCoordinates(100, 200, browserName);
    await tokensPage.clickTokensTab();

    await tokensPage.tokensComp.createNumberToken(tokenName, tokenValue);
    await tokensPage.tokensComp.isTokenVisibleWithName(tokenName);
    await tokensPage.tokensComp.selectMenuItem(tokenName, 'Line Height');
    await mainPage.waitForChangeIsSaved();
    await tokensPage.tokensComp.isTokenAppliedWithName(tokenName);
    await tokensPage.tokensComp.isMenuItemWithNameSelected(tokenName, 'Line Height');
    await designPanelPage.checkTextLineHeight(tokenValue);

    await designPanelPage.changeTextLineHeight(newTokenValue);
    await mainPage.waitForChangeIsSaved();
    await tokensPage.tokensComp.isTokenAppliedWithName(tokenName, false);
    await designPanelPage.checkTextLineHeight(newTokenValue);
  },
);

mainTest(
  qase(2522, 'Apply a capitalize text case token to a uppercase text layer'),
  async ({ page }) => {
    const mainPage: MainPage = new MainPage(page);
    const tokensPage: TokensPage = new TokensPage(page);
    const designPanelPage: DesignPanelPage = new DesignPanelPage(page);

    const tokenName = 'text-case-capitalize';
    const tokenValue = 'Capitalize';
    const text = 'EXAMPLE TEXT';
    await mainPage.createTextLayerByCoordinates(100, 200, text);
    await tokensPage.clickTokensTab();
    await tokensPage.tokensComp.createTextCaseToken(tokenName, tokenValue);
    await tokensPage.tokensComp.isTokenVisibleWithName(tokenName);
    await tokensPage.tokensComp.clickOnTokenWithName(tokenName);
    await mainPage.waitForChangeIsSaved();
    await tokensPage.tokensComp.isTokenAppliedWithName(tokenName);
    await designPanelPage.checkTextCase(tokenValue);
  },
);

mainTest(qase(2520, 'Override and re-apply a text case token'), async ({ page }) => {
  const mainPage: MainPage = new MainPage(page);
  const tokensPage: TokensPage = new TokensPage(page);
  const designPanelPage: DesignPanelPage = new DesignPanelPage(page);
  const assetsPanelPage: AssetsPanelPage = new AssetsPanelPage(page);

  const tokenName = 'text-case-capitalize';
  const tokenValue = 'Capitalize';
  const text = 'EXAMPLE TEXT';

  await assetsPanelPage.clickAssetsTab();
  await assetsPanelPage.clickAddFileLibraryTypographyButton();
  await assetsPanelPage.selectTextCase('Upper');
  await assetsPanelPage.minimizeFileLibraryTypography();
  await assetsPanelPage.waitForChangeIsSaved();

  await tokensPage.clickTokensTab();
  await mainPage.createTextLayerByCoordinates(100, 200, text);
  await tokensPage.tokensComp.createTextCaseToken(tokenName, tokenValue);
  await tokensPage.tokensComp.isTokenVisibleWithName(tokenName);
  await tokensPage.tokensComp.clickOnTokenWithName(tokenName);
  await mainPage.waitForChangeIsSaved();

  await tokensPage.tokensComp.isTokenAppliedWithName(tokenName);
  await designPanelPage.checkTextCase(tokenValue);

  await assetsPanelPage.clickAssetsTab();
  await assetsPanelPage.clickFileLibraryTypographiesTypographyRecord();
  await mainPage.waitForChangeIsSaved();
  await designPanelPage.clickOnTypographyMenuButton();
  await designPanelPage.checkTextCase('Upper');

  await tokensPage.clickTokensTab();
  await tokensPage.tokensComp.isTokenAppliedWithName(tokenName, false);

  await tokensPage.tokensComp.clickOnTokenWithName(tokenName);
  await mainPage.waitForChangeIsSaved();
  await tokensPage.tokensComp.isTokenAppliedWithName(tokenName);
  await designPanelPage.checkTextCase(tokenValue);

  await designPanelPage.changeTextCase('Lower');
  await mainPage.waitForChangeIsSaved();
  await tokensPage.tokensComp.isTokenAppliedWithName(tokenName, false);
  await designPanelPage.checkTextCase('Lower');
});

mainTest.describe(() => {
  let mainPage: MainPage;
  let tokensPage: TokensPage;
  let designPanelPage: DesignPanelPage;

  const tokenName = 'global.text.decoration';
  const tokenValue = 'underline';
  const newTokenValue = 'strike-through';

  mainTest.beforeEach(async ({ page, browserName }) => {
    mainPage = new MainPage(page);
    tokensPage = new TokensPage(page);
    designPanelPage = new DesignPanelPage(page);

    await mainPage.createDefaultTextLayerByCoordinates(100, 200, browserName);
    await tokensPage.clickTokensTab();
    await tokensPage.tokensComp.createTextDecorationToken(tokenName, tokenValue);
    await tokensPage.tokensComp.isTokenVisibleWithName(tokenName);
    await tokensPage.tokensComp.clickOnTokenWithName(tokenName);
    await mainPage.waitForChangeIsSaved();
  });

  mainTest(qase(2531, 'Edit a Text decoration token'), async () => {
    await tokensPage.tokensComp.isTokenAppliedWithName(tokenName);
    await tokensPage.tokensComp.editToken(tokenName, newTokenValue);
    await mainPage.waitForChangeIsSaved();
    await tokensPage.tokensComp.isTokenAppliedWithName(tokenName);
    await designPanelPage.isTextStrikethroughChecked();
  });

  mainTest(
    qase(2535, 'Re-Apply the token after change the decorator manually'),
    async () => {
      await tokensPage.tokensComp.isTokenAppliedWithName(tokenName);
      await designPanelPage.isTextUnderlineChecked();
      await designPanelPage.clickOnTextStrikethroughButton();
      await mainPage.waitForChangeIsSaved();
      await tokensPage.tokensComp.isTokenAppliedWithName(tokenName, false);
      await designPanelPage.isTextStrikethroughChecked();
      await tokensPage.tokensComp.clickOnTokenWithName(tokenName);
      await mainPage.waitForChangeIsSaved();
      await tokensPage.tokensComp.isTokenAppliedWithName(tokenName);
      await designPanelPage.isTextUnderlineChecked();
    },
  );
});
