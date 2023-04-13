const { expect } = require("@playwright/test");
const { mainTest } = require("../../fixtures");
const { MainPage } = require("../../pages/main-page");
const { LayersPage } = require("../../pages/workspace/layers");
const { DesignPanelPage} = require("../../pages/workspace/design-panel");

mainTest.describe("Flex Layout & Elements", async () => {
    mainTest.beforeEach(async ({ page }) => {
        const mainPage = new MainPage(page);
        await mainPage.clickCreateBoardButton();
        await mainPage.clickViewportTwice();
        await mainPage.waitForChangeIsSaved();
        await mainPage.isCreatedLayerVisible();
        await mainPage.changeHeightAndWidthForLayer("300", "300");
        await mainPage.waitForChangeIsSaved();
        await mainPage.clickCreateRectangleButton();
        await mainPage.clickViewportTwice();
        await mainPage.waitForChangeIsSaved();
        await mainPage.clickCreateEllipseButton();
        await mainPage.clickViewportTwice();
        await mainPage.waitForChangeIsSaved();
        await mainPage.clickCreatedBoardTitleOnCanvas();
    });

    mainTest("FL-1 Add flex layout to board from rightclick", async ({ page }) => {
        const mainPage = new MainPage(page);
        await mainPage.addFlexLayoutViaRightClick();
        await mainPage.waitForChangeIsSaved();
        await mainPage.isLayoutIconVisibleOnLayer();
        await mainPage.isLayoutMenuExpanded();
        await expect(mainPage.viewport).toHaveScreenshot("board-with-layout.png");
    });

    mainTest("FL-2 Add flex layout to board from shortcut", async ({ page }) => {
        const mainPage = new MainPage(page);
        await mainPage.pressFlexLayoutShortcut();
        await mainPage.waitForChangeIsSaved();
        await mainPage.isLayoutIconVisibleOnLayer();
        await mainPage.isLayoutMenuExpanded();
        await expect(mainPage.viewport).toHaveScreenshot("board-with-layout.png");
    });

    mainTest(
        "FL-4 Remove flex layout from board from rightclick",
        async ({ page }) => {
            const mainPage = new MainPage(page);
            await mainPage.addFlexLayoutViaRightClick();
            await mainPage.waitForChangeIsSaved();
            await mainPage.isLayoutIconVisibleOnLayer();
            await mainPage.isLayoutMenuExpanded();
            await expect(mainPage.viewport).toHaveScreenshot("board-with-layout.png");
            await mainPage.clickCreatedBoardTitleOnCanvas();
            await mainPage.removeFlexLayoutViaRightClick();
            await mainPage.waitForChangeIsSaved();
            await mainPage.isLayoutIconVisibleOnLayer(false);
            await mainPage.isLayoutMenuExpanded(false);
            await expect(mainPage.viewport).toHaveScreenshot(
                "board-without-layout.png"
            );
        }
    );

    mainTest(
        "FL-5 Remove flex layout from board from shortcut",
        async ({ page }) => {
            const mainPage = new MainPage(page);
            await mainPage.pressFlexLayoutShortcut();
            await mainPage.waitForChangeIsSaved();
            await mainPage.isLayoutIconVisibleOnLayer();
            await mainPage.isLayoutMenuExpanded();
            await expect(mainPage.viewport).toHaveScreenshot("board-with-layout.png");
            await mainPage.clickCreatedBoardTitleOnCanvas();
            await mainPage.pressFlexLayoutShortcut();
            await mainPage.waitForChangeIsSaved();
            await mainPage.isLayoutIconVisibleOnLayer(false);
            await mainPage.isLayoutMenuExpanded(false);
            await expect(mainPage.viewport).toHaveScreenshot(
                "board-without-layout.png"
            );
        }
    );

    mainTest(
        "FL-6 Remove flex layout from board from Design panel",
        async ({ page }) => {
            const mainPage = new MainPage(page);
            await mainPage.pressFlexLayoutShortcut();
            await mainPage.waitForChangeIsSaved();
            await mainPage.isLayoutIconVisibleOnLayer();
            await mainPage.isLayoutMenuExpanded();
            await expect(mainPage.viewport).toHaveScreenshot("board-with-layout.png");
            await mainPage.clickCreatedBoardTitleOnCanvas();
            await mainPage.removeLayoutFromDesignPanel();
            await mainPage.waitForChangeIsSaved();
            await mainPage.isLayoutIconVisibleOnLayer(false);
            await mainPage.isLayoutMenuExpanded(false);
            await expect(mainPage.viewport).toHaveScreenshot(
                "board-without-layout.png"
            );
        }
    );

    mainTest("FL-7 Change direction", async ({ page }) => {
        const mainPage = new MainPage(page);
        await mainPage.pressFlexLayoutShortcut();
        await mainPage.waitForChangeIsSaved();
        await mainPage.isLayoutIconVisibleOnLayer();
        await mainPage.isLayoutMenuExpanded();
        await expect(mainPage.viewport).toHaveScreenshot("board-with-layout.png");
        await mainPage.clickCreatedBoardTitleOnCanvas();
        await mainPage.changeLayoutDirection("Row reverse");
        await mainPage.waitForChangeIsSaved();
        await expect(mainPage.viewport).toHaveScreenshot(
            "layout-row-reverse-direction.png"
        );
        await mainPage.changeLayoutDirection("Column");
        await mainPage.waitForChangeIsSaved();
        await expect(mainPage.viewport).toHaveScreenshot(
            "layout-column-direction.png"
        );
        await mainPage.changeLayoutDirection("Column reverse");
        await mainPage.waitForChangeIsSaved();
        await expect(mainPage.viewport).toHaveScreenshot(
            "layout-column-reverse-direction.png"
        );
        await mainPage.changeLayoutDirection("Row");
        await mainPage.waitForChangeIsSaved();
        await expect(mainPage.viewport).toHaveScreenshot("layout-row-direction.png");
    });

    mainTest("FL-9 Change alignment", async ({ page }) => {
        const mainPage = new MainPage(page);
        await mainPage.pressFlexLayoutShortcut();
        await mainPage.waitForChangeIsSaved();
        await mainPage.isLayoutIconVisibleOnLayer();
        await mainPage.isLayoutMenuExpanded();
        await expect(mainPage.viewport).toHaveScreenshot("board-with-layout.png");
        await mainPage.clickCreatedBoardTitleOnCanvas();
        await mainPage.changeLayoutAlignment("Center");
        await mainPage.waitForChangeIsSaved();
        await expect(mainPage.viewport).toHaveScreenshot("layout-align-center.png");
        await mainPage.changeLayoutAlignment("End");
        await mainPage.waitForChangeIsSaved();
        await expect(mainPage.viewport).toHaveScreenshot("layout-align-end.png");
        await mainPage.changeLayoutAlignment("Start");
        await mainPage.waitForChangeIsSaved();
        await expect(mainPage.viewport).toHaveScreenshot("layout-align-start.png");
    });

    mainTest("FL-10 Change justification", async ({ page }) => {
        const mainPage = new MainPage(page);
        await mainPage.pressFlexLayoutShortcut();
        await mainPage.waitForChangeIsSaved();
        await mainPage.isLayoutIconVisibleOnLayer();
        await mainPage.isLayoutMenuExpanded();
        await expect(mainPage.viewport).toHaveScreenshot("board-with-layout.png");
        await mainPage.clickCreatedBoardTitleOnCanvas();
        await mainPage.changeLayoutJustification("Center");
        await mainPage.waitForChangeIsSaved();
        await expect(mainPage.viewport).toHaveScreenshot("layout-justify-center.png");
        await mainPage.changeLayoutJustification("End");
        await mainPage.waitForChangeIsSaved();
        await expect(mainPage.viewport).toHaveScreenshot("layout-justify-end.png");
        await mainPage.changeLayoutJustification("Space between");
        await mainPage.waitForChangeIsSaved();
        await expect(mainPage.viewport).toHaveScreenshot(
            "layout-justify-space-between.png"
        );
        await mainPage.changeLayoutJustification("Space around");
        await mainPage.waitForChangeIsSaved();
        await expect(mainPage.viewport).toHaveScreenshot(
            "layout-justify-space-around.png"
        );
        await mainPage.changeLayoutJustification("Space evenly");
        await mainPage.waitForChangeIsSaved();
        await expect(mainPage.viewport).toHaveScreenshot(
            "layout-justify-space-evenly.png"
        );
        await mainPage.changeLayoutJustification("Start");
        await mainPage.waitForChangeIsSaved();
        await expect(mainPage.viewport).toHaveScreenshot("layout-justify-start.png");
    });

    mainTest("FL-12 Change column gap", async ({ page }) => {
        const mainPage = new MainPage(page);
        await mainPage.pressFlexLayoutShortcut();
        await mainPage.waitForChangeIsSaved();
        await mainPage.isLayoutIconVisibleOnLayer();
        await mainPage.isLayoutMenuExpanded();
        await expect(mainPage.viewport).toHaveScreenshot("board-with-layout.png");
        await mainPage.clickCreatedBoardTitleOnCanvas();
        await mainPage.changeLayoutColumnGap("5");
        await mainPage.waitForChangeIsSaved();
        await expect(mainPage.viewport).toHaveScreenshot("layout-column-gap-5.png");
        await mainPage.changeLayoutColumnGap("15");
        await mainPage.waitForChangeIsSaved();
        await expect(mainPage.viewport).toHaveScreenshot("layout-column-gap-15.png");
        await mainPage.changeLayoutColumnGap("0");
        await mainPage.waitForChangeIsSaved();
        await expect(mainPage.viewport).toHaveScreenshot("layout-column-gap-0.png");
    });

    mainTest("FL-13 Change row gap", async ({ page }) => {
        const mainPage = new MainPage(page);
        await mainPage.pressFlexLayoutShortcut();
        await mainPage.waitForChangeIsSaved();
        await mainPage.isLayoutIconVisibleOnLayer();
        await mainPage.isLayoutMenuExpanded();
        await expect(mainPage.viewport).toHaveScreenshot("board-with-layout.png");
        await mainPage.clickCreatedBoardTitleOnCanvas();
        await mainPage.changeLayoutDirection("Column");
        await mainPage.waitForChangeIsSaved();
        await mainPage.changeLayoutRowGap("5");
        await mainPage.waitForChangeIsSaved();
        await expect(mainPage.viewport).toHaveScreenshot("layout-row-gap-5.png");
        await mainPage.changeLayoutRowGap("15");
        await mainPage.waitForChangeIsSaved();
        await expect(mainPage.viewport).toHaveScreenshot("layout-row-gap-15.png");
        await mainPage.changeLayoutRowGap("0");
        await mainPage.waitForChangeIsSaved();
        await expect(mainPage.viewport).toHaveScreenshot("layout-row-gap-0.png");
    });

    mainTest("FL-14 Change single padding", async ({ page }) => {
        const mainPage = new MainPage(page);
        await mainPage.pressFlexLayoutShortcut();
        await mainPage.waitForChangeIsSaved();
        await mainPage.isLayoutIconVisibleOnLayer();
        await mainPage.isLayoutMenuExpanded();
        await expect(mainPage.viewport).toHaveScreenshot("board-with-layout.png");
        await mainPage.clickCreatedBoardTitleOnCanvas();
        await mainPage.changeLayoutVerticalPadding("5");
        await mainPage.waitForChangeIsSaved();
        await mainPage.changeLayoutHorizontalPadding("15");
        await mainPage.waitForChangeIsSaved();
        await expect(mainPage.viewport).toHaveScreenshot("layout-padding-5-15.png");
        await mainPage.changeLayoutHorizontalPadding("0");
        await mainPage.waitForChangeIsSaved();
        await expect(mainPage.viewport).toHaveScreenshot(
            "layout-horizontal_padding-0.png"
        );
        await mainPage.changeLayoutVerticalPadding("0");
        await mainPage.waitForChangeIsSaved();
        await expect(mainPage.viewport).toHaveScreenshot(
            "layout-vertical_padding-0.png"
        );
    });

    mainTest("FL-15 Change multiple padding", async ({ page }) => {
        const mainPage = new MainPage(page);
        await mainPage.pressFlexLayoutShortcut();
        await mainPage.waitForChangeIsSaved();
        await mainPage.isLayoutIconVisibleOnLayer();
        await mainPage.isLayoutMenuExpanded();
        await expect(mainPage.viewport).toHaveScreenshot("board-with-layout.png");
        await mainPage.clickCreatedBoardTitleOnCanvas();
        await mainPage.switchToIndependentPadding();
        await mainPage.waitForChangeIsSaved();
        await mainPage.changeLayoutTopPadding("10");
        await mainPage.waitForChangeIsSaved();
        await mainPage.changeLayoutLeftPadding("15");
        await mainPage.waitForChangeIsSaved();
        await expect(mainPage.viewport).toHaveScreenshot("layout-top-left-padding-10-15.png");
        await mainPage.changeLayoutJustification("End");
        await mainPage.waitForChangeIsSaved();
        await expect(mainPage.viewport).toHaveScreenshot("layout-top-left-padding-10-15-justify.png");
        await mainPage.changeLayoutRightPadding("20");
        await mainPage.waitForChangeIsSaved();
        await mainPage.changeLayoutAlignment('End');
        await mainPage.waitForChangeIsSaved();
        await expect(mainPage.viewport).toHaveScreenshot("layout-top-left-right-padding-justify-align.png");
        await mainPage.changeLayoutBottomPadding("25");
        await mainPage.waitForChangeIsSaved();
        await expect(mainPage.viewport).toHaveScreenshot("layout-top-left-right-bottom-padding.png");
    });


    mainTest("FL-21 Flex elements change - alignment", async ({ page }) => {
        const mainPage = new MainPage(page);
        const layersPage = new LayersPage(page);
        const designPanelPage = new DesignPanelPage(page);

        await mainPage.pressFlexLayoutShortcut();
        await mainPage.waitForChangeIsSaved();
        await mainPage.isLayoutIconVisibleOnLayer();
        await mainPage.isLayoutMenuExpanded();
        await expect(mainPage.viewport).toHaveScreenshot("board-with-layout.png");

        await layersPage.selectBoardChildRect();
        await designPanelPage.waitFlexElementSectionExpanded();
        await designPanelPage.changeFlexElementAlignment("Center");
        await mainPage.waitForChangeIsSaved();
        await expect(mainPage.viewport).toHaveScreenshot("flex-element-align-center.png");
        await designPanelPage.changeFlexElementAlignment("End");
        await mainPage.waitForChangeIsSaved();
        await expect(mainPage.viewport).toHaveScreenshot("flex-element-align-end.png");
        await designPanelPage.changeFlexElementAlignment("Start");
        await mainPage.waitForChangeIsSaved();
        await expect(mainPage.viewport).toHaveScreenshot("flex-element-align-start.png");
    });

    mainTest("FL-22 Flex elements - change margin single", async ({ page }) => {
        const mainPage = new MainPage(page);
        const layersPage = new LayersPage(page);
        const designPanelPage = new DesignPanelPage(page);

        await mainPage.pressFlexLayoutShortcut();
        await mainPage.waitForChangeIsSaved();
        await mainPage.isLayoutIconVisibleOnLayer();
        await mainPage.isLayoutMenuExpanded();
        await expect(mainPage.viewport).toHaveScreenshot("board-with-layout.png");

        await layersPage.selectBoardChildRect();
        await designPanelPage.waitFlexElementSectionExpanded();
        await designPanelPage.changeFlexElementVerticalMargin("10");
        await mainPage.waitForChangeIsSaved();
        await designPanelPage.changeFlexElementHorizontalMargin("25");
        await mainPage.waitForChangeIsSaved();
        await expect(mainPage.viewport).toHaveScreenshot("flex-element-margin-10-25.png");
        await designPanelPage.changeFlexElementVerticalMargin("0");
        await mainPage.waitForChangeIsSaved();
        await expect(mainPage.viewport).toHaveScreenshot("flex-element-margin-vert-0.png");
        await designPanelPage.changeFlexElementHorizontalMargin("0");
        await mainPage.waitForChangeIsSaved();
        await expect(mainPage.viewport).toHaveScreenshot("flex-element-margin-horizont-0.png");
    });

});

mainTest.describe("Margins & Paddings & Position", async () => {
    mainTest.beforeEach(async ({ page }) => {
        const mainPage = new MainPage(page);
        await mainPage.clickCreateBoardButton();
        await mainPage.clickViewportTwice();
        await mainPage.waitForChangeIsSaved();
        await mainPage.isCreatedLayerVisible();
        await mainPage.changeHeightAndWidthForLayer("500", "500");
        await mainPage.waitForChangeIsSaved();
        await mainPage.clickCreateEllipseButton();
        await mainPage.clickViewportTwice();
        await mainPage.waitForChangeIsSaved();
        await mainPage.clickCreateEllipseButton();
        await mainPage.clickViewportTwice();
        await mainPage.waitForChangeIsSaved();
        await mainPage.clickCreateEllipseButton();
        await mainPage.clickViewportTwice();
        await mainPage.waitForChangeIsSaved();
        await mainPage.clickCreatedBoardTitleOnCanvas();
        await mainPage.addFlexLayoutViaRightClick();
        await mainPage.waitForChangeIsSaved();
    });

    mainTest("FL-37 Set margins and padding to 0", async ({ page }) => {
        const mainPage = new MainPage(page);
        await mainPage.changeLayoutVerticalPadding("0");
        await mainPage.waitForChangeIsSaved();
        await mainPage.changeLayoutHorizontalPadding("0");
        await mainPage.waitForChangeIsSaved();
        await mainPage.changeLayoutColumnGap("0");
        await mainPage.waitForChangeIsSaved();
        await expect(mainPage.viewport).toHaveScreenshot("layout-padding-gap-0.png");
        await mainPage.clickLayoutVerticalPaddingField();
        await expect(mainPage.viewport).toHaveScreenshot("layout-no-vertical-padding.png");
        await mainPage.clickLayoutHorizontalPaddingField();
        await expect(mainPage.viewport).toHaveScreenshot("layout-no-horizont-padding.png");
        await mainPage.clickLayoutColumnGapField();
        await expect(mainPage.viewport).toHaveScreenshot("layout-no-column-gap.png");
    });

    mainTest("FL-39 Gap click highlight", async ({ page }) => {
        const mainPage = new MainPage(page);
        await mainPage.changeLayoutColumnGap("20");
        await mainPage.waitForChangeIsSaved();
        await mainPage.clickLayoutColumnGapField();
        await expect(mainPage.viewport).toHaveScreenshot("layout-column-gap-highlighted.png");
    });

    mainTest("FL-42 Use absolute position and look if element still inside a board",
        async ({ page }) => {
        const mainPage = new MainPage(page);
        const layersPage = new LayersPage(page);
        const designPanelPage = new DesignPanelPage(page);

        await layersPage.selectBoardChildEllipse();
        await designPanelPage.waitFlexElementSectionExpanded();
        await designPanelPage.setFlexElementPositionAbsolute();
        await mainPage.waitForChangeIsSaved();
        await expect(mainPage.viewport).toHaveScreenshot("flex-element-position-absolute.png");
        });

});
