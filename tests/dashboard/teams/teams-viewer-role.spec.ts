import { DashboardPage } from '@pages/dashboard/dashboard-page';
import { TeamPage } from '@pages/dashboard/team-page';
import { LoginPage } from '@pages/login-page';
import { ProfilePage } from '@pages/profile-page';
import { RegisterPage } from '@pages/register-page';
import { LayersPanelPage } from '@pages/workspace/layers-panel-page';
import { MainPage } from '@pages/workspace/main-page';
import { PagesPanelPage } from '@pages/workspace/panels-features/pages-panel-page';
import { expect, Page } from '@playwright/test';
import { mainTest } from 'fixtures';
import {
  getVerificationMessage,
  waitMessage,
  waitSecondMessage,
} from 'helpers/gmail';
import { createTeamName } from 'helpers/teams/create-team-name';
import { random } from 'helpers/string-generator';
import { qase } from 'playwright-qase-reporter/playwright';

const maxDiffPixelRatio = 0.001;
const teamName = createTeamName();

type SetupViewerUserResult = {
  teamName: string;
  userName: string;
  userEmail: string;
  loginPage: LoginPage;
  registerPage: RegisterPage;
  dashboardPage: DashboardPage;
  teamPage: TeamPage;
  profilePage: ProfilePage;
  mainPage: MainPage;
  layersPanelPage: LayersPanelPage;
  pagesPanelPage: PagesPanelPage;
};

function requireMessage<T>(message: T | null | undefined, errorMessage: string): T {
  if (!message) {
    throw new Error(errorMessage);
  }

  return message;
}

// Set up Viewer user
async function setupViewerUser(
  page: Page,
  role = 'Viewer',
): Promise<SetupViewerUserResult> {
  const userName = `${random()}-viewer-role-autotest`;
  const userEmail = `${process.env.GMAIL_NAME}+${userName}${process.env.GMAIL_DOMAIN}`;

  const loginPage = new LoginPage(page);
  const registerPage = new RegisterPage(page);
  const dashboardPage = new DashboardPage(page);
  const teamPage = new TeamPage(page);
  const profilePage = new ProfilePage(page);
  const mainPage = new MainPage(page);
  const pagesPanelPage = new PagesPanelPage(page);
  const layersPanelPage = new LayersPanelPage(page);

  // Create team & file
  await teamPage.createTeam(teamName);
  await teamPage.isTeamSelected(teamName);
  await dashboardPage.createFileViaPlaceholder();
  await mainPage.waitForViewportVisible();
  await mainPage.createDefaultRectangleByCoordinates(200, 300);
  await mainPage.createComponentViaRightClick();
  await mainPage.waitForChangeIsSaved();
  await mainPage.backToDashboardFromFileEditor();

  // Invite user
  await teamPage.openInvitationsPageViaOptionsMenu();
  await teamPage.clickInviteMembersToTeamButton();
  await teamPage.enterEmailToInviteMembersPopUp(userEmail);
  await teamPage.selectInvitationRoleInPopUp(role);
  await teamPage.clickSendInvitationButton();
  await teamPage.isSuccessMessageDisplayed('Invitation sent successfully');

  // Register user
  await profilePage.logout();
  const invite = requireMessage(
    await waitMessage(page, userEmail, 40),
    'Invitation email was not received for viewer user',
  );
  await page.goto(invite.inviteUrl);
  await registerPage.registerAccount(userName, userEmail, process.env.LOGIN_PWD);
  await waitSecondMessage(page, userEmail, 40);
  const verificationMessage = requireMessage(
    await getVerificationMessage(userEmail),
    'Verification email was not received for viewer user',
  );
  await page.goto(verificationMessage.inviteUrl);
  await dashboardPage.fillOnboardingQuestions();
  await teamPage.isTeamSelected(teamName);

  return {
    teamName,
    userName,
    userEmail,
    loginPage,
    registerPage,
    dashboardPage,
    teamPage,
    profilePage,
    mainPage,
    layersPanelPage,
    pagesPanelPage,
  };
}

mainTest.describe('Viewer Role - Permissions', () => {
  let setup: SetupViewerUserResult;

  mainTest.beforeEach(
    'Set up Viewer user: login with main account, create team, invite user with VIEWER role, register through invite and login as Viewer ',
    async ({ page }) => {
      setup = await setupViewerUser(page);
    },
  );

  mainTest(
    qase(
      [1870, 1889, 1891, 1894, 1898, 1906],
      'Viewer permissions on viewport: can not edit layers, use toolbar, page management (creation, duplicate, delete), right click menu, open color palette, open typographies ',
    ),
    async () => {
      const { dashboardPage, mainPage, layersPanelPage, pagesPanelPage } = setup;

      await mainTest.step('Open file and wait for viewport', async () => {
        await dashboardPage.openFileWithName('New File 1');
        await mainPage.waitForViewportVisible();
      });

      await mainTest.step('(1870) Viewer cannot edit layers', async () => {
        await mainPage.isDesignTabVisible(false);
        await layersPanelPage.clickMainComponentOnLayersTab();
        await expect(mainPage.fileRightSidebarAside).toHaveScreenshot(
          'right-sidebar-image.png',
          {
            maxDiffPixelRatio,
            mask: [mainPage.usersSection],
          },
        );
      });

      await mainTest.step('(1889) Viewer cannot use toolbar', async () => {
        await mainPage.waitForViewportVisible();
        await mainPage.isToolBarVisible(false);
      });

      await mainTest.step(
        '(1891) Viewer cannot create, duplicate, delete page',
        async () => {
          await pagesPanelPage.isPageRightClickMenuVisible(false);
        },
      );

      await mainTest.step('(1894) Viewer right-click menu', async () => {
        await layersPanelPage.clickMainComponentOnLayersTab();
        await mainPage.checkViewerRightClickMenu();
      });

      await mainTest.step('(1898) Viewer cannot open color palette', async () => {
        await mainPage.isColorsPaletteButtonVisible(false);
      });

      await mainTest.step('(1906) Viewer cannot open typographies', async () => {
        await mainPage.isTypographyButtonVisible(false);
      });
    },
  );
});

mainTest.describe('Viewer Role - Role Changes', () => {
  mainTest(
    qase(
      [1867],
      'Change a role of viewer user to editor and admin after accepting an invitation',
    ),
    async ({ page }) => {
      const setup = await setupViewerUser(page);
      const createdTeamName = setup.teamName;
      const {
        dashboardPage,
        mainPage,
        teamPage,
        profilePage,
        loginPage,
        userEmail,
        userName,
      } = setup;

      await mainTest.step('Verify viewer cannot edit initially', async () => {
        await dashboardPage.openFileWithName('New File 1');
        await mainPage.waitForViewportVisible();
        await mainPage.isDesignTabVisible(false);
        await mainPage.backToDashboardFromFileEditor();
      });

      await mainTest.step('Change viewer role to editor', async () => {
        await profilePage.logout();
        await loginPage.enterEmailAndClickOnContinue(process.env.LOGIN_EMAIL);
        await loginPage.enterPwd(process.env.LOGIN_PWD);
        await loginPage.clickLoginButton();
        await dashboardPage.isDashboardOpenedAfterLogin();
        await teamPage.switchTeam(createdTeamName);
        await teamPage.openMembersPageViaOptionsMenu();
        await teamPage.selectMemberRoleInPopUp(userName, 'Editor');
      });

      await mainTest.step('Verify editor rights for the invited user', async () => {
        await profilePage.logout();
        await loginPage.enterEmailAndClickOnContinue(userEmail);
        await loginPage.enterPwd(process.env.LOGIN_PWD);
        await loginPage.clickLoginButton();
        await dashboardPage.isDashboardOpenedAfterLogin();
        await teamPage.switchTeam(createdTeamName);
        await dashboardPage.openFileWithName('New File 1');
        await mainPage.waitForViewportVisible();
        await mainPage.isDesignTabVisible(true);
        await mainPage.backToDashboardFromFileEditor();
      });
    },
  );
});
