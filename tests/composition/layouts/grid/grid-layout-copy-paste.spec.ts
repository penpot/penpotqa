import { qase } from 'playwright-qase-reporter/playwright';
import { layoutTest } from '@tests/composition/layouts/layout-fixture';

layoutTest.describe('Copy and paste grid rows and columns', () => {
  // A 2x2 grid in grid edit mode: cells 1 and 2 are the first row, 1 and 3 the first column
  layoutTest.beforeEach(async ({ mainPage, workspacePage, designPanelPage }) => {
    await mainPage.createDefaultBoardByCoordinates(400, 400);
    await designPanelPage.changeHeightAndWidthForLayer('300', '400');
    await mainPage.waitForChangeIsSaved();
    await mainPage.addGridLayoutViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await mainPage.clickViewportOnce();
    await mainPage.clickCreatedBoardTitleOnCanvas();
    await designPanelPage.expandGridLayoutMenu();
    await designPanelPage.openGridEditModeFromDesignPanel();
    await workspacePage.gridEditor.checkGridSize(2, 2);
  });

  layoutTest(
    qase([2921, 2922], 'Copy and paste entire rows and columns in existing table'),
    async ({ mainPage, workspacePage }) => {
      const { gridEditor, contextMenu } = workspacePage;
      const { layers } = workspacePage.leftSidebar;

      await layoutTest.step(
        '(2921) Add a board to each cell of the first row',
        async () => {
          await gridEditor.openCellContextMenu(1);
          await contextMenu.clickItem('Create board');
          await mainPage.waitForChangeIsSaved();
          await layers.checkChildLayerCount('Board', 1);
          await gridEditor.openCellContextMenu(2);
          await contextMenu.clickItem('Create board');
          await mainPage.waitForChangeIsSaved();
          await layers.checkChildLayerCount('Board', 2);
        },
      );

      await layoutTest.step(
        '(2921) Select the whole row and right-click it: the menu has "Copy rows" and "Paste"',
        async () => {
          await gridEditor.selectCells(1, 2);
          await gridEditor.openCellContextMenu(1);
          await contextMenu.checkItemsAreVisible(['Copy rows', 'Paste']);
          await contextMenu.clickItem('Copy rows');
        },
      );

      await layoutTest.step(
        '(2921) Right-click the grid and Paste: a new row with the same boards is added',
        async () => {
          await gridEditor.openCellContextMenu(4);
          await contextMenu.clickItem('Paste');
          await mainPage.waitForChangeIsSaved();
          await gridEditor.checkGridSize(2, 3);
          await layers.checkChildLayerCount('Board', 4);
        },
      );

      await layoutTest.step(
        '(2921) Press Ctrl+Z once: the pasted row is removed',
        async () => {
          await mainPage.clickShortcutCtrlZ();
          await mainPage.waitForChangeIsSaved();
          await gridEditor.checkGridSize(2, 2);
          await layers.checkChildLayerCount('Board', 2);
        },
      );

      await layoutTest.step(
        '(2922) Add a board to the second cell of the first column (the first one has a board)',
        async () => {
          await gridEditor.openCellContextMenu(3);
          await contextMenu.clickItem('Create board');
          await mainPage.waitForChangeIsSaved();
          await layers.checkChildLayerCount('Board', 3);
        },
      );

      await layoutTest.step(
        '(2922) Select the whole column and right-click it: the menu has "Copy columns" and "Paste"',
        async () => {
          await gridEditor.selectCells(1, 3);
          await gridEditor.openCellContextMenu(1);
          await contextMenu.checkItemsAreVisible(['Copy columns', 'Paste']);
          await contextMenu.clickItem('Copy columns');
        },
      );

      await layoutTest.step(
        '(2922) Right-click the grid and Paste: a new column with the same boards is added',
        async () => {
          await gridEditor.openCellContextMenu(4);
          await contextMenu.clickItem('Paste');
          await mainPage.waitForChangeIsSaved();
          await gridEditor.checkGridSize(3, 2);
          await layers.checkChildLayerCount('Board', 5);
        },
      );

      await layoutTest.step(
        '(2922) Press Ctrl+Z once: the pasted column is removed',
        async () => {
          await mainPage.clickShortcutCtrlZ();
          await mainPage.waitForChangeIsSaved();
          await gridEditor.checkGridSize(2, 2);
          await layers.checkChildLayerCount('Board', 3);
        },
      );
    },
  );
});
