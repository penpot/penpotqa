const { mainTest } = require('../../fixtures');
const { TeamPage } = require('../../pages/dashboard/team-page');
const { expect, test } = require('@playwright/test');
const { ProfilePage } = require('../../pages/profile-page');
const { DashboardPage } = require('../../pages/dashboard/dashboard-page');
const { MainPage } = require('../../pages/workspace/main-page');
const { random } = require('../../helpers/string-generator');
const { updateTestResults } = require('./../../helpers/saveTestResults.js');
const { qase } = require('playwright-qase-reporter/dist/playwright');
const { getRegisterMessage, checkInviteText } = require('../../helpers/gmail');
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
      await checkInviteText(firstInvite.inviteText, team);
      await checkInviteText(secondInvite.inviteText, team);
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
      await dashboardPage.isOnboardingNextBtnDisplayed();
      await dashboardPage.clickOnOnboardingNextBtn();
      await dashboardPage.checkOnboardingWelcomeHeader('Before you start');
      await dashboardPage.clickOnOnboardingNextBtn();
      await dashboardPage.reloadPage();
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
      await dashboardPage.isOnboardingNextBtnDisplayed();
      await dashboardPage.clickOnOnboardingNextBtn();
      await dashboardPage.checkOnboardingWelcomeHeader('Before you start');
      await dashboardPage.clickOnOnboardingNextBtn();
      await dashboardPage.reloadPage();
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

test.afterEach(async ({ page }, testInfo) => {
  await updateTestResults(testInfo.status, testInfo.retry)
});
