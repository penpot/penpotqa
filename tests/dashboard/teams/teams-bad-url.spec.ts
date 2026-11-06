import { demoAccountApiFixture, demoAccountFileTest } from 'fixtures';
import { qase } from 'playwright-qase-reporter/playwright';
import { waitMessage } from 'helpers/gmail';
import { LoginPage } from '@pages/login-page';
import { ProfilePage } from '@pages/profile-page';
import { TeamPage } from '@pages/dashboard/team-page';
import { ViewModePage } from '@pages/workspace/view-mode-page';
import { createTeamName } from 'helpers/teams/create-team-name';
import { createInviteEmail } from 'helpers/teams/invite-email';

demoAccountFileTest.describe('Validate bad URL logged as another user', () => {
  demoAccountFileTest(
    qase(
      1822,
      'Workspace: Navigate to an invalid URL, log in, and display the error page',
    ),
    async ({ mainPage, secondUserPage }) => {
      const secondUserTeamPage = new TeamPage(secondUserPage);
      const badURL = await mainPage.makeBadUrl(await mainPage.getUrl());

      await demoAccountFileTest.step(
        'Go to bad URL as another user and validate error message',
        async () => {
          await secondUserPage.goto(badURL);
          await secondUserTeamPage.isInviteMessageDisplayed('Oops!');
          await secondUserTeamPage.isErrorMessageDisplayed(
            "This page doesn't exist",
          );
          await secondUserTeamPage.isGoToPenpotButtonVisible();
        },
      );
    },
  );

  demoAccountFileTest(
    qase(
      1824,
      'View Mode: Navigate to an invalid URL, log in, and display the error page',
    ),
    async ({ page, mainPage, secondUserPage }) => {
      const secondUserTeamPage = new TeamPage(secondUserPage);
      let badURL = '';

      await demoAccountFileTest.step(
        'Create a board and get the bad View Mode URL',
        async () => {
          await mainPage.createDefaultBoardByCoordinates(300, 300);
          await mainPage.waitForChangeIsSaved();

          const viewerPage = await new ViewModePage(page).clickViewModeShortcut();
          const viewModePage = new ViewModePage(viewerPage);
          await viewModePage.waitForViewerSection(45000);
          badURL = await viewModePage.makeBadUrl(await viewModePage.getUrl());
        },
      );

      await demoAccountFileTest.step(
        'Go to bad URL as another user and validate error message',
        async () => {
          await secondUserPage.goto(badURL, { waitUntil: 'networkidle' });
          await secondUserTeamPage.isInviteMessageDisplayed('Oops!');
          await secondUserTeamPage.isErrorMessageDisplayed(
            "This page doesn't exist",
          );
          await secondUserTeamPage.isGoToPenpotButtonVisible();
        },
      );
    },
  );

  demoAccountFileTest(
    qase(
      1826,
      'Dashboard: Navigate to an invalid URL while logged in and display the error page',
    ),
    async ({ mainPage, secondUserPage }) => {
      const secondUserTeamPage = new TeamPage(secondUserPage);

      await mainPage.clickPencilBoxButton();
      const badURL = await mainPage.makeBadDashboardUrl(await mainPage.getUrl());

      await demoAccountFileTest.step(
        'Go to bad URL as another user and validate error message',
        async () => {
          await secondUserPage.goto(badURL);
          await secondUserTeamPage.isInviteMessageDisplayed('Oops!');
          await secondUserTeamPage.isErrorMessageDisplayed(
            "This page doesn't exist",
          );
          await secondUserTeamPage.isGoToPenpotButtonVisible();
        },
      );
    },
  );
});

demoAccountFileTest.describe('Validate bad URL logged out', () => {
  demoAccountFileTest(
    qase(
      1821,
      'Workspace: Navigate to invalid URL logged out redirects to login page',
    ),
    async ({ page, mainPage }) => {
      const badURL = await mainPage.makeBadUrl(await mainPage.getUrl());

      await demoAccountFileTest.step('Logout', async () => {
        await mainPage.clickPencilBoxButton();
        await new ProfilePage(page).logout();
      });

      await demoAccountFileTest.step(
        'Validate bad URL redirects to login',
        async () => {
          // The workspace never fires `load` once it redirects to login.
          await page.goto(badURL, { waitUntil: 'commit' });
          await new LoginPage(page).isEmailInputVisible();
        },
      );
    },
  );

  demoAccountFileTest(
    qase(
      1823,
      'View Mode: Navigate to invalid URL logged out redirects to login page',
    ),
    async ({ page, mainPage }) => {
      let badURL = '';

      await demoAccountFileTest.step(
        'Create a board and get the bad View Mode URL',
        async () => {
          await mainPage.createDefaultBoardByCoordinates(300, 300);
          await mainPage.waitForChangeIsSaved();

          const viewerPage = await new ViewModePage(page).clickViewModeShortcut();
          const viewModePage = new ViewModePage(viewerPage);
          await viewModePage.waitForViewerSection(45000);
          badURL = await viewModePage.makeBadUrl(await viewModePage.getUrl());
        },
      );

      await demoAccountFileTest.step('Logout', async () => {
        await mainPage.clickPencilBoxButton();
        await new ProfilePage(page).logout();
      });

      await demoAccountFileTest.step(
        'Validate bad URL redirects to login',
        async () => {
          await page.goto(badURL);
          await new LoginPage(page).isEmailInputVisible();
        },
      );
    },
  );
});

demoAccountApiFixture(
  qase(
    1180,
    'Team Invitation: Access deleted invitation link and display Invite invalid message',
  ),
  { tag: '@external' },
  async ({ page }) => {
    const teamPage = new TeamPage(page);
    const team = createTeamName();
    // The invitee only needs an inbox to read the invite link from, no account.
    const inviteeEmail = createInviteEmail('admin');

    await demoAccountApiFixture.step(
      `Create a team, and invite "${inviteeEmail}" to the team as Admin`,
      async () => {
        await teamPage.createTeam(team);

        await teamPage.openInvitationsPageViaOptionsMenu();
        await teamPage.clickInviteMembersToTeamButton();

        await teamPage.isInviteMembersPopUpHeaderVisible();

        await teamPage.enterEmailToInviteMembersPopUp(inviteeEmail);
        await teamPage.selectInvitationRoleInPopUp('Admin');

        await teamPage.clickSendInvitationButton();
        await teamPage.isSuccessMessageDisplayed('Invitation sent successfully');
      },
    );

    await demoAccountApiFixture.step(
      `Delete invitation for "${inviteeEmail}"`,
      async () => {
        await teamPage.deleteInvitation(inviteeEmail);
        await teamPage.isInvitationRecordRemoved();
      },
    );

    await demoAccountApiFixture.step(
      'Click on invite received and validate Invite invalid message',
      async () => {
        const invite = await waitMessage(page, inviteeEmail, 40);

        await new ProfilePage(page).logout();

        await page.goto(invite!.inviteUrl);

        await teamPage.isInviteMessageDisplayed('Invite invalid');
      },
    );
  },
);
