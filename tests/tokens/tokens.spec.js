const { mainTest } = require('../../fixtures');
const { MainPage } = require('../../pages/workspace/main-page');
const { expect, test } = require('@playwright/test');
const { random } = require('../../helpers/string-generator');
const { TeamPage } = require('../../pages/dashboard/team-page');
const { DashboardPage } = require('../../pages/dashboard/dashboard-page');
const { updateTestResults } = require('./../../helpers/saveTestResults.js');
const { qase } = require('playwright-qase-reporter/dist/playwright');
const { TokensPanelPage } = require('../../pages/workspace/tokens-panel-page');
const { DesignPanelPage } = require('../../pages/workspace/design-panel-page');
const { LayersPanelPage } = require('../../pages/workspace/layers-panel-page');

let mainPage, teamPage, dashboardPage, tokensPage, designPanelPage, layersPanelPage;

const teamName = random().concat('autotest');

test.beforeEach(async ({ page, browserName }) => {
  teamPage = new TeamPage(page);
  dashboardPage = new DashboardPage(page);
  mainPage = new MainPage(page);
  tokensPage = new TokensPanelPage(page);
  designPanelPage = new DesignPanelPage(page);
  layersPanelPage = new LayersPanelPage(page);
  await teamPage.createTeam(teamName);
  await teamPage.isTeamSelected(teamName);
  await dashboardPage.createFileViaPlaceholder();
  browserName === 'webkit' && !(await mainPage.isMainPageVisible())
    ? await dashboardPage.createFileViaPlaceholder()
    : null;
  await mainPage.isMainPageLoaded();
  await mainPage.clickMoveButton();
});

test.afterEach(async ({ page }, testInfo) => {
  await mainPage.backToDashboardFromFileEditor();
  await teamPage.deleteTeam(teamName);
  await updateTestResults(testInfo.status, testInfo.retry);
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
