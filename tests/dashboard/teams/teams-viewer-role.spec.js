const { mainTest } = require('../../../fixtures');
const { LoginPage } = require('../../../pages/login-page.js');
const { RegisterPage } = require('../../../pages/register-page.js');
const { ProfilePage } = require('../../../pages/profile-page.js');
const { DashboardPage } = require('../../../pages/dashboard/dashboard-page.js');
const { TeamPage } = require('../../../pages/dashboard/team-page.js');
const { MainPage } = require('../../../pages/workspace/main-page.js');
const { LayersPanelPage } = require('../../../pages/workspace/layers-panel-page.js');
const { random } = require('../../../helpers/string-generator.js');
const { qase } = require('playwright-qase-reporter/playwright');
const { expect } = require('@playwright/test');
const { waitMessage } = require('../../../helpers/gmail.js');

const maxDiffPixelRatio = 0.001;

// Set up Viewer user
async function setupViewerUser(page, role = 'Viewer') {
  const teamName = `${random()}-viewer-role-autotest`;
  const userName = `${random()}-viewer-role-autotest`;
  const userEmail = `${process.env.GMAIL_NAME}+${userName}${process.env.GMAIL_DOMAIN}`;

  const loginPage = new LoginPage(page);
  const registerPage = new RegisterPage(page);
  const dashboardPage = new DashboardPage(page);
  const teamPage = new TeamPage(page);
  const profilePage = new ProfilePage(page);
  const mainPage = new MainPage(page);
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
  const invite = await waitMessage(page, userEmail, 40);
  await page.goto(invite.inviteUrl);
  await registerPage.registerAccount(userName, userEmail, process.env.LOGIN_PWD);
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
  };
}

mainTest.describe('Viewer Role - Permissions', () => {
  let setup;

  mainTest.beforeEach(async ({ page }) => {
    setup = await setupViewerUser(page);
  });

  mainTest(qase(1870, 'Viewer cannot edit layers'), async () => {
    const { dashboardPage, mainPage, layersPanelPage } = setup;
    await dashboardPage.openFileWithName('New File 1');
    await mainPage.waitForViewportVisible();
    await mainPage.isDesignTabVisible(false);

    await layersPanelPage.clickMainComponentOnLayersTab();
    await expect(mainPage.fileRightSidebarAside).toHaveScreenshot(
      'right-sidebar-image.png',
      {
        maxDiffPixelRatio,
        mask: [mainPage.usersSection],
      },
    );

    await mainPage.backToDashboardFromFileEditor();
  });

  mainTest(qase(1873, 'Viewer cannot import to Drafts'), async () => {
    const { dashboardPage } = setup;
    await dashboardPage.openSidebarItem('Drafts');
    await dashboardPage.isCreateFileOnDraftsTabButtonVisible(false);
    await dashboardPage.isOptionButtonFromDraftPageVisible(false);
  });

  mainTest(qase(1877, 'Viewer cannot add font'), async () => {
    const { dashboardPage } = setup;
    await dashboardPage.openSidebarItem('Fonts');
    await dashboardPage.isAddCustomFontButtonVisible(false);
  });

  mainTest(qase(1880, 'Viewer cannot create projects or drafts'), async () => {
    const { dashboardPage } = setup;
    await dashboardPage.openSidebarItem('Projects');
    await dashboardPage.isAddProjectButtonVisible(false);
    await dashboardPage.openSidebarItem('Drafts');
    await dashboardPage.isCreateFileOnDraftsTabButtonVisible(false);
  });

  mainTest(qase(1889, 'Viewer cannot use toolbar'), async () => {
    const { dashboardPage, mainPage } = setup;
    await dashboardPage.openFileWithName('New File 1');
    await mainPage.waitForViewportVisible();
    await mainPage.isToolBarVisible(false);
    await mainPage.backToDashboardFromFileEditor();
  });

  mainTest(qase(1891, 'Viewer cannot create, duplicate, delete page'), async () => {
    const { dashboardPage, mainPage } = setup;
    await dashboardPage.openFileWithName('New File 1');
    await mainPage.waitForViewportVisible();
    await mainPage.isPageRightClickMenuVisible(false);
    await mainPage.backToDashboardFromFileEditor();
  });

  mainTest(qase(1894, 'Viewer right-click menu'), async () => {
    const { dashboardPage, mainPage, layersPanelPage } = setup;
    await dashboardPage.openFileWithName('New File 1');
    await mainPage.waitForViewportVisible();
    await layersPanelPage.clickMainComponentOnLayersTab();
    await mainPage.checkViewerRightClickMenu();
    await mainPage.backToDashboardFromFileEditor();
  });

  mainTest(qase(1898, 'Viewer cannot open color palette'), async () => {
    const { dashboardPage, mainPage } = setup;
    await dashboardPage.openFileWithName('New File 1');
    await mainPage.waitForViewportVisible();
    await mainPage.isColorsPaletteButtonVisible(false);
    await mainPage.backToDashboardFromFileEditor();
  });

  mainTest(qase(1906, 'Viewer cannot open typographies'), async () => {
    const { dashboardPage, mainPage } = setup;
    await dashboardPage.openFileWithName('New File 1');
    await mainPage.waitForViewportVisible();
    await mainPage.isTypographyButtonVisible(false);
    await mainPage.backToDashboardFromFileEditor();
  });
});

mainTest.describe('Viewer Role - Role Changes', () => {
  mainTest(
    qase(
      1867,
      'Change a role of viewer user to editor and admin after accepting an invitation',
    ),
    async ({ page }) => {
      const setup = await setupViewerUser(page);
      const teamName = setup.teamName;
      const {
        dashboardPage,
        mainPage,
        teamPage,
        profilePage,
        loginPage,
        userEmail,
        userName,
      } = setup;

      // Viewer cannot edit initially
      await dashboardPage.openFileWithName('New File 1');
      await mainPage.waitForViewportVisible();
      await mainPage.isDesignTabVisible(false);
      await mainPage.backToDashboardFromFileEditor();

      // Change role to Editor
      await profilePage.logout();
      await loginPage.enterEmail(process.env.LOGIN_EMAIL);
      await loginPage.enterPwd(process.env.LOGIN_PWD);
      await loginPage.clickLoginButton();
      await dashboardPage.isDashboardOpenedAfterLogin();
      await teamPage.switchTeam(teamName);
      await teamPage.openMembersPageViaOptionsMenu();
      await teamPage.selectMemberRoleInPopUp(userName, 'Editor');

      // Verify Editor rights
      await profilePage.logout();
      await loginPage.enterEmail(userEmail);
      await loginPage.enterPwd(process.env.LOGIN_PWD);
      await loginPage.clickLoginButton();
      await dashboardPage.isDashboardOpenedAfterLogin();
      await teamPage.switchTeam(teamName);
      await dashboardPage.openFileWithName('New File 1');
      await mainPage.waitForViewportVisible();
      await mainPage.isDesignTabVisible(true);
      await mainPage.backToDashboardFromFileEditor();
    },
  );

  mainTest(
    qase(1869, 'Change a role of admin to viewer after accepting an invitation'),
    async ({ page }) => {
      const teamName = `${random()}-viewer-role-autotest`;
      const adminName = `${random()}-viewer-role-autotest`;
      const adminEmail = `${process.env.GMAIL_NAME}+${adminName}${process.env.GMAIL_DOMAIN}`;

      const loginPage = new LoginPage(page);
      const registerPage = new RegisterPage(page);
      const dashboardPage = new DashboardPage(page);
      const teamPage = new TeamPage(page);
      const profilePage = new ProfilePage(page);
      const mainPage = new MainPage(page);

      // Create team & file
      await teamPage.createTeam(teamName);
      await teamPage.isTeamSelected(teamName);
      await dashboardPage.createFileViaPlaceholder();
      await mainPage.waitForViewportVisible();
      await mainPage.createDefaultRectangleByCoordinates(200, 300);
      await mainPage.createComponentViaRightClick();
      await mainPage.waitForChangeIsSaved();
      await mainPage.backToDashboardFromFileEditor();

      // Invite Admin
      await teamPage.openInvitationsPageViaOptionsMenu();
      await teamPage.clickInviteMembersToTeamButton();
      await teamPage.enterEmailToInviteMembersPopUp(adminEmail);
      await teamPage.selectInvitationRoleInPopUp('Admin');
      await teamPage.clickSendInvitationButton();

      await page.context().clearCookies();

      const invite = await waitMessage(page, adminEmail, 60);
      await page.goto(invite.inviteUrl);
      await registerPage.registerAccount(
        adminName,
        adminEmail,
        process.env.LOGIN_PWD,
      );
      await dashboardPage.fillOnboardingQuestions();
      await teamPage.isTeamSelected(teamName);

      // Change Admin → Viewer
      await profilePage.logout();
      await loginPage.enterEmail(process.env.LOGIN_EMAIL);
      await loginPage.enterPwd(process.env.LOGIN_PWD);
      await loginPage.clickLoginButton();
      await dashboardPage.isDashboardOpenedAfterLogin();
      await teamPage.switchTeam(teamName);
      await teamPage.openMembersPageViaOptionsMenu();
      await teamPage.selectMemberRoleInPopUp(adminName, 'Viewer');

      // Verify Viewer rights
      await profilePage.logout();
      await loginPage.enterEmail(adminEmail);
      await loginPage.enterPwd(process.env.LOGIN_PWD);
      await loginPage.clickLoginButton();
      await dashboardPage.isDashboardOpenedAfterLogin();
      await teamPage.switchTeam(teamName);
      await dashboardPage.openFileWithName('New File 1');
      await mainPage.waitForViewportVisible();
      await mainPage.isDesignTabVisible(false);
      await mainPage.backToDashboardFromFileEditor();
    },
  );
});
