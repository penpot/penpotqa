import { TeamPage } from '@pages/dashboard/team-page';
import { demoTeamWithMembersTest } from './teams-fixtures';
import { checkMessagesCount } from 'helpers/gmail';
import { createTeamInvitations } from 'helpers/teams/create-team-invitations';
import { InvitationRole } from 'helpers/teams/invitation-role';
import { createInviteEmail } from 'helpers/teams/invite-email';
import { qase } from 'playwright-qase-reporter/playwright';

const { Admin, Editor } = InvitationRole;

demoTeamWithMembersTest.describe('Roles permissions (Owner, Admin, Editor)', () => {
  demoTeamWithMembersTest.describe(() => {
    demoTeamWithMembersTest.use({ memberRoles: [Admin] });

    demoTeamWithMembersTest(
      qase([1177], 'Team. Invitations - resend invitation via admin'),
      async ({ members: [admin] }) => {
        const adminTeamPage = new TeamPage(admin.page);
        const email = createInviteEmail('admin');

        await demoTeamWithMembersTest.step('Invite a user as admin', async () => {
          await adminTeamPage.openInvitationsPageViaOptionsMenu();
          await adminTeamPage.clickInviteMembersToTeamButton();
          await adminTeamPage.isInviteMembersPopUpHeaderVisible();
          await adminTeamPage.enterEmailToInviteMembersPopUp(email);
          await adminTeamPage.selectInvitationRoleInPopUp('Admin');
          await adminTeamPage.clickSendInvitationButton();
          await adminTeamPage.isSuccessMessageDisplayed(
            'Invitation sent successfully',
          );
          await adminTeamPage.isMultipleInvitationRecordDisplayed(
            email,
            'Admin',
            'Pending',
          );
        });

        await demoTeamWithMembersTest.step('Resend the invitation', async () => {
          await admin.page.waitForTimeout(5000);
          await adminTeamPage.resendInvitation(email);
          await adminTeamPage.isSuccessMessageDisplayed(
            'Invitation sent successfully',
          );
          await checkMessagesCount(email, 1);
        });
      },
    );

    demoTeamWithMembersTest(
      qase([1190], 'Team. Members - unable to change role of owner via admin'),
      async ({ members: [admin] }) => {
        const adminTeamPage = new TeamPage(admin.page);

        await adminTeamPage.openMembersPageViaOptionsMenu();
        await adminTeamPage.isMemberRoleInPopUpNotDisplayed('QA Tester', 'Owner');
      },
    );

    demoTeamWithMembersTest(
      qase([1192], 'Team. Members - delete team member (as owner)'),
      async ({ teamPage, members: [admin] }) => {
        await teamPage.openMembersPageViaOptionsMenu();
        await teamPage.isMultipleMemberRecordDisplayed(
          admin.name,
          admin.email,
          'Admin',
        );
        await teamPage.deleteTeamMember(admin.name);
      },
    );

    demoTeamWithMembersTest(
      qase([1182], 'Team. Invitations - change role in invitation via admin'),
      async ({ page, team, members: [admin] }) => {
        const adminTeamPage = new TeamPage(admin.page);
        const email = createInviteEmail('editor');

        await demoTeamWithMembersTest.step(
          'Owner invites a user as editor',
          async () => {
            await createTeamInvitations(
              page.context().request,
              team.id,
              [email],
              Editor,
            );
          },
        );

        await demoTeamWithMembersTest.step(
          'Admin changes the invitation role to admin',
          async () => {
            await adminTeamPage.openInvitationsPageViaOptionsMenu();
            await adminTeamPage.isMultipleInvitationRecordDisplayed(
              email,
              'Editor',
              'Pending',
            );
            await adminTeamPage.changeInvitationRole(email, 'Admin');
            await adminTeamPage.openMembersPageViaOptionsMenu();
            await adminTeamPage.openInvitationsPageViaOptionsMenu();
            await adminTeamPage.isMultipleInvitationRecordDisplayed(
              email,
              'Admin',
              'Pending',
            );
          },
        );
      },
    );
  });

  demoTeamWithMembersTest.describe(() => {
    demoTeamWithMembersTest.use({ memberRoles: [Editor] });

    demoTeamWithMembersTest(
      qase([1184], 'Team. Members - change role via owner (editor to admin)'),
      async ({ teamPage, members: [member] }) => {
        const memberTeamPage = new TeamPage(member.page);

        await demoTeamWithMembersTest.step(
          'Owner changes the editor to admin',
          async () => {
            await teamPage.openMembersPageViaOptionsMenu();
            await teamPage.selectMemberRoleInPopUp(member.name, 'Admin');
            await teamPage.isMultipleMemberRecordDisplayed(
              member.name,
              member.email,
              'Admin',
            );
          },
        );

        await demoTeamWithMembersTest.step(
          'Member sees their new admin role',
          async () => {
            await member.page.reload();
            await memberTeamPage.openMembersPageViaOptionsMenu();
            await memberTeamPage.isMultipleMemberRecordDisplayed(
              member.name,
              member.email,
              'Admin',
            );
          },
        );
      },
    );

    demoTeamWithMembersTest(
      qase(
        [1183],
        'Unable to create, edit, resend and delete invitations via editor',
      ),
      async ({ page, team, members: [editor] }) => {
        const editorTeamPage = new TeamPage(editor.page);
        const email = createInviteEmail('admin');

        await demoTeamWithMembersTest.step(
          'Owner invites a user as admin',
          async () => {
            await createTeamInvitations(
              page.context().request,
              team.id,
              [email],
              Admin,
            );
          },
        );

        await demoTeamWithMembersTest.step(
          'Editor cannot manage invitations',
          async () => {
            await editorTeamPage.openInvitationsPageViaOptionsMenu();
            await editorTeamPage.isInviteMembersToTeamButtonHidden();
            await editorTeamPage.isInvitationRecordOptionsDisabled(email);
            await editorTeamPage.isInvitationRoleInPopUpNotDisplayed(
              email,
              'Editor',
            );
            await editorTeamPage.isInvitationSelectionDisabled(email);
          },
        );
      },
    );
  });

  demoTeamWithMembersTest.describe(() => {
    demoTeamWithMembersTest.use({ memberRoles: [Admin, Admin] });

    demoTeamWithMembersTest(
      qase([1187], 'Team. Members - change role via admin(admin to editor)'),
      async ({ members: [firstAdmin, secondAdmin] }) => {
        const firstAdminTeamPage = new TeamPage(firstAdmin.page);
        const secondAdminTeamPage = new TeamPage(secondAdmin.page);

        await demoTeamWithMembersTest.step(
          'Second admin changes the first admin to editor',
          async () => {
            await secondAdminTeamPage.openMembersPageViaOptionsMenu();
            await secondAdminTeamPage.selectMemberRoleInPopUp(
              firstAdmin.name,
              'Editor',
            );
            await secondAdminTeamPage.isMultipleMemberRecordDisplayed(
              firstAdmin.name,
              firstAdmin.email,
              'Editor',
            );
          },
        );

        await demoTeamWithMembersTest.step(
          'First admin sees their new editor role',
          async () => {
            await firstAdmin.page.reload();
            await firstAdminTeamPage.openMembersPageViaOptionsMenu();
            await firstAdminTeamPage.isMultipleMemberRecordDisplayed(
              firstAdmin.name,
              firstAdmin.email,
              'Editor',
            );
          },
        );
      },
    );

    demoTeamWithMembersTest(
      qase([1193], 'Team. Members - delete team member (as admin)'),
      async ({ members: [firstAdmin, secondAdmin] }) => {
        const secondAdminTeamPage = new TeamPage(secondAdmin.page);

        await secondAdminTeamPage.openMembersPageViaOptionsMenu();
        await secondAdminTeamPage.isMultipleMemberRecordDisplayed(
          firstAdmin.name,
          firstAdmin.email,
          'Admin',
        );
        await secondAdminTeamPage.deleteTeamMember(firstAdmin.name);
      },
    );
  });

  demoTeamWithMembersTest.describe(() => {
    demoTeamWithMembersTest.use({ memberRoles: [Admin, Editor] });

    demoTeamWithMembersTest(
      qase([1191], 'Team. Members - unable to change roles via editor'),
      async ({ members: [admin, editor] }) => {
        const editorTeamPage = new TeamPage(editor.page);

        await editorTeamPage.openMembersPageViaOptionsMenu();
        await editorTeamPage.isMultipleMemberRecordDisplayed(
          admin.name,
          admin.email,
          'Admin',
        );
        await editorTeamPage.isMultipleMemberRecordDisplayed(
          editor.name,
          editor.email,
          'Editor',
        );
        await editorTeamPage.isMemberRoleInPopUpNotDisplayed(admin.name, 'Editor');
      },
    );

    demoTeamWithMembersTest(
      qase([1194], 'Team. Members - unable to delete team member (as editor)'),
      async ({ members: [admin, editor] }) => {
        const editorTeamPage = new TeamPage(editor.page);

        await editorTeamPage.openMembersPageViaOptionsMenu();
        await editorTeamPage.isMultipleMemberRecordDisplayed(
          admin.name,
          admin.email,
          'Admin',
        );
        await editorTeamPage.isDeleteTeamMemberDisabled(admin.name);
      },
    );
  });
});
