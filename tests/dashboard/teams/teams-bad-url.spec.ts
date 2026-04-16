import { Page } from '@playwright/test';
import { mainTest } from 'fixtures';
import { qase } from 'playwright-qase-reporter/playwright';
import { random } from 'helpers/string-generator';
import { waitMessage } from 'helpers/gmail';
import { loginAsSecondUser } from 'helpers/user-flows';
import { LoginPage } from '@pages/login-page';
import { ProfilePage } from '@pages/profile-page';
import { DashboardPage } from '@pages/dashboard/dashboard-page';
import { TeamPage } from '@pages/dashboard/team-page';
import { MainPage } from '@pages/workspace/main-page';
import { ViewModePage } from '@pages/workspace/view-mode-page';

let teamPage: TeamPage;
let loginPage: LoginPage;
let profilePage: ProfilePage;
let dashboardPage: DashboardPage;
let mainPage: MainPage;

const initPages = async ({ page }: { page: Page }) => {
  teamPage = new TeamPage(page);
  loginPage = new LoginPage(page);
  profilePage = new ProfilePage(page);
  dashboardPage = new DashboardPage(page);
  mainPage = new MainPage(page);
};

mainTest.describe('Validate bad URL logged as SECOND_EMAIL', () => {
  const team = `${random()}-bad-url-autotest`;

  mainTest.beforeEach('Create a team and a file', async ({ page }) => {
    await initPages({ page });

    await teamPage.createTeam(team);
    await teamPage.isTeamSelected(team);
    await dashboardPage.createFileViaPlaceholder();
    await mainPage.isMainPageLoaded();
  });

  mainTest(
    qase(
      1822,
      'Workspace: Navigate to invalid URL logged in and display error page',
    ),
    async ({ page }) => {
      const currentURL = await mainPage.getUrl();
      const badURL = await mainPage.makeBadUrl(currentURL);

      await mainTest.step('Logout & login as SECOND_EMAIL', async () => {
        await mainPage.clickPencilBoxButton();
        await profilePage.logout();
        await loginAsSecondUser(page);
      });

      await mainTest.step('Go to bad URL and validate error message', async () => {
        await page.goto(badURL);
        await teamPage.isInviteMessageDisplayed('Oops!');
        await teamPage.isErrorMessageDisplayed("This page doesn't exist");
        await teamPage.isGoToPenpotButtonVisible();
      });
    },
  );

  mainTest(
    qase(
      1824,
      'View Mode: Navigate to invalid URL logged in and display error page',
    ),
    async ({ page }) => {
      let viewModePage = new ViewModePage(page);
      const newPage = await viewModePage.clickViewModeShortcut();

      viewModePage = new ViewModePage(newPage);
      await viewModePage.waitForViewerSection(45000);

      const currentURL = await viewModePage.getUrl();
      const badURL = await viewModePage.makeBadUrl(currentURL);

      await mainTest.step('Create a board', async () => {
        await mainPage.createDefaultBoardByCoordinates(300, 300);
        await mainPage.waitForChangeIsSaved();
      });

      await mainTest.step('Logout & login as SECOND_EMAIL', async () => {
        await mainPage.clickPencilBoxButton();
        await profilePage.logout();
        await loginAsSecondUser(page);
      });

      await mainTest.step('Go to bad URL and validate error message', async () => {
        await page.goto(badURL);
        await teamPage.isInviteMessageDisplayed('Oops!');
        await teamPage.isErrorMessageDisplayed("This page doesn't exist");
        await teamPage.isGoToPenpotButtonVisible();
      });
    },
  );

  mainTest(
    qase(
      1826,
      'Dashboard: Navigate to invalid URL logged in and display error page',
    ),
    async ({ page }) => {
      await mainPage.clickPencilBoxButton();

      const currentURL = await mainPage.getUrl();
      const badURL = await mainPage.makeBadDashboardUrl(currentURL);

      await mainTest.step('Logout & login as SECOND_EMAIL', async () => {
        await profilePage.logout();
        await loginAsSecondUser(page);
      });

      await mainTest.step('Go to bad URL and validate error message', async () => {
        await page.goto(badURL);
        await teamPage.isInviteMessageDisplayed('Oops!');
        await teamPage.isErrorMessageDisplayed("This page doesn't exist");
        await teamPage.isGoToPenpotButtonVisible();
      });
    },
  );
});

mainTest(
  qase(
    1180,
    'Team Invitation: Access deleted invitation link and display Invite invalid message',
  ),
  async ({ page }) => {
    await initPages({ page });

    const team = `${random()}-bad-url-autotest`;
    const firstAdmin = `${random()}-bad-url-autotest`;
    const firstEmail = `${process.env.GMAIL_NAME}+${firstAdmin}${process.env.GMAIL_DOMAIN}`;

    await mainTest.step(
      `Create a team, and invite "${firstEmail}" to the team as Admin`,
      async () => {
        await teamPage.createTeam(team);
        await teamPage.isTeamSelected(team);

        await teamPage.openInvitationsPageViaOptionsMenu();
        await teamPage.clickInviteMembersToTeamButton();

        await teamPage.isInviteMembersPopUpHeaderDisplayed(
          'Invite members to the team',
        );

        await teamPage.enterEmailToInviteMembersPopUp(firstEmail);
        await teamPage.selectInvitationRoleInPopUp('Admin');

        await teamPage.clickSendInvitationButton();
        await teamPage.isSuccessMessageDisplayed('Invitation sent successfully');
      },
    );

    await mainTest.step(`Delete invitation for "${firstEmail}"`, async () => {
      await teamPage.deleteInvitation(firstEmail);
      await teamPage.isInvitationRecordRemoved();
    });

    await mainTest.step(
      `Click on invite received and validate Invite invalid message`,
      async () => {
        const firstInvite = await waitMessage(page, firstEmail, 40);

        await profilePage.logout();
        await loginPage.isLoginPageOpened();

        await page.goto(firstInvite!.inviteUrl);

        await teamPage.isInviteMessageDisplayed('Invite invalid');
      },
    );
  },
);

mainTest(
  qase(
    1821,
    'Workspace: Navigate to invalid URL logged out redirects to login page',
  ),
  async ({ page }) => {
    await initPages({ page });

    const team = `${random()}-bad-url-autotest`;

    const currentURL = await mainPage.getUrl();
    const badURL = await mainPage.makeBadUrl(currentURL);

    await mainTest.step(`Create a team and a file`, async () => {
      await teamPage.createTeam(team);
      await teamPage.isTeamSelected(team);

      await dashboardPage.createFileViaPlaceholder();
      await mainPage.isMainPageLoaded();
    });

    await mainTest.step(`Logout`, async () => {
      await mainPage.clickPencilBoxButton();
      await profilePage.logout();
    });

    await mainTest.step(`Validate bad URL redirects to login`, async () => {
      await page.goto(badURL);
      await loginPage.isEmailInputVisible();
    });
  },
);

mainTest(
  qase(
    1823,
    'View Mode: Navigate to invalid URL logged out redirects to login page',
  ),
  async ({ page }) => {
    await initPages({ page });

    const team = `${random()}-bad-url-autotest`;

    await mainTest.step(`Create a team and a file with a board`, async () => {
      await teamPage.createTeam(team);
      await teamPage.isTeamSelected(team);

      await dashboardPage.createFileViaPlaceholder();
      await mainPage.isMainPageLoaded();

      await mainPage.createDefaultBoardByCoordinates(300, 300);
      await mainPage.waitForChangeIsSaved();
    });

    let viewModePage = new ViewModePage(page);
    const newPage = await viewModePage.clickViewModeShortcut();

    viewModePage = new ViewModePage(newPage);
    await viewModePage.waitForViewerSection(45000);

    const currentURL = await viewModePage.getUrl();
    const badURL = await viewModePage.makeBadUrl(currentURL);

    await mainTest.step(`Logout`, async () => {
      await mainPage.clickPencilBoxButton();
      await profilePage.logout();
    });

    await mainTest.step(`Validate bad URL redirects to login`, async () => {
      await page.goto(badURL);
      await loginPage.isEmailInputVisible();
    });
  },
);
