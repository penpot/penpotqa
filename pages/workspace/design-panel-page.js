const { expect } = require('@playwright/test');
const { BasePage } = require('../base-page');

exports.DesignPanelPage = class DesignPanelPage extends BasePage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    super(page);

    //Design panel
    this.canvasBackgroundColorIcon = page.locator(
      'div[class*="page__element-set"] span[class*="color-bullet-wrapper"]',
    );
    this.layerRotationInput = page.locator('div[title="Rotation"] input');
    this.individualCornersRadiusButton = page.locator(
      'button[title="Independent corners"]',
    );
    this.generalCornerRadiusInput = page.locator('div[title="Radius"] input');
    this.topLeftCornerRadiusInput = page.locator('div[title="Top left"] input');
    this.topRightCornerRadiusInput = page.locator(
      'div[title="Top right"] input',
    );
    this.bottomLeftCornerRadiusInput = page.locator(
      'div[title="Bottom left"] input',
    );
    this.bottomRightCornerRadiusInput = page.locator(
      'div[title="Bottom right"] input',
    );
    this.sizeWidthInput = page.locator('div[title="Width"] input');
    this.sizeHeightInput = page.locator('div[title="Height"] input');
    this.xAxisInput = page.locator('div[title="X axis"] input');
    this.yAxisInput = page.locator('div[title="Y axis"] input');

    //Design panel - Fill section
    this.fillColorIcon = page.locator(
      'div[class*="fill__element-set"] div[class*="color-bullet-wrapper"]',
    );
    this.fillColorComponentIcon = page.locator(
      'div[class*="selected-color-group"] span[class*="color-bullet-wrapper"]',
    );
    this.fillColorInput = page.locator(
      'div[class*="fill__element-content"] input[class*="color-input"]',
    );
    this.fillOpacityInput = page.locator(
      'div[class*="fill__element-content"] div[class*="opacity-element-wrapper"] input',
    );
    this.addFillButton = page.locator('button[class*="fill__add-fill"]');
    this.removeFillButton = page.locator(
      'div[class*="fill__element-content"] svg[class="icon-remove-refactor"]',
    );

    //Design panel - Shadow section
    this.shadowSection = page.locator(
      'div[class*="shadow__element-title"]:has-text("Shadow")',
    );
    this.addShadowButton = page.locator('button[class*="shadow__add-shadow"]');
    this.shadowActionsButton = page.locator(
      'button[class*="shadow__more-options"]',
    );
    this.shadowXInput = page.locator(
      'div[class*="shadow-advanced-options"] div[title="X"] input',
    );
    this.shadowYInput = page.locator(
      'div[class*="shadow-advanced-options"] div[title="Y"] input',
    );
    this.shadowBlurInput = page.locator('div[title="Blur"] input');
    this.shadowSpreadInput = page.locator('div[title="Spread"] input');
    this.shadowColorIcon = page.locator(
      'div[class*="shadow-advanced-options"] span[class*="color-bullet-wrapper"]',
    );
    this.shadowOpacityInput = page.locator(
      'div[class*="shadow-advanced-options"] div[class*="color_row__opacity"] input',
    );
    this.shadowShowIcon = page.locator(
      'div[class*="shadow__actions"] svg[class="icon-shown-refactor"]',
    );
    this.shadowUnhideIcon = page.locator(
      'div[class*="shadow__actions"] svg[class="icon-hide-refactor"]',
    );
    this.shadowRemoveIcon = page.locator(
      'div[class*="shadow__actions"] svg[class="icon-remove-refactor"]',
    );
    this.shadowTypeField = page.locator('div[class*="shadow-type-select"]');

    //Design panel - Flex Layout section
    this.flexLayoutMenu = page.locator('div[class*="flex-layout-menu"]');
    this.flexElementMenu = page.locator('div[class*="flex-element-menu"]');
    this.flexLayoutCollapsedIcon = page.locator(
      'div[class*="layout_container"] button[class*="collapsabled-icon"]',
    );
    this.flexElementAlignStartBtn = page.locator(
      'label[title="Align self start"] span',
    );
    this.flexElementAlignCenterBtn = page.locator(
      'label[title="Align self center"] span',
    );
    this.flexElementAlignEndBtn = page.locator(
      'label[title="Align self end"] span',
    );
    this.flexElementMarginVertInput = page.locator(
      'div[title="Vertical margin"] input',
    );
    this.flexElementMarginHorizontInput = page.locator(
      'div[title="Horizontal margin"] input',
    );
    this.flexElementPositionAbsolute = page.locator(
      'label[for=":absolute-position"] span',
    );
    this.layoutRemoveButton = page.locator(
      'div[class*="layout_container__element-title"] button[class*="remove-layout"]',
    );
    this.layoutDirectRowBtn = page.locator('label[title="Row"] span');
    this.layoutDirectRowReverseBtn = page.locator(
      'label[title="Row reverse"] span',
    );
    this.layoutDirectColumnBtn = page.locator('label[title="Column"] span');
    this.layoutDirectColumnReverseBtn = page.locator(
      'label[title="Column reverse"] span',
    );
    this.layoutAlignStartBtn = page.locator(
      'label[title="Align items start"] span',
    );
    this.layoutAlignCenterBtn = page.locator(
      'label[title="Align items center"] span',
    );
    this.layoutAlignEndBtn = page.locator(
      'label[title="Align items end"] span',
    );
    this.layoutJustifyStartBtn = page.locator(
      'label[title="Justify content start"] span',
    );
    this.layoutJustifyCenterBtn = page.locator(
      'label[title="Justify content center"] span',
    );
    this.layoutJustifyEndBtn = page.locator(
      'label[title="Justify content end"] span',
    );
    this.layoutJustifySpaceBetweenBtn = page.locator(
      'label[title="Justify content space-between"] span',
    );
    this.layoutJustifySpaceAroundBtn = page.locator(
      'label[title="Justify content space-around"] span',
    );
    this.layoutJustifySpaceEvenlyBtn = page.locator(
      'label[title="Justify content space-evenly"] span',
    );
    this.layoutColumnGapInput = page.locator('div[title="Column gap"] input');
    this.layoutRowGapInput = page.locator('div[title="Row gap"] input');
    this.layoutVerticalPaddingInput = page.locator(
      'div[title="Vertical padding"] input',
    );
    this.layoutHorizontPaddingInput = page.locator(
      'div[title="Horizontal padding"] input',
    );
    this.layoutIndepPaddingsIcon = page.locator(
      'button[class*="padding-toggle"]',
    );
    this.layoutPaddingTopInput = page.locator('div[title="Top padding"] input');
    this.layoutPaddingRightInput = page.locator(
      'div[title="Right padding"] input',
    );
    this.layoutPaddingBottomInput = page.locator(
      'div[title="Bottom padding"] input',
    );
    this.layoutPaddingLeftInput = page.locator(
      'div[title="Left padding"] input',
    );

    //Design panel - Blur section
    this.blurSection = page.locator(
      'div[class*="blur__element-title"]:has-text("Blur")',
    );
    this.addBlurButton = page.locator('button[class*="blur__add-blur"]');
    this.blurMoreOptions = page.locator('button[class*="blur__show-more"]');
    this.blurValueInput = page.locator('#blur-input-sidebar');
    this.blurHideIcon = page.locator(
      'div[class*="blur__actions"] svg[class="icon-shown-refactor"]',
    );
    this.blurUnhideIcon = page.locator(
      'div[class*="blur__actions"] svg[class="icon-hide-refactor"]',
    );
    this.blurRemoveIcon = page.locator(
      'div[class*="blur__actions"] svg[class="icon-remove-refactor"]',
    );

    //Design panel - Stroke section
    this.addStrokeButton = page.locator('button[class*="add-stroke"]');
    this.strokeSection = page.locator(
      'div[class*="stroke__element-title"]:has-text("Stroke")',
    );
    this.strokeColorBullet = page.locator(
      'div[class*="stroke-data"] div[class*="color_bullet_new__is-not-library-color"]',
    );
    this.strokeRemoveIcon = page.locator(
      'div[class*="stroke-data"] button[class*="remove-btn"]',
    );
    this.strokeColorInput = page.locator(
      'div[class*="stroke-data"] input[class*="color-input"]',
    );
    this.strokeWidthInput = page.locator(
      'div[class*="stroke-data"] input[class*="width-input"]',
    );
    this.strokeOpacityInput = page.locator(
      'div[class*="stroke-data"] input[class*="opacity-input"]',
    );
    this.strokeAlignmentField = page.locator(
      'div[data-test="stroke.alignment"]',
    );
    this.strokeTypeField = page.locator('div[data-test="stroke.style"]');

    //Design panel - Text section
    this.textUpperCaseIcon = page.locator('svg.icon-text-uppercase-refactor');
    this.textLowerCaseIcon = page.locator('svg.icon-text-lowercase-refactor');
    this.textTitleCaseIcon = page.locator('svg.icon-text-mixed-refactor');
    this.textMoreOptionsIcon = page.locator(
      'button[class*="text__more-options"]',
    );
    this.textVerticalOptionsBlock = page.locator(
      'div[class*="vertical-align-options"]',
    );
    this.textAlignTop = page.locator('svg.icon-text-top-refactor');
    this.textAlignMiddle = page.locator('svg.icon-text-middle-refactor');
    this.textAlignBottom = page.locator('svg.icon-text-bottom-refactor');
    this.textIconLTR = page.locator('svg.icon-text-ltr-refactor');
    this.textIconRTL = page.locator('svg.icon-text-rtl-refactor');

    //Design panel - Export section
    this.exportSection = page.locator(
      'div[class*="exports__element-title"]:has-text("Export")',
    );
    this.addExportButton = page.locator('button[class*="exports__add-export"]');
    this.removeExportButton = page.locator(
      'button[class*="exports__action-btn"] svg[class="icon-remove-refactor"]',
    );
    this.exportElementButton = page.locator(
      'button[class*="exports__export-btn"]',
    );

    //Design panel - Grid section
    this.gridSection = page.locator(
      'div[class*=element-set]:has-text("Guides")',
    );
    this.addGridButton = page.locator('button[class*="grid__add-grid"]');
    this.removeGridButton = page.locator(
      'div[class*="grid__actions"] svg[class="icon-remove-refactor"]',
    );
    this.hideGridButton = page.locator(
      'div[class*="grid__actions"] svg[class="icon-shown-refactor"]',
    );
    this.unhideGridButton = page.locator(
      'div[class*="grid__actions"] svg[class="icon-hide-refactor"]',
    );
    this.gridTypeField = page.locator(
      'div[class*="grid__option-row"] div[class*="type-select-wrapper"]',
    );
    this.gridTypeSelectorSquareOption = page.locator('span:has-text("Square")');
    this.gridTypeSelectorColumnsOption = page.locator(
      'span:has-text("Columns")',
    );
    this.gridTypeSelectorRowsOption = page.locator('span:has-text("Rows")');
    this.gridSizeInput = page.locator('div[title="Size"] input');
    this.gridColumnsRowsInput = page.locator(
      'div[class*="grid__column-select"] input',
    );
    this.gridActionsButton = page.locator(
      'button[class*="grid__show-options"]',
    );
    this.gridOpacityInput = page.locator(
      'div[class*="grid__advanced-row"] input[class*="opacity-input"]',
    );
    this.gridMoreOptionsButton = page.locator(
      'div[class*="grid__advanced-row"] button[class*="show-more-options"]',
    );
    this.useDefaultGridButton = page.locator('button:has-text("Use default")');
    this.gridWidthInput = page.locator(
      'div[title="Width"] input[class*="grid__numeric-input"]',
    );
    this.gridHeightInput = page.locator(
      'div[title="Height"] input[class*="grid__numeric-input"]',
    );

    //Design panel - Component section
    this.componentMenuButton = page.locator(
      'div[class*="component__element-content"] div[class*="component-actions"]',
    );
    this.showInAssetsPanelOptionDesign = page.locator(
      'ul[class*="component__custom-select-dropdown"] span:text-is("Show in assets panel")',
    );
    this.componentBlockOnDesignTab = page.locator(
      'div[class*="component__element-set"]',
    );
    this.createAnnotationOptionDesign = page.locator(
      'ul[class*="component__custom-select-dropdown"] span:text-is("Create annotation")',
    );
    this.annotationTextArea = page.locator('#annotation-textarea');
    this.annotationCreateTitle = page.locator(
      'div[class^="component-annotation"] div[class^=title]',
    );
    this.createAnnotationTick = page.locator(
      'div[title="Create"] svg[class="icon-tick"]',
    );
    this.saveAnnotationTick = page.locator(
      'div[title="Save"] svg[class="icon-tick"]',
    );
    this.discardAnnotationTick = page.locator(
      'div[title="Discard"] svg[class="icon-cross"]',
    );
    this.editAnnotationTick = page.locator(
      'div[title="Edit"] svg[class="icon-pencil"]',
    );
    this.deleteAnnotationTick = page.locator(
      'div[title="Delete"] svg[class="icon-trash"]',
    );
    this.deleteAnnotationPopup = page.locator(
      'div[class*="modal-container"] h2:text-is("Delete annotation")',
    );
    this.deleteAnnotationOkBtn = page.locator(
      'div[class*="modal-container"] input[value="Ok"]',
    );
  }

  async isFlexElementSectionOpened() {
    await expect(this.flexElementMenu).toBeVisible();
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

  async changeFlexElementMargin(type, value) {
    switch (type) {
      case 'Vertical':
        await this.flexElementMarginVertInput.fill(value);
        break;
      case 'Horizontal':
        await this.flexElementMarginHorizontInput.fill(value);
        break;
    }
    await this.clickOnEnter();
  }

  async setFlexElementPositionAbsolute() {
    await this.flexElementPositionAbsolute.click();
  }

  async clickAddStrokeButton() {
    await this.strokeSection.waitFor();
    await this.addStrokeButton.click();
  }

  async clickStrokeColorBullet() {
    await this.strokeColorBullet.click();
  }

  async removeStroke() {
    await this.strokeRemoveIcon.click();
  }

  async setStrokeColor(value) {
    await this.strokeColorInput.fill(value);
    await this.clickOnEnter();
  }

  async setStrokeAlignment(value) {
    const optionSel = this.page.locator(`li span:text-is("${value}")`);
    await this.strokeAlignmentField.click();
    await optionSel.click();
  }

  async setStrokeType(value) {
    const optionSel = this.page.locator(`li span:text-is("${value}")`);
    await this.strokeTypeField.click();
    await optionSel.click();
  }

  async setStrokeWidth(value) {
    await this.strokeWidthInput.fill(value);
    await this.clickOnEnter();
  }

  async setStrokeOpacity(value) {
    await this.strokeOpacityInput.fill(value);
    await this.clickOnEnter();
  }

  async changeStrokeSettings(color, opacity, width, position, type) {
    await this.setStrokeColor(color);
    await this.setStrokeOpacity(opacity);
    await this.setStrokeWidth(width);
    await this.setStrokeAlignment(position);
    if (type) {
      await this.setStrokeType(type);
    }
  }

  async clickFillColorIcon() {
    await this.fillColorIcon.click();
  }

  async changeOpacityForFill(value) {
    await this.fillOpacityInput.fill(value);
  }

  async isFillHexCodeSet(value) {
    await expect(this.fillColorInput).toHaveValue(value);
  }

  async isFillOpacitySet(value) {
    await expect(this.fillOpacityInput).toHaveValue(value);
  }

  async clickAddFillButton() {
    await this.addFillButton.click();
  }

  async clickRemoveFillButton() {
    await this.removeFillButton.click();
  }

  async clickCanvasBackgroundColorIcon() {
    await this.canvasBackgroundColorIcon.click();
  }

  async clickComponentFillColorIcon() {
    await this.fillColorComponentIcon.click();
  }

  async changeRotationForLayer(value) {
    await this.layerRotationInput.fill(value);
    await this.clickOnEnter();
  }

  async clickIndividualCornersRadiusButton() {
    await this.individualCornersRadiusButton.click();
  }

  async changeIndependentCorners(topLeft, topRight, bottomLeft, bottomRight) {
    await this.changeTopLeftCornerRadiusForLayer(topLeft);
    await this.changeTopRightCornerRadiusForLayer(topRight);
    await this.changeBottomLeftCornerRadiusForLayer(bottomLeft);
    await this.changeBottomRightCornerRadiusForLayer(bottomRight);
  }

  async changeGeneralCornerRadiusForLayer(value) {
    await this.generalCornerRadiusInput.fill(value);
    await this.clickMoveButton();
  }

  async changeTopLeftCornerRadiusForLayer(value) {
    await this.topLeftCornerRadiusInput.fill(value);
    await this.clickMoveButton();
  }

  async changeTopRightCornerRadiusForLayer(value) {
    await this.topRightCornerRadiusInput.fill(value);
    await this.clickMoveButton();
  }

  async changeBottomLeftCornerRadiusForLayer(value) {
    await this.bottomLeftCornerRadiusInput.fill(value);
    await this.clickMoveButton();
  }

  async changeBottomRightCornerRadiusForLayer(value) {
    await this.bottomRightCornerRadiusInput.fill(value);
    await this.clickMoveButton();
  }

  async changeWidthForLayer(width) {
    await this.sizeWidthInput.fill(width);
    await this.clickOnEnter();
    await this.waitForChangeIsSaved();
  }

  async changeHeightForLayer(height) {
    await this.sizeHeightInput.fill(height);
    await this.clickOnEnter();
    await this.waitForChangeIsSaved();
  }

  async changeHeightAndWidthForLayer(height, width) {
    await this.changeWidthForLayer(width);
    await this.changeHeightForLayer(height);
  }

  async clickAddShadowButton() {
    await this.shadowSection.waitFor();
    await this.addShadowButton.click();
  }

  async clickShadowActionsButton() {
    await this.shadowActionsButton.click();
  }

  async changeShadowSettings(x, y, blur, spread, opacity) {
    await this.changeXForShadow(x);
    await this.changeYForShadow(y);
    await this.changeBlurForShadow(blur);
    await this.changeSpreadForShadow(spread);
    await this.changeOpacityForShadow(opacity);
  }

  async changeXForShadow(value) {
    await this.shadowXInput.fill(value);
  }

  async changeYForShadow(value) {
    await this.shadowYInput.fill(value);
  }

  async changeBlurForShadow(value) {
    await this.shadowBlurInput.fill(value);
  }

  async changeSpreadForShadow(value) {
    await this.shadowSpreadInput.fill(value);
  }

  async changeOpacityForShadow(value) {
    await this.shadowOpacityInput.fill(value);
  }

  async clickShadowColorIcon() {
    await this.shadowColorIcon.click();
  }

  async selectTypeForShadow(type) {
    await this.shadowTypeField.click();
    const typeOptionSel = this.page.locator(`li:has-text("${type}")`);
    await typeOptionSel.click();
  }

  async hideShadow() {
    await this.shadowShowIcon.click();
  }

  async unhideShadow() {
    await this.shadowUnhideIcon.click();
  }

  async removeShadow() {
    await this.shadowRemoveIcon.click();
  }

  async clickAddBlurButton() {
    await this.blurSection.waitFor();
    await this.addBlurButton.click({ delay: 500 });
  }

  async changeValueForBlur(value) {
    await this.blurMoreOptions.click();
    await this.blurValueInput.fill(value);
  }

  async hideBlur() {
    await this.blurHideIcon.click();
  }

  async unhideBlur() {
    await this.blurUnhideIcon.click();
  }

  async removeBlur() {
    await this.blurRemoveIcon.click();
  }

  async changeTextCase(value) {
    switch (value) {
      case 'Upper':
        await this.textUpperCaseIcon.click();
        break;
      case 'Lower':
        await this.textLowerCaseIcon.click();
        break;
      case 'Title':
        await this.textTitleCaseIcon.click();
        break;
    }
  }

  async openTextMoreOptionsBlock() {
    if (!(await this.textVerticalOptionsBlock.isVisible())) {
      await this.textMoreOptionsIcon.click({ force: true });
    }
    await expect(this.textVerticalOptionsBlock).toBeVisible();
  }

  async changeTextAlignment(value) {
    await this.openTextMoreOptionsBlock();
    switch (value) {
      case 'Top':
        await this.textAlignTop.click();
        break;
      case 'Middle':
        await this.textAlignMiddle.click();
        break;
      case 'Bottom':
        await this.textAlignBottom.click();
        break;
    }
  }

  async changeTextDirection(value) {
    await this.openTextMoreOptionsBlock();
    switch (value) {
      case 'RTL':
        await this.textIconRTL.click();
        break;
      case 'LTR':
        await this.textIconLTR.click();
        break;
    }
  }

  async isLayoutRemoveButtonExists(condition = true) {
    if (condition === true) {
      await expect(this.layoutRemoveButton).toBeVisible();
    } else {
      await expect(this.layoutRemoveButton).not.toBeVisible();
    }
  }

  async removeLayoutFromDesignPanel() {
    await this.layoutRemoveButton.click();
  }

  async expandFlexLayoutMenu() {
    if (!(await this.flexLayoutMenu.isVisible())) {
      await this.flexLayoutCollapsedIcon.click();
    }
    await expect(this.flexLayoutMenu).toBeVisible();
  }

  async changeLayoutDirection(direction) {
    await this.expandFlexLayoutMenu();
    switch (direction) {
      case 'Row':
        await this.layoutDirectRowBtn.click();
        break;
      case 'Row reverse':
        await this.layoutDirectRowReverseBtn.click();
        break;
      case 'Column':
        await this.layoutDirectColumnBtn.click();
        break;
      case 'Column reverse':
        await this.layoutDirectColumnReverseBtn.click();
        break;
    }
  }

  async changeLayoutAlignment(alignment) {
    await this.expandFlexLayoutMenu();
    switch (alignment) {
      case 'Start':
        await this.layoutAlignStartBtn.click();
        break;
      case 'Center':
        await this.layoutAlignCenterBtn.click();
        break;
      case 'End':
        await this.layoutAlignEndBtn.click();
        break;
    }
  }

  async changeLayoutJustification(justify) {
    await this.expandFlexLayoutMenu();
    switch (justify) {
      case 'Start':
        await this.layoutJustifyStartBtn.click();
        break;
      case 'Center':
        await this.layoutJustifyCenterBtn.click();
        break;
      case 'End':
        await this.layoutJustifyEndBtn.click();
        break;
      case 'Space between':
        await this.layoutJustifySpaceBetweenBtn.click();
        break;
      case 'Space around':
        await this.layoutJustifySpaceAroundBtn.click();
        break;
      case 'Space evenly':
        await this.layoutJustifySpaceEvenlyBtn.click();
        break;
    }
  }

  async changeLayoutColumnGap(value) {
    await this.expandFlexLayoutMenu();
    await this.layoutColumnGapInput.fill(value);
    await this.clickOnEnter();
  }

  async clickLayoutColumnGapField() {
    await this.layoutColumnGapInput.click();
  }

  async changeLayoutRowGap(value) {
    await this.expandFlexLayoutMenu();
    await this.layoutRowGapInput.fill(value);
    await this.clickOnEnter();
  }

  async changeLayoutPadding(type, value) {
    await this.expandFlexLayoutMenu();
    switch (type) {
      case 'Vertical':
        await this.layoutVerticalPaddingInput.fill(value);
        break;
      case 'Horizontal':
        await this.layoutHorizontPaddingInput.fill(value);
        break;
    }
    await this.clickOnEnter();
  }

  async clickLayoutVerticalPaddingField() {
    await this.layoutVerticalPaddingInput.click();
  }

  async clickLayoutHorizontalPaddingField() {
    await this.layoutHorizontPaddingInput.click();
  }

  async switchToIndependentPadding() {
    await this.expandFlexLayoutMenu();
    await this.layoutIndepPaddingsIcon.click();
  }

  async changeLayoutIndependentPadding(type, value) {
    await this.expandFlexLayoutMenu();
    switch (type) {
      case 'Bottom':
        await this.layoutPaddingBottomInput.fill(value);
        break;
      case 'Right':
        await this.layoutPaddingRightInput.fill(value);
        break;
      case 'Left':
        await this.layoutPaddingLeftInput.fill(value);
        break;
      case 'Top':
        await this.layoutPaddingTopInput.fill(value);
        break;
    }
    await this.clickOnEnter();
  }

  async clickAddExportButton() {
    await this.exportSection.waitFor();
    await this.addExportButton.click();
  }

  async clickRemoveExportButton() {
    await this.removeExportButton.click();
  }

  async isExportElementButtonDisplayed(title) {
    await expect(this.exportElementButton).toHaveText(title);
  }

  async isExportElementButtonNotDisplayed() {
    await expect(this.exportElementButton).not.toBeVisible();
  }

  async clickAddGridButton() {
    await this.gridSection.waitFor();
    await this.addGridButton.click();
  }

  async clickRemoveGridButton() {
    await this.removeGridButton.click();
  }

  async clickHideGridButton() {
    await this.hideGridButton.click();
  }

  async clickUnhideGridButton() {
    await this.unhideGridButton.click();
  }

  async changeSizeForGrid(value) {
    await this.gridSizeInput.fill(value);
  }

  async clickGridActionsButton() {
    await this.gridActionsButton.click();
  }

  async changeOpacityForGrid(value) {
    await this.gridOpacityInput.fill(value);
  }

  async clickUseDefaultGridButton() {
    await this.gridMoreOptionsButton.click();
    await this.useDefaultGridButton.click();
  }

  async selectGridType(type) {
    await this.gridTypeField.click();
    switch (type) {
      case 'Square':
        await this.gridTypeSelectorSquareOption.click();
        break;
      case 'Columns':
        await this.gridTypeSelectorColumnsOption.click();
        break;
      case 'Rows':
        await this.gridTypeSelectorRowsOption.click();
        break;
    }
  }

  async changeColumnsOrRowsNumberForGrid(value) {
    await this.gridColumnsRowsInput.fill(value);
  }

  async changeWidthForGrid(value) {
    await this.gridWidthInput.fill(value);
  }

  async changeHeightForGrid(value) {
    await this.gridHeightInput.fill(value);
  }

  async clickOnComponentMenuButton() {
    await this.componentMenuButton.click();
  }

  async clickOnShowInAssetsPanel() {
    await this.showInAssetsPanelOptionDesign.click();
  }

  async addAnnotationForComponent(value) {
    await this.enterTextIntoAnnotationField(value);
    await this.submitAnnotationCreation();
  }

  async editAnnotationForComponent(value) {
    await this.enterTextIntoAnnotationField(value);
    await this.submitAnnotationEditing();
  }

  async cancelAddAnnotationForComponent(value) {
    await this.enterTextIntoAnnotationField(value);
    await this.discardAnnotationCreation();
  }

  async clickOnCreateAnnotationOption() {
    await this.createAnnotationOptionDesign.click();
    await expect(this.annotationTextArea).toBeVisible();
  }

  async enterTextIntoAnnotationField(value) {
    await this.annotationTextArea.fill(value);
  }

  async submitAnnotationCreation() {
    await this.annotationCreateTitle.hover();
    await this.createAnnotationTick.click();
  }

  async submitAnnotationEditing() {
    await this.annotationCreateTitle.hover();
    await this.saveAnnotationTick.click();
  }

  async discardAnnotationCreation() {
    await this.annotationCreateTitle.hover();
    await this.discardAnnotationTick.click();
  }

  async clickOnEditAnnotation() {
    await this.annotationCreateTitle.hover();
    await this.editAnnotationTick.click();
  }

  async clickOnDeleteAnnotation() {
    await this.annotationCreateTitle.hover();
    await this.deleteAnnotationTick.click();
    await expect(this.deleteAnnotationPopup).toBeVisible();
  }

  async confirmDeleteAnnotation() {
    await this.deleteAnnotationOkBtn.click();
  }

  async createAnnotationRightClick() {
    const layerSel = this.page.locator('div[class="viewport"] [id^="shape"]');
    await layerSel.last().click({ button: 'right', force: true });
    await this.createAnnotationOption.click();
    await expect(this.annotationTextArea).toBeVisible();
  }

  async isAnnotationAddedToComponent(value) {
    const selector = this.page.locator(
      `div[class^="component-annotation"] div[data-replicated-value="${value}"]`,
    );
    await expect(selector).toBeVisible();
  }

  async changeAxisXandYForLayer(x, y) {
    await this.xAxisInput.fill(x);
    await this.clickOnEnter();
    await this.waitForChangeIsSaved();
    await this.yAxisInput.fill(y);
    await this.clickOnEnter();
    await this.waitForChangeIsSaved();
  }
};
