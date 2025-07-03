const { expect } = require('@playwright/test');
const { mainTest } = require('../../fixtures');
const { MainPage } = require('../../pages/workspace/main-page');
const { random } = require('../../helpers/string-generator');
const { TeamPage } = require('../../pages/dashboard/team-page');
const { DashboardPage } = require('../../pages/dashboard/dashboard-page');
const { updateTestResults } = require('./../../helpers/saveTestResults.js');
const { qase } = require('playwright-qase-reporter/dist/playwright');
const { ViewModePage } = require('../../pages/workspace/view-mode-page');
const { PrototypePanelPage } = require('../../pages/workspace/prototype-panel-page');
const { DesignPanelPage } = require('../../pages/workspace/design-panel-page');
const { LayersPanelPage } = require('../../pages/workspace/layers-panel-page');
const { InspectPanelPage } = require('../../pages/workspace/inspect-panel-page');
const { ProfilePage } = require('../../pages/profile-page');
const { LoginPage } = require('../../pages/login-page');
const { RegisterPage } = require('../../pages/register-page');
const { ColorPalettePage } = require('../../pages/workspace/color-palette-page');
const { AssetsPanelPage } = require('../../pages/workspace/assets-panel-page');

const teamName = random().concat('autotest');

let teamPage,
  dashboardPage,
  mainPage,
  viewModePage,
  prototypePanelPage,
  designPanelPage,
  layersPanelPage,
  profilePage,
  loginPage,
  registerPage,
  colorPalettePage,
  assetsPanelPage,
  inspectPanelPage;
mainTest.beforeEach(async ({ page, browserName }) => {
  teamPage = new TeamPage(page);
  dashboardPage = new DashboardPage(page);
  mainPage = new MainPage(page);
  viewModePage = new ViewModePage(page);
  prototypePanelPage = new PrototypePanelPage(page);
  designPanelPage = new DesignPanelPage(page);
  layersPanelPage = new LayersPanelPage(page);
  profilePage = new ProfilePage(page);
  loginPage = new LoginPage(page);
  registerPage = new RegisterPage(page);
  colorPalettePage = new ColorPalettePage(page);
  assetsPanelPage = new AssetsPanelPage(page);
  inspectPanelPage = new InspectPanelPage(page);
  await teamPage.createTeam(teamName);
  browserName === 'webkit' ? await teamPage.waitForTeamBtn(15000) : null;
  await teamPage.isTeamSelected(teamName, browserName);
  await dashboardPage.createFileViaPlaceholder();
  browserName === 'webkit' && !(await mainPage.isMainPageVisible())
    ? await dashboardPage.createFileViaPlaceholder()
    : null;
  await mainPage.waitForViewportVisible();
  await mainPage.isMainPageLoaded();
});

mainTest.afterEach(async ({ page }, testInfo) => {
  await teamPage.deleteTeam(teamName);
  await updateTestResults(testInfo.status, testInfo.retry);
});

mainTest.describe(() => {
  mainTest.afterEach(async () => {
    await mainPage.backToDashboardFromFileEditor();
  });

  mainTest.describe(() => {
    mainTest.beforeEach(async () => {
      await mainPage.createDefaultRectangleByCoordinates(100, 100);
      await designPanelPage.clickAddFillButton();
      await mainPage.waitForChangeIsSaved();
      await designPanelPage.clickFillColorIcon();
      await colorPalettePage.setHex('#FF0000');
      await designPanelPage.clickAddStrokeButton();
      await designPanelPage.changeStrokeSettings(
        '#000000',
        '90',
        '20',
        'Inside',
        'Solid',
      );
      await designPanelPage.clickAddShadowButton();
      await designPanelPage.clickAddBlurButton();
      await designPanelPage.changeValueForBlur('7');
      await mainPage.waitForChangeIsSaved();
    });

    mainTest(
      qase([1964], 'Copy paste properties from rectangle to ellipse'),
      async () => {
        await mainPage.copyLayerPropertyViaRightClick();

        await mainPage.createDefaultEllipseByCoordinates(100, 300, true);
        await mainPage.clickShortcutCtrlAltV();

        await expect(mainPage.viewport).toHaveScreenshot('copies-property.png', {
          mask: [mainPage.guides, mainPage.guidesFragment, mainPage.toolBarWindow],
        });
      },
    );

    mainTest(
      qase([1973], 'Copy paste properties into 3 different layers'),
      async ({ browserName }) => {
        await mainPage.copyLayerPropertyViaRightClick();

        await mainPage.clickAddPageButton();
        await mainPage.clickOnPageOnLayersPanel(false);
        await mainPage.createDefaultEllipseByCoordinates(100, 300, true);
        await mainPage.createDefaultBoardByCoordinates(300, 300, true);
        await mainPage.createDefaultTextLayerByCoordinates(500, 500, browserName);
        await mainPage.clickMainMenuButton();
        await mainPage.clickEditMainMenuItem();
        await mainPage.clickSelectAllMainMenuSubItem();

        await mainPage.clickShortcutCtrlAltV();

        await expect(mainPage.viewport).toHaveScreenshot(
          'copies-property-3-layers.png',
          {
            mask: [mainPage.guides, mainPage.guidesFragment, mainPage.toolBarWindow],
          },
        );
      },
    );
  });

  mainTest(
    qase([1975], 'Copy paste Properties on Main component 1 to Copy component 2'),
    async () => {
      await mainPage.createDefaultRectangleByCoordinates(100, 100);
      await mainPage.createComponentViaRightClick();
      await designPanelPage.clickFirstColorIcon();
      await colorPalettePage.setHex('#0000FF');
      await mainPage.duplicateLayerViaRightClick();
      await designPanelPage.changeAxisXandYForLayer('300', '150');

      await mainPage.createDefaultEllipseByCoordinates(100, 700, true);
      await mainPage.createComponentViaRightClick();
      await mainPage.duplicateLayerViaRightClick();
      await designPanelPage.changeAxisXandYForLayer('350', '650');
      await mainPage.waitForChangeIsSaved();

      await layersPanelPage.clickNMainComponentOnLayersTab(1);
      await mainPage.clickShortcutCtrlAltC();

      await layersPanelPage.clickNCopyComponentOnLayersTab(0);
      await mainPage.clickShortcutCtrlAltV();

      await expect(mainPage.viewport).toHaveScreenshot(
        'paste-property-copy-component.png',
        {
          mask: [mainPage.guides, mainPage.guidesFragment, mainPage.toolBarWindow],
        },
      );
    },
  );

  mainTest(
    qase([1976], 'Copy paste properties of Flex layout to another Board'),
    async () => {
      await mainPage.createDefaultBoardByCoordinates(100, 100);
      await mainPage.addFlexLayoutViaRightClick();
      await layersPanelPage.isVerticalFlexIconVisibleOnLayer();
      await mainPage.clickCreatedBoardTitleOnCanvas();
      await designPanelPage.changeLayoutAlignment('Center');
      await designPanelPage.changeLayoutPadding('Vertical', '5');
      await designPanelPage.changeLayoutPadding('Horizontal', '15');
      await mainPage.waitForChangeIsSaved();

      await mainPage.clickShortcutCtrlAltC();

      await mainPage.createDefaultBoardByCoordinates(100, 700, true);
      await mainPage.clickShortcutCtrlAltV();

      await designPanelPage.isLayoutAlignmentSelected('Center');
      await designPanelPage.checkLayoutPadding('Vertical', '5');
      await designPanelPage.checkLayoutPadding('Horizontal', '15');
    },
  );

  mainTest(
    qase([1977], 'Copy paste properties of Grid layout to another Board'),
    async () => {
      await mainPage.createDefaultBoardByCoordinates(100, 100);
      await mainPage.addGridLayoutViaRightClick();
      await mainPage.clickCreatedBoardTitleOnCanvas();
      await designPanelPage.changeLayoutAlignment('Center', false);
      await mainPage.waitForChangeIsSaved();

      await mainPage.clickShortcutCtrlAltC();

      await mainPage.createDefaultBoardByCoordinates(100, 700, true);
      await mainPage.clickShortcutCtrlAltV();

      await designPanelPage.isLayoutAlignmentSelected('Center', false);
    },
  );

  mainTest(
    qase([1978], 'Copy paste typography property'),
    async ({ browserName }) => {
      await mainPage.createDefaultTextLayerByCoordinates(100, 100, browserName);
      await assetsPanelPage.selectFont('Sofia');
      await assetsPanelPage.selectFontSize('20');
      await mainPage.waitForChangeIsSaved();
      await mainPage.clickShortcutCtrlAltC();

      await mainPage.createDefaultTextLayerByCoordinates(500, 500, browserName);
      await mainPage.clickShortcutCtrlAltV();

      await assetsPanelPage.checkFont('Sofia');
      await assetsPanelPage.checkFontSize('20');
    },
  );

  mainTest(
    qase(
      [2020],
      'Compare copied CSS properties with CSS properties in "Inspect" tab',
    ),
    async () => {
      await mainPage.createDefaultEllipseByCoordinates(100, 100);
      const cssCode = await mainPage.copyLayerCSSViaRightClick();

      await inspectPanelPage.openInspectTab();
      await inspectPanelPage.openCodeTab();
      const cssCodeFromInspectTab = await inspectPanelPage.copyCssCodeByName(
        'Ellipse',
      );

      await expect(cssCode).toEqual(cssCodeFromInspectTab);
    },
  );

  mainTest(
    qase(
      [2256],
      'Compare "Copy as SVG" code with the SVG code on the "Inspect" panel',
    ),
    async () => {
      await mainPage.createDefaultEllipseByCoordinates(100, 100);
      const svgCode = await mainPage.copyLayerSVGViaRightClick();
      await inspectPanelPage.openInspectTab();
      await inspectPanelPage.openCodeTab();
      await inspectPanelPage.clickOnSVGCodeButton();
      const svgCodeFromInspectTab = await inspectPanelPage.copySvgCode();

      await expect(svgCode).toEqual(svgCodeFromInspectTab);
    },
  );

  mainTest(
    qase([2257], '"Copy as SVG" a simple path, pasting the code on Penpot'),
    async () => {
      await mainPage.createDefaultOpenPath();
      await mainPage.copyLayerSVGViaRightClick();
      await mainPage.pasteLayerViaRightClick();

      await expect(mainPage.viewport).toHaveScreenshot('copies-path.png', {
        mask: [mainPage.guides, mainPage.guidesFragment, mainPage.toolBarWindow],
      });
    },
  );
});
