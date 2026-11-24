import { ColorPalettePage } from '@pages/workspace/color-palette-page';
import { DesignPanelPage } from '@pages/workspace/design-panel-page';
import { LayersPanelPage } from '@pages/workspace/layers-panel-page';
import { type LayersPanelComponent } from '@pages/workspace/left-sidebar/layers-panel-component';
import { type LayoutContainerSectionComponent } from '@pages/workspace/right-sidebar/design-tab/layout-container-section-component';
import { type StrokeSectionComponent } from '@pages/workspace/right-sidebar/design-tab/stroke-section-component';
import { WorkspacePage } from '@pages/workspace/workspace-page';
import { expect } from '@playwright/test';
import { demoAccountFileTest } from 'fixtures';
import { qase } from 'playwright-qase-reporter/playwright';

let designPanelPage: DesignPanelPage;
let layersPanelPage: LayersPanelPage;
let colorPalettePage: ColorPalettePage;
let workspace: WorkspacePage;
let layers: LayersPanelComponent;
let stroke: StrokeSectionComponent;
let layoutContainer: LayoutContainerSectionComponent;

// The header snapshots need the Share button, hidden in the personal team
demoAccountFileTest.use({ inNewTeam: true });

demoAccountFileTest.beforeEach(async ({ page }) => {
  colorPalettePage = new ColorPalettePage(page);
  designPanelPage = new DesignPanelPage(page);
  layersPanelPage = new LayersPanelPage(page);
  workspace = new WorkspacePage(page);
  layers = workspace.leftSidebar.layers;
  stroke = workspace.rightSidebar.design.stroke;
  layoutContainer = workspace.rightSidebar.design.layoutContainer;
});

demoAccountFileTest(qase([216], 'Change color background'), async ({ mainPage }) => {
  await demoAccountFileTest.step(
    'Click color icon on Design panel - "Canvas background" section',
    async () => {
      await designPanelPage.clickCanvasBackgroundColorIcon();
      await workspace.colorPicker.checkColorPickerIsVisible();
    },
  );

  await demoAccountFileTest.step('Change color using pallete', async () => {
    await colorPalettePage.setHex('#304d6a');
  });

  await demoAccountFileTest.step(
    'Click free space outside the pallete pop-up',
    async () => {
      await mainPage.clickViewportTwice();
      await mainPage.waitForChangeIsSaved();
      await workspace.colorPicker.checkColorPickerIsVisible(false);
      await expect(mainPage.viewport).toHaveScreenshot('color-background.png', {
        mask: mainPage.maskViewport(),
      });
    },
  );
});

demoAccountFileTest.describe(() => {
  demoAccountFileTest.beforeEach(async ({ mainPage }) => {
    await demoAccountFileTest.slow();
    await demoAccountFileTest.step('Create a board', async () => {
      await mainPage.clickCreateBoardButton();
      await mainPage.clickViewportTwice();
      await mainPage.waitForChangeIsSaved();
      await layers.checkLayerRowIsVisible('Board');
    });
  });

  demoAccountFileTest(
    qase(
      [219],
      'Rename board on the Layers Panel (by double clicking) with valid name',
    ),
    async ({ mainPage }) => {
      const newName = 'New test board';
      const renamedName = 'renamed board';

      await demoAccountFileTest.step(
        'Double click on the board name (above the board itself)',
        async () => {
          await mainPage.doubleClickCreatedBoardTitleOnCanvas();
          await workspace.canvas.checkShapeNameInputVisible();
        },
      );

      await demoAccountFileTest.step(
        'Type new board name (e.g. "new test board")',
        async () => {
          await mainPage.typeNameForShapeLabel(newName);
        },
      );

      await demoAccountFileTest.step('Press "Enter" keyboard button', async () => {
        await mainPage.clickOnEnter();
        await mainPage.waitForChangeIsSaved();
        await workspace.canvas.checkShapeNameInputVisible(false);
        await layers.checkLayerRowIsVisible(newName);
      });

      await demoAccountFileTest.step(
        'Double click on the board name (from the "Layers" panel on the left)',
        async () => {
          await layersPanelPage.doubleClickLayerOnLayersTab(newName);
          await layers.checkLayerNameInputVisible();
        },
      );

      await demoAccountFileTest.step(
        'Type new board name (e.g. "new test board")',
        async () => {
          await layersPanelPage.typeNameForCreatedLayer(renamedName);
        },
      );

      await demoAccountFileTest.step('Click outside from the text box', async () => {
        await mainPage.clickViewportByCoordinates(900, 100, 3);
        await mainPage.waitForChangeIsSaved();
        await layers.checkLayerNameInputVisible(false);
        await layers.checkLayerRowIsVisible(renamedName);
      });

      await demoAccountFileTest.step(
        'Click on the element\'s open lock icon from the "Layers panel"',
        async () => {
          await layers.toggleLayerLock(renamedName);
          await mainPage.waitForChangeIsSaved();
          await layers.checkLayerLocked(renamedName);
        },
      );

      await demoAccountFileTest.step('Repeat step 5', async () => {
        // A locked layer can't be renamed (penpot/penpot#5845)
        await layersPanelPage.doubleClickLayerOnLayersTab(renamedName);
        await layers.checkLayerNameInputVisible(false);
        await layers.checkLayerRowIsVisible(renamedName);
      });
    },
  );

  demoAccountFileTest(
    qase(
      [220],
      'Rename board on the Viewport (by double clicking on name) with an empty field',
    ),
    async ({ mainPage }) => {
      await demoAccountFileTest.step(
        'Double click on the board name in the viewport (above the board itself)',
        async () => {
          await mainPage.doubleClickCreatedBoardTitleOnCanvas();
          await workspace.canvas.checkShapeNameInputVisible();
        },
      );

      await demoAccountFileTest.step(
        'Clear the board name (press "Backpspace" keyboard button)',
        async () => {
          await mainPage.typeNameForShapeLabel('');
        },
      );

      await demoAccountFileTest.step('Press "Enter" keyboard button', async () => {
        await mainPage.clickOnEnter();
        await mainPage.waitForChangeIsSaved();
        await workspace.canvas.checkShapeNameInputVisible(false);
        await layers.checkLayerRowIsVisible('Board');
      });
    },
  );

  demoAccountFileTest(
    qase([229], 'Add, edit and delete Stroke to board'),
    async ({ mainPage }) => {
      await demoAccountFileTest.step('Select board', async () => {
        await layers.selectLayer('Board');
        await mainPage.waitForResizeHandlerVisible();
      });

      await demoAccountFileTest.step(
        'Click "+" button next to "Stroke',
        async () => {
          await designPanelPage.clickAddStrokeButton();
          await mainPage.waitForChangeIsSaved();
          await mainPage.waitForResizeHandlerVisible();
          await stroke.checkStrokeRowFieldsAreVisible();
          await expect(mainPage.viewport).toHaveScreenshot(
            'board-stroke-default.png',
            {
              mask: mainPage.maskViewport(),
            },
          );
        },
      );

      await demoAccountFileTest.step(
        'Change color, opacity, thickness, type, position',
        async () => {
          await mainPage.clickCreatedBoardTitleOnCanvas();
          await designPanelPage.changeStrokeSettings(
            '#43E50B',
            '60',
            '10',
            'Inside',
            'Dotted',
          );
          await mainPage.waitForChangeIsSaved();
          await mainPage.waitForResizeHandlerVisible();
          await expect(mainPage.viewport).toHaveScreenshot(
            'board-stroke-inside-dotted.png',
            {
              mask: mainPage.maskViewport(),
            },
          );
          await mainPage.clickCreatedBoardTitleOnCanvas();
          await designPanelPage.changeStrokeSettings(
            '#F5358F',
            '80',
            '5',
            'Outside',
            'Dashed',
          );
          await mainPage.waitForChangeIsSaved();
          await mainPage.waitForResizeHandlerVisible();
          await expect(mainPage.viewport).toHaveScreenshot(
            'board-stroke-outside-dashed.png',
            {
              mask: mainPage.maskViewport(),
            },
          );
          await mainPage.clickCreatedBoardTitleOnCanvas();
          await designPanelPage.changeStrokeSettings(
            '#F5358F',
            '100',
            '3',
            'Center',
            'Solid',
          );
          await mainPage.waitForChangeIsSaved();
          await mainPage.waitForResizeHandlerVisible();
          await expect(mainPage.viewport).toHaveScreenshot(
            'board-stroke-center-solid.png',
            {
              mask: mainPage.maskViewport(),
            },
          );
          await mainPage.clickCreatedBoardTitleOnCanvas();
          await designPanelPage.changeStrokeSettings(
            '#F5358F',
            '40',
            '4',
            'Center',
            'Mixed',
          );
          await mainPage.waitForChangeIsSaved();
          await mainPage.waitForResizeHandlerVisible();
          await expect(mainPage.viewport).toHaveScreenshot(
            'board-stroke-center-mixed.png',
            {
              mask: mainPage.maskViewport(),
            },
          );
        },
      );

      await demoAccountFileTest.step(
        'Click "-" button in "Stroke" section',
        async () => {
          await mainPage.clickCreatedBoardTitleOnCanvas();
          await designPanelPage.removeStroke();
          await mainPage.waitForChangeIsSaved();
          await mainPage.waitForResizeHandlerVisible();
          await designPanelPage.checkStrokeIsAdded(false);
          await expect(mainPage.viewport).toHaveScreenshot(
            'board-stroke-remove.png',
            {
              mask: mainPage.maskViewport(),
            },
          );
        },
      );
    },
  );

  demoAccountFileTest(
    qase([1756], 'Absolute positioned board moving'),
    async ({ mainPage }) => {
      await demoAccountFileTest.step(
        'Setup (not in the Qase steps): resize the board and name it "Main Board"',
        async () => {
          await designPanelPage.changeHeightAndWidthForLayer('400', '500');
          await layersPanelPage.doubleClickLayerOnLayersTab('Board');
          await layersPanelPage.typeNameCreatedLayerAndEnter('Main Board');
          await mainPage.waitForChangeIsSaved();
          await layers.checkLayerRowIsVisible('Main Board');
        },
      );

      await demoAccountFileTest.step(
        'Click "+" button next to "Layout"',
        async () => {
          await layoutContainer.clickAddLayoutButton();
          await layoutContainer.checkAddLayoutOptionsAreVisible();
        },
      );

      await demoAccountFileTest.step('Select " Flex layout" option', async () => {
        await layoutContainer.selectAddLayoutOption('flex');
        await mainPage.waitForChangeIsSaved();
        await layoutContainer.checkLayoutType('flex');
        await designPanelPage.checkLayoutPadding('Vertical', '0');
        await designPanelPage.checkLayoutPadding('Horizontal', '0');
        await designPanelPage.checkRowGap('0');
        await designPanelPage.checkColumnGap('0');
      });

      await demoAccountFileTest.step(
        'Create shape and create a board with that shape',
        async () => {
          await mainPage.createDefaultBoardByCoordinates(200, 200);
          await mainPage.waitForChangeIsSaved();
          await designPanelPage.changeHeightAndWidthForLayer('200', '200');
          await mainPage.waitForChangeIsSaved();
          await mainPage.createDefaultEllipseByCoordinates(220, 220);
          await layersPanelPage.dragAndDropComponentToBoard('Ellipse');
          await mainPage.waitForChangeIsSaved();
          await layers.checkLayerIsChildOf('Ellipse', 'Board');
        },
      );

      await demoAccountFileTest.step('Move board into layout board', async () => {
        await layersPanelPage.dragAndDropElementToElement('Board', 'Main Board');
        await mainPage.waitForChangeIsSaved();
        await layers.checkLayerIsChildOf('Board', 'Main Board');
      });

      await demoAccountFileTest.step('Change to position absolute', async () => {
        await designPanelPage.setFlexElementPositionAbsolute();
        await designPanelPage.isFlexElementPositionAbsoluteChecked();
        await mainPage.pressHideShowRulersShortcut();
        await expect(mainPage.viewport).toHaveScreenshot('board-in-flex-board.png', {
          mask: mainPage.maskViewport(),
        });
      });

      await demoAccountFileTest.step('Move the frame', async () => {
        await mainPage.clickViewportByCoordinates(300, 100, 2);
        await layersPanelPage.selectBoardChildLayer('Board');
        await designPanelPage.changeAxisXAndYForLayer('100', '100');
        await mainPage.waitForChangeIsSaved();
        await expect(mainPage.viewport).toHaveScreenshot(
          'board-in-flex-board-moved.png',
          {
            mask: mainPage.maskViewport(),
          },
        );
      });
    },
  );

  demoAccountFileTest(
    qase(
      [241],
      'Change board size, preset and orientation (Design page in the right)',
    ),
    async ({ mainPage }) => {
      const sizePresetsOptions = [
        'APPLE',
        'iPhone 16393 x 852',
        'iPhone 16 Pro402 x 874',
        'iPhone 16 Pro Max440 x 956',
        'iPhone 16 Plus430 x 932',
        '14/15 Pro Max430 x 932',
        'iPhone 15/15 Pro393 x 852',
        'iPhone 13/14 390 x 844',
        'iPhone 14 Plus428 x 926',
        'iPhone 13 Mini375 x 812',
        'iPhone SE320 x 568',
        'iPhone 12/12 Pro390 x 844',
        'iPhone 12 Mini360 x 780',
        'iPhone 12 Pro Max428 x 926',
        'iPhone X/XS/11 Pro375 x 812',
        'iPhone XS Max/XR/11414 x 896',
        'iPad768 x 1024',
        'iPad Mini 8.3in744 x 1133',
        'iPad Pro 10.5in834 x 1112',
        'iPad Pro 11in834 x 1194',
        'iPad Pro 12.9in1027 x 1366',
        'Watch Series 10416 x 496',
        'Watch 45mm396 x 484',
        'Watch 44mm368 x 448',
        'Watch 42mm312 x 390',
        'Watch 41mm352 x 430',
        'Watch 40mm324 x 394',
        'Watch 38mm272 x 340',
        'MacBook Air1280 x 832',
        'MacBook Pro 14in1512 x 982',
        'MacBook Pro 16in1728 x 1117',
        'ANDROID',
        'Expanded1280 x 800',
        'Compact412 x 917',
        'Large360 x 800',
        'Medium700 x 840',
        'Small360 x 640',
        'Mobile360 x 640',
        'Tablet768 x 1024',
        'Google Pixel 7 Pro412 x 892',
        'Google Pixel 6a/6412 x 915',
        'Google Pixel 4a/5393 x 851',
        'Samsung Galaxy S22360 x 780',
        'Samsung Galaxy S20+384 x 854',
        'Samsung Galaxy A71/A51412 x 914',
        'MICROSOFT',
        'Surface Pro 31440 x 960',
        'Surface Pro 4/5/6/71368 x 912',
        'Surface Pro 8140 x 960',
        'ReMarkable',
        'Remarkable 21404 x 1872',
        'Remarkable Pro1620 x 2160',
        'WEB',
        'Web 12801280 x 800',
        'Web 13661366 x 768',
        'Web 10241024 x 768',
        'Web 19201920 x 1080',
        'MIXED',
        'Desktop/Wireframe1440 x 1024',
        'TV1280 x 720',
        'Slide 16:91920 x 1080',
        'Slide 4:31027 x 768',
        'PRINT (96dpi)',
        'A03179 x 4494',
        'A12245 x 3179',
        'A21587 x 2245',
        'A31123 x 1587',
        'A4794 x 1123',
        'A5559 x 794',
        'A6397 x 559',
        'Letter816 x 1054',
        'DIN Lang835 x 413',
        'SOCIAL MEDIA',
        'Instagram profile320 x 320',
        'Instagram post1080 x 1350',
        'Instagram story1080 x 1920',
        'Facebook profile720 x 720',
        'Facebook cover820 x 312',
        'Facebook post1200 x 630',
        'LinkedIn profile400 x 400',
        'LinkedIn cover1584 x 396',
        'LinkedIn post520 x 320',
        'Bluesky profile400 x 400',
        'Bluesky cover3000 x 1000',
        'Bluesky post1080 x 1350',
        'X profile400 x 400',
        'X header1500 x 500',
        'X post1024 x 512',
        'YouTube profile800 x 800',
        'YouTube banner2560 x 1440',
        'YouTube cover2048 x 1152',
        'YouTube thumb1280 x 720',
        'PENPOT',
        'File thumbnail300 x 200',
        'Template cover1390 x 781',
        'Plugin icon400 x 400',
        'Plugin cover1390 x 724',
      ];
      await demoAccountFileTest.step('Select board', async () => {
        await layers.selectLayer('Board');
        await mainPage.waitForResizeHandlerVisible();
      });

      await demoAccountFileTest.step(
        'Click on the drop-down list "Size presets" in the right panel on the design tab',
        async () => {
          await designPanelPage.checkSizePresetsOptions(sizePresetsOptions);
        },
      );

      // Each preset is selected (it opens in its default orientation) and then its
      // orientation is switched, so the sizes swap
      const presets = [
        {
          selectStep:
            'Select "iPhone 13 & 14" size preset on "Size presets" drop-down on "Design" panel (APPLE section)',
          clickStep:
            'Click "Landscape" icon on "Design" panel (next to "Size preset")',
          option: 'iPhone 13/14 ',
          defaultOrientation: 'vertical',
          width: '390',
          height: '844',
        },
        {
          selectStep:
            'Select "Ipad" size preset on "Size presets" drop-down on "Design" panel (APPLE section)',
          clickStep:
            'Click "Landscape" icon on "Design" panel (next to "Size preset")',
          option: 'iPad',
          defaultOrientation: 'vertical',
          width: '768',
          height: '1024',
        },
        {
          selectStep:
            'Select "Mobile" size preset on "Size presets" drop-down on "Design" panel (ANDROID section)',
          clickStep:
            'Click "Landscape" icon on "Design" panel (next to "Size preset")',
          option: 'Mobile',
          defaultOrientation: 'vertical',
          width: '360',
          height: '640',
        },
        {
          selectStep:
            'Select "Google Pixel 6 & 6a" size preset on "Size presets" drop-down on "Design" panel (APPLE section)',
          clickStep:
            'Click "Portrait" icon on "Design" panel (next to "Size preset")',
          option: 'Google Pixel 6a/6',
          defaultOrientation: 'vertical',
          width: '412',
          height: '915',
        },
        {
          selectStep:
            'Select "Samsung S22 " size preset on "Size presets" drop-down on "Design" panel (APPLE section)',
          clickStep:
            'Click "Portrait" icon on "Design" panel (next to "Size preset")',
          option: 'Samsung Galaxy S22',
          defaultOrientation: 'vertical',
          width: '360',
          height: '780',
        },
        {
          selectStep:
            'Select "Surface pro 4/5/6/7" size preset on "Size presets" drop-down on "Design" panel (MICROSOFT section)',
          clickStep:
            'Click "Portrait" icon on "Design" panel (next to "Size preset")',
          option: 'Surface Pro 4/5/6/7',
          defaultOrientation: 'horizontal',
          width: '1368',
          height: '912',
        },
        {
          selectStep:
            'Select "ReMarkable2" size preset on "Size presets" drop-down on "Design" panel (ReMarkable section)',
          clickStep:
            'Click "Landscape" icon on "Design" panel (next to "Size preset")',
          option: 'Remarkable 2',
          defaultOrientation: 'vertical',
          width: '1404',
          height: '1872',
        },
        {
          selectStep:
            'Select "Web 1024" size preset on "Size presets" drop-down on "Design" panel (WEB section)',
          clickStep:
            'Click "Portrait" icon on "Design" panel (next to "Size preset")',
          option: 'Web 1024',
          defaultOrientation: 'horizontal',
          width: '1024',
          height: '768',
        },
        {
          selectStep:
            'Select "A4" size preset on "Size presets" drop-down on "Design" panel (PRINT 96dpi section)',
          clickStep:
            'Click "Landscape" icon on "Design" panel (next to "Size preset")',
          option: 'A4',
          defaultOrientation: 'vertical',
          width: '794',
          height: '1123',
        },
        {
          selectStep:
            'Select "Instagram story" size preset on "Size presets" drop-down on "Design" panel (SOCIAL MEDIA section)',
          clickStep:
            'Click "Landscape" icon on "Design" panel (next to "Size preset")',
          option: 'Instagram story',
          defaultOrientation: 'vertical',
          width: '1080',
          height: '1920',
        },
      ];
      for (const preset of presets) {
        await demoAccountFileTest.step(preset.selectStep, async () => {
          await designPanelPage.selectSizePresetsOption(preset.option);
          await mainPage.waitForChangeIsSaved();
          if (preset.defaultOrientation === 'vertical') {
            await designPanelPage.isVerticalOrientationButtonChecked();
          } else {
            await designPanelPage.isHorizontalOrientationButtonChecked();
          }
          await designPanelPage.checkSizeWidth(preset.width);
          await designPanelPage.checkSizeHeight(preset.height);
        });

        await demoAccountFileTest.step(preset.clickStep, async () => {
          if (preset.defaultOrientation === 'vertical') {
            await designPanelPage.clickOnHorizontalOrientationButton();
            await mainPage.waitForChangeIsSaved();
            await designPanelPage.isHorizontalOrientationButtonChecked();
          } else {
            await designPanelPage.clickOnVerticalOrientationButton();
            await mainPage.waitForChangeIsSaved();
            await designPanelPage.isVerticalOrientationButtonChecked();
          }
          await designPanelPage.checkSizeWidth(preset.height);
          await designPanelPage.checkSizeHeight(preset.width);
        });
      }
    },
  );
});

demoAccountFileTest.describe(() => {
  demoAccountFileTest.beforeEach(async ({ mainPage }) => {
    await demoAccountFileTest.slow();
    const board1 = 'Board #1';
    const board2 = 'Board #2';

    await demoAccountFileTest.step('Create a board', async () => {
      await mainPage.clickCreateBoardButton();
      await mainPage.clickViewportByCoordinates(100, 150);
      await mainPage.waitForChangeIsSaved();
      await layers.checkLayerRowIsVisible('Board');
      // Naming the boards is setup (not in the Qase steps): it tells them apart
      await mainPage.doubleClickBoardTitleOnCanvas('Board');
      await mainPage.typeNameShapeLabelAndEnter(board1);
      await mainPage.waitForChangeIsSaved();
      await layers.checkLayerRowIsVisible(board1);
    });

    await demoAccountFileTest.step('Create a board', async () => {
      await mainPage.clickCreateBoardButton();
      await mainPage.clickViewportByCoordinates(250, 300);
      await mainPage.waitForChangeIsSaved();
      await layers.checkLayerRowIsVisible('Board');
      await mainPage.doubleClickBoardTitleOnCanvas('Board');
      await mainPage.typeNameShapeLabelAndEnter(board2);
      await mainPage.waitForChangeIsSaved();
      await layers.checkLayerRowIsVisible(board2);
    });
  });

  demoAccountFileTest(
    qase(
      [248],
      'Zoom to board by double click board icon on the list (Layers panel on the left)',
    ),
    async ({ mainPage }) => {
      const board1 = 'Board #1';
      const board2 = 'Board #2';

      await demoAccountFileTest.step(
        'Double click on 1st board is the list (Layers panel on the left) - board icon on the left',
        async () => {
          await layersPanelPage.doubleClickLayerIconOnLayersTab(board1);
          await expect(mainPage.viewport).toHaveScreenshot('board-first-zoom.png', {
            mask: mainPage.maskViewport(),
          });
        },
      );

      await demoAccountFileTest.step(
        'Double click on 2nd board is the list (Layers panel on the left) - board icon on the left',
        async () => {
          await layersPanelPage.doubleClickLayerIconOnLayersTab(board2);
          await expect(mainPage.viewport).toHaveScreenshot('board-second-zoom.png', {
            mask: mainPage.maskViewport(),
          });
        },
      );
    },
  );

  demoAccountFileTest(
    qase([249], 'Hide and show board (From rightclick and icons)'),
    async ({ mainPage }) => {
      const board1 = 'Board #1';
      const board2 = 'Board #2';

      await demoAccountFileTest.step(
        'Click on 1st board in the list (Layers panel on the left) - Eye icon on the right',
        async () => {
          await layersPanelPage.hideUnhideLayerByIconOnLayersTab(board1);
          await mainPage.waitForChangeIsUnsaved();
          await mainPage.waitForChangeIsSaved();
          await layers.checkLayerHidden(board1);
          await expect(mainPage.viewport).toHaveScreenshot('board-first-hide.png', {
            mask: mainPage.maskViewport(),
          });
        },
      );

      await demoAccountFileTest.step(
        'Click RMB on the 2nd board in the list (Layers panel on the left) - click "Hide" menu item',
        async () => {
          await mainPage.hideLayerViaRightClickOnLayersTab(board2);
          await mainPage.waitForChangeIsUnsaved();
          await mainPage.waitForChangeIsSaved();
          await layers.checkLayerHidden(board2);
          await expect(mainPage.viewport).toHaveScreenshot('board-second-hide.png', {
            mask: mainPage.maskViewport(),
          });
        },
      );

      await demoAccountFileTest.step(
        'Click RMB on the 1st board in the list (Layers panel on the left) - click "Show" menu item',
        async () => {
          await layersPanelPage.unHideLayerViaRightClickOnLayersTab(board1);
          await mainPage.waitForChangeIsUnsaved();
          await mainPage.waitForChangeIsSaved();
          await layers.checkLayerHidden(board1, false);
          await expect(mainPage.viewport).toHaveScreenshot('board-first-show.png', {
            mask: mainPage.maskViewport(),
          });
        },
      );

      await demoAccountFileTest.step(
        'Click on 2nd board is the list (Layers panel on the left) - Eye icon on the right',
        async () => {
          await layersPanelPage.hideUnhideLayerByIconOnLayersTab(board2, false);
          await mainPage.waitForChangeIsUnsaved();
          await mainPage.waitForChangeIsSaved();
          await layers.checkLayerHidden(board2, false);
          await expect(mainPage.viewport).toHaveScreenshot('board-second-show.png', {
            mask: mainPage.maskViewport(),
          });
        },
      );
    },
  );

  demoAccountFileTest(
    qase([268], 'Click "Focus on" board from right click'),
    async ({ mainPage }) => {
      const board1 = 'Board #1';
      const board2 = 'Board #2';

      await demoAccountFileTest.step(
        'Click RMB on 1st board (on the canvas) - click "Focus On" menu item',
        async () => {
          await mainPage.focusBoardViaRightClickOnCanvas(board1);
          await mainPage.waitForChangeIsSaved();
          await layersPanelPage.isLayerPresentOnLayersTab(board1, true);
          await layersPanelPage.isLayerPresentOnLayersTab(board2, false);
          await layersPanelPage.isFocusModeOn();
          await mainPage.waitForChangeIsSaved();
          await expect(mainPage.viewport).toHaveScreenshot(
            'board-first-focus-on.png',
            {
              mask: mainPage.maskViewport(),
            },
          );
        },
      );

      await demoAccountFileTest.step(
        'Click "FOCUS MODE" tag on the Layers panel',
        async () => {
          await layersPanelPage.clickOnFocusModeLabel();
          await mainPage.waitForChangeIsSaved();
          await layersPanelPage.isLayerPresentOnLayersTab(board1, true);
          await layersPanelPage.isLayerPresentOnLayersTab(board2, true);
          await layersPanelPage.isFocusModeOff();
        },
      );

      await demoAccountFileTest.step(
        'Click RMB on 2nd board (on the Layers panel) - click "Focus On" menu item',
        async () => {
          await mainPage.focusLayerViaRightClickOnLayersTab(board2);
          await mainPage.waitForChangeIsSaved();
          await layersPanelPage.isLayerPresentOnLayersTab(board1, false);
          await layersPanelPage.isLayerPresentOnLayersTab(board2, true);
          await layersPanelPage.isFocusModeOn();
          await expect(mainPage.viewport).toHaveScreenshot(
            'board-second-focus-on.png',
            {
              mask: mainPage.maskViewport(),
            },
          );
        },
      );

      await demoAccountFileTest.step(
        'Click "FOCUS MODE" tag on the Layers panel',
        async () => {
          await layersPanelPage.clickOnFocusModeLabel();
          await mainPage.waitForChangeIsSaved();
          await layersPanelPage.isLayerPresentOnLayersTab(board1, true);
          await layersPanelPage.isLayerPresentOnLayersTab(board2, true);
          await layersPanelPage.isFocusModeOff();
        },
      );
    },
  );

  demoAccountFileTest(
    qase([253], 'Duplicate Board (From rightclick and Shortcut Ctrl+D)'),
    async ({ mainPage }) => {
      const board1 = 'Board #1';
      const board2 = 'Board #2';
      const board3 = 'Board #3';

      await demoAccountFileTest.step('Create a board', async () => {
        await mainPage.clickCreateBoardButton();
        await mainPage.clickViewportByCoordinates(350, 100);
        await mainPage.waitForChangeIsSaved();
        await layers.checkLayerRowIsVisible('Board');
        // Naming the board is setup (not in the Qase steps)
        await mainPage.doubleClickBoardTitleOnCanvas('Board');
        await mainPage.typeNameShapeLabelAndEnter(board3);
        await mainPage.waitForChangeIsSaved();
        await layers.checkLayerRowIsVisible(board3);
      });

      await demoAccountFileTest.step(
        'Click RMB on the 1st board on the canvas - click "Duplicate" menu item',
        async () => {
          await mainPage.duplicateLayerViaRightClickOnCanvas(board1);
          await mainPage.waitForChangeIsSaved();
          await layersPanelPage.isVisibleLayersCount(4);
        },
      );

      await demoAccountFileTest.step(
        'Click RMB on the 2nd board in the list (Layers panel on the left)- click "Duplicate" menu item',
        async () => {
          await mainPage.duplicateLayerViaLayersTab(board2);
          await mainPage.waitForChangeIsSaved();
          await layersPanelPage.isVisibleLayersCount(5);
        },
      );

      await demoAccountFileTest.step(
        'Select 3rd board and press CTRL+D on keyboard',
        async () => {
          await layersPanelPage.selectLayerByName(board3);
          await mainPage.clickShortcutCtrlD();
          await mainPage.waitForChangeIsSaved();
          await layersPanelPage.isVisibleLayersCount(6);
        },
      );
    },
  );

  demoAccountFileTest(
    qase([266], 'Rename and delete group'),
    async ({ mainPage }) => {
      const groupName = 'Group boards';

      await demoAccountFileTest.step('Select 2 boards (on the canvas)', async () => {
        await mainPage.clickMainMenuButton();
        await mainPage.clickEditMainMenuItem();
        await mainPage.clickSelectAllMainMenuSubItem();
        await layers.checkSelectedLayersCount(2);
      });

      await demoAccountFileTest.step(
        'Click RMB - click "Group" menu item',
        async () => {
          await mainPage.groupLayerViaRightClick();
          await mainPage.waitForChangeIsSaved();
          await layersPanelPage.isLayerPresentOnLayersTab('Group', true);
          await layers.checkChildLayerCount('Group', 2);
        },
      );

      await demoAccountFileTest.step(
        'Double click on Group name in "Layers" panel',
        async () => {
          await layersPanelPage.doubleClickLayerOnLayersTab('Group');
          await layers.checkLayerNameInputVisible();
        },
      );

      await demoAccountFileTest.step('Rename group by typing new name', async () => {
        await layersPanelPage.typeNameCreatedLayerAndEnter(groupName);
        await mainPage.waitForChangeIsSaved();
        await layers.checkLayerRowIsVisible(groupName);
      });

      await demoAccountFileTest.step(
        'Click RMB on Group name in "Layers" panel - "Delete" menu item',
        async () => {
          await mainPage.deleteLayerViaRightClickByName(groupName);
          await mainPage.waitForChangeIsSaved();
          await layers.checkLayerRowIsVisible(groupName, false);
        },
      );
    },
  );
});

demoAccountFileTest.describe(() => {
  demoAccountFileTest.beforeEach(async ({ mainPage }) => {
    await demoAccountFileTest.step('Create a board', async () => {
      await mainPage.createDefaultBoardByCoordinates(200, 200);
      await mainPage.waitForChangeIsSaved();
      await layers.checkLayerRowIsVisible('Board');
    });

    await demoAccountFileTest.step(
      'Setup (not in the Qase steps): resize the board to 600x600',
      async () => {
        await designPanelPage.changeHeightAndWidthForLayer('600', '600');
        await mainPage.waitForChangeIsSaved();
      },
    );
  });

  demoAccountFileTest(
    qase([2040], 'Resize board to fit 2 elements'),
    async ({ mainPage }) => {
      await demoAccountFileTest.step(
        'Create ellipse and rectangle inside the Board',
        async () => {
          await mainPage.createDefaultEllipseByCoordinates(210, 210, true);
          await mainPage.createDefaultRectangleByCoordinates(320, 210, true);
          await layers.checkLayerIsChildOf('Ellipse', 'Board');
          await layers.checkLayerIsChildOf('Rectangle', 'Board');
        },
      );

      await demoAccountFileTest.step('Select board', async () => {
        await layers.selectLayer('Board');
        await mainPage.waitForResizeHandlerVisible();
      });

      await demoAccountFileTest.step(
        'Click "Resize to fit content" icon',
        async () => {
          await designPanelPage.clickOnResizeBoardToFitButton();
          await mainPage.waitForChangeIsSaved();
          await expect(mainPage.viewport).toHaveScreenshot(
            'resize-board-to-fit-2-elements.png',
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
      [2050],
      'Resize board to fit content that goes partially outside of the board',
    ),
    async ({ mainPage }) => {
      await demoAccountFileTest.step(
        "Create a rectangle inside the Board in a way that it's partially outside of the board",
        async () => {
          await mainPage.createDefaultRectangleByCoordinates(180, 350, true);
          await layers.checkLayerIsChildOf('Rectangle', 'Board');
        },
      );

      await demoAccountFileTest.step('Select board', async () => {
        await layers.selectLayer('Board');
        await mainPage.waitForResizeHandlerVisible();
      });

      await demoAccountFileTest.step(
        'Click "Resize to fit content" icon',
        async () => {
          await designPanelPage.clickOnResizeBoardToFitButton();
          await mainPage.waitForChangeIsSaved();
          await designPanelPage.checkSizeWidth('100');
          await designPanelPage.checkSizeHeight('100');
          await expect(mainPage.viewport).toHaveScreenshot(
            'resize-board-to-fit-partially-outside.png',
            {
              mask: mainPage.maskViewport(),
            },
          );
        },
      );
    },
  );
});

demoAccountFileTest(
  qase([217], 'Create board without a default size preset (Toolbar)'),
  async ({ mainPage }) => {
    await demoAccountFileTest.step(
      'Click on the Board icon from the toolbar',
      async () => {
        await mainPage.clickCreateBoardButton();
        await designPanelPage.checkSizePresetsDropdownVisible();
      },
    );

    await demoAccountFileTest.step('Click on the canvas', async () => {
      await mainPage.clickViewportTwice();
      await mainPage.waitForChangeIsSaved();
      await mainPage.isCreatedLayerVisible();
      await layers.checkLayerRowIsVisible('Board');
      await designPanelPage.checkSizeWidth('100');
      await designPanelPage.checkSizeHeight('100');
      await expect(mainPage.viewport).toHaveScreenshot('board.png', {
        mask: mainPage.maskViewport(),
      });
    });
  },
);

demoAccountFileTest(
  qase([218], 'Create a board without a default size preset (Shortcut B)'),
  async ({ mainPage }) => {
    await demoAccountFileTest.step('Press "B" keyboard button', async () => {
      await mainPage.pressKeyboardShortcut('B');
      await designPanelPage.checkSizePresetsDropdownVisible();
    });

    await demoAccountFileTest.step('Click on the canvas', async () => {
      await mainPage.clickViewportTwice();
      await mainPage.waitForChangeIsSaved();
      await mainPage.isCreatedLayerVisible();
      await layers.checkLayerRowIsVisible('Board');
      await designPanelPage.checkSizeWidth('100');
      await designPanelPage.checkSizeHeight('100');
    });
  },
);

demoAccountFileTest(
  qase(
    [2389],
    'Create board with a default size preset (Toolbar) allows custom dimension after creation',
  ),
  async ({ mainPage }) => {
    await demoAccountFileTest.step(
      'Setup (not in the Qase steps): create a board with a default size preset',
      async () => {
        await mainPage.clickCreateBoardButton();
        await designPanelPage.selectSizePresetsOption('Expanded');
        await mainPage.clickViewportByCoordinates(100, 150);
        await mainPage.waitForChangeIsSaved();
        await layers.checkLayerRowIsVisible('Board');
      },
    );

    await demoAccountFileTest.step(
      'Select and resize the board (to any other dimension)',
      async () => {
        await layers.selectLayer('Board');
        await mainPage.waitForResizeHandlerVisible();
        await designPanelPage.changeHeightAndWidthForLayer('500', '750');
        await mainPage.waitForChangeIsSaved();
        await designPanelPage.checkSizeWidth('750');
        await designPanelPage.checkSizeHeight('500');
      },
    );
  },
);

demoAccountFileTest(
  qase(
    [2390],
    'Create board with a default size preset allow to change frame orientation (Toolbar)',
  ),
  async ({ mainPage }) => {
    await demoAccountFileTest.step(
      'Click on the Board icon from the toolbar',
      async () => {
        await mainPage.clickCreateBoardButton();
        await designPanelPage.checkSizePresetsDropdownVisible();
      },
    );

    await demoAccountFileTest.step(
      'Select a preset size with a default horizontal orientation',
      async () => {
        await designPanelPage.selectSizePresetsOption('Expanded');
        await designPanelPage.isHorizontalOrientationButtonChecked();
      },
    );

    await demoAccountFileTest.step(
      'Click on the vertical icon to change frame orientation',
      async () => {
        await designPanelPage.clickOnVerticalOrientationButton();
        await designPanelPage.isVerticalOrientationButtonChecked();
      },
    );

    await demoAccountFileTest.step('Click on the canvas', async () => {
      await mainPage.clickViewportByCoordinates(100, 150);
      await mainPage.waitForChangeIsSaved();
      await layers.checkLayerRowIsVisible('Board');
      await designPanelPage.isVerticalOrientationButtonChecked();
      await designPanelPage.checkSizeWidth('800');
      await designPanelPage.checkSizeHeight('1280');
    });

    await demoAccountFileTest.step(
      'Click on the Board icon from the toolbar',
      async () => {
        await mainPage.clickCreateBoardButton();
        await designPanelPage.checkSizePresetsDropdownVisible();
      },
    );

    await demoAccountFileTest.step(
      'Select a preset size with a default vertical orientation',
      async () => {
        await designPanelPage.selectSizePresetsOption('iPhone 16 ');
        await designPanelPage.isVerticalOrientationButtonChecked();
      },
    );

    await demoAccountFileTest.step(
      'Click on the horizontal icon to change frame orientation',
      async () => {
        await designPanelPage.clickOnHorizontalOrientationButton();
        await designPanelPage.isHorizontalOrientationButtonChecked();
      },
    );

    await demoAccountFileTest.step('Click on the canvas', async () => {
      await mainPage.clickViewportByCoordinates(1000, 150);
      await mainPage.waitForChangeIsSaved();
      await designPanelPage.isHorizontalOrientationButtonChecked();
      await designPanelPage.checkSizeWidth('852');
      await designPanelPage.checkSizeHeight('393');
      await layersPanelPage.isVisibleLayersCount(2);
    });
  },
);

demoAccountFileTest(
  qase([2913], 'Copy board as image to clipboard'),
  async ({ mainPage }) => {
    await demoAccountFileTest.step(
      'Create a board and add several elements inside it (for example: rectangles, ellipses, and text).',
      async () => {
        await mainPage.createDefaultBoardByCoordinates(200, 200);
        await designPanelPage.changeHeightAndWidthForLayer('250', '250');
        await mainPage.waitForChangeIsSaved();
        await mainPage.createDefaultEllipseByCoordinates(210, 210, true);
        await mainPage.createDefaultRectangleByCoordinates(320, 210, true);
        await mainPage.createDefaultTextLayerByCoordinates(250, 350);
        await mainPage.clickViewportOnce();
        await layers.checkLayerIsChildOf('Ellipse', 'Board');
        await layers.checkLayerIsChildOf('Rectangle', 'Board');
        await layers.checkChildLayerCount('Board', 3);
      },
    );

    await demoAccountFileTest.step('Select the board.', async () => {
      await layers.selectLayer('Board');
      await mainPage.waitForResizeHandlerVisible();
    });

    await demoAccountFileTest.step(
      'Open the board context menu (right-click).',
      async () => {
        await mainPage.rightClickOnElement();
        await workspace.contextMenu.checkItemsAreVisible(['Copy/Paste as ...']);
      },
    );

    await demoAccountFileTest.step(
      'Go to Copy/Paste as... in the context menu.',
      async () => {
        await workspace.contextMenu.hoverItem('Copy/Paste as ...');
        await workspace.contextMenu.checkItemsAreVisible(['Copy as image']);
      },
    );

    await demoAccountFileTest.step('Click Copy as image', async () => {
      await workspace.contextMenu.clickItem('Copy as image');
      await workspace.checkImageCopiedToastIsVisible();
    });

    await demoAccountFileTest.step(
      'Verify the toast text "Image copied to clipboard" is shown.',
      async () => {
        await workspace.checkImageCopiedToastIsVisible();
      },
    );

    await demoAccountFileTest.step(
      'When the toast disappears, paste the image (Ctrl+V / Cmd+V) in the canvas.',
      async () => {
        await workspace.checkImageCopiedToastIsVisible(false);
        await mainPage.clickViewportByCoordinates(600, 200);
        // Pasting with Ctrl+V adds nothing in the test browser, so use the context menu's Paste
        await layersPanelPage.pasteLayerViaRightClick();
        await mainPage.waitForChangeIsSaved();
        await layers.checkLayerRowIsVisible('blob');
      },
    );

    await demoAccountFileTest.step(
      'Verify the pasted result is an image of the board content.',
      async () => {
        await expect(mainPage.viewport).toHaveScreenshot(
          'copied-image-from-board.png',
          {
            mask: mainPage.maskViewport(),
          },
        );
      },
    );
  },
);
