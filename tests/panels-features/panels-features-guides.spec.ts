import { DashboardPage } from '@pages/dashboard/dashboard-page';
import { TeamPage } from '@pages/dashboard/team-page';
import { DesignPanelPage } from '@pages/workspace/design-panel-page';
import { LayersPanelPage } from '@pages/workspace/layers-panel-page';
import { expect } from '@playwright/test';
import { demoAccountFileTest } from 'fixtures';
import { openFileInWorkspace } from 'helpers/files/open-file-in-workspace';
import { createTeamName } from 'helpers/teams/create-team-name';
import { qase } from 'playwright-qase-reporter/playwright';

let designPanelPage: DesignPanelPage;
let layersPanelPage: LayersPanelPage;

demoAccountFileTest.beforeEach(async ({ page }) => {
  designPanelPage = new DesignPanelPage(page);
  layersPanelPage = new LayersPanelPage(page);
});

demoAccountFileTest.describe(() => {
  demoAccountFileTest.beforeEach(async ({ mainPage }) => {
    await mainPage.clickCreateBoardButton();
    await mainPage.clickViewportTwice();
    await mainPage.waitForChangeIsSaved();
    await mainPage.isCreatedLayerVisible();
  });

  demoAccountFileTest(qase([3258], 'Set square guides'), async ({ mainPage }) => {
    await demoAccountFileTest.step('Add square guides', async () => {
      await designPanelPage.clickAddGuidesButton();
      await mainPage.waitForChangeIsSaved();
      await designPanelPage.checkGuideType('Square');
      await designPanelPage.checkGuideFieldValue('Size', '16');
    });

    await demoAccountFileTest.step(
      'Verify default square guides screenshot',
      async () => {
        await expect(mainPage.viewport).toHaveScreenshot(
          'square-guide-default.png',
          {
            mask: mainPage.maskViewport(),
          },
        );
      },
    );
  });

  demoAccountFileTest(
    qase([3259], 'Square guides - change size'),
    async ({ mainPage }) => {
      await demoAccountFileTest.step('Change square guides size', async () => {
        await designPanelPage.clickAddGuidesButton();
        await mainPage.waitForChangeIsSaved();
        await designPanelPage.changeSizeForGuides('8');
        await mainPage.clickViewportTwice();
        await mainPage.waitForChangeIsSaved();
        await designPanelPage.checkGuideFieldValue('Size', '8');
      });

      await demoAccountFileTest.step(
        'Verify changed square guides size',
        async () => {
          await expect(mainPage.viewport).toHaveScreenshot(
            'square-guide-changed-size.png',
            {
              mask: mainPage.maskViewport(),
            },
          );
        },
      );
    },
  );

  demoAccountFileTest(
    qase([3260], 'Square guides - change opacity'),
    async ({ mainPage }) => {
      await demoAccountFileTest.step('Change square guides opacity', async () => {
        await designPanelPage.clickAddGuidesButton();
        await mainPage.waitForChangeIsSaved();
        await designPanelPage.clickGuidesActionsButton();
        await designPanelPage.changeOpacityForGuides('70');
        await mainPage.clickViewportTwice();
        await mainPage.waitForChangeIsSaved();
        await designPanelPage.checkGuideFieldValue('Opacity', '70');
      });

      await demoAccountFileTest.step(
        'Verify changed square guides opacity',
        async () => {
          await expect(mainPage.viewport).toHaveScreenshot(
            'square-guide-changed-opacity.png',
            {
              mask: mainPage.maskViewport(),
            },
          );
        },
      );
    },
  );

  demoAccountFileTest(
    qase([3261], 'Use default square guides'),
    async ({ mainPage }) => {
      await demoAccountFileTest.step(
        'Reset square guides to default values',
        async () => {
          await designPanelPage.clickAddGuidesButton();
          await mainPage.waitForChangeIsSaved();
          await designPanelPage.changeSizeForGuides('8');
          await mainPage.clickViewportTwice();
          await mainPage.waitForChangeIsSaved();
          await designPanelPage.clickGuidesActionsButton();
          await designPanelPage.clickUseDefaultGuidesButton();
          await mainPage.waitForChangeIsSaved();
          await designPanelPage.checkGuideFieldValue('Size', '16');
        },
      );

      await demoAccountFileTest.step(
        'Verify square guides default screenshot',
        async () => {
          await expect(mainPage.viewport).toHaveScreenshot(
            'square-guide-default.png',
            {
              mask: mainPage.maskViewport(),
            },
          );
        },
      );
    },
  );

  demoAccountFileTest(
    qase([3262], 'Hide and unhide square guides via Main menu'),
    async ({ mainPage }) => {
      await demoAccountFileTest.step(
        'Hide square guides from main menu',
        async () => {
          await designPanelPage.clickAddGuidesButton();
          await mainPage.waitForChangeIsSaved();
          await expect(mainPage.viewport).toHaveScreenshot(
            'square-guide-default.png',
            {
              mask: mainPage.maskViewport(),
            },
          );
          await mainPage.clickOnMainThenViewMenuItem();
          await mainPage.clickHideGuidesMainMenuSubItem();
          await mainPage.waitForChangeIsSaved();
        },
      );

      await demoAccountFileTest.step(
        'Show square guides again from main menu',
        async () => {
          await expect(mainPage.viewport).toHaveScreenshot('square-guide-hide.png', {
            mask: mainPage.maskViewport(),
          });
          await mainPage.clickOnMainThenViewMenuItem();
          await mainPage.clickShowGuidesMainMenuSubItem();
          await mainPage.waitForChangeIsSaved();
          await expect(mainPage.viewport).toHaveScreenshot(
            'square-guide-default.png',
            {
              mask: mainPage.maskViewport(),
            },
          );
        },
      );
    },
  );

  demoAccountFileTest(qase([3263], 'Remove square guides'), async ({ mainPage }) => {
    await demoAccountFileTest.step('Remove square guides', async () => {
      await designPanelPage.clickAddGuidesButton();
      await mainPage.waitForChangeIsSaved();
      await designPanelPage.clickRemoveGuidesButton();
      await mainPage.waitForChangeIsSaved();
      await designPanelPage.checkGuideAdded(false);
    });

    await demoAccountFileTest.step('Verify board without guides', async () => {
      await expect(mainPage.viewport).toHaveScreenshot('board-without-guide.png', {
        mask: mainPage.maskViewport(),
      });
    });
  });

  demoAccountFileTest(qase([3264], 'Set columns guides'), async ({ mainPage }) => {
    await demoAccountFileTest.step('Add columns guides', async () => {
      await designPanelPage.clickAddGuidesButton();
      await designPanelPage.selectGuidesType('Columns');
      await mainPage.waitForChangeIsSaved();
      await designPanelPage.checkGuideType('Columns');
      await designPanelPage.checkGuideFieldValue('Columns/Rows', '12');
    });

    await demoAccountFileTest.step(
      'Verify default columns guides screenshot',
      async () => {
        await expect(mainPage.viewport).toHaveScreenshot(
          'columns-guide-default.png',
          {
            mask: mainPage.maskViewport(),
          },
        );
      },
    );
  });

  demoAccountFileTest(
    qase([3267], 'Columns guides - change columns number'),
    async ({ mainPage }) => {
      await demoAccountFileTest.step('Change columns guides count', async () => {
        await designPanelPage.clickAddGuidesButton();
        await designPanelPage.selectGuidesType('Columns');
        await mainPage.waitForChangeIsSaved();
        await designPanelPage.changeColumnsOrRowsNumberForGuides('8');
        await mainPage.clickViewportTwice();
        await mainPage.waitForChangeIsSaved();
        await designPanelPage.checkGuideFieldValue('Columns/Rows', '8');
      });

      await demoAccountFileTest.step(
        'Verify changed columns guides count',
        async () => {
          await expect(mainPage.viewport).toHaveScreenshot(
            'columns-guide-changed-columns.png',
            {
              mask: mainPage.maskViewport(),
            },
          );
        },
      );
    },
  );

  demoAccountFileTest(
    qase([3268], 'Columns guides - change width'),
    async ({ mainPage }) => {
      await demoAccountFileTest.step('Change columns guides width', async () => {
        await designPanelPage.clickAddGuidesButton();
        await designPanelPage.selectGuidesType('Columns');
        await mainPage.waitForChangeIsSaved();
        await designPanelPage.changeColumnsOrRowsNumberForGuides('3');
        await mainPage.waitForChangeIsSaved();
        await designPanelPage.clickGuidesActionsButton();
        await designPanelPage.changeWidthForGuides('10');
        await mainPage.clickViewportTwice();
        await mainPage.waitForChangeIsSaved();
        await designPanelPage.checkGuideFieldValue('Columns/Rows', '3');
        await designPanelPage.checkGuideFieldValue('Width', '10');
      });

      await demoAccountFileTest.step(
        'Verify changed columns guides width',
        async () => {
          await expect(mainPage.viewport).toHaveScreenshot(
            'columns-guide-changed-width.png',
            {
              mask: mainPage.maskViewport(),
            },
          );
        },
      );
    },
  );

  demoAccountFileTest(
    qase([3269], 'Columns guides - change opacity'),
    async ({ mainPage }) => {
      await demoAccountFileTest.step(
        'Change columns guides opacity to 50',
        async () => {
          await designPanelPage.clickAddGuidesButton();
          await designPanelPage.selectGuidesType('Columns');
          await mainPage.waitForChangeIsSaved();
          await expect(mainPage.viewport).toHaveScreenshot(
            'columns-guide-default.png',
            {
              mask: mainPage.maskViewport(),
            },
          );
          await designPanelPage.clickGuidesActionsButton();
          await designPanelPage.changeOpacityForGuides('50');
          await mainPage.clickViewportTwice();
          await mainPage.waitForChangeIsSaved();
          await designPanelPage.checkGuideFieldValue('Opacity', '50');
        },
      );

      await demoAccountFileTest.step(
        'Change columns guides opacity back to 100',
        async () => {
          await expect(mainPage.viewport).toHaveScreenshot(
            'columns-guide-opacity-50.png',
            {
              mask: mainPage.maskViewport(),
            },
          );
          await designPanelPage.changeOpacityForGuides('100');
          await mainPage.clickViewportTwice();
          await mainPage.waitForChangeIsSaved();
          await designPanelPage.checkGuideFieldValue('Opacity', '100');
          await expect(mainPage.viewport).toHaveScreenshot(
            'columns-guide-opacity-100.png',
            { mask: mainPage.maskViewport() },
          );
        },
      );
    },
  );

  demoAccountFileTest(
    qase([3270], 'Use default columns guides'),
    async ({ mainPage }) => {
      await demoAccountFileTest.step(
        'Reset columns guides to default values',
        async () => {
          await designPanelPage.clickAddGuidesButton();
          await designPanelPage.selectGuidesType('Columns');
          await mainPage.waitForChangeIsSaved();
          await designPanelPage.changeColumnsOrRowsNumberForGuides('3');
          await designPanelPage.clickGuidesActionsButton();
          await designPanelPage.clickUseDefaultGuidesButton();
          await mainPage.clickViewportTwice();
          await mainPage.waitForChangeIsSaved();
          await designPanelPage.checkGuideFieldValue('Columns/Rows', '12');
        },
      );

      await demoAccountFileTest.step(
        'Verify default columns guides screenshot',
        async () => {
          await expect(mainPage.viewport).toHaveScreenshot(
            'columns-guide-default.png',
            {
              mask: mainPage.maskViewport(),
            },
          );
        },
      );
    },
  );

  demoAccountFileTest(
    qase([3271], 'Remove columns guides'),
    async ({ mainPage }) => {
      await demoAccountFileTest.step('Remove columns guides', async () => {
        await designPanelPage.clickAddGuidesButton();
        await designPanelPage.selectGuidesType('Columns');
        await mainPage.waitForChangeIsSaved();
        await designPanelPage.clickRemoveGuidesButton();
        await mainPage.waitForChangeIsSaved();
        await designPanelPage.checkGuideAdded(false);
      });

      await demoAccountFileTest.step('Verify board without guides', async () => {
        await expect(mainPage.viewport).toHaveScreenshot('board-without-guide.png', {
          mask: mainPage.maskViewport(),
        });
      });
    },
  );

  demoAccountFileTest(qase([3272], 'Set rows guides'), async ({ mainPage }) => {
    await demoAccountFileTest.step('Add rows guides', async () => {
      await designPanelPage.clickAddGuidesButton();
      await designPanelPage.selectGuidesType('Rows');
      await mainPage.waitForChangeIsSaved();
      await designPanelPage.checkGuideType('Rows');
      await designPanelPage.checkGuideFieldValue('Columns/Rows', '12');
    });

    await demoAccountFileTest.step(
      'Verify default rows guides screenshot',
      async () => {
        await expect(mainPage.viewport).toHaveScreenshot('rows-guide-default.png', {
          mask: mainPage.maskViewport(),
        });
      },
    );
  });

  demoAccountFileTest(
    qase([3273], 'Rows guides - change rows number'),
    async ({ mainPage }) => {
      await demoAccountFileTest.step('Change rows guides count', async () => {
        await designPanelPage.clickAddGuidesButton();
        await designPanelPage.selectGuidesType('Rows');
        await mainPage.waitForChangeIsSaved();
        await designPanelPage.changeColumnsOrRowsNumberForGuides('8');
        await mainPage.clickViewportTwice();
        await mainPage.waitForChangeIsSaved();
        await designPanelPage.checkGuideFieldValue('Columns/Rows', '8');
      });

      await demoAccountFileTest.step(
        'Verify changed rows guides count',
        async () => {
          await expect(mainPage.viewport).toHaveScreenshot(
            'rows-guide-changed-rows.png',
            {
              mask: mainPage.maskViewport(),
            },
          );
        },
      );
    },
  );

  demoAccountFileTest(
    qase([3274], 'Rows guides - change height'),
    async ({ mainPage }) => {
      await demoAccountFileTest.step('Change rows guides height', async () => {
        await designPanelPage.clickAddGuidesButton();
        await designPanelPage.selectGuidesType('Rows');
        await mainPage.waitForChangeIsSaved();
        await designPanelPage.changeColumnsOrRowsNumberForGuides('3');
        await mainPage.waitForChangeIsSaved();
        await designPanelPage.clickGuidesActionsButton();
        await designPanelPage.changeHeightForGuides('20');
        await mainPage.clickViewportTwice();
        await mainPage.waitForChangeIsSaved();
        await designPanelPage.checkGuideFieldValue('Columns/Rows', '3');
        await designPanelPage.checkGuideFieldValue('Height', '20');
      });

      await demoAccountFileTest.step(
        'Verify changed rows guides height',
        async () => {
          await expect(mainPage.viewport).toHaveScreenshot(
            'rows-guide-changed-height.png',
            {
              mask: mainPage.maskViewport(),
            },
          );
        },
      );
    },
  );

  demoAccountFileTest(
    qase([3275], 'Rows guides - change opacity'),
    async ({ mainPage }) => {
      await demoAccountFileTest.step(
        'Change rows guides opacity to 50',
        async () => {
          await designPanelPage.clickAddGuidesButton();
          await designPanelPage.selectGuidesType('Rows');
          await mainPage.waitForChangeIsSaved();
          await expect(mainPage.viewport).toHaveScreenshot(
            'rows-guide-default.png',
            {
              mask: mainPage.maskViewport(),
            },
          );
          await designPanelPage.clickGuidesActionsButton();
          await designPanelPage.changeOpacityForGuides('50');
          await mainPage.clickViewportTwice();
          await mainPage.waitForChangeIsSaved();
          await designPanelPage.checkGuideFieldValue('Opacity', '50');
        },
      );

      await demoAccountFileTest.step(
        'Change rows guides opacity back to 100',
        async () => {
          await expect(mainPage.viewport).toHaveScreenshot(
            'rows-guide-opacity-50.png',
            {
              mask: mainPage.maskViewport(),
            },
          );
          await designPanelPage.changeOpacityForGuides('100');
          await mainPage.clickViewportTwice();
          await mainPage.waitForChangeIsSaved();
          await designPanelPage.checkGuideFieldValue('Opacity', '100');
          await expect(mainPage.viewport).toHaveScreenshot(
            'rows-guide-opacity-100.png',
            {
              mask: mainPage.maskViewport(),
            },
          );
        },
      );
    },
  );

  demoAccountFileTest(
    qase([3276], 'Use default rows guides'),
    async ({ mainPage }) => {
      await demoAccountFileTest.step(
        'Reset rows guides to default values',
        async () => {
          await designPanelPage.clickAddGuidesButton();
          await designPanelPage.selectGuidesType('Rows');
          await mainPage.waitForChangeIsSaved();
          await designPanelPage.changeColumnsOrRowsNumberForGuides('3');
          await designPanelPage.clickGuidesActionsButton();
          await designPanelPage.clickUseDefaultGuidesButton();
          await mainPage.clickViewportTwice();
          await mainPage.waitForChangeIsSaved();
          await designPanelPage.checkGuideFieldValue('Columns/Rows', '12');
        },
      );

      await demoAccountFileTest.step(
        'Verify default rows guides screenshot',
        async () => {
          await expect(mainPage.viewport).toHaveScreenshot(
            'rows-guide-default.png',
            {
              mask: mainPage.maskViewport(),
            },
          );
        },
      );
    },
  );

  demoAccountFileTest(
    qase([3257], 'Duplicate board with guides'),
    async ({ mainPage }) => {
      await demoAccountFileTest.step(
        'Duplicate board with square guides',
        async () => {
          await designPanelPage.clickAddGuidesButton();
          await mainPage.waitForChangeIsSaved();
          await mainPage.clickShortcutCtrlD();
          await mainPage.waitForChangeIsUnsaved();
          await mainPage.waitForChangeIsSaved();
          await layersPanelPage.isVisibleLayersCount(2);
        },
      );

      await demoAccountFileTest.step(
        'Verify duplicated board keeps guides',
        async () => {
          await expect(mainPage.viewport).toHaveScreenshot(
            'two-board-with-guide.png',
            {
              mask: mainPage.maskViewport(),
            },
          );
        },
      );
    },
  );

  demoAccountFileTest(
    qase([763, 816], 'Hide/show rulers and guides (shortcut and main menu)'),
    async ({ page, mainPage }) => {
      const viewportBox = await mainPage.viewport.boundingBox();
      if (!viewportBox) throw new Error('Could not get bounding box for viewport');
      const dropX = viewportBox.x + viewportBox.width / 2;
      const dropY = viewportBox.y + viewportBox.height / 2;
      const fileUrl = new URL(page.url());
      const firstFile = {
        teamId: fileUrl.searchParams.get('team-id') as string,
        fileId: fileUrl.searchParams.get('file-id') as string,
      };

      await demoAccountFileTest.step(
        'Drag a horizontal and a vertical guide from the rulers onto the board',
        async () => {
          await mainPage.dragHorizontalGuideFromRuler(dropX, dropY);
          await mainPage.dragVerticalGuideFromRuler(dropX, dropY);
          await mainPage.waitForChangeIsSaved();
          await expect(mainPage.viewport).toHaveScreenshot(
            'board-with-ruler-guides.png',
            {
              mask: mainPage.maskViewport(),
            },
          );
        },
      );

      await demoAccountFileTest.step(
        'Press CTRL+SHIFT+R → rulers and guides are not displayed',
        async () => {
          await mainPage.pressHideShowRulersShortcut();
          await mainPage.isRulersVisible(false);
          await expect(mainPage.viewport).toHaveScreenshot(
            'board-with-hidden-rulers-and-guides.png',
            {
              mask: mainPage.maskViewport(),
            },
          );
        },
      );

      await demoAccountFileTest.step(
        'Refresh the browser tab → rulers are still hidden',
        async () => {
          await page.reload();
          await mainPage.isMainPageLoaded();
          await mainPage.isRulersVisible(false);
        },
      );

      await demoAccountFileTest.step(
        'Open a file in another team → rulers are still hidden',
        async () => {
          const dashboardPage = new DashboardPage(page);
          await mainPage.clickPencilBoxButton();
          await new TeamPage(page).createTeam(createTeamName());
          await dashboardPage.createFileViaPlaceholder();
          await mainPage.isMainPageLoaded();
          await mainPage.isRulersVisible(false);
        },
      );

      await demoAccountFileTest.step(
        'Main menu > View > Show rulers → rulers are displayed',
        async () => {
          await mainPage.clickOnMainThenViewMenuItem();
          await mainPage.clickShowRulersMainMenuSubItem();
          await mainPage.isRulersVisible();
        },
      );

      await demoAccountFileTest.step(
        'Open the first file → rulers and guides are displayed',
        async () => {
          await openFileInWorkspace(page, firstFile.teamId, firstFile.fileId);
          await mainPage.isRulersVisible();
          await mainPage.clickCreatedBoardTitleOnCanvas();
          await expect(mainPage.viewport).toHaveScreenshot(
            'board-with-ruler-guides-reopened.png',
            {
              mask: mainPage.maskViewport(),
            },
          );
        },
      );
    },
  );

  demoAccountFileTest(
    qase([2842], 'Clear guides for a given board'),
    async ({ mainPage }) => {
      const viewportBox = await mainPage.viewport.boundingBox();
      if (!viewportBox) throw new Error('Could not get bounding box for viewport');
      const secondBoard = { x: 200, y: 200 };
      let firstBoard: { x: number; y: number };
      let guideX: number;

      await demoAccountFileTest.step(
        'Create a second board and drag ruler guides onto both boards',
        async () => {
          await designPanelPage.changeHeightAndWidthForLayer('400', '400');
          await mainPage.waitForChangeIsSaved();
          firstBoard = await mainPage.getSelectionBox();
          guideX = firstBoard.x + 200;
          await mainPage.createDefaultBoardByCoordinates(
            secondBoard.x,
            secondBoard.y,
          );
          await mainPage.dragHorizontalGuideFromRuler(guideX, firstBoard.y + 300);
          await mainPage.dragVerticalGuideFromRuler(guideX, firstBoard.y + 200);
          await mainPage.dragVerticalGuideFromRuler(
            viewportBox.x + secondBoard.x,
            viewportBox.y + secondBoard.y,
          );
          await mainPage.waitForChangeIsSaved();
          // The newest layer is listed first: index 0 is the second board
          await layersPanelPage.isLayerContextMenuOptionVisible(
            'Board',
            'Clear board guides',
            true,
            0,
          );
          await layersPanelPage.isLayerContextMenuOptionVisible(
            'Board',
            'Clear board guides',
            true,
            1,
          );
        },
      );

      await demoAccountFileTest.step(
        'Move a shape near the vertical guide → it snaps to the guide',
        async () => {
          await mainPage.clickCreateRectangleButton();
          await mainPage.dragOnViewport(
            firstBoard.x - viewportBox.x + 40,
            firstBoard.y - viewportBox.y + 40,
            firstBoard.x - viewportBox.x + 90,
            firstBoard.y - viewportBox.y + 90,
          );
          await mainPage.waitForChangeIsSaved();
          // Dropped 2px and 6px right of the guide, it ends at the same X both times
          const snappedX: number[] = [];
          for (const offset of [2, 6]) {
            const shape = await mainPage.getSelectionBox();
            await mainPage.dragFromBoxCenter(shape, guideX + offset - shape.x, 0);
            snappedX.push(await designPanelPage.getXValue());
          }
          expect(snappedX[1], 'Shape snaps to the guide').toBe(snappedX[0]);
        },
      );

      await demoAccountFileTest.step(
        'Clear the first board guides via right click',
        async () => {
          await layersPanelPage.clickOnLayerOptionViaRightClickForLayer(
            'Board',
            'Clear board guides',
            1,
          );
          await mainPage.waitForChangeIsSaved();
        },
      );

      await demoAccountFileTest.step(
        'Only the first board loses its guides',
        async () => {
          await layersPanelPage.isLayerContextMenuOptionVisible(
            'Board',
            'Clear board guides',
            false,
            1,
          );
          await layersPanelPage.isLayerContextMenuOptionVisible(
            'Board',
            'Clear board guides',
            true,
            0,
          );
        },
      );
    },
  );
});
