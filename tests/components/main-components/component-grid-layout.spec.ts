import { DashboardPage } from '@pages/dashboard/dashboard-page';
import { TeamPage } from '@pages/dashboard/team-page';
import { AssetsPanelPage } from '@pages/workspace/assets-panel-page';
import { ColorPalettePage } from '@pages/workspace/color-palette-page';
import { DesignPanelPage } from '@pages/workspace/design-panel-page';
import { LayersPanelPage } from '@pages/workspace/layers-panel-page';
import { MainPage } from '@pages/workspace/main-page';
import { expect } from '@playwright/test';
import { mainTest } from 'fixtures';
import { createTeamName } from 'helpers/teams/create-team-name';
import { qase } from 'playwright-qase-reporter/playwright';

const teamName = createTeamName();
const annotation = 'Test annotation for automation';

let assetsPanelPage: AssetsPanelPage;
let colorPalettePage: ColorPalettePage;
let dashboardPage: DashboardPage;
let designPanelPage: DesignPanelPage;
let layersPanelPage: LayersPanelPage;
let mainPage: MainPage;
let teamPage: TeamPage;

mainTest.beforeEach(async ({ page }) => {
  teamPage = new TeamPage(page);
  dashboardPage = new DashboardPage(page);
  mainPage = new MainPage(page);
  designPanelPage = new DesignPanelPage(page);
  assetsPanelPage = new AssetsPanelPage(page);
  layersPanelPage = new LayersPanelPage(page);
  colorPalettePage = new ColorPalettePage(page);
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
    await mainTest.slow();
    await mainPage.createDefaultBoardByCoordinates(400, 400);
    await designPanelPage.changeHeightAndWidthForLayer('300', '400');
    await mainPage.waitForChangeIsSaved();
    await mainPage.addGridLayoutViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await designPanelPage.isLayoutRemoveButtonExists();
    await mainPage.clickViewportOnce();
    await mainPage.clickCreatedBoardTitleOnCanvas();
  });

  mainTest(qase([1717], 'Create a component from empty Grid Board'), async () => {
    await mainTest.step('Create component from empty grid board', async () => {
      await mainPage.createComponentViaRightClick();
      await mainPage.waitForChangeIsSaved();
    });

    await mainTest.step('Verify component on canvas', async () => {
      await expect(
        mainPage.viewport,
        'Viewport should match screenshot with empty grid board component',
      ).toHaveScreenshot('empty-board-component-with-grid-layout.png', {
        mask: mainPage.maskViewport(),
      });
    });
  });

  mainTest(
    qase(
      [1724],
      'Create a component from grid board with some element inside, edit component in grid layout section',
    ),
    async () => {
      await mainTest.step('Create component from grid board', async () => {
        await mainPage.createComponentViaRightClick();
        await mainPage.waitForChangeIsSaved();
        await mainPage.clickViewportOnce();
        await mainPage.clickCreatedBoardTitleOnCanvas();
        await mainPage.clickBoardOnCanvas();
        await mainPage.doubleClickBoardOnCanvas();
      });

      await mainTest.step('Edit grid row label to "100 PX"', async () => {
        await mainPage.changeGridRowLabel('100 PX');
        await mainPage.waitForChangeIsSaved();
      });

      await mainTest.step('Verify grid row label change on canvas', async () => {
        await expect(
          mainPage.viewport,
          'Viewport should match screenshot after editing grid row label to px',
        ).toHaveScreenshot('board-component-with-px-row.png', {
          mask: mainPage.maskViewport({ gridEditorToolbar: true }),
        });
      });
    },
  );

  mainTest(
    qase([1729], 'Move a component between pages'),
    async ({ browserName }) => {
      await mainTest.step('Create component and copy it', async () => {
        await mainPage.createComponentViaRightClick();
        await mainPage.waitForChangeIsSaved();
        await mainPage.clickViewportOnce();
        await mainPage.clickCreatedBoardTitleOnCanvas();
        await mainPage.pressCopyShortcut(browserName);
      });

      await mainTest.step('Paste component on page 2', async () => {
        await mainPage.clickAddPageButton();
        await mainPage.clickOnPageOnLayersPanel(2);
        await mainPage.clickMoveButton();
        await mainPage.pressPasteShortcut(browserName);
        await mainPage.waitForChangeIsUnsaved();
        await mainPage.waitForChangeIsSaved();
      });

      await mainTest.step(
        'Verify component is on page 2 and layers panel',
        async () => {
          await mainPage.isPageNameSelected('Page 1', false);
          await mainPage.isPageNameSelected('Page 2', true);
          await layersPanelPage.isCopyComponentOnLayersTabVisibleWithName('Board');
          await expect(
            mainPage.viewport,
            'Viewport should match screenshot with component on page 2',
          ).toHaveScreenshot('board-component-on-page2.png', {
            mask: mainPage.maskViewport(),
          });
        },
      );
    },
  );

  mainTest(qase([1730], 'Restore main component'), async ({ browserName }) => {
    await mainTest.step('Create component, duplicate and delete main', async () => {
      await mainPage.createComponentViaRightClick();
      await mainPage.waitForChangeIsSaved();
      await mainPage.duplicateLayerViaRightClick();
      await mainPage.waitForChangeIsSaved();
      await layersPanelPage.clickMainComponentOnLayersTab();
      await layersPanelPage.deleteMainComponentViaRightClick();
      await mainPage.waitForChangeIsSaved();
    });

    await mainTest.step(
      'Restore main component from copy via right-click',
      async () => {
        await layersPanelPage.clickCopyComponentOnLayersTab();
        await layersPanelPage.restoreMainComponentViaRightClick();
        await mainPage.waitForChangeIsSaved();
        await layersPanelPage.waitForMainComponentIsSelected();
      },
    );

    await mainTest.step('Verify restored main component on canvas', async () => {
      await expect(
        mainPage.viewport,
        'Viewport should match screenshot with restored main component',
      ).toHaveScreenshot('board-component-with-grid-layout-main-restore.png', {
        mask: mainPage.maskViewport(),
      });
    });
  });

  mainTest(
    qase([1731], 'Undo component editing and deleting'),
    async ({ browserName }) => {
      await mainTest.step('Create component and change fill color', async () => {
        await mainPage.createComponentViaRightClick();
        await mainPage.waitForChangeIsSaved();
        await designPanelPage.clickFillColorIcon();
        await colorPalettePage.setHex('#0000FF');
        await mainPage.waitForChangeIsSaved();
        await mainPage.waitForResizeHandlerVisible();
      });

      await mainTest.step('Verify component with blue fill color', async () => {
        await expect(
          mainPage.viewport,
          'Viewport should match screenshot with blue fill color on component',
        ).toHaveScreenshot('board-component-blue-color.png', {
          mask: mainPage.maskViewport(),
        });
      });

      await mainTest.step('Undo fill color change', async () => {
        await mainPage.clickViewportOnce();
        await mainPage.clickShortcutCtrlZ(browserName);
      });

      await mainTest.step('Verify component after undoing fill color', async () => {
        await expect(
          mainPage.viewport,
          'Viewport should match screenshot after undoing fill color change',
        ).toHaveScreenshot('board-component-undo-color.png', {
          mask: mainPage.maskViewport(),
        });
      });

      await mainTest.step('Delete component and undo deletion', async () => {
        await layersPanelPage.deleteMainComponentViaRightClick();
        await mainPage.isCreatedLayerVisible(false);
        await mainPage.clickShortcutCtrlZ(browserName);
        await mainPage.waitForChangeIsSaved();
      });

      await mainTest.step(
        'Verify component is restored after undoing deletion',
        async () => {
          await expect(
            mainPage.viewport,
            'Viewport should match screenshot with component restored after undo',
          ).toHaveScreenshot('board-component-restored.png', {
            mask: mainPage.maskViewport(),
          });
        },
      );
    },
  );

  mainTest(
    qase([1732, 1733], '[Grid layout] Use shared component in another file'),
    async () => {
      await mainTest.step(
        'Create component and add file as shared library',
        async () => {
          await mainPage.createComponentViaRightClick();
          await mainPage.waitForChangeIsSaved();
          await mainPage.clickPencilBoxButton();
          await dashboardPage.addFileAsSharedLibraryViaRightclick();
          await dashboardPage.isSharedLibraryIconDisplayed();
        },
      );

      await mainTest.step('Create new file and import shared library', async () => {
        await dashboardPage.createFileViaTitlePanel();
        await assetsPanelPage.clickAssetsTab();
        await assetsPanelPage.clickLibrariesButton();
        await assetsPanelPage.isSharedLibraryVisibleByName('New File 1');
        await assetsPanelPage.clickSharedLibraryImportButton('New File 1');
        await assetsPanelPage.clickCloseModalButton();
        await dashboardPage.reloadPage();
      });

      await mainTest.step(
        'Drag component from shared library to canvas',
        async () => {
          await assetsPanelPage.clickAssetsTab();
          await mainPage.clickMoveButton();
          await assetsPanelPage.clickLibraryTitleWithName('New File 1');
          await assetsPanelPage.clickLibraryComponentsTitle();
          await assetsPanelPage.dragAndDropComponentToViewport('Board');
          await mainPage.waitForChangeIsSaved();
        },
      );

      await mainTest.step(
        'Verify component from shared library on canvas',
        async () => {
          await expect(
            mainPage.viewport,
            'Viewport should match screenshot with component from shared library file',
          ).toHaveScreenshot('board-from-library-file.png', {
            mask: mainPage.maskViewport(),
          });
        },
      );
    },
  );
});

mainTest.describe(() => {
  mainTest.beforeEach(async () => {
    await mainTest.slow();
    await mainPage.createDefaultBoardByCoordinates(400, 400);
    await designPanelPage.changeHeightAndWidthForLayer('300', '300');
    await mainPage.waitForChangeIsSaved();
    await mainPage.addGridLayoutViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await designPanelPage.isLayoutRemoveButtonExists();
    await mainPage.clickViewportOnce();
    await mainPage.createDefaultRectangleByCoordinates(180, 200, true);
    await mainPage.waitForChangeIsUnsaved();
    await mainPage.waitForChangeIsSaved();
    await layersPanelPage.dragAndDropComponentToBoard('Rectangle');
    await mainPage.waitForChangeIsUnsaved();
    await mainPage.waitForChangeIsSaved();
    await mainPage.duplicateLayerViaLayersTab('Rectangle');
    await mainPage.clickViewportOnce();
    await mainPage.clickCreatedBoardTitleOnCanvas();
    await mainPage.createComponentViaRightClick();
    await mainPage.waitForChangeIsSaved();
  });

  mainTest(
    qase([1718], 'Copy-paste component, that was created from grid board'),
    async ({ browserName }) => {
      await mainTest.step('Copy and paste component from grid board', async () => {
        await mainPage.clickViewportOnce();
        await mainPage.clickCreatedBoardTitleOnCanvas();
        await mainPage.copyLayerViaRightClick();
        await mainPage.pressPasteShortcut(browserName);
        await mainPage.waitForChangeIsSaved();
      });

      await mainTest.step(
        'Verify copy-pasted component on canvas and layers panel',
        async () => {
          await expect(
            mainPage.viewport,
            'Viewport should match screenshot after copy-pasting grid board component',
          ).toHaveScreenshot('board-component-with-grid-layout-copy-paste.png', {
            mask: mainPage.maskViewport(),
          });
          await expect(
            layersPanelPage.layersSidebar,
            'Layers sidebar should match screenshot after copy-paste',
          ).toHaveScreenshot('copy-paste-layer.png', {
            mask: mainPage.maskViewport(),
          });
        },
      );
    },
  );

  mainTest(
    qase([1719], 'Create a component from grid board with some element inside'),
    async () => {
      await mainTest.step(
        'Verify component with element inside grid board on canvas',
        async () => {
          await expect(
            mainPage.viewport,
            'Viewport should match screenshot with component created from grid board with rectangle',
          ).toHaveScreenshot('board-component-with-grid-layout-with-rectangle.png', {
            mask: mainPage.maskViewport(),
          });
        },
      );
    },
  );

  mainTest(
    qase([1728], 'Duplicate component, that was created from grid board'),
    async ({ browserName }) => {
      await mainTest.step('Duplicate component via shortcut', async () => {
        await mainPage.clickShortcutCtrlD(browserName);
      });

      await mainTest.step(
        'Verify duplicated component on canvas and layers panel',
        async () => {
          await expect(
            mainPage.viewport,
            'Viewport should match screenshot after duplicating grid board component',
          ).toHaveScreenshot('board-component-with-grid-layout-duplicated.png', {
            mask: mainPage.maskViewport(),
          });
          await layersPanelPage.isMainComponentOnLayersTabVisibleWithName('Board');
          await layersPanelPage.isCopyComponentOnLayersTabVisibleWithName('Board');
        },
      );
    },
  );
});

mainTest.describe(() => {
  mainTest.beforeEach(async ({ browserName }) => {
    await mainTest.slow();
    await mainPage.createDefaultBoardByCoordinates(100, 100);
    await designPanelPage.changeHeightAndWidthForLayer('200', '200');
    await mainPage.waitForChangeIsSaved();
    await mainPage.addGridLayoutViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await designPanelPage.isLayoutRemoveButtonExists();
    await mainPage.clickViewportOnce();
    await mainPage.clickCreatedBoardTitleOnCanvas();
    await mainPage.createComponentViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await mainPage.clickShortcutCtrlD(browserName);
    await designPanelPage.changeAxisXAndYForLayer('500', '100');
  });

  mainTest(
    qase([1720], 'Change the copy component and click "Update main component"'),
    async () => {
      await mainTest.step('Resize copy component and update main', async () => {
        await designPanelPage.changeHeightAndWidthForLayer('25', '25');
        await layersPanelPage.updateMainComponentViaRightClick();
        await mainPage.waitForChangeIsUnsaved();
        await mainPage.waitForChangeIsSaved();
      });

      await mainTest.step('Verify updated main component on canvas', async () => {
        await expect(
          mainPage.viewport,
          'Viewport should match screenshot after updating main component from copy',
        ).toHaveScreenshot('board-component-with-grid-layout-main-updated.png', {
          mask: mainPage.maskViewport(),
        });
      });
    },
  );

  mainTest(
    qase([1721], 'Change the copy component and click "Show main component"'),
    async () => {
      await mainTest.step(
        'Change copy fill color and show main component',
        async () => {
          await designPanelPage.clickFillColorIcon();
          await colorPalettePage.setHex('#000000');
          await mainPage.waitForChangeIsSaved();
          await mainPage.showMainComponentViaRightClick();
          await mainPage.waitForChangeIsSaved();
        },
      );

      await mainTest.step('Verify main component is shown on canvas', async () => {
        await expect(
          mainPage.viewport,
          'Viewport should match screenshot after showing main component',
        ).toHaveScreenshot('board-component-with-grid-layout-main-show.png', {
          mask: mainPage.maskViewport(),
        });
      });
    },
  );

  mainTest(
    qase([1722], 'Change the copy component and click "Reset overrides"'),
    async () => {
      await mainTest.step('Change copy fill color and reset overrides', async () => {
        await designPanelPage.clickFillColorIcon();
        await colorPalettePage.setHex('#000000');
        await mainPage.waitForChangeIsSaved();
        await mainPage.resetOverridesViaRightClick();
        await mainPage.waitForChangeIsSaved();
      });

      await mainTest.step('Verify overrides are reset on canvas', async () => {
        await expect(
          mainPage.viewport,
          'Viewport should match screenshot after resetting copy component overrides',
        ).toHaveScreenshot('board-component-with-grid-layout-reset-overrides.png', {
          mask: mainPage.maskViewport(),
        });
      });
    },
  );

  mainTest(
    qase([1723], 'Change the copy component and click "Detach instance"'),
    async () => {
      await mainTest.step('Resize copy component and detach instance', async () => {
        await designPanelPage.changeHeightAndWidthForLayer('25', '25');
        await mainPage.waitForChangeIsSaved();
        await layersPanelPage.detachInstanceCopyComponentViaRightClick();
        await mainPage.waitForChangeIsUnsaved();
        await mainPage.waitForChangeIsSaved();
      });

      await mainTest.step(
        'Verify detached instance on canvas and layers panel',
        async () => {
          await expect(
            mainPage.viewport,
            'Viewport should match screenshot after detaching component instance',
          ).toHaveScreenshot(
            'board-component-with-grid-layout-detach-instance.png',
            {
              mask: mainPage.maskViewport(),
            },
          );
          await expect(
            layersPanelPage.layersSidebar,
            'Layers sidebar should match screenshot after detaching instance',
          ).toHaveScreenshot('detach-instance-layer.png');
        },
      );
    },
  );
});

mainTest.describe(() => {
  mainTest.beforeEach(async () => {
    await mainTest.slow();
    await mainPage.createDefaultBoardByCoordinates(400, 400);
    await designPanelPage.changeHeightAndWidthForLayer('300', '400');
    await mainPage.waitForChangeIsSaved();
    await mainPage.addGridLayoutViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await designPanelPage.isLayoutRemoveButtonExists();
    await mainPage.clickViewportOnce();
    await mainPage.clickCreatedBoardTitleOnCanvas();
    await mainPage.createComponentViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await designPanelPage.createAnnotationRightClick();
    await designPanelPage.addAnnotationForComponent(annotation);
    await designPanelPage.waitForChangeIsUnsaved();
    await designPanelPage.waitForChangeIsSaved();
  });

  mainTest(
    qase(
      [1725, 1752],
      'Create annotation for component, that already has annotation',
    ),
    async () => {
      await mainTest.step(
        `Verify annotation "${annotation}" is added to component`,
        async () => {
          await designPanelPage.isAnnotationAddedToComponent(annotation);
          await mainPage.waitForChangeIsSaved();
        },
      );

      await mainTest.step(
        'Verify annotation option is not available in right-click menu or component menu',
        async () => {
          await designPanelPage.isAnnotationOptionNotVisibleRightClick();
          await designPanelPage.clickOnComponentMenuButton();
          await designPanelPage.isAnnotationOptionNotVisible();
        },
      );
    },
  );

  mainTest(qase([1726], 'Edit annotation for component'), async () => {
    await mainTest.step(
      `Edit annotation from "${annotation}" to "Edit annotation"`,
      async () => {
        await designPanelPage.clickOnEditAnnotation();
        await designPanelPage.editAnnotationForComponent('Edit annotation');
        await designPanelPage.waitForChangeIsSaved();
      },
    );

    await mainTest.step('Verify edited annotation is displayed', async () => {
      await designPanelPage.isAnnotationAddedToComponent('Edit annotation');
    });
  });

  mainTest(qase([1727], 'Delete annotation for component'), async () => {
    await mainTest.step(
      `Delete annotation "${annotation}" from component`,
      async () => {
        await designPanelPage.clickOnDeleteAnnotation();
        await designPanelPage.confirmDeleteAnnotation();
        await designPanelPage.waitForChangeIsSaved();
      },
    );

    await mainTest.step('Verify annotation is removed from component', async () => {
      await designPanelPage.isAnnotationNotAddedToComponent();
    });
  });
});
