import { DesignPanelPage } from '@pages/workspace/design-panel-page';
import { LayersPanelPage } from '@pages/workspace/layers-panel-page';
import { WorkspacePage } from '@pages/workspace/workspace-page';
import { expect } from '@playwright/test';
import { demoAccountFileTest } from 'fixtures';
import { qase } from 'playwright-qase-reporter/playwright';

const defaultNameRectangle = 'Rectangle';
let designPanelPage: DesignPanelPage;
let layersPanelPage: LayersPanelPage;
let workspacePage: WorkspacePage;

demoAccountFileTest.beforeEach(async ({ page }) => {
  workspacePage = new WorkspacePage(page);
  designPanelPage = new DesignPanelPage(page);
  layersPanelPage = new LayersPanelPage(page);
});

demoAccountFileTest(
  qase([275], 'Create Rectangle (Shortcut R)'),
  async ({ mainPage }) => {
    await demoAccountFileTest.step('Press "R" keyboard button', async () => {
      await mainPage.pressKeyboardShortcut('R');
      await mainPage.isShapeToolActive('rect');
    });

    await demoAccountFileTest.step('Click on the canvas', async () => {
      await mainPage.clickViewportTwice();
      await mainPage.waitForChangeIsSaved();
      await mainPage.isCreatedLayerVisible();
      await layersPanelPage.isLayerNameDisplayed(defaultNameRectangle);
      await designPanelPage.checkSizeWidth('100');
      await designPanelPage.checkSizeHeight('100');
    });
  },
);

demoAccountFileTest(
  qase([274], 'Create Rectangle (Toolbar)'),
  async ({ mainPage }) => {
    await demoAccountFileTest.step(
      'Click Rectangle icon in the toolbar',
      async () => {
        await mainPage.clickCreateRectangleButton();
        await mainPage.isShapeToolActive('rect');
      },
    );

    await demoAccountFileTest.step('Click on the canvas', async () => {
      await mainPage.clickViewportTwice();
      await mainPage.waitForChangeIsSaved();
      await mainPage.isCreatedLayerVisible();
      await layersPanelPage.isLayerNameDisplayed(defaultNameRectangle);
      await designPanelPage.checkSizeWidth('100');
      await designPanelPage.checkSizeHeight('100');
      await expect(mainPage.viewport).toHaveScreenshot('rectangle.png', {
        mask: mainPage.maskViewport(),
      });
    });
  },
);

demoAccountFileTest.describe(() => {
  demoAccountFileTest.beforeEach(async ({ mainPage }) => {
    await demoAccountFileTest.slow();
    await demoAccountFileTest.step('Create a rectangle', async () => {
      await mainPage.clickCreateRectangleButton();
      await mainPage.clickViewportTwice();
      await mainPage.waitForChangeIsSaved();
      await workspacePage.leftSidebar.layers.checkLayerRowIsVisible(
        defaultNameRectangle,
      );
    });
  });

  demoAccountFileTest(
    qase([278], 'Change border radius multiple values (Design page in the right)'),
    async ({ mainPage }) => {
      await demoAccountFileTest.step('Select rectangle', async () => {
        await workspacePage.leftSidebar.layers.selectLayer(defaultNameRectangle);
        await mainPage.waitForResizeHandlerVisible();
      });

      await demoAccountFileTest.step(
        'Click the "Show independent radius" button in the Design tab',
        async () => {
          await designPanelPage.clickIndividualCornersRadiusButton();
          await designPanelPage.checkIndividualCorners('0', '0', '0', '0');
        },
      );

      const corners = [
        {
          step: 'first',
          label: 'Top left',
          value: '30',
          change: 'changeTopLeftCornerRadiusForLayer',
        },
        {
          step: 'second',
          label: 'Top right',
          value: '60',
          change: 'changeTopRightCornerRadiusForLayer',
        },
        {
          step: '3rd',
          label: 'Bottom left',
          value: '90',
          change: 'changeBottomLeftCornerRadiusForLayer',
        },
        {
          step: '4th',
          label: 'Bottom right',
          value: '120',
          change: 'changeBottomRightCornerRadiusForLayer',
        },
      ] as const;

      for (const { step, label, value, change } of corners) {
        await demoAccountFileTest.step(
          `Change the ${step} radius to ${value}`,
          async () => {
            await designPanelPage[change](value);
            await mainPage.waitForChangeIsSaved();
            await designPanelPage.checkTokenField(label, value);
          },
        );
      }

      await demoAccountFileTest.step('Change all radiuses to 0', async () => {
        await designPanelPage.changeIndependentCorners('0', '0', '0', '0');
        await mainPage.waitForChangeIsSaved();
        await designPanelPage.checkIndividualCorners('0', '0', '0', '0');
      });
    },
  );

  demoAccountFileTest(
    qase([319], 'Transform Rectangle to Path'),
    async ({ mainPage }) => {
      await demoAccountFileTest.step(
        'Click RMB on rectangle - click "Flatten" menu item',
        async () => {
          await mainPage.transformToPathViaRightClick();
          await mainPage.waitForChangeIsUnsaved();
          await mainPage.waitForChangeIsSaved();
          await layersPanelPage.isPathComponentOnLayersTabVisible();
        },
      );
    },
  );

  demoAccountFileTest(
    qase(
      [324],
      'Create component and detach instance (Right click and shortcut Ctrl+Shift+K)',
    ),
    async ({ mainPage }) => {
      await demoAccountFileTest.step(
        'Create component from rectangle via right click',
        async () => {
          await mainPage.createComponentViaRightClick();
          await mainPage.waitForChangeIsSaved();
          await layersPanelPage.isMainComponentOnLayersTabVisibleWithName(
            'Rectangle',
          );
        },
      );

      await demoAccountFileTest.step(
        'Copy created rectangle component twice',
        async () => {
          await mainPage.duplicateLayerViaRightClick();
          await mainPage.waitForChangeIsSaved();
          await layersPanelPage.checkCopyComponentLayerCount(1);
          await mainPage.duplicateLayerViaRightClick();
          await mainPage.waitForChangeIsSaved();
          await layersPanelPage.checkCopyComponentLayerCount(2);
        },
      );

      await demoAccountFileTest.step(
        'Select 1st rectangle, right click and click on "Detach instance"',
        async () => {
          await layersPanelPage.detachInstanceFirstCopyComponentViaRightClick();
          await mainPage.waitForChangeIsSaved();
          await layersPanelPage.checkCopyComponentLayerCount(1);
          await workspacePage.leftSidebar.layers.checkLayerIsChildOf(
            'Rectangle',
            'Rectangle',
            'board',
          );
        },
      );

      await demoAccountFileTest.step(
        'Select 2nd rectangle and press Shift+Ctrl+K',
        async () => {
          await layersPanelPage.clickCopyComponentOnLayersTab();
          await mainPage.detachInstanceViaShortcut();
          await mainPage.waitForChangeIsSaved();
          await layersPanelPage.checkCopyComponentLayerCount(0);
          await workspacePage.leftSidebar.layers.checkLayerIsChildOf(
            'Rectangle',
            'Rectangle',
            'board',
          );
        },
      );
    },
  );
});

demoAccountFileTest(
  qase([2255], 'Select and deselect rectangles'),
  async ({ mainPage }) => {
    const rectangleCoordinates = [
      { x: 400, y: 800 },
      { x: 400, y: 200 },
      { x: 100, y: 600 },
      { x: 700, y: 600 },
    ];

    for (const [index, { x, y }] of rectangleCoordinates.entries()) {
      await demoAccountFileTest.step('Create a rectangle', async () => {
        await mainPage.createDefaultRectangleByCoordinates(x, y);
        await layersPanelPage.isNumLayerNameVisible(defaultNameRectangle, index + 1);
      });
    }

    await demoAccountFileTest.step('Select the 4 rectangles (CTRL+A)', async () => {
      await mainPage.clickViewportTwice();
      await mainPage.waitForChangeIsSaved();
      await mainPage.pressSelectAllShortcut();
      await workspacePage.leftSidebar.layers.checkSelectedLayersCount(4);
      await expect(mainPage.viewport).toHaveScreenshot(
        'four-rectangles-selected.png',
        {
          mask: mainPage.maskViewport(),
        },
      );
    });

    await demoAccountFileTest.step(
      'Deselect a rectangle (by holding CTRL+SHIFT keyboard button)',
      async () => {
        await mainPage.deselectElement();
        await workspacePage.leftSidebar.layers.checkSelectedLayersCount(3);
        await expect(mainPage.viewport).toHaveScreenshot(
          'three-rectangle-selected.png',
          {
            mask: mainPage.maskViewport(),
          },
        );
      },
    );

    await demoAccountFileTest.step(
      'Deselect two rectangles (by holding CTRL+SHIFT keyboard button)',
      async () => {
        await mainPage.deselectElement();
        await mainPage.deselectElement();
        await workspacePage.leftSidebar.layers.checkSelectedLayersCount(1);
        await expect(mainPage.viewport).toHaveScreenshot(
          'one-rectangle-selected.png',
          {
            mask: mainPage.maskViewport(),
          },
        );
      },
    );
  },
);

demoAccountFileTest(
  qase(
    [312, 313],
    'Change the order of rectangles (Bring forward/to front, Send backward/to back) from right-click and shortcuts',
  ),
  async ({ mainPage }) => {
    const { layers } = workspacePage.leftSidebar;
    const { contextMenu } = workspacePage;

    for (const [index, x] of [200, 400, 600].entries()) {
      await demoAccountFileTest.step('Create a rectangle', async () => {
        // Wait for each rectangle, or on a slow run the next tool click cancels it
        await mainPage.createDefaultRectangleByCoordinates(x, 200);
        await layersPanelPage.isNumLayerNameVisible(defaultNameRectangle, 1);
        // Name it by creation order, to tell them apart
        await layers.renameLayer(defaultNameRectangle, `Rect ${index + 1}`);
        await mainPage.waitForChangeIsSaved();
        await layers.checkLayerOrder(
          [3, 2, 1].filter((n) => n <= index + 1).map((n) => `Rect ${n}`),
        );
      });
    }

    // Each step either right-clicks the layer and picks a menu item, or selects it and
    // presses a shortcut; then checks the layers order, top first
    const steps = [
      {
        layer: 'Rect 2',
        menuItem: 'Send backward',
        name: 'Click RMB on the 2nd rectangle - click "Send backward" menu item',
        order: ['Rect 3', 'Rect 1', 'Rect 2'],
      },
      {
        layer: 'Rect 2',
        menuItem: 'Bring forward',
        name: 'Click RMB on the 2nd rectangle - click "Bring forward" menu item',
        order: ['Rect 3', 'Rect 2', 'Rect 1'],
      },
      {
        layer: 'Rect 1',
        shortcut: 'Control+ArrowUp',
        name: 'Select 1st rectangle and press CTRL + arrow up on keyboard',
        order: ['Rect 3', 'Rect 1', 'Rect 2'],
      },
      {
        layer: 'Rect 1',
        shortcut: 'Control+ArrowDown',
        name: 'Select 1st rectangle and press CTRL + arrow down on keyboard',
        order: ['Rect 3', 'Rect 2', 'Rect 1'],
      },
      {
        layer: 'Rect 2',
        menuItem: 'Send to back',
        name: 'Click RMB on the 2nd rectangle - click "Send to back" menu item',
        order: ['Rect 3', 'Rect 1', 'Rect 2'],
      },
      {
        layer: 'Rect 2',
        menuItem: 'Bring to front',
        name: 'Click RMB on the 2nd rectangle - click "Bring to front" menu item',
        order: ['Rect 2', 'Rect 3', 'Rect 1'],
      },
      {
        layer: 'Rect 1',
        shortcut: 'Control+Shift+ArrowUp',
        name: 'Select 1st rectangle and press CTRL + SHIFT+ arrow up on keyboard',
        order: ['Rect 1', 'Rect 2', 'Rect 3'],
      },
      {
        layer: 'Rect 1',
        shortcut: 'Control+Shift+ArrowDown',
        name: 'Select 1st rectangle and press CTRL + SHIFT+ arrow down on keyboard',
        order: ['Rect 2', 'Rect 3', 'Rect 1'],
      },
    ];

    for (const { layer, menuItem, shortcut, order, name } of steps) {
      await demoAccountFileTest.step(name, async () => {
        if (menuItem) {
          await layers.openLayerContextMenu(layer);
          await contextMenu.clickItem(menuItem);
        } else {
          await layersPanelPage.selectLayerByExactName(layer);
          await mainPage.pressKeyboardShortcut(shortcut!);
        }
        await mainPage.waitForChangeIsSaved();
        await layers.checkLayerOrder(order);
      });
    }
  },
);
