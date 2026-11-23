import { VersionMenuOption } from '@pages/workspace/right-sidebar/history-versions-tab-component';
import { WorkspacePage } from '@pages/workspace/workspace-page';
import { demoTeamWithInviteeTest } from 'fixtures';
import { openFileInWorkspace } from 'helpers/files/open-file-in-workspace';
import { qase } from 'playwright-qase-reporter/playwright';

demoTeamWithInviteeTest(
  qase([4103], 'See who restored a saved version when a teammate restores it'),
  async ({ page, mainPage, team, invitee }) => {
    const ownerWorkspacePage = new WorkspacePage(page);
    const { layers } = ownerWorkspacePage.leftSidebar;
    const { historyVersions } = ownerWorkspacePage.rightSidebar;
    // The fixture opened the owner in a new file of the team
    const fileId = new URL(page.url()).searchParams.get('file-id')!;
    const ownerName = 'QA Tester';
    const boardName = 'Board A';
    const versionName = 'v1';

    await demoTeamWithInviteeTest.step(
      `Pre-conditions: User A has "${boardName}" and version "${versionName}", User B opens the file`,
      async () => {
        await mainPage.createDefaultBoardByCoordinates(200, 200);
        await layers.renameLayer('Board', boardName);
        await ownerWorkspacePage.waitForChangeIsSaved();
        await ownerWorkspacePage.rightSidebar.openHistoryVersionsTab();
        await historyVersions.saveVersion(versionName);
        await openFileInWorkspace(invitee.page, team.id, fileId);
      },
    );

    await demoTeamWithInviteeTest.step(
      `User A creates a rectangle on "${boardName}"`,
      async () => {
        await mainPage.createDefaultRectangleByCoordinates(220, 220);
        await layers.checkLayerIsChildOf('Rectangle', boardName);
      },
    );

    await demoTeamWithInviteeTest.step(
      'User A opens the "History" tab in the right sidebar',
      async () => {
        await ownerWorkspacePage.rightSidebar.openHistoryVersionsTab();
        await historyVersions.checkVersionVisible(versionName);
      },
    );

    await demoTeamWithInviteeTest.step(
      `User A clicks the "Open version menu" button of "${versionName}"`,
      async () => {
        await historyVersions.openVersionMenu(versionName);
        await historyVersions.checkVersionMenuOptionVisible(
          VersionMenuOption.Restore,
        );
      },
    );

    await demoTeamWithInviteeTest.step('Click the "Restore" option', async () => {
      await historyVersions.clickVersionMenuOption(VersionMenuOption.Restore);
      await historyVersions.checkRestoreDialogVisible();
    });

    await demoTeamWithInviteeTest.step('Click the "Restore" button', async () => {
      await historyVersions.clickRestoreDialogRestoreButton();
      await layers.checkLayerRowVisible(boardName);
      await layers.checkLayerRowVisible('Rectangle', false);
    });

    await demoTeamWithInviteeTest.step(
      "Check the file in User B's browser window",
      async () => {
        await invitee.workspacePage.fileRestoredModal.checkFileRestoredModalVisible();
        await invitee.workspacePage.fileRestoredModal.checkRestoredVersionMessage(
          ownerName,
          versionName,
        );
      },
    );

    await demoTeamWithInviteeTest.step(
      'Click on the viewport, outside the modal',
      async () => {
        await invitee.workspacePage.fileRestoredModal.clickOutside();
        await invitee.workspacePage.fileRestoredModal.checkFileRestoredModalVisible();
      },
    );

    await demoTeamWithInviteeTest.step('Click the "Got it" button', async () => {
      await invitee.workspacePage.fileRestoredModal.clickGotItButton();
      await invitee.workspacePage.leftSidebar.layers.checkLayerRowVisible(boardName);
      await invitee.workspacePage.leftSidebar.layers.checkLayerRowVisible(
        'Rectangle',
        false,
      );
    });

    await demoTeamWithInviteeTest.step(
      "Check the file in User A's browser window",
      async () => {
        await ownerWorkspacePage.fileRestoredModal.checkFileRestoredModalVisible(
          false,
        );
      },
    );
  },
);
