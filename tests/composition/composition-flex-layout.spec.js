const { expect, test } = require("@playwright/test");
const { mainTest } = require("../../fixtures");
const { MainPage } = require("../../pages/workspace/main-page");
const { LayersPanelPage } = require("../../pages/workspace/layers-panel");
const { DesignPanelPage } = require("../../pages/workspace/design-panel");
const { random } = require("../../helpers/string-generator");
const { TeamPage } = require("../../pages/dashboard/team-page");
const { DashboardPage } = require("../../pages/dashboard/dashboard-page");

const teamName = random().concat("autotest");

test.beforeEach(async ({ page }) => {
  const teamPage = new TeamPage(page);
  const dashboardPage = new DashboardPage(page);
  const mainPage = new MainPage(page);
  await teamPage.createTeam(teamName);
  await teamPage.isTeamSelected(teamName);
  await dashboardPage.createFileViaPlaceholder();
  await mainPage.isMainPageLoaded();
});

test.afterEach(async ({ page }) => {
  const teamPage = new TeamPage(page);
  const mainPage = new MainPage(page);
  await mainPage.backToDashboardFromFileEditor();
  await teamPage.deleteTeam(teamName);
});

test.describe("Flex Layout & Elements", async () => {
  test.beforeEach(async ({ page, browserName }, testInfo) => {
    testInfo.setTimeout(testInfo.timeout + 10000);
    const mainPage = new MainPage(page);
    await mainPage.clickCreateBoardButton();
    await mainPage.clickViewportTwice();
    await mainPage.waitForChangeIsSaved();
    await mainPage.isCreatedLayerVisible();
    await mainPage.changeHeightAndWidthForLayer("300", "300");
    await mainPage.clickCreateRectangleButton();
    await mainPage.clickViewportTwice();
    await mainPage.waitForChangeIsSaved();
    await mainPage.clickCreateEllipseButton();
    await mainPage.clickViewportTwice();
    await mainPage.waitForChangeIsSaved();
    await mainPage.clickCreatedBoardTitleOnCanvas();
    await mainPage.waitForChangeIsSaved();
  });

  mainTest(
    "FL-1 Add flex layout to board from rightclick",
    async ({ page }) => {
      const mainPage = new MainPage(page);
      await mainPage.addFlexLayoutViaRightClick();
      await mainPage.waitForChangeIsSaved();
      await mainPage.isLayoutIconVisibleOnLayer();
      await mainPage.isLayoutMenuExpanded();
      await expect(mainPage.viewport).toHaveScreenshot(
        "board-with-layout.png",
        {
          mask: [mainPage.guides],
        },
      );
    },
  );

  mainTest("FL-2 Add flex layout to board from shortcut", async ({ page }) => {
    const mainPage = new MainPage(page);
    await mainPage.pressFlexLayoutShortcut();
    await mainPage.waitForChangeIsSaved();
    await mainPage.isLayoutIconVisibleOnLayer();
    await mainPage.isLayoutMenuExpanded();
    await expect(mainPage.viewport).toHaveScreenshot("board-with-layout.png", {
      mask: [mainPage.guides],
    });
  });

  mainTest(
    "FL-4 Remove flex layout from board from rightclick",
    async ({ page }) => {
      const mainPage = new MainPage(page);
      await mainPage.addFlexLayoutViaRightClick();
      await mainPage.waitForChangeIsSaved();
      await mainPage.isLayoutIconVisibleOnLayer();
      await mainPage.isLayoutMenuExpanded();
      await expect(mainPage.viewport).toHaveScreenshot(
        "board-with-layout.png",
        {
          mask: [mainPage.guides],
        },
      );
      await mainPage.clickCreatedBoardTitleOnCanvas();
      await mainPage.removeFlexLayoutViaRightClick();
      await mainPage.waitForChangeIsSaved();
      await mainPage.isLayoutIconVisibleOnLayer(false);
      await mainPage.isLayoutMenuExpanded(false);
      await expect(mainPage.viewport).toHaveScreenshot(
        "board-without-layout.png",
        {
          mask: [mainPage.guides],
        },
      );
    },
  );

  mainTest(
    "FL-5 Remove flex layout from board from shortcut",
    async ({ page }) => {
      const mainPage = new MainPage(page);
      await mainPage.pressFlexLayoutShortcut();
      await mainPage.waitForChangeIsSaved();
      await mainPage.isLayoutIconVisibleOnLayer();
      await mainPage.isLayoutMenuExpanded();
      await expect(mainPage.viewport).toHaveScreenshot(
        "board-with-layout.png",
        {
          mask: [mainPage.guides],
        },
      );
      await mainPage.clickCreatedBoardTitleOnCanvas();
      await mainPage.pressFlexLayoutShortcut();
      await mainPage.waitForChangeIsSaved();
      await mainPage.isLayoutIconVisibleOnLayer(false);
      await mainPage.isLayoutMenuExpanded(false);
      await expect(mainPage.viewport).toHaveScreenshot(
        "board-without-layout.png",
        {
          mask: [mainPage.guides],
        },
      );
    },
  );

  mainTest(
    "FL-6 Remove flex layout from board from Design panel",
    async ({ page }) => {
      const mainPage = new MainPage(page);
      await mainPage.addFlexLayoutViaRightClick();
      await mainPage.waitForChangeIsSaved();
      await mainPage.isLayoutIconVisibleOnLayer();
      await mainPage.isLayoutMenuExpanded();
      await expect(mainPage.viewport).toHaveScreenshot(
        "board-with-layout.png",
        {
          mask: [mainPage.guides],
        },
      );
      await mainPage.clickCreatedBoardTitleOnCanvas();
      await mainPage.removeLayoutFromDesignPanel();
      await mainPage.waitForChangeIsSaved();
      await mainPage.isLayoutIconVisibleOnLayer(false);
      await mainPage.isLayoutMenuExpanded(false);
      await expect(mainPage.viewport).toHaveScreenshot(
        "board-without-layout.png",
        {
          mask: [mainPage.guides],
        },
      );
    },
  );

  mainTest("FL-7 Change direction", async ({ page }) => {
    const mainPage = new MainPage(page);
    await mainPage.addFlexLayoutViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await mainPage.isLayoutIconVisibleOnLayer();
    await mainPage.isLayoutMenuExpanded();
    await expect(mainPage.viewport).toHaveScreenshot("board-with-layout.png", {
      mask: [mainPage.guides],
    });
    await mainPage.clickCreatedBoardTitleOnCanvas();
    await mainPage.changeLayoutDirection("Row reverse");
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot(
      "layout-row-reverse-direction.png",
      {
        mask: [mainPage.guides],
      },
    );
    await mainPage.changeLayoutDirection("Column");
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot(
      "layout-column-direction.png",
      {
        mask: [mainPage.guides],
      },
    );
    await mainPage.changeLayoutDirection("Column reverse");
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot(
      "layout-column-reverse-direction.png",
      {
        mask: [mainPage.guides],
      },
    );
    await mainPage.changeLayoutDirection("Row");
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot(
      "layout-row-direction.png",
      {
        mask: [mainPage.guides],
      },
    );
  });

  mainTest("FL-9 Change alignment", async ({ page }) => {
    const mainPage = new MainPage(page);
    await mainPage.addFlexLayoutViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await mainPage.isLayoutIconVisibleOnLayer();
    await mainPage.isLayoutMenuExpanded();
    await expect(mainPage.viewport).toHaveScreenshot("board-with-layout.png", {
      mask: [mainPage.guides],
    });
    await mainPage.clickCreatedBoardTitleOnCanvas();
    await mainPage.changeLayoutAlignment("Center");
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot(
      "layout-align-center.png",
      {
        mask: [mainPage.guides],
      },
    );
    await mainPage.changeLayoutAlignment("End");
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot("layout-align-end.png", {
      mask: [mainPage.guides],
    });
    await mainPage.changeLayoutAlignment("Start");
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot("layout-align-start.png", {
      mask: [mainPage.guides],
    });
  });

  mainTest("FL-10 Change justification", async ({ page }) => {
    const mainPage = new MainPage(page);
    await mainPage.addFlexLayoutViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await mainPage.isLayoutIconVisibleOnLayer();
    await mainPage.isLayoutMenuExpanded();
    await expect(mainPage.viewport).toHaveScreenshot("board-with-layout.png", {
      mask: [mainPage.guides],
    });
    await mainPage.clickCreatedBoardTitleOnCanvas();
    await mainPage.changeLayoutJustification("Center");
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot(
      "layout-justify-center.png",
      {
        mask: [mainPage.guides],
      },
    );
    await mainPage.changeLayoutJustification("End");
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot("layout-justify-end.png", {
      mask: [mainPage.guides],
    });
    await mainPage.changeLayoutJustification("Space between");
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot(
      "layout-justify-space-between.png",
      {
        mask: [mainPage.guides],
      },
    );
    await mainPage.changeLayoutJustification("Space around");
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot(
      "layout-justify-space-around.png",
      {
        mask: [mainPage.guides],
      },
    );
    await mainPage.changeLayoutJustification("Space evenly");
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot(
      "layout-justify-space-evenly.png",
      {
        mask: [mainPage.guides],
      },
    );
    await mainPage.changeLayoutJustification("Start");
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot(
      "layout-justify-start.png",
      {
        mask: [mainPage.guides],
      },
    );
  });

  mainTest("FL-12 Change column gap", async ({ page }) => {
    const mainPage = new MainPage(page);
    await mainPage.addFlexLayoutViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await mainPage.isLayoutIconVisibleOnLayer();
    await mainPage.isLayoutMenuExpanded();
    await expect(mainPage.viewport).toHaveScreenshot("board-with-layout.png", {
      mask: [mainPage.guides],
    });
    await mainPage.clickCreatedBoardTitleOnCanvas();
    await mainPage.changeLayoutColumnGap("5");
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot(
      "layout-column-gap-5.png",
      {
        mask: [mainPage.guides],
      },
    );
    await mainPage.changeLayoutColumnGap("15");
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot(
      "layout-column-gap-15.png",
      {
        mask: [mainPage.guides],
      },
    );
    await mainPage.changeLayoutColumnGap("0");
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot(
      "layout-column-gap-0.png",
      {
        mask: [mainPage.guides],
      },
    );
  });

  mainTest("FL-13 Change row gap", async ({ page }) => {
    const mainPage = new MainPage(page);
    await mainPage.addFlexLayoutViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await mainPage.isLayoutIconVisibleOnLayer();
    await mainPage.isLayoutMenuExpanded();
    await expect(mainPage.viewport).toHaveScreenshot("board-with-layout.png", {
      mask: [mainPage.guides],
    });
    await mainPage.clickCreatedBoardTitleOnCanvas();
    await mainPage.changeLayoutDirection("Column");
    await mainPage.waitForChangeIsSaved();
    await mainPage.changeLayoutRowGap("5");
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot("layout-row-gap-5.png", {
      mask: [mainPage.guides],
    });
    await mainPage.changeLayoutRowGap("15");
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot("layout-row-gap-15.png", {
      mask: [mainPage.guides],
    });
    await mainPage.changeLayoutRowGap("0");
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot("layout-row-gap-0.png", {
      mask: [mainPage.guides],
    });
  });

  mainTest("FL-14 Change single padding", async ({ page }) => {
    const mainPage = new MainPage(page);
    await mainPage.addFlexLayoutViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await mainPage.isLayoutIconVisibleOnLayer();
    await mainPage.isLayoutMenuExpanded();
    await expect(mainPage.viewport).toHaveScreenshot("board-with-layout.png", {
      mask: [mainPage.guides],
    });
    await mainPage.clickCreatedBoardTitleOnCanvas();
    await mainPage.changeLayoutVerticalPadding("5");
    await mainPage.waitForChangeIsSaved();
    await mainPage.changeLayoutHorizontalPadding("15");
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot(
      "layout-padding-5-15.png",
      {
        mask: [mainPage.guides],
      },
    );
    await mainPage.changeLayoutHorizontalPadding("0");
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot(
      "layout-horizontal_padding-0.png",
      {
        mask: [mainPage.guides],
      },
    );
    await mainPage.changeLayoutVerticalPadding("0");
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot(
      "layout-vertical_padding-0.png",
      {
        mask: [mainPage.guides],
      },
    );
  });

  mainTest("FL-15 Change multiple padding", async ({ page }) => {
    const mainPage = new MainPage(page);
    await mainPage.addFlexLayoutViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await mainPage.isLayoutIconVisibleOnLayer();
    await mainPage.isLayoutMenuExpanded();
    await expect(mainPage.viewport).toHaveScreenshot("board-with-layout.png", {
      mask: [mainPage.guides],
    });
    await mainPage.clickCreatedBoardTitleOnCanvas();
    await mainPage.switchToIndependentPadding();
    await mainPage.waitForChangeIsSaved();
    await mainPage.changeLayoutTopPadding("10");
    await mainPage.waitForChangeIsSaved();
    await mainPage.changeLayoutLeftPadding("15");
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot(
      "layout-top-left-padding-10-15.png",
      {
        mask: [mainPage.guides],
      },
    );
    await mainPage.changeLayoutJustification("End");
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot(
      "layout-top-left-padding-10-15-justify.png",
      {
        mask: [mainPage.guides],
      },
    );
    await mainPage.changeLayoutRightPadding("20");
    await mainPage.waitForChangeIsSaved();
    await mainPage.changeLayoutAlignment("End");
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot(
      "layout-top-left-right-padding-justify-align.png",
      {
        mask: [mainPage.guides],
      },
    );
    await mainPage.changeLayoutBottomPadding("25");
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot(
      "layout-top-left-right-bottom-padding.png",
      {
        mask: [mainPage.guides],
      },
    );
  });

  mainTest("FL-21 Flex elements change - alignment", async ({ page }) => {
    const mainPage = new MainPage(page);
    const layersPage = new LayersPanelPage(page);
    const designPanelPage = new DesignPanelPage(page);

    await mainPage.addFlexLayoutViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await mainPage.isLayoutIconVisibleOnLayer();
    await mainPage.isLayoutMenuExpanded();
    await expect(mainPage.viewport).toHaveScreenshot("board-with-layout.png", {
      mask: [mainPage.guides],
    });

    await layersPage.selectBoardChildRect();
    await designPanelPage.waitFlexElementSectionExpanded();
    await designPanelPage.changeFlexElementAlignment("Center");
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot(
      "flex-element-align-center.png",
      {
        mask: [mainPage.guides],
      },
    );
    await designPanelPage.changeFlexElementAlignment("End");
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot(
      "flex-element-align-end.png",
      {
        mask: [mainPage.guides],
      },
    );
    await designPanelPage.changeFlexElementAlignment("Start");
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot(
      "flex-element-align-start.png",
      {
        mask: [mainPage.guides],
      },
    );
  });

  mainTest("FL-22 Flex elements - change margin single", async ({ page }) => {
    const mainPage = new MainPage(page);
    const layersPage = new LayersPanelPage(page);
    const designPanelPage = new DesignPanelPage(page);

    await mainPage.addFlexLayoutViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await mainPage.isLayoutIconVisibleOnLayer();
    await mainPage.isLayoutMenuExpanded();
    await expect(mainPage.viewport).toHaveScreenshot("board-with-layout.png", {
      mask: [mainPage.guides],
    });

    await layersPage.selectBoardChildRect();
    await designPanelPage.waitFlexElementSectionExpanded();
    await designPanelPage.changeFlexElementVerticalMargin("10");
    await mainPage.waitForChangeIsSaved();
    await designPanelPage.changeFlexElementHorizontalMargin("25");
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot(
      "flex-element-margin-10-25.png",
      {
        mask: [mainPage.guides],
      },
    );
    await designPanelPage.changeFlexElementVerticalMargin("0");
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot(
      "flex-element-margin-vert-0.png",
      {
        mask: [mainPage.guides],
      },
    );
    await designPanelPage.changeFlexElementHorizontalMargin("0");
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot(
      "flex-element-margin-horizont-0.png",
      {
        mask: [mainPage.guides],
      },
    );
  });
});

test.describe("Margins & Paddings & Position", async () => {
  test.beforeEach(async ({ page, browserName }, testInfo) => {
    testInfo.setTimeout(testInfo.timeout + 10000);
    const mainPage = new MainPage(page);
    await mainPage.clickCreateBoardButton();
    await mainPage.clickViewportTwice();
    await mainPage.waitForChangeIsSaved();
    await mainPage.isCreatedLayerVisible();
    await mainPage.changeHeightAndWidthForLayer("500", "500");
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
    await expect(mainPage.viewport).toHaveScreenshot(
      "layout-padding-gap-0.png",
      {
        mask: [mainPage.guides],
      },
    );
    await mainPage.clickLayoutVerticalPaddingField();
    await expect(mainPage.viewport).toHaveScreenshot(
      "layout-no-vertical-padding.png",
      {
        mask: [mainPage.guides],
      },
    );
    await mainPage.clickLayoutHorizontalPaddingField();
    await expect(mainPage.viewport).toHaveScreenshot(
      "layout-no-horizont-padding.png",
      {
        mask: [mainPage.guides],
      },
    );
    await mainPage.clickLayoutColumnGapField();
    await expect(mainPage.viewport).toHaveScreenshot(
      "layout-no-column-gap.png",
      {
        mask: [mainPage.guides],
      },
    );
  });

  mainTest("FL-39 Gap click highlight", async ({ page }) => {
    const mainPage = new MainPage(page);
    await mainPage.changeLayoutColumnGap("20");
    await mainPage.waitForChangeIsSaved();
    await mainPage.clickLayoutColumnGapField();
    await expect(mainPage.viewport).toHaveScreenshot(
      "layout-column-gap-highlighted.png",
      {
        mask: [mainPage.guides],
      },
    );
  });

  mainTest(
    "FL-42 Use absolute position and look if element still inside a board",
    async ({ page }) => {
      const mainPage = new MainPage(page);
      const layersPage = new LayersPanelPage(page);
      const designPanelPage = new DesignPanelPage(page);

      await layersPage.selectBoardChildEllipse();
      await designPanelPage.waitFlexElementSectionExpanded();
      await designPanelPage.setFlexElementPositionAbsolute();
      await mainPage.waitForChangeIsSaved();
      await expect(mainPage.viewport).toHaveScreenshot(
        "flex-element-position-absolute.png",
        {
          mask: [mainPage.guides],
        },
      );
    },
  );
});
