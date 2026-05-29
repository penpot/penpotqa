import { mainTest } from 'fixtures';
import { MainPage } from '@pages/workspace/main-page';
import { HistoryPanelPage } from '@pages/workspace/history-panel-page';
import { LayersPanelPage } from '@pages/workspace/layers-panel-page';
import { TeamPage } from '@pages/dashboard/team-page';
import { DashboardPage } from '@pages/dashboard/dashboard-page';
import { createTeamName } from 'helpers/teams/create-team-name';
import { qase } from 'playwright-qase-reporter/playwright';
import { expect, test } from 'playwright/test';

const teamName = createTeamName();

let teamPage: TeamPage;
let dashboardPage: DashboardPage;
let mainPage: MainPage;
let historyPage: HistoryPanelPage;
let layersPanelPage: LayersPanelPage;

mainTest.beforeEach(async ({ page }) => {
  teamPage = new TeamPage(page);
  dashboardPage = new DashboardPage(page);
  mainPage = new MainPage(page);
  historyPage = new HistoryPanelPage(page);
  layersPanelPage = new LayersPanelPage(page);
  await teamPage.createTeam(teamName);
  await teamPage.isTeamSelected(teamName);
  await dashboardPage.createFileViaPlaceholder();
  await mainPage.isMainPageLoaded();
});

mainTest.afterEach(async () => {
  await mainPage.backToDashboardFromFileEditor();
  await teamPage.deleteTeam(teamName);
});

mainTest(
  qase(
    [2901, 2903, 2904],
    'Preview version: restore history preview version and validate snapshot information and prompt confirmation',
  ),
  async () => {
    const versionName = ['Version A', 'Version B'];

    await test.step(`Create version and Save ${versionName[0]}`, async () => {
      await mainPage.createDefaultRectangleByCoordinates(100, 100);
      await historyPage.clickHistoryPanelButton();
      await historyPage.clickSaveVersionButton();
      await historyPage.renameVersion(versionName[0]);
    });

    await test.step(`Create version and Save ${versionName[1]}`, async () => {
      await mainPage.createDefaultEllipseByCoordinates(100, 300);
      await historyPage.clickHistoryPanelButton();
      await historyPage.clickSaveVersionButton();
      await historyPage.renameVersion(versionName[1]);
    });

    await test.step(`Open Preview version ${versionName[0]} and validate notification`, async () => {
      await historyPage.selectVersionOption('Preview version', versionName[0]);
      await historyPage.isPreviewVersionNotificationVisible(versionName[0]);
      await expect(mainPage.viewport).toHaveScreenshot(
        'preview-version-snapshot-a.png',
        {
          mask: mainPage.maskViewport(),
        },
      );
    });

    await test.step(`Open Preview version ${versionName[1]} and validate notification`, async () => {
      await historyPage.selectVersionOption('Preview version', versionName[1]);
      await historyPage.isPreviewVersionNotificationVisible(versionName[1]);
      await expect(mainPage.viewport).toHaveScreenshot(
        'preview-version-snapshot-b.png',
        {
          mask: mainPage.maskViewport(),
        },
      );
    });

    await test.step(`Open Preview version ${versionName[0]} and validate notification`, async () => {
      await historyPage.selectVersionOption('Preview version', versionName[0]);
      await historyPage.isPreviewVersionNotificationVisible(versionName[0]);
      await expect(mainPage.viewport).toHaveScreenshot(
        'preview-version-snapshot-a.png',
        {
          mask: mainPage.maskViewport(),
        },
      );
    });

    await test.step(`Restore Version ${versionName[0]} and validate snapshot`, async () => {
      await historyPage.clickRestoreVersionButton();
      await mainPage.waitForChangeIsSaved();
      // TO DO - Add confirmation modal when implemented
      await expect(mainPage.viewport).toHaveScreenshot('restored-version-a.png', {
        mask: mainPage.maskViewport(),
      });
    });
  },
);
