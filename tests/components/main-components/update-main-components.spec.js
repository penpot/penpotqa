const { mainTest } = require("../../../fixtures");
const { test, expect } = require("@playwright/test");
const { DashboardPage } = require("../../../pages/dashboard/dashboard-page");
const { TeamPage } = require("../../../pages/dashboard/team-page");
const { MainPage } = require("../../../pages/workspace/main-page");
const { random } = require("../../../helpers/string-generator");
const { ColorPalettePopUp } = require("../../../pages/workspace/color-palette-popup");
const { LayersPanelPage } = require("../../../pages/workspace/layers-panel-page");

const teamName = random().concat("autotest");

test.beforeEach(async ({ page }) => {
  const dashboardPage = new DashboardPage(page);
  const teamPage = new TeamPage(page);
  const mainPage = new MainPage(page);
  await teamPage.createTeam(teamName);
  await dashboardPage.createFileViaPlaceholder();
  await mainPage.isMainPageLoaded();
});

test.afterEach(async ({ page }) => {
  const teamPage = new TeamPage(page);
  const mainPage = new MainPage(page);
  await mainPage.backToDashboardFromFileEditor();
  await teamPage.deleteTeam(teamName);
});

mainTest("Update main component", async ({ page }) => {
  const mainPage = new MainPage(page);
  const colorPalettePopUp = new ColorPalettePopUp(page);
  await mainPage.createDefaultRectangleByCoordinates(200, 300);
  await mainPage.createComponentViaRightClick();
  await mainPage.waitForChangeIsSaved();
  await mainPage.duplicateLayerViaRightClick();
  await mainPage.waitForChangeIsSaved();
  await mainPage.clickCopyComponentOnLayersTab();
  await mainPage.changeAxisXandYForLayer("400", "500");
  await mainPage.waitForChangeIsSaved();
  await mainPage.clickCanvasBackgroundColorIcon();
  await colorPalettePopUp.setHex("#304d6a");
  await mainPage.clickViewportTwice();
  await mainPage.waitForChangeIsSaved();
  await mainPage.updateMainComponentViaRightClick();
  await expect(mainPage.viewport).toHaveScreenshot(
    "component-update-canvas.png",
  );
  await mainPage.openAssetsTab();
  await mainPage.expandComponentsBlockOnAssetsTab();
  await expect(mainPage.assetsPanel).toHaveScreenshot(
    "component-update-asset.png",
  );
});

mainTest("Check copy and main component icons", async ({ page }) => {
  const mainPage = new MainPage(page);
  const layersPanelPage = new LayersPanelPage(page);
  await mainPage.createDefaultRectangleByCoordinates(200, 300);
  await mainPage.createComponentViaRightClick();
  await mainPage.waitForChangeIsSaved();
  await mainPage.duplicateLayerViaRightClick();
  await mainPage.waitForChangeIsSaved();
  await expect(layersPanelPage.layersSidebar).toHaveScreenshot(
    "copy-main-components-layers.png",
  );
});

test.describe(() => {
  test.beforeEach(async ({ page }) => {
    const mainPage = new MainPage(page);
    await mainPage.createDefaultRectangleByCoordinates(200, 300);
    await mainPage.createComponentViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await mainPage.duplicateLayerViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await mainPage.clickCopyComponentOnLayersTab();
    await mainPage.changeAxisXandYForLayer("400", "500");
    await mainPage.waitForChangeIsSaved();
    await mainPage.duplicateLayerViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await mainPage.clickCopyComponentOnLayersTab();
    await mainPage.changeAxisXandYForLayer("700", "800");
    await mainPage.waitForChangeIsSaved();
  });

  mainTest(
    "Create a component and 2 copies of it, change rotation of main",
    async ({ page }) => {
      const mainPage = new MainPage(page);
      await mainPage.clickMainComponentOnLayersTab();
      await mainPage.changeRotationForLayer("20");
      await expect(mainPage.viewport).toHaveScreenshot(
        "main-copies-component-change-rotation.png",
      );
    },
  );

  mainTest(
    "Create a component and 2 copies of it, change all corners of main",
    async ({ page }) => {
      const cornerValue = "45";
      const mainPage = new MainPage(page);
      await mainPage.clickMainComponentOnLayersTab();
      await mainPage.clickIndividualCornersRadiusButton();
      await mainPage.changeTopLeftCornerRadiusForLayer(cornerValue);
      await mainPage.changeTopRightCornerRadiusForLayer(cornerValue);
      await mainPage.changeBottomLeftCornerRadiusForLayer(cornerValue);
      await mainPage.changeBottomRightCornerRadiusForLayer(cornerValue);
      await mainPage.waitForChangeIsSaved();
      await expect(mainPage.viewport).toHaveScreenshot(
        "main-copies-component-add-corners.png",
      );
    },
  );

  mainTest(
    "Create a component and 2 copies of it, change corners of main separate by using 'All corners'",
    async ({ page }) => {
      const cornerValue = "45";
      const mainPage = new MainPage(page);
      await mainPage.clickMainComponentOnLayersTab();
      await mainPage.changeGeneralCornerRadiusForLayer(cornerValue);
      await mainPage.waitForChangeIsSaved();
      await expect(mainPage.viewport).toHaveScreenshot(
        "main-copies-component-add-corners.png",
      );
    },
  );

  mainTest(
    "Create a component and 2 copies of it, change stroke color of main",
    async ({ page }) => {
      const mainPage = new MainPage(page);
      await mainPage.clickMainComponentOnLayersTab();
      await mainPage.clickAddStrokeButton();
      await mainPage.waitForChangeIsSaved();
      await mainPage.setStrokeColor("#d80909");
      await mainPage.waitForChangeIsSaved();
      await expect(mainPage.viewport).toHaveScreenshot(
        "main-copies-component-add-stroke.png",
      );
    },
  );
});
