const { mainTest } = require("../../../fixtures");
const { MainPage } = require("../../../pages/workspace/main-page");
const { expect, test } = require("@playwright/test");
const { DashboardPage } = require("../../../pages/dashboard/dashboard-page");
const { TeamPage } = require("../../../pages/dashboard/team-page");
const { random } = require("../../../helpers/string-generator");
const {
  LayersPanelPage,
} = require("../../../pages/workspace/layers-panel-page");

const teamName = random().concat("autotest");
const annotation = "Test annotation for automation";

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

test.describe(() => {
  test.beforeEach(async ({ page }) => {
    const mainPage = new MainPage(page);
    await mainPage.createDefaultRectangleByCoordinates(200, 300);
    await mainPage.createComponentViaRightClick();
    await mainPage.waitForChangeIsSaved();
  });

  mainTest("Show in assets panel option from Design tab", async ({ page }) => {
    const mainPage = new MainPage(page);
    await mainPage.clickOnLayerOnCanvas();
    await mainPage.clickOnComponentMenuButton();
    await mainPage.clickOnShowInAssetsPanel();
    await expect(page).toHaveScreenshot("component-show-in-assets-panel.png", {
      mask: [mainPage.guides, mainPage.usersSection, mainPage.zoomButton],
    });
  });

  mainTest(
    "Show in assets panel option from component context menu",
    async ({ page }) => {
      const mainPage = new MainPage(page);
      await mainPage.showInAssetsPanelRightClick();
      await expect(page).toHaveScreenshot(
        "component-show-in-assets-panel.png",
        {
          mask: [mainPage.guides, mainPage.usersSection, mainPage.zoomButton],
        },
      );
    },
  );

  mainTest("Create annotation with valid text", async ({ page }) => {
    const mainPage = new MainPage(page);
    await mainPage.clickOnLayerOnCanvas();
    await mainPage.clickOnComponentMenuButton();
    await mainPage.clickOnCreateAnnotationOption();
    await mainPage.addAnnotationForComponent(annotation);
    await mainPage.waitForChangeIsSaved();
    await mainPage.isAnnotationAddedToComponent(annotation);
    await expect(mainPage.componentBlockOnDesignTab).toHaveScreenshot(
      "component-annotation.png",
    );
  });

  mainTest("Create annotation from context menu", async ({ page }) => {
    const mainPage = new MainPage(page);
    await mainPage.createAnnotationRightClick();
    await mainPage.addAnnotationForComponent(annotation);
    await mainPage.waitForChangeIsSaved();
    await mainPage.isAnnotationAddedToComponent(annotation);
    await expect(mainPage.componentBlockOnDesignTab).toHaveScreenshot(
      "component-annotation.png",
    );
  });

  mainTest("Cancel annotation creation and accept", async ({ page }) => {
    const mainPage = new MainPage(page);
    await mainPage.clickOnLayerOnCanvas();
    await mainPage.clickOnComponentMenuButton();
    await mainPage.clickOnCreateAnnotationOption();
    await mainPage.cancelAddAnnotationForComponent(annotation);
    await expect(mainPage.componentBlockOnDesignTab).toHaveScreenshot(
      "component-annotation-discard.png",
    );
  });

  mainTest("Edit annotation with valid text", async ({ page }) => {
    const newAnnotation = "Edit annotation";
    const mainPage = new MainPage(page);
    await mainPage.createAnnotationRightClick();
    await mainPage.addAnnotationForComponent(annotation);
    await mainPage.waitForChangeIsSaved();
    await mainPage.isAnnotationAddedToComponent(annotation);
    await mainPage.clickOnEditAnnotation();
    await mainPage.editAnnotationForComponent(newAnnotation);
    await mainPage.waitForChangeIsSaved();
    await mainPage.isAnnotationAddedToComponent(newAnnotation);
    await expect(mainPage.componentBlockOnDesignTab).toHaveScreenshot(
      "component-annotation-edit.png",
    );
  });

  mainTest("Delete annotation", async ({ page }) => {
    const mainPage = new MainPage(page);
    await mainPage.createAnnotationRightClick();
    await mainPage.addAnnotationForComponent(annotation);
    await mainPage.waitForChangeIsSaved();
    await mainPage.isAnnotationAddedToComponent(annotation);
    await mainPage.clickOnDeleteAnnotation();
    await mainPage.confirmDeleteAnnotation();
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.componentBlockOnDesignTab).toHaveScreenshot(
      "component-annotation-delete.png",
    );
  });

  mainTest("Annotation on Inspect tab", async ({ page }) => {
    const mainPage = new MainPage(page);
    await mainPage.createAnnotationRightClick();
    await mainPage.addAnnotationForComponent(annotation);
    await mainPage.waitForChangeIsSaved();
    await mainPage.openInspectTab();
    await mainPage.isAnnotationExistOnInspectTab();
    await expect(mainPage.annotationBlockOnInspect).toHaveScreenshot(
      "component-annotation-inspect-tab.png",
    );
  });

  mainTest("Duplicate main component", async ({ page }) => {
    const mainPage = new MainPage(page);
    const layersPanelPage = new LayersPanelPage(page);
    await mainPage.openAssetsTab();
    await mainPage.expandComponentsBlockOnAssetsTab();
    await mainPage.duplicateFileLibraryComponent();
    await mainPage.waitForChangeIsSaved();
    await mainPage.isSecondComponentAddedToFileLibraryComponents();
    await expect(mainPage.assetsPanel).toHaveScreenshot(
      "component-rectangle-duplicated-asset.png",
    );
    await layersPanelPage.openLayersTab();
    await expect(mainPage.viewport).toHaveScreenshot(
      "component-rectangle-duplicated-canvas.png",
    );
  });

  mainTest("Check Show main component option", async ({ page }) => {
    const mainPage = new MainPage(page);
    await mainPage.openAssetsTab();
    await mainPage.expandComponentsBlockOnAssetsTab();
    await mainPage.showFileLibraryMainComponent();
    await expect(mainPage.viewport).toHaveScreenshot("component-show-main.png");
  });

  mainTest(
    "Check annotation applies for copies and inspect tab",
    async ({ page }) => {
      const mainPage = new MainPage(page);
      await mainPage.duplicateLayerViaRightClick();
      await mainPage.waitForChangeIsSaved();
      await mainPage.clickMainComponentOnLayersTab();
      await mainPage.clickOnComponentMenuButton();
      await mainPage.clickOnCreateAnnotationOption();
      await mainPage.addAnnotationForComponent(annotation);
      await mainPage.waitForChangeIsSaved();
      await mainPage.clickCopyComponentOnLayersTab();
      await expect(mainPage.componentBlockOnDesignTab).toHaveScreenshot(
        "copy-component-annotation.png",
      );
      await mainPage.openInspectTab();
      await mainPage.isAnnotationExistOnInspectTab();
      await expect(mainPage.annotationBlockOnInspect).toHaveScreenshot(
        "component-annotation-inspect-tab.png",
      );
    },
  );
});

mainTest(
  "Check created component group of shapes on Assets tab",
  async ({ page }) => {
    const mainPage = new MainPage(page);
    const layersPanelPage = new LayersPanelPage(page);
    await mainPage.createDefaultEllipseByCoordinates(200, 300);
    await mainPage.createDefaultEllipseByCoordinates(400, 600);
    await mainPage.clickMainMenuButton();
    await mainPage.clickEditMainMenuItem();
    await mainPage.clickSelectAllMainMenuSubItem();
    await mainPage.createComponentsMultipleShapesRightClick();
    await mainPage.waitForChangeIsSaved();
    await expect(mainPage.viewport).toHaveScreenshot(
      "ellipse-complex-component-canvas.png",
    );
    await expect(layersPanelPage.layersSidebar).toHaveScreenshot(
      "ellipse-complex-component-layer.png",
    );
    await mainPage.openAssetsTab();
    await mainPage.expandComponentsBlockOnAssetsTab();
    await mainPage.isComponentAddedToFileLibraryComponents();
    await expect(mainPage.assetsPanel).toHaveScreenshot(
      "ellipse-complex-component-asset.png",
    );
  },
);

mainTest(
  "Create a group with component and check its name",
  async ({ page }) => {
    const groupName = "Test Group";
    const mainPage = new MainPage(page);
    const layersPanelPage = new LayersPanelPage(page);
    await mainPage.createDefaultBoardByCoordinates(200, 300);
    await mainPage.createComponentViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await mainPage.openAssetsTab();
    await mainPage.expandComponentsBlockOnAssetsTab();
    await mainPage.createGroupFileLibraryGraphics(groupName);
    await mainPage.isFileLibraryGroupCreated(groupName);
    await layersPanelPage.openLayersTab();
    await expect(layersPanelPage.layersSidebar).toHaveScreenshot(
      "component-group-layer.png",
    );
    await expect(mainPage.viewport).toHaveScreenshot(
      "component-group-canvas.png",
    );
  },
);

mainTest("Rename component with valid name", async ({ page }) => {
  const newName = "Renamed ellipse name";
  const mainPage = new MainPage(page);
  const layersPanelPage = new LayersPanelPage(page);
  await mainPage.createDefaultEllipseByCoordinates(400, 600);
  await mainPage.createComponentViaRightClick();
  await mainPage.waitForChangeIsSaved();
  await mainPage.openAssetsTab();
  await mainPage.expandComponentsBlockOnAssetsTab();
  await mainPage.renameFileLibraryComponent(newName);
  await mainPage.waitForChangeIsSaved();
  await layersPanelPage.openLayersTab();
  await expect(mainPage.viewport).toHaveScreenshot(
    "component-new-name-canvas.png",
  );
  await expect(layersPanelPage.layersSidebar).toHaveScreenshot(
    "component-new-name-layer.png",
  );
});
