import { expect } from '@playwright/test';
import { mainAccountFileTest } from 'fixtures';
import { random } from 'helpers/string-generator';
import {
  waitMessage,
  waitSecondMessage,
  getVerificationMessage,
} from 'helpers/gmail';
import { qase } from 'playwright-qase-reporter/playwright';
import { ProfilePage } from '@pages/profile-page';
import { LoginPage } from '@pages/login-page';
import { RegisterPage } from '@pages/register-page';

let profilePage: ProfilePage;
let loginPage: LoginPage;
let registerPage: RegisterPage;

mainAccountFileTest.beforeEach(async ({ page }) => {
  profilePage = new ProfilePage(page);
  loginPage = new LoginPage(page);
  registerPage = new RegisterPage(page);
});

mainAccountFileTest.describe(() => {
  mainAccountFileTest(
    qase([2036], 'Share link of two Boards to a user from your team'),
    async ({ page, mainPage, teamPage, dashboardPage, teamName }) => {
      await mainAccountFileTest.slow();
      const firstEditor = random().concat('autotest');
      const firstEmail = `${process.env.GMAIL_NAME}+${firstEditor}${process.env.GMAIL_DOMAIN}`;
      let link = '';

      await mainAccountFileTest.step(
        'Create two boards and copy their link',
        async () => {
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
        },
      );

      const firstInvite = await (async () => {
        let invite: Awaited<ReturnType<typeof waitMessage>>;
        await mainAccountFileTest.step(
          `Invite ${firstEmail} to the team as Editor`,
          async () => {
            await teamPage.openInvitationsPageViaOptionsMenu();
            await teamPage.clickInviteMembersToTeamButton();
            await teamPage.isInviteMembersPopUpHeaderVisible();
            await teamPage.enterEmailToInviteMembersPopUp(firstEmail);
            await teamPage.selectInvitationRoleInPopUp('Editor');
            await teamPage.clickSendInvitationButton();
            await teamPage.isSuccessMessageDisplayed('Invitation sent successfully');
            invite = await waitMessage(page, firstEmail, 40);
          },
        );
        return invite!;
      })();

      await mainAccountFileTest.step(
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
          await waitSecondMessage(page, firstEmail, 40);
          const verificationMessage = await getVerificationMessage(firstEmail);
          await page.goto(verificationMessage.inviteUrl);
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

  mainAccountFileTest(
    qase([2035], 'Share link of Component with a user without team permission'),
    async ({ page, mainPage, teamPage, dashboardPage }) => {
      let link = '';

      await mainAccountFileTest.step(
        'Create component and copy its link',
        async () => {
          await mainPage.createDefaultRectangleByCoordinates(100, 100);
          await mainPage.createComponentViaRightClick();
          await mainPage.copyLayerLinkViaRightClick();
          link = await page.evaluate(() => navigator.clipboard.readText());
          await mainPage.backToDashboardFromFileEditor();
        },
      );

      await mainAccountFileTest.step(
        'Log in as a user without team permission',
        async () => {
          await profilePage.logout();
          await loginPage.isEmailInputVisible();
          await loginPage.isLoginPageOpened();
          await loginPage.enterEmailAndClickOnContinue(process.env.SECOND_EMAIL);
          await loginPage.enterPwd(process.env.LOGIN_PWD);
          await loginPage.clickLoginButton();
          await dashboardPage.isDashboardOpenedAfterLogin();
        },
      );

      await mainAccountFileTest.step(
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

  mainAccountFileTest.afterEach(async ({ dashboardPage }) => {
    await profilePage.logout();
    await loginPage.isLoginPageOpened();
    await loginPage.enterEmailAndClickOnContinue(process.env.LOGIN_EMAIL);
    await loginPage.enterPwd(process.env.LOGIN_PWD);
    await loginPage.clickLoginButton();
    await dashboardPage.isDashboardOpenedAfterLogin();
  });
});
