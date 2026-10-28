import { type Locator, type Page, expect } from '@playwright/test';
import { BasePage } from '../base-page';

type CommentsFilterOption =
  | 'Show all comments'
  | 'Show only your comments'
  | 'Show only your mentions'
  | 'Hide resolved comments';

export class CommentsPanelPage extends BasePage {
  readonly commentsButton: Locator;
  readonly commentInput: Locator;
  readonly commentText: Locator;
  readonly commentCommentsPanelText: Locator;
  readonly commentAvatarImage: Locator;
  readonly commentReplyText: Locator;
  readonly commentReplyCommentsPanelText: Locator;
  readonly postCommentButton: Locator;
  readonly commentThreadIcon: Locator;
  readonly commentThreadPreview: Locator;
  readonly commentClusterPreviewCard: Locator;
  readonly commentResolvedThreadIcon: Locator;
  readonly commentUnreadThreadIcon: Locator;
  readonly commentReadThreadIcon: Locator;
  readonly commentHeaderOptionsButton: Locator;
  readonly commentOptionsButton: Locator;
  readonly commentEditOptionMenuItem: Locator;
  readonly commentDeleteOptionMenuItem: Locator;
  readonly deleteThreadButton: Locator;
  readonly deleteConversationModalHeading: Locator;
  readonly resolveCommentCheckbox: Locator;
  readonly commentsPanelPlaceholderText: Locator;
  readonly commentsAuthorSection: Locator;
  readonly commentThreadPopUp: Locator;
  readonly commentThreadPopUpHeader: Locator;
  readonly commentsPanelLocationText: Locator;
  readonly commentMentionButton: Locator;
  readonly mentionMenuItem: Locator;
  readonly unreadCommentIcon: Locator;

  // Comments filter dropdown
  readonly commentsDropdown: Locator;
  readonly showAllCommentsOption: Locator;
  readonly showYourCommentsOption: Locator;
  readonly hideResolvedCommentsOption: Locator;
  readonly showYourMentionsOption: Locator;

  constructor(page: Page) {
    super(page);

    this.commentsButton = page.getByRole('button', { name: 'Comments (C)' });
    this.commentInput = page
      .locator('[class*="comments__form"]')
      .getByRole('textbox');
    this.commentText = page.locator(
      'div[class*="comments__item"] span[class*="comments__text"]',
    );
    this.commentCommentsPanelText = page.locator(
      '[class*="sidebar"] div[class*="comments__cover"] div[class*="comments__item"]',
    );
    this.commentAvatarImage = page.locator('.main_ui_comments__avatar-mask');
    this.commentReplyText = this.commentText.nth(1);
    this.commentReplyCommentsPanelText = page.getByText('1 reply', { exact: true });
    this.postCommentButton = page.getByRole('button', { name: 'Post' }).first();
    this.commentThreadIcon = page.locator(
      '[data-testid^="floating-thread-bubble-"]',
    );
    this.commentThreadPreview = page.locator(
      'div[class*="comments-container"] [class*="floating-thread-item-wrapper"]',
    );
    this.commentClusterPreviewCard = page.locator(
      '[class*="floating-preview-hover-card"]',
    );
    this.commentResolvedThreadIcon = page.locator(
      'div[class*="comments-container"] div.main_ui_comments__avatar-solved',
    );
    this.commentUnreadThreadIcon = page.locator(
      'div[class*="comments-container"] div.main_ui_comments__avatar-unread',
    );
    this.commentReadThreadIcon = page.locator(
      'div[class*="comments-container"] div.main_ui_comments__avatar-read',
    );
    this.commentHeaderOptionsButton = page
      .locator('div[class*="thread-header"]')
      .first()
      .getByRole('button', { name: 'Options' });
    this.commentOptionsButton = page
      .locator('div[class*="thread-item-wrapper"]')
      .first()
      .getByRole('button', { name: 'Options' });
    this.commentEditOptionMenuItem = page
      .getByRole('listitem')
      .filter({ hasText: 'Edit' });
    this.commentDeleteOptionMenuItem = page
      .getByRole('listitem')
      .filter({ hasText: 'Delete thread' });
    this.deleteThreadButton = page.getByRole('button', {
      name: 'Delete conversation',
    });
    this.deleteConversationModalHeading = page
      .locator('.main_ui_confirm__modal-container')
      .getByRole('heading', { name: 'Delete conversation' });
    this.resolveCommentCheckbox = page.locator(
      'div[class*="thread-header"] div[class*="checkbox-box"]',
    );
    this.commentsPanelPlaceholderText = page.locator(
      '.main_ui_workspace_comments__thread-group-placeholder',
    );
    this.commentsAuthorSection = page.locator('div[class*="comments__author"]');
    // Thread pop-up on the canvas, its "Comment #N" header, and the panel's "#N - Page" label.
    this.commentThreadPopUp = page.locator(
      'div[class*="comments__floating-thread-wrapper"]',
    );
    this.commentThreadPopUpHeader = page.locator(
      '[class*="comments__floating-thread-header-left"]',
    );
    this.commentsPanelLocationText = page.locator(
      '[class*="sidebar"] [class*="comments__location-text"]',
    );
    this.commentMentionButton = page.locator('[class*="open-mentions-button"]');
    this.mentionMenuItem = page.locator('[class*="comments-mentions-name"]');
    this.unreadCommentIcon = this.commentsButton.locator(
      '[class*="header__unread"]',
    );

    this.commentsDropdown = page.locator(
      '[class*="comments__mode-dropdown-wrapper"]',
    );
    this.showAllCommentsOption = page
      .getByRole('listitem')
      .filter({ hasText: 'Show all comments' });
    this.showYourCommentsOption = page
      .getByRole('listitem')
      .filter({ hasText: 'Show only your comments' });
    this.hideResolvedCommentsOption = page
      .getByRole('listitem')
      .filter({ hasText: 'Hide resolved comments' });
    this.showYourMentionsOption = page
      .getByRole('listitem')
      .filter({ hasText: 'Show only your mentions' });
  }

  /**
   * Get the comment thread bubble by the comment index
   * @param index ("1", "2", "1-2", "1-2-3")
   */
  commentThreadBubbleByIndex(index: string): Locator {
    return this.page.getByTestId('floating-thread-bubble-' + index);
  }

  private commentsFilterOption(name: CommentsFilterOption): Locator {
    return {
      'Show all comments': this.showAllCommentsOption,
      'Show only your comments': this.showYourCommentsOption,
      'Show only your mentions': this.showYourMentionsOption,
      'Hide resolved comments': this.hideResolvedCommentsOption,
    }[name];
  }

  async pressCommentsPanelShortcut() {
    await this.page.keyboard.press('C');
  }

  async pressHideCommentsShortcut() {
    await this.page.keyboard.press('Control+Shift+C');
  }

  async clickCreateCommentButton() {
    await this.commentsButton.click();
  }

  async enterCommentText(text: string) {
    await this.commentInput.pressSequentially(text, { delay: 10 });
  }

  /** Types a new comment or reply in the open form and posts it. */
  async postComment(text: string) {
    await this.enterCommentText(text);
    await this.clickPostCommentButton();
  }

  /** Replaces the text of the comment being edited and saves it. */
  async editComment(text: string) {
    await this.commentInput.first().clear();
    await this.commentInput.first().pressSequentially(text, { delay: 10 });
    await this.clickPostCommentButton();
  }

  async clickPostCommentButton() {
    await this.isPostCommentButtonEnabled();
    await this.postCommentButton.click();
  }

  async isPostCommentButtonEnabled() {
    await expect(
      this.postCommentButton,
      'Comment post button is enabled',
    ).toBeEnabled();
  }

  /** Clicks a thread bubble and opens its pop-up. */
  async openCommentThread(index: string) {
    await this.commentThreadBubbleByIndex(index).click();
    await this.commentThreadPreview.click();
  }

  /**
   * Click a comment thread bubble without opening its thread pop-up
   * (unlike openCommentThread). Used e.g. to expand a merged
   * cluster bubble (index "1-2") into its individual avatars.
   * @param index ("1", "2", "1-2", "1-2-3")
   */
  async clickCommentThreadBubbleByIndex(index: string) {
    const bubble = this.commentThreadBubbleByIndex(index);
    await bubble.waitFor({ state: 'visible' });
    await bubble.hover();
    await bubble.click({ force: true });
  }

  /**
   * @param index ("1", "2", "1-2", "1-2-3")
   */
  async hoverCommentThreadBubbleByIndex(index: string) {
    await this.commentThreadBubbleByIndex(index).hover();
  }

  async isCommentClusterPreviewDisplayed(visible = true) {
    visible
      ? await expect(this.commentClusterPreviewCard).toBeVisible()
      : await expect(this.commentClusterPreviewCard).not.toBeVisible();
  }

  async clickResolvedCommentThreadIcon() {
    await this.commentResolvedThreadIcon.waitFor({ state: 'visible' });
    await this.commentResolvedThreadIcon.hover();
    await this.commentResolvedThreadIcon.click({ force: true });
  }

  async clickCommentHeaderOptionsButton() {
    await this.commentHeaderOptionsButton.click();
  }

  async clickCommentOptionsButton() {
    await this.commentOptionsButton.click();
  }

  async clickEditCommentOption() {
    await this.commentEditOptionMenuItem.click();
  }

  async clickDeleteCommentOption() {
    await this.commentDeleteOptionMenuItem.click();
  }

  async clickDeleteThreadButton() {
    await this.deleteThreadButton.click();
  }

  async isDeleteConversationModalNotVisible() {
    await expect(this.deleteConversationModalHeading).not.toBeVisible();
  }

  async clickResolveCommentCheckbox() {
    await this.resolveCommentCheckbox.click();
  }

  /** The open thread has exactly one comment, with this text. */
  async isCommentDisplayedInPopUp(text: string) {
    await this.hasCommentsInPopUp([text]);
  }

  async isCommentDisplayedInCommentsPanel(text: string) {
    await expect(this.commentCommentsPanelText.first()).toHaveText(text);
  }

  async isCommentReplyDisplayedInPopUp(text: string) {
    await expect(this.commentReplyText).toHaveText(text);
  }

  async isCommentReplyDisplayedInCommentsPanel() {
    await expect(this.commentReplyCommentsPanelText).toBeVisible();
  }

  async isCommentThreadIconVisible(visible = true) {
    visible
      ? await expect(this.commentThreadIcon, 'Comment bubble is shown').toBeVisible()
      : await expect(
          this.commentThreadIcon,
          'Comment bubble is hidden',
        ).toBeHidden();
  }

  async isCommentResolvedThreadIconVisible(visible = true) {
    visible
      ? await expect(
          this.commentResolvedThreadIcon,
          'Resolved comment bubble is shown',
        ).toBeVisible()
      : await expect(
          this.commentResolvedThreadIcon,
          'Resolved comment bubble is hidden',
        ).toBeHidden();
  }

  async isCommentAvatarImageVisible(visible = true) {
    visible
      ? await expect(this.commentAvatarImage).toBeVisible()
      : await expect(this.commentAvatarImage).not.toBeVisible();
  }

  async isCommentUnreadThreadIconVisible(visible = true) {
    visible
      ? await expect(this.commentUnreadThreadIcon.first()).toBeVisible()
      : await expect(this.commentUnreadThreadIcon.first()).not.toBeVisible();
  }

  async isCommentReadThreadIconVisible(visible = true) {
    visible
      ? await expect(this.commentReadThreadIcon.first()).toBeVisible()
      : await expect(this.commentReadThreadIcon.first()).not.toBeVisible();
  }

  async isCommentsPanelPlaceholderDisplayed(text: string) {
    await expect(this.commentsPanelPlaceholderText).toHaveText(text);
  }

  async isResolveCommentCheckboxSelected(selected = true) {
    selected
      ? await expect(
          this.resolveCommentCheckbox,
          'Resolve checkbox is checked',
        ).toContainClass('main_ui_ds_controls_checkbox__checked')
      : await expect(
          this.resolveCommentCheckbox,
          'Resolve checkbox is not checked',
        ).not.toContainClass('main_ui_ds_controls_checkbox__checked');
  }

  async isCommentThreadPopUpVisible(visible = true) {
    visible
      ? await expect(this.commentThreadPopUp, 'Comment pop-up is open').toBeVisible()
      : await expect(
          this.commentThreadPopUp,
          'Comment pop-up is closed',
        ).toBeHidden();
  }

  /** Checks the thread number in the pop-up ("Comment #N") and the panel ("#N - Page"). */
  async hasCommentThreadNumber(number: number, pageName = 'Page 1') {
    await expect(
      this.commentThreadPopUpHeader,
      `Pop-up header is "Comment #${number}"`,
    ).toHaveText(`Comment #${number}`);
    await expect(
      this.commentsPanelLocationText.first(),
      `Panel shows "#${number} - ${pageName}"`,
    ).toHaveText(`#${number} - ${pageName}`);
  }

  /** Checks every comment of the open thread, in order (original first, then replies). */
  async hasCommentsInPopUp(texts: string[]) {
    await expect(
      this.commentText,
      `Pop-up shows ${texts.length} comment(s)`,
    ).toHaveText(texts);
  }

  async clickOnUnreadThreadIcon() {
    await this.commentUnreadThreadIcon.first().click();
  }

  async clickCommentMentionButton() {
    await this.commentMentionButton.click();
  }

  async clickMentionMenuItemByName(name: string) {
    await this.mentionMenuItem.getByText(name, { exact: true }).click();
  }

  /** Opens the comments filter dropdown (Show all / only yours / mentions / hide resolved). */
  async openCommentsFilter() {
    await this.commentsDropdown.click();
    await expect(
      this.showAllCommentsOption,
      'Comments filter is open',
    ).toBeVisible();
  }

  /** Picks an option in the open comments filter; the menu closes after it. */
  async selectCommentsFilterOption(name: CommentsFilterOption) {
    const option = this.commentsFilterOption(name);
    await option.click();
    await expect(
      option,
      'Comments filter closes after picking an option',
    ).toBeHidden();
  }

  /**
   * Checks whether a comments filter option is checked (tick shown). The menu has
   * no ARIA state for it, so it's read from the item's "selected" class.
   */
  async isCommentsFilterOptionChecked(name: CommentsFilterOption, checked = true) {
    const option = this.commentsFilterOption(name);
    checked
      ? await expect(option, `"${name}" is checked`).toHaveClass(/selected/)
      : await expect(option, `"${name}" is not checked`).not.toHaveClass(/selected/);
  }

  /** A resolved thread's bubble on the canvas gets the "avatar-solved" style. */
  async isCommentThreadBubbleResolved(index: string) {
    await expect(
      this.commentThreadBubbleByIndex(index),
      `Comment bubble ${index} is shown as resolved`,
    ).toHaveClass(/avatar-solved/);
  }

  async checkCommentCount(count: number) {
    await expect(this.commentThreadIcon).toHaveCount(count);
  }

  async checkCommentCountInList(count: number) {
    await expect(this.commentCommentsPanelText).toHaveCount(count);
  }

  async areCommentBubblesVisible(bubblesIndexes: string[]) {
    for (const bubbleIndex of bubblesIndexes) {
      await expect(this.commentThreadBubbleByIndex(bubbleIndex)).toBeVisible();
    }
  }

  async isUnreadCommentIconVisible(visible = true) {
    visible
      ? await expect(this.unreadCommentIcon).toBeVisible()
      : await expect(this.unreadCommentIcon).not.toBeVisible();
  }
}
