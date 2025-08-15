const { mainTest } = require('../../fixtures');
const { MainPage } = require('../../pages/workspace/main-page');
const { expect, test } = require('@playwright/test');
const { random } = require('../../helpers/string-generator');
const { TeamPage } = require('../../pages/dashboard/team-page');
const { DashboardPage } = require('../../pages/dashboard/dashboard-page');
const { updateTestResults } = require('./../../helpers/saveTestResults.js');
const { qase } = require('playwright-qase-reporter/dist/playwright');
const { TokensPanelPage } = require('../../pages/workspace/tokens-panel-page');

let mainPage, teamPage, dashboardPage, tokensPage;

const teamName = random().concat('autotest');

mainTest.beforeEach(async ({ page }) => {
  teamPage = new TeamPage(page);
  dashboardPage = new DashboardPage(page);
  mainPage = new MainPage(page);
  tokensPage = new TokensPanelPage(page);
  await teamPage.createTeam(teamName);
  await teamPage.isTeamSelected(teamName);
  await dashboardPage.isHeaderDisplayed('Projects');
});

mainTest.afterEach(async ({ page }, testInfo) => {
  await mainPage.backToDashboardFromFileEditor();
  await teamPage.deleteTeam(teamName);
  await updateTestResults(testInfo.status, testInfo.retry);
});

mainTest.describe(() => {
  mainTest.beforeEach(async () => {
    await dashboardPage.createFileViaPlaceholder();
    await mainPage.isMainPageLoaded();
    await mainPage.clickMoveButton();
    await tokensPage.clickTokensTab();
    await tokensPage.clickOnTokenToolsButton();
    await tokensPage.importTokens('documents/tokens-for-each-category.json');
    await tokensPage.isSetNameVisible('Global');
    await tokensPage.expandAllTokens();
  });

  mainTest(qase(2374, 'Rectangle: Check active tokens in token list'), async () => {
    await tokensPage.createDefaultRectangleByCoordinates(100, 200);
    await tokensPage.isTokenDisabledWithName('BORDER-RADIUS-1', false);
    await tokensPage.isTokenDisabledWithName('COLOR-1', false);
    await tokensPage.isTokenDisabledWithName('DIMENSIONS-1', false);
    await tokensPage.isTokenDisabledWithName('FONT-SIZE-100', true);
    await tokensPage.isTokenDisabledWithName('OPACITY-20', false);
    await tokensPage.isTokenDisabledWithName('ROTATION-15', false);
    await tokensPage.isTokenDisabledWithName('SIZING-0.5', false);
    await tokensPage.isTokenDisabledWithName('SPACING-10', true);
    await tokensPage.isTokenDisabledWithName('STROKE-WIDTH-10', false);

    await tokensPage.isMenuItemVisible('COLOR-1', 'Fill');
    await tokensPage.clickOnLayerOnCanvas();
    await tokensPage.isMenuItemVisible('COLOR-1', 'Stroke');
  });

  mainTest(
    qase(2382, 'Text layer: Check active tokens in token list'),
    async ({ browserName }) => {
      await tokensPage.createDefaultTextLayerByCoordinates(100, 200, browserName);
      await tokensPage.isTokenDisabledWithName('BORDER-RADIUS-1', true);
      await tokensPage.isTokenDisabledWithName('COLOR-1', false);
      await tokensPage.isTokenDisabledWithName('DIMENSIONS-1', false);
      await tokensPage.isTokenDisabledWithName('FONT-SIZE-100', false);
      await tokensPage.isTokenDisabledWithName('OPACITY-20', false);
      await tokensPage.isTokenDisabledWithName('ROTATION-15', false);
      await tokensPage.isTokenDisabledWithName('SIZING-0.5', false);
      await tokensPage.isTokenDisabledWithName('SPACING-10', true);
      await tokensPage.isTokenDisabledWithName('STROKE-WIDTH-10', false);

      await tokensPage.isMenuItemVisible('COLOR-1', 'Fill');
      await tokensPage.clickOnLayerOnCanvas();
      await tokensPage.isMenuItemVisible('COLOR-1', 'Stroke');
    },
  );

  mainTest(qase(2383, 'Board: Check active tokens in token list'), async () => {
    await tokensPage.createDefaultBoardByCoordinates(100, 200);
    await tokensPage.isTokenDisabledWithName('BORDER-RADIUS-1', false);
    await tokensPage.isTokenDisabledWithName('COLOR-1', false);
    await tokensPage.isTokenDisabledWithName('DIMENSIONS-1', false);
    await tokensPage.isTokenDisabledWithName('FONT-SIZE-100', true);
    await tokensPage.isTokenDisabledWithName('OPACITY-20', false);
    await tokensPage.isTokenDisabledWithName('ROTATION-15', false);
    await tokensPage.isTokenDisabledWithName('SIZING-0.5', false);
    await tokensPage.isTokenDisabledWithName('SPACING-10', false);
    await tokensPage.isTokenDisabledWithName('STROKE-WIDTH-10', false);
  });

  mainTest(qase(2385, 'Path: Check active tokens in token list'), async () => {
    await tokensPage.createDefaultOpenPath(100, 200);
    await tokensPage.isTokenDisabledWithName('BORDER-RADIUS-1', true);
    await tokensPage.isTokenDisabledWithName('COLOR-1', false);
    await tokensPage.isTokenDisabledWithName('DIMENSIONS-1', false);
    await tokensPage.isTokenDisabledWithName('FONT-SIZE-100', true);
    await tokensPage.isTokenDisabledWithName('OPACITY-20', false);
    await tokensPage.isTokenDisabledWithName('ROTATION-15', false);
    await tokensPage.isTokenDisabledWithName('SIZING-0.5', false);
    await tokensPage.isTokenDisabledWithName('SPACING-10', true);
    await tokensPage.isTokenDisabledWithName('STROKE-WIDTH-10', false);
  });

  mainTest(qase(2386, 'Image: Check active tokens in token list'), async () => {
    await tokensPage.uploadImage('images/images.png');
    await tokensPage.isTokenDisabledWithName('BORDER-RADIUS-1', false);
    await tokensPage.isTokenDisabledWithName('COLOR-1', false);
    await tokensPage.isTokenDisabledWithName('DIMENSIONS-1', false);
    await tokensPage.isTokenDisabledWithName('FONT-SIZE-100', true);
    await tokensPage.isTokenDisabledWithName('OPACITY-20', false);
    await tokensPage.isTokenDisabledWithName('ROTATION-15', false);
    await tokensPage.isTokenDisabledWithName('SIZING-0.5', false);
    await tokensPage.isTokenDisabledWithName('SPACING-10', true);
    await tokensPage.isTokenDisabledWithName('STROKE-WIDTH-10', false);
  });
});
