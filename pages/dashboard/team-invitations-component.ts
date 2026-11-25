import { BaseComponent } from '@pages/base-component';
import { type Locator, type Page, expect } from '@playwright/test';

/**
 * A team's Invitations page (team options › Invitations): its "Invite people"
 * button and the dialog it opens. Most of its other actions still live in
 * TeamPage and move here progressively.
 */
export class TeamInvitationsComponent extends BaseComponent {
  readonly emailInput: Locator;
  readonly invitePeopleButton: Locator;
  readonly invitationSentMessage: Locator;
  readonly noPermissionTooltip: Locator;
  readonly sendInvitationButton: Locator;

  /** @param page - A page on the team's Invitations page. */
  constructor(page: Page) {
    super(page, page.getByRole('main'));
    // The invite dialog and the tooltip are rendered outside `main`.
    this.emailInput = page.getByPlaceholder('Emails, comma separated');
    this.invitePeopleButton = this.root.getByTestId('invite-member');
    this.invitationSentMessage = page.getByText('Invitation sent successfully');
    this.noPermissionTooltip = page.getByText(
      "You don't have permission to invite people to this team",
      { exact: true },
    );
    this.sendInvitationButton = page.getByRole('button', {
      name: 'Send invitation',
    });
  }

  /**
   * Invites a person with the default role, from "Invite people", and waits
   * for the confirmation.
   *
   * @param email - Email address to invite.
   */
  async invitePerson(email: string) {
    await this.invitePeopleButton.click();
    // Typed, not filled: the field turns each address into a chip as it's typed.
    await this.emailInput.pressSequentially(email, { delay: 50 });
    await this.sendInvitationButton.click();
    await expect(
      this.invitationSentMessage,
      `An invitation is sent to ${email}`,
    ).toBeVisible();
  }

  /**
   * Checks that "Invite people" is disabled, and that hovering it explains
   * the user has no permission.
   */
  async checkInvitePeopleIsDisabled() {
    await expect(
      this.invitePeopleButton,
      '"Invite people" is disabled',
    ).toBeDisabled();
    // Disabled buttons ignore pointer events, so hover without actionability checks.
    await this.invitePeopleButton.hover({ force: true });
    await expect(
      this.noPermissionTooltip,
      '"Invite people" explains the user has no permission',
    ).toBeVisible();
  }
}
