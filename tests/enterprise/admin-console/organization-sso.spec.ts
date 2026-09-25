/**
 * Qase suite: Admin Console > Sidebar Menu > Organization SSO
 *
 * 3527/3535/3587 run as one sequential case since 3535/3587 both require SSO
 * already active (via 3527) — avoids repeating the expensive setup 3x.
 */
import { qase } from 'playwright-qase-reporter/playwright';
import { ownerAndInviteeTest } from '@tests/enterprise/fixtures/enterprise-fixtures';
import { OrganizationPage } from '@pages/dashboard/organization-page';
import { TeamPage } from '@pages/dashboard/team-page';
import { LoginPage } from '@pages/login-page';
import { createOrgName } from 'helpers/organizations/create-org-name';
import { createTeamName } from 'helpers/teams/create-team-name';
import { subscribeAndCreateOrg } from 'helpers/organizations/subscribe-and-create-org';
import {
  waitSecondMessage,
  waitForMessageCount,
  getRegisterMessage,
  getMessageSubject,
  getMessageText,
  checkSsoActivatedEmailSubject,
  checkSsoActivatedEmailText,
} from 'helpers/gmail';
import { SsoProvider } from '@pages/admin-console/organization-sso-page';

const AUTH0_TEST_SSO_CONFIG = {
  issuerUrl: process.env.ENTERPRISE_SSO_ISSUER_URL!,
  clientId: process.env.ENTERPRISE_SSO_CLIENT_ID!,
  clientSecret: process.env.ENTERPRISE_SSO_CLIENT_SECRET!,
};

ownerAndInviteeTest.describe(
  'Admin Console > Sidebar Menu > Organization SSO',
  () => {
    ownerAndInviteeTest(
      qase(
        [3527, 3535, 3587],
        'Activate SSO (test connection passes), existing session cutoff, deactivate SSO',
      ),
      async ({
        ownerPage,
        orgPage,
        adminConsolePage,
        stripePage,
        teamPage,
        ssoPage,
        invitee,
      }) => {
        ownerAndInviteeTest.slow();

        const orgName = createOrgName();
        const teamName = createTeamName();

        await ownerAndInviteeTest.step(
          'Setup: create OrgA with a team, and get the invitee an active session inside it',
          async () => {
            await subscribeAndCreateOrg(
              orgPage,
              adminConsolePage,
              stripePage,
              orgName,
            );
            await adminConsolePage.goToFiles();
            await teamPage.createTeam(teamName);

            await teamPage.openInvitationsPageViaOptionsMenu();
            await teamPage.clickInviteMembersToTeamButton();
            await teamPage.enterEmailToInviteMembersPopUp(invitee.email);
            await teamPage.clickSendInvitationButton();

            // Not waitMessage() — it'd return the invitee's stale registration email.
            await waitSecondMessage(ownerPage, invitee.email, 40);
            const invite = await getRegisterMessage(invitee.email);
            await invitee.page.goto(invite!.inviteUrl);

            await orgPage.openOrgSwitcher();
            await orgPage.clickGoToAdminConsole();
          },
        );

        await ownerAndInviteeTest.step(
          'PENPOT-3527: Activate SSO, test connection passes',
          async () => {
            await ssoPage.openSsoConfigTab();
            await ssoPage.selectProvider(SsoProvider.Generic);
            await ssoPage.fillSsoConfig(AUTH0_TEST_SSO_CONFIG);
            await ssoPage.activateSso();
            await ssoPage.isSsoActivatedNotificationVisible(orgName);
            await ssoPage.isSsoConfigActive();
            await ssoPage.isDeactivateSsoButtonVisible();
          },
        );

        await ownerAndInviteeTest.step(
          'PENPOT-3535: Existing session gets an immediate hard cutoff to the SSO login',
          async () => {
            // Bound to invitee.page, not orgPage (ownerPage) — no reload needed.
            const inviteeOrgPage = new OrganizationPage(invitee.page);
            await inviteeOrgPage.isRedirectedToSsoLogin(
              AUTH0_TEST_SSO_CONFIG.issuerUrl,
            );

            // 3rd email to the invitee, after registration and the team invite.
            await waitForMessageCount(ownerPage, invitee.email, 3, 40);
            const subject = await getMessageSubject(invitee.email);
            await checkSsoActivatedEmailSubject(subject, orgName);
            const body = await getMessageText(invitee.email);
            await checkSsoActivatedEmailText(body, orgName);
          },
        );

        await ownerAndInviteeTest.step('PENPOT-3587: Deactivate SSO', async () => {
          await ssoPage.deactivateSso();
          await ssoPage.isSsoDeactivatedNotificationVisible(orgName);
          await ssoPage.isSsoConfigActive(false);
          await ssoPage.isActivateSsoButtonVisible();

          // Invitee can access OrgA's team.
          const inviteeLoginPage = new LoginPage(invitee.page);
          const inviteeOrgPage = new OrganizationPage(invitee.page);
          const inviteeTeamPage = new TeamPage(invitee.page);
          await inviteeLoginPage.goto();
          await inviteeLoginPage.enterEmailAndClickOnContinue(invitee.email);
          await inviteeLoginPage.enterPwd(process.env.LOGIN_PWD!);
          await inviteeLoginPage.clickLoginButton();

          await inviteeOrgPage.openOrgSwitcher();
          await inviteeOrgPage.isOrgListedInDropdown(orgName);
          await inviteeOrgPage.switchToOrg(orgName);
          await inviteeTeamPage.switchTeam(teamName);
        });
      },
    );
  },
);
