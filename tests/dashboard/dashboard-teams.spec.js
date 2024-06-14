const { mainTest } = require('../../fixtures');
const { TeamPage } = require('../../pages/dashboard/team-page');
const { expect, test } = require('@playwright/test');
const { ProfilePage } = require('../../pages/profile-page');
const { DashboardPage } = require('../../pages/dashboard/dashboard-page');
const { MainPage } = require('../../pages/workspace/main-page');
const { random } = require('../../helpers/string-generator');
const { updateTestResults } = require('./../../helpers/saveTestResults.js');
const { qase } = require('playwright-qase-reporter/dist/playwright');
const { getRegisterMessage, checkInviteText, checkMessagesCount } = require('../../helpers/gmail');
const { LoginPage } = require('../../pages/login-page');
const { RegisterPage } = require('../../pages/register-page');


test.describe(() => {
  const team = random().concat('autotest');

  mainTest(qase(1162,'DA-76 Create a team'), async ({ page }) => {
    const teamPage = new TeamPage(page);
    await teamPage.createTeam(team);
    await teamPage.isTeamSelected(team);
  });

  test.afterEach(async ({ page }) => {
    const teamPage = new TeamPage(page);
    await teamPage.deleteTeam(team);
  });
});

test.describe(() => {
  const team1 = random().concat('QA Test team 1');
  const team2 = random().concat('QA Test team 2');

  mainTest(qase(1163,'DA-77 Team.Switch between teams'), async ({ page }) => {
    const teamPage = new TeamPage(page);
    await teamPage.createTeam(team1);
    await teamPage.isTeamSelected(team1);
    await teamPage.createTeam(team2);
    await teamPage.isTeamSelected(team2);
    await teamPage.switchTeam(team1);
    await teamPage.switchTeam(team2);
  });

  test.afterEach(async ({ page }) => {
    const teamPage = new TeamPage(page);
    await teamPage.deleteTeams([team1, team2]);
  });
});

test.describe(() => {
  const team = random().concat('autotest');

  mainTest(
    qase(1164,'DA-78 Team Invitations - open the form via Invitations tab'),
    async ({ page }) => {
      const teamPage = new TeamPage(page);
      await teamPage.createTeam(team);
      await teamPage.isTeamSelected(team);
      await teamPage.openInvitationsPageViaOptionsMenu();
      await teamPage.clickInviteMembersToTeamButton();
      await teamPage.isInviteMembersPopUpHeaderDisplayed(
        'Invite members to the team',
      );
    },
  );

  test.afterEach(async ({ page }) => {
    const teamPage = new TeamPage(page);
    await teamPage.deleteTeam(team);
  });
});

test.describe(() => {
  const team = random().concat('autotest');

  mainTest(
    qase(1165,'DA-79 Team Invitations - open the form via Team Hero'),
    async ({ page }) => {
      const teamPage = new TeamPage(page);
      await teamPage.createTeam(team);
      await teamPage.isTeamSelected(team);
      await teamPage.clickInviteMembersTeamHeroButton();
      await teamPage.isInviteMembersPopUpHeaderDisplayed(
        'Invite members to the team',
      );
    },
  );

  test.afterEach(async ({ page }) => {
    const teamPage = new TeamPage(page);
    await teamPage.deleteTeam(team);
  });
});

test.describe(() => {
  const team = random().concat('autotest');

  mainTest(
    qase(1166,'DA-80 Team Invitations invite via owner single invitation, editor'),
    async ({ page }) => {
      const teamPage = new TeamPage(page);
      await teamPage.createTeam(team);
      await teamPage.isTeamSelected(team);
      await teamPage.openInvitationsPageViaOptionsMenu();
      await teamPage.clickInviteMembersToTeamButton();
      await teamPage.isInviteMembersPopUpHeaderDisplayed(
        'Invite members to the team',
      );
      await teamPage.enterEmailToInviteMembersPopUp('testeditor@test.com');
      await teamPage.clickSendInvitationButton();
      await teamPage.isSuccessMessageDisplayed('Invitation sent successfully');
      await teamPage.isInvitationRecordDisplayed(
        'testeditor@test.com',
        'Editor',
        'Pending',
      );
    },
  );

  // mainTest(
  //   qase(1166,'DA-80 Team Invitations invite via owner single invitation, editor'),
  //   async ({ page }) => {
  //     const email = `${process.env.GMAIL_NAME}+${randomName}@gmail.com`;
  //     const teamPage = new TeamPage(page);
  //     const profilePage = new ProfilePage(page);
  //     const loginPage = new LoginPage(page);
  //     const dashboardPage = new DashboardPage(page);
  //     await teamPage.createTeam(team);
  //     await teamPage.isTeamSelected(team);
  //     await teamPage.openInvitationsPageViaOptionsMenu();
  //     await teamPage.clickInviteMembersToTeamButton();
  //     await teamPage.isInviteMembersPopUpHeaderDisplayed(
  //       'Invite members to the team',
  //     );
  //     await teamPage.enterEmailToInviteMembersPopUp(email);
  //     await teamPage.clickSendInvitationButton();
  //     await teamPage.isSuccessMessageDisplayed('Invitation sent successfully');
  //     await teamPage.isInvitationRecordDisplayed(
  //       email,
  //       'Editor',
  //       'Pending',
  //     );
  //     await page.waitForTimeout(30000);
  //     const invite = await getRegisterMessage(email);
  //     await checkInviteText(invite.inviteText, team);
  //     await profilePage.logout();
  //     await loginPage.isLoginPageOpened();
  //
  //     await page.goto(invite.inviteUrl);
  //     await registerPage.isRegisterPageOpened();
  //     await registerPage.enterEmail(email);
  //     await registerPage.enterPassword(process.env.LOGIN_PWD);
  //     await registerPage.clickOnCreateAccountBtn();
  //     await registerPage.enterFullName(team);
  //     await registerPage.clickOnAcceptTermsCheckbox();
  //     await registerPage.clickOnCreateAccountSecondBtn();
  //     await registerPage.isRegisterEmailCorrect(email);
  //     await page.waitForTimeout(30000);
  //     const confirm = await getRegisterMessage(email);
  //     console.log(confirm.inviteUrl);
  //     await page.goto(confirm.inviteUrl);
  //     await teamPage.isTeamSelected(team);
  //
  //     await profilePage.logout();
  //     await loginPage.isLoginPageOpened();
  //     await loginPage.enterEmail(process.env.LOGIN_EMAIL);
  //     await loginPage.enterPwd(process.env.LOGIN_PWD);
  //     await loginPage.clickLoginButton();
  //     await dashboardPage.isDashboardOpenedAfterLogin();
  //   },
  // );

  test.afterEach(async ({ page }) => {
    const teamPage = new TeamPage(page);
    await teamPage.deleteTeam(team);
  });
});

test.describe(() => {
  const team = random().concat('autotest');

  mainTest(
    qase(1167,'DA-81 Team Invitations - invite via owner single invitation, admin'),
    async ({ page }) => {
      const teamPage = new TeamPage(page);
      await teamPage.createTeam(team);
      await teamPage.isTeamSelected(team);
      await teamPage.openInvitationsPageViaOptionsMenu();
      await teamPage.clickInviteMembersToTeamButton();
      await teamPage.isInviteMembersPopUpHeaderDisplayed(
        'Invite members to the team',
      );
      await teamPage.selectInvitationRoleInPopUp('Admin');
      await teamPage.enterEmailToInviteMembersPopUp('testadmin@test.com');
      await teamPage.clickSendInvitationButton();
      await teamPage.isSuccessMessageDisplayed('Invitation sent successfully');
      await teamPage.isInvitationRecordDisplayed(
        'testadmin@test.com',
        'Admin',
        'Pending',
      );
    },
  );

  test.afterEach(async ({ page }) => {
    const teamPage = new TeamPage(page);
    await teamPage.deleteTeam(team);
  });
});

test.describe(() => {
  const team = random().concat('autotest');

  mainTest(
    qase(1175,'DA-89 Team.Invitations-fail to send invitation to existing team member'),
    async ({ page }) => {
      const teamPage = new TeamPage(page);
      await teamPage.createTeam(team);
      await teamPage.isTeamSelected(team);
      await teamPage.openInvitationsPageViaOptionsMenu();
      await teamPage.clickInviteMembersToTeamButton();
      await teamPage.isInviteMembersPopUpHeaderDisplayed(
        'Invite members to the team',
      );
      await teamPage.enterEmailToInviteMembersPopUp(process.env.LOGIN_EMAIL);
      await teamPage.isSendInvitationBtnDisabled();
      await teamPage.isSendInvitationWarningExist(
        'Some emails are from current team members. Their invitations will not be sent.',
      );
    },
  );

  test.afterEach(async ({ page }) => {
    const teamPage = new TeamPage(page);
    await teamPage.deleteTeam(team);
  });
});

test.describe(() => {
  const team = random().concat('autotest');

  mainTest(
    qase(1176,'DA-90 Team Invitations - resend invitation via owner'),
    async ({ page }) => {
      const teamPage = new TeamPage(page);
      await teamPage.createTeam(team);
      await teamPage.isTeamSelected(team);
      await teamPage.openInvitationsPageViaOptionsMenu();
      await teamPage.clickInviteMembersToTeamButton();
      await teamPage.isInviteMembersPopUpHeaderDisplayed(
        'Invite members to the team',
      );
      await teamPage.enterEmailToInviteMembersPopUp('testeditor@test.com');
      await teamPage.clickSendInvitationButton();
      await teamPage.isSuccessMessageDisplayed('Invitation sent successfully');
      await teamPage.isInvitationRecordDisplayed(
        'testeditor@test.com',
        'Editor',
        'Pending',
      );
      await teamPage.resendInvitation();
      await teamPage.isSuccessMessageDisplayed('Invitation sent successfully');
    },
  );

  test.afterEach(async ({ page }) => {
    const teamPage = new TeamPage(page);
    await teamPage.deleteTeam(team);
  });
});

test.describe(() => {
  const team = random().concat('autotest');

  mainTest(
    qase(1178,'DA-92 Team Invitations - delete invitation via owner'),
    async ({ page }) => {
      const teamPage = new TeamPage(page);
      await teamPage.createTeam(team);
      await teamPage.isTeamSelected(team);
      await teamPage.openInvitationsPageViaOptionsMenu();
      await teamPage.clickInviteMembersToTeamButton();
      await teamPage.isInviteMembersPopUpHeaderDisplayed(
        'Invite members to the team',
      );
      await teamPage.enterEmailToInviteMembersPopUp('testeditor@test.com');
      await teamPage.clickSendInvitationButton();
      await teamPage.isSuccessMessageDisplayed('Invitation sent successfully');
      await teamPage.isInvitationRecordDisplayed(
        'testeditor@test.com',
        'Editor',
        'Pending',
      );
      await teamPage.deleteInvitation();
      await teamPage.isInvitationRecordRemoved();
    },
  );

  test.afterEach(async ({ page }) => {
    const teamPage = new TeamPage(page);
    await teamPage.deleteTeam(team);
  });
});

test.describe(() => {
  const team = random().concat('autotest');

  mainTest(
    qase(1181,'DA-95 Team Invitations - change role in invitation via owner'),
    async ({ page }) => {
      const teamPage = new TeamPage(page);
      await teamPage.createTeam(team);
      await teamPage.isTeamSelected(team);
      await teamPage.openInvitationsPageViaOptionsMenu();
      await teamPage.clickInviteMembersToTeamButton();
      await teamPage.isInviteMembersPopUpHeaderDisplayed(
        'Invite members to the team',
      );
      await teamPage.enterEmailToInviteMembersPopUp('testrole@test.com');
      await teamPage.clickSendInvitationButton();
      await teamPage.isSuccessMessageDisplayed('Invitation sent successfully');
      await teamPage.isInvitationRecordDisplayed(
        'testrole@test.com',
        'Editor',
        'Pending',
      );
      await teamPage.selectInvitationRoleInInvitationRecord('Admin');
      await teamPage.isInvitationRecordDisplayed(
        'testrole@test.com',
        'Admin',
        'Pending',
      );
    },
  );

  test.afterEach(async ({ page }) => {
    const teamPage = new TeamPage(page);
    await teamPage.deleteTeam(team);
  });
});

test.describe(() => {
  const team = random().concat('autotest');

  mainTest(
    qase(1200,'DA-114 Team Settings - upload team profile picture'),
    async ({ page }) => {
      const teamPage = new TeamPage(page);
      await teamPage.createTeam(team);
      await teamPage.isTeamSelected(team);
      await teamPage.openTeamSettingsPageViaOptionsMenu();
      await teamPage.uploadTeamImage('images/images.png');
      await teamPage.waitInfoMessageHidden();
      await teamPage.hoverOnTeamName();
      await expect(teamPage.teamInfoSection).toHaveScreenshot(
        'team-profile-image.png',
        {
          mask: [teamPage.teamNameLabel],
        },
      );
    },
  );

  test.afterEach(async ({ page }) => {
    const teamPage = new TeamPage(page);
    await teamPage.deleteTeam(team);
  });
});

test.describe(() => {
  const team = random().concat('autotest');

  mainTest(qase(1202,"DA-116 Team. Settings - check 'Team members' info"), async ({ page }) => {
    const teamPage = new TeamPage(page);
    const profilePage = new ProfilePage(page);
    await profilePage.openYourAccountPage();
    await profilePage.isHeaderDisplayed('Your account');
    await profilePage.changeProfileName('QA Engineer');
    await profilePage.uploadProfileImage('images/sample.jpeg');
    await profilePage.waitInfoMessageHidden();
    await profilePage.backToDashboardFromAccount();
    await teamPage.createTeam(team);
    await teamPage.isTeamSelected(team);
    await teamPage.openTeamSettingsPageViaOptionsMenu();

    const teamOwner = 'QA Engineer (Owner)';
    await teamPage.isTeamOwnerInfoDisplayed(teamOwner);
    await teamPage.isTeamMembersInfoDisplayed('1 members');
    await expect(teamPage.teamOwnerSection).toHaveScreenshot('team-owner-block.png');
  });

  test.afterEach(async ({ page }) => {
    const teamPage = new TeamPage(page);
    await teamPage.deleteTeam(team);
  });
});

test.describe(() => {
  const team = random().concat('autotest');

  mainTest(
    qase(1203,"DA-117 Team. Settings - check 'Team projects' info"),
    async ({ page }) => {
      const dashboardPage = new DashboardPage(page);
      const teamPage = new TeamPage(page);
      const mainPage = new MainPage(page);
      const projectFirst = 'QA Project 1';
      const projectSecond = 'QA Project 2';

      await teamPage.createTeam(team);
      await teamPage.isTeamSelected(team);
      await dashboardPage.createProject(projectFirst);
      await dashboardPage.pinProjectByName(projectFirst)
      await dashboardPage.createProject(projectSecond);
      await dashboardPage.pinProjectByName(projectSecond)
      await dashboardPage.openSidebarItem('Drafts');
      await dashboardPage.createFileViaPlaceholder();
      await mainPage.backToDashboardFromFileEditor();
      await dashboardPage.openProjectFromLeftSidebar(projectFirst);
      await dashboardPage.createFileViaPlaceholder();
      await mainPage.backToDashboardFromFileEditor();
      await dashboardPage.openProjectFromLeftSidebar(projectSecond);
      await dashboardPage.createFileViaPlaceholder();
      await mainPage.backToDashboardFromFileEditor();

      await teamPage.openTeamSettingsPageViaOptionsMenu();
      await teamPage.isTeamProjectsInfoDisplayed('2 projects');
      await teamPage.isTeamFilesInfoDisplayed('3 files');
      await expect(teamPage.teamStatsSection).toHaveScreenshot(
        'team-stats-block.png',
      );
    },
  );

  test.afterEach(async ({ page }) => {
    const teamPage = new TeamPage(page);
    await teamPage.deleteTeam(team);
  });
});

test.describe(() => {
  const team = random().concat('autotest');
  const teamNew = random().concat('autotest');

  mainTest(qase(1205,'DA-119 Rename a team via owner'), async ({ page }) => {
    const teamPage = new TeamPage(page);
    await teamPage.createTeam(team);
    await teamPage.isTeamSelected(team);
    await teamPage.renameTeam(teamNew);
    await teamPage.isTeamSelected(teamNew);
  });

  test.afterEach(async ({ page }) => {
    const teamPage = new TeamPage(page);
    await teamPage.deleteTeams([team, teamNew]);
  });
});

test.describe(() => {
  const team = random().concat('autotest');

  mainTest(qase(1208,'DA-122 Delete a team via owner'), async ({ page }) => {
    const teamPage = new TeamPage(page);
    await teamPage.createTeam(team);
    await teamPage.isTeamSelected(team);
    await teamPage.deleteTeam(team);
    await teamPage.isTeamDeleted(team);
  });

  test.afterEach(async ({ page }) => {
    const teamPage = new TeamPage(page);
    await teamPage.deleteTeam(team);
  });
});

test.describe(() => {
  const team = random().concat('autotest');
  const firstEditor = random().concat('autotest');
  const secondEditor = random().concat('autotest');

  mainTest(
    qase(1168,'DA-82 Team. Invitations - invite via owner (multiple invitations, editor)'),
    async ({ page }) => {
      const firstEmail = `${process.env.GMAIL_NAME}+${firstEditor}@gmail.com`;
      const secondEmail = `${process.env.GMAIL_NAME}+${secondEditor}@gmail.com`;
      const profilePage = new ProfilePage(page);
      const dashboardPage = new DashboardPage(page);
      const loginPage = new LoginPage(page);
      const teamPage = new TeamPage(page);
      const registerPage = new RegisterPage(page);
      await teamPage.createTeam(team);
      await teamPage.isTeamSelected(team);
      await teamPage.openInvitationsPageViaOptionsMenu();
      await teamPage.clickInviteMembersToTeamButton();
      await teamPage.isInviteMembersPopUpHeaderDisplayed(
        'Invite members to the team',
      );
      await teamPage.enterEmailToInviteMembersPopUp(`${firstEmail}, ${secondEmail}`);
      await teamPage.clickSendInvitationButton();
      await teamPage.isSuccessMessageDisplayed('Invitation sent successfully');
      await teamPage.isMultipleInvitationRecordDisplayed(
        firstEmail,
        'Editor',
        'Pending',
      );
      await teamPage.isMultipleInvitationRecordDisplayed(
        secondEmail,
        'Editor',
        'Pending'
      );
      await page.waitForTimeout(30000);
      const firstInvite = await getRegisterMessage(firstEmail);
      const secondInvite = await getRegisterMessage(secondEmail);
      const user = process.env.CI ? 'QA Engineer' : 'QA Engineer';//'k8q6byz';
      await checkInviteText(firstInvite.inviteText, team, user);
      await checkInviteText(secondInvite.inviteText, team, user);
      await profilePage.logout();
      await loginPage.isLoginPageOpened();

      await page.goto(firstInvite.inviteUrl);
      await registerPage.isRegisterPageOpened();
      await registerPage.enterEmail(firstEmail);
      await registerPage.enterPassword(process.env.LOGIN_PWD);
      await registerPage.clickOnCreateAccountBtn();
      await registerPage.enterFullName(firstEditor);
      await registerPage.clickOnAcceptTermsCheckbox();
      await registerPage.clickOnCreateAccountSecondBtn();
      await dashboardPage.fillOnboardingQuestions();
      await teamPage.isTeamSelected(team);
      await profilePage.logout();
      await loginPage.isLoginPageOpened();
      await page.goto(secondInvite.inviteUrl);
      await registerPage.isRegisterPageOpened();
      await registerPage.enterEmail(secondEmail);
      await registerPage.enterPassword(process.env.LOGIN_PWD);
      await registerPage.clickOnCreateAccountBtn();
      await registerPage.enterFullName(secondEditor);
      await registerPage.clickOnAcceptTermsCheckbox();
      await registerPage.clickOnCreateAccountSecondBtn();
      await dashboardPage.fillOnboardingQuestions();
      await teamPage.isTeamSelected(team);

      await teamPage.openMembersPageViaOptionsMenu();
      await teamPage.isMultipleMemberRecordDisplayed(
        firstEditor,
        firstEmail,
        'Editor'
      );
      await teamPage.isMultipleMemberRecordDisplayed(
        secondEditor,
        secondEmail,
        'Editor'
      );
    },
  );

  test.afterEach(async ({ page }) => {
    const teamPage = new TeamPage(page);
    const dashboardPage = new DashboardPage(page);
    const loginPage = new LoginPage(page);
    const profilePage = new ProfilePage(page);
    await profilePage.logout();
    await loginPage.isLoginPageOpened();
    await loginPage.enterEmail(process.env.LOGIN_EMAIL);
    await loginPage.enterPwd(process.env.LOGIN_PWD);
    await loginPage.clickLoginButton();
    await dashboardPage.isDashboardOpenedAfterLogin();
    await teamPage.switchTeam(team);
    await teamPage.deleteTeam(team);
  });
});

test.describe(() => {
  const team = random().concat('autotest');

  mainTest(
    qase(1173,'DA-87 Team. Invitations - invite via admin (multiple invitations, admin)'),
    async ({ page }, testInfo) => {
      await testInfo.setTimeout(testInfo.timeout + 60000);
      const profilePage = new ProfilePage(page);
      const dashboardPage = new DashboardPage(page);
      const loginPage = new LoginPage(page);
      const teamPage = new TeamPage(page);
      const registerPage = new RegisterPage(page);

      const mainAdmin = random().concat('autotest');
      const firstAdmin = random().concat('autotest');
      const secondAdmin = random().concat('autotest');
      const mainEmail = `${process.env.GMAIL_NAME}+${mainAdmin}@gmail.com`;
      const firstEmail = `${process.env.GMAIL_NAME}+${firstAdmin}@gmail.com`;
      const secondEmail = `${process.env.GMAIL_NAME}+${secondAdmin}@gmail.com`;

      await teamPage.createTeam(team);
      await teamPage.isTeamSelected(team);
      await teamPage.openInvitationsPageViaOptionsMenu();
      await teamPage.clickInviteMembersToTeamButton();
      await teamPage.selectInvitationRoleInPopUp('Admin');
      await teamPage.enterEmailToInviteMembersPopUp(mainEmail);
      await teamPage.clickSendInvitationButton();
      await page.waitForTimeout(30000);
      const mainInvite = await getRegisterMessage(mainEmail);
      await profilePage.logout();
      await loginPage.isLoginPageOpened();

      await page.goto(mainInvite.inviteUrl);
      await registerPage.isRegisterPageOpened();
      await registerPage.enterEmail(mainEmail);
      await registerPage.enterPassword(process.env.LOGIN_PWD);
      await registerPage.clickOnCreateAccountBtn();
      await registerPage.enterFullName(mainAdmin);
      await registerPage.clickOnAcceptTermsCheckbox();
      await registerPage.clickOnCreateAccountSecondBtn();
      await dashboardPage.fillOnboardingQuestions();
      await teamPage.isTeamSelected(team);

      await teamPage.openInvitationsPageViaOptionsMenu();
      await teamPage.clickInviteMembersToTeamButton();
      await teamPage.isInviteMembersPopUpHeaderDisplayed(
        'Invite members to the team',
      );
      await teamPage.enterEmailToInviteMembersPopUp(`${firstEmail}, ${secondEmail}`);
      await teamPage.selectInvitationRoleInPopUp('Admin');
      await teamPage.clickSendInvitationButton();
      await teamPage.isSuccessMessageDisplayed('Invitation sent successfully');
      await teamPage.isMultipleInvitationRecordDisplayed(
        firstEmail,
        'Admin',
        'Pending',
      );
      await teamPage.isMultipleInvitationRecordDisplayed(
        secondEmail,
        'Admin',
        'Pending'
      );
      await page.waitForTimeout(30000);
      const firstInvite = await getRegisterMessage(firstEmail);
      const secondInvite = await getRegisterMessage(secondEmail);
      await checkInviteText(firstInvite.inviteText, team, mainAdmin);
      await checkInviteText(secondInvite.inviteText, team, mainAdmin);
      await profilePage.logout();
      await loginPage.isLoginPageOpened();

      await page.goto(firstInvite.inviteUrl);
      await registerPage.isRegisterPageOpened();
      await registerPage.enterEmail(firstEmail);
      await registerPage.enterPassword(process.env.LOGIN_PWD);
      await registerPage.clickOnCreateAccountBtn();
      await registerPage.enterFullName(firstAdmin);
      await registerPage.clickOnAcceptTermsCheckbox();
      await registerPage.clickOnCreateAccountSecondBtn();
      await dashboardPage.fillOnboardingQuestions();
      await teamPage.isTeamSelected(team);
      await profilePage.logout();
      await loginPage.isLoginPageOpened();
      await page.goto(secondInvite.inviteUrl);
      await registerPage.isRegisterPageOpened();
      await registerPage.enterEmail(secondEmail);
      await registerPage.enterPassword(process.env.LOGIN_PWD);
      await registerPage.clickOnCreateAccountBtn();
      await registerPage.enterFullName(secondAdmin);
      await registerPage.clickOnAcceptTermsCheckbox();
      await registerPage.clickOnCreateAccountSecondBtn();
      await dashboardPage.fillOnboardingQuestions();
      await teamPage.isTeamSelected(team);

      await teamPage.openMembersPageViaOptionsMenu();
      await teamPage.isMultipleMemberRecordDisplayed(
        firstAdmin,
        firstEmail,
        'Admin'
      );
      await teamPage.isMultipleMemberRecordDisplayed(
        secondAdmin,
        secondEmail,
        'Admin'
      );
    },
  );

  test(
    qase(1174,'DA-88 Team. Invitations - send invitation to registered user (but not a team member)'),
    async ({ page }, testInfo) => {
      await testInfo.setTimeout(testInfo.timeout + 60000);
      const profilePage = new ProfilePage(page);
      const dashboardPage = new DashboardPage(page);
      const loginPage = new LoginPage(page);
      const teamPage = new TeamPage(page);
      const registerPage = new RegisterPage(page);

      const secondAdmin = random().concat('autotest');
      const secondEmail = `${process.env.GMAIL_NAME}+${secondAdmin}@gmail.com`;

      await loginPage.goto();
      await loginPage.acceptCookie();
      await loginPage.clickOnCreateAccount();
      await registerPage.isRegisterPageOpened();
      await registerPage.enterEmail(secondEmail);
      await registerPage.enterPassword(process.env.LOGIN_PWD);
      await registerPage.clickOnCreateAccountBtn();

      await registerPage.enterFullName(secondAdmin);
      await registerPage.clickOnAcceptTermsCheckbox();
      await registerPage.clickOnCreateAccountSecondBtn();
      await registerPage.isRegisterEmailCorrect(secondEmail);
      await page.waitForTimeout(30000);
      const register = await getRegisterMessage(secondEmail);
      await page.goto(register.inviteUrl);
      await dashboardPage.fillOnboardingQuestions();

      await profilePage.logout();
      await loginPage.isLoginPageOpened();
      await loginPage.enterEmail(process.env.LOGIN_EMAIL);
      await loginPage.enterPwd(process.env.LOGIN_PWD);
      await loginPage.clickLoginButton();
      await dashboardPage.isDashboardOpenedAfterLogin();
      await teamPage.createTeam(team);
      await teamPage.isTeamSelected(team);
      await teamPage.openInvitationsPageViaOptionsMenu();
      await teamPage.clickInviteMembersToTeamButton();
      await teamPage.selectInvitationRoleInPopUp('Admin');
      await teamPage.enterEmailToInviteMembersPopUp(secondEmail);
      await teamPage.clickSendInvitationButton();
      await profilePage.logout();
      await loginPage.isLoginPageOpened();
      await page.waitForTimeout(30000);
      const invite = await getRegisterMessage(secondEmail);
      await loginPage.enterEmail(secondEmail);
      await loginPage.enterPwd(process.env.LOGIN_PWD);
      await loginPage.clickLoginButton();
      await dashboardPage.isDashboardOpenedAfterLogin();
      await page.goto(invite.inviteUrl);
      await teamPage.switchTeam(team);
      await teamPage.isTeamSelected(team);
    },
  );

  mainTest(
    qase(1177,'DA-91 Team. Invitations - resend invitation via admin'),
    async ({ page }, testInfo) => {
      await testInfo.setTimeout(testInfo.timeout + 60000);
      const profilePage = new ProfilePage(page);
      const dashboardPage = new DashboardPage(page);
      const loginPage = new LoginPage(page);
      const teamPage = new TeamPage(page);
      const registerPage = new RegisterPage(page);

      const mainAdmin = random().concat('autotest');
      const secondAdmin = random().concat('autotest');
      const mainEmail = `${process.env.GMAIL_NAME}+${mainAdmin}@gmail.com`;
      const secondEmail = `${process.env.GMAIL_NAME}+${secondAdmin}@gmail.com`;

      await teamPage.createTeam(team);
      await teamPage.isTeamSelected(team);
      await teamPage.openInvitationsPageViaOptionsMenu();
      await teamPage.clickInviteMembersToTeamButton();
      await teamPage.selectInvitationRoleInPopUp('Admin');
      await teamPage.enterEmailToInviteMembersPopUp(mainEmail);
      await teamPage.clickSendInvitationButton();
      await page.waitForTimeout(30000);
      const mainInvite = await getRegisterMessage(mainEmail);
      await profilePage.logout();
      await loginPage.isLoginPageOpened();

      await page.goto(mainInvite.inviteUrl);
      await registerPage.isRegisterPageOpened();
      await registerPage.enterEmail(mainEmail);
      await registerPage.enterPassword(process.env.LOGIN_PWD);
      await registerPage.clickOnCreateAccountBtn();
      await registerPage.enterFullName(mainAdmin);
      await registerPage.clickOnAcceptTermsCheckbox();
      await registerPage.clickOnCreateAccountSecondBtn();
      await dashboardPage.fillOnboardingQuestions();
      await teamPage.isTeamSelected(team);

      await teamPage.openInvitationsPageViaOptionsMenu();
      await teamPage.clickInviteMembersToTeamButton();
      await teamPage.isInviteMembersPopUpHeaderDisplayed(
        'Invite members to the team',
      );
      await teamPage.enterEmailToInviteMembersPopUp(secondEmail);
      await teamPage.selectInvitationRoleInPopUp('Admin');
      await teamPage.clickSendInvitationButton();
      await teamPage.isSuccessMessageDisplayed('Invitation sent successfully');
      await teamPage.isMultipleInvitationRecordDisplayed(
        secondEmail,
        'Admin',
        'Pending'
      );
      await page.waitForTimeout(20000);
      await teamPage.resendInvitation();
      await teamPage.isSuccessMessageDisplayed('Invitation sent successfully');

      await page.waitForTimeout(30000);
      await checkMessagesCount(secondEmail, 2);
    },
  );

  mainTest(
    qase(1184,'DA-98 Team. Members - change role via owner (editor to admin)'),
    async ({ page }, testInfo) => {
      await testInfo.setTimeout(testInfo.timeout + 60000);
      const profilePage = new ProfilePage(page);
      const dashboardPage = new DashboardPage(page);
      const loginPage = new LoginPage(page);
      const teamPage = new TeamPage(page);
      const registerPage = new RegisterPage(page);

      const secondUser = random().concat('autotest');
      const secondEmail = `${process.env.GMAIL_NAME}+${secondUser}@gmail.com`;

      await teamPage.createTeam(team);
      await teamPage.isTeamSelected(team);
      await teamPage.openInvitationsPageViaOptionsMenu();
      await teamPage.clickInviteMembersToTeamButton();
      await teamPage.isInviteMembersPopUpHeaderDisplayed(
        'Invite members to the team',
      );
      await teamPage.enterEmailToInviteMembersPopUp(secondEmail);
      await teamPage.clickSendInvitationButton();
      await teamPage.isSuccessMessageDisplayed('Invitation sent successfully');
      await page.waitForTimeout(30000);
      const secondInvite = await getRegisterMessage(secondEmail)

      await profilePage.logout();
      await loginPage.isLoginPageOpened();
      await page.goto(secondInvite.inviteUrl);
      await registerPage.isRegisterPageOpened();
      await registerPage.enterEmail(secondEmail);
      await registerPage.enterPassword(process.env.LOGIN_PWD);
      await registerPage.clickOnCreateAccountBtn();
      await registerPage.enterFullName(secondUser);
      await registerPage.clickOnAcceptTermsCheckbox();
      await registerPage.clickOnCreateAccountSecondBtn();
      await dashboardPage.fillOnboardingQuestions();
      await teamPage.isTeamSelected(team);

      await profilePage.logout();
      await loginPage.isLoginPageOpened();
      await loginPage.enterEmail(process.env.LOGIN_EMAIL);
      await loginPage.enterPwd(process.env.LOGIN_PWD);
      await loginPage.clickLoginButton();
      await dashboardPage.isDashboardOpenedAfterLogin();
      await teamPage.switchTeam(team);
      await teamPage.isTeamSelected(team);
      await teamPage.openMembersPageViaOptionsMenu();
      await teamPage.selectMemberRoleInPopUp(secondUser, 'Admin');
      await teamPage.isMultipleMemberRecordDisplayed(
        secondUser,
        secondEmail,
        'Admin'
      );

      await profilePage.logout();
      await loginPage.isLoginPageOpened();
      await loginPage.enterEmail(secondEmail);
      await loginPage.enterPwd(process.env.LOGIN_PWD);
      await loginPage.clickLoginButton();
      await dashboardPage.isDashboardOpenedAfterLogin();
      await teamPage.switchTeam(team);
      await teamPage.isTeamSelected(team);
      await teamPage.openMembersPageViaOptionsMenu();
      await teamPage.isMultipleMemberRecordDisplayed(
        secondUser,
        secondEmail,
        'Admin'
      );
    },
  );

  mainTest(
    qase(1187,'DA-101 Team. Members - change role via admin(admin to editor)'),
    async ({ page }, testInfo) => {
      await testInfo.setTimeout(testInfo.timeout + 60000);
      const firstAdmin = random().concat('autotest');
      const secondAdmin = random().concat('autotest');
      const firstEmail = `${process.env.GMAIL_NAME}+${firstAdmin}@gmail.com`;
      const secondEmail = `${process.env.GMAIL_NAME}+${secondAdmin}@gmail.com`;
      const profilePage = new ProfilePage(page);
      const dashboardPage = new DashboardPage(page);
      const loginPage = new LoginPage(page);
      const teamPage = new TeamPage(page);
      const registerPage = new RegisterPage(page);
      await teamPage.createTeam(team);
      await teamPage.isTeamSelected(team);
      await teamPage.openInvitationsPageViaOptionsMenu();
      await teamPage.clickInviteMembersToTeamButton();
      await teamPage.isInviteMembersPopUpHeaderDisplayed(
        'Invite members to the team',
      );
      await teamPage.enterEmailToInviteMembersPopUp(`${firstEmail}, ${secondEmail}`);
      await teamPage.selectInvitationRoleInPopUp('Admin');
      await teamPage.clickSendInvitationButton();
      await teamPage.isSuccessMessageDisplayed('Invitation sent successfully');
      await page.waitForTimeout(30000);
      const firstInvite = await getRegisterMessage(firstEmail);
      const secondInvite = await getRegisterMessage(secondEmail);

      await profilePage.logout();
      await loginPage.isLoginPageOpened();

      await page.goto(firstInvite.inviteUrl);
      await registerPage.isRegisterPageOpened();
      await registerPage.enterEmail(firstEmail);
      await registerPage.enterPassword(process.env.LOGIN_PWD);
      await registerPage.clickOnCreateAccountBtn();
      await registerPage.enterFullName(firstAdmin);
      await registerPage.clickOnAcceptTermsCheckbox();
      await registerPage.clickOnCreateAccountSecondBtn();
      await dashboardPage.fillOnboardingQuestions();
      await teamPage.isTeamSelected(team);
      await profilePage.logout();
      await loginPage.isLoginPageOpened();
      await page.goto(secondInvite.inviteUrl);
      await registerPage.isRegisterPageOpened();
      await registerPage.enterEmail(secondEmail);
      await registerPage.enterPassword(process.env.LOGIN_PWD);
      await registerPage.clickOnCreateAccountBtn();
      await registerPage.enterFullName(secondAdmin);
      await registerPage.clickOnAcceptTermsCheckbox();
      await registerPage.clickOnCreateAccountSecondBtn();
      await dashboardPage.fillOnboardingQuestions();
      await teamPage.isTeamSelected(team);

      await teamPage.openMembersPageViaOptionsMenu();
      await teamPage.isMultipleMemberRecordDisplayed(
        firstAdmin,
        firstEmail,
        'Admin'
      );
      await teamPage.isMultipleMemberRecordDisplayed(
        secondAdmin,
        secondEmail,
        'Admin'
      );

      await teamPage.selectMemberRoleInPopUp(firstAdmin, 'Editor');
      await teamPage.isMultipleMemberRecordDisplayed(
        firstAdmin,
        firstEmail,
        'Editor'
      );

      await profilePage.logout();
      await loginPage.isLoginPageOpened();
      await loginPage.enterEmail(firstEmail);
      await loginPage.enterPwd(process.env.LOGIN_PWD);
      await loginPage.clickLoginButton();
      await dashboardPage.isDashboardOpenedAfterLogin();
      await teamPage.switchTeam(team);
      await teamPage.isTeamSelected(team);
      await teamPage.openMembersPageViaOptionsMenu();
      await teamPage.isMultipleMemberRecordDisplayed(
        firstAdmin,
        firstEmail,
        'Editor'
      );
    },
  );

  mainTest(
    qase(1191,'DA-105 Team. Members - unable to change roles via editor'),
    async ({ page }, testInfo) => {
      await testInfo.setTimeout(testInfo.timeout + 60000);
      const firstAdmin = random().concat('autotest');
      const secondAdmin = random().concat('autotest');
      const firstEmail = `${process.env.GMAIL_NAME}+${firstAdmin}@gmail.com`;
      const secondEmail = `${process.env.GMAIL_NAME}+${secondAdmin}@gmail.com`;
      const profilePage = new ProfilePage(page);
      const dashboardPage = new DashboardPage(page);
      const loginPage = new LoginPage(page);
      const teamPage = new TeamPage(page);
      const registerPage = new RegisterPage(page);
      await teamPage.createTeam(team);
      await teamPage.isTeamSelected(team);
      await teamPage.openInvitationsPageViaOptionsMenu();
      await teamPage.clickInviteMembersToTeamButton();
      await teamPage.isInviteMembersPopUpHeaderDisplayed(
        'Invite members to the team',
      );
      await teamPage.enterEmailToInviteMembersPopUp(`${firstEmail}`);
      await teamPage.selectInvitationRoleInPopUp('Admin');
      await teamPage.clickSendInvitationButton();
      await teamPage.isSuccessMessageDisplayed('Invitation sent successfully');
      await teamPage.clickInviteMembersToTeamButton();
      await teamPage.isInviteMembersPopUpHeaderDisplayed(
        'Invite members to the team',
      );
      await teamPage.enterEmailToInviteMembersPopUp(`${secondEmail}`);
      await teamPage.selectInvitationRoleInPopUp('Editor');
      await teamPage.clickSendInvitationButton();
      await teamPage.isSuccessMessageDisplayed('Invitation sent successfully');
      await page.waitForTimeout(30000);
      const firstInvite = await getRegisterMessage(firstEmail);
      const secondInvite = await getRegisterMessage(secondEmail);

      await profilePage.logout();
      await loginPage.isLoginPageOpened();

      await page.goto(firstInvite.inviteUrl);
      await registerPage.isRegisterPageOpened();
      await registerPage.enterEmail(firstEmail);
      await registerPage.enterPassword(process.env.LOGIN_PWD);
      await registerPage.clickOnCreateAccountBtn();
      await registerPage.enterFullName(firstAdmin);
      await registerPage.clickOnAcceptTermsCheckbox();
      await registerPage.clickOnCreateAccountSecondBtn();
      await dashboardPage.fillOnboardingQuestions();
      await teamPage.isTeamSelected(team);
      await profilePage.logout();
      await loginPage.isLoginPageOpened();
      await page.goto(secondInvite.inviteUrl);
      await registerPage.isRegisterPageOpened();
      await registerPage.enterEmail(secondEmail);
      await registerPage.enterPassword(process.env.LOGIN_PWD);
      await registerPage.clickOnCreateAccountBtn();
      await registerPage.enterFullName(secondAdmin);
      await registerPage.clickOnAcceptTermsCheckbox();
      await registerPage.clickOnCreateAccountSecondBtn();
      await dashboardPage.fillOnboardingQuestions();
      await teamPage.isTeamSelected(team);

      await teamPage.openMembersPageViaOptionsMenu();
      await teamPage.isMultipleMemberRecordDisplayed(
        firstAdmin,
        firstEmail,
        'Admin'
      );
      await teamPage.isMultipleMemberRecordDisplayed(
        secondAdmin,
        secondEmail,
        'Editor'
      );
      await teamPage.isMemberRoleInPopUpNotDisplayed(firstAdmin, 'Editor');
    },
  );

  mainTest(
    qase(1190,'DA-104 Team. Members - unable to change role of owner via admin'),
    async ({ page }, testInfo) => {
      await testInfo.setTimeout(testInfo.timeout + 60000);
      const firstAdmin = random().concat('autotest');
      const firstEmail = `${process.env.GMAIL_NAME}+${firstAdmin}@gmail.com`;
      const profilePage = new ProfilePage(page);
      const dashboardPage = new DashboardPage(page);
      const loginPage = new LoginPage(page);
      const teamPage = new TeamPage(page);
      const registerPage = new RegisterPage(page);
      await teamPage.createTeam(team);
      await teamPage.isTeamSelected(team);
      await teamPage.openInvitationsPageViaOptionsMenu();
      await teamPage.clickInviteMembersToTeamButton();
      await teamPage.isInviteMembersPopUpHeaderDisplayed(
        'Invite members to the team',
      );
      await teamPage.enterEmailToInviteMembersPopUp(`${firstEmail}`);
      await teamPage.selectInvitationRoleInPopUp('Admin');
      await teamPage.clickSendInvitationButton();
      await teamPage.isSuccessMessageDisplayed('Invitation sent successfully');
      await teamPage.clickInviteMembersToTeamButton();
      await page.waitForTimeout(30000);
      const firstInvite = await getRegisterMessage(firstEmail);

      await profilePage.logout();
      await loginPage.isLoginPageOpened();

      await page.goto(firstInvite.inviteUrl);
      await registerPage.isRegisterPageOpened();
      await registerPage.enterEmail(firstEmail);
      await registerPage.enterPassword(process.env.LOGIN_PWD);
      await registerPage.clickOnCreateAccountBtn();
      await registerPage.enterFullName(firstAdmin);
      await registerPage.clickOnAcceptTermsCheckbox();
      await registerPage.clickOnCreateAccountSecondBtn();
      await dashboardPage.fillOnboardingQuestions();
      await teamPage.isTeamSelected(team);

      await teamPage.openMembersPageViaOptionsMenu();
      const owner = process.env.CI ? 'QA Engineer' : 'QA Engineer';//'k8q6byz';
      await teamPage.isMemberRoleInPopUpNotDisplayed(owner, 'Owner');
    },
  );

  mainTest(
    qase(1183,'DA-97 Team. Invitations - unable to create, edit and delete invitations via editor'),
    async ({ page }, testInfo) => {
      await testInfo.setTimeout(testInfo.timeout + 60000);
      const firstAdmin = random().concat('autotest');
      const secondAdmin = random().concat('autotest');
      const firstEmail = `${process.env.GMAIL_NAME}+${firstAdmin}@gmail.com`;
      const secondEmail = `${process.env.GMAIL_NAME}+${secondAdmin}@gmail.com`;
      const profilePage = new ProfilePage(page);
      const dashboardPage = new DashboardPage(page);
      const loginPage = new LoginPage(page);
      const teamPage = new TeamPage(page);
      const registerPage = new RegisterPage(page);
      await teamPage.createTeam(team);
      await teamPage.isTeamSelected(team);
      await teamPage.openInvitationsPageViaOptionsMenu();
      await teamPage.clickInviteMembersToTeamButton();
      await teamPage.isInviteMembersPopUpHeaderDisplayed(
        'Invite members to the team',
      );
      await teamPage.enterEmailToInviteMembersPopUp(`${firstEmail}`);
      await teamPage.selectInvitationRoleInPopUp('Admin');
      await teamPage.clickSendInvitationButton();
      await teamPage.isSuccessMessageDisplayed('Invitation sent successfully');
      await teamPage.clickInviteMembersToTeamButton();
      await teamPage.isInviteMembersPopUpHeaderDisplayed(
        'Invite members to the team',
      );
      await teamPage.enterEmailToInviteMembersPopUp(`${secondEmail}`);
      await teamPage.selectInvitationRoleInPopUp('Editor');
      await teamPage.clickSendInvitationButton();
      await teamPage.isSuccessMessageDisplayed('Invitation sent successfully');
      await page.waitForTimeout(30000);
      const firstInvite = await getRegisterMessage(firstEmail);
      const secondInvite = await getRegisterMessage(secondEmail);

      await profilePage.logout();
      await loginPage.isLoginPageOpened();

      await page.goto(secondInvite.inviteUrl);
      await registerPage.isRegisterPageOpened();
      await registerPage.enterEmail(secondEmail);
      await registerPage.enterPassword(process.env.LOGIN_PWD);
      await registerPage.clickOnCreateAccountBtn();
      await registerPage.enterFullName(secondAdmin);
      await registerPage.clickOnAcceptTermsCheckbox();
      await registerPage.clickOnCreateAccountSecondBtn();
      await dashboardPage.fillOnboardingQuestions();
      await teamPage.isTeamSelected(team);

      await teamPage.openInvitationsPageViaOptionsMenu();
      await teamPage.isInviteMembersToTeamButtonDisabled();
      await teamPage.isInvitationRecordOptionsDisabled(firstEmail);
      await teamPage.isInvitationRoleInPopUpNotDisplayed(firstAdmin, 'Editor');
    },
  );

  mainTest(
    qase(1197,'DA-111 Team. Members - leave team (as admin)'),
    async ({ page }, testInfo) => {
      await testInfo.setTimeout(testInfo.timeout + 60000);
      const firstAdmin = random().concat('autotest');
      const firstEmail = `${process.env.GMAIL_NAME}+${firstAdmin}@gmail.com`;
      const profilePage = new ProfilePage(page);
      const dashboardPage = new DashboardPage(page);
      const loginPage = new LoginPage(page);
      const teamPage = new TeamPage(page);
      const registerPage = new RegisterPage(page);
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
      await page.waitForTimeout(30000);
      const firstInvite = await getRegisterMessage(firstEmail);

      await profilePage.logout();
      await loginPage.isLoginPageOpened();

      await page.goto(firstInvite.inviteUrl);
      await registerPage.isRegisterPageOpened();
      await registerPage.enterEmail(firstEmail);
      await registerPage.enterPassword(process.env.LOGIN_PWD);
      await registerPage.clickOnCreateAccountBtn();
      await registerPage.enterFullName(firstAdmin);
      await registerPage.clickOnAcceptTermsCheckbox();
      await registerPage.clickOnCreateAccountSecondBtn();
      await dashboardPage.fillOnboardingQuestions();
      await teamPage.isTeamSelected(team);

      await teamPage.openMembersPageViaOptionsMenu();
      await teamPage.leaveTeam(team);
    },
  );

  mainTest(
    qase(1198,'DA-112 Team. Members - leave team (as editor)'),
    async ({ page },testInfo) => {
      await testInfo.setTimeout(testInfo.timeout + 60000);
      const firstAdmin = random().concat('autotest');
      const firstEmail = `${process.env.GMAIL_NAME}+${firstAdmin}@gmail.com`;
      const profilePage = new ProfilePage(page);
      const dashboardPage = new DashboardPage(page);
      const loginPage = new LoginPage(page);
      const teamPage = new TeamPage(page);
      const registerPage = new RegisterPage(page);
      await teamPage.createTeam(team);
      await teamPage.isTeamSelected(team);
      await teamPage.openInvitationsPageViaOptionsMenu();
      await teamPage.clickInviteMembersToTeamButton();
      await teamPage.isInviteMembersPopUpHeaderDisplayed(
        'Invite members to the team',
      );
      await teamPage.enterEmailToInviteMembersPopUp(firstEmail);
      await teamPage.clickSendInvitationButton();
      await teamPage.isSuccessMessageDisplayed('Invitation sent successfully');
      await page.waitForTimeout(30000);
      const firstInvite = await getRegisterMessage(firstEmail);

      await profilePage.logout();
      await loginPage.isLoginPageOpened();

      await page.goto(firstInvite.inviteUrl);
      await registerPage.isRegisterPageOpened();
      await registerPage.enterEmail(firstEmail);
      await registerPage.enterPassword(process.env.LOGIN_PWD);
      await registerPage.clickOnCreateAccountBtn();
      await registerPage.enterFullName(firstAdmin);
      await registerPage.clickOnAcceptTermsCheckbox();
      await registerPage.clickOnCreateAccountSecondBtn();
      await dashboardPage.fillOnboardingQuestions();
      await teamPage.isTeamSelected(team);

      await teamPage.openMembersPageViaOptionsMenu();
      await teamPage.leaveTeam(team);
    },
  );

  mainTest(
    qase(1192,'DA-106 Team. Members - delete team member (as owner)'),
    async ({ page }, testInfo) => {
      await testInfo.setTimeout(testInfo.timeout + 60000);
      const firstAdmin = random().concat('autotest');
      const firstEmail = `${process.env.GMAIL_NAME}+${firstAdmin}@gmail.com`;
      const profilePage = new ProfilePage(page);
      const dashboardPage = new DashboardPage(page);
      const loginPage = new LoginPage(page);
      const teamPage = new TeamPage(page);
      const registerPage = new RegisterPage(page);
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
      await page.waitForTimeout(30000);
      const firstInvite = await getRegisterMessage(firstEmail);

      await profilePage.logout();
      await loginPage.isLoginPageOpened();

      await page.goto(firstInvite.inviteUrl);
      await registerPage.isRegisterPageOpened();
      await registerPage.enterEmail(firstEmail);
      await registerPage.enterPassword(process.env.LOGIN_PWD);
      await registerPage.clickOnCreateAccountBtn();
      await registerPage.enterFullName(firstAdmin);
      await registerPage.clickOnAcceptTermsCheckbox();
      await registerPage.clickOnCreateAccountSecondBtn();
      await dashboardPage.fillOnboardingQuestions();
      await teamPage.isTeamSelected(team);

      await profilePage.logout();
      await loginPage.isLoginPageOpened();
      await loginPage.enterEmail(process.env.LOGIN_EMAIL);
      await loginPage.enterPwd(process.env.LOGIN_PWD);
      await loginPage.clickLoginButton();
      await dashboardPage.isDashboardOpenedAfterLogin();
      await teamPage.switchTeam(team);
      await teamPage.isTeamSelected(team);
      await teamPage.openMembersPageViaOptionsMenu();
      await teamPage.isMultipleMemberRecordDisplayed(
        firstAdmin,
        firstEmail,
        'Admin'
      );
      await teamPage.deleteTeamMember(firstAdmin);
    },
  );

  mainTest(
    qase(1193,'DA-107 Team. Members - delete team member (as admin)'),
    async ({ page }, testInfo) => {
      await testInfo.setTimeout(testInfo.timeout + 60000);
      const firstAdmin = random().concat('autotest');
      const secondAdmin = random().concat('autotest');
      const firstEmail = `${process.env.GMAIL_NAME}+${firstAdmin}@gmail.com`;
      const secondEmail = `${process.env.GMAIL_NAME}+${secondAdmin}@gmail.com`;
      const profilePage = new ProfilePage(page);
      const dashboardPage = new DashboardPage(page);
      const loginPage = new LoginPage(page);
      const teamPage = new TeamPage(page);
      const registerPage = new RegisterPage(page);
      await teamPage.createTeam(team);
      await teamPage.isTeamSelected(team);
      await teamPage.openInvitationsPageViaOptionsMenu();
      await teamPage.clickInviteMembersToTeamButton();
      await teamPage.isInviteMembersPopUpHeaderDisplayed(
        'Invite members to the team',
      );
      await teamPage.enterEmailToInviteMembersPopUp(`${firstEmail}, ${secondEmail}`);
      await teamPage.selectInvitationRoleInPopUp('Admin');
      await teamPage.clickSendInvitationButton();
      await teamPage.isSuccessMessageDisplayed('Invitation sent successfully');
      await page.waitForTimeout(30000);
      const firstInvite = await getRegisterMessage(firstEmail);
      const secondInvite = await getRegisterMessage(secondEmail);

      await profilePage.logout();
      await loginPage.isLoginPageOpened();

      await page.goto(firstInvite.inviteUrl);
      await registerPage.isRegisterPageOpened();
      await registerPage.enterEmail(firstEmail);
      await registerPage.enterPassword(process.env.LOGIN_PWD);
      await registerPage.clickOnCreateAccountBtn();
      await registerPage.enterFullName(firstAdmin);
      await registerPage.clickOnAcceptTermsCheckbox();
      await registerPage.clickOnCreateAccountSecondBtn();
      await dashboardPage.fillOnboardingQuestions();
      await teamPage.isTeamSelected(team);
      await profilePage.logout();
      await loginPage.isLoginPageOpened();
      await page.goto(secondInvite.inviteUrl);
      await registerPage.isRegisterPageOpened();
      await registerPage.enterEmail(secondEmail);
      await registerPage.enterPassword(process.env.LOGIN_PWD);
      await registerPage.clickOnCreateAccountBtn();
      await registerPage.enterFullName(secondAdmin);
      await registerPage.clickOnAcceptTermsCheckbox();
      await registerPage.clickOnCreateAccountSecondBtn();
      await dashboardPage.fillOnboardingQuestions();
      await teamPage.isTeamSelected(team);

      await teamPage.openMembersPageViaOptionsMenu();
      await teamPage.isMultipleMemberRecordDisplayed(
        firstAdmin,
        firstEmail,
        'Admin'
      );
      await teamPage.isMultipleMemberRecordDisplayed(
        secondAdmin,
        secondEmail,
        'Admin'
      );
      await teamPage.deleteTeamMember(firstAdmin);
    },
  );

  mainTest(
    qase(1194,'DA-108 Team. Members - unable to delete team member (as editor)'),
    async ({ page }, testInfo) => {
      await testInfo.setTimeout(testInfo.timeout + 60000);
      const firstAdmin = random().concat('autotest');
      const secondAdmin = random().concat('autotest');
      const firstEmail = `${process.env.GMAIL_NAME}+${firstAdmin}@gmail.com`;
      const secondEmail = `${process.env.GMAIL_NAME}+${secondAdmin}@gmail.com`;
      const profilePage = new ProfilePage(page);
      const dashboardPage = new DashboardPage(page);
      const loginPage = new LoginPage(page);
      const teamPage = new TeamPage(page);
      const registerPage = new RegisterPage(page);
      await teamPage.createTeam(team);
      await teamPage.isTeamSelected(team);
      await teamPage.openInvitationsPageViaOptionsMenu();
      await teamPage.clickInviteMembersToTeamButton();
      await teamPage.isInviteMembersPopUpHeaderDisplayed(
        'Invite members to the team',
      );
      await teamPage.enterEmailToInviteMembersPopUp(`${firstEmail}`);
      await teamPage.selectInvitationRoleInPopUp('Admin');
      await teamPage.clickSendInvitationButton();
      await teamPage.isSuccessMessageDisplayed('Invitation sent successfully');
      await teamPage.clickInviteMembersToTeamButton();
      await teamPage.isInviteMembersPopUpHeaderDisplayed(
        'Invite members to the team',
      );
      await teamPage.enterEmailToInviteMembersPopUp(`${secondEmail}`);
      await teamPage.selectInvitationRoleInPopUp('Editor');
      await teamPage.clickSendInvitationButton();
      await teamPage.isSuccessMessageDisplayed('Invitation sent successfully');
      await page.waitForTimeout(30000);
      const firstInvite = await getRegisterMessage(firstEmail);
      const secondInvite = await getRegisterMessage(secondEmail);

      await profilePage.logout();
      await loginPage.isLoginPageOpened();

      await page.goto(firstInvite.inviteUrl);
      await registerPage.isRegisterPageOpened();
      await registerPage.enterEmail(firstEmail);
      await registerPage.enterPassword(process.env.LOGIN_PWD);
      await registerPage.clickOnCreateAccountBtn();
      await registerPage.enterFullName(firstAdmin);
      await registerPage.clickOnAcceptTermsCheckbox();
      await registerPage.clickOnCreateAccountSecondBtn();
      await dashboardPage.fillOnboardingQuestions();
      await teamPage.isTeamSelected(team);
      await profilePage.logout();
      await loginPage.isLoginPageOpened();
      await page.goto(secondInvite.inviteUrl);
      await registerPage.isRegisterPageOpened();
      await registerPage.enterEmail(secondEmail);
      await registerPage.enterPassword(process.env.LOGIN_PWD);
      await registerPage.clickOnCreateAccountBtn();
      await registerPage.enterFullName(secondAdmin);
      await registerPage.clickOnAcceptTermsCheckbox();
      await registerPage.clickOnCreateAccountSecondBtn();
      await dashboardPage.fillOnboardingQuestions();
      await teamPage.isTeamSelected(team);

      await teamPage.openMembersPageViaOptionsMenu();
      await teamPage.isMultipleMemberRecordDisplayed(
        firstAdmin,
        firstEmail,
        'Admin'
      );
      await teamPage.isMultipleMemberRecordDisplayed(
        secondAdmin,
        secondEmail,
        'Editor'
      );
      await teamPage.isDeleteTeamMemberDisabled(firstAdmin);
    },
  );

  mainTest(
    qase(1182,'DA-96 Team. Invitations - change role in invitation via admin'),
    async ({ page }, testInfo) => {
      await testInfo.setTimeout(testInfo.timeout + 60000);
      const firstAdmin = random().concat('autotest');
      const secondAdmin = random().concat('autotest');
      const firstEmail = `${process.env.GMAIL_NAME}+${firstAdmin}@gmail.com`;
      const secondEmail = `${process.env.GMAIL_NAME}+${secondAdmin}@gmail.com`;
      const profilePage = new ProfilePage(page);
      const dashboardPage = new DashboardPage(page);
      const loginPage = new LoginPage(page);
      const teamPage = new TeamPage(page);
      const registerPage = new RegisterPage(page);
      await teamPage.createTeam(team);
      await teamPage.isTeamSelected(team);
      await teamPage.openInvitationsPageViaOptionsMenu();
      await teamPage.clickInviteMembersToTeamButton();
      await teamPage.isInviteMembersPopUpHeaderDisplayed(
        'Invite members to the team',
      );
      await teamPage.enterEmailToInviteMembersPopUp(`${firstEmail}`);
      await teamPage.selectInvitationRoleInPopUp('Admin');
      await teamPage.clickSendInvitationButton();
      await teamPage.isSuccessMessageDisplayed('Invitation sent successfully');
      await teamPage.clickInviteMembersToTeamButton();
      await teamPage.isInviteMembersPopUpHeaderDisplayed(
        'Invite members to the team',
      );
      await teamPage.enterEmailToInviteMembersPopUp(`${secondEmail}`);
      await teamPage.selectInvitationRoleInPopUp('Editor');
      await teamPage.clickSendInvitationButton();
      await teamPage.isSuccessMessageDisplayed('Invitation sent successfully');
      await page.waitForTimeout(30000);
      const firstInvite = await getRegisterMessage(firstEmail);

      await profilePage.logout();
      await loginPage.isLoginPageOpened();

      await page.goto(firstInvite.inviteUrl);
      await registerPage.isRegisterPageOpened();
      await registerPage.enterEmail(firstEmail);
      await registerPage.enterPassword(process.env.LOGIN_PWD);
      await registerPage.clickOnCreateAccountBtn();
      await registerPage.enterFullName(firstAdmin);
      await registerPage.clickOnAcceptTermsCheckbox();
      await registerPage.clickOnCreateAccountSecondBtn();
      await dashboardPage.fillOnboardingQuestions();
      await teamPage.isTeamSelected(team);
      await teamPage.openInvitationsPageViaOptionsMenu();
      await teamPage.isMultipleInvitationRecordDisplayed(
        secondEmail,
        'Editor',
        'Pending',
      );
      await teamPage.changeInvitationRole(secondAdmin, 'Admin');
      await teamPage.openMembersPageViaOptionsMenu();
      await teamPage.openInvitationsPageViaOptionsMenu();
      await teamPage.isMultipleInvitationRecordDisplayed(
        secondEmail,
        'Admin',
        'Pending',
      );
    },
  );

  test.afterEach(async ({ page }) => {
    const teamPage = new TeamPage(page);
    const dashboardPage = new DashboardPage(page);
    const loginPage = new LoginPage(page);
    const profilePage = new ProfilePage(page);
    await profilePage.logout();
    await loginPage.isLoginPageOpened();
    await loginPage.enterEmail(process.env.LOGIN_EMAIL);
    await loginPage.enterPwd(process.env.LOGIN_PWD);
    await loginPage.clickLoginButton();
    await dashboardPage.isDashboardOpenedAfterLogin();
    await teamPage.switchTeam(team);
    await teamPage.deleteTeam(team);
  });
});

test.describe(() => {
  const team = random().concat('autotest');

  test(
    qase(1188,'DA-102 Team. Members - change role via owner (transfer ownerhip to admin)'),
    async ({ page }, testInfo) => {
      await testInfo.setTimeout(testInfo.timeout + 60000);
      const profilePage = new ProfilePage(page);
      const dashboardPage = new DashboardPage(page);
      const loginPage = new LoginPage(page);
      const teamPage = new TeamPage(page);
      const registerPage = new RegisterPage(page);

      const secondAdmin = random().concat('autotest');
      const secondEmail = `${process.env.GMAIL_NAME}+${secondAdmin}@gmail.com`;

      await loginPage.goto();
      await loginPage.acceptCookie();
      await loginPage.clickOnCreateAccount();
      await registerPage.isRegisterPageOpened();
      await registerPage.enterEmail(secondEmail);
      await registerPage.enterPassword(process.env.LOGIN_PWD);
      await registerPage.clickOnCreateAccountBtn();

      await registerPage.enterFullName(secondAdmin);
      await registerPage.clickOnAcceptTermsCheckbox();
      await registerPage.clickOnCreateAccountSecondBtn();
      await registerPage.isRegisterEmailCorrect(secondEmail);
      await page.waitForTimeout(30000);
      const register = await getRegisterMessage(secondEmail);
      await page.goto(register.inviteUrl);
      await dashboardPage.fillOnboardingQuestions();

      await profilePage.logout();
      await loginPage.isLoginPageOpened();
      await loginPage.enterEmail(process.env.LOGIN_EMAIL);
      await loginPage.enterPwd(process.env.LOGIN_PWD);
      await loginPage.clickLoginButton();
      await dashboardPage.isDashboardOpenedAfterLogin();
      await teamPage.createTeam(team);
      await teamPage.isTeamSelected(team);
      await teamPage.openInvitationsPageViaOptionsMenu();
      await teamPage.clickInviteMembersToTeamButton();
      await teamPage.selectInvitationRoleInPopUp('Admin');
      await teamPage.enterEmailToInviteMembersPopUp(secondEmail);
      await teamPage.clickSendInvitationButton();
      await profilePage.logout();
      await loginPage.isLoginPageOpened();
      await page.waitForTimeout(30000);
      const invite = await getRegisterMessage(secondEmail);
      await loginPage.enterEmail(secondEmail);
      await loginPage.enterPwd(process.env.LOGIN_PWD);
      await loginPage.clickLoginButton();
      await dashboardPage.isDashboardOpenedAfterLogin();
      await page.goto(invite.inviteUrl);
      await teamPage.switchTeam(team);
      await teamPage.isTeamSelected(team);

      await profilePage.logout();
      await loginPage.isLoginPageOpened();
      await loginPage.enterEmail(process.env.LOGIN_EMAIL);
      await loginPage.enterPwd(process.env.LOGIN_PWD);
      await loginPage.clickLoginButton();
      await dashboardPage.isDashboardOpenedAfterLogin();
      await teamPage.switchTeam(team);
      await teamPage.isTeamSelected(team);
      await teamPage.openMembersPageViaOptionsMenu();
      await teamPage.selectMemberRoleInPopUp(secondAdmin, 'Owner');
      await teamPage.clickOnTransferOwnershipButton();
      await teamPage.isMultipleMemberRecordDisplayed(
        secondAdmin,
        secondEmail,
        'Owner'
      );
      await profilePage.logout();
      await loginPage.isLoginPageOpened();
      await loginPage.enterEmail(secondEmail);
      await loginPage.enterPwd(process.env.LOGIN_PWD);
      await loginPage.clickLoginButton();
      await dashboardPage.isDashboardOpenedAfterLogin();
      await teamPage.deleteTeam(team);
    },
  );

  test(
    qase(1189,'DA-103 Team. Members - change role via owner (transfer ownerhip to editor)'),
    async ({ page }, testInfo) => {
      await testInfo.setTimeout(testInfo.timeout + 60000);
      const profilePage = new ProfilePage(page);
      const dashboardPage = new DashboardPage(page);
      const loginPage = new LoginPage(page);
      const teamPage = new TeamPage(page);
      const registerPage = new RegisterPage(page);

      const secondAdmin = random().concat('autotest');
      const secondEmail = `${process.env.GMAIL_NAME}+${secondAdmin}@gmail.com`;

      await loginPage.goto();
      await loginPage.acceptCookie();
      await loginPage.clickOnCreateAccount();
      await registerPage.isRegisterPageOpened();
      await registerPage.enterEmail(secondEmail);
      await registerPage.enterPassword(process.env.LOGIN_PWD);
      await registerPage.clickOnCreateAccountBtn();

      await registerPage.enterFullName(secondAdmin);
      await registerPage.clickOnAcceptTermsCheckbox();
      await registerPage.clickOnCreateAccountSecondBtn();
      await registerPage.isRegisterEmailCorrect(secondEmail);
      await page.waitForTimeout(30000);
      const register = await getRegisterMessage(secondEmail);
      await page.goto(register.inviteUrl);
      await dashboardPage.fillOnboardingQuestions();

      await profilePage.logout();
      await loginPage.isLoginPageOpened();
      await loginPage.enterEmail(process.env.LOGIN_EMAIL);
      await loginPage.enterPwd(process.env.LOGIN_PWD);
      await loginPage.clickLoginButton();
      await dashboardPage.isDashboardOpenedAfterLogin();
      await teamPage.createTeam(team);
      await teamPage.isTeamSelected(team);
      await teamPage.openInvitationsPageViaOptionsMenu();
      await teamPage.clickInviteMembersToTeamButton();
      await teamPage.enterEmailToInviteMembersPopUp(secondEmail);
      await teamPage.clickSendInvitationButton();
      await profilePage.logout();
      await loginPage.isLoginPageOpened();
      await page.waitForTimeout(30000);
      const invite = await getRegisterMessage(secondEmail);
      await loginPage.enterEmail(secondEmail);
      await loginPage.enterPwd(process.env.LOGIN_PWD);
      await loginPage.clickLoginButton();
      await dashboardPage.isDashboardOpenedAfterLogin();
      await page.goto(invite.inviteUrl);
      await teamPage.switchTeam(team);
      await teamPage.isTeamSelected(team);

      await profilePage.logout();
      await loginPage.isLoginPageOpened();
      await loginPage.enterEmail(process.env.LOGIN_EMAIL);
      await loginPage.enterPwd(process.env.LOGIN_PWD);
      await loginPage.clickLoginButton();
      await dashboardPage.isDashboardOpenedAfterLogin();
      await teamPage.switchTeam(team);
      await teamPage.isTeamSelected(team);
      await teamPage.openMembersPageViaOptionsMenu();
      await teamPage.selectMemberRoleInPopUp(secondAdmin, 'Owner');
      await teamPage.clickOnTransferOwnershipButton();
      await teamPage.isMultipleMemberRecordDisplayed(
        secondAdmin,
        secondEmail,
        'Owner'
      );
      await profilePage.logout();
      await loginPage.isLoginPageOpened();
      await loginPage.enterEmail(secondEmail);
      await loginPage.enterPwd(process.env.LOGIN_PWD);
      await loginPage.clickLoginButton();
      await dashboardPage.isDashboardOpenedAfterLogin();
      await teamPage.deleteTeam(team);
    },
  );

  mainTest(
    qase(1196,'DA-110 Team. Members - leave team (as owner)'),
    async ({ page }, testInfo) => {
      await testInfo.setTimeout(testInfo.timeout + 60000);
      const firstAdmin = random().concat('autotest');
      const firstEmail = `${process.env.GMAIL_NAME}+${firstAdmin}@gmail.com`;
      const profilePage = new ProfilePage(page);
      const dashboardPage = new DashboardPage(page);
      const loginPage = new LoginPage(page);
      const teamPage = new TeamPage(page);
      const registerPage = new RegisterPage(page);
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
      await page.waitForTimeout(30000);
      const firstInvite = await getRegisterMessage(firstEmail);

      await profilePage.logout();
      await loginPage.isLoginPageOpened();

      await page.goto(firstInvite.inviteUrl);
      await registerPage.isRegisterPageOpened();
      await registerPage.enterEmail(firstEmail);
      await registerPage.enterPassword(process.env.LOGIN_PWD);
      await registerPage.clickOnCreateAccountBtn();
      await registerPage.enterFullName(firstAdmin);
      await registerPage.clickOnAcceptTermsCheckbox();
      await registerPage.clickOnCreateAccountSecondBtn();
      await dashboardPage.fillOnboardingQuestions();
      await teamPage.isTeamSelected(team);

      await profilePage.logout();
      await loginPage.isLoginPageOpened();
      await loginPage.enterEmail(process.env.LOGIN_EMAIL);
      await loginPage.enterPwd(process.env.LOGIN_PWD);
      await loginPage.clickLoginButton();
      await dashboardPage.isDashboardOpenedAfterLogin();
      await teamPage.switchTeam(team);
      await teamPage.isTeamSelected(team);
      await teamPage.openMembersPageViaOptionsMenu();
      await teamPage.isMultipleMemberRecordDisplayed(
        firstAdmin,
        firstEmail,
        'Admin'
      );
      await teamPage.leaveTeam(team, 'Owner', firstAdmin);
    },
  );

  mainTest(
    qase(1180,'DA-94 Team. Invitations- delete team invitation'),
    async ({ page }, testInfo) => {
      await testInfo.setTimeout(testInfo.timeout + 60000);
      const firstAdmin = random().concat('autotest');
      const firstEmail = `${process.env.GMAIL_NAME}+${firstAdmin}@gmail.com`;
      const profilePage = new ProfilePage(page);
      const dashboardPage = new DashboardPage(page);
      const loginPage = new LoginPage(page);
      const teamPage = new TeamPage(page);
      const registerPage = new RegisterPage(page);
      await teamPage.createTeam(team);
      await teamPage.isTeamSelected(team);
      await teamPage.openInvitationsPageViaOptionsMenu();
      await teamPage.clickInviteMembersToTeamButton();
      await teamPage.isInviteMembersPopUpHeaderDisplayed(
        'Invite members to the team',
      );
      await teamPage.enterEmailToInviteMembersPopUp(`${firstEmail}`);
      await teamPage.selectInvitationRoleInPopUp('Admin');
      await teamPage.clickSendInvitationButton();
      await teamPage.isSuccessMessageDisplayed('Invitation sent successfully');
      await page.waitForTimeout(30000);
      await teamPage.deleteInvitation();
      await teamPage.isInvitationRecordRemoved();
      const firstInvite = await getRegisterMessage(firstEmail);
      await profilePage.logout();
      await loginPage.isLoginPageOpened();

      await page.goto(firstInvite.inviteUrl);
      await teamPage.isSuccessMessageDisplayed('Something wrong has happened.');

      await loginPage.enterEmail(process.env.LOGIN_EMAIL);
      await loginPage.enterPwd(process.env.LOGIN_PWD);
      await loginPage.clickLoginButton();
      await dashboardPage.isDashboardOpenedAfterLogin();
      await teamPage.switchTeam(team);
      await teamPage.deleteTeam(team);
    },
  );

});

test.afterEach(async ({ page }, testInfo) => {
  await updateTestResults(testInfo.status, testInfo.retry)
});
