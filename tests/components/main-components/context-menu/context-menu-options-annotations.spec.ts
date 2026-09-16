import { DesignPanelPage } from '@pages/workspace/design-panel-page';
import { InspectPanelPage } from '@pages/workspace/inspect-panel-page';
import { LayersPanelPage } from '@pages/workspace/layers-panel-page';
import { expect } from '@playwright/test';
import { demoAccountFileTest } from 'fixtures';
import { qase } from 'playwright-qase-reporter/playwright';

const annotation = 'Test annotation for automation';

let designPanelPage: DesignPanelPage;
let layersPanelPage: LayersPanelPage;

demoAccountFileTest.beforeEach(async ({ page }) => {
  layersPanelPage = new LayersPanelPage(page);
  designPanelPage = new DesignPanelPage(page);
});

demoAccountFileTest.describe(() => {
  let inspectPanelPage: InspectPanelPage;

  demoAccountFileTest.beforeEach(async ({ page, mainPage }) => {
    inspectPanelPage = new InspectPanelPage(page);
    await mainPage.createDefaultRectangleByCoordinates(400, 500);
    await mainPage.createComponentViaRightClick();
    await mainPage.waitForChangeIsSaved();
  });

  demoAccountFileTest(
    qase([1419, 1427], 'Create annotation: create, delete'),
    async ({ mainPage }) => {
      const newAnnotation = 'Edit annotation';

      await demoAccountFileTest.step(
        '(1419) Create annotation with valid text',
        async () => {
          await layersPanelPage.clickMainComponentOnLayersTab();
          await designPanelPage.clickOnComponentMenuButton();
          await designPanelPage.clickOnCreateAnnotationOption();
          await designPanelPage.addAnnotationForComponent(annotation);
          await mainPage.waitForChangeIsSaved();
          await designPanelPage.isAnnotationAddedToComponent(annotation);
          await expect(
            designPanelPage.componentBlockOnDesignTab,
            'Component design tab should match screenshot with annotation',
          ).toHaveScreenshot('component-annotation.png');
        },
      );

      await demoAccountFileTest.step('(1427) Delete annotation', async () => {
        await designPanelPage.clickOnDeleteAnnotation();
        await designPanelPage.confirmDeleteAnnotation();
        await designPanelPage.waitForChangeIsSaved();
        await designPanelPage.isAnnotationNotAddedToComponent();
      });
    },
  );

  demoAccountFileTest(
    qase([1428], 'Check annotation applies for copies and inspect tab'),
    async ({ mainPage }) => {
      await demoAccountFileTest.step(
        'Duplicate layer and create annotation on main component',
        async () => {
          await mainPage.duplicateLayerViaRightClick();
          await mainPage.waitForChangeIsSaved();
          await layersPanelPage.clickMainComponentOnLayersTab();
          await designPanelPage.clickOnComponentMenuButton();
          await designPanelPage.clickOnCreateAnnotationOption();
          await designPanelPage.addAnnotationForComponent(annotation);
          await mainPage.waitForChangeIsSaved();
        },
      );

      await demoAccountFileTest.step(
        `Verify annotation "${annotation}" is visible on copy and Inspect tab`,
        async () => {
          await layersPanelPage.clickCopyComponentOnLayersTab();
          await designPanelPage.isComponentTypeCopy();
          await designPanelPage.isAnnotationAddedToComponent(annotation);
          await inspectPanelPage.openInspectTab();
          await inspectPanelPage.openComputedTab();
          await inspectPanelPage.isAnnotationExistOnInspectTab();
          await inspectPanelPage.isAnnotationTextExistOnInspectTab(annotation);
        },
      );
    },
  );
});
