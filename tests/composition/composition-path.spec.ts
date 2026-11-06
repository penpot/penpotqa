import { DesignPanelPage } from '@pages/workspace/design-panel-page';
import { LayersPanelPage } from '@pages/workspace/layers-panel-page';
import { StrokeCap } from '@pages/workspace/right-sidebar/design-tab/stroke-section-component';
import { PathEditorPage } from '@pages/workspace/toolbar/path-editor/path-editor-page';
import { WorkspacePage } from '@pages/workspace/workspace-page';
import { expect } from '@playwright/test';
import { demoAccountFileTest } from 'fixtures';
import { qase } from 'playwright-qase-reporter/playwright';

let designPanelPage: DesignPanelPage;
let layersPanelPage: LayersPanelPage;
let workspacePage: WorkspacePage;
let pathEditorPage: PathEditorPage;

demoAccountFileTest.beforeEach(async ({ page }) => {
  workspacePage = new WorkspacePage(page);
  pathEditorPage = new PathEditorPage(page);
  designPanelPage = new DesignPanelPage(page);
  layersPanelPage = new LayersPanelPage(page);
});

demoAccountFileTest(
  qase([487], 'Create Path (Toolbar) - closed'),
  async ({ mainPage }) => {
    await demoAccountFileTest.step(
      'Click on the Path tool and on three areas of the viewport, then click on the starting node',
      async () => {
        await mainPage.createDefaultClosedPath();
        await mainPage.isCreatedLayerVisible();
      },
    );

    await demoAccountFileTest.step('Press Esc', async () => {
      await mainPage.clickOnESC();
      await pathEditorPage.checkPathToolbarVisible(false);
    });

    await demoAccountFileTest.step(
      'Check the selection of the new path',
      async () => {
        await layersPanelPage.selectLayerByName('Path');
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
    await demoAccountFileTest.step(
      'Create path and finish it with Esc',
      async () => {
        await mainPage.createOpenPathWithEsc();
        await mainPage.isCreatedLayerVisible();
      },
    );

    await demoAccountFileTest.step(
      'Verify path remains open for editing',
      async () => {
        await pathEditorPage.checkPathToolbarVisible();
        await expect(mainPage.viewport).toHaveScreenshot('path-opened.png', {
          mask: mainPage.maskViewport(),
        });
      },
    );
  },
);

demoAccountFileTest(
  qase([501], 'Add, edit and remove Stroke Caps to Path (arrow, marker)'),
  async ({ mainPage }) => {
    const { stroke } = workspacePage.rightSidebar.design;

    await demoAccountFileTest.step(
      'Create the path and select "Path" in the Layers panel',
      async () => {
        await mainPage.createDefaultOpenPath();
        await mainPage.waitForChangeIsSaved();
        await layersPanelPage.selectLayerByName('Path');
        await stroke.checkStrokeCaps(StrokeCap.None, StrokeCap.None);
      },
    );

    await demoAccountFileTest.step(
      'Select "Arrow" in the first cap dropdown',
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
        await layersPanelPage.selectLayerByName('Path');
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

    await demoAccountFileTest.step('Click on the switch caps button', async () => {
      await designPanelPage.clickSwitchCapButton();
      await stroke.checkStrokeCaps(StrokeCap.Diamond, StrokeCap.Arrow);
      await mainPage.clickViewportOnce();
      await layersPanelPage.selectLayerByName('Path');
      await mainPage.waitForChangeIsSaved();
      await mainPage.focusLayerViaShortcut();
      await expect(mainPage.viewport).toHaveScreenshot(
        'path-opened-with-diamond-and-arrow.png',
        {
          mask: mainPage.maskViewport(),
        },
      );
      await mainPage.focusLayerViaShortcut();
    });

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
        await layersPanelPage.selectLayerByName('Path');
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
    await mainPage.createDefaultClosedPath();
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

      for (const { typed, expected, snapshot } of rotations) {
        await demoAccountFileTest.step(
          `Type ${typed} in the Rotation field and press Enter`,
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
        'Right-click on "Path" and click on the "Delete" option',
        async () => {
          await mainPage.isCreatedLayerVisible();
          await mainPage.deleteLayerViaRightClick();
          await mainPage.waitForChangeIsSaved();
          await mainPage.isCreatedLayerVisible(false);
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
          await layersPanelPage.selectLayerByName('Path');
        },
      );

      await demoAccountFileTest.step('Press Delete', async () => {
        await mainPage.pressDeleteKeyboardButton();
        await mainPage.waitForChangeIsSaved();
        await mainPage.isCreatedLayerVisible(false);
        await layersPanelPage.isLayerNameNotDisplayed('Path');
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
        'Right-click on "Path" and click on the "Flip vertical" option',
        async () => {
          await mainPage.flipVerticalViaRightClick();
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
        'Right-click on "Path" and click on the "Flip horizontal" option',
        async () => {
          await mainPage.flipHorizontalViaRightClick();
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
      'Right-click on "Path" and click on the "Selection to board" option',
      async () => {
        await mainPage.selectionToBoardViaRightClick();
        await mainPage.waitForChangeIsSaved();
        await workspacePage.leftSidebar.layers.checkLayerIsChildOf('Path', 'Board');
        await expect(mainPage.viewport).toHaveScreenshot('path-to-board.png', {
          mask: mainPage.maskViewport(),
        });
      },
    );
  });
});
