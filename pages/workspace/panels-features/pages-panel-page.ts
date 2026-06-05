import { expect, type Locator, type Page } from '@playwright/test';
import { MainPage } from '@pages/workspace/main-page';

export class PagesPanelPage extends MainPage {
  readonly mainPage: MainPage;

  readonly addPageButton: Locator;
  readonly pagesBlock: Locator;
  readonly pagesList: Locator;
  readonly separatorPagesList: Locator;
  readonly firstPageListItem: Locator;
  readonly secondPageListItem: Locator;
  readonly getPageListItemByName: (name: string, index?: number | null) => Locator;
  readonly selectedPage: Locator;
  readonly pageNameInput: Locator;
  readonly renamePageMenuItem: Locator;
  readonly duplicatePageMenuItem: Locator;
  readonly deletePageMenuItem: Locator;
  readonly collapseExpandPagesButton: Locator;
  readonly pageTrashIcon: Locator;
  readonly deletePageOkButton: Locator;

  constructor(page: Page) {
    super(page);
    this.mainPage = new MainPage(page);

    // locators
    this.addPageButton = page.getByRole('button', { name: 'Add page' });
    this.pagesBlock = page.locator('div.main_ui_workspace_sidebar_sitemap__sitemap');
    this.pagesList = this.pagesBlock.getByTestId('page-name');
    this.separatorPagesList = this.pagesBlock.getByTestId('page-separator');
    this.firstPageListItem = this.pagesList.filter({ hasText: /^Page 1$/ });
    this.getPageListItemByName = (name, index = null) => {
      if (index !== null) {
        return this.pagesList.nth(index);
      }
      return this.pagesList.filter({ hasText: new RegExp(`^${name}$`) });
    };
    this.secondPageListItem = this.pagesList.filter({ hasText: /^Page 2$/ });
    this.selectedPage = page.locator(
      'ul[class*="page-list"] li[class*="sitemap__selected"] div[class*="element-list-body"]',
    );
    this.pageNameInput = page.locator(
      'ul[class*="page-list"] div[class*="element-list-body"] input',
    );
    this.renamePageMenuItem = page
      .getByRole('listitem')
      .filter({ hasText: 'Rename' });
    this.duplicatePageMenuItem = page
      .getByRole('listitem')
      .filter({ hasText: 'Duplicate' });
    this.deletePageMenuItem = page
      .getByRole('listitem')
      .filter({ hasText: 'Delete' });
    this.collapseExpandPagesButton = page.getByRole('button', {
      name: 'Pages',
      exact: true,
    });
    this.pageTrashIcon = page
      .locator('div[class*="selected"]')
      .getByRole('button', { name: 'Delete page' });
    this.deletePageOkButton = page.getByRole('button', { name: 'Ok' });
  }

  async clickAddPageButton() {
    await this.addPageButton.click();
  }

  async isPageNameSelected(name: string, selected = true) {
    selected
      ? await expect(this.selectedPage.getByTitle(name)).toBeVisible()
      : await expect(this.selectedPage.getByTitle(name)).not.toBeVisible();
  }

  async isFirstPageAddedToAssetsPanel(added = true) {
    added
      ? await expect(this.firstPageListItem).toBeVisible()
      : await expect(this.firstPageListItem).not.toBeVisible();
  }

  async isFirstPageNameDisplayed(name: string, displayed = true) {
    displayed
      ? await expect(this.getPageListItemByName(name, 0)).toBeVisible()
      : await expect(this.getPageListItemByName(name)).not.toBeVisible();
  }

  async isSecondPageAddedToAssetsPanel(added = true) {
    added
      ? await expect(this.secondPageListItem).toBeVisible()
      : await expect(this.secondPageListItem).not.toBeVisible();
  }

  async isSecondPageNameDisplayed(name: string, displayed = true) {
    displayed
      ? await expect(this.getPageListItemByName(name, 1)).toBeVisible()
      : await expect(this.getPageListItemByName(name)).not.toBeVisible();
  }

  async isPageRightClickMenuVisible(visible = true) {
    await this.firstPageListItem.click({ button: 'right' });
    visible
      ? await expect(this.renamePageMenuItem).toBeVisible()
      : await expect(this.renamePageMenuItem).not.toBeVisible();
  }

  async renamePageViaRightClick(newName: string, isFirstPage = true) {
    if (isFirstPage) {
      await this.firstPageListItem.click({ button: 'right' });
    } else {
      await this.secondPageListItem.click({ button: 'right' });
    }
    await this.renamePageMenuItem.click();
    await this.pageNameInput.fill(newName);
    await this.mainPage.clickViewportTwice();
  }

  async duplicatePageViaRightClick(isFirstPage = true) {
    if (isFirstPage) {
      await this.firstPageListItem.click({ button: 'right' });
    } else {
      await this.secondPageListItem.click({ button: 'right' });
    }
    await this.duplicatePageMenuItem.click();
  }

  async clickOnPageOnLayersPanel(pageNumber = 1) {
    await this.pagesList
      .filter({ hasText: new RegExp(`^Page ${pageNumber}$`) })
      .click();
  }

  async clickCollapseExpandPagesButton() {
    await this.collapseExpandPagesButton.click();
  }

  async deleteSecondPageViaRightClick() {
    await this.secondPageListItem.click({ button: 'right' });
    await this.deletePageMenuItem.click();
    await this.deletePageOkButton.click();
  }

  async deleteSecondPageViaTrashIcon(name: string) {
    await this.getPageListItemByName(name).click();
    await this.pageTrashIcon.click();
    await this.deletePageOkButton.click();
  }

  async checkNamedPagesCountIs(number: number) {
    await expect(this.pagesList).toHaveCount(number);
  }

  async checkSeparatorPagesCountIs(number: number) {
    await expect(this.separatorPagesList).toHaveCount(number);
  }

  async dragSeparatorWithIndexBeyondPage(index: number, pageName: string) {
    const separator = this.separatorPagesList.nth(index);
    const pageRow = this.getPageListItemByName(pageName);
    const box = await pageRow.boundingBox();
    if (!box) throw new Error(`Could not get bounding box for page "${pageName}"`);

    await separator.hover();
    await separator.dragTo(pageRow, {
      sourcePosition: { x: 10, y: 10 },
      targetPosition: { x: 10, y: box.height + 10 },
      force: true,
    });
  }

  async deleteSeparatorWithIndexViaRightClick(index: number) {
    await this.separatorPagesList.nth(index).click({ button: 'right' });
    await this.deletePageMenuItem.click();
    await this.deletePageOkButton.click();
  }
}
