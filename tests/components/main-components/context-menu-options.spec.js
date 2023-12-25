const { mainTest } = require("../../../fixtures");
const { MainPage } = require("../../../pages/workspace/main-page");
const { expect, test } = require("@playwright/test");
const { DashboardPage } = require("../../../pages/dashboard/dashboard-page");
const { TeamPage } = require("../../../pages/dashboard/team-page");
const { random } = require("../../../helpers/string-generator");
const { LayersPanelPage } = require("../../../pages/workspace/layers-panel-page");
const { DesignPanelPage } = require("../../../pages/workspace/design-panel-page");
const {AssetsPanelPage} = require("../../../pages/workspace/assets-panel-page");

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
    const designPanelPage = new DesignPanelPage(page);
    await mainPage.clickOnLayerOnCanvas();
    await designPanelPage.clickOnComponentMenuButton();
    await designPanelPage.clickOnShowInAssetsPanel();
    await expect(page).toHaveScreenshot("component-show-in-assets-panel.png", {
      mask: [mainPage.guides, mainPage.usersSection, mainPage.zoomButton],
    });
  });

  mainTest(
    "Show in assets panel option from component context menu",
    async ({ page }) => {
      const mainPage = new MainPage(page);
      const designPanelPage = new DesignPanelPage(page);
      await designPanelPage.showInAssetsPanelRightClick();
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
    const designPanelPage = new DesignPanelPage(page);
    await mainPage.clickOnLayerOnCanvas();
    await designPanelPage.clickOnComponentMenuButton();
    await designPanelPage.clickOnCreateAnnotationOption();
    await designPanelPage.addAnnotationForComponent(annotation);
    await mainPage.waitForChangeIsSaved();
    await designPanelPage.isAnnotationAddedToComponent(annotation);
    await expect(designPanelPage.componentBlockOnDesignTab).toHaveScreenshot(
      "component-annotation.png",
    );
  });

  mainTest("Create annotation from context menu", async ({ page }) => {
    const mainPage = new MainPage(page);
    const designPanelPage = new DesignPanelPage(page);
    await mainPage.createAnnotationRightClick();
    await designPanelPage.addAnnotationForComponent(annotation);
    await mainPage.waitForChangeIsSaved();
    await designPanelPage.isAnnotationAddedToComponent(annotation);
    await expect(mainPage.componentBlockOnDesignTab).toHaveScreenshot(
      "component-annotation.png",
    );
  });

  mainTest("Cancel annotation creation and accept", async ({ page }) => {
    const mainPage = new MainPage(page);
    const designPanelPage = new DesignPanelPage(page);
    await mainPage.clickOnLayerOnCanvas();
    await designPanelPage.clickOnComponentMenuButton();
    await designPanelPage.clickOnCreateAnnotationOption();
    await designPanelPage.cancelAddAnnotationForComponent(annotation);
    await expect(designPanelPage.componentBlockOnDesignTab).toHaveScreenshot(
      "component-annotation-discard.png",
    );
  });

  mainTest("Edit annotation with valid text", async ({ page }) => {
    const newAnnotation = "Edit annotation";
    const mainPage = new MainPage(page);
    const designPanelPage = new DesignPanelPage(page);
    await mainPage.createAnnotationRightClick();
    await designPanelPage.addAnnotationForComponent(annotation);
    await mainPage.waitForChangeIsSaved();
    await designPanelPage.isAnnotationAddedToComponent(annotation);
    await designPanelPage.clickOnEditAnnotation();
    await designPanelPage.editAnnotationForComponent(newAnnotation);
    await mainPage.waitForChangeIsSaved();
    await designPanelPage.isAnnotationAddedToComponent(newAnnotation);
    await expect(designPanelPage.componentBlockOnDesignTab).toHaveScreenshot(
      "component-annotation-edit.png",
    );
  });

  mainTest("Delete annotation", async ({ page }) => {
    const mainPage = new MainPage(page);
    const designPanelPage = new DesignPanelPage(page);
    await mainPage.createAnnotationRightClick();
    await designPanelPage.addAnnotationForComponent(annotation);
    await mainPage.waitForChangeIsSaved();
    await designPanelPage.isAnnotationAddedToComponent(annotation);
    await designPanelPage.clickOnDeleteAnnotation();
    await designPanelPage.confirmDeleteAnnotation();
    await mainPage.waitForChangeIsSaved();
    await expect(designPanelPage.componentBlockOnDesignTab).toHaveScreenshot(
      "component-annotation-delete.png",
    );
  });

  mainTest("Annotation on Inspect tab", async ({ page }) => {
    const mainPage = new MainPage(page);
    const designPanelPage = new DesignPanelPage(page);
    await mainPage.createAnnotationRightClick();
    await designPanelPage.addAnnotationForComponent(annotation);
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
    const assetsPanelPage = new AssetsPanelPage(page);
    await assetsPanelPage.clickAssetsTab();
    await assetsPanelPage.expandComponentsBlockOnAssetsTab();
    await assetsPanelPage.duplicateFileLibraryComponent();
    await mainPage.waitForChangeIsSaved();
    await assetsPanelPage.isSecondComponentAddedToFileLibraryComponents();
    await expect(assetsPanelPage.assetsPanel).toHaveScreenshot(
      "component-rectangle-duplicated-asset.png",
    );
    await layersPanelPage.openLayersTab();
    await expect(mainPage.viewport).toHaveScreenshot(
      "component-rectangle-duplicated-canvas.png",
    );
  });

  mainTest("Check Show main component option", async ({ page }) => {
    const mainPage = new MainPage(page);
    const assetsPanelPage = new AssetsPanelPage(page);
    await assetsPanelPage.clickAssetsTab();
    await assetsPanelPage.expandComponentsBlockOnAssetsTab();
    await assetsPanelPage.showFileLibraryMainComponent();
    await expect(mainPage.viewport).toHaveScreenshot("component-show-main.png");
  });

  mainTest(
    "Check annotation applies for copies and inspect tab",
    async ({ page }) => {
      const mainPage = new MainPage(page);
      const layersPanelPage = new LayersPanelPage(page);
      const designPanelPage = new DesignPanelPage(page);
      await mainPage.duplicateLayerViaRightClick();
      await mainPage.waitForChangeIsSaved();
      await layersPanelPage.clickMainComponentOnLayersTab();
      await designPanelPage.clickOnComponentMenuButton();
      await designPanelPage.clickOnCreateAnnotationOption();
      await designPanelPage.addAnnotationForComponent(annotation);
      await mainPage.waitForChangeIsSaved();
      await layersPanelPage.clickCopyComponentOnLayersTab();
      await expect(designPanelPage.componentBlockOnDesignTab).toHaveScreenshot(
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
    const assetsPanelPage = new AssetsPanelPage(page);
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
    await assetsPanelPage.clickAssetsTab();
    await assetsPanelPage.expandComponentsBlockOnAssetsTab();
    await assetsPanelPage.isComponentAddedToFileLibraryComponents();
    await expect(assetsPanelPage.assetsPanel).toHaveScreenshot(
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
    const assetsPanelPage = new AssetsPanelPage(page);
    await mainPage.createDefaultBoardByCoordinates(200, 300);
    await mainPage.createComponentViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await assetsPanelPage.clickAssetsTab();
    await assetsPanelPage.expandComponentsBlockOnAssetsTab();
    await assetsPanelPage.createGroupFileLibraryGraphics(groupName);
    await assetsPanelPage.isFileLibraryGroupCreated(groupName);
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
  const assetsPanelPage = new AssetsPanelPage(page);
  await mainPage.createDefaultEllipseByCoordinates(400, 600);
  await mainPage.createComponentViaRightClick();
  await mainPage.waitForChangeIsSaved();
  await assetsPanelPage.clickAssetsTab();
  await assetsPanelPage.expandComponentsBlockOnAssetsTab();
  await assetsPanelPage.renameFileLibraryComponent(newName);
  await mainPage.waitForChangeIsSaved();
  await layersPanelPage.openLayersTab();
  await expect(mainPage.viewport).toHaveScreenshot(
    "component-new-name-canvas.png",
  );
  await expect(layersPanelPage.layersSidebar).toHaveScreenshot(
    "component-new-name-layer.png",
  );
});
