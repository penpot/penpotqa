import { TeamPage } from '@pages/dashboard/team-page';
import { LayersPanelPage } from '@pages/workspace/layers-panel-page';
import { PagesPanelPage } from '@pages/workspace/panels-features/pages-panel-page';
import { demoTeamWithInviteeTest } from 'fixtures';
import { InvitationRole } from 'helpers/teams/invitation-role';
import { openTeamFile } from 'helpers/teams/open-team-file';
import { qase } from 'playwright-qase-reporter/playwright';

demoTeamWithInviteeTest.describe('Viewer Role', () => {
  demoTeamWithInviteeTest.use({ inviteeRole: InvitationRole.Viewer });

  demoTeamWithInviteeTest.beforeEach(
    'Owner creates a main component in the team file',
    async ({ mainPage }) => {
      await mainPage.createDefaultRectangleByCoordinates(200, 300);
      await mainPage.createComponentViaRightClick();
      await mainPage.waitForChangeIsSaved();
    },
  );

  demoTeamWithInviteeTest(
    qase(
      [1870, 1889, 1891, 1894, 1898, 1906],
      'Viewer permissions on viewport: can not edit layers, use toolbar, page management (creation, duplicate, delete), right click menu, open color palette, open typographies ',
    ),
    async ({ team, invitee }) => {
      const layersPanelPage = new LayersPanelPage(invitee.page);
      const pagesPanelPage = new PagesPanelPage(invitee.page);
      const viewerMainPage = await openTeamFile(invitee.page, team.id);
      const { inspectTabComponent } = invitee.workspacePage.rightSidebar;

      await demoTeamWithInviteeTest.step(
        '(1870) Viewer cannot edit layers',
        async () => {
          await viewerMainPage.isDesignTabVisible(false);
          await layersPanelPage.clickMainComponentOnLayersTab();
          await inspectTabComponent.checkLayerInfo('Rectangle', 'Main component');
          await inspectTabComponent.checkSelectedViews('HEX', 'Styles');
          await inspectTabComponent.checkSizeAndPosition({
            width: '100px',
            height: '100px',
          });
          await inspectTabComponent.checkExportSectionVisible();
          await inspectTabComponent.checkReadOnly();
        },
      );

      await demoTeamWithInviteeTest.step(
        '(1889) Viewer cannot use toolbar',
        async () => {
          await viewerMainPage.waitForViewportVisible();
          await viewerMainPage.isToolBarVisible(false);
        },
      );

      await demoTeamWithInviteeTest.step(
        '(1891) Viewer cannot create, duplicate, delete page',
        async () => {
          await pagesPanelPage.isPageRightClickMenuVisible(false);
        },
      );

      await demoTeamWithInviteeTest.step(
        '(1894) Viewer right-click menu',
        async () => {
          await layersPanelPage.clickMainComponentOnLayersTab();
          await viewerMainPage.checkViewerRightClickMenu();
        },
      );

      await demoTeamWithInviteeTest.step(
        '(1898) Viewer cannot open color palette',
        async () => {
          await viewerMainPage.isColorsPaletteButtonVisible(false);
        },
      );

      await demoTeamWithInviteeTest.step(
        '(1906) Viewer cannot open typographies',
        async () => {
          await viewerMainPage.isTypographyButtonVisible(false);
        },
      );
    },
  );

  demoTeamWithInviteeTest(
    qase(
      [1867],
      'Change a role of viewer user to editor and admin after accepting an invitation',
    ),
    async ({ page, team, invitee }) => {
      const teamPage = new TeamPage(page);

      await demoTeamWithInviteeTest.step(
        'Verify viewer cannot edit initially',
        async () => {
          const viewerMainPage = await openTeamFile(invitee.page, team.id);
          await viewerMainPage.isDesignTabVisible(false);
        },
      );

      await demoTeamWithInviteeTest.step(
        'Change viewer role to editor',
        async () => {
          await teamPage.goToTeamDashboard(team.id);
          await teamPage.isTeamSelected(team.name);
          await teamPage.openMembersPageViaOptionsMenu();
          await teamPage.selectMemberRoleInPopUp(invitee.name, 'Editor');
        },
      );

      await demoTeamWithInviteeTest.step(
        'Verify editor rights for the invited user',
        async () => {
          const editorMainPage = await openTeamFile(invitee.page, team.id);
          await editorMainPage.isDesignTabVisible(true);
        },
      );

      await demoTeamWithInviteeTest.step('Change editor role to admin', async () => {
        await teamPage.goToTeamDashboard(team.id);
        await teamPage.isTeamSelected(team.name);
        await teamPage.openMembersPageViaOptionsMenu();
        await teamPage.selectMemberRoleInPopUp(invitee.name, 'Admin');
      });

      await demoTeamWithInviteeTest.step(
        'Verify admin rights for the invited user',
        async () => {
          const adminMainPage = await openTeamFile(invitee.page, team.id);
          await adminMainPage.isDesignTabVisible(true);
        },
      );
    },
  );
});
