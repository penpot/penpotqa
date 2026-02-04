const { mainTest } = require('../../../fixtures');
const { qase } = require('playwright-qase-reporter/playwright');
const { random } = require('../../../helpers/string-generator.js');
const { LoginPage } = require('../../../pages/login-page.js');
const { ProfilePage } = require('../../../pages/profile-page.js');
const { DashboardPage } = require('../../../pages/dashboard/dashboard-page.js');
const { TeamPage } = require('../../../pages/dashboard/team-page.js');
const { MainPage } = require('../../../pages/workspace/main-page.js');
const { ViewModePage } = require('../../../pages/workspace/view-mode-page.js');
const { LayersPanelPage } = require('../../../pages/workspace/layers-panel-page.js');
const { waitMessage } = require('../../../helpers/gmail.js');
const { loginAsSecondUser } = require('../../../helpers/user-flows.js');

// TO REMOVE
mainTest.skip(true, 'Temporarily disabled due to unrelated to new render');

let teamPage, loginPage, profilePage, dashboardPage, mainPage, layersPanelPage;

const initPages = async ({ page }) => {
  teamPage = new TeamPage(page);
  loginPage = new LoginPage(page);
  profilePage = new ProfilePage(page);
  dashboardPage = new DashboardPage(page);
  mainPage = new MainPage(page);
  layersPanelPage = new LayersPanelPage(page);
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
      // Generate bad URL
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
      // Generate bad URL from view mode
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
      // Generate bad Dashboard URL
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
        await page.goto(firstInvite.inviteUrl);
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

    // Generate bad URL
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

    // Generate bad URL from View Mode
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
