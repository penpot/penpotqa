const { expect, test } = require('@playwright/test');
const { BasePage } = require('../base-page');
const { mainTest } = require('../../fixtures');

exports.DesignPanelPage = class DesignPanelPage extends BasePage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    super(page);

    //Design panel
    this.rightSidebar = this.page.getByTestId('right-sidebar');
    this.designTabpanel = page.getByRole('tabpanel', { name: 'design' });
    this.canvasBackgroundColorIcon = page
      .locator('div[class*="page__element-set"] div[class*="color-bullet-wrapper"]')
      .first();
    this.layerRotationInput = page.getByRole('textbox', { name: 'Rotation' });
    this.individualCornersRadiusButton = page.getByRole('button', {
      name: 'Show independent radius',
    });
    this.generalCornerRadiusInput = page.getByRole('textbox', { name: 'Radius' });
    this.topLeftCornerRadiusInput = page.getByRole('textbox', { name: 'Top left' });
    this.topRightCornerRadiusInput = page.getByRole('textbox', {
      name: 'Top right',
    });
    this.bottomLeftCornerRadiusInput = page.getByRole('textbox', {
      name: 'Bottom left',
    });
    this.bottomRightCornerRadiusInput = page.getByRole('textbox', {
      name: 'Bottom right',
    });
    this.sizeWidthInput = page.locator('div[aria-label="Width"] input');
    this.sizeHeightInput = page.locator('div[aria-label="Height"] input');
    this.xAxisInput = page.locator('div[aria-label="X axis"] input');
    this.yAxisInput = page.locator('div[aria-label="Y axis"] input');
    this.openTokenListButton = page.locator(
      'div[aria-label="Open token list"] button',
    );
    this.detachTokenButton = this.rightSidebar.getByRole('button', {
      name: 'Detach token',
    });
    this.resizeBoardToFitButton = page.getByRole('button', {
      name: 'Resize board to fit content',
    });
    this.sizePresetsDropdown = page.getByText('Size presets', { exact: true });
    this.sizePresetsOptions = this.sizePresetsDropdown.locator(
      '//following::ul[1]/li',
    );
    this.verticalOrientationButton = page.locator('label[for="size-vertical"]');
    this.horizontalOrientationButton = page.locator('label[for="size-horizontal"]');
    this.alignLeftButton = page.getByTitle('Align left');
    this.alignHorizontalCenterButton = page.getByTitle('Align horizontal center');
    this.alignRightButton = page.getByTitle('Align right');
    this.alignTopButton = page.getByTitle('Align top');
    this.alignVerticalCenterButton = page.getByTitle('Align vertical center');
    this.alignBottomButton = page.getByTitle('Align bottom');

    //Design panel - Fill section
    this.fillSection = page.getByLabel('Fill section');
    this.colorPickerContainer = page.getByTestId('colorpicker');
    this.firstColorIcon = page
      .locator(
        '//div[contains(@class, "color-data")][not(contains(@class, "color_row__hidden"))]//div[contains(@class, "color-bullet-wrapper")]',
      )
      .first();
    this.fillColorIcon = page
      .locator('div[class*="fill-content"] div[class*="color-bullet-wrapper"]')
      .last();
    this.fillColorComponentIcon = page
      .locator(
        'div[class*="selected-color-group"] span[class*="color-input-wrapper"]',
      )
      .last();
    this.fillColorInput = page
      .locator('div[class*="fill-content"] input[class*="color-input"]')
      .last();
    this.fillOpacityInput = page
      .locator(
        'div[class*="fill-content"] div[class*="opacity-element-wrapper"] input',
      )
      .last();
    this.addFillButton = page.getByTestId('add-fill');
    this.removeFillButton = page
      .locator('div[class*="fill-content"]')
      .getByRole('button', { name: 'Remove color' });
    this.componentColorInput = page
      .locator(`input[class*="rows_color_row__color-input"]`)
      .last();
    this.fillTokenColor = this.designTabpanel
      .locator('div[class*="color_row__token-name"]')
      .last();
    this.searchByTokenNameInput = page.getByRole('textbox', {
      name: 'Search by token name',
    });
    this.colorPickerTokensButton =
      this.colorPickerContainer.getByTestId('opt-token-color');
    this.selectedColors = this.designTabpanel.locator(
      '[class*="color_selection__element-set"]',
    );
    this.selectedColorInputs = this.selectedColors.getByRole('textbox', {
      name: 'Color',
    });
    this.lastSelectedColorInput = this.selectedColorInputs.last();

    //Design panel - Shadow section
    this.shadowSectionContainer = page.locator(
      '.main_ui_workspace_sidebar_options_menus_shadow__shadow-section',
    );
    this.shadowSection = page.getByText('Shadow', { exact: true });
    this.groupShadowSection = page.getByText('Group shadow', { exact: true });
    this.addShadowButton = page.getByRole('button', { name: 'Add shadow' });
    this.shadowActionsButton = this.shadowSectionContainer.getByRole('button', {
      name: 'open more options',
    });
    this.shadowXInput = page.locator(
      'div[class*="shadow-advanced"] div[title="X"] input',
    );
    this.shadowYInput = page.locator(
      'div[class*="shadow-advanced"] div[title="Y"] input',
    );
    this.shadowBlurInput = page.locator('div[title="Blur"] input');
    this.shadowSpreadInput = page.locator('div[title="Spread"] input');
    this.shadowColorIcon = page.locator(
      'div[class*="shadow-advanced"] div[class*="color-bullet-wrapper"]',
    );
    this.shadowOpacityInput = page.locator(
      'div[class*="shadow-advanced"] div[class*="color_row__opacity"] input',
    );
    this.shadowShowIcon = page.getByRole('button', { name: 'Toggle shadow' });
    this.shadowUnhideIcon = page.getByRole('button', { name: 'Toggle shadow' });
    this.shadowRemoveIcon = page.getByRole('button', { name: 'Remove shadow' });
    this.shadowTypeField = page.locator('div[class*="shadow-basic-select"]');

    //Design panel - Flex Layout section
    this.flexLayoutMenu = page.locator('div[class*="flex-layout-menu"]');
    this.flexElementMenu = page.locator('div[class*="flex-element-menu"]');
    this.flexLayoutCollapsedIcon = page.locator(
      'div[class*="layout_container"] button:has([href="#icon-arrow-right"])',
    );
    this.flexElementAlignStartBtn = page.getByTestId('align-self-start');
    this.flexElementAlignCenterBtn = page.getByTestId('align-self-center');
    this.flexElementAlignEndBtn = page.getByTestId('align-self-end');
    this.flexElementMarginVertInput = page.getByRole('textbox', {
      name: 'Vertical margin',
    });
    this.flexElementMarginHorizontalInput = page.getByRole('textbox', {
      name: 'Horizontal margin',
    });
    this.flexElementPositionAbsolute = page.locator(
      'label[for=":absolute-position"] span',
    );
    this.flexElementPositionAbsoluteChecked = page.locator(
      'label[for=":absolute-position"][class*="buttons__checked"]',
    );
    this.flexElementWidth100Btn = page.getByTitle('Width 100%');
    this.flexElementHeight100Btn = page.getByTitle('Height 100%');
    this.flexElementFixWidthBtn = page.getByTitle('Fix width');
    this.flexElementFixHeightBtn = page.getByTitle('Fix height');
    this.flexAddLayoutButton = page.getByRole('button', { name: 'Flex layout' });
    this.gridAddLayoutButton = page.getByRole('button', { name: 'Grid layout' });
    this.gridEditButton = page.getByRole('button', { name: 'Edit grid' });
    this.gridDoneButton = page.getByRole('button', { name: 'Done' });
    this.gridLocateButton = page.getByRole('button', {
      name: 'Locate',
      exact: true,
    });
    this.gridLayoutMenu = page.locator('div[class*="grid-layout-menu"]').first();
    this.manualButton = page.getByText('manual');
    this.areaButton = page.getByText('area');
    this.areaNameInput = page.getByPlaceholder('Area name');
    this.gridExpandGridColumnLengthButton = page
      .locator('div[class*="grid-track-header"] button[class*="expand-icon"]')
      .first();
    this.gridExpandGridRowLengthButton = page
      .locator('div[class*="grid-track-header"] button[class*="expand-icon"]')
      .last();
    this.gridFirstColumnSelectButton = page
      .locator('div[class*="track-info-dir-icon"] svg[class*="icon-flex-vertical"]')
      .first();
    this.flexMenuItem = page.getByRole('option').filter({ hasText: 'FR' });
    this.autoMenuItem = page.getByRole('option').filter({ hasText: 'AUTO' });
    this.fixedMenuItem = page.getByRole('option').filter({ hasText: 'PX' });
    this.percentMenuItem = page.getByRole('option').filter({ hasText: '%' });
    this.layoutRemoveButton = page.getByRole('button', { name: 'Remove layout' });
    this.layoutAddButton = page.getByRole('button', { name: 'Add layout' });
    this.layoutDirectRowBtn = page.getByTitle('Row', { exact: true });
    this.layoutDirectRowReverseBtn = page.getByTitle('Row reverse', { exact: true });
    this.layoutDirectColumnBtn = page.getByTitle('Column', { exact: true });
    this.layoutDirectColumnReverseBtn = page.getByTitle('Column reverse', {
      exact: true,
    });
    this.layoutAlignStartBtn = page.getByTitle('Align items start', { exact: true });
    this.layoutAlignCenterBtn = page.getByTitle('Align items center', {
      exact: true,
    });
    this.layoutAlignEndBtn = page.getByTitle('Align items end', { exact: true });
    this.layoutJustifyStartBtn = page.getByTitle('Justify content start', {
      exact: true,
    });
    this.layoutJustifyCenterBtn = page.getByTitle('Justify content center', {
      exact: true,
    });
    this.layoutJustifyEndBtn = page.getByTitle('Justify content end', {
      exact: true,
    });
    this.layoutJustifySpaceBetweenBtn = page.getByTitle(
      'Justify content space-between',
      { exact: true },
    );
    this.layoutJustifySpaceAroundBtn = page.getByTitle(
      'Justify content space-around',
      { exact: true },
    );
    this.layoutJustifySpaceEvenlyBtn = page.getByTitle(
      'Justify content space-evenly',
      { exact: true },
    );
    this.layoutColumnGapInput = page.locator('div[aria-label="Column gap"] input');
    this.layoutRowGapInput = page.locator('div[aria-label="Row gap"] input');
    this.layoutVerticalPaddingInput = page.locator(
      'div[aria-label="Vertical padding"] input',
    );
    this.layoutHorizontalPaddingInput = page.locator(
      'div[aria-label="Horizontal padding"] input',
    );
    this.layoutIndepPaddingsIcon = page.locator('button[class*="padding-toggle"]');
    this.layoutPaddingTopInput = page.locator('div[aria-label="Top padding"] input');
    this.layoutPaddingRightInput = page.locator(
      'div[aria-label="Right padding"] input',
    );
    this.layoutPaddingBottomInput = page.locator(
      'div[aria-label="Bottom padding"] input',
    );
    this.layoutPaddingLeftInput = page.locator(
      'div[aria-label="Left padding"] input',
    );
    this.layoutGridJustifyStartBtn = page.getByTitle('Justify items start', {
      exact: true,
    });
    this.layoutGridJustifyCenterBtn = page.getByTitle('Justify items center', {
      exact: true,
    });
    this.layoutGridJustifyEndBtn = page.getByTitle('Justify items end', {
      exact: true,
    });
    this.layoutGridJustifySpaceBetweenBtn = page.getByTitle(
      'Justify items space-between',
      { exact: true },
    );
    this.layoutGridJustifySpaceAroundBtn = page.getByTitle(
      'Justify items space-around',
      { exact: true },
    );
    this.layoutGridJustifySpaceEvenlyBtn = page.getByTitle(
      'Justify items space-evenly',
      { exact: true },
    );

    //Design panel - Blur section
    this.blurSection = page.getByRole('region', {
      name: 'Blur effects',
      exact: true,
    });
    this.addBlurButton = this.blurSection.getByRole('button', { name: 'Add blur' });
    this.blurTypeSelect = this.blurSection.getByRole('combobox', {
      name: 'Blur type select',
    });
    this.blurMoreOptions = this.blurSection.locator(
      'button[class*="blur__show-more"]',
    );
    this.blurValueInput = this.blurSection.getByRole('textbox');
    this.blurHideIcon = this.blurSection.getByRole('button', {
      name: 'Toggle blur',
    });
    this.blurUnhideIcon = this.blurSection.getByRole('button', {
      name: 'Toggle blur',
    });
    this.blurRemoveIcon = this.blurSection.getByRole('button', {
      name: 'Remove blur',
    });

    //Design panel - Stroke section
    this.strokeSectionContainer = this.rightSidebar.getByRole('region', {
      name: 'Stroke',
    });
    this.addStrokeButton = page.getByRole('button', { name: 'Add stroke color' });
    this.strokeSection = page.getByText('Stroke', { exact: true });
    this.strokeElement = page.locator('div[class*="stroke-color-actions"]').last();
    this.strokeColorBullet = this.strokeElement
      .locator('div[class*="color-bullet-wrapper"]')
      .last();
    this.strokeRemoveIcon = this.strokeElement.getByRole('button', {
      name: 'Remove stroke',
    });
    this.strokeColorInput = this.strokeElement.locator(
      'input[class*="color-input"]',
    );
    this.strokeWidthInput = page.locator('div[aria-label="Stroke width"] input');
    this.strokeOpacityInput = this.strokeElement.locator(
      'input[data-testid="opacity-input"]',
    );
    this.strokeAlignmentField = page.getByTestId('stroke.alignment');
    this.strokeTypeField = page.getByTestId('stroke.style');
    this.strokeCapStartDropdown =
      this.strokeSectionContainer.getByTestId('stroke.cap-start');
    this.strokeCapEndDropdown =
      this.strokeSectionContainer.getByTestId('stroke.cap-end');
    this.strokeCapSwitchButton = this.strokeSectionContainer.getByRole('button', {
      name: 'Switch',
    });
    this.strokeDashInput = this.strokeSectionContainer.getByRole('textbox', {
      name: 'Dash',
    });
    this.strokeGapInput = this.strokeSectionContainer.getByRole('textbox', {
      name: 'Gap',
    });

    //Design panel - Text section
    this.textSectionRegion = this.rightSidebar.getByRole('region', {
      name: 'Text section',
    });
    this.textOptionsFull = this.textSectionRegion.locator(
      '.main_ui_workspace_sidebar_options_menus_typography__text-options-full-size',
    );
    // Design panel - Text element menu (align, grow, vertical align, decoration, direction)
    this.textElementMenu = this.textSectionRegion.locator(
      'div[class*="text__element-content"]',
    );
    this.textAlignLeft = this.textElementMenu.getByRole('button', {
      name: 'Align left',
      exact: true,
    });
    this.textAlignCenter = this.textElementMenu.getByRole('button', {
      name: 'Align center',
      exact: true,
    });
    this.textAlignRight = this.textElementMenu.getByRole('button', {
      name: 'Align right',
      exact: true,
    });
    this.textAlignJustify = this.textElementMenu.getByRole('button', {
      name: 'Justify',
      exact: true,
    });
    this.textGrowFixed = this.textElementMenu.getByRole('button', {
      name: 'Fixed',
      exact: true,
    });
    this.textGrowAutoWidth = this.textElementMenu.getByRole('button', {
      name: 'Auto width',
      exact: true,
    });
    this.textGrowAutoHeight = this.textElementMenu.getByRole('button', {
      name: 'Auto height',
      exact: true,
    });
    this.textUpperCaseIcon = page.getByTestId('text-transform-uppercase');
    this.textLowerCaseIcon = page.getByTestId('text-transform-lowercase');
    this.textTitleCaseIcon = page.getByTestId('text-transform-capitalize');
    this.textMoreOptionsIcon = this.textElementMenu.getByRole('button', {
      name: 'Options',
      exact: true,
    });
    this.textVerticalOptionsBlock = page.locator(
      'div[class*="vertical-align-options"]',
    );
    this.textAlignTop = this.textElementMenu.getByRole('button', {
      name: 'Align top',
      exact: true,
    });
    this.textAlignMiddle = this.textElementMenu.getByRole('button', {
      name: 'Align middle',
      exact: true,
    });
    this.textAlignBottom = this.textElementMenu.getByRole('button', {
      name: 'Align bottom',
      exact: true,
    });
    this.textIconLTR = this.textElementMenu.getByRole('button', {
      name: 'LTR',
      exact: true,
    });
    this.textIconRTL = this.textElementMenu.getByRole('button', {
      name: 'RTL',
      exact: true,
    });
    this.textFontSelector = page.locator('div[class*="typography__font-option"]');
    this.textFontSelectorSearchInput = page.getByPlaceholder('Search font');
    this.textFontItemResult = page.locator(
      '.main_ui_workspace_sidebar_options_menus_typography__font-item',
    );
    this.textFontStyleSelector = page.locator(
      'div[class*="typography__font-variant-options"]',
    );

    this.textFontSizeInput = this.designTabpanel.getByRole('textbox', {
      name: 'Font Size',
    });
    this.textLineHeightInput = page.getByTitle('Line Height').locator('input');
    this.textLetterSpacingInput = page.getByTitle('Letter Spacing').locator('input');
    this.textUnderline = page.getByTestId('underline-text-decoration');
    this.textStrikethrough = page.getByTestId('line-through-text-decoration');
    this.textTypographyMenuButton = this.designTabpanel
      .locator('div[class*="element-set-actions"]')
      .getByRole('button', { name: 'Open' });
    this.typographyEntry = this.designTabpanel.locator(
      'div[class*="typography-entry"]',
    );
    this.textTransformMenu = page.locator('[class*="typography__text-transform"]');
    this.textUpperCaseButton = this.textTransformMenu.getByTitle('Upper Case');
    this.textCapitalizeButton = this.textTransformMenu.getByTitle('Capitalize');
    this.textLowerCaseButton = this.textTransformMenu.getByTitle('Lower Case');
    this.typographyAssetAg = this.designTabpanel.getByText('Ag', {
      exact: true,
    });
    this.typographyTokenButton = this.rightSidebar.getByLabel('typography');
    this.typographyErrorDot = this.textSectionRegion.locator(
      '.main_ui_workspace_sidebar_options_menus_token_typography_row__error-dot',
    );
    this.typographyOpenTokenListButton = this.textSectionRegion.getByRole('button', {
      name: 'Open token list',
    });
    this.typographyListBox = this.textSectionRegion.getByRole('listbox');
    this.typographySearchTokenListInput = this.typographyListBox.getByRole(
      'textbox',
      { name: 'Search by token name' },
    );

    //Design panel - Export section
    this.exportSection = page.getByText('Export', { exact: true });
    this.addExportButton = page.getByRole('button', { name: 'Add export' });
    this.addExportVieverButton = page.locator(
      'button[class*="exports__add-export"]',
    );
    this.removeExportButton = page.getByRole('button', { name: 'Remove export' });
    this.exportElementButton = page.getByRole('button', {
      name: /Export \d+ element/,
    });

    //Design panel - Guides section
    this.guidesSection = page.getByText('Guides', { exact: true });
    this.addGuidesButton = page.getByRole('button', { name: 'Add guide' });
    this.removeGuidesButton = page.getByRole('button', { name: 'Remove guide' });
    this.hideGuidesButton = page.getByRole('button', { name: 'Toggle guide' });
    this.unhideGuidesButton = page.getByRole('button', { name: 'Toggle guide' });
    this.guidesTypeField = page.locator(
      'div[class*="grid__option-row"] div[class*="type-select-wrapper"]',
    );
    this.guidesTypeSelectorSquareOption = page.getByText('Square', { exact: true });
    this.guidesTypeSelectorColumnsOption = page.getByText('Columns', {
      exact: true,
    });
    this.guidesTypeSelectorRowsOption = page.getByText('Rows', { exact: true });
    this.guidesSizeInput = page.locator(`input[class*='grid__numeric-input']`);
    this.guidesColumnsRowsInput = page.locator(
      'div[class*="grid__column-select"] input',
    );
    this.guidesActionsButton = page.locator('button[class*="grid__show-options"]');
    this.guidesOpacityInput = page.locator(
      'div[class*="grid__advanced-row"] input[class*="opacity-input"]',
    );
    this.guidesMoreOptionsButton = page.locator(
      'div[class*="grid__advanced-row"] button[class*="show-more-options"]',
    );
    this.useDefaultGuidesButton = page
      .getByRole('button')
      .filter({ hasText: 'Use default' });

    // Design panel - Guides section - Advanced Options
    this.guidesAdvancedOptionsSection = page.locator(
      '.main_ui_workspace_sidebar_options_common__advanced-options-wrapper',
    );
    this.guidesWidthInput = this.guidesAdvancedOptionsSection
      .getByTitle('Width')
      .getByPlaceholder('Auto');
    this.guidesHeightInput = this.guidesAdvancedOptionsSection
      .getByTitle('Height')
      .getByPlaceholder('Auto');

    //Design panel - Component section
    this.componentContent = page.locator('div[class*="component-content"]');
    this.componentMenuButton = this.componentContent.locator(
      'div[class*="component__pill-actions"]',
    );
    this.showInAssetsPanelOptionDesign = page
      .getByRole('listitem')
      .filter({ hasText: 'Show in assets panel' });
    this.componentBlockOnDesignTab = page.locator('div[class*="component-section"]');
    this.createAnnotationOptionDesign = page
      .getByRole('listitem')
      .filter({ hasText: 'Create annotation' });
    this.annotationTextArea = page.locator('#annotation-textarea');
    this.annotationCreateTitle = page
      .locator('div[class*="component__annotation-title"]')
      .first();
    this.createAnnotationTick = this.componentContent.getByTitle('Create');
    this.saveAnnotationTick = this.componentContent.getByTitle('Save');
    this.editAnnotationTick = this.componentContent.getByTitle('Edit');
    this.deleteAnnotationTick = this.componentContent.getByTitle('Delete');
    this.deleteAnnotationModalContainer = page
      .locator('.main_ui_confirm__modal-container')
      .filter({ hasText: 'Delete annotation' });
    this.deleteAnnotationOkBtn = this.deleteAnnotationModalContainer.getByRole(
      'button',
      { name: 'Ok', exact: true },
    );
    this.createVariantOptionDesign = page
      .getByRole('listitem')
      .filter({ hasText: 'Create variant' });
    this.variantLabel = page
      .getByRole('tabpanel')
      .getByText('Variant', { exact: true });
    this.addNewPropertyOptionDesign = page
      .getByRole('listitem')
      .filter({ hasText: 'Add new property' });
    this.propertyNameInput = page.locator('[class*="variant-property-name"] input');
    this.componentTypeOnDesignPanel = page.locator(
      '[class*="component-title-bar-type"]',
    );
    this.detachInstanceOptionDesign = page
      .getByRole('listitem')
      .filter({ hasText: 'Detach instance' });
    this.clipContentButton = page.locator('//input[@id="clip-content"]/..');
    this.variantPropertyList = page.locator('[class*="variant-property-list"]');
    this.firstVariantProperty = this.variantPropertyList
      .locator('div[class*="variant-property-value-wrapper"]')
      .first();
    this.swapComponentButton = page.getByTestId('component-pill-button');
    this.swapComponentTab = page.locator('[class*="component__swap"]').first();
    this.swapGridRadioButton = page.locator('label[for="swap-opt-grid"]');
    this.variantWarningWrapper = page.locator('[class*="variant-warning"]').first();
    this.locateDuplicatedVariantsButton = page.getByRole('button', {
      name: 'Locate duplicated variants',
      exact: true,
    });
    this.variantPropertySwitch = this.componentBlockOnDesignTab.getByRole('switch');
  }

  getTypographyTokenModal(tokenName) {
    return this.page.getByRole('tooltip').getByText(`Name: ${tokenName}`);
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
        await this.flexElementMarginVertInput.clear();
        await this.flexElementMarginVertInput.pressSequentially(value);
        break;
      case 'Horizontal':
        await this.flexElementMarginHorizontalInput.clear();
        await this.flexElementMarginHorizontalInput.pressSequentially(value);
        break;
    }
    await this.clickOnEnter();
  }

  async setComponentColor(color) {
    await this.componentColorInput.clear();
    await this.componentColorInput.fill(color);
  }

  async setFlexElementPositionAbsolute() {
    await this.flexElementPositionAbsolute.click();
  }

  async isFlexElementPositionAbsoluteChecked(checked = true) {
    checked
      ? await expect(this.flexElementPositionAbsoluteChecked).toBeVisible()
      : await expect(this.flexElementPositionAbsoluteChecked).not.toBeVisible();
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
    await this.strokeColorInput.clear();
    await this.strokeColorInput.pressSequentially(value);
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
    await this.strokeWidthInput.clear();
    await this.strokeWidthInput.pressSequentially(value);
    await this.clickOnEnter();
  }

  async setStrokeOpacity(value) {
    await this.strokeOpacityInput.clear();
    await this.strokeOpacityInput.pressSequentially(value);
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

  getColorTokenButtonByName(tokenName) {
    return this.colorPickerContainer.getByRole('button', {
      name: tokenName,
      exact: true,
    });
  }

  async clickFirstColorIcon() {
    await this.firstColorIcon.click();
  }
  async clickFillColorIcon() {
    await this.fillColorIcon.click();
  }

  async changeOpacityForFill(value) {
    await this.fillOpacityInput.clear();
    await this.fillOpacityInput.pressSequentially(value);
  }

  async fillSearchByTokenNameInput(tokenName) {
    await this.searchByTokenNameInput.fill(tokenName);
  }

  async clickColorTokenButton(tokenName) {
    await this.getColorTokenButtonByName(tokenName).click();
  }

  async isFillHexCodeSet(value) {
    await expect(this.fillColorInput).toHaveValue(value.slice(1));
  }

  async isSelectedHexCode(value) {
    await expect(this.lastSelectedColorInput).toHaveValue(value.slice(1));
  }

  async isFillHexCodeSetComponent(value) {
    await expect(this.componentColorInput).toHaveValue(value.slice(1));
  }

  async isFillTokenColorSetComponent(value) {
    await expect(this.fillTokenColor).toHaveText(value);
  }

  async isFillOpacitySet(value) {
    await expect(this.fillOpacityInput).toHaveValue(value);
  }

  async isSearchByTokenNameInputVisible() {
    await expect(
      this.searchByTokenNameInput,
      'Search by token name input is visible',
    ).toBeVisible();
  }

  async isColorTokenButtonVisible(tokenName) {
    await expect(
      this.getColorTokenButtonByName(tokenName),
      `Color token button "${tokenName}" is visible`,
    ).toBeVisible();
  }

  async isColorTokenButtonNotVisible(tokenName) {
    await expect(
      this.getColorTokenButtonByName(tokenName),
      `Color token button "${tokenName}" is not visible`,
    ).not.toBeVisible();
  }

  async clickColorPickerTokensButton() {
    await this.colorPickerTokensButton.click();
  }

  async isColorPickerTokensButtonVisible() {
    await expect(
      this.colorPickerTokensButton,
      'Color picker Tokens switch button is visible',
    ).toBeVisible();
  }

  async isSearchByTokenNameInputNotVisible() {
    await expect(
      this.searchByTokenNameInput,
      'Search by token name input is not visible (Colors mode is active)',
    ).not.toBeVisible();
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
    const detachButton = this.page
      .locator('div[aria-label="Rotation"]')
      .getByRole('button', { name: 'Detach token' });
    if ((await detachButton.count()) > 0) {
      await detachButton.click({ force: true });
    }
    await this.layerRotationInput.clear();
    await this.layerRotationInput.pressSequentially(value);
    await this.clickOnEnter();
    await this.layerRotationInput.blur();
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
    await this.generalCornerRadiusInput.clear();
    await this.generalCornerRadiusInput.pressSequentially(value);
    await this.clickOnEnter();
  }

  async changeTopLeftCornerRadiusForLayer(value) {
    await this.topLeftCornerRadiusInput.clear();
    await this.topLeftCornerRadiusInput.pressSequentially(value);
    await this.clickOnEnter();
  }

  async changeTopRightCornerRadiusForLayer(value) {
    await this.topRightCornerRadiusInput.clear();
    await this.topRightCornerRadiusInput.pressSequentially(value);
    await this.clickOnEnter();
  }

  async changeBottomLeftCornerRadiusForLayer(value) {
    await this.bottomLeftCornerRadiusInput.clear();
    await this.bottomLeftCornerRadiusInput.pressSequentially(value);
    await this.clickOnEnter();
  }

  async changeBottomRightCornerRadiusForLayer(value) {
    await this.bottomRightCornerRadiusInput.clear();
    await this.bottomRightCornerRadiusInput.pressSequentially(value);
    await this.clickOnEnter();
  }

  async changeWidthForLayer(width) {
    await this.sizeWidthInput.clear();
    await this.sizeWidthInput.pressSequentially(width);
    await this.clickOnEnter();
    await this.waitForChangeIsSaved();
  }

  async changeHeightForLayer(height) {
    await this.sizeHeightInput.clear();
    await this.sizeHeightInput.pressSequentially(height);
    await this.clickOnEnter();
    await this.waitForChangeIsSaved();
  }

  async changeHeightAndWidthForLayer(height, width) {
    await this.changeWidthForLayer(width);
    await this.changeHeightForLayer(height);
  }

  async alignObjects(alignment) {
    switch (alignment) {
      case 'Left':
        await this.alignLeftButton.click();
        break;
      case 'Horizontal center':
        await this.alignHorizontalCenterButton.click();
        break;
      case 'Right':
        await this.alignRightButton.click();
        break;
      case 'Top':
        await this.alignTopButton.click();
        break;
      case 'Vertical center':
        await this.alignVerticalCenterButton.click();
        break;
      case 'Bottom':
        await this.alignBottomButton.click();
        break;
    }
  }

  async clickAddShadowButton() {
    await this.shadowSection.waitFor();
    await this.addShadowButton.click();
  }

  async clickAddGroupShadowButton() {
    await this.groupShadowSection.waitFor();
    await this.addShadowButton.click();
  }

  async clickShadowActionsButton(index = 0) {
    await this.shadowActionsButton.nth(index).click();
  }

  async changeShadowSettings(x, y, blur, spread, opacity) {
    await this.changeXForShadow(x);
    await this.changeYForShadow(y);
    await this.changeBlurForShadow(blur);
    await this.changeSpreadForShadow(spread);
    await this.changeOpacityForShadow(opacity);
  }

  async changeXForShadow(value) {
    await this.shadowXInput.clear();
    await this.shadowXInput.pressSequentially(value);
  }

  async changeYForShadow(value) {
    await this.shadowYInput.clear();
    await this.shadowYInput.pressSequentially(value);
  }

  async changeBlurForShadow(value) {
    await this.shadowBlurInput.clear();
    await this.shadowBlurInput.pressSequentially(value);
  }

  async changeSpreadForShadow(value) {
    await this.shadowSpreadInput.clear();
    await this.shadowSpreadInput.pressSequentially(value);
  }

  async changeOpacityForShadow(value) {
    await this.shadowOpacityInput.clear();
    await this.shadowOpacityInput.pressSequentially(value);
  }

  async clickShadowColorIcon() {
    await this.shadowColorIcon.click();
  }

  async selectTypeForShadow(type) {
    await this.shadowTypeField.click();
    const typeOptionSel = this.page.getByRole('option', { name: type, exact: true });
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
    await this.addBlurButton.click();
  }

  async selectTypeForBlurEffects(type) {
    await this.blurTypeSelect.click();
    const typeOptionSel = this.page.getByRole('option', { name: type, exact: true });
    await typeOptionSel.click();
  }

  async changeValueForBlur(value) {
    await this.blurMoreOptions.click();
    await this.blurValueInput.clear();
    await this.blurValueInput.pressSequentially(value);
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

  /**
   * Clicks a button in the text element menu (horizontal/vertical align, grow
   * type, direction). Vertical align and direction live behind the "Options"
   * toggle, so the block is opened first when needed.
   * @param {'Left'|'Center'|'Right'|'Justify'|'Top'|'Middle'|'Bottom'|'LTR'|'RTL'|'Underline'|'Strikethrough'|'Fixed'|'Auto width'|'Auto height'} value
   */
  async changeTextOption(value) {
    const behindOptionsToggle = [
      'Top',
      'Middle',
      'Bottom',
      'LTR',
      'RTL',
      'Underline',
      'Strikethrough',
    ];
    if (behindOptionsToggle.includes(value)) {
      await this.openTextMoreOptionsBlock();
    }
    switch (value) {
      case 'Left':
        await this.textAlignLeft.click();
        break;
      case 'Center':
        await this.textAlignCenter.click();
        break;
      case 'Right':
        await this.textAlignRight.click();
        break;
      case 'Justify':
        await this.textAlignJustify.click();
        break;
      case 'Top':
        await this.textAlignTop.click();
        break;
      case 'Middle':
        await this.textAlignMiddle.click();
        break;
      case 'Bottom':
        await this.textAlignBottom.click();
        break;
      case 'LTR':
        await this.textIconLTR.click();
        break;
      case 'RTL':
        await this.textIconRTL.click();
        break;
      case 'Underline':
        await this.textUnderline.click();
        break;
      case 'Strikethrough':
        await this.textStrikethrough.click();
        break;
      case 'Fixed':
        await this.textGrowFixed.click();
        break;
      case 'Auto width':
        await this.textGrowAutoWidth.click();
        break;
      case 'Auto height':
        await this.textGrowAutoHeight.click();
        break;
      default:
        throw new Error(`Unsupported text option: ${value}`);
    }
  }

  async openTypographyFontDropdown() {
    await this.textFontSelector.click();
  }

  async searchTypographyFontFromSearch(fontName) {
    await this.textFontSelectorSearchInput.fill(fontName);
  }

  async clearTypographyFontSearchBar() {
    await this.textFontSelectorSearchInput.clear();
  }

  async isTypographyFontItemVisible(fontName) {
    await expect(
      this.textFontItemResult.getByText(fontName, { exact: true }),
    ).toBeVisible();
  }

  async isTypographyFontItemNotVisible(fontName) {
    await expect(
      this.textFontItemResult.getByText(fontName, { exact: true }),
    ).not.toBeVisible();
  }

  async changeTextFont(fontName) {
    await this.openTypographyFontDropdown();
    await this.searchTypographyFontFromSearch(fontName);
    await this.page
      .locator('div[class*="fonts-list"]')
      .getByText(fontName, { exact: true })
      .first()
      .click();
    await expect(this.textFontSelector).toBeVisible();
  }

  async changeTextFontStyle(fontStyleName) {
    await this.textFontStyleSelector.click();
    await this.textFontStyleSelector
      .getByRole('list')
      .getByText(fontStyleName, { exact: true })
      .click();
  }

  async changeTextFontSize(value) {
    await this.textFontSizeInput.fill(value);
  }

  async changeTextLineHeight(value) {
    await this.textLineHeightInput.fill(value);
    await this.clickOnEnter();
  }

  async changeTextLetterSpacing(value) {
    await this.textLetterSpacingInput.fill(value);
    await this.clickOnEnter();
  }

  async clickOnTextAlignOptionsButton() {
    await this.openTextMoreOptionsBlock();
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

  async addLayoutFromDesignPanel(layoutName) {
    await this.layoutAddButton.click();
    layoutName === 'flex'
      ? await this.flexAddLayoutButton.click()
      : await this.gridAddLayoutButton.click();
  }

  async openGridEditModeFromDesignPanel() {
    await this.gridEditButton.click();
  }
  async clickGridDoneButton() {
    await this.gridDoneButton.click();
  }

  async clickGridLocateButton() {
    await this.gridLocateButton.click();
  }

  async expandFlexLayoutMenu() {
    if (!(await this.flexLayoutMenu.isVisible())) {
      await this.flexLayoutCollapsedIcon.click();
    }
    await expect(this.flexLayoutMenu).toBeVisible();
  }

  async expandGridLayoutMenu() {
    if (!(await this.gridLayoutMenu.isVisible())) {
      await this.flexLayoutCollapsedIcon.click();
    }
    await expect(this.gridLayoutMenu).toBeVisible();
  }

  async changeLayoutDirection(direction, flex = true) {
    flex ? await this.expandFlexLayoutMenu() : await this.expandGridLayoutMenu();
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

  async changeLayoutAlignment(alignment, flex = true) {
    if (flex) {
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
    } else {
      await this.expandGridLayoutMenu();
      switch (alignment) {
        case 'Start':
          await this.layoutAlignStartBtn.first().click();
          await this.layoutAlignStartBtn.last().click();
          break;
        case 'Center':
          await this.layoutAlignCenterBtn.first().click();
          await this.layoutAlignCenterBtn.last().click();
          break;
        case 'End':
          await this.layoutAlignEndBtn.first().click();
          await this.layoutAlignEndBtn.last().click();
          break;
      }
    }
  }

  async changeLayoutJustification(justify, flex = true) {
    if (flex) {
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
    } else {
      await this.expandGridLayoutMenu();
      switch (justify) {
        case 'Start':
          await this.layoutGridJustifyStartBtn.first().click();
          await this.layoutGridJustifyStartBtn.last().click();
          break;
        case 'Center':
          await this.layoutGridJustifyCenterBtn.first().click();
          await this.layoutGridJustifyCenterBtn.last().click();
          break;
        case 'End':
          await this.layoutGridJustifyEndBtn.first().click();
          await this.layoutGridJustifyEndBtn.last().click();
          break;
        case 'Space between':
          await this.layoutGridJustifySpaceBetweenBtn.first().click();
          await this.layoutGridJustifySpaceBetweenBtn.last().click();
          break;
        case 'Space around':
          await this.layoutGridJustifySpaceAroundBtn.first().click();
          await this.layoutGridJustifySpaceAroundBtn.last().click();
          break;
        case 'Space evenly':
          await this.layoutGridJustifySpaceEvenlyBtn.first().click();
          await this.layoutGridJustifySpaceEvenlyBtn.last().click();
          break;
      }
    }
  }

  async checkLayoutJustification(justify, flex = true) {
    if (flex) {
      await this.expandFlexLayoutMenu();
      switch (justify) {
        case 'Start':
          await expect(this.layoutJustifyStartBtn).toBeChecked();
          break;
        case 'Center':
          await expect(this.layoutJustifyCenterBtn).toBeChecked();
          break;
        case 'End':
          await expect(this.layoutJustifyEndBtn).toBeChecked();
          break;
        case 'Space between':
          await expect(this.layoutJustifySpaceBetweenBtn).toBeChecked();
          break;
        case 'Space around':
          await expect(this.layoutJustifySpaceAroundBtn).toBeChecked();
          break;
        case 'Space evenly':
          await expect(this.layoutJustifySpaceEvenlyBtn).toBeChecked();
          break;
      }
    } else {
      await this.expandGridLayoutMenu();
      switch (justify) {
        case 'Start':
          await expect(this.layoutGridJustifyStartBtn.first()).toBeChecked();
          await expect(this.layoutGridJustifyStartBtn.last()).toBeChecked();
          break;
        case 'Center':
          await expect(this.layoutGridJustifyCenterBtn.first()).toBeChecked();
          await expect(this.layoutGridJustifyCenterBtn.last()).toBeChecked();
          break;
        case 'End':
          await expect(this.layoutGridJustifyEndBtn.first()).toBeChecked();
          await expect(this.layoutGridJustifyEndBtn.last()).toBeChecked();
          break;
        case 'Space between':
          await expect(this.layoutGridJustifySpaceBetweenBtn.first()).toBeChecked();
          await expect(this.layoutGridJustifySpaceBetweenBtn.last()).toBeChecked();
          break;
        case 'Space around':
          await expect(this.layoutGridJustifySpaceAroundBtn.first()).toBeChecked();
          await expect(this.layoutGridJustifySpaceAroundBtn.last()).toBeChecked();
          break;
        case 'Space evenly':
          await expect(this.layoutGridJustifySpaceEvenlyBtn.first()).toBeChecked();
          await expect(this.layoutGridJustifySpaceEvenlyBtn.last()).toBeChecked();
          break;
      }
    }
  }

  async changeLayoutColumnGap(value, flex = true) {
    flex ? await this.expandFlexLayoutMenu() : await this.expandGridLayoutMenu();
    await this.layoutColumnGapInput.clear();
    await this.layoutColumnGapInput.pressSequentially(value);
    await this.clickOnEnter();
  }

  async clickLayoutColumnGapField() {
    await this.layoutColumnGapInput.click();
  }

  async changeLayoutRowGap(value, flex = true) {
    flex ? await this.expandFlexLayoutMenu() : await this.expandGridLayoutMenu();
    await this.layoutRowGapInput.clear();
    await this.layoutRowGapInput.pressSequentially(value);
    await this.clickOnEnter();
  }

  async changeLayoutRowGapOnGridEdit(value) {
    await this.layoutRowGapInput.clear();
    await this.layoutRowGapInput.pressSequentially(value);
    await this.clickOnEnter();
  }

  async changeLayoutPadding(type, value, flex = true) {
    flex ? await this.expandFlexLayoutMenu() : await this.expandGridLayoutMenu();
    switch (type) {
      case 'Vertical':
        await this.layoutVerticalPaddingInput.clear();
        await this.layoutVerticalPaddingInput.pressSequentially(value);
        break;
      case 'Horizontal':
        await this.layoutHorizontalPaddingInput.clear();
        await this.layoutHorizontalPaddingInput.pressSequentially(value);
        break;
    }
    await this.clickOnEnter();
  }

  async clickLayoutVerticalPaddingField() {
    await this.layoutVerticalPaddingInput.click();
  }

  async clickLayoutHorizontalPaddingField() {
    await this.layoutHorizontalPaddingInput.click();
  }

  async switchToIndependentPadding(flex = true) {
    flex ? await this.expandFlexLayoutMenu() : await this.expandGridLayoutMenu();
    await this.layoutIndepPaddingsIcon.click();
  }

  async switchToIndependentPaddingOnGridEdit() {
    await this.layoutIndepPaddingsIcon.click();
  }

  async changeLayoutIndependentPadding(type, value, flex = true) {
    flex ? await this.expandFlexLayoutMenu() : await this.expandGridLayoutMenu();
    switch (type) {
      case 'Bottom':
        await this.layoutPaddingBottomInput.clear();
        await this.layoutPaddingBottomInput.pressSequentially(value);
        break;
      case 'Right':
        await this.layoutPaddingRightInput.clear();
        await this.layoutPaddingRightInput.pressSequentially(value);
        break;
      case 'Left':
        await this.layoutPaddingLeftInput.clear();
        await this.layoutPaddingLeftInput.pressSequentially(value);
        break;
      case 'Top':
        await this.layoutPaddingTopInput.clear();
        await this.layoutPaddingTopInput.pressSequentially(value);
        break;
    }
    await this.clickOnEnter();
  }

  async changeLayoutIndependentPaddingOnGridEdit(type, value) {
    switch (type) {
      case 'Bottom':
        await this.layoutPaddingBottomInput.clear();
        await this.layoutPaddingBottomInput.pressSequentially(value);
        break;
      case 'Right':
        await this.layoutPaddingRightInput.clear();
        await this.layoutPaddingRightInput.pressSequentially(value);
        break;
      case 'Left':
        await this.layoutPaddingLeftInput.clear();
        await this.layoutPaddingLeftInput.pressSequentially(value);
        break;
      case 'Top':
        await this.layoutPaddingTopInput.clear();
        await this.layoutPaddingTopInput.pressSequentially(value);
        break;
    }
    await this.clickOnEnter();
  }

  async verifyLayoutIndependentPaddingValue(type, value) {
    switch (type) {
      case 'Bottom':
        await expect(this.layoutPaddingBottomInput).toHaveValue(value);
        break;
      case 'Right':
        await expect(this.layoutPaddingRightInput).toHaveValue(value);
        break;
      case 'Left':
        await expect(this.layoutPaddingLeftInput).toHaveValue(value);
        break;
      case 'Top':
        await expect(this.layoutPaddingTopInput).toHaveValue(value);
        break;
    }
  }

  async clickAddExportButton() {
    await this.exportSection.waitFor();
    await this.addExportButton.click();
  }

  async clickAddExportButtonForViewMode() {
    await this.exportSection.waitFor();
    await this.addExportVieverButton.click();
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

  async clickExportElementButton(page) {
    await this.exportElementButton.click();
    await page.waitForEvent('download');
  }

  async clickAddGuidesButton() {
    await this.guidesSection.waitFor();
    await this.addGuidesButton.click();
  }

  async clickRemoveGuidesButton() {
    await this.removeGuidesButton.click();
  }

  async clickHideGuidesButton() {
    await this.hideGuidesButton.click();
  }

  async clickUnhideGuidesButton() {
    await this.unhideGuidesButton.click();
  }

  async changeSizeForGuides(value) {
    await this.guidesSizeInput.clear();
    await this.guidesSizeInput.pressSequentially(value);
  }

  async clickGuidesActionsButton() {
    await this.guidesActionsButton.click();
  }

  async changeOpacityForGuides(value) {
    await this.guidesOpacityInput.clear();
    await this.guidesOpacityInput.pressSequentially(value);
  }

  async clickUseDefaultGuidesButton() {
    await this.guidesMoreOptionsButton.click();
    await this.useDefaultGuidesButton.click();
  }

  async selectGuidesType(type) {
    await this.guidesTypeField.click();
    switch (type) {
      case 'Square':
        await this.guidesTypeSelectorSquareOption.click();
        break;
      case 'Columns':
        await this.guidesTypeSelectorColumnsOption.click();
        break;
      case 'Rows':
        await this.guidesTypeSelectorRowsOption.click();
        break;
    }
  }

  async changeColumnsOrRowsNumberForGuides(value) {
    await this.guidesColumnsRowsInput.clear();
    await this.guidesColumnsRowsInput.pressSequentially(value);
  }

  async changeWidthForGuides(value) {
    await this.guidesWidthInput.clear();
    await this.guidesWidthInput.pressSequentially(value);
  }

  async changeHeightForGuides(value) {
    await this.guidesHeightInput.clear();
    await this.guidesHeightInput.pressSequentially(value);
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

  async clickOnCreateAnnotationOption() {
    await this.createAnnotationOptionDesign.click();
    await expect(this.annotationTextArea).toBeVisible();
  }

  async enterTextIntoAnnotationField(value) {
    await this.annotationTextArea.clear();
    await this.annotationTextArea.pressSequentially(value);
  }

  async submitAnnotationCreation() {
    await this.annotationCreateTitle.hover();
    await this.createAnnotationTick.click();
  }

  async submitAnnotationEditing() {
    await this.annotationCreateTitle.hover();
    await this.saveAnnotationTick.click();
  }

  async clickOnEditAnnotation() {
    await this.annotationCreateTitle.hover();
    await this.editAnnotationTick.click();
  }

  async clickOnDeleteAnnotation() {
    await this.annotationCreateTitle.hover();
    await this.deleteAnnotationTick.click();
    await expect(this.deleteAnnotationModalContainer).toBeVisible();
  }

  async confirmDeleteAnnotation() {
    await this.deleteAnnotationOkBtn.click();
  }

  async createAnnotationRightClick() {
    const layerSel = this.page.getByTestId('layer-row').first();
    await layerSel.dispatchEvent('contextmenu');

    await this.createAnnotationOption.click();
    await expect(this.annotationTextArea).toBeVisible();
  }

  async isAnnotationAddedToComponent(value) {
    await expect(this.annotationCreateTitle).toBeVisible();
    await this.annotationCreateTitle.hover();

    const selector = this.page.locator(
      `div[class*="component__annotation"] div[data-replicated-value="${value}"]`,
    );
    await expect(selector).toBeVisible();
  }

  async isAnnotationNotAddedToComponent() {
    await expect(this.annotationCreateTitle).not.toBeVisible();
  }

  async isComponentTypeCopy(copy = true) {
    copy
      ? await expect(this.componentTypeOnDesignPanel).toHaveText('Copy')
      : await expect(this.componentTypeOnDesignPanel).toHaveText('Main');
  }

  async isAnnotationOptionNotVisibleRightClick() {
    const layerSel = this.page.locator(
      'div[class*="viewport"] [class*="viewport-selrect"]',
    );
    await layerSel.last().click({ button: 'right', force: true });
    await expect(this.createAnnotationOption).not.toBeVisible();
  }

  async isAnnotationOptionNotVisible() {
    await expect(this.createAnnotationOptionDesign).not.toBeVisible();
  }

  async clickOnCreateVariantOption() {
    await this.createVariantOptionDesign.click();
    await expect(this.variantLabel).toBeVisible();
  }

  async clickOnAddNewPropertyOption() {
    await this.addNewPropertyOptionDesign.click();
  }

  async changeXAxisForLayer(newX) {
    await this.xAxisInput.clear();
    await this.xAxisInput.pressSequentially(newX);
    await this.clickOnEnter();
    await this.waitForChangeIsSaved();
  }

  async changeYAxisForLayer(newY) {
    await this.yAxisInput.clear();
    await this.yAxisInput.pressSequentially(newY);
    await this.clickOnEnter();
    await this.waitForChangeIsSaved();
  }

  async changeAxisXAndYForLayer(x, y) {
    await this.changeXAxisForLayer(x);
    await this.changeYAxisForLayer(y);
  }

  async clickOnDetachInstanceOption() {
    await this.detachInstanceOptionDesign.click();
  }

  async clickOnClipContentButton() {
    await this.clipContentButton.click();
  }

  async clickOnManualButton() {
    await this.manualButton.click();
  }
  async clickOnAreaButton() {
    await this.areaButton.click();
  }

  async enterAreaName(name) {
    await this.areaNameInput.fill(name);
  }

  async selectGridCellUnit(cellNumber, unit = 'PX') {
    const dropdownLocator = await this.page.locator(
      `div[class*="track-info-unit"] span[class*="current-label"] >>nth=${
        cellNumber - 1
      }`,
    );
    await dropdownLocator.click();
    switch (unit) {
      case 'FR':
        await this.flexMenuItem.click();
        break;
      case 'AUTO':
        await this.autoMenuItem.click();
        break;
      case 'PX':
        await this.fixedMenuItem.click();
        break;
      case '%':
        await this.percentMenuItem.click();
        break;
    }
  }

  async enterGridCellValue(cellNumber, value) {
    const inputLocator = await this.page.locator(
      `div[class*="track-info-value"] input >>nth=${cellNumber - 1}`,
    );
    await inputLocator.click();
    await inputLocator.fill(value);
    await this.clickOnEnter();
  }

  async clickOnGridExpandRowUnitButton() {
    await this.gridExpandGridRowLengthButton.click();
  }

  async clickOnGridExpandColumnUnitButton() {
    await this.gridExpandGridColumnLengthButton.click();
  }

  async hoverOnGridFirstColumnSelectButton() {
    await this.gridFirstColumnSelectButton.hover();
  }

  async enterGridCellCoordinate(rowColumn, startOrEnd, value) {
    let cellNumber = startOrEnd === 'start' ? 0 : 1;
    cellNumber = rowColumn === 'row' ? cellNumber + 2 : cellNumber;
    const inputLocator = await this.page.locator(
      `div[class*="grid_cell__row"] div[class*="grid_cell__coord-input"] input >>nth=${cellNumber}`,
    );
    await inputLocator.click();
    await inputLocator.fill(value);
    await this.clickOnEnter();
  }

  async changeCap(capName, firstSecond = 'first') {
    const dropdown =
      firstSecond === 'first'
        ? this.strokeCapStartDropdown
        : this.strokeCapEndDropdown;
    await dropdown.click();
    await this.strokeSectionContainer.getByRole('option', { name: capName }).click();
  }

  async clickSwitchCapButton() {
    await this.strokeCapSwitchButton.click();
  }

  async clickOnResizeBoardToFitButton() {
    await this.resizeBoardToFitButton.click();
  }

  async isLayoutAlignmentSelected(alignment, flex = true) {
    if (flex) {
      await this.expandFlexLayoutMenu();
      switch (alignment) {
        case 'Start':
          await expect(this.layoutAlignStartBtn).toBeChecked();
          break;
        case 'Center':
          await expect(this.layoutAlignCenterBtn).toBeChecked();
          break;
        case 'End':
          await expect(this.layoutAlignEndBtn).toBeChecked();
          break;
      }
    } else {
      await this.expandGridLayoutMenu();
      switch (alignment) {
        case 'Start':
          await expect(this.layoutAlignStartBtn.first()).toBeChecked();
          await expect(this.layoutAlignStartBtn.last()).toBeChecked();
          break;
        case 'Center':
          await expect(this.layoutAlignCenterBtn.first()).toBeChecked();
          await expect(this.layoutAlignCenterBtn.last()).toBeChecked();
          break;
        case 'End':
          await expect(this.layoutAlignEndBtn.first()).toBeChecked();
          await expect(this.layoutAlignEndBtn.last()).toBeChecked();
          break;
      }
    }
  }

  async checkLayoutPadding(type, value, flex = true) {
    flex ? await this.expandFlexLayoutMenu() : await this.expandGridLayoutMenu();
    switch (type) {
      case 'Vertical':
        await expect(this.layoutVerticalPaddingInput).toHaveValue(value);
        break;
      case 'Horizontal':
        await expect(this.layoutHorizontalPaddingInput).toHaveValue(value);
        break;
    }
  }

  /**
   * Asserts that a design field shows the expected token or value.
   * Checks the token pill text if a token is applied, or the input value otherwise.
   * @param {string} ariaLabel - Accessible label of the field container (e.g. 'Radius').
   * @param {string} value - Expected token name or numeric value.
   */
  async checkTokenField(ariaLabel, value) {
    const tokenContainer = this.page.getByLabel(ariaLabel, { exact: true });
    const tokenPill = tokenContainer
      .getByRole('button')
      .and(this.page.locator('[class*="token_field__pill"]'));
    const input = tokenContainer.locator('input');

    await expect(tokenPill.or(input).first()).toBeVisible();

    if (await tokenPill.isVisible()) {
      await expect(tokenPill).toHaveText(value);
    } else {
      await expect(input).toHaveValue(value);
    }
  }

  async checkGeneralCornerRadius(value) {
    await this.checkTokenField('Radius', value);
  }

  async checkRotationForLayer(value) {
    await this.checkTokenField('Rotation', value);
  }

  async checkStrokeWidth(value) {
    await this.checkTokenField('Stroke width', value);
  }

  async checkRowGap(value) {
    await this.checkTokenField('Row gap', value);
  }

  async checkColumnGap(value) {
    await this.checkTokenField('Column gap', value);
  }

  async checkXAxis(value) {
    await this.checkTokenField('X axis', value);
  }

  async checkYAxis(value) {
    await this.checkTokenField('Y axis', value);
  }

  async checkSizeWidth(value) {
    await this.checkTokenField('Width', value);
  }

  async checkSizeHeight(value) {
    await this.checkTokenField('Height', value);
  }

  async clickOnFlexElementWidth100Btn() {
    await this.flexElementWidth100Btn.click();
  }

  async clickOnFlexElementHeight100Btn() {
    await this.flexElementHeight100Btn.click();
  }

  async clickOnFlexElementFixWidthBtn() {
    await this.flexElementFixWidthBtn.click();
  }

  async clickOnFlexElementFixHeightBtn() {
    await this.flexElementFixHeightBtn.click();
  }

  async checkFlexElementMinMax(type, min = true, value) {
    switch (type) {
      case 'Width':
        min
          ? await this.checkTokenField('Min width', value)
          : await this.checkTokenField('Max width', value);
        break;
      case 'Height':
        min
          ? await this.checkTokenField('Min height', value)
          : await this.checkTokenField('Max height', value);
        break;
    }
  }

  async checkSizePresetsDropdownVisible() {
    await expect(this.sizePresetsDropdown).toBeVisible();
  }

  async openSizePresetsDropdown() {
    await this.sizePresetsDropdown.click();
  }

  async checkSizePresetsOptions(options) {
    await this.openSizePresetsDropdown();
    await expect(this.sizePresetsOptions).toHaveText(options);
    await this.openSizePresetsDropdown();
  }

  async selectSizePresetsOption(option) {
    await this.openSizePresetsDropdown();
    await this.sizePresetsOptions.getByText(option, { exact: true }).click();
  }

  async clickOnHorizontalOrientationButton() {
    await this.horizontalOrientationButton.click();
  }

  async isHorizontalOrientationButtonChecked(checked = true, timeout = 10000) {
    await expect(async () => {
      const buttonClass =
        await this.horizontalOrientationButton.getAttribute('class');
      checked
        ? expect(buttonClass).toContain('radio_buttons__checked')
        : expect(buttonClass).not.toContain('radio_buttons__checked');
    }).toPass({ timeout });
  }

  async clickOnVerticalOrientationButton() {
    await this.verticalOrientationButton.click();
  }

  async isVerticalOrientationButtonChecked(checked = true, timeout = 10000) {
    await expect(async () => {
      const buttonClass = await this.verticalOrientationButton.getAttribute('class');
      checked
        ? expect(buttonClass).toContain('radio_buttons__checked')
        : expect(buttonClass).not.toContain('radio_buttons__checked');
    }).toPass({ timeout });
  }

  async changeFirstVariantProperty(value) {
    await this.firstVariantProperty.click();
    await this.firstVariantProperty.getByRole('listbox').getByText(value).click();
  }

  async changeVariantPropertyValue(propertyName, propertyValue) {
    const variantString = await this.page.locator(
      `[class*="variant-property-container"]:has([title="${propertyName}"])`,
    );
    const variantValue = await variantString.locator(
      'div[class*="variant-property-value-wrapper"]',
    );
    await variantValue.click();
    await variantValue.getByRole('listbox').getByText(propertyValue).click();
  }

  async enterVariantPropertyValue(propertyName, propertyValue) {
    const variantString = await this.page.locator(
      `[class*="variant-property-container"]:has([title="${propertyName}"])`,
    );
    await variantString.getByRole('combobox').fill(propertyValue);
    await this.clickOnEnter();
  }

  async checkVariantPropertyValue(propertyName, propertyValue) {
    const variantString = await this.page.locator(
      `[class*="variant-property-container"]:has([title="${propertyName}"])`,
    );
    await expect(await variantString.getByRole('combobox')).toHaveValue(
      propertyValue,
    );
  }

  async checkCopyVariantPropertyValue(propertyName, propertyValue) {
    const variantString = await this.page.locator(
      `[class*="variant-property-container"]:has([title="${propertyName}"])`,
    );
    await expect(await variantString.getByRole('combobox')).toHaveText(
      propertyValue,
    );
  }

  async clickOnSwapComponentButton() {
    await this.swapComponentButton.click();
  }

  async clickOnSwapGridViewButton() {
    await this.swapGridRadioButton.click();
  }

  async checkVariantWarning(text) {
    await expect(await this.variantWarningWrapper.locator('div').first()).toHaveText(
      text,
    );
  }

  async isVariantWarningVisible(visible = true) {
    visible
      ? await expect(await this.variantWarningWrapper).toBeVisible()
      : await expect(await this.variantWarningWrapper).not.toBeVisible();
  }

  async isMainComponentPropertyVisible(propertyName, visible = true) {
    visible
      ? await expect(await this.page.getByTitle(propertyName)).toBeVisible()
      : await expect(await this.page.getByTitle(propertyName)).not.toBeVisible();
  }

  async deleteVariantProperty(propertyName) {
    const variantRow = await this.page.locator(
      `[class*="variant-property-row"]:has([title*="${propertyName}:"])`,
    );
    await variantRow.getByRole('button').click();
  }

  async clickOnLocateDuplicatedVariantsButton() {
    await this.locateDuplicatedVariantsButton.click();
  }

  async checkFontName(name) {
    await expect(await this.textFontSelector).toHaveText(name);
  }

  async checkFontSize(value) {
    await expect(await this.textFontSizeInput).toHaveAttribute('value', value);
  }

  async checkFontStyle(name) {
    await expect(await this.textFontStyleSelector).toHaveText(name);
  }

  async checkLetterSpacing(value) {
    await expect(await this.textLetterSpacingInput).toHaveValue(value);
  }

  async checkTextLineHeight(value) {
    await expect(await this.textLineHeightInput).toHaveValue(value);
  }

  async clickOnTypographyMenuButton() {
    await this.typographyEntry.hover();
    await this.textTypographyMenuButton.click();
  }

  async isTypographyAssetAgVisible(visible = true) {
    visible
      ? await expect(this.typographyAssetAg).toBeVisible(visible)
      : await expect(this.typographyAssetAg).not.toBeVisible(visible);
  }

  async hoverTypographyToken() {
    await this.typographyTokenButton.first().hover();
  }

  async hoverAndAssertTypographyTokenValues(
    name,
    {
      fontFamily,
      fontSize,
      fontWeight,
      letterSpacing,
      textCase,
      textDecoration,
      lineHeight,
    } = {},
  ) {
    const typographyModal = this.getTypographyTokenModal(name);
    await this.hoverTypographyToken();

    const tokenValues = [
      {
        label: 'Font Family',
        value: fontFamily,
        line: (v) => `- font-family: "${v}"`,
      },
      { label: 'Font Size', value: fontSize, line: (v) => `- font-size: ${v}` },
      {
        label: 'Font Weight',
        value: fontWeight,
        line: (v) => `- font-weight: ${v}`,
      },
      {
        label: 'Letter Spacing',
        value: letterSpacing,
        line: (v) => `- letter-spacing: ${v}`,
      },
      { label: 'Text Case', value: textCase, line: (v) => `- text-case: ${v}` },
      {
        label: 'Text Decoration',
        value: textDecoration,
        line: (v) => `- text-decoration: ${v}`,
      },
      {
        label: 'Line Height',
        value: lineHeight,
        line: (v) => `- line-height: ${v}`,
      },
    ];

    for (const { label, value, line } of tokenValues) {
      if (value === undefined) continue;

      await test.step(`Assert ${label} is: ${value}`, async () => {
        await expect(
          typographyModal.getByText(line(value), { exact: true }),
        ).toBeVisible();
      });
    }
  }

  async checkTextCase(value) {
    switch (value) {
      case 'Upper':
        await expect(await this.textUpperCaseButton).toBeChecked();
        break;
      case 'Lower':
        await expect(await this.textLowerCaseButton).toBeChecked();
        break;
      case 'Capitalize':
        await expect(await this.textCapitalizeButton).toBeChecked();
        break;
    }
  }

  async isTextUnderlineChecked(checked = true) {
    checked
      ? await expect(await this.textUnderline).toBeChecked()
      : await expect(await this.textUnderline).not.toBeChecked();
  }

  async isTextUnderlineDisabled(disabled = true) {
    disabled
      ? await expect(
          await this.textUnderline,
          `Text underline is disabled`,
        ).toBeDisabled()
      : await expect(
          await this.textUnderline,
          `Text underline is not disabled`,
        ).not.toBeDisabled();
  }

  async isTextStrikethroughChecked(checked = true) {
    checked
      ? await expect(await this.textStrikethrough).toBeChecked()
      : await expect(await this.textStrikethrough).not.toBeChecked();
  }

  async isTextStrikethroughDisabled(disabled = true) {
    disabled
      ? await expect(
          await this.textStrikethrough,
          `Text strikethrough is disabled`,
        ).toBeDisabled()
      : await expect(
          await this.textStrikethrough,
          `Text strikethrough is not disabled`,
        ).not.toBeDisabled();
  }

  async isFlexElementWidth100BtnVisible(visible = true) {
    visible
      ? await expect(await this.flexElementWidth100Btn).toBeVisible()
      : await expect(await this.flexElementWidth100Btn).not.toBeVisible();
  }

  async isExpectedShadowTypeOption(shadowType, index = 0) {
    const typeOptionSel = this.shadowSectionContainer
      .getByRole('combobox')
      .filter({ hasText: shadowType })
      .nth(index);

    await expect(
      typeOptionSel,
      `Shadow Type Option #${index + 1} should have text "${shadowType}"`,
    ).toHaveText(shadowType);
  }

  async isShadowTypeOptionNotVisible(shadowType, index = 0) {
    const typeOptionSel = this.shadowSectionContainer
      .getByRole('combobox')
      .filter({ hasText: shadowType })
      .nth(index);

    await expect(
      typeOptionSel,
      `Shadow Type Option #${index + 1} "${shadowType} is not visible"`,
    ).not.toBeVisible();
  }

  async hasShadowXOffsetExpectedValue(value, index = 0) {
    await expect(
      await this.shadowXInput.nth(index),
      `Shadow X Offset Input has expected value: "${value}"`,
    ).toHaveValue(value);
  }

  async hasShadowYOffsetExpectedValue(value, index = 0) {
    await expect(
      await this.shadowYInput.nth(index),
      `Shadow Y Offset Input has expected value: "${value}"`,
    ).toHaveValue(value);
  }

  async hasShadowBlurExpectedValue(value, index = 0) {
    await expect(
      await this.shadowBlurInput.nth(index),
      `Shadow Blur Input has expected value: "${value}"`,
    ).toHaveValue(value);
  }

  async hasShadowSpreadExpectedValue(value, index = 0) {
    await expect(
      await this.shadowSpreadInput.nth(index),
      `Shadow Spread Input has expected value: "${value}"`,
    ).toHaveValue(value);
  }

  async isExpectedShadowColorVisible(color) {
    const shadowColorButton = this.shadowSectionContainer.getByRole('button', {
      name: color,
    });

    await expect(
      await shadowColorButton,
      `Shadow Color Button has expected value: "${color}"`,
    ).toBeVisible();
  }

  async hoverOnWidthForLayer() {
    await this.sizeWidthInput.hover();
  }

  getOpenTokenListButtonByIndex(index) {
    return this.openTokenListButton.nth(index);
  }

  async openTokenListByIndex(index) {
    await expect(this.getOpenTokenListButtonByIndex(index)).toBeVisible();
    await this.getOpenTokenListButtonByIndex(index).click();
  }

  async selectTokenInTokenListByName(name) {
    const tokenOption = this.page.getByRole('option', { name: name });
    await expect(tokenOption).toBeVisible();
    await tokenOption.click();
  }

  /**
   * @param {string} ariaLabel - Accessible label of the field container (e.g. 'Width').
   */
  async hoverOnTokenPill(ariaLabel) {
    const tokenContainer = this.page.getByLabel(ariaLabel, { exact: true });
    const tokenPill = tokenContainer
      .getByRole('button')
      .and(this.page.locator('[class*="token_field__pill"]'));

    await expect(tokenPill.first()).toBeVisible();
    await tokenPill.first().hover();
  }

  /**
   * @param {string} value - Token name, message or error message
   */
  async isTokenPillTooltipVisible(value) {
    const tokenTooltipValue = this.page.getByText(value, {
      exact: true,
    });
    await expect(tokenTooltipValue).toBeVisible();
  }

  async isDetachTokenButtonVisible() {
    await expect(this.detachTokenButton).toBeVisible();
  }

  async clickOnDetachTokenButton() {
    await this.detachTokenButton.click();
  }

  /**
   * @param {string} tokenName - Token name
   */
  async isNotTokenValidReferencedButtonVisible(tokenName) {
    const notValidReferencedButton = this.page.getByRole('button', {
      name: `Reference in {${tokenName}} is not valid or is not in any active set.`,
    });
    await expect(notValidReferencedButton).toBeVisible();
  }

  /**
   * @param {string} tokenName - Token name
   */
  async isNotTokenInAnyActiveSetButtonVisible(tokenName) {
    const notInAnyActiveSetButton = this.page.getByRole('button', {
      name: `{${tokenName}} token is not in any active set or has an invalid value`,
    });
    await expect(notInAnyActiveSetButton).toBeVisible();
  }

  /**
   * @param {string} tokenName - Token name
   */
  async isTokenNotExistOrDeletedTooltipVisible(tokenName) {
    const tooltipError = this.rightSidebar.getByLabel(
      `{${tokenName}} token does not exist or has been deleted.`,
    );

    await expect(
      this.typographyErrorDot,
      `Error dot for token ${tokenName} is visible`,
    ).toBeVisible();
    await expect(
      tooltipError,
      `Tooltip for token ${tokenName} is visible`,
    ).toBeVisible();
  }

  /**
   * @param {string} messageText - Message text
   */
  async checkTooltipInFillColorInput(messageText) {
    await this.fillSection.getByRole('button', { name: messageText }).hover();
    await this.isTokenPillTooltipVisible(messageText);
  }

  async setStrokeDashValue(value) {
    await this.strokeDashInput.fill(value);
  }

  async setStrokeGapValue(value) {
    await this.strokeGapInput.fill(value);
  }

  async hasStrokeDashInputValue(value) {
    await expect(this.strokeDashInput).toHaveValue(value);
  }

  async hasStrokeGapInputValue(value) {
    await expect(this.strokeGapInput).toHaveValue(value);
  }

  getTypographyTokenOptionFromListByName(tokenName) {
    return this.typographyListBox.getByRole('option', {
      name: tokenName,
      exact: true,
    });
  }

  async openTypographyTokenList() {
    await this.typographyOpenTokenListButton.click();
    await expect(this.typographyListBox).toBeVisible();
  }

  async searchTypographyTokens(value) {
    await this.openTypographyTokenList();
    await this.typographySearchTokenListInput.type(value);
  }

  async searchAndApplyTypographyTokenFromTokensList(value) {
    await this.searchTypographyTokens(value);
    const token = this.getTypographyTokenOptionFromListByName(value);
    await expect(
      token,
      `Token ${value} is visible in typography token list`,
    ).toBeVisible();
    await token.click();
  }

  async textOptionsAreVisible(visible = true) {
    visible
      ? await expect(
          await this.textOptionsFull,
          `Text options are visible`,
        ).toBeVisible()
      : await expect(
          await this.textOptionsFull,
          `Text options are not visible`,
        ).not.toBeVisible();
  }
};
