const { dashboardTest } = require("../../fixtures");
const { TeamPage } = require("../../pages/dashboard/team-page");
const { test, expect } = require("@playwright/test");
const { ProfilePage } = require("../../pages/profile-page");
const { DashboardPage } = require("../../pages/dashboard/dashboard-page");
const { MainPage } = require("../../pages/workspace/main-page");

test.afterEach(async ({ page }) => {
  const teamPage = new TeamPage(page);
  await teamPage.deleteTeamsIfExist();
});

dashboardTest("DA-76 Create a team", async ({ page }) => {
  const teamPage = new TeamPage(page);
  await teamPage.createTeam("New Test Team");
  await teamPage.isTeamSelected("New Test Team");
});

dashboardTest("DA-77 Team.Switch between teams", async ({ page }) => {
  const teamPage = new TeamPage(page);
  const teamFirst = "QA Test Team 1";
  const teamSecond = "QA Test Team 2";

  await teamPage.createTeam(teamFirst);
  await teamPage.isTeamSelected(teamFirst);
  await teamPage.createTeam(teamSecond);
  await teamPage.isTeamSelected(teamSecond);
  await teamPage.switchTeam(teamFirst);
  await teamPage.switchTeam(teamSecond);
});

dashboardTest(
  "DA-78 Team Invitations - open the form via Invitations tab",
  async ({ page }) => {
    const teamPage = new TeamPage(page);
    await teamPage.createTeam("QA Team");
    await teamPage.isTeamSelected("QA Team");
    await teamPage.openInvitationsPageViaOptionsMenu();
    await teamPage.clickInviteMembersToTeamButton();
    await teamPage.isInviteMembersPopUpHeaderDisplayed(
      "Invite members to the team"
    );
  }
);

dashboardTest(
  "DA-79 Team Invitations - open the form via Team Hero",
  async ({ page }) => {
    const teamPage = new TeamPage(page);
    await teamPage.createTeam("QA Team");
    await teamPage.isTeamSelected("QA Team");
    await teamPage.clickInviteMembersTeamHeroButton();
    await teamPage.isInviteMembersPopUpHeaderDisplayed(
      "Invite members to the team"
    );
  }
);

dashboardTest(
  "DA-80 Team Invitations - invite via owner (single invitation, editor)",
  async ({ page }) => {
    const teamPage = new TeamPage(page);
    await teamPage.createTeam("QA Team");
    await teamPage.isTeamSelected("QA Team");
    await teamPage.openInvitationsPageViaOptionsMenu();
    await teamPage.clickInviteMembersToTeamButton();
    await teamPage.isInviteMembersPopUpHeaderDisplayed(
      "Invite members to the team"
    );
    await teamPage.enterEmailToInviteMembersPopUp("testeditor@test.com");
    await teamPage.clickSendInvitationButton();
    await teamPage.isSuccessMessageDisplayed("Invitation sent successfully");
    await teamPage.isInvitationRecordDisplayed("testeditor@test.com", "Editor", "Pending");
  }
);

dashboardTest(
  "DA-81 Team Invitations - invite via owner (single invitation, admin)",
  async ({ page }) => {
    const teamPage = new TeamPage(page);
    await teamPage.createTeam("QA Team");
    await teamPage.isTeamSelected("QA Team");
    await teamPage.openInvitationsPageViaOptionsMenu();
    await teamPage.clickInviteMembersToTeamButton();
    await teamPage.isInviteMembersPopUpHeaderDisplayed(
      "Invite members to the team"
    );
    await teamPage.selectInvitationRoleInPopUp("Admin");
    await teamPage.enterEmailToInviteMembersPopUp("testadmin@test.com");
    await teamPage.clickSendInvitationButton();
    await teamPage.isSuccessMessageDisplayed(
      "Invitation sent successfully"
    );
    await teamPage.isInvitationRecordDisplayed(
      "testadmin@test.com",
      "Admin",
      "Pending"
    );
  }
);

dashboardTest("DA-89 Team.Invitations-fail to send invitation to existing team member",
  async ({ page }) => {
    const teamPage = new TeamPage(page);
    await teamPage.createTeam("QA Team");
    await teamPage.isTeamSelected("QA Team");
    await teamPage.openInvitationsPageViaOptionsMenu();
    await teamPage.clickInviteMembersToTeamButton();
    await teamPage.isInviteMembersPopUpHeaderDisplayed("Invite members to the team");
    await teamPage.enterEmailToInviteMembersPopUp(process.env.LOGIN_EMAIL);
    await teamPage.isSendInvitationBtnDisabled();
    await teamPage.isSendInvitationWarningExist(
      "Some emails are from current team members. Their invitations will not be sent.")
  });

dashboardTest(
  "DA-90 Team Invitations - resend invitation via owner",
  async ({ page }) => {
    const teamPage = new TeamPage(page);
    await teamPage.createTeam("QA Team");
    await teamPage.isTeamSelected("QA Team");
    await teamPage.openInvitationsPageViaOptionsMenu();
    await teamPage.clickInviteMembersToTeamButton();
    await teamPage.isInviteMembersPopUpHeaderDisplayed(
      "Invite members to the team"
    );
    await teamPage.enterEmailToInviteMembersPopUp("testeditor@test.com");
    await teamPage.clickSendInvitationButton();
    await teamPage.isSuccessMessageDisplayed(
      "Invitation sent successfully"
    );
    await teamPage.isInvitationRecordDisplayed(
      "testeditor@test.com",
      "Editor",
      "Pending"
    );
    await teamPage.resendInvitation();
    await teamPage.isSuccessMessageDisplayed(
      "Invitation sent successfully"
    );
  }
);

dashboardTest(
  "DA-92 Team Invitations - delete invitation via owner",
  async ({ page }) => {
    const teamPage = new TeamPage(page);
    await teamPage.createTeam("QA Team");
    await teamPage.isTeamSelected("QA Team");
    await teamPage.openInvitationsPageViaOptionsMenu();
    await teamPage.clickInviteMembersToTeamButton();
    await teamPage.isInviteMembersPopUpHeaderDisplayed(
      "Invite members to the team"
    );
    await teamPage.enterEmailToInviteMembersPopUp("testeditor@test.com");
    await teamPage.clickSendInvitationButton();
    await teamPage.isSuccessMessageDisplayed(
      "Invitation sent successfully"
    );
    await teamPage.isInvitationRecordDisplayed(
      "testeditor@test.com",
      "Editor",
      "Pending"
    );
    await teamPage.deleteInvitation();
    await teamPage.isInvitationRecordRemoved();
  }
);

dashboardTest(
  "DA-95 Team Invitations - change role in invitation via owner",
  async ({ page }) => {
    const teamPage = new TeamPage(page);
    await teamPage.createTeam("QA Team");
    await teamPage.isTeamSelected("QA Team");
    await teamPage.openInvitationsPageViaOptionsMenu();
    await teamPage.clickInviteMembersToTeamButton();
    await teamPage.isInviteMembersPopUpHeaderDisplayed(
      "Invite members to the team"
    );
    await teamPage.enterEmailToInviteMembersPopUp("testrole@test.com");
    await teamPage.clickSendInvitationButton();
    await teamPage.isSuccessMessageDisplayed(
      "Invitation sent successfully"
    );
    await teamPage.isInvitationRecordDisplayed(
      "testrole@test.com",
      "Editor",
      "Pending"
    );
    await teamPage.selectInvitationRoleInInvitationRecord("Admin");
    await teamPage.isInvitationRecordDisplayed(
      "testrole@test.com",
      "Admin",
      "Pending"
    );
  }
);

dashboardTest(
  "DA-114 Team Settings - upload team profile picture",
  async ({ page }) => {
    const teamPage = new TeamPage(page);
    await teamPage.createTeam("New Test Team");
    await teamPage.isTeamSelected("New Test Team");
    await teamPage.openTeamSettingsPageViaOptionsMenu();
    await teamPage.uploadTeamImage("images/images.png");
    await teamPage.isInfoMessageDisplayed("Loading image…");
    await teamPage.waitInfoMessageHidden();
    await expect(teamPage.teamInfoSection).toHaveScreenshot(
      "team-profile-image.png"
    );
  }
);

dashboardTest("DA-116 Team. Settings - check 'Team members' info",
  async ({ page }) => {
  const teamPage = new TeamPage(page);
  const profilePage = new ProfilePage(page);
  await profilePage.openYourAccountPage();
  await profilePage.isHeaderDisplayed("Your account");
  await profilePage.changeProfileName("QA Engineer");
  await profilePage.uploadProfileImage("images/sample.jpeg");
  await profilePage.waitInfoMessageHidden();
  await profilePage.backToDashboardFromAccount();
  await teamPage.createTeam("New Test Team");
  await teamPage.isTeamSelected("New Test Team");
  await teamPage.openTeamSettingsPageViaOptionsMenu();

  const teamOwner = await profilePage.getProfileFullName() + ' (Owner)';
  await teamPage.isTeamOwnerInfoDisplayed(teamOwner);
  await teamPage.isTeamMembersInfoDisplayed("1 members");
  await expect(teamPage.teamOwnerSection).toHaveScreenshot("team-owner-block.png")
});

dashboardTest("DA-117 Team. Settings - check 'Team projects' info",
  async ({ page }) => {
    const dashboardPage = new DashboardPage(page);
    const teamPage = new TeamPage(page);
    const mainPage = new MainPage(page);
    const projectFirst = "QA Project 1";
    const projectSecond = "QA Project 2";

    await teamPage.createTeam("New Test Team");
    await teamPage.isTeamSelected("New Test Team");
    await dashboardPage.createProject(projectFirst);
    await dashboardPage.createProject(projectSecond);
    await dashboardPage.openSidebarItem("Drafts");
    await dashboardPage.createFileViaPlaceholder();
    await mainPage.backToDashboardFromFileEditor();
    await dashboardPage.openProjectFromLeftSidebar(projectFirst);
    await dashboardPage.createFileViaPlaceholder();
    await mainPage.backToDashboardFromFileEditor();
    await dashboardPage.openProjectFromLeftSidebar(projectSecond);
    await dashboardPage.createFileViaPlaceholder();
    await mainPage.backToDashboardFromFileEditor();

    await teamPage.openTeamSettingsPageViaOptionsMenu();
    await teamPage.isTeamProjectsInfoDisplayed("2 projects");
    await teamPage.isTeamFilesInfoDisplayed("3 files");
    await expect(teamPage.teamStatsSection).toHaveScreenshot("team-stats-block.png")
  });

dashboardTest("DA-119 Rename a team via owner", async ({ page }) => {
  const teamPage = new TeamPage(page);
  await teamPage.createTeam("QA Team");
  await teamPage.isTeamSelected("QA Team");
  await teamPage.renameTeam("Renamed Team");
  await teamPage.isTeamSelected("Renamed Team");
});

dashboardTest("DA-122 Delete a team via owner", async ({ page }) => {
  const teamPage = new TeamPage(page);
  await teamPage.createTeam("QA Team");
  await teamPage.isTeamSelected("QA Team");
  await teamPage.deleteTeam("QA Team");
  await teamPage.isTeamDeleted("QA Team");
});
