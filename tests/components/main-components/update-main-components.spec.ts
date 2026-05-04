import { DashboardPage } from '@pages/dashboard/dashboard-page';
import { TeamPage } from '@pages/dashboard/team-page';
import { AssetsPanelPage } from '@pages/workspace/assets-panel-page';
import { ColorPalettePage } from '@pages/workspace/color-palette-page';
import { DesignPanelPage } from '@pages/workspace/design-panel-page';
import { LayersPanelPage } from '@pages/workspace/layers-panel-page';
import { MainPage } from '@pages/workspace/main-page';
import { expect } from '@playwright/test';
import { mainTest } from 'fixtures';
import { SampleData } from 'helpers/sample-data';
import { createTeamName } from 'helpers/teams/create-team-name';
import { qase } from 'playwright-qase-reporter/playwright';

const teamName = createTeamName();

let assetsPanelPage: AssetsPanelPage;
let colorPalettePage: ColorPalettePage;
let dashboardPage: DashboardPage;
let designPanelPage: DesignPanelPage;
let layersPanelPage: LayersPanelPage;
let mainPage: MainPage;
let teamPage: TeamPage;

mainTest.beforeEach(async ({ page }) => {
  dashboardPage = new DashboardPage(page);
  teamPage = new TeamPage(page);
  mainPage = new MainPage(page);
  layersPanelPage = new LayersPanelPage(page);
  designPanelPage = new DesignPanelPage(page);
  colorPalettePage = new ColorPalettePage(page);
  assetsPanelPage = new AssetsPanelPage(page);
  await teamPage.createTeam(teamName);
  await dashboardPage.createFileViaPlaceholder();
  await mainPage.isMainPageLoaded();
});

mainTest.afterEach(async () => {
  await mainPage.backToDashboardFromFileEditor();
  await teamPage.deleteTeam(teamName);
});

mainTest(qase([1275], 'Update main component'), async () => {
  await mainTest.step('Create rectangle component and duplicate it', async () => {
    await mainPage.createDefaultRectangleByCoordinates(200, 300);
    await mainPage.createComponentViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await mainPage.duplicateLayerViaRightClick();
    await mainPage.waitForChangeIsSaved();
  });

  await mainTest.step('Move copy component and change its fill color', async () => {
    await layersPanelPage.clickCopyComponentOnLayersTab();
    await designPanelPage.changeAxisXAndYForLayer('400', '500');
    await mainPage.waitForChangeIsSaved();
    await designPanelPage.clickComponentFillColorIcon();
    await colorPalettePage.modalSetHex('#304d6a');
    await mainPage.clickViewportTwice();
    await mainPage.waitForChangeIsSaved();
  });

  await mainTest.step('Update main component from copy', async () => {
    await layersPanelPage.updateMainComponentViaRightClick();
  });

  await mainTest.step(
    'Verify updated component on canvas and assets tab',
    async () => {
      await expect(
        mainPage.viewport,
        'Viewport should match screenshot after updating main component',
      ).toHaveScreenshot('component-update-canvas.png', {
        mask: [mainPage.guides, mainPage.guidesFragment, mainPage.toolBarWindow],
      });
      await assetsPanelPage.clickAssetsTab();
      await assetsPanelPage.expandComponentsBlockOnAssetsTab();
      await expect(
        assetsPanelPage.assetsPanel,
        'Assets panel should match screenshot after updating main component',
      ).toHaveScreenshot('component-update-asset.png', {
        mask: [assetsPanelPage.librariesOpenModalButton],
      });
    },
  );
});

mainTest(qase([1306], 'Check copy and main component icons'), async () => {
  await mainTest.step('Create rectangle component and duplicate it', async () => {
    await mainPage.createDefaultRectangleByCoordinates(200, 300);
    await mainPage.createComponentViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await mainPage.duplicateLayerViaRightClick();
    await mainPage.waitForChangeIsSaved();
  });

  await mainTest.step(
    'Verify main and copy component icons in layers panel',
    async () => {
      await layersPanelPage.isMainComponentOnLayersTabVisibleWithName('Rectangle');
      await layersPanelPage.isCopyComponentOnLayersTabVisibleWithName('Rectangle');
    },
  );
});

mainTest.describe(() => {
  mainTest.beforeEach(async () => {
    await mainTest.slow();
    await mainPage.createDefaultRectangleByCoordinates(200, 300);
    await mainPage.createComponentViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await designPanelPage.clickOnClipContentButton();
    await mainPage.waitForChangeIsSaved();
    await mainPage.duplicateLayerViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await layersPanelPage.clickCopyComponentOnLayersTab();
    await designPanelPage.changeAxisXAndYForLayer('400', '500');
    await mainPage.duplicateLayerViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await layersPanelPage.clickCopyComponentOnLayersTab();
    await designPanelPage.changeAxisXAndYForLayer('50', '400');
  });

  mainTest(
    qase([1438], 'Create a component and 2 copies of it, change rotation of main'),
    async () => {
      await mainTest.step('Change rotation of main component', async () => {
        await layersPanelPage.clickMainComponentOnLayersTab();
        await designPanelPage.changeRotationForLayer('20');
        await designPanelPage.waitForChangeIsUnsaved();
        await designPanelPage.waitForChangeIsSaved();
      });

      await mainTest.step(
        'Verify rotation change propagated to copies',
        async () => {
          await expect(
            mainPage.viewport,
            'Viewport should match screenshot after changing main component rotation',
          ).toHaveScreenshot('main-copies-component-change-rotation.png', {
            mask: mainPage.maskViewport(),
          });
        },
      );
    },
  );

  mainTest(
    qase(
      [1440],
      'Create a component and 2 copies of it, change all corners of main',
    ),
    async () => {
      const cornerValue = '45';

      await mainTest.step(
        'Change all corners of main component individually',
        async () => {
          await layersPanelPage.clickMainComponentOnLayersTab();
          await designPanelPage.clickIndividualCornersRadiusButton();
          await designPanelPage.changeTopLeftCornerRadiusForLayer(cornerValue);
          await designPanelPage.changeTopRightCornerRadiusForLayer(cornerValue);
          await designPanelPage.changeBottomLeftCornerRadiusForLayer(cornerValue);
          await designPanelPage.changeBottomRightCornerRadiusForLayer(cornerValue);
          await mainPage.waitForChangeIsUnsaved();
          await mainPage.waitForChangeIsSaved();
        },
      );

      await mainTest.step('Verify corner changes propagated to copies', async () => {
        await expect(
          mainPage.viewport,
          'Viewport should match screenshot after adding corners to main component',
        ).toHaveScreenshot('main-copies-component-add-corners.png', {
          mask: mainPage.maskViewport(),
        });
      });
    },
  );

  mainTest(
    qase(
      [1441],
      'Create a component and 2 copies of it, change corners of main separate by using "All corners"',
    ),
    async () => {
      const cornerValue = '45';

      await mainTest.step(
        'Change corner radius using "All corners" option on main component',
        async () => {
          await layersPanelPage.clickMainComponentOnLayersTab();
          await designPanelPage.changeGeneralCornerRadiusForLayer(cornerValue);
          await mainPage.waitForChangeIsUnsaved();
          await mainPage.waitForChangeIsSaved();
        },
      );

      await mainTest.step('Verify corner changes propagated to copies', async () => {
        await expect(
          mainPage.viewport,
          'Viewport should match screenshot after adding corners via all corners option',
        ).toHaveScreenshot('main-copies-component-add-corners.png', {
          mask: mainPage.maskViewport(),
        });
      });
    },
  );

  mainTest(
    qase(
      [1408],
      'Create a component and 2 copies of it, change stroke color of main',
    ),
    async () => {
      const sampleData = new SampleData();

      await mainTest.step('Add stroke to main component and set color', async () => {
        await layersPanelPage.clickMainComponentOnLayersTab();
        await designPanelPage.clickAddStrokeButton();
        await mainPage.waitForChangeIsSaved();
        await designPanelPage.setStrokeColor(sampleData.color.redHexCode);
        await mainPage.waitForChangeIsSaved();
        await mainPage.clickViewportByCoordinates(400, 400);
        await mainPage.waitForChangeIsSaved();
      });

      await mainTest.step('Verify stroke change propagated to copies', async () => {
        await expect(
          mainPage.viewport,
          'Viewport should match screenshot after adding stroke to main component',
        ).toHaveScreenshot('main-copies-component-add-stroke.png', {
          mask: mainPage.maskViewport(),
          maxDiffPixels: 0,
        });
      });
    },
  );

  mainTest(
    qase([1444], 'Create a component and 2 copies of it, change fill of main'),
    async () => {
      const sampleData = new SampleData();

      await mainTest.step('Add fill color to main component', async () => {
        await layersPanelPage.clickMainComponentOnLayersTab();
        await layersPanelPage.selectMainComponentChildLayer();
        await designPanelPage.changeHeightAndWidthForLayer('50', '50');
        await mainPage.waitForChangeIsSaved();
        await layersPanelPage.clickMainComponentOnLayersTab();
        await designPanelPage.clickAddFillButton();
        await mainPage.waitForChangeIsSaved();
        await designPanelPage.clickFillColorIcon();
        await colorPalettePage.setHex(sampleData.color.blueHexCode);
        await layersPanelPage.clickMainComponentOnLayersTab();
        await mainPage.waitForChangeIsSaved();
        await mainPage.waitForResizeHandlerVisible();
      });

      await mainTest.step('Verify fill change propagated to copies', async () => {
        await expect(
          mainPage.viewport,
          'Viewport should match screenshot after changing fill color of main component',
        ).toHaveScreenshot('main-component-change-fill-color.png', {
          mask: mainPage.maskViewport(),
        });
      });
    },
  );

  mainTest(
    qase(
      [1445],
      'Create a component and 2 copies of it, change shadow opacity and color of main',
    ),
    async () => {
      await mainTest.step('Add default shadow to main component', async () => {
        await layersPanelPage.clickMainComponentOnLayersTab();
        await mainPage.waitForChangeIsSaved();
        await designPanelPage.clickAddShadowButton();
        await mainPage.waitForChangeIsUnsaved();
        await mainPage.waitForChangeIsSaved();
        await layersPanelPage.clickMainComponentOnLayersTab();
        await mainPage.clickViewportByCoordinates(1000, 200, 2);
      });

      await mainTest.step('Verify default shadow on canvas', async () => {
        await expect(
          mainPage.viewport,
          'Viewport should match screenshot with default shadow on main component',
        ).toHaveScreenshot('main-copies-component-shadow-default.png', {
          mask: mainPage.maskViewport(),
          maxDiffPixels: 0,
        });
      });

      await mainTest.step(
        'Change shadow opacity and color of main component',
        async () => {
          await layersPanelPage.clickMainComponentOnLayersTab();
          await designPanelPage.clickShadowActionsButton();
          await designPanelPage.changeOpacityForShadow('70');
          await designPanelPage.clickShadowColorIcon();
          await colorPalettePage.setHex('#09e5ec');
          await mainPage.waitForChangeIsSaved();
          await layersPanelPage.clickMainComponentOnLayersTab();
          await mainPage.clickViewportByCoordinates(1000, 200, 2);
        },
      );

      await mainTest.step('Verify updated shadow propagated to copies', async () => {
        await expect(
          mainPage.viewport,
          'Viewport should match screenshot with updated shadow on main component',
        ).toHaveScreenshot('main-copies-component-shadow-updated.png', {
          mask: mainPage.maskViewport(),
          maxDiffPixels: 0,
        });
      });
    },
  );

  mainTest(
    qase([1446], 'Create a component and 2 copies of it, change blur of main'),
    async () => {
      await mainTest.step('Add blur to main component', async () => {
        await layersPanelPage.clickMainComponentOnLayersTab();
        await designPanelPage.clickAddBlurButton();
        await mainPage.waitForChangeIsSaved();
        await layersPanelPage.clickMainComponentOnLayersTab();
        await mainPage.clickViewportByCoordinates(1000, 200, 2);
      });

      await mainTest.step('Verify blur change propagated to copies', async () => {
        await expect(
          mainPage.viewport,
          'Viewport should match screenshot after adding blur to main component',
        ).toHaveScreenshot('main-copies-component-blur.png', {
          mask: mainPage.maskViewport(),
          maxDiffPixels: 0,
        });
      });
    },
  );

  mainTest(
    qase(
      [1447],
      'Create a component and 2 copies of it, change grid style and size of main',
    ),
    async () => {
      await mainTest.step('Add grid with rows type to main component', async () => {
        await layersPanelPage.clickMainComponentOnLayersTab();
        await designPanelPage.clickAddGridButton();
        await designPanelPage.selectGridType('Rows');
        await layersPanelPage.clickMainComponentOnLayersTab();
        await mainPage.waitForChangeIsUnsaved();
        await mainPage.waitForChangeIsSaved();
      });

      await mainTest.step('Verify default grid propagated to copies', async () => {
        await expect(
          mainPage.viewport,
          'Viewport should match screenshot with default grid on main component',
        ).toHaveScreenshot('main-copies-component-grid-default.png', {
          mask: mainPage.maskViewport(),
          maxDiffPixels: 0,
        });
      });

      await mainTest.step('Change grid size', async () => {
        await designPanelPage.changeSizeForGrid('4');
        await designPanelPage.gridTypeField.click();
        await mainPage.clickViewportTwice();
        await mainPage.waitForChangeIsSaved();
      });

      await mainTest.step(
        'Verify updated grid size propagated to copies',
        async () => {
          await expect(
            mainPage.viewport,
            'Viewport should match screenshot after updating grid size on main component',
          ).toHaveScreenshot('main-copies-component-grid-updated.png', {
            mask: mainPage.maskViewport(),
            maxDiffPixels: 0,
          });
        },
      );
    },
  );
});

mainTest.describe('Text', () => {
  mainTest.beforeEach(async () => {
    await mainTest.slow();
    await mainPage.backToDashboardFromFileEditor();
    await dashboardPage.clickAddProjectButton();
    await dashboardPage.setProjectName('Test Project');
    await dashboardPage.isProjectTitleDisplayed('Test Project');
    await dashboardPage.importFile('documents/text-components-propagation.penpot');
    await dashboardPage.openFileWithName('Propagation of text components I');
  });

  mainTest(
    qase(
      [2261],
      'Propagation of (style and content) changes from a text component to copies (overriding style or content)',
    ),
    async () => {
      const sampleData = new SampleData();

      await mainTest.step(
        'Change text style properties of main component child layer',
        async () => {
          await layersPanelPage.clickMainComponentOnLayersTab();
          await layersPanelPage.selectMainComponentChildLayer();
          await designPanelPage.changeTextFont('Source Serif 4');
          await designPanelPage.changeTextFontStyle('300 Italic');
          await designPanelPage.changeTextFontSize('9');
          await designPanelPage.changeTextLetterSpacing('4');
          await designPanelPage.clickOnTextAlignOptionsButton();
          await designPanelPage.clickOnTextStrikethroughButton();
          await designPanelPage.clickFillColorIcon();
          await colorPalettePage.setHex(sampleData.color.redHexCode);
          await mainPage.clickViewportTwice();
          await mainPage.waitForChangeIsSaved();
        },
      );

      await mainTest.step(
        'Edit text content of main component child layer',
        async () => {
          await layersPanelPage.clickMainComponentOnLayersTab();
          await layersPanelPage.selectMainComponentChildLayer();
          await mainPage.editTextLayer('Testing Penpot !!');
          await mainPage.waitForChangeIsSaved();
          await mainPage.waitForResizeHandlerVisible();
        },
      );

      await mainTest.step(
        'Verify style and content propagation to copies',
        async () => {
          await expect(
            mainPage.viewport,
            'Viewport should match screenshot with updated text component copies',
          ).toHaveScreenshot('main-copies-component-text.png', {
            mask: mainPage.maskViewport(),
            maxDiffPixels: 0,
          });
        },
      );
    },
  );

  mainTest(
    qase(
      [2263],
      'Propagation of (independent) changes from a text component to (all) copies',
    ),
    async () => {
      const sampleData = new SampleData();

      await mainTest.step(
        'Apply stroke, rotation and width changes to main component child layer',
        async () => {
          await layersPanelPage.clickMainComponentOnLayersTab();
          await layersPanelPage.selectMainComponentChildLayer();
          await designPanelPage.clickAddStrokeButton();
          await designPanelPage.changeStrokeSettings(
            sampleData.color.redHexCode,
            '60',
            '10',
            'Inside',
          );
          await mainPage.waitForChangeIsSaved();
          await designPanelPage.changeRotationForLayer('40');
          await mainPage.waitForChangeIsSaved();
          await mainPage.waitForResizeHandlerVisible();
          await designPanelPage.changeWidthForLayer('40');
          await mainPage.waitForChangeIsSaved();
          await mainPage.waitForResizeHandlerVisible();
        },
      );

      await mainTest.step(
        'Verify independent changes propagated to all copies',
        async () => {
          await expect(
            mainPage.viewport,
            'Viewport should match screenshot with independent text changes propagated to copies',
          ).toHaveScreenshot('main-copies-component-text-independent-changes.png', {
            mask: mainPage.maskViewport(),
            maxDiffPixels: 0,
          });
        },
      );
    },
  );
});

mainTest.describe(() => {
  const sampleData = new SampleData();

  mainTest.beforeEach(async () => {
    await mainTest.slow();
    await mainPage.createDefaultRectangleByCoordinates(200, 300);
    await mainPage.createComponentViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await mainPage.duplicateLayerViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await layersPanelPage.clickCopyComponentOnLayersTab();
    await designPanelPage.changeAxisXAndYForLayer('400', '500');
  });

  mainTest(
    qase([1404], 'Change copy components shadow and update main components color'),
    async () => {
      await mainTest.step('Add shadow to copy component', async () => {
        await layersPanelPage.clickCopyComponentOnLayersTab();
        await designPanelPage.clickAddShadowButton();
      });

      await mainTest.step(
        `Set main component fill color to "${sampleData.color.blueHexCode}"`,
        async () => {
          await layersPanelPage.clickMainComponentOnLayersTab();
          await mainPage.waitForChangeIsSaved();
          await designPanelPage.setComponentColor(sampleData.color.blueHexCode);
          await layersPanelPage.clickMainComponentOnLayersTab();
          await designPanelPage.isFillHexCodeSetComponent(
            sampleData.color.blueHexCode,
          );
          await mainPage.waitForChangeIsSaved();
        },
      );

      await mainTest.step(
        'Verify copy shadow is preserved and main color is updated',
        async () => {
          await expect(
            mainPage.viewport,
            'Viewport should match screenshot with copy shadow and updated main color',
          ).toHaveScreenshot('main-copies-component-change-shadow.png', {
            mask: mainPage.maskViewport(),
            maxDiffPixels: 0,
          });
        },
      );
    },
  );

  mainTest(
    qase([1403], 'Change copy components color and update main components color'),
    async ({ browserName }) => {
      await mainTest.step(
        `Set copy component fill color to "${sampleData.color.blackHexCode}"`,
        async () => {
          await layersPanelPage.clickCopyComponentOnLayersTab();
          await mainPage.waitForChangeIsSaved();
          await designPanelPage.setComponentColor(sampleData.color.blackHexCode);
          await mainPage.waitForChangeIsSaved();
        },
      );

      await mainTest.step(
        `Set main component fill color to "${sampleData.color.redHexCode}"`,
        async () => {
          await layersPanelPage.clickMainComponentOnLayersTab();
          await mainPage.waitForChangeIsSaved();
          await designPanelPage.setComponentColor(sampleData.color.redHexCode);
          await mainPage.clickViewportTwice();
          browserName === 'chromium'
            ? await mainPage.waitForChangeIsUnsaved()
            : null;
          await mainPage.waitForChangeIsSaved();
        },
      );

      await mainTest.step(
        'Verify copy color override is preserved while main color is updated',
        async () => {
          await layersPanelPage.clickCopyComponentOnLayersTab();
          await designPanelPage.isFillHexCodeSetComponent(
            sampleData.color.blackHexCode,
          );
          await expect(
            mainPage.viewport,
            'Viewport should match screenshot with overridden copy fill and updated main fill',
          ).toHaveScreenshot('main-copies-component-change-fill.png', {
            mask: mainPage.maskViewport(),
          });
        },
      );
    },
  );

  mainTest(
    qase([1405], 'Change copy components blur and update main components color'),
    async () => {
      await mainTest.step('Add blur to copy component', async () => {
        await layersPanelPage.clickCopyComponentOnLayersTab();
        await designPanelPage.clickAddBlurButton();
        await designPanelPage.changeValueForBlur('2');
        await mainPage.waitForChangeIsSaved();
      });

      await mainTest.step(
        `Set main component fill color to "${sampleData.color.blueHexCode}"`,
        async () => {
          await layersPanelPage.clickMainComponentOnLayersTab();
          await designPanelPage.setComponentColor(sampleData.color.blueHexCode);
          await layersPanelPage.clickMainComponentOnLayersTab();
          await mainPage.waitForChangeIsUnsaved();
          await mainPage.waitForChangeIsSaved();
          await mainPage.waitForViewportVisible();
        },
      );

      await mainTest.step(
        'Verify copy blur is preserved and main color is updated',
        async () => {
          await expect(
            mainPage.viewport,
            'Viewport should match screenshot with copy blur and updated main color',
          ).toHaveScreenshot('main-copies-component-change-blur.png', {
            mask: mainPage.maskViewport(),
          });
        },
      );
    },
  );

  mainTest(
    qase([1406], 'Change copy components grid and update main components color'),
    async () => {
      await mainTest.step('Add grid with rows type to copy component', async () => {
        await layersPanelPage.clickCopyComponentOnLayersTab();
        await designPanelPage.clickAddGridButton();
        await designPanelPage.selectGridType('Rows');
        await mainPage.waitForChangeIsSaved();
      });

      await mainTest.step(
        `Set main component fill color to "${sampleData.color.blueHexCode}"`,
        async () => {
          await layersPanelPage.clickMainComponentOnLayersTab();
          await designPanelPage.setComponentColor(sampleData.color.blueHexCode);
          await layersPanelPage.clickMainComponentOnLayersTab();
          await mainPage.waitForChangeIsSaved();
        },
      );

      await mainTest.step(
        'Verify copy grid is preserved and main color is updated',
        async () => {
          await expect(
            mainPage.viewport,
            'Viewport should match screenshot with copy grid and updated main color',
          ).toHaveScreenshot('main-copies-component-change-grid.png', {
            mask: mainPage.maskViewport(),
            maxDiffPixels: 0,
          });
        },
      );
    },
  );

  mainTest(qase([1409], 'Change copy name and change component name'), async () => {
    await mainTest.step('Rename copy component to "test"', async () => {
      await layersPanelPage.clickCopyComponentOnLayersTab();
      await layersPanelPage.doubleClickCopyComponentOnLayersTab();
      await layersPanelPage.typeNameCreatedLayerAndEnter('test');
      await mainPage.waitForChangeIsSaved();
      await layersPanelPage.isCopyComponentNameDisplayed('test');
    });

    await mainTest.step('Rename main component to "dfsfs"', async () => {
      await layersPanelPage.clickMainComponentOnLayersTab();
      await layersPanelPage.doubleClickMainComponentOnLayersTab();
      await layersPanelPage.typeNameCreatedLayerAndEnter('dfsfs');
      await mainPage.waitForChangeIsSaved();
    });

    await mainTest.step(
      'Verify copy name is preserved after renaming main component',
      async () => {
        await layersPanelPage.isCopyComponentNameDisplayed('test');
        await layersPanelPage.clickMainComponentOnLayersTab();
        await mainPage.waitForChangeIsSaved();
        await expect(
          mainPage.viewport,
          'Viewport should match screenshot after renaming components',
        ).toHaveScreenshot('main-copies-component-change-name.png', {
          mask: mainPage.maskViewport(),
        });
      },
    );
  });
});

mainTest(qase([1478], 'Changed direct, not overriden'), async () => {
  const sampleData = new SampleData();

  await mainTest.step('Create rectangle component and duplicate it', async () => {
    await mainPage.createDefaultRectangleByCoordinates(200, 300);
    await mainPage.createComponentViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await mainPage.duplicateLayerViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await layersPanelPage.clickCopyComponentOnLayersTab();
    await designPanelPage.changeAxisXAndYForLayer('400', '500');
    await mainPage.waitForChangeIsSaved();
  });

  await mainTest.step(
    `Set main component fill color to "${sampleData.color.blueHexCode}"`,
    async () => {
      await layersPanelPage.clickMainComponentOnLayersTab();
      await designPanelPage.setComponentColor(sampleData.color.blueHexCode);
      await mainPage.clickViewportTwice();
      await mainPage.waitForChangeIsSaved();
    },
  );

  await mainTest.step('Verify direct color change on canvas', async () => {
    await expect(
      mainPage.viewport,
      'Viewport should match screenshot with direct color change not overridden in copy',
    ).toHaveScreenshot('1478-component-update-canvas.png', {
      mask: mainPage.maskViewport(),
    });
  });
});

mainTest(qase([1479], 'Changed remote, not overriden'), async () => {
  const sampleData = new SampleData();

  await mainTest.step(
    'Create component with copy and create a second nested component',
    async () => {
      await mainPage.createDefaultRectangleByCoordinates(200, 300);
      await mainPage.createComponentViaRightClick();
      await mainPage.waitForChangeIsSaved();
      await mainPage.duplicateLayerViaRightClick();
      await mainPage.waitForChangeIsSaved();
      await layersPanelPage.clickCopyComponentOnLayersTab();
      await designPanelPage.changeAxisXAndYForLayer('400', '500');
      await mainPage.waitForChangeIsSaved();
      await mainPage.createComponentViaRightClick();
      await mainPage.duplicateLayerViaRightClick();
      await mainPage.waitForChangeIsSaved();
      await layersPanelPage.clickCopyComponentOnLayersTab();
      await designPanelPage.changeAxisXAndYForLayer('200', '500');
      await mainPage.waitForChangeIsSaved();
    },
  );

  await mainTest.step(
    `Set main component fill color to "${sampleData.color.pinkHexCode}"`,
    async () => {
      await layersPanelPage.clickMainComponentOnLayersTab();
      await designPanelPage.setComponentColor(sampleData.color.pinkHexCode);
      await mainPage.clickViewportTwice();
      await mainPage.waitForChangeIsSaved();
    },
  );

  await mainTest.step(
    'Verify remote color change on canvas and assets panel',
    async () => {
      await expect(
        mainPage.viewport,
        'Viewport should match screenshot with remote color change not overridden in copy',
      ).toHaveScreenshot('1479-component-update-canvas.png', {
        mask: mainPage.maskViewport(),
      });
      await assetsPanelPage.clickAssetsTab();
      await assetsPanelPage.expandComponentsBlockOnAssetsTab();
      await expect(
        assetsPanelPage.assetsPanel,
        'Assets panel should match screenshot with remote color change',
      ).toHaveScreenshot('1479-component-update-asset.png', {
        mask: [assetsPanelPage.librariesOpenModalButton],
      });
    },
  );
});

mainTest(qase([1480], 'Changed direct, overriden in copy'), async () => {
  const sampleData = new SampleData();

  await mainTest.step(
    'Create component with copy and override copy color',
    async () => {
      await mainPage.createDefaultRectangleByCoordinates(200, 300);
      await mainPage.createComponentViaRightClick();
      await mainPage.waitForChangeIsSaved();
      await mainPage.duplicateLayerViaRightClick();
      await mainPage.waitForChangeIsSaved();
      await layersPanelPage.clickCopyComponentOnLayersTab();
      await designPanelPage.changeAxisXAndYForLayer('400', '500');
      await mainPage.waitForChangeIsSaved();
      await designPanelPage.setComponentColor(sampleData.color.pinkHexCode);
      await mainPage.clickViewportTwice();
      await mainPage.waitForChangeIsSaved();
    },
  );

  await mainTest.step(
    `Set main component fill color to "${sampleData.color.purpleHexCode}"`,
    async () => {
      await layersPanelPage.clickMainComponentOnLayersTab();
      await designPanelPage.setComponentColor(sampleData.color.purpleHexCode);
      await mainPage.clickViewportTwice();
      await mainPage.waitForChangeIsSaved();
    },
  );

  await mainTest.step(
    'Verify copy color override is preserved while main color is updated',
    async () => {
      await expect(
        mainPage.viewport,
        'Viewport should match screenshot with direct change overridden in copy',
      ).toHaveScreenshot('1480-component-update-canvas.png', {
        mask: mainPage.maskViewport(),
      });
      await assetsPanelPage.clickAssetsTab();
      await assetsPanelPage.expandComponentsBlockOnAssetsTab();
      await expect(
        assetsPanelPage.assetsPanel,
        'Assets panel should match screenshot with direct change overridden in copy',
      ).toHaveScreenshot('1480-component-update-asset.png', {
        mask: [assetsPanelPage.librariesOpenModalButton],
      });
    },
  );
});

mainTest(qase([1482], 'Changed remote, overriden in copy'), async () => {
  const sampleData = new SampleData();

  await mainTest.step(
    'Create component with copy, create nested component and override copy color',
    async () => {
      await mainPage.createDefaultRectangleByCoordinates(200, 300);
      await mainPage.createComponentViaRightClick();
      await mainPage.waitForChangeIsSaved();
      await mainPage.duplicateLayerViaRightClick();
      await mainPage.waitForChangeIsSaved();
      await layersPanelPage.clickCopyComponentOnLayersTab();
      await designPanelPage.changeAxisXAndYForLayer('400', '500');
      await mainPage.waitForChangeIsSaved();
      await mainPage.createComponentViaRightClick();
      await mainPage.duplicateLayerViaRightClick();
      await mainPage.waitForChangeIsSaved();
      await layersPanelPage.clickCopyComponentOnLayersTab();
      await designPanelPage.changeAxisXAndYForLayer('200', '500');
      await mainPage.waitForChangeIsSaved();
      await designPanelPage.setComponentColor(sampleData.color.greenHexCode1);
      await mainPage.clickViewportTwice();
      await mainPage.waitForChangeIsSaved();
    },
  );

  await mainTest.step(
    `Set main component fill color to "${sampleData.color.pinkHexCode}"`,
    async () => {
      await layersPanelPage.clickMainComponentOnLayersTab();
      await designPanelPage.setComponentColor(sampleData.color.pinkHexCode);
      await mainPage.clickViewportTwice();
      await mainPage.waitForChangeIsSaved();
    },
  );

  await mainTest.step(
    'Verify copy color override is preserved while remote change is applied',
    async () => {
      await expect(
        mainPage.viewport,
        'Viewport should match screenshot with remote change overridden in copy',
      ).toHaveScreenshot('1482-component-update-canvas.png', {
        mask: mainPage.maskViewport(),
      });
    },
  );
});

mainTest(
  qase([1483], 'Changed remote, overriden in near, overriden in copy'),
  async () => {
    const sampleData = new SampleData();

    await mainTest.step(
      'Create components with copies and override colors at multiple levels',
      async () => {
        await mainPage.createDefaultRectangleByCoordinates(200, 300);
        await mainPage.createComponentViaRightClick();
        await mainPage.waitForChangeIsSaved();
        await mainPage.duplicateLayerViaRightClick();
        await mainPage.waitForChangeIsSaved();
        await layersPanelPage.clickCopyComponentOnLayersTab();
        await designPanelPage.changeAxisXAndYForLayer('400', '500');
        await mainPage.waitForChangeIsSaved();
        await mainPage.createComponentViaRightClick();
        await mainPage.duplicateLayerViaRightClick();
        await mainPage.waitForChangeIsSaved();
        await layersPanelPage.clickCopyComponentOnLayersTab();
        await designPanelPage.changeAxisXAndYForLayer('200', '500');
        await mainPage.waitForChangeIsSaved();
        await designPanelPage.setComponentColor(sampleData.color.greenHexCode1);
        await mainPage.clickViewportTwice();
        await mainPage.waitForChangeIsSaved();
        await layersPanelPage.clickNMainComponentOnLayersTab(-2);
        await designPanelPage.setComponentColor(sampleData.color.greenHexCode2);
        await mainPage.clickViewportTwice();
        await mainPage.waitForChangeIsSaved();
        await layersPanelPage.clickMainComponentOnLayersTab();
        await designPanelPage.setComponentColor(sampleData.color.greenHexCode3);
        await mainPage.clickViewportTwice();
        await mainPage.waitForChangeIsSaved();
      },
    );

    await mainTest.step(
      'Verify multi-level color overrides are preserved on canvas',
      async () => {
        await expect(
          mainPage.viewport,
          'Viewport should match screenshot with remote change overridden at near and copy levels',
        ).toHaveScreenshot('1483-component-update-canvas.png', {
          mask: mainPage.maskViewport(),
        });
      },
    );
  },
);
