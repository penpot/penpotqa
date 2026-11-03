import { Page } from '@playwright/test';
import { demoAccountApiFixture } from 'fixtures';
import { callPenpotApi } from 'helpers/api/penpot-api';
import { qase } from 'playwright-qase-reporter/playwright';
import { RegisterPage } from 'pages/register-page';
import { ProfilePage } from 'pages/profile-page';
import { DashboardPage } from 'pages/dashboard/dashboard-page';
import { TeamPage } from 'pages/dashboard/team-page';
import { random } from 'helpers/string-generator';
import {
  getVerificationMessage,
  checkInviteText,
  waitMessage,
  waitSecondMessage,
} from 'helpers/gmail';
import { createInviteEmail } from 'helpers/teams/invite-email';
import { createTeamName } from 'helpers/teams/create-team-name';
import { setDemoUserName } from 'helpers/accounts/set-demo-user-name';
import { registerAndDemoUserTest } from './teams-fixtures';

let teamPage: TeamPage;
let registerPage: RegisterPage;
let dashboardPage: DashboardPage;
let profilePage: ProfilePage;

const team = createTeamName();

const initPages = (page: Page) => {
  teamPage = new TeamPage(page);
  registerPage = new RegisterPage(page);
  dashboardPage = new DashboardPage(page);
  profilePage = new ProfilePage(page);
};

demoAccountApiFixture.describe('As Owner - Invitations (demo account)', () => {
  demoAccountApiFixture.beforeEach(async ({ page }) => {
    initPages(page);
    await teamPage.createTeam(team);
  });

  demoAccountApiFixture(
    qase(1164, 'Open the form via Invitations tab'),
    async () => {
      await teamPage.openInvitationsPageViaOptionsMenu();
      await teamPage.clickInviteMembersToTeamButton();
      await teamPage.isInviteMembersPopUpHeaderVisible();
    },
  );

  demoAccountApiFixture(
    qase(1165, 'Open the form via Team Hero ("Invite members" button)'),
    async () => {
      await teamPage.clickInviteMembersTeamHeroButton();
      await teamPage.isInviteMembersPopUpHeaderVisible();
    },
  );

  demoAccountApiFixture(
    qase(1166, 'Invite via owner (single invitation, editor)'),
    async () => {
      const email = createInviteEmail('editor');

      await teamPage.openInvitationsPageViaOptionsMenu();
      await teamPage.clickInviteMembersToTeamButton();
      await teamPage.isInviteMembersPopUpHeaderVisible();
      await teamPage.enterEmailToInviteMembersPopUp(email);
      await teamPage.clickSendInvitationButton();
      await teamPage.isSuccessMessageDisplayed('Invitation sent successfully');

      await teamPage.isInvitationRecordDisplayed([
        { email: email, role: 'Editor', status: 'Pending' },
      ]);
    },
  );

  demoAccountApiFixture(
    qase(1167, 'Invite via owner (single invitation, admin)'),
    async () => {
      const email = createInviteEmail('admin');

      await teamPage.openInvitationsPageViaOptionsMenu();
      await teamPage.clickInviteMembersToTeamButton();
      await teamPage.isInviteMembersPopUpHeaderVisible();

      await teamPage.selectInvitationRoleInPopUp('Admin');
      await teamPage.enterEmailToInviteMembersPopUp(email);

      await teamPage.clickSendInvitationButton();
      await teamPage.isSuccessMessageDisplayed('Invitation sent successfully');

      await teamPage.isInvitationRecordDisplayed([
        { email: email, role: 'Admin', status: 'Pending' },
      ]);
    },
  );

  demoAccountApiFixture(
    qase(1175, 'Fail to send invitation to existing team member'),
    async ({ page }) => {
      const { email } = await callPenpotApi(page.context().request, 'get-profile');

      await teamPage.openInvitationsPageViaOptionsMenu();
      await teamPage.clickInviteMembersToTeamButton();

      await teamPage.isInviteMembersPopUpHeaderVisible();

      await teamPage.enterEmailToInviteMembersPopUp(email);
      await teamPage.isSendInvitationBtnDisabled();

      await teamPage.isSendInvitationWarningExist(
        "Some members are already on the team. We'll invite the rest.",
      );
    },
  );

  demoAccountApiFixture(
    qase(1176, 'Resend multiple invitations via owner'),
    async () => {
      const email1 = createInviteEmail('editor', 'editor1');
      const email2 = createInviteEmail('editor', 'editor2');
      const email3 = createInviteEmail('editor', 'editor3');

      await teamPage.openInvitationsPageViaOptionsMenu();
      await teamPage.clickInviteMembersToTeamButton();
      await teamPage.isInviteMembersPopUpHeaderVisible();
      await teamPage.enterEmailToInviteMembersPopUp([email1, email2, email3]);
      await teamPage.clickSendInvitationButton();
      await teamPage.isSuccessMessageDisplayed('Invitation sent successfully');
      await teamPage.isInvitationRecordDisplayed([
        { email: email1, role: 'Editor', status: 'Pending' },
        { email: email2, role: 'Editor', status: 'Pending' },
        { email: email3, role: 'Editor', status: 'Pending' },
      ]);
      await teamPage.resendInvitation([email1, email2, email3]);
      await teamPage.isSuccessMessageDisplayed('Invitation sent successfully');
    },
  );

  demoAccountApiFixture(
    qase(1178, 'Delete multiple invitations via owner'),
    async () => {
      const email1 = createInviteEmail('editor', 'editor1');
      const email2 = createInviteEmail('editor', 'editor2');
      const email3 = createInviteEmail('editor', 'editor3');

      await teamPage.openInvitationsPageViaOptionsMenu();
      await teamPage.clickInviteMembersToTeamButton();
      await teamPage.isInviteMembersPopUpHeaderVisible();
      await teamPage.enterEmailToInviteMembersPopUp([email1, email2, email3]);
      await teamPage.clickSendInvitationButton();
      await teamPage.isSuccessMessageDisplayed('Invitation sent successfully');
      await teamPage.isInvitationRecordDisplayed([
        { email: email1, role: 'Editor', status: 'Pending' },
        { email: email2, role: 'Editor', status: 'Pending' },
        { email: email3, role: 'Editor', status: 'Pending' },
      ]);
      await teamPage.deleteInvitation([email1, email2, email3]);
      await teamPage.isInvitationRecordRemoved([email1, email2, email3]);
    },
  );

  demoAccountApiFixture(
    qase(1181, 'Change role in invitation via owner'),
    async () => {
      const email = createInviteEmail('editor', 'role');

      await teamPage.openInvitationsPageViaOptionsMenu();
      await teamPage.clickInviteMembersToTeamButton();
      await teamPage.isInviteMembersPopUpHeaderVisible();
      await teamPage.enterEmailToInviteMembersPopUp(email);
      await teamPage.clickSendInvitationButton();
      await teamPage.isSuccessMessageDisplayed('Invitation sent successfully');
      await teamPage.isInvitationRecordDisplayed([
        { email: email, role: 'Editor', status: 'Pending' },
      ]);
      await teamPage.selectInvitationRoleInInvitationRecord('Admin');
      await teamPage.isInvitationRecordDisplayed([
        { email: email, role: 'Admin', status: 'Pending' },
      ]);
    },
  );
});

registerAndDemoUserTest(
  qase(1174, 'Invite to a registered user (not a team member)'),
  async ({ page, email, demoUser: owner }) => {
    const ownerTeamPage = new TeamPage(owner.page);
    const inviteeTeamPage = new TeamPage(page);

    await registerAndDemoUserTest.step(
      'Owner invites the registered user as admin',
      async () => {
        await ownerTeamPage.createTeam(team);
        await ownerTeamPage.openInvitationsPageViaOptionsMenu();
        await ownerTeamPage.clickInviteMembersToTeamButton();
        await ownerTeamPage.selectInvitationRoleInPopUp('Admin');
        await ownerTeamPage.enterEmailToInviteMembersPopUp(email);
        await ownerTeamPage.clickSendInvitationButton();
        await ownerTeamPage.isSuccessMessageDisplayed(
          'Invitation sent successfully',
        );
      },
    );

    await registerAndDemoUserTest.step(
      'Invitee accepts the invite from the email',
      async () => {
        // 2nd message = the invite; the 1st one is the registration email.
        await waitSecondMessage(page, email, 40);
        const invite = await getVerificationMessage(email);
        await page.goto(invite!.inviteUrl);
        await inviteeTeamPage.switchTeam(team);
        await inviteeTeamPage.isTeamSelected(team);
      },
    );
  },
);

demoAccountApiFixture(
  qase(1168, 'Invite via owner (multiple invitations, editor)'),
  async ({ page }) => {
    initPages(page);
    const firstEditor = random().concat('autotest');
    const secondEditor = random().concat('autotest');
    const firstEmail = createInviteEmail('editor', firstEditor);
    const secondEmail = createInviteEmail('editor', secondEditor);
    const owner = 'QA Engineer';

    await demoAccountApiFixture.step('Owner invites two editors', async () => {
      await setDemoUserName(page.context().request, owner);
      await page.reload();
      await teamPage.createTeam(team);
      await teamPage.openInvitationsPageViaOptionsMenu();
      await teamPage.clickInviteMembersToTeamButton();
      await teamPage.isInviteMembersPopUpHeaderVisible();
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
        'Pending',
      );
    });

    const firstInvite = await waitMessage(page, firstEmail, 40);
    const secondInvite = await waitMessage(page, secondEmail, 40);

    await demoAccountApiFixture.step('Check the invite emails', async () => {
      await checkInviteText(firstInvite!.inviteText, team, owner);
      await checkInviteText(secondInvite!.inviteText, team, owner);
    });

    await demoAccountApiFixture.step(
      'Both editors sign up from their invites',
      async () => {
        await profilePage.logout();

        await page.goto(firstInvite!.inviteUrl);
        await registerPage.registerAccount(
          firstEditor,
          firstEmail,
          process.env.LOGIN_PWD,
        );
        await waitSecondMessage(page, firstEmail, 40);
        const firstVerificationMessage = await getVerificationMessage(firstEmail);
        await page.goto(firstVerificationMessage!.inviteUrl);
        await dashboardPage.fillOnboardingQuestions();
        await teamPage.isTeamSelected(team);
        await profilePage.logout();

        await page.goto(secondInvite!.inviteUrl);
        await registerPage.registerAccount(
          secondEditor,
          secondEmail,
          process.env.LOGIN_PWD,
        );
        await waitSecondMessage(page, secondEmail, 40);
        const secondVerificationMessage = await getVerificationMessage(secondEmail);
        await page.goto(secondVerificationMessage!.inviteUrl);
        await dashboardPage.fillOnboardingQuestions();
        await teamPage.isTeamSelected(team);
      },
    );

    await demoAccountApiFixture.step('Both editors are team members', async () => {
      await teamPage.openMembersPageViaOptionsMenu();
      await teamPage.isMultipleMemberRecordDisplayed(
        firstEditor,
        firstEmail,
        'Editor',
      );
      await teamPage.isMultipleMemberRecordDisplayed(
        secondEditor,
        secondEmail,
        'Editor',
      );
    });
  },
);
