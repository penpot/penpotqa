/**
 * Qase suite: Enterprise Dashboard > Teams Dropdown > Team Management Options > Invitations (Enterprise)
 *
 * Stubs below (`test.skip`) await automation — see the Enterprise Plan
 * automation plan.
 *
 * Base fixture: `demoAccountApiFixture` (does NOT grant Enterprise
 * entitlement by itself — see enterprise-fixtures.ts's `enterprisePageTest`/
 * `ownerAndInviteeTest`). Per-case "Accounts:" notes cover invitees
 * needing a real, readable inbox instead (see the
 * enterprise-demo-account-email memory).
 */
import { demoAccountApiFixture } from 'fixtures';
import { qase } from 'playwright-qase-reporter/playwright';

demoAccountApiFixture.describe(
  'Enterprise Dashboard > Teams Dropdown > Team Management Options > Invitations (Enterprise)',
  () => {
    demoAccountApiFixture.skip(
      qase(
        [3078],
        'Team admin invites existing Penpot user to team within organization',
      ),
      async ({ page }) => {
        /**
         * Qase steps (see PENPOT-3078 for full detail):
         * 1. Log in as team admin
         * 2. Navigate to Team Settings
         * 3. Open Invitations tab
         * 4. Click Invite, enter invitee email, send → confirmation message displayed
         *
         * Accounts: team admin → createDemoUser() (email never read). Invitee
         * → createInviteEmail() from helpers/teams/invite-email.ts, NOT
         * createDemoUser() — this same invitee address is reused by PENPOT-3079
         * (reads the invite email) and PENPOT-3080 (clicks its accept link), and
         * a demo profile's email (demo-<uuid>@demo.example.com) is never
         * deliverable — see the enterprise-demo-account-email memory.
         */
        // TODO: automate — see automation plan (not yet unblocked, or not yet reached
        // in the implementation order from section 4).
      },
    );

    demoAccountApiFixture.skip(
      qase([3079], 'Verify invitation email includes organization and team name'),
      async ({ page }) => {
        /**
         * Qase steps (see PENPOT-3079 for full detail):
         * 1. Open invitee’s inbox
         * 2. Open the invitation email from Penpot
         * 3. Subject includes org and team names
         * 4. Body clearly displays org name and team name
         *
         * Accounts: invitee → createInviteEmail() (helpers/teams/invite-email.ts)
         * + waitMessage()/getRegisterMessage() (helpers/gmail.js) to read the
         * email back. Same invitee as PENPOT-3078/3080. A demo account cannot
         * be used here — its inbox is not real (see the
         * enterprise-demo-account-email memory).
         */
        // TODO: automate — see automation plan (not yet unblocked, or not yet reached
        // in the implementation order from section 4).
      },
    );

    demoAccountApiFixture.skip(
      qase(
        [3080],
        'Invited user accepts invitation and becomes organization member',
      ),
      async ({ page }) => {
        /**
         * Qase steps (see PENPOT-3080 for full detail):
         * 1. Log in as invitee
         * 2. Accept the team invite from inbox → success message
         * 3. Log in as org owner
         * 4. Admin Console > People > Members → invitee now appears as an org member
         *
         * Accounts: invitee → createInviteEmail() + waitMessage() to fetch the
         * accept-invite link (same invitee as PENPOT-3078/3079 — a demo
         * account's inbox can't be read, see the enterprise-demo-account-email
         * memory). Org owner → createDemoUser() (only checks the Members list,
         * never reads email).
         */
        // TODO: automate — see automation plan (not yet unblocked, or not yet reached
        // in the implementation order from section 4).
      },
    );

    demoAccountApiFixture.skip(
      qase([3081], 'Pending invitation displays in Admin Console invitations list'),
      async ({ page }) => {
        /**
         * Qase steps (see PENPOT-3081 for full detail):
         * 1. Log in as org owner
         * 2. Admin Console > People > Members tab → members list + Invite people button shown
         * 3. Pending invitation visible with correct email/team name
         * 4. Admin Console > People > Pending tab → pending org invitations listed
         *
         * Accounts: org owner → createDemoUser(). No real inbox needed anywhere
         * in this case — it only asserts on the pending-invite record shown in
         * the Admin Console UI, not on anything the invitee receives, so the
         * invite target can be any address (a second createDemoUser(), even).
         */
        // TODO: automate — see automation plan (not yet unblocked, or not yet reached
        // in the implementation order from section 4).
      },
    );
  },
);
