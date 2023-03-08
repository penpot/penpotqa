const { dashboardTest } = require("../../fixtures");
const { DashboardPage } = require("../../pages/dashboard-page");
const { test, expect } = require("@playwright/test");

test.afterEach(async ({ page }) => {
  const dashboardPage = new DashboardPage(page);
  await dashboardPage.deleteTeamsIfExist();
});

dashboardTest("DA-76 Create a team", async ({ page }) => {
  const dashboardPage = new DashboardPage(page);
  await dashboardPage.createTeam("New Test Team");
  await dashboardPage.isTeamSelected("New Test Team");
});

dashboardTest(
  "DA-78 Team Invitations - open the form via Invitations tab",
  async ({ page }) => {
    const dashboardPage = new DashboardPage(page);
    await dashboardPage.createTeam("QA Team");
    await dashboardPage.isTeamSelected("QA Team");
    await dashboardPage.openInvitationsPageViaOptionsMenu();
    await dashboardPage.isHeaderDisplayed("Invitations");
    await dashboardPage.clickInviteMembersToTeamButton();
    await dashboardPage.isInviteMembersPopUpHeaderDisplayed(
      "Invite members to the team"
    );
  }
);

dashboardTest(
  "DA-79 Team Invitations - open the form via Team Hero",
  async ({ page }) => {
    const dashboardPage = new DashboardPage(page);
    await dashboardPage.createTeam("QA Team");
    await dashboardPage.isTeamSelected("QA Team");
    await dashboardPage.clickInviteMembersTeamHeroButton();
    await dashboardPage.isInviteMembersPopUpHeaderDisplayed(
      "Invite members to the team"
    );
  }
);

dashboardTest(
  "DA-80 Team Invitations - invite via owner (single invitation, editor)",
  async ({ page }) => {
    const dashboardPage = new DashboardPage(page);
    await dashboardPage.createTeam("QA Team");
    await dashboardPage.isTeamSelected("QA Team");
    await dashboardPage.openInvitationsPageViaOptionsMenu();
    await dashboardPage.isHeaderDisplayed("Invitations");
    await dashboardPage.clickInviteMembersToTeamButton();
    await dashboardPage.isInviteMembersPopUpHeaderDisplayed(
      "Invite members to the team"
    );
    await dashboardPage.enterEmailToInviteMembersPopUp("testeditor@test.com");
    await dashboardPage.clickSendInvitationButton();
    await dashboardPage.isSuccessMessageDisplayed(
      "Invitation sent successfully"
    );
    await dashboardPage.isInvitationRecordDisplayed(
      "testeditor@test.com",
      "Editor",
      "Pending"
    );
  }
);

dashboardTest(
  "DA-81 Team Invitations - invite via owner (single invitation, admin)",
  async ({ page }) => {
    const dashboardPage = new DashboardPage(page);
    await dashboardPage.createTeam("QA Team");
    await dashboardPage.isTeamSelected("QA Team");
    await dashboardPage.openInvitationsPageViaOptionsMenu();
    await dashboardPage.isHeaderDisplayed("Invitations");
    await dashboardPage.clickInviteMembersToTeamButton();
    await dashboardPage.isInviteMembersPopUpHeaderDisplayed(
      "Invite members to the team"
    );
    await dashboardPage.selectInvitationRoleInPopUp("Admin");
    await dashboardPage.enterEmailToInviteMembersPopUp("testadmin@test.com");
    await dashboardPage.clickSendInvitationButton();
    await dashboardPage.isSuccessMessageDisplayed(
      "Invitation sent successfully"
    );
    await dashboardPage.isInvitationRecordDisplayed(
      "testadmin@test.com",
      "Admin",
      "Pending"
    );
  }
);

dashboardTest(
  "DA-90 Team Invitations - resend invitation via owner",
  async ({ page }) => {
    const dashboardPage = new DashboardPage(page);
    await dashboardPage.createTeam("QA Team");
    await dashboardPage.isTeamSelected("QA Team");
    await dashboardPage.openInvitationsPageViaOptionsMenu();
    await dashboardPage.isHeaderDisplayed("Invitations");
    await dashboardPage.clickInviteMembersToTeamButton();
    await dashboardPage.isInviteMembersPopUpHeaderDisplayed(
      "Invite members to the team"
    );
    await dashboardPage.enterEmailToInviteMembersPopUp("testeditor@test.com");
    await dashboardPage.clickSendInvitationButton();
    await dashboardPage.isSuccessMessageDisplayed(
      "Invitation sent successfully"
    );
    await dashboardPage.isInvitationRecordDisplayed(
      "testeditor@test.com",
      "Editor",
      "Pending"
    );
    await dashboardPage.resendInvitation();
    await dashboardPage.isSuccessMessageDisplayed(
      "Invitation sent successfully"
    );
  }
);

dashboardTest(
  "DA-92 Team Invitations - delete invitation via owner",
  async ({ page }) => {
    const dashboardPage = new DashboardPage(page);
    await dashboardPage.createTeam("QA Team");
    await dashboardPage.isTeamSelected("QA Team");
    await dashboardPage.openInvitationsPageViaOptionsMenu();
    await dashboardPage.isHeaderDisplayed("Invitations");
    await dashboardPage.clickInviteMembersToTeamButton();
    await dashboardPage.isInviteMembersPopUpHeaderDisplayed(
      "Invite members to the team"
    );
    await dashboardPage.enterEmailToInviteMembersPopUp("testeditor@test.com");
    await dashboardPage.clickSendInvitationButton();
    await dashboardPage.isSuccessMessageDisplayed(
      "Invitation sent successfully"
    );
    await dashboardPage.isInvitationRecordDisplayed(
      "testeditor@test.com",
      "Editor",
      "Pending"
    );
    await dashboardPage.deleteInvitation();
    await dashboardPage.isInvitationRecordRemoved();
  }
);

dashboardTest(
  "DA-95 Team Invitations - change role in invitation via owner",
  async ({ page }) => {
    const dashboardPage = new DashboardPage(page);
    await dashboardPage.createTeam("QA Team");
    await dashboardPage.isTeamSelected("QA Team");
    await dashboardPage.openInvitationsPageViaOptionsMenu();
    await dashboardPage.isHeaderDisplayed("Invitations");
    await dashboardPage.clickInviteMembersToTeamButton();
    await dashboardPage.isInviteMembersPopUpHeaderDisplayed(
      "Invite members to the team"
    );
    await dashboardPage.enterEmailToInviteMembersPopUp("testrole@test.com");
    await dashboardPage.clickSendInvitationButton();
    await dashboardPage.isSuccessMessageDisplayed(
      "Invitation sent successfully"
    );
    await dashboardPage.isInvitationRecordDisplayed(
      "testrole@test.com",
      "Editor",
      "Pending"
    );
    await dashboardPage.selectInvitationRoleInInvitationRecord("Admin");
    await dashboardPage.isInvitationRecordDisplayed(
      "testrole@test.com",
      "Admin",
      "Pending"
    );
  }
);

dashboardTest(
  "DA-114 Team Settings - upload team profile picture",
  async ({ page }) => {
    const dashboardPage = new DashboardPage(page);
    await dashboardPage.createTeam("New Test Team");
    await dashboardPage.isTeamSelected("New Test Team");
    await dashboardPage.openTeamSettingsPageViaOptionsMenu();
    await dashboardPage.uploadTeamImage("images/images.png");
    await dashboardPage.isInfoMessageDisplayed("Loading image…");
    await dashboardPage.isInfoMessageNotDisplayed();
    await expect(dashboardPage.teamInfoSection).toHaveScreenshot(
      "team-profile-image.png"
    );
  }
);

dashboardTest("DA-119 Rename a team via owner", async ({ page }) => {
  const dashboardPage = new DashboardPage(page);
  await dashboardPage.createTeam("QA Team");
  await dashboardPage.isTeamSelected("QA Team");
  await dashboardPage.renameTeam("Renamed Team");
  await dashboardPage.isTeamSelected("Renamed Team");
});

dashboardTest("DA-122 Delete a team via owner", async ({ page }) => {
  const dashboardPage = new DashboardPage(page);
  await dashboardPage.createTeam("QA Team");
  await dashboardPage.isTeamSelected("QA Team");
  await dashboardPage.deleteTeam("QA Team");
  await dashboardPage.isTeamDeleted("QA Team");
});
