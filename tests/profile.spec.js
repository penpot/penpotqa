const { dashboardTest } = require("../fixtures");
const { ProfilePage } = require("../pages/profile-page");
const { random } = require("../helpers/string-generator");
const { LoginPage } = require("../pages/login-page");

dashboardTest("PR-1 Edit profile name", async ({ page }) => {
  const newName = random();
  const profilePage = new ProfilePage(page);
  await profilePage.openYourAccountPage();
  await profilePage.isHeaderDisplayed("Your account");
  await profilePage.changeProfileName(newName);
  await profilePage.isSuccessMessageDisplayed("Profile saved successfully!");
  await profilePage.isAccountNameDisplayed(newName);
});

dashboardTest("PR-19 Logout from Account", async ({ page }) => {
  const profilePage = new ProfilePage(page);
  await profilePage.logout();
  const loginPage = new LoginPage(page);
  await loginPage.isHeaderDisplayed("Great to see you again!");
});

dashboardTest(
  "PR-21 Send feedback email with empty fields",
  async ({ page }) => {
    const profilePage = new ProfilePage(page);
    await profilePage.openGiveFeedbackPage();
    await profilePage.isHeaderDisplayed("Your account");
    await profilePage.isSendFeedbackButtonDisabled();
    await profilePage.enterSubjectToGiveFeedbackForm("QA Test");
    await profilePage.isSendFeedbackButtonDisabled();
    await profilePage.clearSubjectInputInGiveFeedbackForm();
    await profilePage.enterDescriptionToGiveFeedbackForm(
      "This is a test feedback triggered by QA team"
    );
    await profilePage.isSendFeedbackButtonDisabled();
  }
);

dashboardTest("PR-22 Send feedback email with valid data", async ({ page }) => {
  const profilePage = new ProfilePage(page);
  await profilePage.openGiveFeedbackPage();
  await profilePage.isHeaderDisplayed("Your account");
  await profilePage.enterSubjectToGiveFeedbackForm("QA Test");
  await profilePage.enterDescriptionToGiveFeedbackForm(
    "This is a test feedback triggered by QA team"
  );
  await profilePage.clickSendFeedbackButton();
  await profilePage.isSuccessMessageDisplayed("Feedback sent");
});
