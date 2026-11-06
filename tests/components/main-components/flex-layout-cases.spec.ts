import { DesignPanelPage } from '@pages/workspace/design-panel-page';
import {
  LayoutContainerSectionComponent,
  LayoutDirection,
} from '@pages/workspace/right-sidebar/design-tab/layout-container-section-component';
import { WorkspacePage } from '@pages/workspace/workspace-page';
import { expect } from '@playwright/test';
import { demoAccountFileTest } from 'fixtures';
import { qase } from 'playwright-qase-reporter/playwright';

let designPanelPage: DesignPanelPage;
let layoutContainer: LayoutContainerSectionComponent;

demoAccountFileTest.beforeEach(async ({ page }) => {
  designPanelPage = new DesignPanelPage(page);
  layoutContainer = new WorkspacePage(page).rightSidebar.design.layoutContainer;
});

demoAccountFileTest.describe(() => {
  demoAccountFileTest.beforeEach(
    'Add a flex layout board, rectangle and ellipse components',
    async ({ mainPage }) => {
      await mainPage.createDefaultBoardByCoordinates(200, 200);
      await designPanelPage.changeHeightAndWidthForLayer('300', '300');
      await mainPage.waitForChangeIsSaved();
      await mainPage.addFlexLayoutViaRightClick();
      await mainPage.waitForChangeIsSaved();

      await mainPage.createDefaultRectangleByCoordinates(200, 200, true);
      await mainPage.createComponentViaRightClickFromLayerByName('Rectangle');
      await mainPage.waitForChangeIsSaved();

      await mainPage.createDefaultEllipseByCoordinates(300, 300);
      await mainPage.createComponentViaRightClickFromLayerByName('Ellipse');
      await mainPage.waitForChangeIsSaved();

      await mainPage.clickCreatedBoardTitleOnCanvas();
    },
  );

  demoAccountFileTest(
    qase(
      [1503],
      'Create flex board with main component and its copy, change direction and alignment',
    ),
    async ({ mainPage }) => {
      await demoAccountFileTest.step(
        'Create flex board with main component and its copy, change direction',
        async () => {
          await layoutContainer.changeDirection(LayoutDirection.Column);
          await mainPage.waitForChangeIsSaved();
          await expect(mainPage.viewport).toHaveScreenshot(
            'main-component-change-board-direction.png',
            {
              mask: mainPage.maskViewport(),
            },
          );
        },
      );
    },
  );
});

demoAccountFileTest.describe(() => {
  demoAccountFileTest.beforeEach(async ({ mainPage }) => {
    await demoAccountFileTest.slow();

    await mainPage.createDefaultBoardByCoordinates(200, 200);
    await designPanelPage.changeHeightAndWidthForLayer('300', '300');
    await mainPage.waitForChangeIsSaved();
    await mainPage.addFlexLayoutViaRightClick();
    await mainPage.waitForChangeIsSaved();
  });

  demoAccountFileTest(
    qase(
      [1511],
      'Create component with 2 boards with components inside it. change paddings',
    ),
    async ({ mainPage }) => {
      await demoAccountFileTest.slow();

      await demoAccountFileTest.step(
        'Add two boards with elements and create components',
        async () => {
          await mainPage.createDefaultRectangleByCoordinates(200, 200, true);
          await mainPage.waitForChangeIsSaved();

          await mainPage.clickCreatedBoardTitleOnCanvas();
          await designPanelPage.changeAxisXAndYForLayer('600', '200');

          await mainPage.createDefaultBoardByCoordinates(200, 200, true);
          await designPanelPage.changeHeightAndWidthForLayer('300', '300');
          await mainPage.waitForChangeIsSaved();
          await mainPage.addFlexLayoutViaRightClickForNComponent(1);
          await mainPage.waitForChangeIsSaved();

          await mainPage.createDefaultEllipseByCoordinates(200, 200, true);
          await mainPage.waitForChangeIsSaved();

          await mainPage.clickViewportTwice();
          await mainPage.waitForChangeIsSaved();
          await mainPage.clickMainMenuButton();
          await mainPage.clickEditMainMenuItem();
          await mainPage.clickSelectAllMainMenuSubItem();
          await mainPage.waitForChangeIsSaved();
          await mainPage.createComponentsMultipleShapesRightClick(true);
          await mainPage.waitForChangeIsSaved();
        },
      );

      await demoAccountFileTest.step(
        'Add flex layout and change paddings and verify component padding changes on canvas',
        async () => {
          await mainPage.addFlexLayoutViaRightClickForNComponent('0');
          await mainPage.waitForChangeIsSaved();
          await designPanelPage.changeLayoutPadding('Vertical', '20');
          await mainPage.waitForChangeIsSaved();
          await designPanelPage.changeLayoutPadding('Horizontal', '40');
          await mainPage.waitForChangeIsSaved();
          await expect(mainPage.viewport).toHaveScreenshot(
            'component-inside-board-change-paddings.png',
            {
              mask: mainPage.maskViewport(),
            },
          );
        },
      );
    },
  );

  demoAccountFileTest(
    qase([1514], 'Create component inside flex board, change alignment for element'),
    async ({ mainPage }) => {
      await demoAccountFileTest.step(
        'Create component inside flex board and change alignment and verify alignment change on canvas',
        async () => {
          await mainPage.createDefaultRectangleByCoordinates(200, 200, true);
          await mainPage.createComponentViaRightClick();
          await mainPage.waitForChangeIsSaved();
          await mainPage.clickCreatedBoardTitleOnCanvas();
          await designPanelPage.changeLayoutAlignment('Center');
          await mainPage.waitForChangeIsSaved();
          await expect(mainPage.viewport).toHaveScreenshot(
            'component-inside-board-change-alignment.png',
            {
              mask: mainPage.maskViewport(),
            },
          );
        },
      );
    },
  );
});
