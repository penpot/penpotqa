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
      'div[class*="sidebar"] div[class*="comments__threads"] div[class*="comments__content"]',
    );
    this.commentReplyText = page.locator(
      'div[class*="thread-content"] span[class*="comments__text"] >> nth=1',
    );
    this.commentReplyCommentsPanelText = page.getByText('1 reply', { exact: true });
    this.postCommentButton = page.getByRole('button', { name: 'Post' });
    this.commentThreadIcon = page.locator(
      'div[class*="comments-container"] div[class*="thread-bubble"]',
    );
    this.commentResolvedThreadIcon = page.locator(
      'div[class*="comments-container"] div.main_ui_comments__resolved',
    );
    this.commentReplyInput = page.getByPlaceholder('Reply');
    this.commentOptionsButton = page
      .locator('div[class*="comments__threads"]')
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
      'div[class*="comments__options-resolve-wrapper"] span',
    );
    this.commentsPanelPlaceholderText = page.locator(
      'div[class*="thread-group-placeholder"] span[class*="placeholder-label"]',
    );
    this.commentsAuthorSection = page.locator('div[class*="comments__author"]');
  }

  async clickCreateCommentButton() {
    await this.commentsButton.click();
  }

  async enterCommentText(text, isEdit = false) {
    if (isEdit) {
      await this.commentEditInput.fill(text);
    } else {
      await this.commentInput.pressSequentially(text, { delay: 10 });
    }
  }

  async clickPostCommentButton() {
    await this.postCommentButton.click();
  }

  async clickCommentThreadIcon() {
    await this.commentThreadIcon.click();
  }

  async clickResolvedCommentThreadIcon() {
    await this.commentResolvedThreadIcon.click();
  }

  async enterReplyText(text) {
    await this.commentReplyInput.fill(text);
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
    await expect(this.commentCommentsPanelText).toHaveText(text);
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

  async isCommentsPanelPlaceholderDisplayed(text) {
    await expect(this.commentsPanelPlaceholderText).toHaveText(text);
  }

  async isResolveCommentCheckboxSelected() {
    await expect(this.resolveCommentCheckbox).toHaveClass(
      'main_ui_comments__options-resolve checked',
    );
  }
};
