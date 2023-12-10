const { expect } = require("@playwright/test");
const { BasePage } = require("../base-page");

exports.MainPage = class MainPage extends BasePage {
  /**
   * @param {import('@playwright/test').Page} page
   */

  constructor(page) {
    super(page);

    //Left Toolbar
    this.pencilBoxButton = page.locator('a[class*="left_header__main-icon"]');
    this.moveButton = page.locator('button[title="Move (V)"]');
    this.createBoardButton = page.locator('button[data-test="artboard-btn"]');
    this.createRectangleButton = page.locator('button[data-test="rect-btn"]');
    this.createEllipseButton = page.locator('button[data-test="ellipse-btn"]');
    this.createTextButton = page.locator('button[title="Text (T)"]');
    this.uploadImageSelector = page.locator("#image-upload");
    this.createCurveButton = page.locator('button[data-test="curve-btn"]');
    this.createPathButton = page.locator('button[data-test="path-btn"]');
    this.createCommentButton = page.locator('button[title="Comments (C)"]');
    this.shortcutsPanelButton = page.locator(".icon-shortcut");
    this.colorsPaletteButton = page.locator('button[title^="Color Palette"]');

    //Viewport
    this.viewport = page.locator('div[class="viewport"]');
    this.createdLayer = page.locator('div[class="viewport"] [id^="shape"] >> nth=0');
    this.createdBoardTitle = page.locator('g[class="frame-title"] >> nth=0');
    this.textbox = page.locator(
      'div[role="textbox"] div[contenteditable="true"]'
    );
    this.guides = page.locator('.guides .new-guides');

    //Layer right-click menu items
    this.deleteLayerMenuItem = page.locator(
      'ul[class*="workspace_context_menu"] span:has-text("Delete")'
    );
    this.hideLayerMenuItem = page.locator(
      'ul[class^="workspace_context_menu"] span:has-text("Hide")'
    );
    this.showLayerMenuItem = page.locator(
      'ul[class^="workspace_context_menu"] span:has-text("Show")'
    );
    this.focusOnLayerMenuItem = page.locator(
      'ul[class^="workspace_context_menu"] span:has-text("Focus on")'
    );
    this.transformToPathMenuItem = page.locator(
      'ul[class^="workspace_context_menu"] span:has-text("Transform to path")'
    );
    this.selectionToBoardMenuItem = page.locator(
      'ul[class^="workspace_context_menu"] span:has-text("Selection to board")'
    );
    this.createComponentMenuItem = page.locator(
      'ul[class*="workspace_context_menu"] span:has-text("Create component")'
    );
    this.updateMainComponentMenuItem = page.locator(
      'ul[class*="workspace_context_menu"] span:has-text("Update main component")'
    );
    this.createMultipleComponentsMenuItem = page.locator(
      'ul[class*="workspace_context_menu"] span:has-text("Create multiple components")'
    );
    this.flipVerticalMenuItem = page.locator(
      'ul[class^="workspace_context_menu"] span:has-text("Flip vertical")'
    );
    this.flipHorizontalMenuItem = page.locator(
      'ul[class^="workspace_context_menu"] span:has-text("Flip horizontal")'
    );
    this.editPathMenuItem = page.locator(
      'ul[class^="workspace_context_menu"] span:has-text("Edit")'
    );
    this.addFlexLayout = page.locator(
      'ul[class^="workspace_context_menu"] span:has-text("Add flex layout")'
    );
    this.removeFlexLayout = page.locator(
      'ul[class^="workspace_context_menu"] span:has-text("Remove flex layout")'
    );
    this.showInAssetsPanelOption = page.locator(
        'ul[class*="workspace_context_menu"] span:has-text("Show in assets panel")'
    );
    this.createAnnotationOption = page.locator(
        'ul[class*="workspace_context_menu"] span:has-text("Create annotation")'
    );
    this.duplicateOption = page.locator(
        'ul[class*="workspace_context_menu"] span:has-text("Duplicate")'
    );

    //Layers panel
    this.layersTab = page.locator('div[data-id=":layers"]');
    this.layersPanel = page.locator('div[class="layers-tab"]');
    this.createdLayerOnLayersPanelNameInput = page.locator(
      'div[class*="element-list-body"] input[class*="element-name"]'
    );
    this.createdLayerOnLayersPanel = page.locator(
      'ul[class*="layers__element-list"] div[class*="element-list-body"]'
    );
    this.searchLayersIcon = page.locator('svg[class="icon-search"]');
    this.searchLayersInput = page.locator('input[placeholder="Search layers"]');
    this.searchedLayerOnLayersPanelNameText = page.locator(
      'span[class="element-name"] >> nth=1'
    );
    this.layoutIcon = page.locator('svg[class="icon-layout-rows"]');
    this.focusModeDiv = page.locator('div.focus-mode:text-is("Focus mode")');
    this.mainComponentLayer = page.locator('//*[@class="icon-component-refactor"]//parent::div');
    this.copyComponentLayer = page.locator('//*[@class="icon-copy-refactor"]//parent::div');

    //Design panel
    this.designTab = page.locator('div[data-id="design"]');
    this.canvasBackgroundColorIcon = page.locator('div[class*="color-bullet-wrapper"]');
    this.layerRotationInput = page.locator('div[title="Rotation"] input');
    this.individualCornersRadiusButton = page.locator('div[alt="Independent corners"]');
    this.allCornersRadiusButton = page.locator('div[alt="All corners"]');
    this.generalCornerRadiusInput = page.locator('div[title="Radius"] input');
    this.firstCornerRadiusInput = page.locator('div[class="input-element mini"] input >> nth=0');
    this.secondCornerRadiusInput = page.locator('div[class="input-element mini"] input >> nth=1');
    this.thirdCornerRadiusInput = page.locator('div[class="input-element mini"] input >> nth=2');
    this.fourthCornerRadiusInput = page.locator('div[class="input-element mini"] input  >> nth=3');
    this.sizeWidthInput = page.locator('div[class="input-element width"] input');
    this.sizeHeightInput = page.locator('div[class="input-element height"] input');
    this.xAxisInput = page.locator('div[title="X axis"] input');
    this.yAxisInput = page.locator('div[title="Y axis"] input');

    //Design panel - Shadow section
    this.shadowSection = page.locator('div.element-set-title:has-text("Shadow")');
    this.addShadowButton = page.locator(
      'div[class="element-set shadow-options"] div[class="add-page"] svg'
    );
    this.shadowActionsButton = page.locator(
      'div[class="element-set shadow-options"] svg[class="icon-actions"]'
    );
    this.shadowXInput = page.locator(
      'div[class="element-set shadow-options"] div[title="X"] input'
    );
    this.shadowYInput = page.locator(
      'div[class="element-set shadow-options"] div[title="Y"] input'
    );
    this.shadowBlurInput = page.locator('div[title="Blur"] input');
    this.shadowSpreadInput = page.locator('div[title="Spread"] input');
    this.shadowColorIcon = page.locator(
      'div[class="element-set shadow-options"] div[class="color-bullet-wrapper"]'
    );
    this.shadowOpacityInput = page.locator(
      'div[class="element-set shadow-options"] div[class="input-element percentail"] input'
    );
    this.shadowTypeSelector = page.locator('div[class="element-set shadow-options"] select');
    this.shadowOption = page.locator('div.shadow-option-main');
    this.shadowHideIcon = page.locator('div.shadow-option-main-actions .icon-eye');
    this.shadowUnhideIcon = page.locator('div.shadow-option-main-actions .icon-eye-closed');
    this.shadowRemoveIcon = page.locator('div.shadow-option-main-actions .icon-minus');

    //Design panel - Blur section
    this.blurSection = page.locator('div.element-set-title:has-text("Blur")');
    this.addBlurButton = page.locator(
      'div[class="element-set"] div:has-text("Blur") svg'
    );
    this.blurValueInput = page.locator(
      'div[class="row-flex input-row"] div[class="input-element pixels"] input'
    );
    this.blurHideIcon = page.locator('div.element-set-title-actions .icon-eye');
    this.blurUnhideIcon = page.locator('div.element-set-title-actions .icon-eye-closed');
    this.blurRemoveIcon = page.locator('div.element-set-title-actions .icon-minus');

    //Design panel - Fill section
    this.fillColorIcon = page.locator(
      'div[title="Fill"] div[class="color-bullet-wrapper"]'
    );
    this.fillColorInput = page.locator(
      'div[title="Fill"] div[class="color-info"] input'
    );
    this.fillOpacityInput = page.locator(
      'div[title="Fill"] div[class="input-element percentail"] input'
    );
    this.addFillButton = page.locator(
      'div[class="element-set"] div:has-text("Fill") svg'
    );
    this.removeFillButton = page.locator(
      'div[title="Fill"] svg[class="icon-minus"]'
    );

    //Design panel - Grid section
    this.gridSection = page.locator('div.element-set-title:has-text("Grid")');
    this.gridMainOptionSection = page.locator('div[class="grid-option-main"]');
    this.addGridButton = page.locator(
      'div[class="element-set"] div:has-text("Grid") svg'
    );
    this.removeGridButton = page.locator(
      'div[class="grid-option-main-actions"] svg[class="icon-minus"]'
    );
    this.hideGridButton = page.locator(
      'div[class="grid-option-main-actions"] svg[class="icon-eye"]'
    );
    this.unhideGridButton = page.locator(
      'div[class="grid-option-main-actions"] svg[class="icon-eye-closed"]'
    );
    this.gridTypeSelector = page.locator('div[class="grid-option"] div[class="custom-select flex-grow"]');
    this.gridTypeSelectorSquareOption = page.locator('span:has-text("Square")');
    this.gridTypeSelectorColumnsOption = page.locator(
      'span:has-text("Columns")'
    );
    this.gridTypeSelectorRowsOption = page.locator('span:has-text("Rows")');
    this.gridSizeInput = page.locator('div[class="grid-option"] input');
    this.gridActionsButton = page.locator(
      'div[class="grid-option"] svg[class="icon-actions"] >> visible=true'
    );
    this.gridOpacityInput = page.locator(
      'div[class="grid-option"] div[class="input-element percentail"] input'
    );
    this.useDefaultGridButton = page.locator('button:has-text("Use default")');
    this.gridWidthInput = page.locator(
      '//*[text()="Width"]//parent::div[@class="row-flex input-row"]//input'
    );
    this.gridHeightInput = page.locator(
      '//*[text()="Height"]//parent::div[@class="row-flex input-row"]//input'
    );

    //Design panel - Export section
    this.exportSection = page.locator('div.element-set-title:has-text("Export")');
    this.addExportButton = page.locator(
      'div[class="element-set exports-options"] svg'
    );
    this.removeExportButton = page.locator(
      'div[class="element-set exports-options"] svg[class="icon-minus"]'
    );
    this.exportElementButton = page.locator(
      'div[class="btn-icon-dark download-button "]'
    );

    //Design panel - Stroke section
    this.addStrokeButton = page.locator(
      'div[class="element-set"] div:has-text("Stroke") svg'
    );
    this.strokeSection = page.locator('div.element-set-title:has-text("Stroke")');
    this.strokeColorBullet = page.locator(
      'div[title="Stroke color"] div[class="color-bullet is-not-library-color"]'
    );
    this.strokeRemoveIcon = page.locator('div[title="Stroke color"] .icon-minus');
    this.strokeColorInput = page.locator('div[title="Stroke color"] div[class="color-info"] input');
    this.strokeWidthInput = page.locator('div[title="Stroke width"] input');
    this.strokeOpacityInput = page.locator(
      'div[title="Stroke color"] div[class="input-element percentail"] input'
    );
    this.strokePositionSelect = page.locator('//div[@title="Stroke width"]/parent::div//select[1]');
    this.strokeTypeSelect = page.locator('//div[@title="Stroke width"]/parent::div//select[2]');


    //Design panel - Flex Layout section
    this.removeLayoutButton = page.locator(
      'div[class="element-set-title"] button[class="remove-layout"]'
    );
    this.layoutSection = page.locator(
      'div[class="element-set-content layout-menu"]'
    );
    this.layoutDirectRowBtn = page.locator(
      'div[class="layout-row"] button[alt="Row"]'
    );
    this.layoutDirectRowReverseBtn = page.locator(
      'div[class="layout-row"] button[alt="Row reverse"]'
    );
    this.layoutDirectColumnBtn = page.locator(
      'div[class="layout-row"] button[alt="Column"]'
    );
    this.layoutDirectColumnReverseBtn = page.locator(
      'div[class="layout-row"] button[alt="Column reverse"]'
    );
    this.layoutAlignStartBtn = page.locator(
      'div[class="layout-row"] button[alt="Align items start"]'
    );
    this.layoutAlignCenterBtn = page.locator(
      'div[class="layout-row"] button[alt="Align items center"]'
    );
    this.layoutAlignEndBtn = page.locator(
      'div[class="layout-row"] button[alt="Align items end"]'
    );
    this.layoutJustifyStartBtn = page.locator(
      'div[class="layout-row"] button[alt="Justify content start"]'
    );
    this.layoutJustifyCenterBtn = page.locator(
      'div[class="layout-row"] button[alt="Justify content center"]'
    );
    this.layoutJustifyEndBtn = page.locator(
      'div[class="layout-row"] button[alt="Justify content end"]'
    );
    this.layoutJustifySpaceBetweenBtn = page.locator(
      'div[class="layout-row"] button[alt="Justify content space-between"]'
    );
    this.layoutJustifySpaceAroundBtn = page.locator(
      'div[class="layout-row"] button[alt="Justify content space-around"]'
    );
    this.layoutJustifySpaceEvenlyBtn = page.locator(
      'div[class="layout-row"] button[alt="Justify content space-evenly"]'
    );
    this.layoutColumnGapInput = page.locator(
      'div[class="gap-group"] div[alt="Column gap"] input'
    );
    this.layoutRowGapInput = page.locator(
      'div[class="gap-group"] div[alt="Row gap"] input'
    );
    this.layoutVerticalPaddingInput = page.locator(
      'div[class="padding-group"] div[alt="Vertical padding"] input'
    );
    this.layoutHorizontPaddingInput = page.locator(
      'div[class="padding-group"] div[alt="Horizontal padding"] input'
    );
    this.layoutIndepPaddingsIcon = page.locator(
      'div[class="padding-icons"] div[alt="Independent paddings"]'
    );
    this.layoutPaddingTopInput = page.locator(
      'div[class="padding-row"] div[alt="Top"] input'
    );
    this.layoutPaddingRightInput = page.locator(
      'div[class="padding-row"] div[alt="Right"] input'
    );
    this.layoutPaddingBottomInput = page.locator(
      'div[class="padding-row"] div[alt="Bottom"] input'
    );
    this.layoutPaddingLeftInput = page.locator(
      'div[class="padding-row"] div[alt="Left"] input'
    );

    //Design panel - Text section
    this.textUpperCaseIcon = page.locator('div.align-icons svg.icon-uppercase');
    this.textLowerCaseIcon = page.locator('div.align-icons svg.icon-lowercase');
    this.textTitleCaseIcon = page.locator('div.align-icons svg.icon-titlecase');
    this.textNoneCaseIcon = page.locator('div.align-icons svg.icon-minus >> nth=0');
    this.textAlignTop = page.locator('div.align-icons svg.icon-align-top');
    this.textAlignMiddle = page.locator('div.align-icons svg.icon-align-middle');
    this.textAlignBottom = page.locator('div.align-icons svg.icon-align-bottom');
    this.textIconLTR = page.locator('div.align-icons svg.icon-text-direction-ltr');
    this.textIconRTL = page.locator('div.align-icons svg.icon-text-direction-rtl');

    //Design panel - Component section
    this.componentMenuButton = page.locator(
        'div[class*="component__element-content"] div[class*="component-actions"]'
    );
    this.showInAssetsPanelOptionDesign = page.locator(
        'ul[class*="component__custom-select-dropdown"] span:text-is("Show in assets panel")'
    );
    this.componentBlockOnDesignTab = page.locator('div[class*="component__element-set"]');

    this.createAnnotationOptionDesign = page.locator(
        'ul[class*="component__custom-select-dropdown"] span:text-is("Create annotation")'
    );
    this.annotationTextArea = page.locator('#annotation-textarea');
    this.annotationCreateTitle = page.locator('div[class^="component-annotation"] div[class^=title]');
    this.createAnnotationTick = page.locator('div[title="Create"] svg[class="icon-tick"]');
    this.saveAnnotationTick = page.locator('div[title="Save"] svg[class="icon-tick"]');
    this.discardAnnotationTick = page.locator('div[title="Discard"] svg[class="icon-cross"]');
    this.editAnnotationTick = page.locator('div[title="Edit"] svg[class="icon-pencil"]');
    this.deleteAnnotationTick = page.locator('div[title="Delete"] svg[class="icon-trash"]');
    this.deleteAnnotationPopup = page.locator('div[class*="modal-container"] h2:text-is("Delete annotation")');
    this.deleteAnnotationOkBtn = page.locator('div[class*="modal-container"] input[value="Ok"]');

    //Node panel
    this.pathActionsBlock = page.locator('div[class$="path_actions__sub-actions"]');
    this.firstNode = page.locator(
      'g[class="path-point"] circle[pointer-events="visible"] >> nth=0'
    );
    this.secondNode = page.locator(
      'g[class="path-point"] circle[pointer-events="visible"] >> nth=2'
    );
    this.thirdNode = page.locator(
      'g[class="path-point"] circle[pointer-events="visible"] >> nth=3'
    );
    this.fourthNode = page.locator(
      'g[class="path-point"] circle[pointer-events="visible"] >> nth=4'
    );
    this.fifthNode = page.locator(
      'g[class="path-point"] circle[pointer-events="visible"] >> nth=5'
    );
    this.sixthNode = page.locator(
      'g[class="path-point"] circle[pointer-events="visible"] >> nth=6'
    );
    this.nodePanelAddNodeButton = page.locator('div[alt^="Add node"] >> nth=0');
    this.nodePanelDeleteNodeButton = page.locator(
      'div[alt^="Delete node"] >> nth=0'
    );
    this.nodePanelMergeNodesButton = page.locator(
      'div[alt^="Merge nodes"] >> nth=0'
    );
    this.nodePanelDrawNodesButton = page.locator(
      'div[alt="Draw nodes (P)"] >> nth=0'
    );
    this.nodePanelMoveNodesButton = page.locator(
      'div[alt="Move nodes (M)"] >> nth=0'
    );
    this.nodePanelJoinNodesButton = page.locator(
      'div[alt="Join nodes (J)"] >> nth=0'
    );
    this.nodePanelSeparateNodesButton = page.locator(
      'div[alt="Separate nodes (K)"] >> nth=0'
    );
    this.nodePanelToCornerButton = page.locator(
      'div[alt="To corner (X)"] >> nth=0'
    );
    this.nodePanelToCurveButton = page.locator(
      'div[alt="To curve (C)"] >> nth=0'
    );

    //Inspect panel
    this.inspectTab = page.locator('div[data-id="inspect"]');
    this.annotationBlockOnInspect = page.locator('div.attributes-block.inspect-annotation');

    //Comments
    this.commentInput = page.locator("textarea >> nth=0");
    this.commentText = page.locator(
      'div[class="thread-content"] span[class="text"]'
    );
    this.commentCommentsPanelText = page.locator(
      'div[class="thread-groups"] span[class="text"]'
    );
    this.commentReplyText = page.locator(
      'div[class="thread-content"] span[class="text"]  >> nth=1'
    );
    this.commentReplyCommentsPanelText = page.locator(
      'div[class="thread-groups"] span:has-text("1 reply")'
    );
    this.postCommentButton = page.locator('input[value="Post"]');
    this.commentThreadIcon = page.locator(
      'div[class="thread-bubble "]  >> nth=1'
    );
    this.commentResolvedThreadIcon = page.locator(
      'div[class="thread-bubble resolved"]  >> nth=1'
    );
    this.commentReplyInput = page.locator('textarea[placeholder="Reply"]');
    this.commentOptionsButton = page.locator(
      'div[class="comments"] div[class="options-icon"] svg'
    );
    this.commentEditOptionMenuItem = page.locator(
      'ul[class="dropdown comment-options-dropdown"] li:has-text("Edit")'
    );
    this.commentDeleteOptionMenuItem = page.locator(
      'ul[class="dropdown comment-options-dropdown"] li:has-text("Delete thread")'
    );
    this.deleteThreadButton = page.locator(
      'input[value="Delete conversation"]'
    );
    this.resolveCommentCheckbox = page.locator(
      'div[class="options-resolve"] svg'
    );
    this.commentsPanelPlaceholderText = page.locator(
      'div[class="thread-groups-placeholder"]'
    );
    this.commentsAuthorSection = page.locator('div[class="author"]');

    // Main menu - first level
    this.mainMenuButton = page.locator(
      'div[class*="menu-section"] svg[class="icon-menu-refactor"]'
    );
    this.mainMenuList = page.locator('ul[role="menu"]');
    this.viewMainMenuItem = page.locator('li[data-menu="view"]');
    this.fileMainMenuItem = page.locator('li[data-menu="file"]');
    this.editMainMenuItem = page.locator('li[data-test="edit"]');
    this.helpInfoMenuItem = page.locator('li[data-menu="help-info"]');

    // Main menu - second level
    this.subMenuViewList = page.locator('ul[class="sub-menu view"]');
    this.subMenuFileList = page.locator('ul[class="sub-menu file"]');
    this.subMenuEditList = page.locator('ul[class*="sub-menu"]');
    this.subMenuHelpInfoList = page.locator('ul[class="sub-menu help-info"]');
    this.showRulersMainMenuSubItem = page.locator(
      'ul[class="sub-menu view"] span:has-text("Show rulers")'
    );
    this.hideRulersMainMenuSubItem = page.locator(
      'ul[class="sub-menu view"] span:has-text("Hide rulers")'
    );
    this.hideGridsMainMenuSubItem = page.locator('ul[class^="sub-menu"] span:text-is("Hide grids")');
    this.showGridsMainMenuSubItem = page.locator('ul[class^="sub-menu"] span:text-is("Show grid")');
    this.selectAllMainMenuSubItem = page.locator('#file-menu-select-all');
    this.showColorPaletteMainMenuSubItem = page.locator(
      'ul[class="sub-menu view"] span:text-is("Show color palette")'
    );
    this.hideColorPaletteMainMenuSubItem = page.locator(
      'ul[class="sub-menu view"] span:text-is("Hide color palette")'
    );
    this.showBoardNamesMainMenuSubItem = page.locator(
      'ul[class="sub-menu view"] span:has-text("Show boards names")'
    );
    this.hideBoardNamesMainMenuSubItem = page.locator(
      'ul[class="sub-menu view"] span:has-text("Hide board names")'
    );
    this.showPixelGridMainMenuSubItem = page.locator(
      'ul[class="sub-menu view"] span:has-text("Show pixel grid")'
    );
    this.hidePixelGridMainMenuSubItem = page.locator(
      'ul[class="sub-menu view"] span:has-text("Hide pixel grid")'
    );
    this.showHideUIMainMenuSubItem = page.locator(
      'ul[class="sub-menu view"] span:has-text("Show / Hide UI")'
    );
    this.dowloadPenpotFileMenuSubItem = page.locator(
      'ul[class="sub-menu file"] span:has-text("Download Penpot file (.penpot)")'
    );
    this.dowloadStandartFileMenuSubItem = page.locator(
      'ul[class="sub-menu file"] span:has-text("Download standard file (.svg + .json)")'
    );
    this.addAsSharedLibraryFileMenuSubItem = page.locator(
      'ul[class="sub-menu file"] span:has-text("Add as Shared Library")'
    );
    this.removeAsSharedLibraryFileMenuSubItem = page.locator(
      'ul[class="sub-menu file"] span:has-text("Unpublish Library")'
    );
    this.shortcutsMenuSubItem = page.locator(
      'ul[class="sub-menu help-info"] span:has-text("Shortcuts")'
    );

    //Zoom
    this.zoomPlusButton = page.locator(
      'span[class="zoom-btns"] button:has-text("+")'
    );
    this.zoomMinusButton = page.locator(
      'span[class="zoom-btns"] button:has-text("-")'
    );
    this.zoomResetButton = page.locator('button[class="reset-btn"]');
    this.zoomButton = page.locator('div[class*="zoom-widget"]');
    this.zoomToFitAllMenuItem = page.locator('li:has-text("Zoom to fit all")');
    this.zoomSelectedMenuItem = page.locator('li:has-text("Zoom to selected")');
    this.downloadFileTickIcon = page.locator('svg[class="icon-tick"]');
    this.downloadFileCloseButton = page.locator('input[value="Close"]');

    //Assets panel
    this.assetsTab = page.locator('div[data-id="assets"]');
    this.assetsPanel = page.locator('div[class*="assets__assets-bar"]');
    this.librariesTab = page.locator('div[class="libraries-button"]');

    this.addPageButton = page.locator('div[class="add-page"] svg');
    this.firstPageListItem = page.locator(
      'ul[class="pages-list"] div[class^="element-list-body"] >>nth=0'
    );
    this.secondPageListItem = page.locator(
      'ul[class="pages-list"] div[class^="element-list-body"] >>nth=1'
    );
    this.firstPageNameInput = page.locator(
      'ul[class="pages-list"] div[class^="element-list-body"] input'
    );
    this.secondPageNameInput = page.locator(
      'ul[class="pages-list"] div[class^="element-list-body"] input'
    );
    this.assetsPanelPagesSection = page.locator("#sitemap");
    this.renamePageMenuItem = page.locator(
      'ul[class="workspace-context-menu"] li span:has-text("Rename")'
    );
    this.duplicatePageMenuItem = page.locator(
      'ul[class="workspace-context-menu"] li span:has-text("Duplicate")'
    );
    this.deletePageMenuItem = page.locator(
      'ul[class="workspace-context-menu"] li span:has-text("Delete")'
    );
    this.collapseExpandPagesButton = page.locator(
      'div[class="collapse-pages"]'
    );
    this.pageTrashIcon = page.locator(
      'svg[class="icon-trash"] >> visible=true'
    );
    this.deletePageOkButton = page.locator('input[value="Ok"]');
    this.assetsTitleText = page.locator('div[class^="asset-title"]');
    this.assetsTypeSelector = page.locator('div[class="assets-bar"] select');
    this.fileLibraryGraphicsUploadImageSelector = page.locator(
      'div[class="libraries-wrapper"] input[accept="image/gif,image/png,image/svg+xml,image/webp,image/jpeg"]'
    );
    this.fileLibraryGraphicsUploadedImageLabel = page.locator('div[class*="grid-cell"]');
    this.renameFileLibraryMenuItem = page.locator('li:has-text("Rename")');
    this.deleteFileLibraryMenuItem = page.locator('li:has-text("Delete")');
    this.editFileLibraryMenuItem = page.locator('li:has-text("Edit")');
    this.duplicateMainComponentMenuItem = page.locator('li:has-text("Duplicate main")');
    this.showMainComponentMenuItem = page.locator('li:has-text("Show main component")');
    this.createGroupFileLibraryMenuItem = page.locator('li:has-text("Group")');
    this.ungroupFileLibraryMenuItem = page.locator('li:has-text("Ungroup")');
    this.groupNameInput = page.locator("#asset-name");
    this.createGroupButton = page.locator('input[value="Create"]');
    this.renameGroupButton = page.locator('input[value="Rename"]');
    this.fileLibraryGroupTitle = page.locator('div[class*="group-title"]');
    this.fileLibraryChangeViewButton = page.locator(
      'div[class="listing-option-btn"] svg'
    );
    this.addFileLibraryColorButton = page.locator(
      ".asset-section .icon-plus >>nth=1"
    );
    this.fileLibraryColorsColorBullet = page.locator(
      'div[class="color-bullet is-library-color"]'
    );
    this.fileLibraryColorsColorTitle = page.locator('div[class="name-block"]');
    this.fileLibraryColorsColorNameInput = page.locator(
      'input[class="element-name"]'
    );
    this.fileLibraryComponentNameInput = page.locator(
      'div[class*="assets_components__editing"] input'
    );
    this.addFileLibraryTypographyButton = page.locator(
      'div[class="asset-section"] svg[class="icon-plus"] >>nth=2'
    );
    this.expandMinimizeFileLibraryTypographyButton = page.locator(
      'div[class="element-set-actions-button"] >> visible=true'
    );
    this.fileLibraryTypographyRecord = page.locator(
      'div[class^="element-set-options-group typography-entry"]'
    );
    this.fontSelector = page.locator('div[class="input-select font-option"]');
    this.fontSelectorSearchInput = page.locator(
      'div[class="font-selector-dropdown"] header input'
    );
    this.fontSizeSelector = page.locator(
      'div[class="editable-select input-option size-option"] span'
    );
    this.typographyNameInput = page.locator(
      'input[class="element-name adv-typography-name"]'
    );
    this.fontRecordOnTypographiesBottomPanel = page.locator(
      'div[class="typography-item"]'
    );
    this.assetComponentLabel = page.locator(
      'div[class*="assets_components__grid-cell"]'
    );
    this.fileLibraryGraphicsSecondComponentLabel = page.locator(
      'div[class*="grid-cell"] >>nth=1'
    );
    this.bottomPaletteContentBlock = page.locator(
      'div[class="color-palette-content"]'
    );
    this.componentsTitleBarOnAssetsTab = page.locator(
      'div[class*="components_title_bar"] span:text-is("Components")'
    );
    this.componentsGridOnAssetsTab = page.locator(
      'div[class*="assets_components__asset-grid"]'
    );

    //Assets panel - Libraries
    this.addSharedLibraryButton = page.locator('input[value="Add"]');
    this.removeSharedLibraryButton = page.locator('input[value="Remove"]');
    this.publishSharedLibraryButton = page.locator('input[value="Publish"]');
    this.unPublishSharedLibraryButton = page.locator('input[value="Unpublish"]');
    this.closeLibrariesPopUpButton = page.locator(
      'div[class="modal libraries-dialog"] svg[class="icon-close"]'
    );
    this.addAsSharedLibraryButton = page.locator(
      'input[value="Add as Shared Library"]'
    );
    this.removeAsSharedLibraryButton = page.locator('input[value="Unpublish"]');
    this.sharedLibraryBadge = page.locator('span:has-text("SHARED")');
    this.searchLibraryInput = page.locator('div.libraries-search input.search-input');
    this.clearSearchInputIcon = page.locator('div.search-close svg.icon-close');
    this.searchIcon = page.locator('div.libraries-content div.search-icon');
    this.librariesEmptyList = page.locator('div.section-list-empty');

    //Prototype panel
    this.prototypeTab = page.locator('div[data-id=":prototype"]');
    this.prototypeArrowConnector = page.locator(
      'g[class="interactions"] path[fill="var(--color-primary)"] >>nth=0'
    );
    this.prototypeArrowSecondConnector = page.locator(
      'g[class="interactions"] path[fill="var(--color-primary)"] >>nth=1'
    );
    this.prototypePanelFlowNameText = page.locator(
      'span[class="element-label flow-name"]'
    );
    this.prototypePanelFlowNameInput = page.locator(
      'input[class="element-name"]'
    );
    this.prototypePanelFirstFlowNameText = page.locator(
      'span[class="element-label flow-name"] >>nth=0'
    );
    this.prototypePanelSecondFlowNameText = page.locator(
      'span[class="element-label flow-name"] >>nth=1'
    );
    this.addInteractionButton = page.locator(
      'div:has-text("Interactions") svg[class="icon-plus"]'
    );
    this.removeSecondInteractionButton = page.locator(
      'div[class="element-set-actions-button"] svg[class="icon-minus"] >>nth=1'
    );
    this.firstInteractionRecord = page.locator(
      'div[class="interactions-summary"] >>nth=0'
    );
    this.secondInteractionRecord = page.locator(
      'div[class="interactions-summary"] >>nth=1'
    );
    this.interactionDestinationSelector = page.locator(
      'div[class="interactions-element"] select'
    );
    this.removeFlowButton = page.locator(
      'div[class="flow-element"] svg[class="icon-minus"]'
    );

    //Header
    this.savedChangesIcon = page.locator('div[title="Saved"]');
    this.unSavedChangesIcon = page.locator('div.pending span:text-is("Unsaved changes")');
    this.usersSection = page.locator('div[class*="users-section"]');
    this.projectNameSpan = page.locator('div[class="project-tree"] span[class="project-name"]');
    this.fileNameSpan = page.locator('div[class="project-tree"] span')

    //History panel
    this.historyPanelButton = page.locator('button[class^="document-history"]');
    this.historyPanelActionRecord = page.locator(
      'div[class="history-entry-summary-text"]'
    );

    //Shortcuts panel
    this.shortcutsPanel = page.locator('div[class="shortcuts"]');
    this.closeShortcutsPanelIcon = page.locator('div.shortcuts svg.icon-close');

    //Colors panel
    this.colorsPalette = page.locator('div[class="color-palette "]');
  }

  async clickMoveButton() {
    await this.moveButton.click();
  }

  async clickOnDesignPanel() {
    await this.designTab.click();
  }

  async clickCreateBoardButton() {
    await this.createBoardButton.click();
    await this.waitDesignTabCollapsed();
  }

  async clickCreateRectangleButton() {
    await this.createRectangleButton.click();
    await this.waitDesignTabCollapsed();
  }

  async clickCreateEllipseButton() {
    await this.createEllipseButton.click();
    await this.waitDesignTabCollapsed();
  }

  async clickCreateTextButton() {
    await this.createTextButton.click();
    await this.waitDesignTabCollapsed();
  }

  async typeText(text) {
    await this.textbox.fill(text);
  }

  async typeTextFromKeyboard() {
    await this.page.keyboard.press("H");
    await this.page.keyboard.press("e");
    await this.page.keyboard.press("l");
    await this.page.keyboard.press("l");
    await this.page.keyboard.press("o");
    await this.page.keyboard.press("Space");
    await this.page.keyboard.press("W");
    await this.page.keyboard.press("o");
    await this.page.keyboard.press("r");
    await this.page.keyboard.press("l");
    await this.page.keyboard.press("d");
    await this.page.keyboard.press("!");
  }

  async uploadImage(filePath) {
    await this.uploadImageSelector.setInputFiles(filePath);
  }

  async clickCreateCurveButton() {
    await this.createCurveButton.click();
    await this.page.waitForTimeout(100);
    await this.waitDesignTabCollapsed();
  }

  async clickCreatePathButton() {
    await this.createPathButton.click();
    await expect(this.pathActionsBlock).toBeVisible();
  }

  async clickViewportOnce() {
    await this.viewport.click();
  }

  async clickViewportTwice(delayMs=300) {
    await this.viewport.click({ delay: delayMs });
    await this.viewport.click({ delay: delayMs });
  }

  async clickViewportByCoordinates(x, y, delayMs=300) {
    await this.viewport.click({ position: { x: x, y: y }, delay: delayMs });
    await this.viewport.click({ position: { x: x, y: y }, delay: delayMs });
  }

  async waitForChangeIsSaved() {
    await this.savedChangesIcon.waitFor({ state: "visible" });
  }

  async isUnSavedChangesDisplayed() {
    await expect(this.unSavedChangesIcon).toBeVisible();
  }

  async isCreatedLayerVisible() {
    await expect(this.createdLayer).toBeVisible();
  }

  async doubleClickCreatedBoardTitleOnCanvas() {
    await this.createdBoardTitle.dblclick();
  }

  async clickCreatedBoardTitleOnCanvas() {
    await this.createdBoardTitle.click({ force: true });
  }

  async clickOnLayerOnCanvas() {
    await this.createdLayer.click({ force: true, delay: 500 });
  }

  async doubleClickBoardTitleOnCanvas(title) {
    const boardSel = this.page.locator(`//*[text()="${title}"]//parent::*[@class="frame-title"]`);
    await boardSel.dblclick();
  }

  async hideUnhideLayerByIconOnLayersTab(layer) {
    const commonSel = `//*[text()="${layer}"]//parent::div[contains(@class, "element-list-body")]`;
    const layerSel = this.page.locator(commonSel);
    const hideUnhideIconSel = this.page.locator(commonSel + '//*[contains(@class, "icon-eye")]');

    await layerSel.hover();
    await hideUnhideIconSel.click();
  }

  async isLayerPresentOnLayersTab(layer, isVisible) {
    const layerSel = this.page.locator(
      `//*[text()="${layer}"]//parent::div[contains(@class, "element-list-body")]`);
    if (isVisible) {
      await expect(layerSel).toBeVisible();
    } else {
      await expect(layerSel).not.toBeVisible();
    }
  }

  async hideLayerViaRightClickOnCanvas(title) {
    const boardSel = this.page.locator(`//*[text()="${title}"]//parent::*[@class="frame-title"]`);
    await boardSel.click({ button: "right", force: true });
    await this.hideLayerMenuItem.click();
  }

  async unHideLayerViaRightClickOnLayersTab(layer) {
    const layerSel = this.page.locator(
      `//*[text()="${layer}"]//parent::div[contains(@class, "element-list-body")]`
    );
    await layerSel.click({ button: "right", force: true });
    await this.showLayerMenuItem.click();
  }

  async hideLayerViaRightClickOnLayersTab(layer) {
    const layerSel = this.page.locator(
      `//*[text()="${layer}"]//parent::div[contains(@class, "element-list-body")]`
    );
    await layerSel.click({ button: "right", force: true });
    await this.hideLayerMenuItem.click();
  }

  async focusBoardViaRightClickOnCanvas(title) {
    const boardSel = this.page.locator(`//*[text()="${title}"]//parent::*[@class="frame-title"]`);
    await boardSel.click({ button: "right", force: true });
    await this.focusOnLayerMenuItem.click();
  }

  async focusLayerViaRightClickOnCanvas() {
    await this.createdLayer.click({ button: "right", force: true });
    await this.focusOnLayerMenuItem.click();
  }

  async focusLayerViaRightClickOnLayersTab(layer) {
    const layerSel = this.page.locator(`//*[text()="${layer}"]//parent::div[contains(@class, "element-list-body")]`);
    await layerSel.click({ button: "right", force: true });
    await this.focusOnLayerMenuItem.click();
  }

  async focusLayerViaShortcut() {
    await this.page.keyboard.press('F');
  }

  async isFocusModeOn() {
    await expect(this.focusModeDiv).toBeVisible();
  }

  async isFocusModeOff() {
    await expect(this.focusModeDiv).not.toBeVisible();
  }

  async clickOnFocusModeLabel() {
    await this.focusModeDiv.click();
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

  async doubleClickLayerOnLayersTab() {
    await this.createdLayerOnLayersPanel.dblclick();
  }

  async clickMainComponentOnLayersTab() {
    await this.mainComponentLayer.click();
  }

  async clickCopyComponentOnLayersTab() {
    await this.copyComponentLayer.click();
  }

  async doubleClickLayerOnLayersTabViaTitle(title) {
    const layerSel = this.page.locator(
      `div[class^="element-list-body"] span[class="element-name"]:text-is("${title}")`
    );
    await layerSel.dblclick();
  }

  async doubleClickLayerIconOnLayersTab(layer) {
    const iconSel = this.page.locator(`//*[text()="${layer}"]//parent::div//div[@class="icon"]`);
    await iconSel.dblclick();
  }

  async renameCreatedLayer(newName) {
    await this.createdLayerOnLayersPanelNameInput.fill(newName);
    await this.clickMoveButton();
  }

  async isLayerNameDisplayed(name) {
    await expect(this.createdLayerOnLayersPanel).toHaveText(name);
  }

  async isBoardNameDisplayed(name) {
    await expect(this.createdBoardTitle).toHaveText(name);
    await expect(this.createdLayerOnLayersPanel).toHaveText(name);
  }

  async drawCurve(x1, y1, x2, y2) {
    await this.viewport.hover();
    await this.page.mouse.move(x1, y1);
    await this.page.mouse.down();
    await this.page.mouse.move(x1, y1);
    await this.page.mouse.move(x2, y2);
    await this.page.mouse.up();
  }

  async clickPencilBoxButton() {
    await this.pencilBoxButton.click( { force: true });
  }

  async isMainPageLoaded() {
    await expect(this.viewport).toBeVisible();
  }

  async isProjectAndFileNameExistInFile(projectName, fileName) {
    await expect(this.projectNameSpan).toContainText(projectName);
    await expect(this.fileNameSpan.last()).toHaveText(fileName);
  }

  async clickCanvasBackgroundColorIcon() {
    await this.canvasBackgroundColorIcon.click();
  }

  async clickAddShadowButton() {
    await this.shadowSection.waitFor();
    await this.addShadowButton.click({ delay: 500 });
  }

  async clickShadowActionsButton() {
    await this.shadowActionsButton.click();
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
    switch (type) {
      case "Drop shadow":
        await this.shadowTypeSelector.last().selectOption(":drop-shadow");
        break;
      case "Inner shadow":
        await this.shadowTypeSelector.last().selectOption(":inner-shadow");
        break;
    }
  }

  async clickAddBlurButton() {
    await this.blurSection.waitFor();
    await this.addBlurButton.click({ delay: 500});
  }

  async changeValueForBlur(value) {
    await this.clearInput(this.blurValueInput);
    await this.blurValueInput.fill(value);
  }

  async deleteLayerViaRightClick() {
    await this.createdLayer.click({ button: "right", force: true });
    await this.deleteLayerMenuItem.click();
  }

  async addFlexLayoutViaRightClick() {
    await this.createdBoardTitle.click({ button: "right", force: true });
    await this.addFlexLayout.click();
  }

  async removeFlexLayoutViaRightClick() {
    await this.createdBoardTitle.click({ button: "right", force: true });
    await this.removeFlexLayout.click();
  }

  async pressFlexLayoutShortcut() {
    await this.createdLayer.click({ force: true });
    await this.page.keyboard.press("Shift+A");
  }

  async isLayoutMenuExpanded(condition = true) {
    if (condition === true) {
      await expect(this.layoutSection).toBeVisible();
    } else {
      await expect(this.layoutSection).toBeHidden();
    }
  }

  async isLayoutIconVisibleOnLayer(condition = true) {
    if (condition === true) {
      await expect(this.layoutIcon).toBeVisible();
    } else {
      await expect(this.layoutIcon).toBeHidden();
    }
  }

  async removeLayoutFromDesignPanel() {
    await this.removeLayoutButton.click();
  }

  async changeLayoutDirection(direction) {
    switch (direction) {
      case "Row":
        await this.layoutDirectRowBtn.click();
        break;
      case "Row reverse":
        await this.layoutDirectRowReverseBtn.click();
        break;
      case "Column":
        await this.layoutDirectColumnBtn.click();
        break;
      case "Column reverse":
        await this.layoutDirectColumnReverseBtn.click();
        break;
    }
  }

  async changeLayoutAlignment(alignment) {
    switch (alignment) {
      case "Start":
        await this.layoutAlignStartBtn.click();
        break;
      case "Center":
        await this.layoutAlignCenterBtn.click();
        break;
      case "End":
        await this.layoutAlignEndBtn.click();
        break;
    }
  }

  async changeLayoutJustification(justify) {
    switch (justify) {
      case "Start":
        await this.layoutJustifyStartBtn.click();
        break;
      case "Center":
        await this.layoutJustifyCenterBtn.click();
        break;
      case "End":
        await this.layoutJustifyEndBtn.click();
        break;
      case "Space between":
        await this.layoutJustifySpaceBetweenBtn.click();
        break;
      case "Space around":
        await this.layoutJustifySpaceAroundBtn.click();
        break;
      case "Space evenly":
        await this.layoutJustifySpaceEvenlyBtn.click();
        break;
    }
  }

  async changeLayoutColumnGap(value) {
    await this.layoutColumnGapInput.fill(value);
    await this.clickOnEnter();
  }

  async clickLayoutColumnGapField() {
    await this.layoutColumnGapInput.click();
  }

  async changeLayoutRowGap(value) {
    await this.layoutRowGapInput.fill(value);
    await this.clickOnEnter();
  }

  async changeLayoutVerticalPadding(value) {
    await this.layoutVerticalPaddingInput.fill(value);
    await this.clickOnEnter();
  }

  async changeLayoutHorizontalPadding(value) {
    await this.layoutHorizontPaddingInput.fill(value);
    await this.clickOnEnter();
  }

  async clickLayoutVerticalPaddingField() {
    await this.layoutVerticalPaddingInput.click();
  }

  async clickLayoutHorizontalPaddingField() {
    await this.layoutHorizontPaddingInput.click();
  }

  async switchToIndependentPadding() {
    await this.layoutIndepPaddingsIcon.click();
  }

  async changeLayoutTopPadding(value) {
    await this.layoutPaddingTopInput.fill(value);
    await this.clickOnEnter();
  }

  async changeLayoutBottomPadding(value) {
    await this.layoutPaddingBottomInput.fill(value);
    await this.clickOnEnter();
  }

  async changeLayoutRightPadding(value) {
    await this.layoutPaddingRightInput.fill(value);
    await this.clickOnEnter();
  }

  async changeLayoutLeftPadding(value) {
    await this.layoutPaddingLeftInput.fill(value);
    await this.clickOnEnter();
  }

  async transformToPathViaRightClick() {
    await this.createdLayer.click({ button: "right", force: true });
    await this.transformToPathMenuItem.click();
  }

  async selectionToBoardViaRightClick() {
    await this.createdLayer.click({ button: "right", force: true });
    await this.selectionToBoardMenuItem.click();
  }

  async createComponentViaRightClick() {
    const layerSel = this.page.locator('div[class="viewport"] [id^="shape"]');
    await layerSel.last().click({ button: "right", force: true });
    await this.createComponentMenuItem.click();
  }

  async updateMainComponentViaRightClick() {
    await this.copyComponentLayer.click({ button: "right", force: true});
    await this.updateMainComponentMenuItem.click();
  }

  async duplicateLayerViaRightClick() {
    const layerSel = this.page.locator('div[class="viewport"] [id^="shape"]');
    await layerSel.last().click({ button: "right", force: true });
    await this.duplicateOption.click();
  }

  async createComponentViaRightClickLayers() {
    await this.createdLayerOnLayersPanel.click({ button: "right", force: true });
    await this.createComponentMenuItem.click();
  }

  async createComponentsMultipleShapesRightClick(singleComponent=true) {
    const layerSel = this.page.locator('div.viewport .main.viewport-selrect');
    await layerSel.last().click({ button: "right", force: true });
    if (singleComponent) {
      await this.createComponentMenuItem.click();
    } else {
      await this.createMultipleComponentsMenuItem.click();
    }
  }

  async createComponentViaShortcut(browserName) {
    await this.createdLayer.click({ force: true });
    if (browserName === 'webkit') {
      await this.page.keyboard.press("Meta+K");
    } else {
      await this.page.keyboard.press("Control+K");
    }
  }

  async flipVerticalViaRightClick() {
    await this.createdLayer.click({ button: "right", force: true });
    await this.flipVerticalMenuItem.click();
  }

  async flipHorizontalViaRightClick() {
    await this.createdLayer.click({ button: "right", force: true });
    await this.flipHorizontalMenuItem.click();
  }

  async flipVerticalViaShortcut() {
    await this.createdLayer.click({ force: true });
    await this.page.keyboard.press("Shift+V");
  }

  async flipHorizontalViaShortcut() {
    await this.createdLayer.click({ force: true });
    await this.page.keyboard.press("Shift+H");
  }

  async deleteLayerViaShortcut() {
    await this.createdLayer.click({ force: true });
    await this.pressDeleteKeyboardButton();
  }

  async changeRotationForLayer(value) {
    await this.clearInput(this.layerRotationInput);
    await this.layerRotationInput.fill(value);
    await this.clickMoveButton();
  }

  async clickIndividualCornersRadiusButton() {
    await this.individualCornersRadiusButton.click();
  }

  async clickAllCornersRadiusButton() {
    await this.allCornersRadiusButton.click();
  }

  async changeGeneralCornerRadiusForLayer(value) {
    await this.generalCornerRadiusInput.fill(value);
    await this.clickMoveButton();
  }

  async changeFirstCornerRadiusForLayer(value) {
    await this.firstCornerRadiusInput.fill(value);
    await this.clickMoveButton();
  }

  async changeSecondCornerRadiusForLayer(value) {
    await this.secondCornerRadiusInput.fill(value);
    await this.clickMoveButton();
  }

  async changeThirdCornerRadiusForLayer(value) {
    await this.thirdCornerRadiusInput.fill(value);
    await this.clickMoveButton();
  }

  async changeFourthCornerRadiusForLayer(value) {
    await this.fourthCornerRadiusInput.fill(value);
    await this.clickMoveButton();
  }

  async clickFillColorIcon() {
    await this.fillColorIcon.click();
  }

  async changeOpacityForFill(value) {
    await this.fillOpacityInput.fill(value);
  }

  async openNodesPanelViaRightClick() {
    await this.createdLayer.click({ button: "right", force: true });
    await this.editPathMenuItem.click();
  }

  async clickFirstNode() {
    await this.firstNode.click({ force: true });
  }

  async clickSecondNode() {
    await this.secondNode.click({ force: true });
  }

  async clickThirdNode() {
    await this.thirdNode.click({ force: true });
  }

  async clickFourthNode() {
    await this.fourthNode.click({ force: true });
  }

  async clickFifthNode() {
    await this.fifthNode.click({ force: true });
  }

  async clickSixthNode() {
    await this.sixthNode.click({ force: true });
  }

  async holdShiftKeyboardButton() {
    await this.page.keyboard.down("Shift");
  }

  async releaseShiftKeyboardButton() {
    await this.page.keyboard.up("Shift");
  }

  async clickAddNodeButtonOnNodePanel() {
    await this.nodePanelAddNodeButton.click();
  }

  async pressShiftPlusKeyboardShortcut() {
    await this.page.keyboard.press("Shift+NumpadAdd");
  }

  async clickDeleteNodeButtonOnNodePanel() {
    await this.nodePanelDeleteNodeButton.click();
  }

  async pressDeleteKeyboardButton() {
    await this.page.keyboard.press("Delete");
  }

  async clickMergeNodesButtonOnNodePanel() {
    await this.nodePanelMergeNodesButton.click();
  }

  async pressCtrlJKeyboardShortcut() {
    await this.page.keyboard.press("Control+J");
  }

  async clickDrawNodesButtonOnNodePanel() {
    await this.nodePanelDrawNodesButton.click();
  }

  async clickMoveNodesButtonOnNodePanel() {
    await this.nodePanelMoveNodesButton.click();
  }

  async clickJoinNodesButtonOnNodePanel() {
    await this.nodePanelJoinNodesButton.click();
  }

  async pressJKeyboardShortcut() {
    await this.page.keyboard.press("J");
  }

  async clickSeparateNodesButtonOnNodePanel() {
    await this.nodePanelSeparateNodesButton.click();
  }

  async pressKKeyboardShortcut() {
    await this.page.keyboard.press("K");
  }

  async clickToCornerButtonOnNodePanel() {
    await this.nodePanelToCornerButton.click();
  }

  async pressXKeyboardShortcut() {
    await this.page.keyboard.press("X");
  }

  async clickToCurveButtonOnNodePanel() {
    await this.nodePanelToCurveButton.click();
  }

  async pressCKeyboardShortcut() {
    await this.page.keyboard.press("C");
  }

  async clickCreateCommentButton() {
    await this.createCommentButton.click();
  }

  async enterCommentText(text) {
    await this.commentInput.fill(text);
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

  async clearCommentInput() {
    await this.clearInput(this.commentInput);
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

  async isCommentsPanelPlaceholderDisplayed(text) {
    await expect(this.commentsPanelPlaceholderText).toHaveText(text);
  }

  async isResolveCommentCheckboxSelected() {
    await expect(this.resolveCommentCheckbox).toHaveClass(
      "icon-checkbox-checked"
    );
  }

  async searchLayer(name) {
    await this.searchLayersIcon.click();
    await this.searchLayersInput.fill(name);
  }

  async isLayerSearched(name) {
    await expect(this.searchedLayerOnLayersPanelNameText).toHaveText(name);
  }

  async clickAddGridButton() {
    await this.gridSection.waitFor();
    await this.addGridButton.click();
  }

  async clickRemoveGridButton() {
    await this.gridMainOptionSection.hover();
    await this.removeGridButton.click();
  }

  async clickHideGridButton() {
    await this.gridMainOptionSection.hover();
    await this.hideGridButton.click();
  }

  async clickUnhideGridButton() {
    await this.gridMainOptionSection.hover();
    await this.unhideGridButton.click();
  }

  async changeSizeForGrid(value) {
    await this.clearInput(this.gridSizeInput);
    await this.gridSizeInput.fill(value);
  }

  async clickGridActionsButton() {
    await this.gridActionsButton.click();
  }

  async changeOpacityForGrid(value) {
    await this.clearInput(this.gridOpacityInput);
    await this.gridOpacityInput.fill(value);
  }

  async clickUseDefaultGridButton() {
    await this.useDefaultGridButton.click();
  }

  async selectGridType(type) {
    await this.gridTypeSelector.click();
    switch (type) {
      case "Square":
        await this.gridTypeSelectorSquareOption.click();
        break;
      case "Columns":
        await this.gridTypeSelectorColumnsOption.click();
        break;
      case "Rows":
        await this.gridTypeSelectorRowsOption.click();
        break;
    }
  }

  async changeColumnsOrRowsNumberForGrid(value) {
    await this.clearInput(this.gridSizeInput);
    await this.gridSizeInput.fill(value);
  }

  async changeWidthForGrid(value) {
    await this.clearInput(this.gridWidthInput);
    await this.gridWidthInput.fill(value);
  }

  async changeHeightForGrid(value) {
    await this.clearInput(this.gridHeightInput);
    await this.gridHeightInput.fill(value);
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

  async clickMainMenuButton() {
    await this.mainMenuButton.click();
    await expect(this.mainMenuList).toBeVisible();
  }

  async clickViewMainMenuItem() {
    await this.viewMainMenuItem.click({ force: true });
    await expect(this.subMenuViewList).toBeVisible();
  }

  async clickFileMainMenuItem() {
    await this.fileMainMenuItem.click();
    await expect(this.subMenuFileList).toBeVisible();
  }

  async clickEditMainMenuItem() {
    await this.editMainMenuItem.click();
    await expect(this.subMenuEditList).toBeVisible();
  }

  async clickHelpInfoMainMenuItem() {
    await this.helpInfoMenuItem.click();
    await expect(this.subMenuHelpInfoList).toBeVisible();
  }

  async clickShowRulersMainMenuSubItem() {
    await this.showRulersMainMenuSubItem.click();
  }

  async clickHideRulersMainMenuSubItem() {
    await this.hideRulersMainMenuSubItem.click();
  }

  async clickHideGridsMainMenuSubItem() {
    await this.hideGridsMainMenuSubItem.click();
  }

  async clickShowGridsMainMenuSubItem() {
    await this.showGridsMainMenuSubItem.click();
  }

  async clickSelectAllMainMenuSubItem() {
    await this.selectAllMainMenuSubItem.click();
  }

  async clickShowColorPaletteMainMenuSubItem() {
    await this.showColorPaletteMainMenuSubItem.click();
  }

  async clickHideColorPaletteMainMenuSubItem() {
    await this.hideColorPaletteMainMenuSubItem.click();
  }

  async pressHideShowRulersShortcut(browserName) {
    if (browserName === 'webkit') {
      await this.page.keyboard.press("Meta+Shift+R");
    } else {
      await this.page.keyboard.press("Control+Shift+R");
    }
  }

  async pressHideShowGridsShortcut(browserName) {
    if (browserName === 'webkit') {
      await this.page.keyboard.press("Meta+'");
    } else {
      await this.page.keyboard.press("Control+'");
    }
  }

  async pressSelectAllShortcut(browserName) {
    if (browserName === 'webkit') {
      await this.page.keyboard.press("Meta+A");
    } else {
      await this.page.keyboard.press("Control+A");
    }
  }

  async clickShowBoardNamesMainMenuSubItem() {
    await this.showBoardNamesMainMenuSubItem.click();
  }

  async clickHideBoardNamesMainMenuSubItem() {
    await this.hideBoardNamesMainMenuSubItem.click();
  }

  async clickShowPixelGridMainMenuSubItem() {
    await this.showPixelGridMainMenuSubItem.click();
  }

  async clickHidePixelGridMainMenuSubItem() {
    await this.hidePixelGridMainMenuSubItem.click();
  }

  async clickShowHideUIMainMenuSubItem() {
    await this.showHideUIMainMenuSubItem.click();
  }

  async clickAddAsSharedLibraryMainMenuSubItem() {
    await this.addAsSharedLibraryFileMenuSubItem.click();
  }

  async clickRemoveAsSharedLibraryMainMenuSubItem() {
    await this.removeAsSharedLibraryFileMenuSubItem.click();
  }

  async clickShortcutsMainMenuSubItem() {
    await this.shortcutsMenuSubItem.click();
  }

  async clickZoomButton() {
    await this.zoomButton.click();
  }

  async increaseZoom(numberOfTimes) {
    await this.clickZoomButton();
    for (let i = 0; i <= numberOfTimes; i++) {
      await this.zoomPlusButton.click();
    }
    await this.clickZoomButton();
  }

  async decreaseZoom(numberOfTimes) {
    await this.clickZoomButton();
    for (let i = 0; i <= numberOfTimes; i++) {
      await this.zoomMinusButton.click();
    }
    await this.clickZoomButton();
  }

  async resetZoom() {
    await this.clickZoomButton();
    await this.zoomResetButton.click();
  }

  async zoomToFitAll() {
    await this.clickZoomButton();
    await this.zoomToFitAllMenuItem.click({ delay: 500 });
  }

  async zoomToFitSelected() {
    await this.clickZoomButton();
    await this.zoomSelectedMenuItem.click();
  }

  async pressHideShowPixelGridShortcut() {
    await this.page.keyboard.press("Shift+,");
  }

  async pressHideShowUIShortcut() {
    await this.page.keyboard.press("Backslash");
  }

  async downloadPenpotFileViaMenu() {
    await this.dowloadPenpotFileMenuSubItem.click();
    await this.page.waitForEvent("download");
    await expect(this.downloadFileTickIcon).toBeVisible();
    await this.downloadFileCloseButton.click();
  }

  async downloadStandardFileViaMenu() {
    await this.dowloadStandartFileMenuSubItem.click();
    await this.page.waitForEvent("download");
    await expect(this.downloadFileTickIcon).toBeVisible();
    await this.downloadFileCloseButton.click();
  }

  async openAssetsTab() {
    await this.assetsTab.click();
  }

  async switchToAssetsPanelViaShortcut() {
    await this.page.keyboard.press("Alt+I");
  }

  async isAssetsPanelDisplayed() {
    await expect(this.assetsPanel).toBeVisible();
  }

  async clickLayersTab() {
    await this.layersTab.click();
  }

  async switchToLayersPanelViaShortcut() {
    await this.page.keyboard.press("Alt+L");
  }

  async isLayersPanelDisplayed() {
    await expect(this.layersPanel).toBeVisible();
  }

  async clickAddAsSharedLibraryButton() {
    await this.addAsSharedLibraryButton.click();
  }

  async clickRemoveAsSharedLibraryButton() {
    await this.removeAsSharedLibraryButton.click();
  }

  async searchForLibrary(libraryName) {
    await this.searchLibraryInput.fill(libraryName);
    await this.page.waitForTimeout(200);
  }

  async clearSearchLibraryInput() {
    await this.clearSearchInputIcon.click({ force: true });
    await this.searchIcon.waitFor();
  }

  async isNoMatchedLibrariesFound(libraryName) {
    await expect(this.librariesEmptyList).toBeVisible();
    await expect(this.librariesEmptyList).toHaveText(`No matches found for “${libraryName}“`);
  }

  async isLibraryFoundAfterSearch(libraryName, isFound) {
    const librarySel = this.page.locator(`div.section-list-item div.item-name:text-is("${libraryName}")`);
    if (isFound) {
      await expect(librarySel).toBeVisible();
    } else {
      await expect(librarySel).not.toBeVisible();
    }
  }

  async isSharedLibraryBadgeVisible() {
    await expect(this.sharedLibraryBadge).toBeVisible();
  }

  async isSharedLibraryBadgeNotVisible() {
    await expect(this.sharedLibraryBadge).not.toBeVisible();
  }

  async clickAddPageButton() {
    await this.addPageButton.click();
  }

  async isFirstPageAddedToAssetsPanel() {
    await expect(this.firstPageListItem).toBeVisible();
  }

  async isFirstPageNameDisplayed(name) {
    await expect(this.firstPageListItem).toHaveText(name);
  }

  async isSecondPageAddedToAssetsPanel() {
    await expect(this.secondPageListItem).toBeVisible();
  }

  async isSecondPageNameDisplayed(name) {
    await expect(this.secondPageListItem).toHaveText(name);
  }

  async renameFirstPageViaRightClick(newName) {
    await this.firstPageListItem.click({ button: "right" });
    await this.renamePageMenuItem.click();
    await this.clearInput(this.firstPageNameInput);
    await this.firstPageNameInput.fill(newName);
    await this.clickViewportTwice();
  }

  async renameSecondPageViaDoubleClick(newName) {
    await this.secondPageListItem.dblclick();
    await this.clearInput(this.secondPageNameInput);
    await this.secondPageNameInput.fill(newName);
    await this.clickViewportTwice();
  }

  async duplicatePageViaRightClick() {
    await this.firstPageListItem.click({ button: "right" });
    await this.duplicatePageMenuItem.click();
  }

  async clickFirstPageOnAssetsPanel() {
    await this.firstPageListItem.click();
    await expect(this.firstPageListItem).toHaveClass(
      "element-list-body selected"
    );
  }

  async clickSecondPageOnAssetsPanel() {
    await this.secondPageListItem.click();
    await expect(this.secondPageListItem).toHaveClass(
      "element-list-body selected"
    );
  }

  async clickCollapseExpandPagesButton() {
    await this.collapseExpandPagesButton.click();
  }

  async deleteSecondPageViaRightClick() {
    await this.secondPageListItem.click({ button: "right" });
    await this.deletePageMenuItem.click();
    await this.deletePageOkButton.click();
  }

  async deleteSecondPageViaTrashIcon() {
    await this.secondPageListItem.hover();
    await this.pageTrashIcon.dblclick();
    await this.deletePageOkButton.click();
  }

  async clickPrototypeTab() {
    await this.prototypeTab.click();
  }

  async dragAndDropPrototypeArrowConnector(x, y) {
    await this.prototypeArrowConnector.hover();
    await this.prototypeArrowConnector.dragTo(this.viewport, {
      force: false,
      targetPosition: { x: x, y: y }
    });
  }

  async isFlowNameDisplayedOnPrototypePanel(name) {
    await expect(this.prototypePanelFlowNameText).toHaveText(name);
  }

  async isFirstFlowNameDisplayedOnPrototypePanel(name) {
    await expect(this.prototypePanelFirstFlowNameText).toHaveText(name);
  }

  async isSecondFlowNameDisplayedOnPrototypePanel(name) {
    await expect(this.prototypePanelSecondFlowNameText).toHaveText(name);
  }

  async isFlowNameNotDisplayedOnPrototypePanel() {
    await expect(this.prototypePanelFlowNameText).not.toBeVisible();
  }

  async clickAddInteractionButton() {
    await this.addInteractionButton.click({ delay: 500 });
  }

  async isPrototypeArrowSecondConnectorDisplayed() {
    await expect(this.prototypeArrowSecondConnector).toBeVisible();
  }

  async isPrototypeArrowSecondConnectorNotDisplayed() {
    await expect(this.prototypeArrowSecondConnector).not.toBeVisible();
  }

  async clickRemoveSecondInteractionButton() {
    await this.secondInteractionRecord.hover();
    await this.removeSecondInteractionButton.click();
  }

  async clickFirstInteractionRecord() {
    await this.firstInteractionRecord.click();
  }

  async renameFlow(newName) {
    await this.prototypePanelFlowNameText.dblclick();
    await this.clearInput(this.prototypePanelFlowNameInput);
    await this.prototypePanelFlowNameInput.fill(newName);
    await this.clickPrototypeTab();
  }

  async clickRemoveFlowButton() {
    await this.removeFlowButton.click();
  }

  async selectInteractionDestination(index) {
    await this.interactionDestinationSelector.selectOption({
      index: index,
    });
  }

  async clickHistoryPanelButton() {
    await this.historyPanelButton.click();
  }

  async isActionDisplayedOnHistoryPanel(actionName) {
    await expect(this.historyPanelActionRecord).toHaveText(actionName);
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

  async selectTypeFromAllAssetsSelector(type) {
    switch (type) {
      case "All assets":
        await this.assetsTypeSelector.selectOption(":all");
        break;
      case "Components":
        await this.assetsTypeSelector.selectOption(":components");
        break;
      case "Graphics":
        await this.assetsTypeSelector.selectOption(":graphics");
        break;
      case "Colors":
        await this.assetsTypeSelector.selectOption(":colors");
        break;
      case "Typographies":
        await this.assetsTypeSelector.selectOption(":typographies");
        break;
    }
  }

  async isAssetsTitleDisplayed(title) {
    await expect(this.assetsTitleText).toHaveText(title);
  }

  async uploadImageToFileLibraryGraphics(filePath) {
    await this.fileLibraryGraphicsUploadImageSelector.setInputFiles(filePath);
  }

  async isImageUploadedToFileLibraryGraphics() {
    await expect(this.fileLibraryGraphicsUploadedImageLabel).toBeVisible();
  }

  async isImageNotUploadedToFileLibraryGraphics() {
    await expect(this.fileLibraryGraphicsUploadedImageLabel).not.toBeVisible();
  }

  async deleteFileLibraryGraphics() {
    await this.fileLibraryGraphicsUploadedImageLabel.click({ button: "right" });
    await this.deleteFileLibraryMenuItem.click();
  }

  async createGroupFileLibraryGraphics(newGroupName) {
    await this.fileLibraryGraphicsUploadedImageLabel.click({ button: "right" });
    await this.createGroupFileLibraryMenuItem.click();
    await this.groupNameInput.fill(newGroupName);
    await this.createGroupButton.click();
  }

  async isFileLibraryGroupCreated(groupName) {
    await expect(this.fileLibraryGroupTitle).toHaveText(groupName);
  }

  async expandFileLibraryGroup(groupName) {
    const selector = this.page.locator(
        `div[class*="component-group"] div[class*="group-title"] has:text("${groupName}")`
    );
    await selector.click();
  }

  async isFileLibraryGroupRemoved() {
    await expect(this.fileLibraryGroupTitle).not.toBeVisible();
  }

  async renameGroupFileLibrary(newGroupName) {
    await this.fileLibraryGroupTitle.click({ button: "right" });
    await this.renameFileLibraryMenuItem.click();
    await this.clearInput(this.groupNameInput);
    await this.groupNameInput.fill(newGroupName);
    await this.renameGroupButton.click();
  }

  async ungroupFileLibrary() {
    await this.fileLibraryGroupTitle.click({ button: "right" });
    await this.ungroupFileLibraryMenuItem.click();
  }

  async clickFileLibraryChangeViewButton() {
    await this.fileLibraryChangeViewButton.click();
  }

  async clickAddFileLibraryColorButton() {
    await this.addFileLibraryColorButton.click();
  }

  async isColorAddedToFileLibraryColors(colorName) {
    await expect(this.fileLibraryColorsColorBullet).toBeVisible();
    await expect(this.fileLibraryColorsColorTitle).toHaveText(colorName);
  }

  async isColorNotAddedToFileLibraryColors() {
    await expect(this.fileLibraryColorsColorBullet).not.toBeVisible();
  }

  async editFileLibraryColor() {
    await this.fileLibraryColorsColorBullet.click({ button: "right" });
    await this.editFileLibraryMenuItem.click();
  }

  async renameFileLibraryColor(newColorName) {
    await this.fileLibraryColorsColorBullet.click({ button: "right" });
    await this.renameFileLibraryMenuItem.click();
    await this.clearInput(this.fileLibraryColorsColorNameInput);
    await this.fileLibraryColorsColorNameInput.fill(newColorName);
  }

  async deleteFileLibraryColor() {
    await this.fileLibraryColorsColorBullet.click({ button: "right" });
    await this.deleteFileLibraryMenuItem.click();
  }

  async createGroupFileLibraryColors(newGroupName) {
    await this.fileLibraryColorsColorBullet.click({ button: "right" });
    await this.createGroupFileLibraryMenuItem.click();
    await this.groupNameInput.fill(newGroupName);
    await this.createGroupButton.click();
  }

  async clickFileLibraryColorsColorBullet() {
    await this.fileLibraryColorsColorBullet.click({ delay: 500 });
  }

  async clickAndPressAltFileLibraryColorsColorBullet() {
    await this.fileLibraryColorsColorBullet.click({
      delay: 500,
      modifiers: ["Alt"],
    });
  }

  async clickAddFileLibraryTypographyButton() {
    await this.addFileLibraryTypographyButton.click();
  }

  async minimizeFileLibraryTypography() {
    await this.expandMinimizeFileLibraryTypographyButton.click();
  }

  async expandFileLibraryTypography() {
    await this.fileLibraryTypographyRecord.hover();
    await this.expandMinimizeFileLibraryTypographyButton.click();
  }

  async selectFont(fontName) {
    await this.fontSelector.click();
    await this.fontSelectorSearchInput.fill(fontName);
    await this.page
      .locator(
        `div[class="ReactVirtualized__Grid__innerScrollContainer"] div:has-text('${fontName}')`
      )
      .click();
  }

  async selectFontSize(value) {
    await this.fontSizeSelector.click();
    await this.page
      .locator(`ul[class="custom-select-dropdown"] li:has-text('${value}')`)
      .click();
  }

  async editFileLibraryTypography() {
    await this.fileLibraryTypographyRecord.click({ button: "right" });
    await this.editFileLibraryMenuItem.click();
  }

  async renameFileLibraryTypography(newName) {
    await this.fileLibraryTypographyRecord.click({ button: "right" });
    await this.renameFileLibraryMenuItem.click();
    await this.clearInput(this.typographyNameInput);
    await this.typographyNameInput.fill(newName);
  }

  async deleteFileLibraryTypography() {
    await this.fileLibraryTypographyRecord.click({ button: "right" });
    await this.deleteFileLibraryMenuItem.click();
  }

  async createGroupFileLibraryTypographies(newGroupName) {
    await this.fileLibraryTypographyRecord.click({ button: "right" });
    await this.createGroupFileLibraryMenuItem.click();
    await this.groupNameInput.fill(newGroupName);
    await this.createGroupButton.click();
  }

  async clickFileLibraryTypographiesTypographyRecord() {
    await this.fileLibraryTypographyRecord.click();
  }

  async pressOpenTypographiesBottomPanelShortcut() {
    await this.page.keyboard.press("Alt+T");
    await this.waitForBottomPaletteIsOpened();
  }

  async waitForBottomPaletteIsOpened() {
    await expect(this.bottomPaletteContentBlock).toBeVisible();
  }

  async clickFontRecordOnTypographiesBottomPanel() {
    await this.fontRecordOnTypographiesBottomPanel.click();
  }

  async isComponentAddedToFileLibraryComponents() {
    await expect(this.assetComponentLabel).toBeVisible();
  }

  async dragComponentOnCanvas(x, y) {
    await this.assetComponentLabel.dragTo(this.viewport, {
      targetPosition: { x: x, y: y }
    });
  }

  async isSecondComponentAddedToFileLibraryComponents() {
    await expect(this.fileLibraryGraphicsSecondComponentLabel).toBeVisible();
  }

  async isComponentNotAddedToFileLibraryComponents() {
    await expect(this.assetComponentLabel).not.toBeVisible();
  }

  async duplicateFileLibraryComponent() {
    await this.assetComponentLabel.click({ button: "right" });
    await this.duplicateMainComponentMenuItem.click();
  }

  async showFileLibraryMainComponent() {
    await this.assetComponentLabel.click({ button: "right" });
    await this.showMainComponentMenuItem.click();
  }

  async renameFileLibraryComponent(newName) {
    await this.assetComponentLabel.click({ button: "right" });
    await this.renameFileLibraryMenuItem.click();
    await this.fileLibraryComponentNameInput.fill(newName);
    await this.clickOnEnter();
  }

  async deleteFileLibraryComponents() {
    await this.assetComponentLabel.click({ button: "right" });
    await this.deleteFileLibraryMenuItem.click();
  }

  async expandComponentsBlockOnAssetsTab() {
    if (!await this.componentsGridOnAssetsTab.isVisible()) {
      await this.componentsTitleBarOnAssetsTab.click();
    }
    await expect(this.componentsGridOnAssetsTab).toBeVisible();
  }

  async clickLibrariesTab() {
    await this.librariesTab.click();
  }

  async clickAddSharedLibraryButton() {
    await this.addSharedLibraryButton.click();
  }

  async clickRemoveSharedLibraryButton() {
    await this.removeSharedLibraryButton.click();
  }

  async clickPublishSharedLibraryButton() {
    await this.publishSharedLibraryButton.click();
  }

  async unPublishSharedLibrary() {
    await this.unPublishSharedLibraryButton.click();
    await this.unPublishSharedLibraryButton.click();
  }

  async isUnpublishLibraryBtnPresent() {
    await expect(this.unPublishSharedLibraryButton).toBeVisible();
  }

  async isPublishLibraryBtnPresent() {
    await expect(this.publishSharedLibraryButton).toBeVisible();
  }

  async clickCloseLibrariesPopUpButton() {
    await this.closeLibrariesPopUpButton.click();
  }

  async expandFileLibraryOnAccessPanel(libraryName) {
    await this.page
      .locator(
        `div[class="tool-window-bar library-bar"] span:has-text('${libraryName}')`
      )
      .click();
  }

  async isFileLibraryOnAccessPanelNotDisplayed(libraryName) {
    await expect(
      this.page.locator(
        `div[class="tool-window-bar library-bar"] span:has-text('${libraryName}')`
      )
    ).not.toBeVisible();
  }

  async clickShortcutsPanelButton() {
    await this.shortcutsPanelButton.click();
  }

  async pressShortcutsPanelShortcut() {
    await this.page.keyboard.press("Shift+?")
  }

  async closeShortcutsPanel() {
    await this.closeShortcutsPanelIcon.click();
  }

  async isShortcutsPanelDisplayed() {
    await expect(this.shortcutsPanel).toBeVisible();
  }

  async isShortcutsPanelNotDisplayed() {
    await expect(this.shortcutsPanel).not.toBeVisible();
  }

  async openCloseColorsPaletteFromSidebar() {
    await this.colorsPaletteButton.click();
  }

  async pressColorsPaletteShortcut() {
    await this.page.keyboard.press("Alt+P");
  }

  async isColorsPaletteDisplayed() {
    await expect(this.colorsPalette).toBeVisible();
  }

  async isColorsPaletteNotDisplayed() {
    await expect(this.colorsPalette).not.toBeVisible();
  }

  async clickAddStrokeButton() {
    await this.strokeSection.waitFor();
    await this.addStrokeButton.click();
  }

  async clickStrokeColorBullet() {
    await this.strokeColorBullet.click();
  }

  async hideShadow() {
    await this.shadowOption.hover();
    await this.shadowHideIcon.click();
  }

  async unhideShadow() {
    await this.shadowOption.hover();
    await this.shadowUnhideIcon.click();
  }

  async removeShadow() {
    await this.shadowOption.hover();
    await this.shadowRemoveIcon.click();
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

  async removeStroke() {
    await this.strokeRemoveIcon.click();
  }

  async setStrokeColor(value) {
    await this.clearInput(this.strokeColorInput);
    await this.strokeColorInput.fill(value);
    await this.clickOnEnter();
  }

  async setStrokePosition(value) {
    switch (value) {
      case 'Center':
        await this.strokePositionSelect.selectOption(':center');
        break;
      case 'Inside':
        await this.strokePositionSelect.selectOption(':inner');
        break;
      case 'Outside':
        await this.strokePositionSelect.selectOption(':outer');
        break;
    }
  }

  async setStrokeType(value) {
    if (await this.strokeTypeSelect.isHidden()) return;
    switch (value) {
      case 'Solid':
        await this.strokeTypeSelect.selectOption(':solid');
        break;
      case 'Dotted':
        await this.strokeTypeSelect.selectOption(':dotted');
        break;
      case 'Dashed':
        await this.strokeTypeSelect.selectOption(':dashed');
        break;
      case 'Mixed':
        await this.strokeTypeSelect.selectOption(':mixed');
        break;
    }
  }

  async setStrokeWidth(value) {
    await this.strokeWidthInput.fill(value);
    await this.clickOnEnter();
  }

  async setStrokeOpacity(value) {
    await this.strokeOpacityInput.fill(value);
    await this.clickOnEnter();
  }

  async changeStrokeSettings(color, opacity, width, position, type= '') {
    await this.setStrokeColor(color);
    await this.setStrokeOpacity(opacity);
    await this.setStrokeWidth(width);
    await this.setStrokePosition(position);
    await this.setStrokeType(type);
  }

  async backToDashboardFromFileEditor() {
    await this.clickPencilBoxButton();
    await this.isHeaderDisplayed("Projects");
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
      case 'None':
        await this.textNoneCaseIcon.click();
        break;
    }
  }

  async changeTextAlignment(value) {
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
    switch (value) {
      case 'RTL':
        await this.textIconRTL.click();
        break;
      case 'LTR':
        await this.textIconLTR.click();
        break;
    }
  }

  async createDefaultBoardByCoordinates(x, y, delayMs) {
    await this.clickCreateBoardButton();
    await this.clickViewportByCoordinates(x, y, delayMs);
    await this.waitForChangeIsSaved();
  }

  async createDefaultRectangleByCoordinates(x, y, delayMs) {
    await this.clickCreateRectangleButton();
    await this.clickViewportByCoordinates(x, y, delayMs);
    await this.waitForChangeIsSaved();
  }

  async createDefaultEllipseByCoordinates(x, y, delayMs) {
    await this.clickCreateEllipseButton();
    await this.clickViewportByCoordinates(x, y, delayMs);
    await this.waitForChangeIsSaved();
  }

  async createDefaultClosedPath(delayMs) {
    await this.clickCreatePathButton();
    await this.clickViewportByCoordinates(500, 200, delayMs);
    await this.clickViewportByCoordinates(1200, 700, delayMs);
    await this.clickViewportByCoordinates(1000, 400, delayMs);
    await this.clickViewportByCoordinates(500, 200, delayMs);
    await this.clickOnDesignPanel();
    await this.waitForChangeIsSaved();
  }

  async createDefaultOpenPath(delayMs) {
    await this.clickCreatePathButton();
    await this.clickViewportByCoordinates(500, 200, delayMs);
    await this.clickViewportByCoordinates(1200, 700, delayMs);
    await this.clickViewportByCoordinates(1000, 400, delayMs);
    await this.clickMoveButton();
    await this.waitForChangeIsSaved();
  }

  async createDefaultTextLayer(browserName, delayMs=300, x=200, y=300) {
    await this.clickCreateTextButton();
    await this.clickViewportByCoordinates(x, y, delayMs);
    if (browserName === "webkit") {
      await this.typeTextFromKeyboard();
    } else {
      await this.typeText("Hello World!");
    }
    await this.clickMoveButton();
    await this.waitForChangeIsSaved();
  }

  async createDefaultCurveLayer() {
    await this.clickCreateCurveButton();
    await this.drawCurve(900, 300, 600, 200);
    await this.clickMoveButton();
    await this.waitForChangeIsSaved();
  }

  async waitDesignTabCollapsed() {
    await expect(this.strokeSection).toBeHidden();
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
    await layerSel.last().click({ button: "right", force: true });
    await this.createAnnotationOption.click();
    await expect(this.annotationTextArea).toBeVisible();
  }

  async isAnnotationAddedToComponent(value) {
    const selector = this.page.locator(
        `div[class^="component-annotation"] div[data-replicated-value="${value}"]`
    );
    await expect(selector).toBeVisible();
  }

  async showInAssetsPanelRightClick() {
    const layerSel = this.page.locator('div[class="viewport"] [id^="shape"]');
    await layerSel.last().click({button: "right", force: true });
    await this.showInAssetsPanelOption.click();
  }

  async openInspectTab() {
    await this.inspectTab.click();
  }

  async isAnnotationExistOnInspectTab() {
    await expect(this.annotationBlockOnInspect).toBeVisible();
  }

  async changeAxisXandYForLayer(x, y) {
    await this.xAxisInput.fill(x);
    await this.yAxisInput.fill(y);
  }

};
