const { expect } = require("@playwright/test");
const { BasePage } = require("../base-page");

exports.DesignPanelPage = class DesignPanelPage extends BasePage {

    /**
     * @param {import('@playwright/test').Page} page
     */
    constructor(page) {
        super(page);

        // 'Flex element' section
        this.flexElementSection = page.locator('div[class="element-set-content layout-item-menu"]');
        this.flexElementAlignStartBtn = page.locator('div.layout-item-menu button[alt="Align self start"]');
        this.flexElementAlignCenterBtn = page.locator('div.layout-item-menu button[alt="Align self center"]');
        this.flexElementAlignEndBtn = page.locator('div.layout-item-menu button[alt="Align self end"]');
        this.flexElementMarginVertInput = page.locator(
            'div[class="margin-row"] div[alt="Vertical margin"] input'
        );
        this.flexElementMarginHorizontInput = page.locator(
            'div[class="margin-row"] div[alt="Horizontal margin"] input'
        );
        this.flexElementPositionAbsolute = page.locator('div[class="layout-row"] button[alt="Absolute"]');
    }

    async waitFlexElementSectionExpanded() {
        await expect(this.flexElementSection).toBeVisible();
    }

    async changeFlexElementAlignment(alignment) {
        switch (alignment) {
            case 'Start':
                await this.flexElementAlignStartBtn.click();
                break;
            case 'Center':
                await this.flexElementAlignCenterBtn.click();
                break;
            case 'End':
                await this.flexElementAlignEndBtn.click();
                break;
        }
    }

    async changeFlexElementVerticalMargin(value) {
        await this.flexElementMarginVertInput.fill(value);
        await this.clickOnEnter();
    }

    async changeFlexElementHorizontalMargin(value) {
        await this.flexElementMarginHorizontInput.fill(value);
        await this.clickOnEnter();
    }

    async setFlexElementPositionAbsolute() {
        await this.flexElementPositionAbsolute.click();
    }

}
