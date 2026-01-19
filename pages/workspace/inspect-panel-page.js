const { BasePage } = require('../base-page');
const { expect } = require('@playwright/test');

exports.InspectPanelPage = class InspectPanelPage extends BasePage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    super(page);

    this.inspectTab = page.getByRole('tab', { name: 'inspect' });
    this.annotationBlockOnInspect = page.locator(
      'div.main_ui_inspect_annotation__attributes-block',
    );
    this.textBlockOnInspect = page.locator(
      'div.main_ui_inspect_attributes_text__attributes-block',
    );
    this.rowGapOnInspect = page.locator(
      'div[class*="layout-row"] div[title="Row gap"]',
    );
    this.codeTabButton = page.getByRole('tab', { name: 'code' });
    this.inspectTabSelector = page.locator(
      'button[aria-label="inspect.tabs-switcher-label"]',
    );
    this.codeOption = page.getByRole('option', { name: 'Code' });
    this.computedOption = page.getByRole('option', { name: 'Computed' });
    this.copyCssCodeButton = page.locator('button[class*="css-copy-btn"]');
    this.codeHtmlStrings = page.locator('span[class="hljs-string"]');
    this.svgCodeButton = page.locator('label[for=":svg"]');
    this.copyHtmlCodeButton = page.locator('button[class*="html-copy-btn"]');
    this.tokensSetAndThemesSection = page.getByText('Token Sets & Themes');
    this.tokensSetAndThemesSectionCollapseButton = page.getByRole('button', {
      name: 'Toggle panel Token Sets &',
    });
    this.sizeAndPositionSection = page.getByText('Size and position');
    this.sizeAndPositionSectionCollapseButton = page.getByRole('button', {
      name: 'Toggle panel Size and position',
    });
    this.fillSection = page.getByTestId('right-sidebar').getByText('Fill');
    this.fillSectionCollapseButton = page.getByRole('button', {
      name: 'Toggle panel Fill',
    });
  }

  async openInspectTab() {
    await this.inspectTab.click();
  }

  async isAnnotationExistOnInspectTab() {
    await expect(this.annotationBlockOnInspect).toBeVisible();
  }

  async isRowGapExistOnInspectTab() {
    await expect(this.rowGapOnInspect).toBeVisible();
  }

  async openCodeTab() {
    await this.inspectTabSelector.click();
    await this.codeOption.click();
  }

  async openComputedTab() {
    await this.inspectTabSelector.click();
    await this.computedOption.click();
  }

  async waitForCodeButtonVisible() {
    await this.inspectTabSelector.click();
    await this.codeOption.waitFor({ state: 'visible', timeout: 10000 });
    await this.page.keyboard.press('Escape');
  }

  async copyCssCodeByName(name) {
    await this.copyCssCodeButton.click();
    const cssCode = await this.page.evaluate(() => navigator.clipboard.readText());
    const regex = new RegExp(`/\\* ${name} \\*/.*`, 's');
    const match = cssCode.match(regex);
    return match ? match[0] : null;
  }

  async copySvgCode() {
    await this.copyHtmlCodeButton.click();
    const svgCode = await this.page.evaluate(() => navigator.clipboard.readText());
    return svgCode.replace(/\s+/g, '').replace(/[\r\n]+/g, '');
  }

  async isAnnotationTextExistOnInspectTab(text) {
    await expect(
      this.annotationBlockOnInspect.locator('[class*="annotation-content"]'),
    ).toHaveText(text);
  }

  async clickOnSVGCodeButton() {
    await this.svgCodeButton.click();
  }

  async isTokenSetsAndThemesSectionVisible() {
    await expect(this.tokensSetAndThemesSection).toBeVisible();
  }

  async isSizeAndPositionSectionVisible() {
    await expect(this.sizeAndPositionSection).toBeVisible();
  }

  async isFillSectionVisible() {
    await expect(this.fillSection).toBeVisible();
  }

  async isTokensSetAndThemesSectionCollapseButtonVisible() {
    await expect(this.tokensSetAndThemesSectionCollapseButton).toBeVisible();
  }

  async isSizeAndPositionSectionCollapseButtonVisible() {
    await expect(this.sizeAndPositionSectionCollapseButton).toBeVisible();
  }

  async isFillSectionCollapseButtonVisible() {
    await expect(this.fillSectionCollapseButton).toBeVisible();
  }

  async collapseInspectStyleSection(sectionTitle, propertyTerm) {
    await this.page
      .getByRole('button', { name: `Toggle panel ${sectionTitle}` })
      .click();
    await expect(this.page.getByText(propertyTerm)).not.toBeVisible();
  }

  async uncollapseInspectStyleSection(sectionTitle, propertyTerm) {
    await this.page
      .getByRole('button', { name: `Toggle panel ${sectionTitle}` })
      .click();
    await expect(this.page.getByText(propertyTerm)).toBeVisible();
  }
};
