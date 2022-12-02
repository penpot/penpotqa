const { mainTest } = require("../fixtures");
const { MainPage } = require("../pages/main-page");
const { expect } = require("@playwright/test");

mainTest(
  "CO-329 Add nodes (via Node panel and SHIFT++ shortcut)",
  async ({ page }) => {
    const mainPage = new MainPage(page);
    await mainPage.clickCreateEllipseButton();
    await mainPage.clickViewport();
    await mainPage.waitForChangeIsSaved();
    await mainPage.transformToPathViaRightclick();
    await mainPage.waitForChangeIsSaved();
    await mainPage.openNodesPanelViaRightclick();
    await mainPage.holdShiftKeyboardButton();
    await mainPage.clickFirstNode();
    await mainPage.clickSecondNode();
    await mainPage.releaseShiftKeyboardButton();
    await mainPage.clickAddNodeButtonOnNodePanel();
    await mainPage.waitForChangeIsSaved();
    await expect(page).toHaveScreenshot("path-added-one-node.png", {
      mask: [mainPage.usersSection],
    });
    await mainPage.clickFourthNode();
    await mainPage.holdShiftKeyboardButton();
    await mainPage.clickFifthNode();
    await mainPage.releaseShiftKeyboardButton();
    await mainPage.pressShiftPlusKeyboardShortcut();
    await mainPage.waitForChangeIsSaved();
    await expect(page).toHaveScreenshot("path-added-two-nodes.png", {
      mask: [mainPage.usersSection],
    });
  }
);

mainTest(
  "CO-330 Delete node (via Node panel and Del shortcut)",
  async ({ page }) => {
    const mainPage = new MainPage(page);
    await mainPage.clickCreateEllipseButton();
    await mainPage.clickViewport();
    await mainPage.waitForChangeIsSaved();
    await mainPage.transformToPathViaRightclick();
    await mainPage.waitForChangeIsSaved();
    await mainPage.openNodesPanelViaRightclick();
    await mainPage.clickFirstNode();
    await mainPage.clickDeleteNodeButtonOnNodePanel();
    await mainPage.waitForChangeIsSaved();
    await expect(page).toHaveScreenshot("path-deleted-one-node.png", {
      mask: [mainPage.usersSection],
    });
    await mainPage.clickSecondNode();
    await mainPage.pressDeleteKeyboardButton();
    await mainPage.waitForChangeIsSaved();
    await expect(page).toHaveScreenshot("path-deleted-two-nodes.png", {
      mask: [mainPage.usersSection],
    });
  }
);

mainTest(
  "CO-332 Merge nodes (via Node panel and CTRL+J shortcut)",
  async ({ page }) => {
    const mainPage = new MainPage(page);
    await mainPage.clickCreateEllipseButton();
    await mainPage.clickViewport();
    await mainPage.waitForChangeIsSaved();
    await mainPage.transformToPathViaRightclick();
    await mainPage.waitForChangeIsSaved();
    await mainPage.openNodesPanelViaRightclick();
    await mainPage.holdShiftKeyboardButton();
    await mainPage.clickFirstNode();
    await mainPage.clickSecondNode();
    await mainPage.releaseShiftKeyboardButton();
    await mainPage.clickMergeNodesButtonOnNodePanel();
    await mainPage.waitForChangeIsSaved();
    await expect(page).toHaveScreenshot("path-merged-nodes-once.png", {
      mask: [mainPage.usersSection],
    });
    await mainPage.holdShiftKeyboardButton();
    await mainPage.clickFirstNode();
    await mainPage.clickSecondNode();
    await mainPage.releaseShiftKeyboardButton();
    await mainPage.pressCtrlJKeyboardShortcut();
    await mainPage.waitForChangeIsSaved();
    await expect(page).toHaveScreenshot("path-merged-nodes-twice.png", {
      mask: [mainPage.usersSection],
    });
  }
);

mainTest(
  "CO-333 Join nodes (via Node panel and J shortcut)",
  async ({ page }) => {
    const mainPage = new MainPage(page);
    await mainPage.clickCreateEllipseButton();
    await mainPage.clickViewport();
    await mainPage.waitForChangeIsSaved();
    await mainPage.transformToPathViaRightclick();
    await mainPage.waitForChangeIsSaved();
    await mainPage.openNodesPanelViaRightclick();
    await mainPage.clickDrawNodesButtonOnNodePanel();
    await mainPage.clickViewportByCoordinates(600, 200);
    await mainPage.clickViewportByCoordinates(750, 300);
    await mainPage.waitForChangeIsSaved();
    await mainPage.clickMoveNodesButtonOnNodePanel();
    await mainPage.waitForChangeIsSaved();
    await mainPage.holdShiftKeyboardButton();
    await mainPage.clickSixthNode();
    await mainPage.clickThirdNode();
    await mainPage.releaseShiftKeyboardButton();
    await mainPage.clickJoinNodesButtonOnNodePanel();
    await mainPage.waitForChangeIsSaved();
    await expect(page).toHaveScreenshot("path-joined-nodes-once.png", {
      mask: [mainPage.usersSection],
    });
    await mainPage.holdShiftKeyboardButton();
    await mainPage.clickFifthNode();
    await mainPage.clickSecondNode();
    await mainPage.releaseShiftKeyboardButton();
    await mainPage.pressJKeyboardShortcut();
    await mainPage.waitForChangeIsSaved();
    await expect(page).toHaveScreenshot("path-joined-nodes-twice.png", {
      mask: [mainPage.usersSection],
    });
  }
);

mainTest(
  "CO-334 Separate nodes (via Node panel and K shortcut)",
  async ({ page }) => {
    const mainPage = new MainPage(page);
    await mainPage.clickCreateEllipseButton();
    await mainPage.clickViewport();
    await mainPage.waitForChangeIsSaved();
    await mainPage.transformToPathViaRightclick();
    await mainPage.waitForChangeIsSaved();
    await mainPage.openNodesPanelViaRightclick();
    await mainPage.holdShiftKeyboardButton();
    await mainPage.clickFirstNode();
    await mainPage.clickSecondNode();
    await mainPage.releaseShiftKeyboardButton();
    await mainPage.clickSeparateNodesButtonOnNodePanel();
    await mainPage.waitForChangeIsSaved();
    await expect(page).toHaveScreenshot("path-separated-nodes-once.png", {
      mask: [mainPage.usersSection],
    });
    await mainPage.clickSecondNode();
    await mainPage.holdShiftKeyboardButton();
    await mainPage.clickThirdNode();
    await mainPage.releaseShiftKeyboardButton();
    await mainPage.pressKKeyboardShortcut();
    await mainPage.waitForChangeIsSaved();
    await expect(page).toHaveScreenshot("path-separated-nodes-twice.png", {
      mask: [mainPage.usersSection],
    });
  }
);

mainTest(
  "CO-335 To corner (via Node panel and X shortcut) - single node",
  async ({ page }) => {
    const mainPage = new MainPage(page);
    await mainPage.clickCreateEllipseButton();
    await mainPage.clickViewport();
    await mainPage.waitForChangeIsSaved();
    await mainPage.transformToPathViaRightclick();
    await mainPage.waitForChangeIsSaved();
    await mainPage.openNodesPanelViaRightclick();
    await mainPage.clickFirstNode();
    await mainPage.clickToCornerButtonOnNodePanel();
    await mainPage.waitForChangeIsSaved();
    await expect(page).toHaveScreenshot("path-to-corner-one-node.png", {
      mask: [mainPage.usersSection],
    });
    await mainPage.clickSecondNode();
    await mainPage.pressXKeyboardShortcut();
    await mainPage.waitForChangeIsSaved();
    await expect(page).toHaveScreenshot("path-to-corner-two-nodes.png", {
      mask: [mainPage.usersSection],
    });
  }
);

mainTest(
  "CO-337 To curve (via Node panel and C shortcut) - single node",
  async ({ page }) => {
    const mainPage = new MainPage(page);
    await mainPage.clickCreateRectangleButton();
    await mainPage.clickViewport();
    await mainPage.waitForChangeIsSaved();
    await mainPage.transformToPathViaRightclick();
    await mainPage.waitForChangeIsSaved();
    await mainPage.openNodesPanelViaRightclick();
    await mainPage.clickFirstNode();
    await mainPage.clickToCurveButtonOnNodePanel();
    await mainPage.waitForChangeIsSaved();
    await expect(page).toHaveScreenshot("path-to-curve-one-node.png", {
      mask: [mainPage.usersSection],
    });
    await mainPage.clickSecondNode();
    await mainPage.pressCKeyboardShortcut();
    await mainPage.waitForChangeIsSaved();
    await expect(page).toHaveScreenshot("path-to-curve-two-nodes.png", {
      mask: [mainPage.usersSection],
    });
  }
);
