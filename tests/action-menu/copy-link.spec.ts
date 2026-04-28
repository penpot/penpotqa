import { expect } from '@playwright/test';
import { mainTest } from 'fixtures';
import { random } from 'helpers/string-generator';
import { waitMessage } from 'helpers/gmail';
import { qase } from 'playwright-qase-reporter/playwright';
import { MainPage } from '@pages/workspace/main-page';
import { TeamPage } from '@pages/dashboard/team-page';
import { DashboardPage } from '@pages/dashboard/dashboard-page';
import { ProfilePage } from '@pages/profile-page';
import { LoginPage } from '@pages/login-page';
import { RegisterPage } from '@pages/register-page';

const teamName = random().concat('autotest');

let mainPage: MainPage;
let teamPage: TeamPage;
let dashboardPage: DashboardPage;
let profilePage: ProfilePage;
let loginPage: LoginPage;
let registerPage: RegisterPage;

mainTest.beforeEach(async ({ page, browserName }) => {
  mainPage = new MainPage(page);
  teamPage = new TeamPage(page);
  profilePage = new ProfilePage(page);
  loginPage = new LoginPage(page);
  registerPage = new RegisterPage(page);
  dashboardPage = new DashboardPage(page);
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
      let link = '';

      await mainTest.step('Create two boards and copy their link', async () => {
        await mainPage.createDefaultBoardByCoordinates(100, 100);
        await mainPage.createDefaultBoardByCoordinates(100, 300, true);
        await mainPage.clickViewportTwice();
        await mainPage.clickMainMenuButton();
        await mainPage.clickEditMainMenuItem();
        await mainPage.clickSelectAllMainMenuSubItem();
        await mainPage.waitForChangeIsSaved();
        await mainPage.copyLayerLinkViaRightClick();
        link = await page.evaluate(() => navigator.clipboard.readText());
        await mainPage.backToDashboardFromFileEditor();
      });

      const firstInvite = await (async () => {
        let invite: Awaited<ReturnType<typeof waitMessage>>;
        await mainTest.step(
          `Invite ${firstEmail} to the team as Editor`,
          async () => {
            await teamPage.openInvitationsPageViaOptionsMenu();
            await teamPage.clickInviteMembersToTeamButton();
            await teamPage.isInviteMembersPopUpHeaderDisplayed(
              'Invite members to the team',
            );
            await teamPage.enterEmailToInviteMembersPopUp(firstEmail);
            await teamPage.selectInvitationRoleInPopUp('Editor');
            await teamPage.clickSendInvitationButton();
            await teamPage.isSuccessMessageDisplayed('Invitation sent successfully');
            invite = await waitMessage(page, firstEmail, 40);
          },
        );
        return invite!;
      })();

      await mainTest.step(
        'Accept invitation and verify shared board link',
        async () => {
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
            mask: mainPage.maskViewport(),
          });
          await mainPage.backToDashboardFromFileEditor();
        },
      );
    },
  );

  mainTest(
    qase([2035], 'Share link of Component with a user without team permission'),
    async ({ page }) => {
      let link = '';

      await mainTest.step('Create component and copy its link', async () => {
        await mainPage.createDefaultRectangleByCoordinates(100, 100);
        await mainPage.createComponentViaRightClick();
        await mainPage.copyLayerLinkViaRightClick();
        link = await page.evaluate(() => navigator.clipboard.readText());
        await mainPage.backToDashboardFromFileEditor();
      });

      await mainTest.step('Log in as a user without team permission', async () => {
        await profilePage.logout();
        await loginPage.isEmailInputVisible();
        await loginPage.isLoginPageOpened();
        await loginPage.enterEmailAndClickOnContinue(process.env.SECOND_EMAIL);
        await loginPage.enterPwd(process.env.LOGIN_PWD);
        await loginPage.clickLoginButton();
        await dashboardPage.isDashboardOpenedAfterLogin();
      });

      await mainTest.step(
        'Verify access is denied via shared component link',
        async () => {
          await page.goto(link);
          await teamPage.isRequestAccessButtonVisible();
          await teamPage.clickReturnHomeButton();
          await dashboardPage.isDashboardOpenedAfterLogin();
        },
      );
    },
  );

  mainTest.afterEach(async () => {
    await profilePage.logout();
    await loginPage.isLoginPageOpened();
    await loginPage.enterEmailAndClickOnContinue(process.env.LOGIN_EMAIL);
    await loginPage.enterPwd(process.env.LOGIN_PWD);
    await loginPage.clickLoginButton();
    await dashboardPage.isDashboardOpenedAfterLogin();
  });
});
