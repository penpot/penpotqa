import {
  StrokePosition,
  StrokeStyle,
} from '@pages/workspace/right-sidebar/design-tab/stroke/stroke-row-options-component';
import { StrokeCap } from '@pages/workspace/right-sidebar/design-tab/stroke/stroke-section-component';
import type { PathEditorPage } from '@pages/workspace/toolbar/path-editor/path-editor-page';
import type { Point } from '@pages/workspace/toolbar/path-editor/path-geometry';
import { expect } from '@playwright/test';
import { pathTest } from '@tests/composition/path/path-fixture';
import { qase } from 'playwright-qase-reporter/playwright';

/** Viewport positions of the three nodes of the default path. */
const PATH_POINTS = [
  { x: 500, y: 200 },
  { x: 1200, y: 700 },
  { x: 1000, y: 400 },
];

/**
 * Draws the first three nodes of the default path with the Path tool, one Qase
 * step each, and checks each straight segment in the path editor overlay.
 * @param pathEditorPage Page object of the workspace and its path editor.
 * @param thirdStepName Name of the step that places the third node.
 * @returns The three nodes in design coordinates, in the order they were placed.
 */
async function drawThreeNodes(
  pathEditorPage: PathEditorPage,
  thirdStepName: string,
): Promise<Point[]> {
  const { overlayComp } = pathEditorPage;
  const placed: Point[] = [];

  await pathTest.step(
    'Click on the "Path (P)" tool in the toolbar at the top of the viewport',
    async () => {
      await pathEditorPage.clickCreatePathButton();
      await pathEditorPage.checkPathToolActive();
    },
  );

  await pathTest.step('Click on an empty area of the viewport', async () => {
    placed.push(await pathEditorPage.placeNode(PATH_POINTS[0]));
    await pathEditorPage.checkPathToolbarVisible();
  });

  await pathTest.step('Click on another area of the viewport', async () => {
    placed.push(await pathEditorPage.placeNode(PATH_POINTS[1]));
    await overlayComp.checkSegmentIsCurve(placed[0], placed[1], false);
  });

  await pathTest.step(thirdStepName, async () => {
    placed.push(await pathEditorPage.placeNode(PATH_POINTS[2]));
    await overlayComp.checkSegmentIsCurve(placed[1], placed[2], false);
  });

  return placed;
}

pathTest(
  qase([487], 'Create Path (Toolbar) - closed'),
  async ({ mainPage, pathEditorPage, layers, designPanelPage }) => {
    const { overlayComp } = pathEditorPage;
    const [first, second, third] = await drawThreeNodes(
      pathEditorPage,
      'Click on a third area of the viewport',
    );

    await pathTest.step('Click on the starting node', async () => {
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

    await pathTest.step('Press Esc', async () => {
      await mainPage.clickOnESC();
      await pathEditorPage.checkPathToolbarVisible(false);
    });

    await pathTest.step('Check the selection of the new path', async () => {
      await layers.selectLayer('Path');
      await mainPage.waitForResizeHandlerVisible();
      await designPanelPage.checkSizeWidth('700');
      await designPanelPage.checkSizeHeight('500');
      await expect(mainPage.viewport).toHaveScreenshot('path-closed.png', {
        mask: mainPage.maskViewport(),
      });
    });
  },
);

pathTest(
  qase([489], 'Create Path (Toolbar) - opened'),
  async ({ mainPage, pathEditorPage, layers }) => {
    const { overlayComp } = pathEditorPage;
    const [first, second, third] = await drawThreeNodes(
      pathEditorPage,
      'Click on a third area of the viewport, closer to the starting node',
    );

    await pathTest.step('Press Esc', async () => {
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

pathTest(
  qase(
    [490, 499],
    'Create Path (Shortcut P) - opened, then edit and delete its stroke',
  ),
  async ({ mainPage, workspacePage, pathEditorPage, layers }) => {
    const { overlayComp } = pathEditorPage;
    const { stroke } = workspacePage.rightSidebar.design;
    await pathTest.step('(490) Create Path (Shortcut P) - opened', async () => {
      let first: Point;
      let second: Point;

      await pathTest.step('Press P keyboard button', async () => {
        await mainPage.pressKeyboardShortcut('P');
        await pathEditorPage.checkPathToolActive();
      });

      await pathTest.step('Click on the canvas', async () => {
        first = await pathEditorPage.placeNode(PATH_POINTS[0]);
        await pathEditorPage.checkPathToolbarVisible();
      });

      await pathTest.step(
        'Click and drag to another area (closer to starting node, to make a semi-ellipse)',
        async () => {
          // Pressing at the new node and dragging sets its handler, so the segment curves
          second = await pathEditorPage.placeCurvedNode(
            { x: first.x + 300, y: first.y },
            { x: 0, y: 150 },
          );
        },
      );

      await pathTest.step('Press ENTER on keyboard', async () => {
        await mainPage.pressKeyboardShortcut('Enter');
        await mainPage.waitForChangeIsSaved();
        await overlayComp.checkNodes([first, second]);
        await overlayComp.checkSegments([[first, second]]);
        await overlayComp.checkSegmentIsCurve(first, second, true);
        await layers.checkLayerRowIsVisible('Path');
      });
    });

    await pathTest.step('(499) Edit and delete Stroke to Path', async () => {
      await pathTest.step('Select path', async () => {
        // Enter again leaves the path editor, so the path can be selected
        await mainPage.pressKeyboardShortcut('Enter');
        await mainPage.waitForChangeIsSaved();
        await pathEditorPage.checkPathToolbarVisible(false);
        await layers.selectLayer('Path');
        await mainPage.waitForResizeHandlerVisible();
      });

      await pathTest.step('Click "+" button next to "Stroke"', async () => {
        // A drawn path already has a default stroke, so "+" adds a second one
        await stroke.addStroke();
        await mainPage.waitForChangeIsSaved();
        await stroke.checkStrokeCount(2);
      });

      await pathTest.step(
        'Change color, opacity, thickness, type, position in "Stroke" section on "Design" panel (on the right)',
        async () => {
          const addedStroke = stroke.getStrokeRow(1);
          await addedStroke.setColor('#43E50B');
          await addedStroke.setOpacity('60');
          await addedStroke.setWidth('10');
          await addedStroke.setStyle(StrokeStyle.Dotted);
          await addedStroke.setPosition(StrokePosition.Outside);
          await mainPage.waitForChangeIsSaved();
          await addedStroke.checkColor('#43E50B');
          await addedStroke.checkOpacity('60');
          await addedStroke.checkWidth('10');
          await addedStroke.checkStyle(StrokeStyle.Dotted);
          await addedStroke.checkPosition(StrokePosition.Outside);
        },
      );

      await pathTest.step('Click "-" button in "Stroke" section', async () => {
        // Remove the edited stroke and the default one, so the path has none left
        await stroke.getStrokeRow(1).remove();
        await stroke.checkStrokeCount(1);
        await stroke.getStrokeRow(0).remove();
        await mainPage.waitForChangeIsSaved();
        await stroke.checkStrokeCount(0);
      });
    });
  },
);

pathTest(
  qase([501], 'Add, edit and remove Stroke Caps to Path (arrow, marker)'),
  async ({ mainPage, workspacePage, pathEditorPage, layers, designPanelPage }) => {
    const { stroke } = workspacePage.rightSidebar.design;

    await pathTest.step(
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

    await pathTest.step('Select "Path" in the Layers panel', async () => {
      await layers.selectLayer('Path');
      await mainPage.waitForResizeHandlerVisible();
      await stroke.checkStrokeCaps(StrokeCap.None, StrokeCap.None);
    });

    await pathTest.step(
      'In the Stroke section of the Design tab, select "Arrow" in the first cap dropdown',
      async () => {
        await designPanelPage.changeCap(StrokeCap.Arrow, 'first');
        await stroke.checkStrokeCaps(StrokeCap.Arrow, StrokeCap.None);
      },
    );

    await pathTest.step('Select "Diamond" in the second cap dropdown', async () => {
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
    });

    await pathTest.step(
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

    await pathTest.step('Select "None" in the first cap dropdown', async () => {
      await designPanelPage.changeCap(StrokeCap.None, 'first');
      await stroke.checkStrokeCaps(StrokeCap.None, StrokeCap.Arrow);
    });

    await pathTest.step('Select "None" in the second cap dropdown', async () => {
      await designPanelPage.changeCap(StrokeCap.None, 'second');
      await stroke.checkStrokeCaps(StrokeCap.None, StrokeCap.None);
      await mainPage.clickViewportOnce();
      await layers.selectLayer('Path');
      await mainPage.waitForChangeIsSaved();
      await mainPage.focusLayerViaShortcut();
      await expect(mainPage.viewport).toHaveScreenshot('path-opened-with-none.png', {
        mask: mainPage.maskViewport(),
      });
      await mainPage.focusLayerViaShortcut();
    });
  },
);

pathTest.describe(() => {
  pathTest.beforeEach(async ({ mainPage, pathEditorPage, layers }) => {
    await pathTest.step(
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

  pathTest(
    qase([512], 'Change rotation (Design page in the right)'),
    async ({ mainPage, layers, designPanelPage }) => {
      const rotations = [
        { typed: '90', expected: '90', snapshot: 'path-rotated-90.png' },
        { typed: '120', expected: '120', snapshot: 'path-rotated-120.png' },
        { typed: '45', expected: '45', snapshot: 'path-rotated-45.png' },
        { typed: '360', expected: '359', snapshot: 'path-rotated-359.png' },
      ];

      await pathTest.step('Select "Path" in the Layers panel', async () => {
        await layers.selectLayer('Path');
        await mainPage.waitForResizeHandlerVisible();
      });

      for (const { typed, expected, snapshot } of rotations) {
        await pathTest.step(
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

  pathTest(
    qase([513], 'Delete Path (From right click)'),
    async ({ mainPage, workspacePage, layers }) => {
      await pathTest.step('Right-click on "Path" in the Layers panel', async () => {
        await layers.openLayerContextMenu('Path');
        await workspacePage.contextMenu.checkItemsAreVisible(['Delete']);
      });

      await pathTest.step(
        'Click on the "Delete" option of the context menu',
        async () => {
          await workspacePage.contextMenu.clickItem('Delete');
          await mainPage.waitForChangeIsSaved();
          await mainPage.isCreatedLayerVisible(false);
          await layers.checkLayerRowIsVisible('Path', false);
        },
      );
    },
  );

  pathTest(
    qase([2543], 'Delete Path (From Keyboard)'),
    async ({ mainPage, layers }) => {
      await pathTest.step('Select "Path" in the Layers panel', async () => {
        await layers.selectLayer('Path');
        await mainPage.waitForResizeHandlerVisible();
      });

      await pathTest.step('Press Delete', async () => {
        await mainPage.pressDeleteKeyboardButton();
        await mainPage.waitForChangeIsSaved();
        await mainPage.isCreatedLayerVisible(false);
        await layers.checkLayerRowIsVisible('Path', false);
      });
    },
  );

  pathTest(
    qase(
      [525],
      'Flip Vertical and Flip Horizontal path (From right click and Shortcut Shift +V Shift + H)',
    ),
    async ({ mainPage, layers }) => {
      await pathTest.step(
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

      await pathTest.step(
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

      await pathTest.step('Press Shift+V', async () => {
        await mainPage.flipVerticalViaShortcut();
        await mainPage.waitForChangeIsSaved();
        await expect(mainPage.viewport).toHaveScreenshot(
          'path-flipped-horizontal.png',
          {
            mask: mainPage.maskViewport(),
          },
        );
      });

      await pathTest.step('Press Shift+H', async () => {
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

  pathTest(qase([537], 'Selection to board'), async ({ mainPage, layers }) => {
    await pathTest.step(
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
