const { expect } = require('@playwright/test');
const { mainTest } = require('../../fixtures');
const { MainPage } = require('../../pages/workspace/main-page');
const { random } = require('../../helpers/string-generator');
const { TeamPage } = require('../../pages/dashboard/team-page');
const { DashboardPage } = require('../../pages/dashboard/dashboard-page');
const { qase } = require('playwright-qase-reporter/playwright');
const { ProfilePage } = require('../../pages/profile-page');
const { LoginPage } = require('../../pages/login-page');
const { RegisterPage } = require('../../pages/register-page');
const { CommentsPanelPage } = require('../../pages/workspace/comments-panel-page');
const { waitMessage } = require('../../helpers/gmail');

const teamName = random().concat('autotest');

let teamPage,
  dashboardPage,
  mainPage,
  commentsPanelPage,
  profilePage,
  loginPage,
  registerPage;
mainTest.beforeEach(async ({ page, browserName }) => {
  mainPage = new MainPage(page);
  teamPage = new TeamPage(page);
  profilePage = new ProfilePage(page);
  loginPage = new LoginPage(page);
  registerPage = new RegisterPage(page);
  dashboardPage = new DashboardPage(page);
  commentsPanelPage = new CommentsPanelPage(page);
  await teamPage.createTeam(teamName);
  browserName === 'webkit' ? await teamPage.waitForTeamBtn(15000) : null;
  await teamPage.isTeamSelected(teamName, browserName);
  await dashboardPage.createFileViaPlaceholder();
  browserName === 'webkit' && !(await mainPage.isMainPageVisible())
    ? await dashboardPage.createFileViaPlaceholder()
    : null;
  await mainPage.waitForViewportVisible();
  await mainPage.isMainPageLoaded();
});

mainTest.afterEach(async () => {
  await teamPage.deleteTeam(teamName);
});

mainTest.describe(() => {
  mainTest(
    qase([2036], 'Share link of two Boards to a user from your team'),
    async ({ page }) => {
      await mainTest.slow();
      const firstEditor = random().concat('autotest');
      const firstEmail = `${process.env.GMAIL_NAME}+${firstEditor}${process.env.GMAIL_DOMAIN}`;

      await mainPage.createDefaultBoardByCoordinates(100, 100);
      await mainPage.createDefaultBoardByCoordinates(100, 300, true);
      await mainPage.clickViewportTwice();
      await mainPage.clickMainMenuButton();
      await mainPage.clickEditMainMenuItem();
      await mainPage.clickSelectAllMainMenuSubItem();
      await mainPage.waitForChangeIsSaved();

      await mainPage.copyLayerLinkViaRightClick();
      const link = await page.evaluate(() => navigator.clipboard.readText());

      await mainPage.backToDashboardFromFileEditor();

      await teamPage.openInvitationsPageViaOptionsMenu();
      await teamPage.clickInviteMembersToTeamButton();
      await teamPage.isInviteMembersPopUpHeaderDisplayed(
        'Invite members to the team',
      );
      await teamPage.enterEmailToInviteMembersPopUp(firstEmail);
      await teamPage.selectInvitationRoleInPopUp('Editor');
      await teamPage.clickSendInvitationButton();
      await teamPage.isSuccessMessageDisplayed('Invitation sent successfully');
      const firstInvite = await waitMessage(page, firstEmail, 40);

      await profilePage.logout();
      await loginPage.isLoginPageOpened();
      await page.goto(firstInvite.inviteUrl);
      await registerPage.registerAccount(
        firstEditor,
        firstEmail,
        process.env.LOGIN_PWD,
      );
      await dashboardPage.fillOnboardingQuestions();
      await teamPage.isTeamSelected(teamName);

      await page.goto(link);
      await mainPage.isMainPageLoaded();
      await expect(mainPage.viewport).toHaveScreenshot('2-board-link.png', {
        mask: [mainPage.guides, mainPage.guidesFragment, mainPage.toolBarWindow],
      });
      await mainPage.backToDashboardFromFileEditor();
    },
  );

  mainTest(
    qase([2035], 'Share link of Component with a user without team permission'),
    async ({ page }) => {
      await mainPage.createDefaultRectangleByCoordinates(100, 100);
      await mainPage.createComponentViaRightClick();
      await mainPage.copyLayerLinkViaRightClick();
      const link = await page.evaluate(() => navigator.clipboard.readText());

      await mainPage.backToDashboardFromFileEditor();

      await profilePage.logout();
      await loginPage.isEmailInputVisible();
      await loginPage.isLoginPageOpened();
      await loginPage.enterEmail(process.env.SECOND_EMAIL);
      await loginPage.enterPwd(process.env.LOGIN_PWD);
      await loginPage.clickLoginButton();
      await dashboardPage.isDashboardOpenedAfterLogin();

      await page.goto(link);
      await teamPage.isRequestAccessButtonVisible();
      await teamPage.clickReturnHomeButton();
      await dashboardPage.isDashboardOpenedAfterLogin();
    },
  );

  mainTest.afterEach(async () => {
    await profilePage.logout();
    await loginPage.isLoginPageOpened();
    await loginPage.enterEmail(process.env.LOGIN_EMAIL);
    await loginPage.enterPwd(process.env.LOGIN_PWD);
    await loginPage.clickLoginButton();
    await dashboardPage.isDashboardOpenedAfterLogin();
  });
});
