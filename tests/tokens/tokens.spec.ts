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
    name: 'border-radius',
    value: '10',
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
    await tokensPage.tokensComp.isTokenVisibleWithName(radiusToken.name);
    await tokensPage.tokensComp.clickOnTokenWithName(radiusToken.name);
    await mainPage.waitForChangeIsSaved();
  });

  mainTest(
    qase(2125, 'Apply default "all radius" token to a rectangle (by left click)'),
    async ({ page }) => {
      tokensPage = new TokensPage(page);

      await tokensPage.tokensComp.isTokenAppliedWithName(radiusToken.name);
      await designPanelPage.checkGeneralCornerRadius(radiusToken.value);
      await expect(mainPage.viewport).toHaveScreenshot(
        'rectangle-border-radius-1.png',
        {
          mask: mainPage.maskViewport(),
        },
      );
      await tokensPage.tokensComp.isMenuItemWithNameSelected(
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
        name: 'border-radius',
        value: '-1',
        description: 'Description',
      };

      const updatedTokenData: MainToken<TokenClass> = {
        class: TokenClass.BorderRadius,
        name: radiusToken.name,
        value: newTokenValue,
      };

      await tokensPage.tokensComp.isTokenAppliedWithName(radiusToken.name);
      await tokensPage.tokensComp.editTokenViaRightClickAndSave(updatedTokenData);
      await mainPage.waitForChangeIsSaved();
      await designPanelPage.checkGeneralCornerRadius(updatedTokenData.value);
      await tokensPage.tokensComp.isTokenAppliedWithName(updatedTokenData.name);
      await expect(mainPage.viewport).toHaveScreenshot(
        'rectangle-border-radius-20.png',
        {
          mask: mainPage.maskViewport(),
        },
      );
      await tokensPage.tokensComp.checkAppliedTokenTitle(
        'Token: border-radius\n' + 'Original value: 20\n' + 'Resolved value: 20',
      );
    },
  );

  mainTest(
    qase(2136, 'Delete a token and redo deletion'),
    async ({ page, browserName }) => {
      tokensPage = new TokensPage(page);
      await tokensPage.tokensComp.isTokenAppliedWithName(radiusToken.name);
      await tokensPage.tokensComp.deleteToken(radiusToken.name);
      await tokensPage.tokensComp.isTokenVisibleWithName(radiusToken.name, false);
      await mainPage.clickShortcutCtrlZ(browserName);
      await tokensPage.tokensComp.expandTokenByName(TokenClass.BorderRadius);
      await tokensPage.tokensComp.isTokenVisibleWithName(radiusToken.name, true);
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
      name: 'opacity',
      value: '0.7',
    };

    await mainPage.uploadImage('images/sample.jpeg');
    await tokensPage.clickTokensTab();
    await tokensPage.tokensComp.createTokenViaAddButtonAndEnter(opacityToken);
    await tokensPage.tokensComp.isTokenVisibleWithName(opacityToken.name);
    await tokensPage.tokensComp.clickOnTokenWithName(opacityToken.name);
    await mainPage.waitForChangeIsSaved();
    await tokensPage.tokensComp.isTokenAppliedWithName(opacityToken.name);
    await expect(mainPage.viewport).toHaveScreenshot('image-opacity-0-7.png', {
      mask: mainPage.maskViewport(),
    });
    await tokensPage.tokensComp.isMenuItemWithNameSelected(
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
      name: 'rotation',
      value: '-(22.5+22.5)',
    };
    const tokenResolvedValue = '315'; // 315 == -45 == -(22.5+22.5)

    await mainPage.createDefaultTextLayerByCoordinates(320, 210);
    await tokensPage.clickTokensTab();
    await tokensPage.tokensComp.createTokenViaAddButtonAndEnter(rotationToken);
    await tokensPage.tokensComp.isTokenVisibleWithName(rotationToken.name);
    await tokensPage.tokensComp.clickOnTokenWithName(rotationToken.name);
    await tokensPage.tokensComp.isTokenAppliedWithName(rotationToken.name);
    await designPanelPage.checkRotationForLayer(tokenResolvedValue);
    browserName === 'chromium' ? await mainPage.waitForChangeIsUnsaved() : null;
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot('text-rotated-315.png', {
      mask: mainPage.maskViewport(),
    });
    await tokensPage.tokensComp.isMenuItemWithNameSelected(
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
      name: 'sizing',
      value: '200',
    };

    await mainPage.uploadImage('images/mini_sample.jpg');
    await tokensPage.clickTokensTab();
    await tokensPage.tokensComp.createTokenViaAddButtonAndSave(sizingToken);
    await tokensPage.tokensComp.isTokenVisibleWithName(sizingToken.name);
    await tokensPage.tokensComp.selectMenuItem(sizingToken.name, 'Max Width');
    await tokensPage.tokensComp.selectMenuItem(sizingToken.name, 'Min Height');
    await mainPage.waitForChangeIsSaved();
    await tokensPage.tokensComp.isTokenAppliedWithName(sizingToken.name);
    await expect(mainPage.viewport).toHaveScreenshot('image-max-min-size-200.png', {
      mask: mainPage.maskViewport(),
    });
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
    await expect(mainPage.viewport).toHaveScreenshot(
      'image-on-board-max-min-size-200.png',
      {
        mask: mainPage.maskViewport(),
      },
    );
    await designPanelPage.checkFlexElementMinMax('Width', false, sizingToken.value);
    await designPanelPage.checkFlexElementMinMax('Height', true, sizingToken.value);
    await tokensPage.clickTokensTab();
    await tokensPage.tokensComp.isMenuItemWithNameSelected(
      sizingToken.name,
      'Max Width',
    );
    await tokensPage.tokensComp.isMenuItemWithNameSelected(
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
      name: 'spacing',
      value: '-20',
    };

    await mainPage.createDefaultBoardByCoordinates(320, 210);
    await mainPage.addGridLayoutViaRightClick();
    await designPanelPage.isLayoutRemoveButtonExists();
    await mainPage.clickViewportOnce();
    await mainPage.clickCreatedBoardTitleOnCanvas();
    await tokensPage.clickTokensTab();
    await tokensPage.tokensComp.createTokenViaAddButtonAndSave(spacingToken);

    await tokensPage.tokensComp.isTokenVisibleWithName(spacingToken.name);
    await tokensPage.tokensComp.clickOnTokenWithName(spacingToken.name);
    await mainPage.waitForChangeIsSaved();
    await tokensPage.tokensComp.isTokenAppliedWithName(spacingToken.name);
    await designPanelPage.checkRowGap(spacingToken.value);
    await designPanelPage.checkColumnGap(spacingToken.value);
    await expect(mainPage.viewport).toHaveScreenshot('board-spacing-20.png', {
      mask: mainPage.maskViewport(),
    });
    await tokensPage.tokensComp.isAllMenuItemWithSectionNameSelected(
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
      name: 'stroke-width',
      value: '5.5',
    };

    await mainPage.createDefaultOpenPath();
    await tokensPage.clickTokensTab();
    await tokensPage.tokensComp.createTokenViaAddButtonAndSave(strokeToken);
    await tokensPage.tokensComp.isTokenVisibleWithName(strokeToken.name);
    await tokensPage.tokensComp.clickOnTokenWithName(strokeToken.name);
    await mainPage.waitForChangeIsSaved();
    await tokensPage.tokensComp.isTokenAppliedWithName(strokeToken.name);
    await designPanelPage.checkStrokeWidth(strokeToken.value);
    await expect(mainPage.viewport).toHaveScreenshot('path-stroke-width-5-5.png', {
      mask: mainPage.maskViewport(),
    });
    await tokensPage.tokensComp.isMenuItemWithNameSelected(
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
      name: 'dimension',
      value: '550.5',
    };

    const defaultX = '100';
    const defaultY = '200';

    await mainPage.createDefaultTextLayerByCoordinates(
      parseInt(defaultX),
      parseInt(defaultY),
    );
    await tokensPage.clickTokensTab();
    await tokensPage.tokensComp.createTokenViaAddButtonAndSave(dimensionToken);
    await tokensPage.tokensComp.isTokenVisibleWithName(dimensionToken.name);
    await designPanelPage.checkXAxis(defaultX);
    await designPanelPage.checkYAxis(defaultY);
    await tokensPage.tokensComp.selectMenuItem(dimensionToken.name, 'AxisX');
    await tokensPage.tokensComp.isTokenAppliedWithName(dimensionToken.name);
    await designPanelPage.checkXAxis(dimensionToken.value);
    await designPanelPage.checkYAxis(defaultY);
    await tokensPage.tokensComp.selectMenuItem(dimensionToken.name, 'Y');
    await tokensPage.tokensComp.isTokenAppliedWithName(dimensionToken.name);
    await designPanelPage.checkXAxis(dimensionToken.value);
    await designPanelPage.checkYAxis(dimensionToken.value);
    await tokensPage.tokensComp.isMenuItemWithNameSelected(
      dimensionToken.name,
      'AxisX',
    );
    await tokensPage.tokensComp.isMenuItemWithNameSelected(dimensionToken.name, 'Y');
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
      name: 'sizing',
      value: '200',
    };
    const dimensionToken: MainToken<TokenClass> = {
      class: TokenClass.Dimension,
      name: 'dimension',
      value: '100',
    };

    await mainPage.createDefaultEllipseByCoordinates(100, 200);
    await tokensPage.clickTokensTab();
    await tokensPage.tokensComp.createTokenViaAddButtonAndSave(dimensionToken);
    await tokensPage.tokensComp.isTokenVisibleWithName(dimensionToken.name);
    await tokensPage.tokensComp.createTokenViaAddButtonAndSave(sizingToken);
    await tokensPage.tokensComp.isTokenVisibleWithName(sizingToken.name);

    await tokensPage.tokensComp.clickOnTokenWithName(sizingToken.name);
    await designPanelPage.checkSizeWidth(sizingToken.value);
    await designPanelPage.checkSizeHeight(sizingToken.value);
    await tokensPage.tokensComp.isTokenAppliedWithName(sizingToken.name);
    await tokensPage.tokensComp.isTokenAppliedWithName(dimensionToken.name, false);
    await tokensPage.tokensComp.isMenuItemWithNameSelected(
      sizingToken.name,
      'SizeAll',
    );
    await mainPage.clickBoardOnCanvas();

    await tokensPage.tokensComp.clickOnTokenWithName(dimensionToken.name);
    await designPanelPage.checkSizeWidth(dimensionToken.value);
    await designPanelPage.checkSizeHeight(dimensionToken.value);
    await tokensPage.tokensComp.isTokenAppliedWithName(dimensionToken.name);
    await tokensPage.tokensComp.isTokenAppliedWithName(sizingToken.name, false);
    await tokensPage.tokensComp.isAllSubMenuItemWithSectionNameSelected(
      dimensionToken.name,
      'Sizing',
      'Size',
    );
    await mainPage.clickBoardOnCanvas();

    await tokensPage.tokensComp.selectMenuItem(sizingToken.name, 'Height');
    await tokensPage.tokensComp.isTokenAppliedWithName(dimensionToken.name);
    await tokensPage.tokensComp.isTokenAppliedWithName(sizingToken.name);
    await designPanelPage.checkSizeWidth(dimensionToken.value);
    await designPanelPage.checkSizeHeight(sizingToken.value);
    await tokensPage.tokensComp.isMenuItemWithNameSelected(
      sizingToken.name,
      'Height',
    );
    await mainPage.clickBoardOnCanvas();
    await tokensPage.tokensComp.isSubMenuItemWithNameSelected(
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
    name: 'fontSize',
    value: '60',
  };

  const updatedTokenData: MainToken<TokenClass> = {
    class: TokenClass.FontSize,
    name: fontSizeToken.name,
    value: '120',
    description: '120',
  };

  mainTest.beforeEach(async ({ page }) => {
    mainPage = new MainPage(page);
    tokensPage = new TokensPage(page);

    await mainPage.createDefaultTextLayerByCoordinates(100, 200);
    await tokensPage.clickTokensTab();
    await tokensPage.tokensComp.createTokenViaAddButtonAndEnter(fontSizeToken);
    await tokensPage.tokensComp.isTokenVisibleWithName(fontSizeToken.name);
  });

  mainTest(qase(2358, 'Create a font size token'), async () => {
    await tokensPage.tokensComp.isTokenVisibleWithName(fontSizeToken.name);
  });

  mainTest(qase(2359, 'Apply a font size token'), async () => {
    await tokensPage.tokensComp.clickOnTokenWithName(fontSizeToken.name);
    await mainPage.waitForChangeIsSaved();
    await tokensPage.tokensComp.isTokenAppliedWithName(fontSizeToken.name);
    await mainPage.waitForResizeHandlerVisible();
    await expect(mainPage.viewport).toHaveScreenshot('text-font-size-60.png', {
      mask: mainPage.maskViewport(),
    });
  });

  mainTest(qase(2360, 'Detachment font size token'), async () => {
    await tokensPage.tokensComp.clickOnTokenWithName(fontSizeToken.name);
    await mainPage.waitForChangeIsSaved();
    await tokensPage.tokensComp.isTokenAppliedWithName(fontSizeToken.name);
    await mainPage.createDefaultTextLayerByCoordinates(100, 600);
    await mainPage.waitForChangeIsSaved();
    await tokensPage.tokensComp.clickOnTokenWithName(fontSizeToken.name);
    await mainPage.waitForChangeIsSaved();
    await tokensPage.tokensComp.isTokenAppliedWithName(fontSizeToken.name);
    await mainPage.clickViewportByCoordinates(120, 220);
    await tokensPage.tokensComp.clickOnTokenWithName(fontSizeToken.name);
    await mainPage.waitForChangeIsSaved();
    await tokensPage.tokensComp.isTokenAppliedWithName(fontSizeToken.name, false);
    await tokensPage.tokensComp.editTokenViaRightClickAndSave(updatedTokenData);
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot('texts-size-60-120.png', {
      mask: mainPage.maskViewport(),
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
    await tokensPage.tokensComp.isTokenVisibleWithName(colorToken1.name);
    await tokensPage.tokensComp.createTokenViaAddButtonAndEnter(colorToken2);
    await tokensPage.tokensComp.isTokenVisibleWithName(colorToken2.name);

    await mainPage.createDefaultTextLayerByCoordinates(100, 200);
    await mainPage.waitForChangeIsSaved();
    await mainPage.waitForResizeHandlerVisible();
    await tokensPage.tokensComp.clickOnTokenWithName(colorToken1.name);
    await tokensPage.tokensComp.isTokenAppliedWithName(colorToken1.name);
    await layersPanelPage.openLayersTab();
    await mainPage.pressFlexLayoutShortcut();
    await mainPage.waitForChangeIsSaved();
    await mainPage.waitForResizeHandlerVisible();
    await layersPanelPage.createComponentViaShortcut(browserName, true);
    await mainPage.waitForChangeIsSaved();
    await mainPage.copyLayerViaRightClick();
    await mainPage.pasteLayerViaRightClick();
    await mainPage.waitForChangeIsSaved();

    await layersPanelPage.openLayersTab();
    await layersPanelPage.selectCopyComponentChildLayer();
    await tokensPage.clickTokensTab();
    await tokensPage.tokensComp.clickOnTokenWithName(colorToken2.name);
    await tokensPage.tokensComp.isTokenAppliedWithName(colorToken2.name);
    await layersPanelPage.openLayersTab();
    await layersPanelPage.clickMainComponentOnLayersTab();
    await layersPanelPage.selectMainComponentChildLayer();

    await designPanelPage.clickFillColorIcon();
    await colorPalettePage.clickOnColorButton();
    await colorPalettePage.setHex(colorToken3.value);
    await layersPanelPage.selectMainComponentChildLayer();
    await mainPage.waitForChangeIsSaved();
    await designPanelPage.isFillHexCodeSet(colorToken3.value);

    await tokensPage.clickTokensTab();
    await tokensPage.tokensComp.isTokenAppliedWithName(colorToken1.name, false);
    await layersPanelPage.openLayersTab();
    await layersPanelPage.clickCopyComponentOnLayersTab();
    await layersPanelPage.selectCopyComponentChildLayer();
    await tokensPage.clickTokensTab();
    await tokensPage.tokensComp.isTokenAppliedWithName(colorToken2.name, true);

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
  let layersPanelPage: LayersPanelPage;

  const fontFamilyToken: MainToken<TokenClass> = {
    class: TokenClass.FontFamily,
    name: 'font-family',
    value: 'Actor',
  };

  const fontFamilyTokenRef: MainToken<TokenClass> = {
    class: TokenClass.FontFamily,
    name: 'font-family2',
    value: `{${fontFamilyToken.name}}`,
  };
  const updatedTokenData: MainToken<TokenClass> = {
    class: TokenClass.FontFamily,
    name: fontFamilyToken.name,
    value: 'Inter',
  };

  mainTest.beforeEach(async ({ page }) => {
    mainPage = new MainPage(page);
    tokensPage = new TokensPage(page);
    designPanelPage = new DesignPanelPage(page);
    layersPanelPage = new LayersPanelPage(page);

    await mainPage.createDefaultTextLayerByCoordinates(100, 200);
    await tokensPage.clickTokensTab();
    await tokensPage.tokensComp.createTokenViaAddButtonAndSave(fontFamilyToken);
    await tokensPage.tokensComp.isTokenVisibleWithName(fontFamilyToken.name);
    await tokensPage.tokensComp.clickOnTokenWithName(fontFamilyToken.name);
    await mainPage.waitForChangeIsSaved();
  });

  mainTest(qase(2472, 'Apply a font family token'), async () => {
    await tokensPage.tokensComp.isTokenAppliedWithName(fontFamilyToken.name);
    await designPanelPage.checkFontName(fontFamilyToken.value);
  });

  mainTest(qase(2475, 'Edit a font family token'), async () => {
    await tokensPage.tokensComp.isTokenAppliedWithName(fontFamilyToken.name);
    await tokensPage.tokensComp.editTokenViaRightClickAndSave(updatedTokenData);
    await mainPage.waitForChangeIsSaved();
    await designPanelPage.checkFontName(updatedTokenData.value);
    await tokensPage.tokensComp.isTokenAppliedWithName(fontFamilyToken.name);
    await tokensPage.tokensComp.checkAppliedTokenTitle(
      'Token: font-family\n' + 'Original value: Inter\n' + 'Resolved value: Inter',
    );
  });

  mainTest(qase(2506, 'Reference a font family token'), async () => {
    await tokensPage.tokensComp.isTokenAppliedWithName(fontFamilyToken.name);
    await designPanelPage.checkFontName(fontFamilyToken.value);

    await tokensPage.tokensComp.createTokenViaAddButtonAndEnter(fontFamilyTokenRef);
    await tokensPage.tokensComp.isTokenVisibleWithName(fontFamilyTokenRef.name);
    await mainPage.clickViewportOnce();

    await layersPanelPage.openLayersTab();
    await mainPage.clickOnLayerOnCanvas();
    await tokensPage.clickTokensTab();

    await tokensPage.tokensComp.clickOnTokenWithName(fontFamilyTokenRef.name);
    await tokensPage.tokensComp.editTokenViaRightClickAndSave(updatedTokenData);
    await mainPage.waitForChangeIsSaved();
    await designPanelPage.checkFontName(updatedTokenData.value);
    await tokensPage.tokensComp.isTokenAppliedWithName(fontFamilyTokenRef.name);
  });
});

mainTest.describe(() => {
  let mainPage: MainPage;
  let tokensPage: TokensPage;
  let designPanelPage: DesignPanelPage;
  let layersPanelPage: LayersPanelPage;

  mainTest.beforeEach(async ({ page }) => {
    mainPage = new MainPage(page);
    tokensPage = new TokensPage(page);
    designPanelPage = new DesignPanelPage(page);
    layersPanelPage = new LayersPanelPage(page);

    await mainPage.createDefaultTextLayerByCoordinates(100, 200);
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
        name: 'extra-black-font-weight',
        value: 'extra-black',
      };

      const fontWeightToken2: MainToken<TokenClass> = {
        class: TokenClass.FontWeight,
        name: '500-italic-font-weight',
        value: '500 italic',
      };

      await tokensPage.tokensComp.createTokenViaAddButtonAndEnter(fontWeightToken1);
      await tokensPage.tokensComp.isTokenVisibleWithName(fontWeightToken1.name);
      await tokensPage.tokensComp.createTokenViaAddButtonAndEnter(fontWeightToken2);
      await tokensPage.tokensComp.isTokenVisibleWithName(fontWeightToken2.name);

      await mainPage.clickViewportOnce();
      await layersPanelPage.openLayersTab();
      await mainPage.clickOnLayerOnCanvas();
      await tokensPage.clickTokensTab();

      await tokensPage.tokensComp.clickOnTokenWithName(fontWeightToken1.name);
      await mainPage.checkImportErrorMessage(
        `Error setting font weight/style. This font style does not exist in the current font`,
      );
      await mainPage.closeModalWindow();
      await mainPage.isImportErrorMessageVisible(false);
      await mainPage.waitForChangeIsSaved();
      await tokensPage.tokensComp.isTokenAppliedWithName(fontWeightToken1.name);
      await designPanelPage.checkFontStyle('900');

      await mainPage.clickViewportOnce();
      await layersPanelPage.openLayersTab();
      await mainPage.clickOnLayerOnCanvas();
      await tokensPage.clickTokensTab();

      await tokensPage.tokensComp.clickOnTokenWithName(fontWeightToken2.name);
      await mainPage.checkImportErrorMessage(
        `Error setting font weight/style. This font style does not exist in the current font`,
      );
      await mainPage.waitForChangeIsSaved();
      await tokensPage.tokensComp.isTokenAppliedWithName(fontWeightToken2.name);
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
        name: 'extra-black-font-weight',
        value: '500',
      };

      await tokensPage.tokensComp.createTokenViaAddButtonAndEnter(fontWeightToken);
      await tokensPage.tokensComp.isTokenVisibleWithName(fontWeightToken.name);

      await designPanelPage.changeTextFont('Splash');
      await tokensPage.tokensComp.clickOnTokenWithName(fontWeightToken.name);
      await mainPage.checkImportErrorMessage(
        `Error setting font weight/style. This font style does not exist in the current font`,
      );
      await mainPage.waitForChangeIsSaved();
      await tokensPage.tokensComp.isTokenAppliedWithName(fontWeightToken.name);
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
        name: '700-italic-font-weight',
        value: '700 Italic',
      };

      const updatedTokenData: MainToken<TokenClass> = {
        class: TokenClass.FontWeight,
        name: fontWeightToken.name,
        value: '200',
      };

      await tokensPage.tokensComp.createTokenViaAddButtonAndEnter(fontWeightToken);
      await tokensPage.tokensComp.isTokenVisibleWithName(fontWeightToken.name);
      await tokensPage.tokensComp.clickOnTokenWithName(fontWeightToken.name);
      await mainPage.waitForChangeIsSaved();
      await tokensPage.tokensComp.isTokenAppliedWithName(fontWeightToken.name);
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
    name: 'letter-spacing',
    value: '10',
  };
  const newTokenValue = '5';

  mainTest.beforeEach(async ({ page }) => {
    mainPage = new MainPage(page);
    tokensPage = new TokensPage(page);
    designPanelPage = new DesignPanelPage(page);
    assetsPanelPage = new AssetsPanelPage(page);

    await mainPage.createDefaultTextLayerByCoordinates(100, 200);
    await tokensPage.clickTokensTab();
    await tokensPage.tokensComp.createTokenViaAddButtonAndSave(letterSpacingToken);
    await tokensPage.tokensComp.isTokenVisibleWithName(letterSpacingToken.name);
    await tokensPage.tokensComp.clickOnTokenWithName(letterSpacingToken.name);
    await mainPage.waitForChangeIsSaved();
  });

  mainTest(
    qase(2500, 'Apply a Letter Spacing token and override value from Design tab'),
    async () => {
      await tokensPage.tokensComp.isTokenAppliedWithName(letterSpacingToken.name);
      await designPanelPage.checkLetterSpacing(letterSpacingToken.value);
      await designPanelPage.changeTextLetterSpacing(newTokenValue);
      await mainPage.waitForChangeIsSaved();
      await tokensPage.tokensComp.isTokenAppliedWithName(
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
      await tokensPage.tokensComp.isTokenAppliedWithName(letterSpacingToken.name);
      await designPanelPage.checkLetterSpacing(letterSpacingToken.value);

      await assetsPanelPage.clickAssetsTab();
      await assetsPanelPage.clickAddFileLibraryTypographyButton();
      await assetsPanelPage.waitForChangeIsSaved();
      await assetsPanelPage.selectLetterSpacing(newTokenValue);
      await designPanelPage.clickOnEnter();
      await assetsPanelPage.waitForChangeIsSaved();

      await tokensPage.clickTokensTab();
      await designPanelPage.clickOnTypographyMenuButton();
      await tokensPage.tokensComp.isTokenAppliedWithName(
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
      name: 'dimension',
      value: '2',
    };
    const letterSpacingToken: MainToken<TokenClass> = {
      class: TokenClass.LetterSpacing,
      name: 'letter-spacing',
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
    await tokensPage.tokensComp.isTokenVisibleWithName(letterSpacingToken.name);
    await mainPage.waitForChangeIsSaved();
    await tokensPage.tokensComp.checkTokenTitle(
      letterSpacingToken.name,
      `Token: ${letterSpacingToken.name}\n` +
        `Original value: ${letterSpacingToken.value}\n` +
        'Resolved value: 10',
    );

    await tokensPage.tokensComp.editTokenViaRightClickAndSave(updatedTokenData);
    await tokensPage.tokensComp.isTokenVisibleWithName(letterSpacingToken.name);
    await mainPage.waitForChangeIsSaved();
    await tokensPage.tokensComp.checkTokenTitle(
      letterSpacingToken.name,
      `Token: ${letterSpacingToken.name}\n` +
        `Original value: ${updatedTokenData.value}\n` +
        'Resolved value: 2.5',
    );

    updatedTokenData.value = `5px+{${dimensionToken.name}}`;
    await tokensPage.tokensComp.editTokenViaRightClickAndSave(updatedTokenData);
    await tokensPage.tokensComp.isTokenVisibleWithName(letterSpacingToken.name);
    await mainPage.waitForChangeIsSaved();
    await tokensPage.tokensComp.checkTokenTitle(
      letterSpacingToken.name,
      `Token: ${letterSpacingToken.name}\n` +
        `Original value: ${updatedTokenData.value}\n` +
        'Resolved value: 7',
    );

    updatedTokenData.value = `5px-{${dimensionToken.name}}`;
    await tokensPage.tokensComp.editTokenViaRightClickAndSave(updatedTokenData);
    await tokensPage.tokensComp.isTokenVisibleWithName(letterSpacingToken.name);
    await mainPage.waitForChangeIsSaved();
    await tokensPage.tokensComp.checkTokenTitle(
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
      name: 'number',
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
    await tokensPage.tokensComp.isTokenVisibleWithName(numberTokenRef.name);
    await mainPage.waitForChangeIsSaved();
    await tokensPage.tokensComp.checkTokenTitle(
      numberTokenRef.name,
      `Token: ${numberTokenRef.name}\n` +
        `Original value: 5*{${numberToken.name}}\n` +
        'Resolved value: 10\n' +
        'Right click to see options',
    );

    await tokensPage.tokensComp.editTokenViaRightClickAndSave(updatedTokenData);
    await tokensPage.tokensComp.isTokenVisibleWithName(numberTokenRef.name);
    await mainPage.waitForChangeIsSaved();
    await tokensPage.tokensComp.checkTokenTitle(
      numberTokenRef.name,
      `Token: ${numberTokenRef.name}\n` +
        `Original value: ${updatedTokenData.value}\n` +
        'Resolved value: 2.5\n' +
        'Right click to see options',
    );

    updatedTokenData.value = `5+{${numberToken.name}}`;
    await tokensPage.tokensComp.editTokenViaRightClickAndSave(updatedTokenData);
    await tokensPage.tokensComp.isTokenVisibleWithName(numberTokenRef.name);
    await mainPage.waitForChangeIsSaved();
    await tokensPage.tokensComp.checkTokenTitle(
      numberTokenRef.name,
      `Token: ${numberTokenRef.name}\n` +
        `Original value: ${updatedTokenData.value}\n` +
        'Resolved value: 7\n' +
        'Right click to see options',
    );

    updatedTokenData.value = `5-{${numberToken.name}}`;
    await tokensPage.tokensComp.editTokenViaRightClickAndSave(updatedTokenData);
    await tokensPage.tokensComp.isTokenVisibleWithName(numberTokenRef.name);
    await mainPage.waitForChangeIsSaved();
    await tokensPage.tokensComp.checkTokenTitle(
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
      name: 'number',
      value: '45',
    };
    const newTokenValue = '0';

    await mainPage.createDefaultRectangleByCoordinates(320, 210);
    await tokensPage.clickTokensTab();

    await tokensPage.tokensComp.createTokenViaAddButtonAndEnter(numberToken);
    await tokensPage.tokensComp.isTokenVisibleWithName(numberToken.name);
    await tokensPage.tokensComp.selectMenuItem(numberToken.name, 'Rotation');
    await mainPage.waitForChangeIsSaved();
    await tokensPage.tokensComp.isTokenAppliedWithName(numberToken.name);
    await tokensPage.tokensComp.isMenuItemWithNameSelected(
      numberToken.name,
      'Rotation',
    );
    await designPanelPage.checkRotationForLayer(numberToken.value);

    await designPanelPage.changeRotationForLayer(newTokenValue);
    await mainPage.waitForChangeIsSaved();
    await tokensPage.tokensComp.isTokenAppliedWithName(numberToken.name, false);
    await designPanelPage.checkRotationForLayer(newTokenValue);
  },
);

mainTest(
  qase(
    2492,
    'Apply a Number token (Line Height) and override value from Design tab',
  ),
  async ({ page }) => {
    const mainPage: MainPage = new MainPage(page);
    const tokensPage: TokensPage = new TokensPage(page);
    const designPanelPage: DesignPanelPage = new DesignPanelPage(page);

    const numberToken: MainToken<TokenClass> = {
      class: TokenClass.Number,
      name: 'number',
      value: '2',
    };
    const newTokenValue = '1';

    await mainPage.createDefaultTextLayerByCoordinates(100, 200);
    await tokensPage.clickTokensTab();

    await tokensPage.tokensComp.createTokenViaAddButtonAndEnter(numberToken);
    await tokensPage.tokensComp.isTokenVisibleWithName(numberToken.name);
    await tokensPage.tokensComp.selectMenuItem(numberToken.name, 'Line Height');
    await mainPage.waitForChangeIsSaved();
    await tokensPage.tokensComp.isTokenAppliedWithName(numberToken.name);
    await tokensPage.tokensComp.isMenuItemWithNameSelected(
      numberToken.name,
      'Line Height',
    );
    await designPanelPage.checkTextLineHeight(numberToken.value);

    await designPanelPage.changeTextLineHeight(newTokenValue);
    await mainPage.waitForChangeIsSaved();
    await tokensPage.tokensComp.isTokenAppliedWithName(numberToken.name, false);
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
    await tokensPage.tokensComp.isTokenVisibleWithName(textCaseToken.name);
    await tokensPage.tokensComp.clickOnTokenWithName(textCaseToken.name);
    await mainPage.waitForChangeIsSaved();
    await tokensPage.tokensComp.isTokenAppliedWithName(textCaseToken.name);
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
  await tokensPage.tokensComp.isTokenVisibleWithName(textCaseToken.name);
  await tokensPage.tokensComp.clickOnTokenWithName(textCaseToken.name);
  await mainPage.waitForChangeIsSaved();

  await tokensPage.tokensComp.isTokenAppliedWithName(textCaseToken.name);
  await designPanelPage.checkTextCase(textCaseToken.value);

  await assetsPanelPage.clickAssetsTab();
  await assetsPanelPage.clickFileLibraryTypographiesTypographyRecord();
  await mainPage.waitForChangeIsSaved();
  await designPanelPage.clickOnTypographyMenuButton();
  await designPanelPage.checkTextCase('Upper');

  await tokensPage.clickTokensTab();
  await tokensPage.tokensComp.isTokenAppliedWithName(textCaseToken.name, false);

  await tokensPage.tokensComp.clickOnTokenWithName(textCaseToken.name);
  await mainPage.waitForChangeIsSaved();
  await tokensPage.tokensComp.isTokenAppliedWithName(textCaseToken.name);
  await designPanelPage.checkTextCase(textCaseToken.value);

  await designPanelPage.changeTextCase('Lower');
  await mainPage.waitForChangeIsSaved();
  await tokensPage.tokensComp.isTokenAppliedWithName(textCaseToken.name, false);
  await designPanelPage.checkTextCase('Lower');
});

mainTest.describe(() => {
  let mainPage: MainPage;
  let tokensPage: TokensPage;
  let designPanelPage: DesignPanelPage;

  const decorationToken: MainToken<TokenClass> = {
    class: TokenClass.TextDecoration,
    name: 'text-decoration',
    value: 'underline',
  };

  const updatedTokenData: MainToken<TokenClass> = {
    class: TokenClass.TextDecoration,
    name: decorationToken.name,
    value: 'strike-through',
  };

  mainTest.beforeEach(async ({ page }) => {
    mainPage = new MainPage(page);
    tokensPage = new TokensPage(page);
    designPanelPage = new DesignPanelPage(page);

    await mainPage.createDefaultTextLayerByCoordinates(100, 200);
    await tokensPage.clickTokensTab();
    await tokensPage.tokensComp.createTokenViaAddButtonAndSave(decorationToken);
    await tokensPage.tokensComp.isTokenVisibleWithName(decorationToken.name);
    await tokensPage.tokensComp.clickOnTokenWithName(decorationToken.name);
    await mainPage.waitForChangeIsSaved();
  });

  mainTest(qase(2531, 'Edit a Text decoration token'), async () => {
    await tokensPage.tokensComp.isTokenAppliedWithName(decorationToken.name);
    await tokensPage.tokensComp.editTokenViaRightClickAndSave(updatedTokenData);
    await mainPage.waitForChangeIsSaved();
    await tokensPage.tokensComp.isTokenAppliedWithName(decorationToken.name);
    await designPanelPage.isTextStrikethroughChecked();
  });

  mainTest(
    qase(2535, 'Re-Apply the token after change the decorator manually'),
    async () => {
      await tokensPage.tokensComp.isTokenAppliedWithName(decorationToken.name);
      await designPanelPage.isTextUnderlineChecked();
      await designPanelPage.clickOnTextStrikethroughButton();
      await mainPage.waitForChangeIsSaved();
      await tokensPage.tokensComp.isTokenAppliedWithName(
        decorationToken.name,
        false,
      );
      await designPanelPage.isTextStrikethroughChecked();
      await tokensPage.tokensComp.clickOnTokenWithName(decorationToken.name);
      await mainPage.waitForChangeIsSaved();
      await tokensPage.tokensComp.isTokenAppliedWithName(decorationToken.name);
      await designPanelPage.isTextUnderlineChecked();
    },
  );
});
