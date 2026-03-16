const { expect } = require('@playwright/test');
const { BasePage } = require('../base-page');

exports.CommentsPanelPage = class CommentsPanelPage extends BasePage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    super(page);

    this.commentsButton = page.getByRole('button', { name: 'Comments (C)' });
    this.commentInput = page
      .locator('[class*="comments__form"]')
      .getByRole('textbox');
    this.commentEditInput = page.locator(
      'div[class*="comments__edit-form"] textarea',
    );
    this.commentText = page.locator(
      'div[class*="comments__item"] span[class*="comments__text"]',
    );
    this.commentCommentsPanelText = page.locator(
      '[class*="sidebar"] div[class*="comments__cover"] div[class*="comments__item"]',
    );
    this.commentAvatarImage = page.locator('[class*="avatar-image"] img');
    this.commentReplyText = this.commentText.nth(1);
    this.commentReplyCommentsPanelText = page.getByText('1 reply', { exact: true });
    this.postCommentButton = page.getByRole('button', { name: 'Post' }).first();
    this.commentThreadIcon = page.locator(
      '[data-testid^="floating-thread-bubble-"]',
    );
    this.commentThreadPreview = page.locator(
      'div[class*="comments-container"] [class*="floating-thread-item-wrapper"]',
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
    /**
     * Get the comment thread bubble by the comment index
     * @param {string} index ("1", "2", "1-2", "1-2-3")
     * @returns Locator
     */
    this.commentThreadBubbleByIndex = (index) =>
      page.getByTestId('floating-thread-bubble-' + index);
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
    this.resolveCommentCheckbox = page.locator(
      'div[class*="thread-header"] span[class*="comments__checkbox"]',
    );
    this.commentsPanelPlaceholderText = page.locator(
      '.main_ui_workspace_comments__thread-group-placeholder',
    );
    this.commentsAuthorSection = page.locator('div[class*="comments__author"]');
    this.commentMentionButton = page.locator('[class*="open-mentions-button"]');
    this.mentionMenuItem = page.locator('[class*="comments-mentions-name"]');
    this.commentMentionText = page.locator('span[class*="comment-mention"]');
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

  async clickCreateCommentButton() {
    await this.commentsButton.click();
  }

  async enterCommentText(text, isEdit = false) {
    if (isEdit) {
      await this.commentInput.first().clear();
      await this.commentInput.first().pressSequentially(text, { delay: 10 });
    } else {
      await this.commentInput.pressSequentially(text, { delay: 10 });
    }
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

  async clickCommentThreadIconByNumber(number) {
    await this.commentThreadBubbleByIndex(number).hover();
    await this.commentThreadPreview.click();
  }

  async clickResolvedCommentThreadIcon() {
    await this.commentResolvedThreadIcon.waitFor({ state: 'visible' });
    await this.commentResolvedThreadIcon.hover();
    await this.commentResolvedThreadIcon.click({ force: true });
  }

  async enterReplyText(text) {
    await this.commentInput.pressSequentially(text, { delay: 10 });
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

  async clickResolveCommentCheckbox() {
    await this.resolveCommentCheckbox.click();
  }

  async isCommentDisplayedInPopUp(text) {
    await expect(this.commentText).toHaveText(text);
  }

  async isCommentDisplayedInCommentsPanel(text) {
    await expect(this.commentCommentsPanelText.first()).toHaveText(text);
  }

  async isCommentReplyDisplayedInPopUp(text) {
    await expect(this.commentReplyText).toHaveText(text);
  }

  async isCommentReplyDisplayedInCommentsPanel() {
    await expect(this.commentReplyCommentsPanelText).toBeVisible();
  }

  async isCommentThreadIconDisplayed() {
    await expect(this.commentThreadIcon).toBeVisible();
  }

  async isCommentResolvedThreadIconDisplayed() {
    await expect(this.commentResolvedThreadIcon).toBeVisible();
  }

  async isCommentThreadIconNotDisplayed() {
    await expect(this.commentThreadIcon).not.toBeVisible();
  }

  async isCommentResolvedThreadIconNotDisplayed() {
    await expect(this.commentResolvedThreadIcon).not.toBeVisible();
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

  async isCommentsPanelPlaceholderDisplayed(text) {
    await expect(this.commentsPanelPlaceholderText).toHaveText(text);
  }

  async isResolveCommentCheckboxSelected() {
    await expect(this.resolveCommentCheckbox).toHaveClass(
      'main_ui_comments__checkbox checked',
    );
  }

  async clickOnUnreadThreadIcon() {
    await this.commentUnreadThreadIcon.first().click();
  }

  async clickCommentMentionButton() {
    await this.commentMentionButton.click();
  }

  async clickMentionMenuItemByName(name) {
    await this.mentionMenuItem.getByText(name, { exact: true }).click();
  }

  async selectShowYourMentionsOption() {
    await this.commentsDropdown.click();
    await this.showYourMentionsOption.click();
    await expect(this.showYourMentionsOption).not.toBeVisible();
  }

  async checkCommentCount(count) {
    await expect(this.commentThreadIcon).toHaveCount(count);
  }

  async checkCommentCountInList(count) {
    await expect(this.commentCommentsPanelText).toHaveCount(count);
  }

  async areCommentBubblesVisible(bubblesIndexes) {
    for (const [i, bubbleIndex] of bubblesIndexes.entries()) {
      await expect(this.commentThreadBubbleByIndex(bubbleIndex)).toBeVisible();
    }
  }

  async isUnreadCommentIconVisible(visible = true) {
    visible
      ? await expect(this.unreadCommentIcon).toBeVisible()
      : await expect(this.unreadCommentIcon).not.toBeVisible();
  }
};
