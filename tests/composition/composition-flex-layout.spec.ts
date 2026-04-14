import { expect } from '@playwright/test';
import { qase } from 'playwright-qase-reporter/playwright';
import { mainTest } from 'fixtures';
import { random } from 'helpers/string-generator';
import { MainPage } from '@pages/workspace/main-page';
import { LayersPanelPage } from '@pages/workspace/layers-panel-page';
import { DesignPanelPage } from '@pages/workspace/design-panel-page';
import { TeamPage } from '@pages/dashboard/team-page';
import { DashboardPage } from '@pages/dashboard/dashboard-page';

const teamName = random().concat('autotest');

let mainPage: MainPage;
let layersPanelPage: LayersPanelPage;
let designPanelPage: DesignPanelPage;
let teamPage: TeamPage;
let dashboardPage: DashboardPage;

mainTest.beforeEach(async ({ page }) => {
  teamPage = new TeamPage(page);
  dashboardPage = new DashboardPage(page);
  designPanelPage = new DesignPanelPage(page);
  layersPanelPage = new LayersPanelPage(page);
  mainPage = new MainPage(page);
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
  mainTest.beforeEach(async () => {
    await mainPage.createDefaultBoardByCoordinates(200, 300);
    await designPanelPage.changeHeightAndWidthForLayer('300', '300');
    await mainPage.createDefaultEllipseByCoordinates(200, 300, true);
    await mainPage.createDefaultRectangleByCoordinates(200, 300, true);
    await mainPage.clickCreatedBoardTitleOnCanvas();
    await mainPage.waitForChangeIsSaved();
  });

  mainTest(qase([607], 'Add flex layout to board from right click'), async () => {
    await mainTest.step('Add flex layout via right click', async () => {
      await mainPage.addFlexLayoutViaRightClick();
      await mainPage.waitForChangeIsUnsaved();
      await mainPage.waitForChangeIsSaved();
    });
    await mainTest.step('Verify flex layout is applied', async () => {
      await layersPanelPage.isVerticalFlexIconVisibleOnLayer();
      await designPanelPage.isLayoutRemoveButtonExists();
      await expect(mainPage.viewport).toHaveScreenshot(
        'board-with-layout-right-click.png',
        { mask: mainPage.maskViewport() },
      );
    });
  });

  mainTest(
    qase([608], 'Add flex layout to board from shortcut (SHIFT+A)'),
    async () => {
      await mainTest.step('Add flex layout via shortcut (SHIFT+A)', async () => {
        await mainPage.pressFlexLayoutShortcut();
        await mainPage.waitForChangeIsUnsaved();
        await mainPage.waitForChangeIsSaved();
      });
      await mainTest.step('Verify flex layout is applied', async () => {
        await layersPanelPage.isVerticalFlexIconVisibleOnLayer();
        await designPanelPage.isLayoutRemoveButtonExists();
        await expect(mainPage.viewport).toHaveScreenshot(
          'board-with-layout-shortcut.png',
          { mask: mainPage.maskViewport() },
        );
      });
    },
  );

  mainTest(
    qase([610], 'Remove flex layout from board from rightclick'),
    async () => {
      await mainTest.step('Add flex layout and verify it is applied', async () => {
        await mainPage.addFlexLayoutViaRightClick();
        await mainPage.waitForChangeIsUnsaved();
        await mainPage.waitForChangeIsSaved();
        await layersPanelPage.isVerticalFlexIconVisibleOnLayer();
        await designPanelPage.isLayoutRemoveButtonExists();
      });
      await mainTest.step('Remove flex layout via right click', async () => {
        await mainPage.clickCreatedBoardTitleOnCanvas();
        await mainPage.removeFlexLayoutViaRightClick();
        await mainPage.waitForChangeIsUnsaved();
        await mainPage.waitForChangeIsSaved();
      });
      await mainTest.step('Verify flex layout is removed', async () => {
        await layersPanelPage.isVerticalFlexIconVisibleOnLayer(false);
        await designPanelPage.isLayoutRemoveButtonExists(false);
      });
    },
  );

  mainTest(
    qase([611], 'Remove flex layout from board from shortcut (SHIFT+A)'),
    async () => {
      await mainTest.step(
        'Add flex layout via shortcut and verify it is applied',
        async () => {
          await mainPage.pressFlexLayoutShortcut();
          await mainPage.waitForChangeIsUnsaved();
          await mainPage.waitForChangeIsSaved();
          await layersPanelPage.isVerticalFlexIconVisibleOnLayer();
          await designPanelPage.isLayoutRemoveButtonExists();
        },
      );
      await mainTest.step('Remove flex layout via shortcut (SHIFT+A)', async () => {
        await mainPage.clickCreatedBoardTitleOnCanvas();
        await mainPage.pressFlexLayoutShortcut();
        await mainPage.waitForChangeIsUnsaved();
        await mainPage.waitForChangeIsSaved();
      });
      await mainTest.step('Verify flex layout is removed', async () => {
        await layersPanelPage.isVerticalFlexIconVisibleOnLayer(false);
        await designPanelPage.isLayoutRemoveButtonExists(false);
      });
    },
  );

  mainTest(
    qase([612], 'Remove flex layout from board from Design panel'),
    async () => {
      await mainTest.step('Add flex layout and verify it is applied', async () => {
        await mainPage.addFlexLayoutViaRightClick();
        await mainPage.waitForChangeIsUnsaved();
        await mainPage.waitForChangeIsSaved();
        await layersPanelPage.isVerticalFlexIconVisibleOnLayer();
        await designPanelPage.isLayoutRemoveButtonExists();
      });
      await mainTest.step('Remove flex layout from Design panel', async () => {
        await mainPage.clickCreatedBoardTitleOnCanvas();
        await designPanelPage.removeLayoutFromDesignPanel();
        await mainPage.waitForChangeIsUnsaved();
        await mainPage.waitForChangeIsSaved();
      });
      await mainTest.step('Verify flex layout is removed', async () => {
        await layersPanelPage.isVerticalFlexIconVisibleOnLayer(false);
        await designPanelPage.isLayoutRemoveButtonExists(false);
      });
    },
  );

  mainTest.describe(() => {
    mainTest.beforeEach(async () => {
      mainTest.slow();
      await mainPage.addFlexLayoutViaRightClick();
      await mainPage.waitForChangeIsSaved();
      await layersPanelPage.isVerticalFlexIconVisibleOnLayer();
      await mainPage.clickCreatedBoardTitleOnCanvas();
    });

    mainTest(qase([613], 'Change direction'), async () => {
      await mainTest.step('Change direction to Row reverse', async () => {
        await designPanelPage.changeLayoutDirection('Row reverse');
        await mainPage.waitForChangeIsSaved();
        await expect(mainPage.viewport).toHaveScreenshot(
          'layout-row-reverse-direction.png',
          { mask: mainPage.maskViewport() },
        );
      });
      await mainTest.step('Change direction to Column', async () => {
        await designPanelPage.changeLayoutDirection('Column');
        await mainPage.waitForChangeIsSaved();
        await expect(mainPage.viewport).toHaveScreenshot(
          'layout-column-direction.png',
          { mask: mainPage.maskViewport() },
        );
      });
      await mainTest.step('Change direction to Column reverse', async () => {
        await designPanelPage.changeLayoutDirection('Column reverse');
        await mainPage.waitForChangeIsSaved();
        await expect(mainPage.viewport).toHaveScreenshot(
          'layout-column-reverse-direction.png',
          { mask: mainPage.maskViewport() },
        );
      });
      await mainTest.step('Change direction to Row', async () => {
        await designPanelPage.changeLayoutDirection('Row');
        await mainPage.waitForChangeIsSaved();
        await expect(mainPage.viewport).toHaveScreenshot(
          'layout-row-direction.png',
          {
            mask: mainPage.maskViewport(),
          },
        );
      });
    });

    mainTest(qase([615], 'Change alignment'), async () => {
      await mainTest.step('Change alignment to Center', async () => {
        await designPanelPage.changeLayoutAlignment('Center');
        await mainPage.waitForChangeIsSaved();
        await expect(mainPage.viewport).toHaveScreenshot('layout-align-center.png', {
          mask: mainPage.maskViewport(),
        });
      });
      await mainTest.step('Change alignment to End', async () => {
        await designPanelPage.changeLayoutAlignment('End');
        await mainPage.waitForChangeIsSaved();
        await expect(mainPage.viewport).toHaveScreenshot('layout-align-end.png', {
          mask: mainPage.maskViewport(),
        });
      });
      await mainTest.step('Change alignment to Start', async () => {
        await designPanelPage.changeLayoutAlignment('Start');
        await mainPage.waitForChangeIsSaved();
        await expect(mainPage.viewport).toHaveScreenshot('layout-align-start.png', {
          mask: mainPage.maskViewport(),
        });
      });
    });

    mainTest(qase([616], 'Change justification'), async () => {
      await mainTest.step('Change justification to Center', async () => {
        await designPanelPage.changeLayoutJustification('Center');
        await mainPage.waitForChangeIsSaved();
        await expect(mainPage.viewport).toHaveScreenshot(
          'layout-justify-center.png',
          {
            mask: mainPage.maskViewport(),
          },
        );
      });
      await mainTest.step('Change justification to End', async () => {
        await designPanelPage.changeLayoutJustification('End');
        await mainPage.waitForChangeIsSaved();
        await expect(mainPage.viewport).toHaveScreenshot('layout-justify-end.png', {
          mask: mainPage.maskViewport(),
        });
      });
      await mainTest.step('Change justification to Space between', async () => {
        await designPanelPage.changeLayoutJustification('Space between');
        await mainPage.waitForChangeIsSaved();
        await expect(mainPage.viewport).toHaveScreenshot(
          'layout-justify-space-between.png',
          { mask: mainPage.maskViewport() },
        );
      });
      await mainTest.step('Change justification to Space around', async () => {
        await designPanelPage.changeLayoutJustification('Space around');
        await mainPage.waitForChangeIsSaved();
        await expect(mainPage.viewport).toHaveScreenshot(
          'layout-justify-space-around.png',
          { mask: mainPage.maskViewport() },
        );
      });
      await mainTest.step('Change justification to Space evenly', async () => {
        await designPanelPage.changeLayoutJustification('Space evenly');
        await mainPage.waitForChangeIsSaved();
        await expect(mainPage.viewport).toHaveScreenshot(
          'layout-justify-space-evenly.png',
          { mask: mainPage.maskViewport() },
        );
      });
      await mainTest.step('Change justification to Start', async () => {
        await designPanelPage.changeLayoutJustification('Start');
        await mainPage.waitForChangeIsSaved();
        await expect(mainPage.viewport).toHaveScreenshot(
          'layout-justify-start.png',
          {
            mask: mainPage.maskViewport(),
          },
        );
      });
    });

    mainTest(qase([618], 'Change column gap'), async () => {
      await mainTest.step('Set column gap to 5', async () => {
        await designPanelPage.changeLayoutColumnGap('5');
        await mainPage.waitForChangeIsSaved();
        await expect(mainPage.viewport).toHaveScreenshot('layout-column-gap-5.png', {
          mask: mainPage.maskViewport(),
        });
      });
      await mainTest.step('Set column gap to 15', async () => {
        await designPanelPage.changeLayoutColumnGap('15');
        await mainPage.waitForChangeIsSaved();
        await expect(mainPage.viewport).toHaveScreenshot(
          'layout-column-gap-15.png',
          {
            mask: mainPage.maskViewport(),
          },
        );
      });
      await mainTest.step('Set column gap to 0', async () => {
        await designPanelPage.changeLayoutColumnGap('0');
        await mainPage.waitForChangeIsSaved();
        await expect(mainPage.viewport).toHaveScreenshot('layout-column-gap-0.png', {
          mask: mainPage.maskViewport(),
        });
      });
    });

    mainTest(qase([619], 'Change row gap'), async () => {
      await mainTest.step('Change direction to Column', async () => {
        await designPanelPage.changeLayoutDirection('Column');
        await mainPage.waitForChangeIsSaved();
      });
      await mainTest.step('Set row gap to 5', async () => {
        await designPanelPage.changeLayoutRowGap('5');
        await mainPage.waitForChangeIsSaved();
        await expect(mainPage.viewport).toHaveScreenshot('layout-row-gap-5.png', {
          mask: mainPage.maskViewport(),
        });
      });
      await mainTest.step('Set row gap to 15', async () => {
        await designPanelPage.changeLayoutRowGap('15');
        await mainPage.waitForChangeIsSaved();
        await expect(mainPage.viewport).toHaveScreenshot('layout-row-gap-15.png', {
          mask: mainPage.maskViewport(),
        });
      });
      await mainTest.step('Set row gap to 0', async () => {
        await designPanelPage.changeLayoutRowGap('0');
        await mainPage.waitForChangeIsSaved();
        await expect(mainPage.viewport).toHaveScreenshot('layout-row-gap-0.png', {
          mask: mainPage.maskViewport(),
        });
      });
    });

    mainTest(qase([620], 'Change padding (single)'), async () => {
      await mainTest.step(
        'Set Vertical padding to 5 and Horizontal padding to 15',
        async () => {
          await designPanelPage.changeLayoutPadding('Vertical', '5');
          await mainPage.waitForChangeIsSaved();
          await designPanelPage.changeLayoutPadding('Horizontal', '15');
          await mainPage.waitForChangeIsSaved();
          await expect(mainPage.viewport).toHaveScreenshot(
            'layout-padding-5-15.png',
            {
              mask: mainPage.maskViewport(),
            },
          );
        },
      );
      await mainTest.step('Set Horizontal padding to 0', async () => {
        await designPanelPage.changeLayoutPadding('Horizontal', '0');
        await mainPage.waitForChangeIsSaved();
        await expect(mainPage.viewport).toHaveScreenshot(
          'layout-horizontal_padding-0.png',
          { mask: mainPage.maskViewport() },
        );
      });
      await mainTest.step('Set Vertical padding to 0', async () => {
        await designPanelPage.changeLayoutPadding('Vertical', '0');
        await mainPage.waitForChangeIsSaved();
        await expect(mainPage.viewport).toHaveScreenshot(
          'layout-vertical_padding-0.png',
          { mask: mainPage.maskViewport() },
        );
      });
    });

    mainTest(qase([621], 'Change padding (multiple)'), async () => {
      await mainTest.step(
        'Switch to independent padding and set Top=10, Left=15',
        async () => {
          await designPanelPage.switchToIndependentPadding();
          await mainPage.waitForChangeIsSaved();
          await designPanelPage.changeLayoutIndependentPadding('Top', '10');
          await mainPage.waitForChangeIsSaved();
          await designPanelPage.changeLayoutIndependentPadding('Left', '15');
          await mainPage.waitForChangeIsSaved();
          await expect(mainPage.viewport).toHaveScreenshot(
            'layout-top-left-padding-10-15.png',
            { mask: mainPage.maskViewport() },
          );
        },
      );
      await mainTest.step('Change justification to End', async () => {
        await designPanelPage.changeLayoutJustification('End');
        await mainPage.waitForChangeIsSaved();
        await expect(mainPage.viewport).toHaveScreenshot(
          'layout-top-left-padding-10-15-justify.png',
          { mask: mainPage.maskViewport() },
        );
      });
      await mainTest.step('Set Right=20 and alignment to End', async () => {
        await designPanelPage.changeLayoutIndependentPadding('Right', '20');
        await mainPage.waitForChangeIsSaved();
        await designPanelPage.changeLayoutAlignment('End');
        await mainPage.waitForChangeIsSaved();
        await expect(mainPage.viewport).toHaveScreenshot(
          'layout-top-left-right-padding-justify-align.png',
          { mask: mainPage.maskViewport() },
        );
      });
      await mainTest.step('Set Bottom=25', async () => {
        await designPanelPage.changeLayoutIndependentPadding('Bottom', '25');
        await mainPage.waitForChangeIsSaved();
        await expect(mainPage.viewport).toHaveScreenshot(
          'layout-top-left-right-bottom-padding.png',
          { mask: mainPage.maskViewport() },
        );
      });
    });
  });

  mainTest.describe(() => {
    mainTest.beforeEach(async () => {
      mainTest.slow();
      await mainPage.addFlexLayoutViaRightClick();
      await mainPage.waitForChangeIsSaved();
      await layersPanelPage.isVerticalFlexIconVisibleOnLayer();
      await layersPanelPage.selectBoardChildLayer('Rectangle');
      await designPanelPage.isFlexElementSectionOpened();
    });

    mainTest(qase([627], 'Flex elements change - alignment'), async () => {
      await mainTest.step('Change flex element alignment to Center', async () => {
        await designPanelPage.changeFlexElementAlignment('Center');
        await mainPage.waitForChangeIsSaved();
        await expect(mainPage.viewport).toHaveScreenshot(
          'flex-element-align-center.png',
          { mask: mainPage.maskViewport() },
        );
      });
      await mainTest.step('Change flex element alignment to End', async () => {
        await designPanelPage.changeFlexElementAlignment('End');
        await mainPage.waitForChangeIsSaved();
        await expect(mainPage.viewport).toHaveScreenshot(
          'flex-element-align-end.png',
          {
            mask: mainPage.maskViewport(),
          },
        );
      });
      await mainTest.step('Change flex element alignment to Start', async () => {
        await designPanelPage.changeFlexElementAlignment('Start');
        await mainPage.waitForChangeIsSaved();
        await expect(mainPage.viewport).toHaveScreenshot(
          'flex-element-align-start.png',
          { mask: mainPage.maskViewport() },
        );
      });
    });

    mainTest(qase([628], 'Flex elements - change margin (single)'), async () => {
      await mainTest.step(
        'Set flex element margin Vertical=10 and Horizontal=25',
        async () => {
          await designPanelPage.changeFlexElementMargin('Vertical', '10');
          await mainPage.waitForChangeIsSaved();
          await designPanelPage.changeFlexElementMargin('Horizontal', '25');
          await mainPage.waitForChangeIsSaved();
          await expect(mainPage.viewport).toHaveScreenshot(
            'flex-element-margin-10-25.png',
            { mask: mainPage.maskViewport() },
          );
        },
      );
      await mainTest.step('Set flex element margin Vertical to 0', async () => {
        await designPanelPage.changeFlexElementMargin('Vertical', '0');
        await mainPage.waitForChangeIsSaved();
        await expect(mainPage.viewport).toHaveScreenshot(
          'flex-element-margin-vert-0.png',
          { mask: mainPage.maskViewport() },
        );
      });
      await mainTest.step('Set flex element margin Horizontal to 0', async () => {
        await designPanelPage.changeFlexElementMargin('Horizontal', '0');
        await mainPage.waitForChangeIsSaved();
        await expect(mainPage.viewport).toHaveScreenshot(
          'flex-element-margin-horizontal-0.png',
          { mask: mainPage.maskViewport() },
        );
      });
    });
  });
});

mainTest.describe(() => {
  mainTest.beforeEach(async () => {
    await mainTest.slow();
    await mainPage.createDefaultBoardByCoordinates(200, 300);
    await designPanelPage.changeHeightAndWidthForLayer('500', '500');
    await mainPage.createDefaultEllipseByCoordinates(200, 300);
    await mainPage.createDefaultEllipseByCoordinates(200, 300, true);
    await mainPage.createDefaultEllipseByCoordinates(200, 300, true);
    await mainPage.clickCreatedBoardTitleOnCanvas();
    await mainPage.addFlexLayoutViaRightClick();
    await mainPage.waitForChangeIsSaved();
  });

  mainTest(
    qase([640, 641], 'Use different numbers of paddings on all sides'),
    async () => {
      await mainTest.step('(640) Switch to independent paddings', async () => {
        await designPanelPage.switchToIndependentPadding();
        await mainPage.waitForChangeIsSaved();
        await expect(mainPage.viewport).toHaveScreenshot(
          'flex-layout-independent-paddings.png',
          { mask: mainPage.maskViewport() },
        );
      });

      await mainTest.step('(641) Set Top padding to 20', async () => {
        await designPanelPage.changeLayoutIndependentPadding('Top', '20');
        await mainPage.waitForChangeIsSaved();
        await designPanelPage.verifyLayoutIndependentPaddingValue('Top', '20');
      });

      await mainTest.step('(641) Set Bottom padding to -20, expects 0', async () => {
        await designPanelPage.changeLayoutIndependentPadding('Bottom', '-20');
        await mainPage.waitForChangeIsSaved();
        await designPanelPage.verifyLayoutIndependentPaddingValue('Bottom', '0');
      });

      await mainTest.step('(641) Set Right padding to 200000000', async () => {
        await designPanelPage.changeLayoutIndependentPadding('Right', '200000000');
        await mainPage.waitForChangeIsSaved();
        await designPanelPage.verifyLayoutIndependentPaddingValue(
          'Right',
          '200000000',
        );
      });

      await mainTest.step(
        '(641) Set Left padding to invalid text, expects value unchanged',
        async () => {
          await designPanelPage.changeLayoutIndependentPadding('Left', 'Test');
          await mainPage.waitForChangeIsSaved();
          await designPanelPage.verifyLayoutIndependentPaddingValue('Left', '0');
        },
      );
    },
  );

  mainTest(qase([643], 'Set margins and padding to 0'), async () => {
    await mainTest.step(
      'Set Vertical padding, Horizontal padding and column gap to 0',
      async () => {
        await designPanelPage.changeLayoutPadding('Vertical', '0');
        await mainPage.waitForChangeIsSaved();
        await designPanelPage.changeLayoutPadding('Horizontal', '0');
        await mainPage.waitForChangeIsSaved();
        await designPanelPage.changeLayoutColumnGap('0');
        await mainPage.waitForChangeIsSaved();
        await expect(mainPage.viewport).toHaveScreenshot(
          'layout-padding-gap-0.png',
          {
            mask: mainPage.maskViewport(),
          },
        );
      },
    );
    await mainTest.step(
      'Click Vertical padding field and verify highlight',
      async () => {
        await designPanelPage.clickLayoutVerticalPaddingField();
        await expect(mainPage.viewport).toHaveScreenshot(
          'layout-padding-gap-0.png',
          {
            mask: mainPage.maskViewport(),
          },
        );
      },
    );
    await mainTest.step(
      'Click Horizontal padding field and verify highlight',
      async () => {
        await designPanelPage.clickLayoutHorizontalPaddingField();
        await expect(mainPage.viewport).toHaveScreenshot(
          'layout-padding-gap-0.png',
          {
            mask: mainPage.maskViewport(),
          },
        );
      },
    );
    await mainTest.step('Click column gap field and verify highlight', async () => {
      await designPanelPage.clickLayoutColumnGapField();
      await expect(mainPage.viewport).toHaveScreenshot('layout-padding-gap-0.png', {
        mask: mainPage.maskViewport(),
      });
    });
  });

  mainTest(qase([645], 'Gap click highlight'), async () => {
    await mainTest.step('Set column gap to 20', async () => {
      await designPanelPage.changeLayoutColumnGap('20');
      await mainPage.waitForChangeIsSaved();
    });
    await mainTest.step('Click column gap field and verify highlight', async () => {
      await designPanelPage.clickLayoutColumnGapField();
      await expect(mainPage.viewport).toHaveScreenshot(
        'layout-column-gap-highlighted.png',
        { mask: mainPage.maskViewport() },
      );
    });
  });

  mainTest(
    qase([647], 'Use absolute position and look if element still inside a board'),
    async () => {
      await mainTest.step(
        'Select Ellipse layer and verify flex element section is opened',
        async () => {
          await layersPanelPage.selectBoardChildLayer('Ellipse');
          await designPanelPage.isFlexElementSectionOpened();
        },
      );
      await mainTest.step('Set flex element position to absolute', async () => {
        await designPanelPage.setFlexElementPositionAbsolute();
        await mainPage.waitForChangeIsUnsaved();
        await mainPage.waitForChangeIsSaved();
        await designPanelPage.isFlexElementPositionAbsoluteChecked();
      });
      await mainTest.step('Verify element is still inside the board', async () => {
        await expect(mainPage.viewport).toHaveScreenshot(
          'flex-element-position-absolute.png',
          { mask: mainPage.maskViewport() },
        );
      });
    },
  );
});
