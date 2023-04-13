const {expect} = require("@playwright/test");
const { BasePage } = require("../base-page");

exports.LayersPage = class LayersPage extends BasePage {

    /**
     * @param {import('@playwright/test').Page} page
     */
    constructor(page) {
        super(page);

        this.layerBoardToggleContentExpand = page.locator('ul.element-list span.toggle-content.inverse');
        this.layerBoardToggleContentCollapse = page.locator('ul.element-list span.toggle-content');
        this.layerBoardChildRect = page.locator(
            'div[class="element-list-body "] span:has-text("Rectangle") >>nth=-1'
        );
        this.layerBoardChildEllipse = page.locator(
            'div[class="element-list-body "] span:has-text("Ellipse") >>nth=-1'
        );
    }

    async expandBoardOnLayers() {
        if (!await this.layerBoardToggleContentExpand.isVisible()) {
            await this.layerBoardToggleContentCollapse.click();
            await expect(this.layerBoardToggleContentExpand).toBeVisible();
        }
    }

    async selectBoardChildRect() {
        await this.expandBoardOnLayers();
        await this.layerBoardChildRect.click();
    }

    async selectBoardChildEllipse() {
        await this.expandBoardOnLayers();
        await this.layerBoardChildEllipse.click();
    }

}