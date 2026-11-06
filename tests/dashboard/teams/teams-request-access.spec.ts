import { Page } from '@playwright/test';
import { registerTest } from 'fixtures';
import { qase } from 'playwright-qase-reporter/playwright';
import { LoginPage } from '@pages/login-page';
import { RegisterPage } from '@pages/register-page';
import { ProfilePage } from '@pages/profile-page';
import { DashboardPage } from '@pages/dashboard/dashboard-page';
import { TeamPage } from '@pages/dashboard/team-page';
import { MainPage } from '@pages/workspace/main-page';
import { ViewModePage } from '@pages/workspace/view-mode-page';
import { random } from 'helpers/string-generator';
import {
  waitMessage,
  waitSecondMessage,
  waitRequestMessage,
  checkConfirmAccessText,
  checkDashboardConfirmAccessText,
  checkYourPenpotConfirmAccessText,
  checkYourPenpotViewModeConfirmAccessText,
  checkSigningText,
} from 'helpers/gmail';
import { createTeamName } from 'helpers/teams/create-team-name';
import { registerAndDemoUserTest } from './teams-fixtures';

type SetupTeamAndFileResult = {
  loginPage: LoginPage;
  registerPage: RegisterPage;
  dashboardPage: DashboardPage;
  teamPage: TeamPage;
  profilePage: ProfilePage;
  mainPage: MainPage;
};

const secondRandomName = random() + 'autotest';
const secondEmail = `${process.env.GMAIL_NAME}+${secondRandomName}${process.env.GMAIL_DOMAIN}`;

const teamName = createTeamName();

function requireMessage<T>(message: T | undefined, errorMessage: string): T {
  if (!message) {
    throw new Error(errorMessage);
  }

  return message;
}

// Set up Team and File
async function setupTeamAndFile(
  page: Page,
  teamName: string,
): Promise<SetupTeamAndFileResult> {
  const loginPage = new LoginPage(page);
  const registerPage = new RegisterPage(page);
  const dashboardPage = new DashboardPage(page);
  const teamPage = new TeamPage(page);
  const profilePage = new ProfilePage(page);
  const mainPage = new MainPage(page);

  await teamPage.createTeam(teamName);
  await dashboardPage.createFileViaPlaceholder();
  await mainPage.waitForViewportVisible();

  return { loginPage, registerPage, dashboardPage, teamPage, profilePage, mainPage };
}

// Create a file in Personal Projects and open it
async function setupFileOnly(page: Page): Promise<MainPage> {
  const mainPage = new MainPage(page);

  await new DashboardPage(page).createFileViaPlaceholder();
  await mainPage.isMainPageLoaded();

  return mainPage;
}

// The requester asks for access from the "no access" dialog and goes back home
async function requestAccess(requesterPage: Page, dialog: 'file' | 'project') {
  const teamPage = new TeamPage(requesterPage);

  if (dialog === 'file') {
    await teamPage.isRequestFileAccessDialogVisible();
  } else {
    await teamPage.isRequestAccessProjectDialogVisible();
  }
  await teamPage.clickOnRequestAccessButton();
  await teamPage.isRequestAccessButtonVisible(false);
  await teamPage.checkRequestSentCorrectlyDialog();
  await teamPage.clickReturnHomeButton();
  await new DashboardPage(requesterPage).isDashboardOpenedAfterLogin();
}

// The owner receives the request-access email (the 1st one is the registration)
async function waitForRequestEmail(page: Page, email: string) {
  await waitSecondMessage(page, email, 40);
  return requireMessage(
    await waitRequestMessage(page, email, 40),
    'Request access message was not received',
  );
}

registerAndDemoUserTest(
  qase(
    [1827],
    "Request access from Workspace URL (Not Personal Projects): 'You don't have access to this file'",
  ),
  { tag: '@external' },
  async ({ page, email, demoUser: requester }) => {
    const { mainPage } = await setupTeamAndFile(page, teamName);

    await registerAndDemoUserTest.step(
      'Requester asks for access to the file',
      async () => {
        const fileURL = await mainPage.getUrl();
        await mainPage.clickPencilBoxButton();
        await requester.page.goto(fileURL);
        await requestAccess(requester.page, 'file');
      },
    );

    await registerAndDemoUserTest.step(
      'Owner receives the request email and opens the file in View mode',
      async () => {
        const requestMessage = await waitForRequestEmail(page, email);
        await checkConfirmAccessText(
          requestMessage.inviteText,
          requester.name,
          requester.email,
          teamName,
        );

        await page.goto(requestMessage.inviteUrl[1]);
        const viewModePage = new ViewModePage(page);
        await viewModePage.waitForViewerSection();
        await viewModePage.isShareButtonVisible();
      },
    );
  },
);

registerAndDemoUserTest(
  qase(
    [1829],
    "Request access from Dashboard URL (Not Your Penpot): You don't have access to this project",
  ),
  { tag: '@external' },
  async ({ page, email, demoUser: requester }) => {
    const { mainPage } = await setupTeamAndFile(page, teamName);

    await registerAndDemoUserTest.step(
      'Requester asks for access to the project',
      async () => {
        await mainPage.clickPencilBoxButton();
        const dashboardURL = await mainPage.getUrl();
        await requester.page.goto(dashboardURL);
        await requestAccess(requester.page, 'project');
      },
    );

    await registerAndDemoUserTest.step(
      'Owner receives the request email',
      async () => {
        const requestMessage = await waitForRequestEmail(page, email);
        await checkDashboardConfirmAccessText(
          requestMessage.inviteText,
          requester.name,
          requester.email,
          teamName,
        );
      },
    );
  },
);

registerAndDemoUserTest(
  qase(
    [1830],
    "Request access from Workspace (Personal Projects): 'You don't have access to this file'",
  ),
  { tag: '@external' },
  async ({ page, email, demoUser: requester }) => {
    const mainPage = await setupFileOnly(page);

    await registerAndDemoUserTest.step(
      'Requester asks for access to the file',
      async () => {
        const fileURL = await mainPage.getUrl();
        await mainPage.clickPencilBoxButton();
        await requester.page.goto(fileURL);
        await requestAccess(requester.page, 'file');
      },
    );

    await registerAndDemoUserTest.step(
      'Owner receives the request email',
      async () => {
        const requestMessage = await waitForRequestEmail(page, email);
        await checkYourPenpotConfirmAccessText(
          requestMessage.inviteText,
          requester.name,
          requester.email,
        );
      },
    );
  },
);

registerAndDemoUserTest(
  qase(
    [1831],
    "Request access from View mode (Personal Projects): 'You don't have access to this file'",
  ),
  { tag: '@external' },
  async ({ page, email, demoUser: requester }) => {
    const mainPage = await setupFileOnly(page);

    await registerAndDemoUserTest.step(
      'Requester asks for access to the file in View mode',
      async () => {
        await mainPage.createDefaultBoardByCoordinates(300, 300);
        await mainPage.waitForChangeIsSaved();

        const viewerPage = await new ViewModePage(page).clickViewModeShortcut();
        const viewModePage = new ViewModePage(viewerPage);
        await viewModePage.waitForViewerSection();
        const viewModeURL = await viewModePage.getUrl();

        await requester.page.goto(viewModeURL, { waitUntil: 'networkidle' });
        await requestAccess(requester.page, 'file');
      },
    );

    await registerAndDemoUserTest.step(
      'Owner receives the request email',
      async () => {
        const requestMessage = await waitForRequestEmail(page, email);
        await checkYourPenpotViewModeConfirmAccessText(
          requestMessage.inviteText,
          requester.name,
          requester.email,
        );
      },
    );
  },
);

registerTest(
  qase([1833], 'Auto Join to the team'),
  { tag: '@external' },
  async ({ page, name, email }) => {
    // Two UI sign-ups plus three Gmail round-trips: it takes ~80s, right at the
    // default timeout, so mark it slow.
    registerTest.slow();

    // Set up team and file
    const setup = await setupTeamAndFile(page, teamName);
    const {
      mainPage,
      teamPage,
      registerPage,
      dashboardPage,
      loginPage,
      profilePage,
    } = setup;

    // Get Workspace URL and go back to Dashboard
    const currentURL = await mainPage.getUrl();
    await mainPage.clickPencilBoxButton();

    // Register a second user (fresh session required)
    await profilePage.logout();
    await loginPage.isEmailInputVisible();
    await page.context().clearCookies();
    await mainPage.reloadPage();
    await loginPage.isLoginPageOpened();
    await loginPage.acceptCookie();
    await loginPage.clickOnCreateAccount();

    await registerPage.registerAccount(
      secondRandomName,
      secondEmail,
      process.env.LOGIN_PWD,
    );
    await registerPage.isRegisterEmailCorrect(secondEmail);

    const invite = requireMessage(
      await waitMessage(page, secondEmail, 40),
      'Invitation message was not received for second account',
    );
    await page.goto(invite.inviteUrl);

    await dashboardPage.fillOnboardingQuestions();
    await dashboardPage.isDashboardOpenedAfterLogin();

    // Second user requests access to file
    await page.goto(currentURL);

    await teamPage.isRequestFileAccessDialogVisible();
    await teamPage.clickOnRequestAccessButton();
    await teamPage.isRequestAccessButtonVisible(false);
    await teamPage.checkRequestSentCorrectlyDialog();
    await teamPage.clickReturnHomeButton();
    await dashboardPage.isDashboardOpenedAfterLogin();

    // Log out & clean session before OWNER login
    await profilePage.logout();
    await loginPage.isEmailInputVisible();
    await page.context().clearCookies();
    await mainPage.reloadPage();
    await loginPage.isLoginPageOpened();
    await loginPage.acceptCookie();

    // Login back as OWNER
    await loginPage.enterEmailAndClickOnContinue(email);
    await loginPage.enterPwd(process.env.LOGIN_PWD);
    await loginPage.clickLoginButton();
    await dashboardPage.isDashboardOpenedAfterLogin();

    // Must switch back to the created team
    await teamPage.switchTeam(teamName);

    // OWNER receives request email & sends invitation
    await waitSecondMessage(page, email, 40);
    const requestMessage = requireMessage(
      await waitRequestMessage(page, email, 40),
      'Request access message was not received',
    );

    await page.goto(requestMessage.inviteUrl[0]);
    await teamPage.checkFirstInvitedEmail(secondEmail);
    await teamPage.waitForInvitationButtonEnabled(10000);
    await teamPage.clickSendInvitationButton();

    // SECOND user receives the invitation signing email
    await waitSecondMessage(page, secondEmail, 40);
    const secondRequestMessage = requireMessage(
      await waitRequestMessage(page, secondEmail, 40),
      'Signing invitation message was not received',
    );

    await checkSigningText(secondRequestMessage.inviteText, name, teamName);
  },
);
