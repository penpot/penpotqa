import { mainTest } from 'fixtures';
import { MainPage } from '@pages/workspace/main-page';
import { expect } from '@playwright/test';
import { DashboardPage } from '@pages/dashboard/dashboard-page';
import { TeamPage } from '@pages/dashboard/team-page';
import { random } from 'helpers/string-generator';
import { LayersPanelPage } from '@pages/workspace/layers-panel-page';
import { DesignPanelPage } from '@pages/workspace/design-panel-page';
import { AssetsPanelPage } from '@pages/workspace/assets-panel-page';
import { InspectPanelPage } from '@pages/workspace/inspect-panel-page';
import { BasePage } from '@pages/base-page';
import { ColorPalettePage } from '@pages/workspace/color-palette-page';
import { qase } from 'playwright-qase-reporter/playwright';

const teamName = random().concat('autotest');
const annotation = 'Test annotation for automation';

let mainPage: MainPage;
let basePage: BasePage;
let dashboardPage: DashboardPage;
let teamPage: TeamPage;
let layersPanelPage: LayersPanelPage;
let designPanelPage: DesignPanelPage;
let colorPalettePage: ColorPalettePage;
let assetsPanelPage: AssetsPanelPage;

mainTest.beforeEach(async ({ page }) => {
  dashboardPage = new DashboardPage(page);
  teamPage = new TeamPage(page);
  mainPage = new MainPage(page);
  basePage = new BasePage(page);
  layersPanelPage = new LayersPanelPage(page);
  designPanelPage = new DesignPanelPage(page);
  colorPalettePage = new ColorPalettePage(page);
  assetsPanelPage = new AssetsPanelPage(page);

  await teamPage.createTeam(teamName);
  await dashboardPage.createFileViaPlaceholder();
  await mainPage.isMainPageLoaded();
});

mainTest.afterEach(async () => {
  await mainPage.backToDashboardFromFileEditor();
  await teamPage.deleteTeam(teamName);
});

mainTest.describe(() => {
  mainTest.beforeEach(async () => {
    await mainPage.createDefaultRectangleByCoordinates(400, 500);
    await mainPage.createComponentViaRightClick();
    await mainPage.waitForChangeIsSaved();
  });

  mainTest(
    qase(
      [1419, 1427, 1423, 1425],
      'Create annotation: create, delete, create via right-click, edit',
    ),
    async () => {
      const newAnnotation = 'Edit annotation';

      await mainTest.step('(1419) Create annotation with valid text', async () => {
        await layersPanelPage.clickMainComponentOnLayersTab();
        await designPanelPage.clickOnComponentMenuButton();
        await designPanelPage.clickOnCreateAnnotationOption();
        await designPanelPage.addAnnotationForComponent(annotation);
        await mainPage.waitForChangeIsSaved();
        await designPanelPage.isAnnotationAddedToComponent(annotation);
        await expect(designPanelPage.componentBlockOnDesignTab).toHaveScreenshot(
          'component-annotation.png',
        );
      });

      await mainTest.step('(1427) Delete annotation', async () => {
        await designPanelPage.clickOnDeleteAnnotation();
        await designPanelPage.confirmDeleteAnnotation();
        await designPanelPage.waitForChangeIsSaved();
        await designPanelPage.isAnnotationNotAddedToComponent();
      });

      await mainTest.step(
        '(1423) Create annotation via right click on component',
        async () => {
          await designPanelPage.createAnnotationRightClick();
          await designPanelPage.addAnnotationForComponent(annotation);
          await designPanelPage.waitForChangeIsSaved();
          await designPanelPage.isAnnotationAddedToComponent(annotation);
        },
      );

      await mainTest.step('(1425) Edit annotation with valid text', async () => {
        await designPanelPage.clickOnEditAnnotation();
        await designPanelPage.editAnnotationForComponent(newAnnotation);
        await designPanelPage.waitForChangeIsSaved();
        await designPanelPage.isAnnotationAddedToComponent(newAnnotation);
      });
    },
  );

  mainTest(qase([1618], 'Annotation on Inspect tab'), async ({ page }) => {
    const inspectPanelPage = new InspectPanelPage(page);

    await designPanelPage.createAnnotationRightClick();
    await designPanelPage.addAnnotationForComponent(annotation);
    await designPanelPage.waitForChangeIsSaved();

    await inspectPanelPage.openInspectTab();
    await inspectPanelPage.openComputedTab();
    await inspectPanelPage.isAnnotationExistOnInspectTab();
    await inspectPanelPage.isAnnotationTextExistOnInspectTab(annotation);
  });

  mainTest(
    qase([1428], 'Check annotation applies for copies and inspect tab'),
    async ({ page }) => {
      const inspectPanelPage = new InspectPanelPage(page);

      await mainPage.duplicateLayerViaRightClick();
      await mainPage.waitForChangeIsSaved();

      await layersPanelPage.clickMainComponentOnLayersTab();
      await designPanelPage.clickOnComponentMenuButton();
      await designPanelPage.clickOnCreateAnnotationOption();
      await designPanelPage.addAnnotationForComponent(annotation);

      await mainPage.waitForChangeIsSaved();

      await layersPanelPage.clickCopyComponentOnLayersTab();
      await designPanelPage.isComponentTypeCopy();
      await designPanelPage.isAnnotationAddedToComponent(annotation);

      await inspectPanelPage.openInspectTab();
      await inspectPanelPage.openComputedTab();
      await inspectPanelPage.isAnnotationExistOnInspectTab();
      await inspectPanelPage.isAnnotationTextExistOnInspectTab(annotation);
    },
  );
});
