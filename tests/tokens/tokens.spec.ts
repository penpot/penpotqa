import { expect } from '@playwright/test';
import { qase } from 'playwright-qase-reporter/playwright';
import { mainTest } from 'fixtures';
import { SampleData } from 'helpers/sample-data';
import { random } from 'helpers/string-generator';
import { MainPage } from '@pages/workspace/main-page';
import { TeamPage } from '@pages/dashboard/team-page';
import { LayersPanelPage } from '@pages/workspace/layers-panel-page';
import { ColorPalettePage } from '@pages/workspace/color-palette-page';
import { AssetsPanelPage } from '@pages/workspace/assets-panel-page';
import { DashboardPage } from '@pages/dashboard/dashboard-page';
import { DesignPanelPage } from '@pages/workspace/design-panel-page';
import { TokensPage } from '@pages/workspace/tokens/tokens-base-page';
import { MainToken } from '@pages/workspace/tokens/token-components/main-tokens-component';
import { TokenClass } from '@pages/workspace/tokens/token-components/tokens-base-component';

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

  const radiusToken: MainToken<TokenClass> = {
    class: TokenClass.BorderRadius,
    name: 'global.radius',
    value: '-1',
    description: 'Description',
  };
  const newTokenValue = '20';

  mainTest.beforeEach(async ({ page }) => {
    tokensPage = new TokensPage(page);
    mainPage = new MainPage(page);
    designPanelPage = new DesignPanelPage(page);

    await mainPage.createDefaultRectangleByCoordinates(320, 210);
    await tokensPage.clickTokensTab();
    await tokensPage.tokensComp.createTokenViaAddButtonAndEnter(radiusToken);
    await tokensPage.mainTokensComp.isTokenVisibleWithName(radiusToken.name);
    await tokensPage.mainTokensComp.clickOnTokenWithName(radiusToken.name);
    await mainPage.waitForChangeIsSaved();
  });

  mainTest(
    qase(2125, 'Apply default "all radius" token to a rectangle (by left click)'),
    async ({ page }) => {
      tokensPage = new TokensPage(page);

      await tokensPage.mainTokensComp.isTokenAppliedWithName(radiusToken.name);
      await designPanelPage.checkGeneralCornerRadius(radiusToken.value);
      await expect(mainPage.createdLayer).toHaveScreenshot(
        'rectangle-border-radius-1.png',
      );
      await tokensPage.mainTokensComp.isMenuItemWithNameSelected(
        radiusToken.name,
        'RadiusAll',
      );
    },
  );

  mainTest(
    qase(
      2166,
      'Edit a border radius token, already applied to a shape (with warning renaming message)',
    ),
    async ({ page }) => {
      tokensPage = new TokensPage(page);

      const radiusToken: MainToken<TokenClass> = {
        class: TokenClass.BorderRadius,
        name: 'global.radius',
        value: '-1',
        description: 'Description',
      };

      const updatedTokenData: MainToken<TokenClass> = {
        class: TokenClass.BorderRadius,
        name: radiusToken.name,
        value: newTokenValue,
      };

      await tokensPage.mainTokensComp.isTokenAppliedWithName(radiusToken.name);
      await tokensPage.tokensComp.editTokenViaRightClickAndSave(updatedTokenData);
      await mainPage.waitForChangeIsSaved();
      await designPanelPage.checkGeneralCornerRadius(updatedTokenData.value);
      await tokensPage.mainTokensComp.isTokenAppliedWithName(updatedTokenData.name);
      await expect(mainPage.createdLayer).toHaveScreenshot(
        'rectangle-border-radius-20.png',
      );
      await tokensPage.mainTokensComp.checkAppliedTokenTitle(
        'Token: global.radius\n' + 'Original value: 20\n' + 'Resolved value: 20',
      );
    },
  );

  mainTest(
    qase(2136, 'Delete a token and redo deletion'),
    async ({ page, browserName }) => {
      tokensPage = new TokensPage(page);
      await tokensPage.mainTokensComp.isTokenAppliedWithName(radiusToken.name);
      await tokensPage.mainTokensComp.deleteToken(radiusToken.name);
      await tokensPage.mainTokensComp.isTokenVisibleWithName(
        radiusToken.name,
        false,
      );
      await mainPage.clickShortcutCtrlZ(browserName);
      await tokensPage.mainTokensComp.isTokenVisibleWithName(radiusToken.name, true);
    },
  );
});

mainTest.describe(() => {
  let mainPage: MainPage;
  let tokensPage: TokensPage;
  let designPanelPage: DesignPanelPage;

  const colorToken: MainToken<TokenClass> = {
    class: TokenClass.Color,
    name: 'global.color',
    value: sampleData.color.redHexCode,
  };

  mainTest.beforeEach(async ({ page }) => {
    mainPage = new MainPage(page);
    tokensPage = new TokensPage(page);
    designPanelPage = new DesignPanelPage(page);

    await mainPage.createDefaultBoardByCoordinates(320, 210);
    await tokensPage.clickTokensTab();
    await tokensPage.tokensComp.createTokenViaAddButtonAndEnter(colorToken);
    await tokensPage.mainTokensComp.isTokenVisibleWithName(colorToken.name);
  });

  mainTest(
    qase(2142, 'Apply default "color fill" token to a board (by left click)'),
    async () => {
      await tokensPage.mainTokensComp.clickOnTokenWithName(colorToken.name);
      await mainPage.waitForChangeIsSaved();
      await tokensPage.mainTokensComp.isTokenAppliedWithName(colorToken.name);
      await designPanelPage.isFillHexCodeSetComponent(colorToken.value);
      await expect(mainPage.createdLayer).toHaveScreenshot('board-color-red.png');
      await tokensPage.mainTokensComp.isMenuItemWithNameSelected(
        colorToken.name,
        'ColorFill',
      );
    },
  );

  mainTest(
    qase(2147, 'Apply "color stroke" token to a board (by right click)'),
    async () => {
      await designPanelPage.clickAddStrokeButton();
      await designPanelPage.setStrokeWidth('10');
      await tokensPage.mainTokensComp.selectMenuItem(colorToken.name, 'Stroke');
      await mainPage.waitForChangeIsSaved();
      await mainPage.waitForResizeHandlerVisible();
      await tokensPage.mainTokensComp.isTokenAppliedWithName(colorToken.name);
      await expect(mainPage.createdLayer).toHaveScreenshot('board-red-stroke.png');
      await tokensPage.mainTokensComp.isMenuItemWithNameSelected(
        colorToken.name,
        'Stroke',
      );
    },
  );
});

mainTest(
  qase(2172, 'Apply default "opacity" token to an image (by left click)'),
  async ({ page }) => {
    const mainPage: MainPage = new MainPage(page);
    const tokensPage: TokensPage = new TokensPage(page);

    const opacityToken: MainToken<TokenClass> = {
      class: TokenClass.Opacity,
      name: 'global.opacity',
      value: '0.7',
    };

    await mainPage.uploadImage('images/sample.jpeg');
    await tokensPage.clickTokensTab();
    await tokensPage.tokensComp.createTokenViaAddButtonAndEnter(opacityToken);
    await tokensPage.mainTokensComp.isTokenVisibleWithName(opacityToken.name);
    await tokensPage.mainTokensComp.clickOnTokenWithName(opacityToken.name);
    await mainPage.waitForChangeIsSaved();
    await tokensPage.mainTokensComp.isTokenAppliedWithName(opacityToken.name);
    await expect(mainPage.createdLayer).toHaveScreenshot('image-opacity-0-7.png');
    await tokensPage.mainTokensComp.isMenuItemWithNameSelected(
      opacityToken.name,
      'Opacity',
    );
  },
);

mainTest(
  qase(2175, 'Apply default "rotation" token to a text (by left click)'),
  async ({ page, browserName }) => {
    const mainPage: MainPage = new MainPage(page);
    const tokensPage: TokensPage = new TokensPage(page);
    const designPanelPage: DesignPanelPage = new DesignPanelPage(page);

    const rotationToken: MainToken<TokenClass> = {
      class: TokenClass.Rotation,
      name: 'global.rotation',
      value: '-(22.5+22.5)',
    };
    const tokenResolvedValue = '315'; // 315 == -45 == -(22.5+22.5)

    await mainPage.createDefaultTextLayerByCoordinates(320, 210, browserName);
    await tokensPage.clickTokensTab();
    await tokensPage.tokensComp.createTokenViaAddButtonAndEnter(rotationToken);
    await tokensPage.mainTokensComp.isTokenVisibleWithName(rotationToken.name);
    await tokensPage.mainTokensComp.clickOnTokenWithName(rotationToken.name);
    await tokensPage.mainTokensComp.isTokenAppliedWithName(rotationToken.name);
    await designPanelPage.checkRotationForLayer(tokenResolvedValue);
    browserName === 'chromium' ? await mainPage.waitForChangeIsUnsaved() : null;
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.createdLayer).toHaveScreenshot('text-rotated-315.png');
    await tokensPage.mainTokensComp.isMenuItemWithNameSelected(
      rotationToken.name,
      'Rotation',
    );
  },
);

mainTest(
  qase(2200, 'Apply "max/min size" token to an image (by right click)'),
  async ({ page }) => {
    const mainPage: MainPage = new MainPage(page);
    const tokensPage: TokensPage = new TokensPage(page);
    const designPanelPage: DesignPanelPage = new DesignPanelPage(page);
    const layersPanelPage: LayersPanelPage = new LayersPanelPage(page);

    const sizingToken: MainToken<TokenClass> = {
      class: TokenClass.Sizing,
      name: 'global.sizing',
      value: '200',
    };

    await mainPage.uploadImage('images/mini_sample.jpg');
    await tokensPage.clickTokensTab();
    await tokensPage.tokensComp.createTokenViaAddButtonAndSave(sizingToken);
    await tokensPage.mainTokensComp.isTokenVisibleWithName(sizingToken.name);
    await tokensPage.mainTokensComp.selectMenuItem(sizingToken.name, 'Max Width');
    await tokensPage.mainTokensComp.selectMenuItem(sizingToken.name, 'Min Height');
    await mainPage.waitForChangeIsSaved();
    await tokensPage.mainTokensComp.isTokenAppliedWithName(sizingToken.name);
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
    await designPanelPage.checkFlexElementMinMax('Width', false, sizingToken.value);
    await designPanelPage.checkFlexElementMinMax('Height', true, sizingToken.value);
    await tokensPage.clickTokensTab();
    await tokensPage.mainTokensComp.isMenuItemWithNameSelected(
      sizingToken.name,
      'Max Width',
    );
    await tokensPage.mainTokensComp.isMenuItemWithNameSelected(
      sizingToken.name,
      'Min Height',
    );
  },
);

mainTest(
  qase(2202, 'Apply default "all gaps" token to a grid board (by left click)'),
  async ({ page }) => {
    const mainPage: MainPage = new MainPage(page);
    const tokensPage: TokensPage = new TokensPage(page);
    const designPanelPage: DesignPanelPage = new DesignPanelPage(page);

    const spacingToken: MainToken<TokenClass> = {
      class: TokenClass.Spacing,
      name: 'global.spacing',
      value: '-20',
    };

    await mainPage.createDefaultBoardByCoordinates(320, 210);
    await mainPage.addGridLayoutViaRightClick();
    await designPanelPage.isLayoutRemoveButtonExists();
    await mainPage.clickViewportOnce();
    await mainPage.clickCreatedBoardTitleOnCanvas();
    await tokensPage.clickTokensTab();
    await tokensPage.tokensComp.createTokenViaAddButtonAndSave(spacingToken);

    await tokensPage.mainTokensComp.isTokenVisibleWithName(spacingToken.name);
    await tokensPage.mainTokensComp.clickOnTokenWithName(spacingToken.name);
    await mainPage.waitForChangeIsSaved();
    await tokensPage.mainTokensComp.isTokenAppliedWithName(spacingToken.name);
    await designPanelPage.checkRowGap(spacingToken.value);
    await designPanelPage.checkColumnGap(spacingToken.value);
    await expect(mainPage.createdLayer).toHaveScreenshot('board-spacing-20.png');
    await tokensPage.mainTokensComp.isAllMenuItemWithSectionNameSelected(
      spacingToken.name,
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

    const strokeToken: MainToken<TokenClass> = {
      class: TokenClass.StrokeWidth,
      name: 'global.stroke',
      value: '5.5',
    };

    await mainPage.createDefaultOpenPath();
    await tokensPage.clickTokensTab();
    await tokensPage.tokensComp.createTokenViaAddButtonAndSave(strokeToken);
    await tokensPage.mainTokensComp.isTokenVisibleWithName(strokeToken.name);
    await tokensPage.mainTokensComp.clickOnTokenWithName(strokeToken.name);
    await mainPage.waitForChangeIsSaved();
    await tokensPage.mainTokensComp.isTokenAppliedWithName(strokeToken.name);
    await designPanelPage.checkStrokeWidth(strokeToken.value);
    await expect(mainPage.createdLayer).toHaveScreenshot(
      'path-stroke-width-5-5.png',
    );
    await tokensPage.mainTokensComp.isMenuItemWithNameSelected(
      strokeToken.name,
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

    const dimensionToken: MainToken<TokenClass> = {
      class: TokenClass.Dimension,
      name: 'global.dimension',
      value: '550.5',
    };

    const defaultX = '100';
    const defaultY = '200';

    await mainPage.createDefaultTextLayerByCoordinates(
      parseInt(defaultX),
      parseInt(defaultY),
      browserName,
    );
    await tokensPage.clickTokensTab();
    await tokensPage.tokensComp.createTokenViaAddButtonAndSave(dimensionToken);
    await tokensPage.mainTokensComp.isTokenVisibleWithName(dimensionToken.name);
    await designPanelPage.checkXAxis(defaultX);
    await designPanelPage.checkYAxis(defaultY);
    await tokensPage.mainTokensComp.selectMenuItem(dimensionToken.name, 'AxisX');
    await tokensPage.mainTokensComp.isTokenAppliedWithName(dimensionToken.name);
    await designPanelPage.checkXAxis(dimensionToken.value);
    await designPanelPage.checkYAxis(defaultY);
    await tokensPage.mainTokensComp.selectMenuItem(dimensionToken.name, 'Y');
    await tokensPage.mainTokensComp.isTokenAppliedWithName(dimensionToken.name);
    await designPanelPage.checkXAxis(dimensionToken.value);
    await designPanelPage.checkYAxis(dimensionToken.value);
    await tokensPage.mainTokensComp.isMenuItemWithNameSelected(
      dimensionToken.name,
      'AxisX',
    );
    await tokensPage.mainTokensComp.isMenuItemWithNameSelected(
      dimensionToken.name,
      'Y',
    );
  },
);

mainTest(
  qase(2224, 'Apply 2 different kind of tokens overriding the same shape property'),
  async ({ page }) => {
    const mainPage: MainPage = new MainPage(page);
    const tokensPage: TokensPage = new TokensPage(page);
    const designPanelPage: DesignPanelPage = new DesignPanelPage(page);

    const sizingToken: MainToken<TokenClass> = {
      class: TokenClass.Sizing,
      name: 'global.sizing',
      value: '200',
    };
    const dimensionToken: MainToken<TokenClass> = {
      class: TokenClass.Dimension,
      name: 'global.dimension',
      value: '100',
    };

    await mainPage.createDefaultEllipseByCoordinates(100, 200);
    await tokensPage.clickTokensTab();
    await tokensPage.tokensComp.createTokenViaAddButtonAndSave(dimensionToken);
    await tokensPage.mainTokensComp.isTokenVisibleWithName(dimensionToken.name);
    await tokensPage.tokensComp.createTokenViaAddButtonAndSave(sizingToken);
    await tokensPage.mainTokensComp.isTokenVisibleWithName(sizingToken.name);

    await tokensPage.mainTokensComp.clickOnTokenWithName(sizingToken.name);
    await designPanelPage.checkSizeWidth(sizingToken.value);
    await designPanelPage.checkSizeHeight(sizingToken.value);
    await tokensPage.mainTokensComp.isTokenAppliedWithName(sizingToken.name);
    await tokensPage.mainTokensComp.isTokenAppliedWithName(
      dimensionToken.name,
      false,
    );
    await tokensPage.mainTokensComp.isMenuItemWithNameSelected(
      sizingToken.name,
      'SizeAll',
    );
    await mainPage.clickBoardOnCanvas();

    await tokensPage.mainTokensComp.clickOnTokenWithName(dimensionToken.name);
    await designPanelPage.checkSizeWidth(dimensionToken.value);
    await designPanelPage.checkSizeHeight(dimensionToken.value);
    await tokensPage.mainTokensComp.isTokenAppliedWithName(dimensionToken.name);
    await tokensPage.mainTokensComp.isTokenAppliedWithName(sizingToken.name, false);
    await tokensPage.mainTokensComp.isAllSubMenuItemWithSectionNameSelected(
      dimensionToken.name,
      'Sizing',
      'Size',
    );
    await mainPage.clickBoardOnCanvas();

    await tokensPage.mainTokensComp.selectMenuItem(sizingToken.name, 'Height');
    await tokensPage.mainTokensComp.isTokenAppliedWithName(dimensionToken.name);
    await tokensPage.mainTokensComp.isTokenAppliedWithName(sizingToken.name);
    await designPanelPage.checkSizeWidth(dimensionToken.value);
    await designPanelPage.checkSizeHeight(sizingToken.value);
    await tokensPage.mainTokensComp.isMenuItemWithNameSelected(
      sizingToken.name,
      'Height',
    );
    await mainPage.clickBoardOnCanvas();
    await tokensPage.mainTokensComp.isSubMenuItemWithNameSelected(
      dimensionToken.name,
      'Sizing',
      'Width',
    );
    await mainPage.clickBoardOnCanvas();
  },
);

mainTest.describe(() => {
  let mainPage: MainPage;
  let tokensPage: TokensPage;

  const fontSizeToken: MainToken<TokenClass> = {
    class: TokenClass.FontSize,
    name: 'global.fontSize',
    value: '60',
  };

  const updatedTokenData: MainToken<TokenClass> = {
    class: TokenClass.FontSize,
    name: fontSizeToken.name,
    value: '120',
    description: '120',
  };

  mainTest.beforeEach(async ({ page, browserName }) => {
    mainPage = new MainPage(page);
    tokensPage = new TokensPage(page);

    await mainPage.createDefaultTextLayerByCoordinates(100, 200, browserName);
    await tokensPage.clickTokensTab();
    await tokensPage.tokensComp.createTokenViaAddButtonAndEnter(fontSizeToken);
    await tokensPage.mainTokensComp.isTokenVisibleWithName(fontSizeToken.name);
  });

  mainTest(qase(2358, 'Create a font size token'), async () => {
    await tokensPage.mainTokensComp.isTokenVisibleWithName(fontSizeToken.name);
  });

  mainTest(qase(2359, 'Apply a font size token'), async () => {
    await tokensPage.mainTokensComp.clickOnTokenWithName(fontSizeToken.name);
    await mainPage.waitForChangeIsSaved();
    await tokensPage.mainTokensComp.isTokenAppliedWithName(fontSizeToken.name);
    await mainPage.waitForResizeHandlerVisible();
    await expect(mainPage.createdLayer).toHaveScreenshot('text-font-size-60.png');
  });

  mainTest(qase(2360, 'Detachment font size token'), async ({ browserName }) => {
    await tokensPage.mainTokensComp.clickOnTokenWithName(fontSizeToken.name);
    await mainPage.waitForChangeIsSaved();
    await tokensPage.mainTokensComp.isTokenAppliedWithName(fontSizeToken.name);
    await mainPage.createDefaultTextLayerByCoordinates(100, 600, browserName);
    await mainPage.waitForChangeIsSaved();
    await tokensPage.mainTokensComp.clickOnTokenWithName(fontSizeToken.name);
    await mainPage.waitForChangeIsSaved();
    await tokensPage.mainTokensComp.isTokenAppliedWithName(fontSizeToken.name);
    await mainPage.clickViewportByCoordinates(120, 220);
    await tokensPage.mainTokensComp.clickOnTokenWithName(fontSizeToken.name);
    await mainPage.waitForChangeIsSaved();
    await tokensPage.mainTokensComp.isTokenAppliedWithName(
      fontSizeToken.name,
      false,
    );
    await tokensPage.tokensComp.editTokenViaRightClickAndSave(updatedTokenData);
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

    const colorToken1: MainToken<TokenClass> = {
      class: TokenClass.Color,
      name: 'color1',
      value: sampleData.color.getRandomHexCode(),
    };
    const colorToken2: MainToken<TokenClass> = {
      class: TokenClass.Color,
      name: 'color2',
      value: sampleData.color.blueHexCode,
    };
    const colorToken3: MainToken<TokenClass> = {
      class: TokenClass.Color,
      name: 'color3',
      value: sampleData.color.greenHexCode,
    };

    await tokensPage.clickTokensTab();
    await tokensPage.tokensComp.createTokenViaAddButtonAndSave(colorToken1);
    await tokensPage.mainTokensComp.isTokenVisibleWithName(colorToken1.name);
    await tokensPage.tokensComp.createTokenViaAddButtonAndEnter(colorToken2);
    await tokensPage.mainTokensComp.isTokenVisibleWithName(colorToken2.name);

    await mainPage.createDefaultTextLayerByCoordinates(100, 200, browserName);
    await mainPage.waitForChangeIsSaved();
    await mainPage.waitForResizeHandlerVisible();
    await tokensPage.mainTokensComp.clickOnTokenWithName(colorToken1.name);
    await tokensPage.mainTokensComp.isTokenAppliedWithName(colorToken1.name);
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
    await tokensPage.mainTokensComp.clickOnTokenWithName(colorToken2.name);
    await tokensPage.mainTokensComp.isTokenAppliedWithName(colorToken2.name);
    await layersPanelPage.openLayersTab();
    await layersPanelPage.clickMainComponentOnLayersTab();
    await layersPanelPage.selectMainComponentChildLayer();

    await designPanelPage.clickFillColorIcon();
    await colorPalettePage.setHex(colorToken3.value);
    await layersPanelPage.selectMainComponentChildLayer();
    await mainPage.waitForChangeIsSaved();
    await designPanelPage.isFillHexCodeSet(colorToken3.value);

    await tokensPage.clickTokensTab();
    await tokensPage.mainTokensComp.isTokenAppliedWithName(colorToken1.name, false);
    await layersPanelPage.openLayersTab();
    await layersPanelPage.clickCopyComponentOnLayersTab();
    await layersPanelPage.selectCopyComponentChildLayer();
    await tokensPage.clickTokensTab();
    await tokensPage.mainTokensComp.isTokenAppliedWithName(colorToken2.name, true);

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

  const fontFamilyToken: MainToken<TokenClass> = {
    class: TokenClass.FontFamily,
    name: 'global.font.family',
    value: 'Actor',
  };

  const fontFamilyTokenRef: MainToken<TokenClass> = {
    class: TokenClass.FontFamily,
    name: 'global.font.family2',
    value: `{${fontFamilyToken.name}}`,
  };
  const updatedTokenData: MainToken<TokenClass> = {
    class: TokenClass.FontFamily,
    name: fontFamilyToken.name,
    value: 'Inter',
  };

  mainTest.beforeEach(async ({ page, browserName }) => {
    mainPage = new MainPage(page);
    tokensPage = new TokensPage(page);
    designPanelPage = new DesignPanelPage(page);

    await mainPage.createDefaultTextLayerByCoordinates(100, 200, browserName);
    await tokensPage.clickTokensTab();
    await tokensPage.tokensComp.createTokenViaAddButtonAndSave(fontFamilyToken);
    await tokensPage.mainTokensComp.isTokenVisibleWithName(fontFamilyToken.name);
    await tokensPage.mainTokensComp.clickOnTokenWithName(fontFamilyToken.name);
    await mainPage.waitForChangeIsSaved();
  });

  mainTest(qase(2472, 'Apply a font family token'), async () => {
    await tokensPage.mainTokensComp.isTokenAppliedWithName(fontFamilyToken.name);
    await designPanelPage.checkFontName(fontFamilyToken.value);
  });

  mainTest(qase(2475, 'Edit a font family token'), async () => {
    await tokensPage.mainTokensComp.isTokenAppliedWithName(fontFamilyToken.name);
    await tokensPage.tokensComp.editTokenViaRightClickAndSave(updatedTokenData);
    await mainPage.waitForChangeIsSaved();
    await designPanelPage.checkFontName(updatedTokenData.value);
    await tokensPage.mainTokensComp.isTokenAppliedWithName(fontFamilyToken.name);
    await tokensPage.mainTokensComp.checkAppliedTokenTitle(
      'Token: global.font.family\n' +
        'Original value: Inter\n' +
        'Resolved value: Inter',
    );
  });

  mainTest(qase(2506, 'Reference a font family token'), async () => {
    await tokensPage.mainTokensComp.isTokenAppliedWithName(fontFamilyToken.name);
    await designPanelPage.checkFontName(fontFamilyToken.value);

    await tokensPage.tokensComp.createTokenViaAddButtonAndEnter(fontFamilyTokenRef);
    await tokensPage.mainTokensComp.isTokenVisibleWithName(fontFamilyTokenRef.name);
    await tokensPage.mainTokensComp.clickOnTokenWithName(fontFamilyTokenRef.name);
    await tokensPage.tokensComp.editTokenViaRightClickAndSave(updatedTokenData);
    await mainPage.waitForChangeIsSaved();
    await designPanelPage.checkFontName(updatedTokenData.value);
    await tokensPage.mainTokensComp.isTokenAppliedWithName(fontFamilyTokenRef.name);
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
      const fontWeightToken1: MainToken<TokenClass> = {
        class: TokenClass.FontWeight,
        name: 'extra.black.font.weight',
        value: 'extra-black',
      };

      const fontWeightToken2: MainToken<TokenClass> = {
        class: TokenClass.FontWeight,
        name: '500.italic.font.weight',
        value: '500 italic',
      };

      await tokensPage.tokensComp.createTokenViaAddButtonAndEnter(fontWeightToken1);
      await tokensPage.mainTokensComp.isTokenVisibleWithName(fontWeightToken1.name);
      await tokensPage.tokensComp.createTokenViaAddButtonAndEnter(fontWeightToken2);
      await tokensPage.mainTokensComp.isTokenVisibleWithName(fontWeightToken2.name);

      await tokensPage.mainTokensComp.clickOnTokenWithName(fontWeightToken1.name);
      await mainPage.checkImportErrorMessage(
        `Error setting font weight/style. This font style does not exist in the current font`,
      );
      await mainPage.closeModalWindow();
      await mainPage.isImportErrorMessageVisible(false);
      await mainPage.waitForChangeIsSaved();
      await tokensPage.mainTokensComp.isTokenAppliedWithName(fontWeightToken1.name);
      await designPanelPage.checkFontStyle('900');

      await tokensPage.mainTokensComp.clickOnTokenWithName(fontWeightToken2.name);
      await mainPage.checkImportErrorMessage(
        `Error setting font weight/style. This font style does not exist in the current font`,
      );
      await mainPage.waitForChangeIsSaved();
      await tokensPage.mainTokensComp.isTokenAppliedWithName(fontWeightToken2.name);
      await designPanelPage.checkFontStyle('400 Italic');
    },
  );

  mainTest(
    qase(
      2559,
      'Apply a Font Weight token to a text not matching a family font style, with no fallback value',
    ),
    async () => {
      const fontWeightToken: MainToken<TokenClass> = {
        class: TokenClass.FontWeight,
        name: 'extra.black.font.weight',
        value: '500',
      };

      await tokensPage.tokensComp.createTokenViaAddButtonAndEnter(fontWeightToken);
      await tokensPage.mainTokensComp.isTokenVisibleWithName(fontWeightToken.name);

      await designPanelPage.changeTextFont('Splash');
      await tokensPage.mainTokensComp.clickOnTokenWithName(fontWeightToken.name);
      await mainPage.checkImportErrorMessage(
        `Error setting font weight/style. This font style does not exist in the current font`,
      );
      await mainPage.waitForChangeIsSaved();
      await tokensPage.mainTokensComp.isTokenAppliedWithName(fontWeightToken.name);
      await designPanelPage.checkFontStyle('400');
    },
  );

  mainTest(
    qase(
      2562,
      'Edit the value of a Font Weight token already applied to a component text with duplicated copies',
    ),
    async ({ browserName }) => {
      const fontWeightToken: MainToken<TokenClass> = {
        class: TokenClass.FontWeight,
        name: '700.italic.font.weight',
        value: '700 Italic',
      };

      const updatedTokenData: MainToken<TokenClass> = {
        class: TokenClass.FontWeight,
        name: fontWeightToken.name,
        value: '200',
      };

      await tokensPage.tokensComp.createTokenViaAddButtonAndEnter(fontWeightToken);
      await tokensPage.mainTokensComp.isTokenVisibleWithName(fontWeightToken.name);
      await tokensPage.mainTokensComp.clickOnTokenWithName(fontWeightToken.name);
      await mainPage.waitForChangeIsSaved();
      await tokensPage.mainTokensComp.isTokenAppliedWithName(fontWeightToken.name);
      await designPanelPage.checkFontStyle('700 Italic');

      await mainPage.createComponentViaRightClick();
      await mainPage.waitForChangeIsSaved();
      await mainPage.copyLayerViaRightClick();
      await mainPage.pressPasteShortcut(browserName);
      await mainPage.waitForChangeIsSaved();

      await tokensPage.tokensComp.editTokenViaRightClickAndSave(updatedTokenData);
      await mainPage.waitForChangeIsSaved();

      await layersPanelPage.openLayersTab();
      await layersPanelPage.selectMainComponentChildLayer();
      await designPanelPage.checkFontStyle(updatedTokenData.value);
      await layersPanelPage.selectCopyComponentChildLayer();
      await designPanelPage.checkFontStyle(updatedTokenData.value);
    },
  );
});

mainTest.describe(() => {
  let mainPage: MainPage;
  let tokensPage: TokensPage;
  let designPanelPage: DesignPanelPage;
  let assetsPanelPage: AssetsPanelPage;

  const letterSpacingToken: MainToken<TokenClass> = {
    class: TokenClass.LetterSpacing,
    name: 'global.letter.spacing',
    value: '10',
  };
  const newTokenValue = '5';

  mainTest.beforeEach(async ({ page, browserName }) => {
    mainPage = new MainPage(page);
    tokensPage = new TokensPage(page);
    designPanelPage = new DesignPanelPage(page);
    assetsPanelPage = new AssetsPanelPage(page);

    await mainPage.createDefaultTextLayerByCoordinates(100, 200, browserName);
    await tokensPage.clickTokensTab();
    await tokensPage.tokensComp.createTokenViaAddButtonAndSave(letterSpacingToken);
    await tokensPage.mainTokensComp.isTokenVisibleWithName(letterSpacingToken.name);
    await tokensPage.mainTokensComp.clickOnTokenWithName(letterSpacingToken.name);
    await mainPage.waitForChangeIsSaved();
  });

  mainTest(
    qase(2500, 'Apply a Letter Spacing token and override value from Design tab'),
    async () => {
      await tokensPage.mainTokensComp.isTokenAppliedWithName(
        letterSpacingToken.name,
      );
      await designPanelPage.checkLetterSpacing(letterSpacingToken.value);
      await designPanelPage.changeTextLetterSpacing(newTokenValue);
      await mainPage.waitForChangeIsSaved();
      await tokensPage.mainTokensComp.isTokenAppliedWithName(
        letterSpacingToken.name,
        false,
      );
      await designPanelPage.checkLetterSpacing(newTokenValue);
    },
  );

  mainTest(
    qase(
      2501,
      'Letter Spacing token value can be override by Assets > Typography style',
    ),
    async () => {
      await tokensPage.mainTokensComp.isTokenAppliedWithName(
        letterSpacingToken.name,
      );
      await designPanelPage.checkLetterSpacing(letterSpacingToken.value);

      await assetsPanelPage.clickAssetsTab();
      await assetsPanelPage.clickAddFileLibraryTypographyButton();
      await assetsPanelPage.waitForChangeIsSaved();
      await assetsPanelPage.selectLetterSpacing(newTokenValue);
      await designPanelPage.clickOnEnter();
      await assetsPanelPage.waitForChangeIsSaved();

      await tokensPage.clickTokensTab();
      await designPanelPage.clickOnTypographyMenuButton();
      await tokensPage.mainTokensComp.isTokenAppliedWithName(
        letterSpacingToken.name,
        false,
      );
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

    const dimensionToken: MainToken<TokenClass> = {
      class: TokenClass.Dimension,
      name: 'global.dimension',
      value: '2',
    };
    const letterSpacingToken: MainToken<TokenClass> = {
      class: TokenClass.LetterSpacing,
      name: 'global.letter.spacing',
      value: `5px*{${dimensionToken.name}}`,
    };

    const updatedTokenData: MainToken<TokenClass> = {
      class: TokenClass.LetterSpacing,
      name: letterSpacingToken.name,
      value: `5px/{${dimensionToken.name}}`,
    };

    await tokensPage.clickTokensTab();
    await tokensPage.tokensComp.createTokenViaAddButtonAndSave(dimensionToken);

    await tokensPage.tokensComp.createTokenViaAddButtonAndSave(letterSpacingToken);
    await tokensPage.mainTokensComp.isTokenVisibleWithName(letterSpacingToken.name);
    await mainPage.waitForChangeIsSaved();
    await tokensPage.mainTokensComp.checkTokenTitle(
      letterSpacingToken.name,
      `Token: ${letterSpacingToken.name}\n` +
        `Original value: ${letterSpacingToken.value}\n` +
        'Resolved value: 10',
    );

    await tokensPage.tokensComp.editTokenViaRightClickAndSave(updatedTokenData);
    await tokensPage.mainTokensComp.isTokenVisibleWithName(letterSpacingToken.name);
    await mainPage.waitForChangeIsSaved();
    await tokensPage.mainTokensComp.checkTokenTitle(
      letterSpacingToken.name,
      `Token: ${letterSpacingToken.name}\n` +
        `Original value: ${updatedTokenData.value}\n` +
        'Resolved value: 2.5',
    );

    updatedTokenData.value = `5px+{${dimensionToken.name}}`;
    await tokensPage.tokensComp.editTokenViaRightClickAndSave(updatedTokenData);
    await tokensPage.mainTokensComp.isTokenVisibleWithName(letterSpacingToken.name);
    await mainPage.waitForChangeIsSaved();
    await tokensPage.mainTokensComp.checkTokenTitle(
      letterSpacingToken.name,
      `Token: ${letterSpacingToken.name}\n` +
        `Original value: ${updatedTokenData.value}\n` +
        'Resolved value: 7',
    );

    updatedTokenData.value = `5px-{${dimensionToken.name}}`;
    await tokensPage.tokensComp.editTokenViaRightClickAndSave(updatedTokenData);
    await tokensPage.mainTokensComp.isTokenVisibleWithName(letterSpacingToken.name);
    await mainPage.waitForChangeIsSaved();
    await tokensPage.mainTokensComp.checkTokenTitle(
      letterSpacingToken.name,
      `Token: ${letterSpacingToken.name}\n` +
        `Original value: ${updatedTokenData.value}\n` +
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

    const numberToken: MainToken<TokenClass> = {
      class: TokenClass.Number,
      name: 'numberToken',
      value: '2',
    };
    const numberTokenRef: MainToken<TokenClass> = {
      class: TokenClass.Number,
      name: 'global.number',
      value: `5*{${numberToken.name}}`,
    };

    const updatedTokenData: MainToken<TokenClass> = {
      class: TokenClass.Number,
      name: numberTokenRef.name,
      value: `5/{${numberToken.name}}`,
    };

    await tokensPage.clickTokensTab();
    await tokensPage.tokensComp.createTokenViaAddButtonAndEnter(numberToken);
    await mainPage.waitForChangeIsSaved();

    await tokensPage.tokensComp.createTokenViaAddButtonAndSave(numberTokenRef);
    await tokensPage.mainTokensComp.isTokenVisibleWithName(numberTokenRef.name);
    await mainPage.waitForChangeIsSaved();
    await tokensPage.mainTokensComp.checkTokenTitle(
      numberTokenRef.name,
      `Token: ${numberTokenRef.name}\n` +
        `Original value: 5*{${numberToken.name}}\n` +
        'Resolved value: 10\n' +
        'Right click to see options',
    );

    await tokensPage.tokensComp.editTokenViaRightClickAndSave(updatedTokenData);
    await tokensPage.mainTokensComp.isTokenVisibleWithName(numberTokenRef.name);
    await mainPage.waitForChangeIsSaved();
    await tokensPage.mainTokensComp.checkTokenTitle(
      numberTokenRef.name,
      `Token: ${numberTokenRef.name}\n` +
        `Original value: ${updatedTokenData.value}\n` +
        'Resolved value: 2.5\n' +
        'Right click to see options',
    );

    updatedTokenData.value = `5+{${numberToken.name}}`;
    await tokensPage.tokensComp.editTokenViaRightClickAndSave(updatedTokenData);
    await tokensPage.mainTokensComp.isTokenVisibleWithName(numberTokenRef.name);
    await mainPage.waitForChangeIsSaved();
    await tokensPage.mainTokensComp.checkTokenTitle(
      numberTokenRef.name,
      `Token: ${numberTokenRef.name}\n` +
        `Original value: ${updatedTokenData.value}\n` +
        'Resolved value: 7\n' +
        'Right click to see options',
    );

    updatedTokenData.value = `5-{${numberToken.name}}`;
    await tokensPage.tokensComp.editTokenViaRightClickAndSave(updatedTokenData);
    await tokensPage.mainTokensComp.isTokenVisibleWithName(numberTokenRef.name);
    await mainPage.waitForChangeIsSaved();
    await tokensPage.mainTokensComp.checkTokenTitle(
      numberTokenRef.name,
      `Token: ${numberTokenRef.name}\n` +
        `Original value: ${updatedTokenData.value}\n` +
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

    const numberToken: MainToken<TokenClass> = {
      class: TokenClass.Number,
      name: 'global.number',
      value: '45',
    };
    const newTokenValue = '0';

    await mainPage.createDefaultRectangleByCoordinates(320, 210);
    await tokensPage.clickTokensTab();

    await tokensPage.tokensComp.createTokenViaAddButtonAndEnter(numberToken);
    await tokensPage.mainTokensComp.isTokenVisibleWithName(numberToken.name);
    await tokensPage.mainTokensComp.selectMenuItem(numberToken.name, 'Rotation');
    await mainPage.waitForChangeIsSaved();
    await tokensPage.mainTokensComp.isTokenAppliedWithName(numberToken.name);
    await tokensPage.mainTokensComp.isMenuItemWithNameSelected(
      numberToken.name,
      'Rotation',
    );
    await designPanelPage.checkRotationForLayer(numberToken.value);

    await designPanelPage.changeRotationForLayer(newTokenValue);
    await mainPage.waitForChangeIsSaved();
    await tokensPage.mainTokensComp.isTokenAppliedWithName(numberToken.name, false);
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

    const numberToken: MainToken<TokenClass> = {
      class: TokenClass.Number,
      name: 'global.number',
      value: '2',
    };
    const newTokenValue = '1';

    await mainPage.createDefaultTextLayerByCoordinates(100, 200, browserName);
    await tokensPage.clickTokensTab();

    await tokensPage.tokensComp.createTokenViaAddButtonAndEnter(numberToken);
    await tokensPage.mainTokensComp.isTokenVisibleWithName(numberToken.name);
    await tokensPage.mainTokensComp.selectMenuItem(numberToken.name, 'Line Height');
    await mainPage.waitForChangeIsSaved();
    await tokensPage.mainTokensComp.isTokenAppliedWithName(numberToken.name);
    await tokensPage.mainTokensComp.isMenuItemWithNameSelected(
      numberToken.name,
      'Line Height',
    );
    await designPanelPage.checkTextLineHeight(numberToken.value);

    await designPanelPage.changeTextLineHeight(newTokenValue);
    await mainPage.waitForChangeIsSaved();
    await tokensPage.mainTokensComp.isTokenAppliedWithName(numberToken.name, false);
    await designPanelPage.checkTextLineHeight(newTokenValue);
  },
);

mainTest(
  qase(2522, 'Apply a capitalize text case token to a uppercase text layer'),
  async ({ page }) => {
    const mainPage: MainPage = new MainPage(page);
    const tokensPage: TokensPage = new TokensPage(page);
    const designPanelPage: DesignPanelPage = new DesignPanelPage(page);

    const textCaseToken: MainToken<TokenClass> = {
      class: TokenClass.TextCase,
      name: 'text-case-capitalize',
      value: 'Capitalize',
    };
    const text = 'EXAMPLE TEXT';

    await mainPage.createTextLayerByCoordinates(100, 200, text);
    await tokensPage.clickTokensTab();
    await tokensPage.tokensComp.createTokenViaAddButtonAndSave(textCaseToken);
    await tokensPage.mainTokensComp.isTokenVisibleWithName(textCaseToken.name);
    await tokensPage.mainTokensComp.clickOnTokenWithName(textCaseToken.name);
    await mainPage.waitForChangeIsSaved();
    await tokensPage.mainTokensComp.isTokenAppliedWithName(textCaseToken.name);
    await designPanelPage.checkTextCase(textCaseToken.value);
  },
);

mainTest(qase(2520, 'Override and re-apply a text case token'), async ({ page }) => {
  const mainPage: MainPage = new MainPage(page);
  const tokensPage: TokensPage = new TokensPage(page);
  const designPanelPage: DesignPanelPage = new DesignPanelPage(page);
  const assetsPanelPage: AssetsPanelPage = new AssetsPanelPage(page);

  const textCaseToken: MainToken<TokenClass> = {
    class: TokenClass.TextCase,
    name: 'text-case-capitalize',
    value: 'Capitalize',
  };
  const text = 'EXAMPLE TEXT';

  await assetsPanelPage.clickAssetsTab();
  await assetsPanelPage.clickAddFileLibraryTypographyButton();
  await assetsPanelPage.selectTextCase('Upper');
  await assetsPanelPage.minimizeFileLibraryTypography();
  await assetsPanelPage.waitForChangeIsSaved();

  await tokensPage.clickTokensTab();
  await mainPage.createTextLayerByCoordinates(100, 200, text);
  await tokensPage.tokensComp.createTokenViaAddButtonAndSave(textCaseToken);
  await tokensPage.mainTokensComp.isTokenVisibleWithName(textCaseToken.name);
  await tokensPage.mainTokensComp.clickOnTokenWithName(textCaseToken.name);
  await mainPage.waitForChangeIsSaved();

  await tokensPage.mainTokensComp.isTokenAppliedWithName(textCaseToken.name);
  await designPanelPage.checkTextCase(textCaseToken.value);

  await assetsPanelPage.clickAssetsTab();
  await assetsPanelPage.clickFileLibraryTypographiesTypographyRecord();
  await mainPage.waitForChangeIsSaved();
  await designPanelPage.clickOnTypographyMenuButton();
  await designPanelPage.checkTextCase('Upper');

  await tokensPage.clickTokensTab();
  await tokensPage.mainTokensComp.isTokenAppliedWithName(textCaseToken.name, false);

  await tokensPage.mainTokensComp.clickOnTokenWithName(textCaseToken.name);
  await mainPage.waitForChangeIsSaved();
  await tokensPage.mainTokensComp.isTokenAppliedWithName(textCaseToken.name);
  await designPanelPage.checkTextCase(textCaseToken.value);

  await designPanelPage.changeTextCase('Lower');
  await mainPage.waitForChangeIsSaved();
  await tokensPage.mainTokensComp.isTokenAppliedWithName(textCaseToken.name, false);
  await designPanelPage.checkTextCase('Lower');
});

mainTest.describe(() => {
  let mainPage: MainPage;
  let tokensPage: TokensPage;
  let designPanelPage: DesignPanelPage;

  const decorationToken: MainToken<TokenClass> = {
    class: TokenClass.TextDecoration,
    name: 'global.text.decoration',
    value: 'underline',
  };

  const updatedTokenData: MainToken<TokenClass> = {
    class: TokenClass.TextDecoration,
    name: decorationToken.name,
    value: 'strike-through',
  };

  mainTest.beforeEach(async ({ page, browserName }) => {
    mainPage = new MainPage(page);
    tokensPage = new TokensPage(page);
    designPanelPage = new DesignPanelPage(page);

    await mainPage.createDefaultTextLayerByCoordinates(100, 200, browserName);
    await tokensPage.clickTokensTab();
    await tokensPage.tokensComp.createTokenViaAddButtonAndSave(decorationToken);
    await tokensPage.mainTokensComp.isTokenVisibleWithName(decorationToken.name);
    await tokensPage.mainTokensComp.clickOnTokenWithName(decorationToken.name);
    await mainPage.waitForChangeIsSaved();
  });

  mainTest(qase(2531, 'Edit a Text decoration token'), async () => {
    await tokensPage.mainTokensComp.isTokenAppliedWithName(decorationToken.name);
    await tokensPage.tokensComp.editTokenViaRightClickAndSave(updatedTokenData);
    await mainPage.waitForChangeIsSaved();
    await tokensPage.mainTokensComp.isTokenAppliedWithName(decorationToken.name);
    await designPanelPage.isTextStrikethroughChecked();
  });

  mainTest(
    qase(2535, 'Re-Apply the token after change the decorator manually'),
    async () => {
      await tokensPage.mainTokensComp.isTokenAppliedWithName(decorationToken.name);
      await designPanelPage.isTextUnderlineChecked();
      await designPanelPage.clickOnTextStrikethroughButton();
      await mainPage.waitForChangeIsSaved();
      await tokensPage.mainTokensComp.isTokenAppliedWithName(
        decorationToken.name,
        false,
      );
      await designPanelPage.isTextStrikethroughChecked();
      await tokensPage.mainTokensComp.clickOnTokenWithName(decorationToken.name);
      await mainPage.waitForChangeIsSaved();
      await tokensPage.mainTokensComp.isTokenAppliedWithName(decorationToken.name);
      await designPanelPage.isTextUnderlineChecked();
    },
  );
});
