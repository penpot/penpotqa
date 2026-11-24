import { DesignPanelPage } from '@pages/workspace/design-panel-page';
import { LayersPanelComponent } from '@pages/workspace/left-sidebar/layers-panel-component';
import { StrokeCap } from '@pages/workspace/right-sidebar/design-tab/stroke-section-component';
import { PathEditorPage } from '@pages/workspace/toolbar/path-editor/path-editor-page';
import type { Point } from '@pages/workspace/toolbar/path-editor/path-geometry';
import { WorkspacePage } from '@pages/workspace/workspace-page';
import { expect } from '@playwright/test';
import { demoAccountFileTest } from 'fixtures';
import type { MainPage } from '@pages/workspace/main-page';
import { qase } from 'playwright-qase-reporter/playwright';

let designPanelPage: DesignPanelPage;
let layers: LayersPanelComponent;
let workspacePage: WorkspacePage;
let pathEditorPage: PathEditorPage;

/** Viewport positions of the three nodes of the default path. */
const PATH_POINTS = [
  { x: 500, y: 200 },
  { x: 1200, y: 700 },
  { x: 1000, y: 400 },
];

/**
 * Draws the first three nodes of the default path, one Qase step each, and checks
 * each node and straight segment in the path editor overlay.
 * @param thirdStepName Name of the step that places the third node.
 * @returns The three nodes in design coordinates, in the order they were placed.
 */
async function drawThreeNodes(mainPage: MainPage, thirdStepName: string) {
  const { overlayComp } = pathEditorPage;
  const placed: Point[] = [];

  await demoAccountFileTest.step(
    'Click on the "Path (P)" tool in the toolbar at the top of the viewport',
    async () => {
      await mainPage.clickCreatePathButton();
      await pathEditorPage.checkPathToolActive();
    },
  );

  await demoAccountFileTest.step(
    'Click on an empty area of the viewport',
    async () => {
      await mainPage.clickViewportByCoordinates(PATH_POINTS[0].x, PATH_POINTS[0].y);
      await pathEditorPage.checkPathToolbarVisible();
      await overlayComp.checkNodeCount(1);
      placed.push(...(await overlayComp.getNodes()));
    },
  );

  await demoAccountFileTest.step(
    'Click on another area of the viewport',
    async () => {
      await mainPage.clickViewportByCoordinates(PATH_POINTS[1].x, PATH_POINTS[1].y);
      await overlayComp.checkNodeCount(2);
      placed.push(await newNode(placed));
      await overlayComp.checkSegmentIsCurve(placed[0], placed[1], false);
    },
  );

  await demoAccountFileTest.step(thirdStepName, async () => {
    await mainPage.clickViewportByCoordinates(PATH_POINTS[2].x, PATH_POINTS[2].y);
    await overlayComp.checkNodeCount(3);
    placed.push(await newNode(placed));
    await overlayComp.checkSegmentIsCurve(placed[1], placed[2], false);
  });

  return placed;
}

/** The node of the path editor that is not in `known` (the one just placed). */
async function newNode(known: Point[]): Promise<Point> {
  const nodes = await pathEditorPage.overlayComp.getNodes();
  const added = nodes.filter(
    (node) =>
      !known.some(
        (k) => Math.abs(k.x - node.x) < 0.5 && Math.abs(k.y - node.y) < 0.5,
      ),
  );
  expect(added, 'Exactly one new node was placed').toHaveLength(1);
  return added[0];
}

demoAccountFileTest.beforeEach(async ({ page }) => {
  workspacePage = new WorkspacePage(page);
  pathEditorPage = new PathEditorPage(page);
  designPanelPage = new DesignPanelPage(page);
  layers = workspacePage.leftSidebar.layers;
});

demoAccountFileTest(
  qase([487], 'Create Path (Toolbar) - closed'),
  async ({ mainPage }) => {
    const { overlayComp } = pathEditorPage;
    const [first, second, third] = await drawThreeNodes(
      mainPage,
      'Click on a third area of the viewport',
    );

    await demoAccountFileTest.step('Click on the starting node', async () => {
      await mainPage.clickViewportByCoordinates(PATH_POINTS[0].x, PATH_POINTS[0].y);
      await mainPage.waitForChangeIsSaved();
      await overlayComp.checkNodeCount(3);
      await overlayComp.checkSegments([
        [first, second],
        [second, third],
        [third, first],
      ]);
      await overlayComp.checkSegmentIsCurve(third, first, false);
      await layers.checkLayerRowIsVisible('Path');
      await pathEditorPage.checkPathToolbarVisible();
    });

    await demoAccountFileTest.step('Press Esc', async () => {
      await mainPage.clickOnESC();
      await pathEditorPage.checkPathToolbarVisible(false);
    });

    await demoAccountFileTest.step(
      'Check the selection of the new path',
      async () => {
        await layers.selectLayer('Path');
        await mainPage.waitForResizeHandlerVisible();
        await designPanelPage.checkSizeWidth('700');
        await designPanelPage.checkSizeHeight('500');
        await expect(mainPage.viewport).toHaveScreenshot('path-closed.png', {
          mask: mainPage.maskViewport(),
        });
      },
    );
  },
);

demoAccountFileTest(
  qase([489], 'Create Path (Toolbar) - opened'),
  async ({ mainPage }) => {
    const { overlayComp } = pathEditorPage;
    const [first, second, third] = await drawThreeNodes(
      mainPage,
      'Click on a third area of the viewport, closer to the starting node',
    );

    await demoAccountFileTest.step('Press Esc', async () => {
      await mainPage.clickOnESC();
      await mainPage.waitForChangeIsSaved();
      await overlayComp.checkNodeCount(3);
      await overlayComp.checkSegments([
        [first, second],
        [second, third],
      ]);
      await layers.checkLayerRowIsVisible('Path');
      await pathEditorPage.checkPathToolbarVisible();
      await expect(mainPage.viewport).toHaveScreenshot('path-opened.png', {
        mask: mainPage.maskViewport(),
      });
    });
  },
);

demoAccountFileTest(
  qase([501], 'Add, edit and remove Stroke Caps to Path (arrow, marker)'),
  async ({ mainPage }) => {
    const { stroke } = workspacePage.rightSidebar.design;

    await demoAccountFileTest.step(
      'Press P, click on three areas of the viewport and press Enter twice',
      async () => {
        await mainPage.pressKeyboardShortcut('P');
        await pathEditorPage.checkPathToolActive();
        for (const point of PATH_POINTS) {
          await mainPage.clickViewportByCoordinates(point.x, point.y);
        }
        await mainPage.pressKeyboardShortcut('Enter');
        await pathEditorPage.checkPathToolbarVisible();
        await mainPage.pressKeyboardShortcut('Enter');
        await mainPage.waitForChangeIsSaved();
        await pathEditorPage.checkPathToolbarVisible(false);
        await layers.checkLayerRowIsVisible('Path');
      },
    );

    await demoAccountFileTest.step('Select "Path" in the Layers panel', async () => {
      await layers.selectLayer('Path');
      await mainPage.waitForResizeHandlerVisible();
      await stroke.checkStrokeCaps(StrokeCap.None, StrokeCap.None);
    });

    await demoAccountFileTest.step(
      'In the Stroke section of the Design tab, select "Arrow" in the first cap dropdown',
      async () => {
        await designPanelPage.changeCap(StrokeCap.Arrow, 'first');
        await stroke.checkStrokeCaps(StrokeCap.Arrow, StrokeCap.None);
      },
    );

    await demoAccountFileTest.step(
      'Select "Diamond" in the second cap dropdown',
      async () => {
        await designPanelPage.changeCap(StrokeCap.Diamond, 'second');
        await stroke.checkStrokeCaps(StrokeCap.Arrow, StrokeCap.Diamond);
        await mainPage.waitForChangeIsSaved();
        await layers.selectLayer('Path');
        await mainPage.focusLayerViaShortcut();
        await expect(mainPage.viewport).toHaveScreenshot(
          'path-opened-with-arrow-and-diamond.png',
          {
            mask: mainPage.maskViewport(),
          },
        );
        await mainPage.focusLayerViaShortcut();
      },
    );

    await demoAccountFileTest.step(
      'Click on the switch button (⇄ icon) between the two cap dropdowns',
      async () => {
        await designPanelPage.clickSwitchCapButton();
        await stroke.checkStrokeCaps(StrokeCap.Diamond, StrokeCap.Arrow);
        await mainPage.clickViewportOnce();
        await layers.selectLayer('Path');
        await mainPage.waitForChangeIsSaved();
        await mainPage.focusLayerViaShortcut();
        await expect(mainPage.viewport).toHaveScreenshot(
          'path-opened-with-diamond-and-arrow.png',
          {
            mask: mainPage.maskViewport(),
          },
        );
        await mainPage.focusLayerViaShortcut();
      },
    );

    await demoAccountFileTest.step(
      'Select "None" in the first cap dropdown',
      async () => {
        await designPanelPage.changeCap(StrokeCap.None, 'first');
        await stroke.checkStrokeCaps(StrokeCap.None, StrokeCap.Arrow);
      },
    );

    await demoAccountFileTest.step(
      'Select "None" in the second cap dropdown',
      async () => {
        await designPanelPage.changeCap(StrokeCap.None, 'second');
        await stroke.checkStrokeCaps(StrokeCap.None, StrokeCap.None);
        await mainPage.clickViewportOnce();
        await layers.selectLayer('Path');
        await mainPage.waitForChangeIsSaved();
        await mainPage.focusLayerViaShortcut();
        await expect(mainPage.viewport).toHaveScreenshot(
          'path-opened-with-none.png',
          {
            mask: mainPage.maskViewport(),
          },
        );
        await mainPage.focusLayerViaShortcut();
      },
    );
  },
);

demoAccountFileTest.describe(() => {
  demoAccountFileTest.beforeEach(async ({ mainPage }) => {
    await demoAccountFileTest.step(
      'Press P, click on three areas of the viewport and then click on the first node to close the path',
      async () => {
        await mainPage.pressKeyboardShortcut('P');
        await pathEditorPage.checkPathToolActive();
        for (const point of [...PATH_POINTS, PATH_POINTS[0]]) {
          await mainPage.clickViewportByCoordinates(point.x, point.y);
        }
        await mainPage.waitForChangeIsSaved();
        await pathEditorPage.overlayComp.checkNodeCount(3);
        await pathEditorPage.checkPathToolbarVisible();
        await layers.checkLayerRowIsVisible('Path');
      },
    );
  });

  demoAccountFileTest(
    qase([512], 'Change rotation (Design page in the right)'),
    async ({ mainPage }) => {
      const rotations = [
        { typed: '90', expected: '90', snapshot: 'path-rotated-90.png' },
        { typed: '120', expected: '120', snapshot: 'path-rotated-120.png' },
        { typed: '45', expected: '45', snapshot: 'path-rotated-45.png' },
        { typed: '360', expected: '359', snapshot: 'path-rotated-359.png' },
      ];

      await demoAccountFileTest.step(
        'Select "Path" in the Layers panel',
        async () => {
          await layers.selectLayer('Path');
          await mainPage.waitForResizeHandlerVisible();
        },
      );

      for (const { typed, expected, snapshot } of rotations) {
        await demoAccountFileTest.step(
          `Type ${typed} in the Rotation field of the Design tab and press Enter`,
          async () => {
            await designPanelPage.changeRotationForLayer(typed);
            await mainPage.waitForChangeIsSaved();
            await designPanelPage.checkRotationForLayer(expected);
            await mainPage.isCornerHandleVisible();
            await expect(mainPage.viewport).toHaveScreenshot(snapshot, {
              mask: mainPage.maskViewport(),
            });
          },
        );
      }
    },
  );

  demoAccountFileTest(
    qase([513], 'Delete Path (From right click)'),
    async ({ mainPage }) => {
      await demoAccountFileTest.step(
        'Right-click on "Path" in the Layers panel',
        async () => {
          await layers.openLayerContextMenu('Path');
          await expect(
            mainPage.deleteLayerMenuItem,
            'The context menu is open',
          ).toBeVisible();
        },
      );

      await demoAccountFileTest.step(
        'Click on the "Delete" option of the context menu',
        async () => {
          await mainPage.deleteLayerMenuItem.click();
          await mainPage.waitForChangeIsSaved();
          await mainPage.isCreatedLayerVisible(false);
          await layers.checkLayerRowIsVisible('Path', false);
        },
      );
    },
  );

  demoAccountFileTest(
    qase([2543], 'Delete Path (From Keyboard)'),
    async ({ mainPage }) => {
      await demoAccountFileTest.step(
        'Select "Path" in the Layers panel',
        async () => {
          await layers.selectLayer('Path');
          await mainPage.waitForResizeHandlerVisible();
        },
      );

      await demoAccountFileTest.step('Press Delete', async () => {
        await mainPage.pressDeleteKeyboardButton();
        await mainPage.waitForChangeIsSaved();
        await mainPage.isCreatedLayerVisible(false);
        await layers.checkLayerRowIsVisible('Path', false);
      });
    },
  );

  demoAccountFileTest(
    qase(
      [525],
      'Flip Vertical and Flip Horizontal path (From right click and Shortcut Shift +V Shift + H)',
    ),
    async ({ mainPage }) => {
      await demoAccountFileTest.step(
        'Right-click on "Path" in the Layers panel and click on the "Flip vertical" option',
        async () => {
          await layers.openLayerContextMenu('Path');
          await mainPage.flipVerticalMenuItem.click();
          await mainPage.waitForChangeIsSaved();
          await expect(mainPage.viewport).toHaveScreenshot(
            'path-flipped-vertical.png',
            {
              mask: mainPage.maskViewport(),
            },
          );
        },
      );

      await demoAccountFileTest.step(
        'Right-click on "Path" in the Layers panel and click on the "Flip horizontal" option',
        async () => {
          await layers.openLayerContextMenu('Path');
          await mainPage.flipHorizontalMenuItem.click();
          await mainPage.waitForChangeIsSaved();
          await expect(mainPage.viewport).toHaveScreenshot(
            'path-flipped-vertical-horizontal.png',
            {
              mask: mainPage.maskViewport(),
            },
          );
        },
      );

      await demoAccountFileTest.step('Press Shift+V', async () => {
        await mainPage.flipVerticalViaShortcut();
        await mainPage.waitForChangeIsSaved();
        await expect(mainPage.viewport).toHaveScreenshot(
          'path-flipped-horizontal.png',
          {
            mask: mainPage.maskViewport(),
          },
        );
      });

      await demoAccountFileTest.step('Press Shift+H', async () => {
        await mainPage.flipHorizontalViaShortcut();
        await mainPage.waitForChangeIsSaved();
        await expect(mainPage.viewport).toHaveScreenshot(
          'path-non-flipped-jpeg.png',
          {
            mask: mainPage.maskViewport(),
          },
        );
      });
    },
  );

  demoAccountFileTest(qase([537], 'Selection to board'), async ({ mainPage }) => {
    await demoAccountFileTest.step(
      'Right-click on "Path" in the Layers panel and click on the "Selection to board" option (or press Ctrl+Alt+G)',
      async () => {
        await layers.openLayerContextMenu('Path');
        await mainPage.selectionToBoardMenuItem.click();
        await mainPage.waitForChangeIsSaved();
        await layers.checkLayerIsChildOf('Path', 'Board');
        await expect(mainPage.viewport).toHaveScreenshot('path-to-board.png', {
          mask: mainPage.maskViewport(),
        });
      },
    );
  });
});
