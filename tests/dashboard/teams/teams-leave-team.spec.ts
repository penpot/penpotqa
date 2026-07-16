import { DashboardPage } from '@pages/dashboard/dashboard-page';
import { ProfilePage } from '@pages/profile-page';
import { RegisterPage } from '@pages/register-page';
import { TeamPage } from '@pages/dashboard/team-page';
import { Page } from '@playwright/test';
import { mainTest } from 'fixtures';
import {
  getVerificationMessage,
  waitMessage,
  waitSecondMessage,
} from 'helpers/gmail';
import { createTeamName } from 'helpers/teams/create-team-name';
import { random } from 'helpers/string-generator';
import { qase } from 'playwright-qase-reporter/playwright';

type SetupResult = {
  dashboardPage: DashboardPage;
  teamName: string;
  teamPage: TeamPage;
};

const teamName = createTeamName();

let setup: SetupResult;

// Helper: create a team, invite user, register via Gmail invite
async function setupInvitedUser(
  page: Parameters<typeof mainTest.beforeEach>[1] extends (
    ...args: infer T
  ) => unknown
    ? Page
    : never,
  role = 'Editor',
) {
  const userName = `${random()}-leave-team-autotest`;
  const userEmail = `${process.env.GMAIL_NAME}+${userName}${process.env.GMAIL_DOMAIN}`;

  const registerPage = new RegisterPage(page);
  const dashboardPage = new DashboardPage(page);
  const teamPage = new TeamPage(page);
  const profilePage = new ProfilePage(page);

  // Create team
  await teamPage.createTeam(teamName);
  await teamPage.isTeamSelected(teamName);

  // Send invite
  await teamPage.openInvitationsPageViaOptionsMenu();
  await teamPage.clickInviteMembersToTeamButton();
  await teamPage.isInviteMembersPopUpHeaderDisplayed('Invite members to the team');
  await teamPage.enterEmailToInviteMembersPopUp(userEmail);

  if (role !== 'Editor') {
    await teamPage.selectInvitationRoleInPopUp(role);
  }

  await teamPage.clickSendInvitationButton();
  await teamPage.isSuccessMessageDisplayed('Invitation sent successfully');

  // Logout before switching to invited user
  await profilePage.logout();

  // Retrieve invite email
  const invite = await waitMessage(page, userEmail, 40);
  if (!invite) {
    throw new Error('Team invitation email was not received');
  }

  // Register invited user
  await page.goto(invite.inviteUrl);
  await registerPage.registerAccount(userName, userEmail, process.env.LOGIN_PWD);
  await waitSecondMessage(page, userEmail, 40);

  const verificationMessage = await getVerificationMessage(userEmail);
  if (!verificationMessage) {
    throw new Error('Verification email was not received');
  }

  await page.goto(verificationMessage.inviteUrl);
  await dashboardPage.fillOnboardingQuestions();
  await teamPage.isTeamSelected(teamName);

  return {
    dashboardPage,
    teamName,
    teamPage,
  };
}

// BeforeEach: set up invited user with correct role based on test title
mainTest.beforeEach(
  'Set up invited user through Gmail flow',
  async ({ page }, testInfo) => {
    const role = testInfo.title.includes('Admin') ? 'Admin' : 'Editor';
    setup = await setupInvitedUser(page, role);
  },
);

// Parameterized tests for Admin and Editor
const roles = [
  { role: 'Admin', qaseId: 1197 },
  { role: 'Editor', qaseId: 1198 },
];

roles.forEach(({ role, qaseId }) => {
  mainTest(
    qase(
      [qaseId],
      `Team Members: ${role} can leave team and return to onboarding (${role.toLowerCase()})`,
    ),
    async () => {
      const { teamPage, dashboardPage, teamName } = setup;

      await mainTest.step(`${role} leaves the team`, async () => {
        await teamPage.openMembersPageViaOptionsMenu();
        await teamPage.leaveTeam(teamName);
      });

      await mainTest.step('Confirm onboarding flow', async () => {
        await dashboardPage.clickOnOnboardingContinueWithoutTeamButton();
      });
    },
  );
});
