import { HistoryPanelPage } from '@pages/workspace/history-panel-page';
import { type LayersPanelComponent } from '@pages/workspace/left-sidebar/layers-panel-component';
import {
  type HistoryVersionsTabComponent,
  VersionMenuOption,
} from '@pages/workspace/right-sidebar/history-versions-tab-component';
import { WorkspacePage } from '@pages/workspace/workspace-page';
import { demoAccountFileTest } from 'fixtures';
import { qase } from 'playwright-qase-reporter/playwright';
import { expect, test } from 'playwright/test';

let historyPage: HistoryPanelPage;
let historyVersions: HistoryVersionsTabComponent;
let layers: LayersPanelComponent;

demoAccountFileTest.beforeEach(async ({ page }) => {
  const workspacePage = new WorkspacePage(page);
  historyPage = new HistoryPanelPage(page);
  historyVersions = workspacePage.rightSidebar.historyVersions;
  layers = workspacePage.leftSidebar.layers;
});

demoAccountFileTest(
  qase(
    [2901, 2903, 2904, 3001],
    'Preview version: restore history preview version, validate snapshot information and prompt confirmation' +
      ' and validate pinned version preview banner matches History sidebar label',
  ),
  async ({ mainPage }) => {
    const versionName = ['Version A', 'Version B'];

    await test.step(`Create version and Save ${versionName[0]}`, async () => {
      await mainPage.createDefaultRectangleByCoordinates(100, 100);
      await historyPage.clickHistoryPanelButton();
      await historyVersions.saveVersion(versionName[0]);
    });

    await test.step(`Create version and Save ${versionName[1]}`, async () => {
      await mainPage.createDefaultEllipseByCoordinates(100, 300);
      await layers.checkLayerRowVisible('Ellipse');
      await mainPage.waitForChangeIsSaved();
      await historyPage.clickHistoryPanelButton();
      await historyVersions.saveVersion(versionName[1]);
    });

    await test.step(`Open Preview version ${versionName[0]} and validate notification`, async () => {
      await historyVersions.selectVersionOption(
        VersionMenuOption.Preview,
        versionName[0],
      );
      await historyPage.isPreviewVersionNotificationVisible(versionName[0]);
      await expect(mainPage.viewport).toHaveScreenshot(
        'preview-version-snapshot-a.png',
        {
          mask: mainPage.maskViewport(),
        },
      );
    });

    await test.step(`Open Preview version ${versionName[1]} and validate notification`, async () => {
      await historyVersions.selectVersionOption(
        VersionMenuOption.Preview,
        versionName[1],
      );
      await historyPage.isPreviewVersionNotificationVisible(versionName[1]);
      await expect(mainPage.viewport).toHaveScreenshot(
        'preview-version-snapshot-b.png',
        {
          mask: mainPage.maskViewport(),
        },
      );
    });

    await test.step(`Open Preview version ${versionName[0]} and validate notification`, async () => {
      await historyVersions.selectVersionOption(
        VersionMenuOption.Preview,
        versionName[0],
      );
      await historyPage.isPreviewVersionNotificationVisible(versionName[0]);
      await expect(mainPage.viewport).toHaveScreenshot(
        'preview-version-snapshot-a.png',
        {
          mask: mainPage.maskViewport(),
        },
      );
    });

    await test.step(`Click on RESTORE ${versionName[0]}, assert confirmation modal, click to confirm and validate snapshot`, async () => {
      await historyVersions.clickPreviewBannerRestoreButton();
      await historyVersions.clickRestoreDialogRestoreButton();
      await expect(mainPage.viewport).toHaveScreenshot('restored-version-a.png', {
        mask: mainPage.maskViewport(),
      });
    });

    await test.step('Pin autosaved version and rename it', async () => {
      await historyPage.clickHistoryPanelButton();
      await historyPage.clickOnAutosaveVersionsButton();
      await historyPage.selectSnapshotOption('Pin version');
      await historyVersions.renameVersion('Pinned Version');
    });

    await test.step('Open preview of pinned version and verify banner matches sidebar label', async () => {
      await historyVersions.selectVersionOption(
        VersionMenuOption.Preview,
        'Pinned Version',
      );
      await historyPage.isPreviewVersionNotificationVisible('Pinned Version');
    });
  },
);
