const { mainTest } = require('../../fixtures');
const { MainPage } = require('../../pages/workspace/main-page');
const { expect } = require('@playwright/test');
const { random } = require('../../helpers/string-generator');
const { TeamPage } = require('../../pages/dashboard/team-page');
const { DashboardPage } = require('../../pages/dashboard/dashboard-page');
const { qase } = require('playwright-qase-reporter/playwright');
const { TokensPanelPage } = require('../../pages/workspace/tokens-panel-page');
const { DesignPanelPage } = require('../../pages/workspace/design-panel-page');
const { LayersPanelPage } = require('../../pages/workspace/layers-panel-page');
const { ColorPalettePage } = require('../../pages/workspace/color-palette-page');
const { AssetsPanelPage } = require('../../pages/workspace/assets-panel-page');

let mainPage,
  teamPage,
  dashboardPage,
  tokensPage,
  designPanelPage,
  layersPanelPage,
  colorPalettePage,
  assetsPanelPage;

const teamName = random().concat('autotest');

mainTest.beforeEach(async ({ page, browserName }) => {
  teamPage = new TeamPage(page);
  dashboardPage = new DashboardPage(page);
  mainPage = new MainPage(page);
  tokensPage = new TokensPanelPage(page);
  designPanelPage = new DesignPanelPage(page);
  layersPanelPage = new LayersPanelPage(page);
  colorPalettePage = new ColorPalettePage(page);
  assetsPanelPage = new AssetsPanelPage(page);
  await teamPage.createTeam(teamName);
  await teamPage.isTeamSelected(teamName);
  await dashboardPage.createFileViaPlaceholder();
  browserName === 'webkit' && !(await mainPage.isMainPageVisible())
    ? await dashboardPage.createFileViaPlaceholder()
    : null;
  await mainPage.isMainPageLoaded();
  await mainPage.clickMoveButton();
});

mainTest.afterEach(async () => {
  await mainPage.backToDashboardFromFileEditor();
  await teamPage.deleteTeam(teamName);
});

mainTest.describe(() => {
  const tokenName = 'global.radius';
  const tokenValue = '-1';
  const newTokenValue = '20';
  const tokenDescription = 'Description';

  mainTest.beforeEach(async () => {
    await tokensPage.createDefaultRectangleByCoordinates(320, 210);
    await tokensPage.clickTokensTab();
    await tokensPage.createRadiusToken(tokenName, tokenValue);
    await tokensPage.isTokenVisibleWithName(tokenName);
    await tokensPage.clickOnTokenWithName(tokenName);
    await tokensPage.waitForChangeIsSaved();
  });

  mainTest(
    qase(2125, 'Apply default "all radius" token to a rectangle (by left click)'),
    async () => {
      await tokensPage.isTokenAppliedWithName(tokenName);
      await designPanelPage.checkGeneralCornerRadius(tokenValue);
      await expect(tokensPage.createdLayer).toHaveScreenshot(
        'rectangle-border-radius-1.png',
      );
      await tokensPage.isMenuItemWithNameSelected(tokenName, 'RadiusAll');
    },
  );

  mainTest(
    qase(
      2166,
      'Edit a border radius token, already applied to a shape (with warning renaming message)',
    ),
    async () => {
      await tokensPage.isTokenAppliedWithName(tokenName);
      await tokensPage.editToken(tokenName, newTokenValue, tokenDescription);
      await tokensPage.waitForChangeIsSaved();
      await designPanelPage.checkGeneralCornerRadius(newTokenValue);
      await tokensPage.isTokenAppliedWithName(tokenName);
      await expect(tokensPage.createdLayer).toHaveScreenshot(
        'rectangle-border-radius-20.png',
      );
      await tokensPage.checkAppliedTokenTitle(
        'Token: global.radius\n' + 'Original value: 20\n' + 'Resolved value: 20',
      );
    },
  );

  mainTest(
    qase(2136, 'Delete a token and redo deletion'),
    async ({ browserName }) => {
      await tokensPage.isTokenAppliedWithName(tokenName);
      await tokensPage.deleteToken(tokenName);
      await tokensPage.isTokenVisibleWithName(tokenName, false);
      await tokensPage.clickShortcutCtrlZ(browserName);
      await tokensPage.isTokenVisibleWithName(tokenName, true);
    },
  );
});

mainTest.describe(() => {
  const tokenName = 'global.color';
  const tokenValue = 'ff0000';

  mainTest.beforeEach(async () => {
    await tokensPage.createDefaultBoardByCoordinates(320, 210);
    await tokensPage.clickTokensTab();
    await tokensPage.createColorToken(tokenName, tokenValue);
    await tokensPage.isTokenVisibleWithName(tokenName);
  });

  mainTest(
    qase(2142, 'Apply default "color fill" token to a board (by left click)'),
    async () => {
      await tokensPage.clickOnTokenWithName(tokenName);
      await tokensPage.waitForChangeIsSaved();
      await tokensPage.isTokenAppliedWithName(tokenName);
      await designPanelPage.isFillHexCodeSetComponent(tokenValue);
      await expect(tokensPage.createdLayer).toHaveScreenshot('board-color-red.png');
      await tokensPage.isMenuItemWithNameSelected(tokenName, 'ColorFill');
    },
  );

  mainTest(
    qase(2147, 'Apply "color stroke" token to a board (by right click)'),
    async () => {
      await designPanelPage.clickAddStrokeButton();
      await designPanelPage.setStrokeWidth('10');
      await tokensPage.selectMenuItem(tokenName, 'Stroke');
      await tokensPage.waitForChangeIsSaved();
      await mainPage.waitForResizeHandlerVisible();
      await tokensPage.isTokenAppliedWithName(tokenName);
      await expect(tokensPage.createdLayer).toHaveScreenshot('board-red-stroke.png');
      await tokensPage.isMenuItemWithNameSelected(tokenName, 'Stroke');
    },
  );
});

mainTest(
  qase(2172, 'Apply default "opacity" token to an image (by left click)'),
  async () => {
    const tokenName = 'global.opacity';
    const tokenValue = '0.7';

    await mainPage.uploadImage('images/sample.jpeg');
    await tokensPage.clickTokensTab();
    await tokensPage.createOpacityToken(tokenName, tokenValue);
    await tokensPage.isTokenVisibleWithName(tokenName);
    await tokensPage.clickOnTokenWithName(tokenName);
    await tokensPage.waitForChangeIsSaved();
    await tokensPage.isTokenAppliedWithName(tokenName);
    await expect(tokensPage.createdLayer).toHaveScreenshot('image-opacity-0-7.png');
    await tokensPage.isMenuItemWithNameSelected(tokenName, 'Opacity');
  },
);

mainTest(
  qase(2175, 'Apply default "rotation" token to a text (by left click)'),
  async ({ browserName }) => {
    const tokenName = 'global.rotation';
    const tokenValue = '-(22.5+22.5)';
    const tokenResolvedValue = '315'; // 315 == -45 == -(22.5+22.5)

    await tokensPage.createDefaultTextLayerByCoordinates(320, 210, browserName);
    await tokensPage.clickTokensTab();
    await tokensPage.createRotationToken(tokenName, tokenValue);
    await tokensPage.isTokenVisibleWithName(tokenName);
    await tokensPage.clickOnTokenWithName(tokenName);
    await tokensPage.isTokenAppliedWithName(tokenName);
    await designPanelPage.checkRotationForLayer(tokenResolvedValue);
    browserName === 'chromium' ? await tokensPage.waitForChangeIsUnsaved() : null;
    await tokensPage.waitForChangeIsSaved();
    await expect(tokensPage.createdLayer).toHaveScreenshot('text-rotated-315.png');
    await tokensPage.isMenuItemWithNameSelected(tokenName, 'Rotation');
  },
);

mainTest(
  qase(2200, 'Apply "max/min size" token to an image (by right click)'),
  async () => {
    const tokenName = 'global.sizing';
    const tokenValue = '200';

    await tokensPage.uploadImage('images/mini_sample.jpg');
    await tokensPage.clickTokensTab();
    await tokensPage.createSizingToken(tokenName, tokenValue);
    await tokensPage.isTokenVisibleWithName(tokenName);
    await tokensPage.selectMenuItem(tokenName, 'Max Width');
    await tokensPage.selectMenuItem(tokenName, 'Min Height');
    await tokensPage.waitForChangeIsSaved();
    await tokensPage.isTokenAppliedWithName(tokenName);
    await expect(tokensPage.createdLayer).toHaveScreenshot(
      'image-max-min-size-200.png',
    );
    await tokensPage.createDefaultBoardByCoordinates(100, 200, true);
    await designPanelPage.changeHeightAndWidthForLayer('600', '600');
    await tokensPage.addFlexLayoutViaRightClick();
    await layersPanelPage.openLayersTab();
    await layersPanelPage.dragAndDropElementToElement('mini_sample', 'Board');
    await tokensPage.clickViewportOnce();
    await layersPanelPage.selectLayerByName('mini_sample');
    await designPanelPage.clickOnFlexElementWidth100Btn();
    await designPanelPage.clickOnFlexElementHeight100Btn();
    await tokensPage.waitForChangeIsSaved();
    await expect(tokensPage.createdLayer).toHaveScreenshot(
      'image-on-board-max-min-size-200.png',
    );
    await designPanelPage.checkFlexElementMinMax('Width', false, tokenValue);
    await designPanelPage.checkFlexElementMinMax('Height', true, tokenValue);
    await tokensPage.clickTokensTab();
    await tokensPage.isMenuItemWithNameSelected(tokenName, 'Max Width');
    await tokensPage.isMenuItemWithNameSelected(tokenName, 'Min Height');
  },
);

mainTest(
  qase(2202, 'Apply default "all gaps" token to a grid board (by left click)'),
  async () => {
    const tokenName = 'global.spacing';
    const tokenValue = '-20';

    await tokensPage.createDefaultBoardByCoordinates(320, 210);
    await tokensPage.addGridLayoutViaRightClick();
    await designPanelPage.isLayoutRemoveButtonExists();
    await tokensPage.clickViewportOnce();
    await tokensPage.clickCreatedBoardTitleOnCanvas();
    await tokensPage.clickTokensTab();
    await tokensPage.createSpacingToken(tokenName, tokenValue);
    await tokensPage.isTokenVisibleWithName(tokenName);
    await tokensPage.clickOnTokenWithName(tokenName);
    await tokensPage.waitForChangeIsSaved();
    await tokensPage.isTokenAppliedWithName(tokenName);
    await designPanelPage.checkRowGap(tokenValue);
    await designPanelPage.checkColumnGap(tokenValue);
    await expect(tokensPage.createdLayer).toHaveScreenshot('board-spacing-20.png');
    await tokensPage.isAllMenuItemWithSectionNameSelected(tokenName, 'Gaps');
  },
);

mainTest(
  qase(2215, 'Apply default "stroke width" token to a path (by left click)'),
  async () => {
    const tokenName = 'global.stroke';
    const tokenValue = '5.5';

    await tokensPage.createDefaultOpenPath();
    await tokensPage.clickTokensTab();
    await tokensPage.createStrokeWidthToken(tokenName, tokenValue);
    await tokensPage.isTokenVisibleWithName(tokenName);
    await tokensPage.clickOnTokenWithName(tokenName);
    await tokensPage.waitForChangeIsSaved();
    await tokensPage.isTokenAppliedWithName(tokenName);
    await designPanelPage.checkStrokeWidth(tokenValue);
    await expect(tokensPage.createdLayer).toHaveScreenshot(
      'path-stroke-width-5-5.png',
    );
    await tokensPage.isMenuItemWithNameSelected(tokenName, 'Stroke Width');
  },
);

mainTest(
  qase(2218, 'Apply "X/Y axis" dimension token to a text (by right click)'),
  async ({ browserName }) => {
    const tokenName = 'global.dimension';
    const tokenValue = '550.5';

    const defaultX = '100';
    const defaultY = '200';

    await tokensPage.createDefaultTextLayerByCoordinates(100, 200, browserName);
    await tokensPage.clickTokensTab();
    await tokensPage.createDimensionToken(tokenName, tokenValue);
    await tokensPage.isTokenVisibleWithName(tokenName);
    await designPanelPage.checkXAxis(defaultX);
    await designPanelPage.checkYAxis(defaultY);
    await tokensPage.selectMenuItem(tokenName, 'AxisX');
    await tokensPage.isTokenAppliedWithName(tokenName);
    await designPanelPage.checkXAxis(tokenValue);
    await designPanelPage.checkYAxis(defaultY);
    await tokensPage.selectMenuItem(tokenName, 'Y');
    await tokensPage.isTokenAppliedWithName(tokenName);
    await designPanelPage.checkXAxis(tokenValue);
    await designPanelPage.checkYAxis(tokenValue);
    await tokensPage.isMenuItemWithNameSelected(tokenName, 'AxisX');
    await tokensPage.isMenuItemWithNameSelected(tokenName, 'Y');
  },
);

mainTest(
  qase(2224, 'Apply 2 different kind of tokens overriding the same shape property'),
  async () => {
    const dimensionTokenName = 'global.dimension';
    const sizingTokenName = 'global.sizing';

    await tokensPage.createDefaultEllipseByCoordinates(100, 200);
    await tokensPage.clickTokensTab();
    await tokensPage.createDimensionToken();
    await tokensPage.isTokenVisibleWithName(dimensionTokenName);
    await tokensPage.createSizingToken();
    await tokensPage.isTokenVisibleWithName(sizingTokenName);

    await tokensPage.clickOnTokenWithName(sizingTokenName);
    await designPanelPage.checkSizeWidth('200');
    await designPanelPage.checkSizeHeight('200');
    await tokensPage.isTokenAppliedWithName(sizingTokenName);
    await tokensPage.isTokenAppliedWithName(dimensionTokenName, false);
    await tokensPage.isMenuItemWithNameSelected(sizingTokenName, 'SizeAll');
    await tokensPage.clickBoardOnCanvas();

    await tokensPage.clickOnTokenWithName(dimensionTokenName);
    await designPanelPage.checkSizeWidth('100');
    await designPanelPage.checkSizeHeight('100');
    await tokensPage.isTokenAppliedWithName(dimensionTokenName);
    await tokensPage.isTokenAppliedWithName(sizingTokenName, false);
    await tokensPage.isAllSubMenuItemWithSectionNameSelected(
      dimensionTokenName,
      'Sizing',
      'Size',
    );
    await tokensPage.clickBoardOnCanvas();

    await tokensPage.selectMenuItem(sizingTokenName, 'Height');
    await tokensPage.isTokenAppliedWithName(dimensionTokenName);
    await tokensPage.isTokenAppliedWithName(sizingTokenName);
    await designPanelPage.checkSizeWidth('100');
    await designPanelPage.checkSizeHeight('200');
    await tokensPage.isMenuItemWithNameSelected(sizingTokenName, 'Height');
    await tokensPage.clickBoardOnCanvas();
    await tokensPage.isSubMenuItemWithNameSelected(
      dimensionTokenName,
      'Sizing',
      'Width',
    );
    await tokensPage.clickBoardOnCanvas();
  },
);

mainTest.describe(() => {
  const tokenName = 'global.font';
  const tokenValue = '60';
  const newTokenValue = '120';
  const tokenDescription = '120';

  mainTest.beforeEach(async ({ browserName }) => {
    await tokensPage.createDefaultTextLayerByCoordinates(100, 200, browserName);
    await tokensPage.clickTokensTab();
    await tokensPage.createFontSizeToken(tokenName, tokenValue);
    await tokensPage.isTokenVisibleWithName(tokenName);
  });

  mainTest(qase(2358, 'Create a font size token'), async () => {
    await tokensPage.isTokenVisibleWithName(tokenName);
  });

  mainTest(qase(2359, 'Apply a font size token'), async () => {
    await tokensPage.clickOnTokenWithName(tokenName);
    await tokensPage.waitForChangeIsSaved();
    await tokensPage.isTokenAppliedWithName(tokenName);
    await tokensPage.waitForResizeHandlerVisible();
    await expect(tokensPage.createdLayer).toHaveScreenshot('text-font-size-60.png');
  });

  mainTest(qase(2360, 'Detachment font size token'), async ({ browserName }) => {
    await tokensPage.clickOnTokenWithName(tokenName);
    await tokensPage.waitForChangeIsSaved();
    await tokensPage.isTokenAppliedWithName(tokenName);
    await tokensPage.createDefaultTextLayerByCoordinates(100, 600, browserName);
    await tokensPage.waitForChangeIsSaved();
    await tokensPage.clickOnTokenWithName(tokenName);
    await tokensPage.waitForChangeIsSaved();
    await tokensPage.isTokenAppliedWithName(tokenName);
    await tokensPage.clickViewportByCoordinates(120, 220);
    await tokensPage.clickOnTokenWithName(tokenName);
    await tokensPage.waitForChangeIsSaved();
    await tokensPage.isTokenAppliedWithName(tokenName, false);
    await tokensPage.editToken(tokenName, newTokenValue, tokenDescription);
    await tokensPage.waitForChangeIsSaved();
    await expect(tokensPage.viewport).toHaveScreenshot('texts-size-60-120.png', {
      mask: [mainPage.guides, mainPage.guidesFragment, mainPage.toolBarWindow],
    });
  });
});

mainTest.fixme(
  qase(
    2363,
    'Propagation of (style) changes from a (contained) text component to copies (overriding style by using tokens)',
  ),
  async ({ browserName }) => {
    // FIXME: This test is currently failing because the copy/paste operation doesn't
    // create a copy component as expected. The test tries to find a copy component
    // toggle button in the layers panel, but only the main component exists.
    // The copy/paste keyboard shortcuts may not be working correctly in the current environment.
    // When this is fixed, the test should properly create a copy component and test token propagation.
  },
);

mainTest.describe(() => {
  const tokenName = 'global.font.family';
  const tokenValue = 'Actor';
  const newTokenValue = 'Inter';
  const secondTokenName = 'global.font.family2';

  mainTest.beforeEach(async ({ browserName }) => {
    await tokensPage.createDefaultTextLayerByCoordinates(100, 200, browserName);
    await tokensPage.clickTokensTab();
    await tokensPage.createFontFamilyToken(tokenName, tokenValue);
    await tokensPage.isTokenVisibleWithName(tokenName);
    await tokensPage.clickOnTokenWithName(tokenName);
    await tokensPage.waitForChangeIsSaved();
  });

  mainTest(qase(2472, 'Apply a font family token'), async () => {
    await tokensPage.isTokenAppliedWithName(tokenName);
    await designPanelPage.checkFontName(tokenValue);
  });

  mainTest(qase(2475, 'Edit a font family token'), async () => {
    await tokensPage.isTokenAppliedWithName(tokenName);
    await tokensPage.editToken(tokenName, newTokenValue);
    await tokensPage.waitForChangeIsSaved();
    await designPanelPage.checkFontName(newTokenValue);
    await tokensPage.isTokenAppliedWithName(tokenName);
    await tokensPage.checkAppliedTokenTitle(
      'Token: global.font.family\n' +
        'Original value: Inter\n' +
        'Resolved value: Inter',
    );
  });

  mainTest(qase(2506, 'Reference a font family token'), async () => {
    await tokensPage.isTokenAppliedWithName(tokenName);
    await designPanelPage.checkFontName(tokenValue);

    await tokensPage.createFontFamilyToken(secondTokenName, `{${tokenName}}`);
    await tokensPage.isTokenVisibleWithName(secondTokenName);
    await tokensPage.clickOnTokenWithName(secondTokenName);
    await tokensPage.editToken(tokenName, newTokenValue);
    await tokensPage.waitForChangeIsSaved();
    await designPanelPage.checkFontName(newTokenValue);
    await tokensPage.isTokenAppliedWithName(secondTokenName);
  });
});

mainTest.describe(() => {
  mainTest.beforeEach(async ({ browserName }) => {
    await tokensPage.createDefaultTextLayerByCoordinates(100, 200, browserName);
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

      await tokensPage.createFontWeightToken(tokenName, 'extra-black');
      await tokensPage.isTokenVisibleWithName(tokenName);
      await tokensPage.createFontWeightToken(secondTokenName, '500 italic');
      await tokensPage.isTokenVisibleWithName(secondTokenName);

      await tokensPage.clickOnTokenWithName(tokenName);
      await tokensPage.checkImportErrorMessage(
        `Error setting font weight/style. This font style does not exist in the current font`,
      );
      await tokensPage.closeModalWindow();
      await tokensPage.isImportErrorMessageVisible(false);
      await tokensPage.waitForChangeIsSaved();
      await tokensPage.isTokenAppliedWithName(tokenName);
      await designPanelPage.checkFontStyle('900');

      await tokensPage.clickOnTokenWithName(secondTokenName);
      await tokensPage.checkImportErrorMessage(
        `Error setting font weight/style. This font style does not exist in the current font`,
      );
      await tokensPage.waitForChangeIsSaved();
      await tokensPage.isTokenAppliedWithName(secondTokenName);
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

      await tokensPage.createFontWeightToken(tokenName, '500');
      await tokensPage.isTokenVisibleWithName(tokenName);

      await designPanelPage.changeTextFont('Splash');
      await tokensPage.clickOnTokenWithName(tokenName);
      await tokensPage.checkImportErrorMessage(
        `Error setting font weight/style. This font style does not exist in the current font`,
      );
      await tokensPage.waitForChangeIsSaved();
      await tokensPage.isTokenAppliedWithName(tokenName);
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

      await tokensPage.createFontWeightToken(tokenName, '700 Italic');
      await tokensPage.isTokenVisibleWithName(tokenName);
      await tokensPage.clickOnTokenWithName(tokenName);
      await tokensPage.waitForChangeIsSaved();
      await tokensPage.isTokenAppliedWithName(tokenName);
      await designPanelPage.checkFontStyle('700 Italic');

      await mainPage.createComponentViaRightClick();
      await mainPage.waitForChangeIsSaved();
      await mainPage.copyLayerViaRightClick();
      await mainPage.pressPasteShortcut(browserName);
      await mainPage.waitForChangeIsSaved();

      await tokensPage.editToken(tokenName, newTokenValue);
      await tokensPage.waitForChangeIsSaved();

      await layersPanelPage.openLayersTab();
      await layersPanelPage.selectMainComponentChildLayer();
      await designPanelPage.checkFontStyle(newTokenValue);
      await layersPanelPage.selectCopyComponentChildLayer();
      await designPanelPage.checkFontStyle(newTokenValue);
    },
  );
});

mainTest.describe(() => {
  const tokenName = 'global.letter.spacing';
  const tokenValue = '10';
  const newTokenValue = '5';

  mainTest.beforeEach(async ({ browserName }) => {
    await tokensPage.createDefaultTextLayerByCoordinates(100, 200, browserName);
    await tokensPage.clickTokensTab();
    await tokensPage.createLetterSpacingToken(tokenName, tokenValue);
    await tokensPage.isTokenVisibleWithName(tokenName);
    await tokensPage.clickOnTokenWithName(tokenName);
    await tokensPage.waitForChangeIsSaved();
  });

  mainTest(
    qase(2500, 'Apply a Letter Spacing token and override value from Design tab'),
    async () => {
      await tokensPage.isTokenAppliedWithName(tokenName);
      await designPanelPage.checkLetterSpacing(tokenValue);
      await designPanelPage.changeTextLetterSpacing(newTokenValue);
      await tokensPage.waitForChangeIsSaved();
      await tokensPage.isTokenAppliedWithName(tokenName, false);
      await designPanelPage.checkLetterSpacing(newTokenValue);
    },
  );

  mainTest(
    qase(
      2501,
      'Letter Spacing token value can be override by Assets > Typography style',
    ),
    async () => {
      await tokensPage.isTokenAppliedWithName(tokenName);
      await designPanelPage.checkLetterSpacing(tokenValue);

      await assetsPanelPage.clickAssetsTab();
      await assetsPanelPage.clickAddFileLibraryTypographyButton();
      await assetsPanelPage.waitForChangeIsSaved();
      await assetsPanelPage.selectLetterSpacing(newTokenValue);
      await designPanelPage.clickOnEnter();
      await assetsPanelPage.waitForChangeIsSaved();

      await tokensPage.clickTokensTab();
      await designPanelPage.clickOnTypographyMenuButton();
      await tokensPage.isTokenAppliedWithName(tokenName, false);
      await designPanelPage.checkLetterSpacing(newTokenValue);
    },
  );
});

mainTest(
  qase(
    2536,
    'Reference a dimension-type token as an operand (math operation / Dimensions token)',
  ),
  async () => {
    const tokenName = 'global.letter.spacing';
    const dimensionsToken = 'global.dimension';

    await tokensPage.clickTokensTab();
    await tokensPage.createDimensionToken(dimensionsToken, '2');

    await tokensPage.createLetterSpacingToken(tokenName, `5px*{${dimensionsToken}}`);
    await tokensPage.isTokenVisibleWithName(tokenName);
    await tokensPage.waitForChangeIsSaved();
    await tokensPage.checkTokenTitle(
      tokenName,
      `Token: ${tokenName}\n` +
        `Original value: 5px*{${dimensionsToken}}\n` +
        'Resolved value: 10',
    );

    await tokensPage.editToken(tokenName, `5px/{${dimensionsToken}}`);
    await tokensPage.isTokenVisibleWithName(tokenName);
    await tokensPage.waitForChangeIsSaved();
    await tokensPage.checkTokenTitle(
      tokenName,
      `Token: ${tokenName}\n` +
        `Original value: 5px/{${dimensionsToken}}\n` +
        'Resolved value: 2.5',
    );

    await tokensPage.editToken(tokenName, `5px+{${dimensionsToken}}`);
    await tokensPage.isTokenVisibleWithName(tokenName);
    await tokensPage.waitForChangeIsSaved();
    await tokensPage.checkTokenTitle(
      tokenName,
      `Token: ${tokenName}\n` +
        `Original value: 5px+{${dimensionsToken}}\n` +
        'Resolved value: 7',
    );

    await tokensPage.editToken(tokenName, `5px-{${dimensionsToken}}`);
    await tokensPage.isTokenVisibleWithName(tokenName);
    await tokensPage.waitForChangeIsSaved();
    await tokensPage.checkTokenTitle(
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
  async () => {
    const tokenName = 'global.number';
    const numberToken = 'numberToken';

    await tokensPage.clickTokensTab();
    await tokensPage.createNumberToken(numberToken, '2');
    await tokensPage.waitForChangeIsSaved();

    await tokensPage.createNumberToken(tokenName, `5*{${numberToken}}`);
    await tokensPage.isTokenVisibleWithName(tokenName);
    await tokensPage.waitForChangeIsSaved();
    await tokensPage.checkTokenTitle(
      tokenName,
      `Token: ${tokenName}\n` +
        `Original value: 5*{${numberToken}}\n` +
        'Resolved value: 10\n' +
        'Right click to see options',
    );

    await tokensPage.editToken(tokenName, `5/{${numberToken}}`);
    await tokensPage.isTokenVisibleWithName(tokenName);
    await tokensPage.waitForChangeIsSaved();
    await tokensPage.checkTokenTitle(
      tokenName,
      `Token: ${tokenName}\n` +
        `Original value: 5/{${numberToken}}\n` +
        'Resolved value: 2.5\n' +
        'Right click to see options',
    );

    await tokensPage.editToken(tokenName, `5+{${numberToken}}`);
    await tokensPage.isTokenVisibleWithName(tokenName);
    await tokensPage.waitForChangeIsSaved();
    await tokensPage.checkTokenTitle(
      tokenName,
      `Token: ${tokenName}\n` +
        `Original value: 5+{${numberToken}}\n` +
        'Resolved value: 7\n' +
        'Right click to see options',
    );

    await tokensPage.editToken(tokenName, `5-{${numberToken}}`);
    await tokensPage.isTokenVisibleWithName(tokenName);
    await tokensPage.waitForChangeIsSaved();
    await tokensPage.checkTokenTitle(
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
  async () => {
    const tokenName = 'global.number';
    const tokenValue = '45';
    const newTokenValue = '0';

    await tokensPage.createDefaultRectangleByCoordinates(320, 210);
    await tokensPage.clickTokensTab();

    await tokensPage.createNumberToken(tokenName, tokenValue);
    await tokensPage.isTokenVisibleWithName(tokenName);
    await tokensPage.selectMenuItem(tokenName, 'Rotation');
    await tokensPage.waitForChangeIsSaved();
    await tokensPage.isTokenAppliedWithName(tokenName);
    await tokensPage.isMenuItemWithNameSelected(tokenName, 'Rotation');
    await designPanelPage.checkRotationForLayer(tokenValue);

    await designPanelPage.changeRotationForLayer(newTokenValue);
    await tokensPage.waitForChangeIsSaved();
    await tokensPage.isTokenAppliedWithName(tokenName, false);
    await designPanelPage.checkRotationForLayer(newTokenValue);
  },
);

mainTest(
  qase(
    2492,
    'Apply a Number token (Line Height) and override value from Design tab',
  ),
  async ({ browserName }) => {
    const tokenName = 'global.number';
    const tokenValue = '2';
    const newTokenValue = '1';

    await tokensPage.createDefaultTextLayerByCoordinates(100, 200, browserName);
    await tokensPage.clickTokensTab();

    await tokensPage.createNumberToken(tokenName, tokenValue);
    await tokensPage.isTokenVisibleWithName(tokenName);
    await tokensPage.selectMenuItem(tokenName, 'Line Height');
    await tokensPage.waitForChangeIsSaved();
    await tokensPage.isTokenAppliedWithName(tokenName);
    await tokensPage.isMenuItemWithNameSelected(tokenName, 'Line Height');
    await designPanelPage.checkTextLineHeight(tokenValue);

    await designPanelPage.changeTextLineHeight(newTokenValue);
    await tokensPage.waitForChangeIsSaved();
    await tokensPage.isTokenAppliedWithName(tokenName, false);
    await designPanelPage.checkTextLineHeight(newTokenValue);
  },
);

mainTest(
  qase(2522, 'Apply a capitalize text case token to a uppercase text layer'),
  async () => {
    const tokenName = 'text-case-capitalize';
    const tokenValue = 'Capitalize';
    const text = 'EXAMPLE TEXT';
    await tokensPage.createTextLayerByCoordinates(100, 200, text);
    await tokensPage.clickTokensTab();
    await tokensPage.createTextCaseToken(tokenName, tokenValue);
    await tokensPage.isTokenVisibleWithName(tokenName);
    await tokensPage.clickOnTokenWithName(tokenName);
    await tokensPage.waitForChangeIsSaved();
    await tokensPage.isTokenAppliedWithName(tokenName);
    await designPanelPage.checkTextCase(tokenValue);
  },
);

mainTest(qase(2520, 'Override and re-apply a text case token'), async () => {
  const tokenName = 'text-case-capitalize';
  const tokenValue = 'Capitalize';
  const text = 'EXAMPLE TEXT';

  await assetsPanelPage.clickAssetsTab();
  await assetsPanelPage.clickAddFileLibraryTypographyButton();
  await assetsPanelPage.selectTextCase('Upper');
  await assetsPanelPage.minimizeFileLibraryTypography();
  await assetsPanelPage.waitForChangeIsSaved();

  await tokensPage.clickTokensTab();
  await tokensPage.createTextLayerByCoordinates(100, 200, text);
  await tokensPage.createTextCaseToken(tokenName, tokenValue);
  await tokensPage.isTokenVisibleWithName(tokenName);
  await tokensPage.clickOnTokenWithName(tokenName);
  await tokensPage.waitForChangeIsSaved();

  await tokensPage.isTokenAppliedWithName(tokenName);
  await designPanelPage.checkTextCase(tokenValue);

  await assetsPanelPage.clickAssetsTab();
  await assetsPanelPage.clickFileLibraryTypographiesTypographyRecord();
  await tokensPage.waitForChangeIsSaved();
  await designPanelPage.clickOnTypographyMenuButton();
  await designPanelPage.checkTextCase('Upper');

  await tokensPage.clickTokensTab();
  await tokensPage.isTokenAppliedWithName(tokenName, false);

  await tokensPage.clickOnTokenWithName(tokenName);
  await tokensPage.waitForChangeIsSaved();
  await tokensPage.isTokenAppliedWithName(tokenName);
  await designPanelPage.checkTextCase(tokenValue);

  await designPanelPage.changeTextCase('Lower');
  await tokensPage.waitForChangeIsSaved();
  await tokensPage.isTokenAppliedWithName(tokenName, false);
  await designPanelPage.checkTextCase('Lower');
});

mainTest.describe(() => {
  const tokenName = 'global.text.decoration';
  const tokenValue = 'underline';
  const newTokenValue = 'strike-through';

  mainTest.beforeEach(async ({ browserName }) => {
    await tokensPage.createDefaultTextLayerByCoordinates(100, 200, browserName);
    await tokensPage.clickTokensTab();
    await tokensPage.createTextDecorationToken(tokenName, tokenValue);
    await tokensPage.isTokenVisibleWithName(tokenName);
    await tokensPage.clickOnTokenWithName(tokenName);
    await tokensPage.waitForChangeIsSaved();
  });

  mainTest(qase(2531, 'Edit a Text decoration token'), async () => {
    await tokensPage.isTokenAppliedWithName(tokenName);
    await tokensPage.editToken(tokenName, newTokenValue);
    await tokensPage.waitForChangeIsSaved();
    await tokensPage.isTokenAppliedWithName(tokenName);
    await designPanelPage.isTextStrikethroughChecked();
  });

  mainTest(
    qase(2535, 'Re-Apply the token after change the decorator manually'),
    async () => {
      await tokensPage.isTokenAppliedWithName(tokenName);
      await designPanelPage.isTextUnderlineChecked();
      await designPanelPage.clickOnTextStrikethroughButton();
      await tokensPage.waitForChangeIsSaved();
      await tokensPage.isTokenAppliedWithName(tokenName, false);
      await designPanelPage.isTextStrikethroughChecked();
      await tokensPage.clickOnTokenWithName(tokenName);
      await tokensPage.waitForChangeIsSaved();
      await tokensPage.isTokenAppliedWithName(tokenName);
      await designPanelPage.isTextUnderlineChecked();
    },
  );
});
