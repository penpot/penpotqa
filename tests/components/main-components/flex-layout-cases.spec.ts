import { DesignPanelPage } from '@pages/workspace/design-panel-page';
import { expect } from '@playwright/test';
import { mainAccountFileTest } from 'fixtures';
import { qase } from 'playwright-qase-reporter/playwright';

let designPanelPage: DesignPanelPage;

mainAccountFileTest.beforeEach(async ({ page }) => {
  designPanelPage = new DesignPanelPage(page);
});

mainAccountFileTest.describe(() => {
  mainAccountFileTest.beforeEach(
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

  mainAccountFileTest(
    qase(
      [1503],
      'Create flex board with main component and its copy, change direction and alignment',
    ),
    async ({ mainPage }) => {
      await mainAccountFileTest.step(
        'Create flex board with main component and its copy, change direction',
        async () => {
          await designPanelPage.changeLayoutDirection('Column');
          await mainPage.waitForChangeIsSaved();
          await expect(
            mainPage.viewport,
            'Viewport should match screenshot after changing board layout direction',
          ).toHaveScreenshot('main-component-change-board-direction.png', {
            mask: mainPage.maskViewport(),
          });
        },
      );
    },
  );
});

mainAccountFileTest.describe(() => {
  mainAccountFileTest.beforeEach(async ({ mainPage }) => {
    await mainAccountFileTest.slow();

    await mainPage.createDefaultBoardByCoordinates(200, 200);
    await designPanelPage.changeHeightAndWidthForLayer('300', '300');
    await mainPage.waitForChangeIsSaved();
    await mainPage.addFlexLayoutViaRightClick();
    await mainPage.waitForChangeIsSaved();
  });

  mainAccountFileTest(
    qase(
      [1511],
      'Create component with 2 boards with components inside it. change paddings',
    ),
    async ({ mainPage }) => {
      await mainAccountFileTest.slow();

      await mainAccountFileTest.step(
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

      await mainAccountFileTest.step(
        'Add flex layout and change paddings',
        async () => {
          await mainPage.addFlexLayoutViaRightClickForNComponent('0');
          await mainPage.waitForChangeIsSaved();
          await designPanelPage.changeLayoutPadding('Vertical', '20');
          await mainPage.waitForChangeIsSaved();
          await designPanelPage.changeLayoutPadding('Horizontal', '40');
          await mainPage.waitForChangeIsSaved();
        },
      );

      await mainAccountFileTest.step(
        'Verify component padding changes on canvas',
        async () => {
          await expect(
            mainPage.viewport,
            'Viewport should match screenshot after changing component paddings inside flex board',
          ).toHaveScreenshot('component-inside-board-change-paddings.png', {
            mask: mainPage.maskViewport(),
          });
        },
      );
    },
  );

  mainAccountFileTest(
    qase([1514], 'Create component inside flex board, change alignment for element'),
    async ({ mainPage }) => {
      await mainAccountFileTest.step(
        'Create component inside flex board and change alignment',
        async () => {
          await mainPage.createDefaultRectangleByCoordinates(200, 200, true);
          await mainPage.createComponentViaRightClick();
          await mainPage.waitForChangeIsSaved();
          await mainPage.clickCreatedBoardTitleOnCanvas();
          await designPanelPage.changeLayoutAlignment('Center');
          await mainPage.waitForChangeIsSaved();
        },
      );

      await mainAccountFileTest.step(
        'Verify alignment change on canvas',
        async () => {
          await expect(
            mainPage.viewport,
            'Viewport should match screenshot after changing component alignment inside flex board',
          ).toHaveScreenshot('component-inside-board-change-alignment.png', {
            mask: mainPage.maskViewport(),
          });
        },
      );
    },
  );
});
