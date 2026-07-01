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

mainTest(
  qase(
    [2901, 2903, 2904, 3001],
    'Preview version: restore history preview version, validate snapshot information and prompt confirmation' +
      ' and validate pinned version preview banner matches History sidebar label',
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

    await test.step(`Click on RESTORE ${versionName[0]}, assert confirmation modal, click to confirm and validate snapshot`, async () => {
      await historyPage.clickRestoreVersionButton();
      await historyPage.isRestoreConfirmationModalVisible();
      await historyPage.clickRestoreVersionButton();
      await expect(mainPage.viewport).toHaveScreenshot('restored-version-a.png', {
        mask: mainPage.maskViewport(),
      });
    });

    await test.step('Pin autosaved version and rename it', async () => {
      await historyPage.clickHistoryPanelButton();
      await historyPage.clickOnAutosaveVersionsButton();
      await historyPage.selectSnapshotOption('Pin version');
      await historyPage.renameVersion('Pinned Version');
      await historyPage.clickHistoryPanelButton();
    });

    await test.step('Open preview of pinned version and verify banner matches sidebar label', async () => {
      await historyPage.selectVersionOption('Preview version', 'Pinned Version');
      await historyPage.isPreviewVersionNotificationVisible('Pinned Version');
    });
  },
);
