import { DashboardPage } from '@pages/dashboard/dashboard-page';
import { TeamPage } from '@pages/dashboard/team-page';
import { DesignPanelPage } from '@pages/workspace/design-panel-page';
import { InspectPanelPage } from '@pages/workspace/inspect-panel-page';
import { LayersPanelPage } from '@pages/workspace/layers-panel-page';
import { MainPage } from '@pages/workspace/main-page';
import { expect } from '@playwright/test';
import { mainTest } from 'fixtures';
import { createTeamName } from 'helpers/teams/create-team-name';
import { qase } from 'playwright-qase-reporter/playwright';

const teamName = createTeamName();
const annotation = 'Test annotation for automation';

let dashboardPage: DashboardPage;
let designPanelPage: DesignPanelPage;
let layersPanelPage: LayersPanelPage;
let mainPage: MainPage;
let teamPage: TeamPage;

mainTest.beforeEach(async ({ page }) => {
  dashboardPage = new DashboardPage(page);
  teamPage = new TeamPage(page);
  mainPage = new MainPage(page);
  layersPanelPage = new LayersPanelPage(page);
  designPanelPage = new DesignPanelPage(page);

  await teamPage.createTeam(teamName);
  await teamPage.isTeamSelected(teamName);
  await dashboardPage.createFileViaPlaceholder();
  await mainPage.isMainPageLoaded();
});

mainTest.afterEach(async () => {
  await mainPage.backToDashboardFromFileEditor();
  await teamPage.deleteTeam(teamName);
});

mainTest.describe(() => {
  let inspectPanelPage: InspectPanelPage;

  mainTest.beforeEach(async ({ page }) => {
    inspectPanelPage = new InspectPanelPage(page);
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
        await expect(
          designPanelPage.componentBlockOnDesignTab,
          'Component design tab should match screenshot with annotation',
        ).toHaveScreenshot('component-annotation.png');
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

  mainTest(qase([1618], 'Annotation on Inspect tab'), async () => {
    await mainTest.step(
      `Create annotation "${annotation}" via right-click`,
      async () => {
        await designPanelPage.createAnnotationRightClick();
        await designPanelPage.addAnnotationForComponent(annotation);
        await designPanelPage.waitForChangeIsSaved();
      },
    );

    await mainTest.step(
      `Verify annotation "${annotation}" is visible on Inspect tab`,
      async () => {
        await inspectPanelPage.openInspectTab();
        await inspectPanelPage.openComputedTab();
        await inspectPanelPage.isAnnotationExistOnInspectTab();
        await inspectPanelPage.isAnnotationTextExistOnInspectTab(annotation);
      },
    );
  });

  mainTest(
    qase([1428], 'Check annotation applies for copies and inspect tab'),
    async () => {
      await mainTest.step(
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

      await mainTest.step(
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
