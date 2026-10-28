import { demoAccountFileTest, demoTeamWithInviteeTest } from 'fixtures';
import { HistoryPanelPage } from '@pages/workspace/history-panel-page';
import { LayersPanelPage } from '@pages/workspace/layers-panel-page';
import { qase } from 'playwright-qase-reporter/playwright';
import { InvitationRole } from 'helpers/teams/invitation-role';
import { openTeamFile } from 'helpers/teams/open-team-file';

let historyPage: HistoryPanelPage;
let layersPanelPage: LayersPanelPage;

demoAccountFileTest.beforeEach(async ({ page, mainPage }) => {
  await mainPage.clickMoveButton();
  historyPage = new HistoryPanelPage(page);
  layersPanelPage = new LayersPanelPage(page);
});

demoAccountFileTest(
  qase([874], 'Check if the status at header is "Saved"'),
  async ({ mainPage }) => {
    await mainPage.clickCreateEllipseButton();
    await mainPage.clickViewportTwice();
    await mainPage.isUnSavedChangesDisplayed();
    await mainPage.waitForChangeIsSaved();
  },
);

demoAccountFileTest(
  qase([890], 'Open history panel with recent changes'),
  async ({ mainPage }) => {
    await mainPage.clickCreateBoardButton();
    await mainPage.clickViewportTwice();
    await mainPage.waitForChangeIsSaved();
    await mainPage.clickHistoryPanelButton();
    await mainPage.clickHistoryActionsButton();
    await mainPage.isActionDisplayedOnHistoryPanel('New board');
  },
);

demoAccountFileTest(
  qase([1931], 'Open history version panel (via main menu)'),
  async ({ mainPage }) => {
    await mainPage.clickMainMenuButton();
    await mainPage.clickFileMainMenuItem();
    await mainPage.clickShowVersionsMainMenuSubItem();
    await historyPage.isVersionListEmpty();
  },
);

demoAccountFileTest(
  qase([1930], 'Open history version panel (shortcut Alt+H)'),
  async () => {
    await historyPage.clickShortcutCtrlAltH();
    await historyPage.isVersionListEmpty();
  },
);

demoAccountFileTest.describe(() => {
  const versionName = 'test version';

  demoAccountFileTest.beforeEach(async () => {
    await historyPage.createDefaultRectangleByCoordinates(200, 200);
    await historyPage.waitForChangeIsSaved();
    await historyPage.clickHistoryPanelButton();
    await historyPage.clickSaveVersionButton();
    await historyPage.renameVersion(versionName);
  });

  demoAccountFileTest(qase([1929], 'Save version via history panel'), async () => {
    await historyPage.checkLastVersionName(versionName);
  });
});

demoAccountFileTest.describe(() => {
  demoAccountFileTest.beforeEach(async () => {
    await historyPage.createDefaultRectangleByCoordinates(200, 200);
    await historyPage.waitForChangeIsSaved();
    await historyPage.clickHistoryPanelButton();
    await historyPage.clickSaveVersionButton();
    await historyPage.clickViewportTwice();
  });

  demoAccountFileTest.describe(() => {
    demoAccountFileTest.beforeEach(async () => {
      await layersPanelPage.selectLayerByName('Rectangle');
      await historyPage.pressDeleteKeyboardButton();
      await layersPanelPage.isLayerPresentOnLayersTab('Rectangle', false);
      await historyPage.clickHistoryPanelButton();
      await historyPage.selectVersionOption('Restore');
    });

    demoAccountFileTest.describe(() => {
      demoAccountFileTest.beforeEach(async () => {
        await historyPage.clickRestoreVersionButton();
        await layersPanelPage.isLayerPresentOnLayersTab('Rectangle', true);
        await historyPage.isHistoryPanelVisible(false);
        await historyPage.clickHistoryPanelButton();
      });

      demoAccountFileTest(
        qase(
          [1932, 1937],
          'Restore version via history panel' +
            'Verify the creation of an autosaved version after Restore',
        ),
        async () => {
          await historyPage.checkAutosaveVersionsCount('2');
        },
      );

      demoAccountFileTest(
        qase([1943], 'Pin the autosaved version via history panel'),
        async () => {
          const versionName = 'pin version';
          await historyPage.clickOnAutosaveVersionsButton();
          await historyPage.selectSnapshotOption('Pin version');
          await historyPage.renameVersion(versionName);
          await historyPage.clickHistoryPanelButton();
          await historyPage.checkLastVersionName(versionName);
          await historyPage.checkAutosaveVersionsCount('1');
        },
      );
    });
  });

  demoAccountFileTest(qase([1934], 'Rename version via history panel'), async () => {
    const versionName = 'renamed version';
    await historyPage.selectVersionOption('Rename');
    await historyPage.renameVersion(versionName);
    await historyPage.checkVersionName(versionName);
  });
});

demoAccountFileTest(qase([1935], 'Delete version via history panel'), async () => {
  await historyPage.clickHistoryPanelButton();
  await historyPage.clickSaveVersionButton();
  await historyPage.clickViewportTwice();
  await historyPage.selectVersionOption('Delete');
  await historyPage.isVersionListEmpty();
});

demoTeamWithInviteeTest.describe(() => {
  demoTeamWithInviteeTest.use({ inviteeRole: InvitationRole.Admin });

  demoTeamWithInviteeTest(
    qase(
      [1939, 1940, 1941],
      "Verification of displaying other users' versions in the version list" +
        'Setting "My Versions/ All Versions" filters in the version list',
    ),
    async ({ page, invitee, team }) => {
      const versionName = 'test version';
      demoTeamWithInviteeTest.slow();

      historyPage = new HistoryPanelPage(page);
      layersPanelPage = new LayersPanelPage(page);
      const adminHistoryPage = new HistoryPanelPage(invitee.page);
      const adminLayersPanelPage = new LayersPanelPage(invitee.page);

      await demoTeamWithInviteeTest.step(
        `Owner: create a board, save version "${versionName}" and restore it`,
        async () => {
          await historyPage.createDefaultBoardByCoordinates(200, 200);
          await historyPage.waitForChangeIsSaved();
          await historyPage.clickHistoryPanelButton();
          await historyPage.clickSaveVersionButton();
          await historyPage.renameVersion(versionName);
          await layersPanelPage.selectLayerByName('Board');
          await historyPage.pressDeleteKeyboardButton();
          await historyPage.clickHistoryPanelButton();
          await layersPanelPage.isLayerPresentOnLayersTab('Board', false);
          await historyPage.selectVersionOption('Restore');
          await historyPage.clickRestoreVersionButton();
          await layersPanelPage.isLayerPresentOnLayersTab('Board', true);
          await historyPage.waitForChangeIsSaved();
        },
      );

      await demoTeamWithInviteeTest.step(
        `Admin: open the same file, create an ellipse, save version "${versionName}" and restore it`,
        async () => {
          await openTeamFile(invitee.page, team.id);
          await adminHistoryPage.createDefaultEllipseByCoordinates(400, 200);
          await adminHistoryPage.waitForChangeIsSaved();
          await adminHistoryPage.clickHistoryPanelButton();
          await adminHistoryPage.clickSaveVersionButton();
          await adminHistoryPage.renameVersion(versionName);
          await adminLayersPanelPage.selectLayerByName('Ellipse');
          await adminHistoryPage.pressDeleteKeyboardButton();
          await adminHistoryPage.clickHistoryPanelButton();
          await adminLayersPanelPage.isLayerPresentOnLayersTab('Ellipse', false);
          await adminHistoryPage.selectVersionOption('Restore');
          await adminHistoryPage.clickRestoreVersionButton();
          await adminLayersPanelPage.isLayerPresentOnLayersTab('Ellipse', true);
          await adminHistoryPage.isHistoryPanelVisible(false);
          await adminHistoryPage.clickHistoryPanelButton();
        },
      );

      await demoTeamWithInviteeTest.step(
        'Admin: "My versions" hides the owner\'s versions and "All versions" shows them again',
        async () => {
          await adminHistoryPage.isAutosaveVersionsVisible(true);
          await adminHistoryPage.isOtherUserVersionVisible(true);
          await adminHistoryPage.changeVersionFilter('My versions');
          await adminHistoryPage.isAutosaveVersionsVisible(false);
          await adminHistoryPage.isOtherUserVersionVisible(false);
          await adminHistoryPage.changeVersionFilter('All versions');
          await adminHistoryPage.isAutosaveVersionsVisible(true);
          await adminHistoryPage.isOtherUserVersionVisible(true);
        },
      );
    },
  );
});
