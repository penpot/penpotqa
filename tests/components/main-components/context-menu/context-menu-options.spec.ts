import { BasePage } from '@pages/base-page';
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

let assetsPanelPage: AssetsPanelPage;
let basePage: BasePage;
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
  basePage = new BasePage(page);
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

mainTest.describe(() => {
  mainTest.beforeEach(async () => {
    await mainTest.slow();
    await mainPage.createDefaultRectangleByCoordinates(400, 500);
    await mainPage.createComponentViaRightClick();
    await mainPage.waitForChangeIsSaved();
  });

  mainTest(qase([1452], 'Show in assets panel option from Design tab'), async () => {
    await mainTest.step(
      'Show component in Assets Panel from design tab',
      async () => {
        await designPanelPage.clickOnComponentMenuButton();
        await designPanelPage.clickOnShowInAssetsPanel();
        await mainPage.waitForChangeIsSaved();
      },
    );

    await mainTest.step(
      'Verify component is highlighted in assets tab',
      async () => {
        await assetsPanelPage.isComponentHighlightedInAssetsTab();
      },
    );
  });

  mainTest(
    qase([1536], 'Show in assets panel option from component context menu (RMB)'),
    async () => {
      await mainTest.step(
        'Show component in Assets Panel via right-click',
        async () => {
          await mainPage.showInAssetsPanelRightClick();
          await mainPage.waitForChangeIsSaved();
        },
      );

      await mainTest.step(
        'Verify component is highlighted in assets tab',
        async () => {
          await assetsPanelPage.isComponentHighlightedInAssetsTab();
        },
      );
    },
  );

  mainTest(qase([1454], 'Duplicate main component'), async () => {
    await mainTest.step('Duplicate component from assets tab', async () => {
      await assetsPanelPage.clickAssetsTab();
      await assetsPanelPage.expandComponentsBlockOnAssetsTab();
      await assetsPanelPage.duplicateFileLibraryComponent();
      await mainPage.waitForChangeIsSaved();
    });

    await mainTest.step(
      'Verify duplicated component in assets tab and canvas',
      async () => {
        await assetsPanelPage.isSecondComponentVisibleInAssetsTab('Rectangle');
        await layersPanelPage.openLayersTab();
        await expect(
          mainPage.viewport,
          'Viewport should match screenshot with duplicated rectangle component',
        ).toHaveScreenshot('component-rectangle-duplicated-canvas.png', {
          mask: mainPage.maskViewport(),
        });
      },
    );
  });

  mainTest(qase([1455], 'Check Show main component option'), async () => {
    await mainTest.step('Show main component from assets tab', async () => {
      await assetsPanelPage.clickAssetsTab();
      await assetsPanelPage.expandComponentsBlockOnAssetsTab();
      await assetsPanelPage.showFileLibraryMainComponent();
    });

    await mainTest.step('Verify main component is shown on canvas', async () => {
      await expect(
        mainPage.viewport,
        'Viewport should match screenshot after showing main component from assets panel',
      ).toHaveScreenshot('component-show-main.png', {
        mask: mainPage.maskViewport(),
      });
    });
  });

  mainTest(qase([1285], 'Components - rename group'), async () => {
    const initialGroupName = 'Test Group';
    const renamedGroupName = 'New Group';

    await mainTest.step(
      `Create group "${initialGroupName}" in assets tab`,
      async () => {
        await assetsPanelPage.clickAssetsTab();
        await assetsPanelPage.expandComponentsBlockOnAssetsTab();
        await assetsPanelPage.createGroupFileLibraryAssets(
          'Components',
          initialGroupName,
        );
        await mainPage.waitForChangeIsSaved();
      },
    );

    await mainTest.step(`Rename group to "${renamedGroupName}"`, async () => {
      await assetsPanelPage.renameGroupFileLibrary(renamedGroupName);
      await mainPage.waitForChangeIsSaved();
    });

    await mainTest.step(
      `Verify group is renamed to "${renamedGroupName}"`,
      async () => {
        await assetsPanelPage.isFileLibraryGroupCreated(renamedGroupName);
      },
    );
  });

  mainTest(qase([1286], 'Components - ungroup'), async () => {
    const groupName = 'Test Group';

    await mainTest.step(`Create group "${groupName}" and ungroup it`, async () => {
      await assetsPanelPage.clickAssetsTab();
      await assetsPanelPage.expandComponentsBlockOnAssetsTab();
      await assetsPanelPage.createGroupFileLibraryAssets('Components', groupName);
      await mainPage.waitForChangeIsSaved();
      await assetsPanelPage.ungroupFileLibrary();
      await mainPage.waitForChangeIsSaved();
    });

    await mainTest.step(
      'Verify group is removed and component is visible',
      async () => {
        await assetsPanelPage.isFileLibraryGroupRemoved();
        await assetsPanelPage.isComponentVisibleInAssetsTab('Rectangle');
      },
    );
  });

  mainTest(qase([1676], 'Components - change view (list/tile)'), async () => {
    await mainTest.step('Create 3 components on canvas', async () => {
      await mainPage.createDefaultEllipseByCoordinates(100, 200, true);
      await mainPage.createComponentViaRightClick();
      await mainPage.waitForChangeIsSaved();
      await mainPage.uploadImage('images/sample.jpeg');
      await mainPage.waitForChangeIsSaved();
      await mainPage.clickViewportTwice();
      await mainPage.waitForChangeIsSaved();
      await mainPage.createComponentViaRightClick();
      await mainPage.waitForChangeIsSaved();
      await assetsPanelPage.clickAssetsTab();
      await assetsPanelPage.expandComponentsBlockOnAssetsTab();
    });

    await mainTest.step('Verify default grid view', async () => {
      await expect(
        assetsPanelPage.assetsPanel,
        'Assets panel should match screenshot in grid view',
      ).toHaveScreenshot('component-grid-view.png', {
        mask: [assetsPanelPage.librariesOpenModalButton],
        maxDiffPixelRatio: 0.01,
      });
    });

    await mainTest.step('Switch to list view and verify', async () => {
      await assetsPanelPage.clickFileLibraryListViewButton();
      await mainPage.waitForChangeIsSaved();
      await expect(
        assetsPanelPage.assetsPanel,
        'Assets panel should match screenshot in list view',
      ).toHaveScreenshot('component-list-view.png', {
        mask: [assetsPanelPage.librariesOpenModalButton],
        maxDiffPixelRatio: 0.01,
      });
    });

    await mainTest.step('Switch back to grid view and verify', async () => {
      await assetsPanelPage.clickFileLibraryGridViewButton();
      await mainPage.waitForChangeIsSaved();
      await expect(
        assetsPanelPage.assetsPanel,
        'Assets panel should match screenshot in grid view after switching back',
      ).toHaveScreenshot('component-grid-view.png', {
        mask: [assetsPanelPage.librariesOpenModalButton],
        maxDiffPixelRatio: 0.01,
      });
    });
  });

  mainTest(
    qase([1399], 'Impossible to create annotation for copy component'),
    async () => {
      await mainTest.step('Duplicate component and select copy', async () => {
        await mainPage.duplicateLayerViaRightClick();
        await mainPage.waitForChangeIsSaved();
        await layersPanelPage.clickCopyComponentOnLayersTab();
        await designPanelPage.changeAxisXAndYForLayer('200', '0');
        await mainPage.waitForChangeIsSaved();
      });

      await mainTest.step(
        'Verify annotation option is not available for copy component',
        async () => {
          await designPanelPage.isAnnotationOptionNotVisibleRightClick();
          await designPanelPage.isComponentTypeCopy();
          await designPanelPage.isAnnotationNotAddedToComponent();
          await layersPanelPage.clickCopyComponentOnLayersTab();
          await designPanelPage.clickOnComponentMenuButton();
          await designPanelPage.isAnnotationOptionNotVisible();
          await designPanelPage.isComponentTypeCopy();
          await designPanelPage.isAnnotationNotAddedToComponent();
        },
      );
    },
  );
});

mainTest(
  qase([1274], 'Check created component (group of shapes) on Assets tab'),
  async () => {
    await mainTest.step(
      'Create two ellipses, select all and create components',
      async () => {
        await mainPage.createDefaultEllipseByCoordinates(200, 300);
        await mainPage.createDefaultEllipseByCoordinates(400, 600);
        await mainPage.clickMainMenuButton();
        await mainPage.clickEditMainMenuItem();
        await mainPage.clickSelectAllMainMenuSubItem();
        await mainPage.createComponentsMultipleShapesRightClick();
        await mainPage.waitForChangeIsSaved();
      },
    );

    await mainTest.step('Verify component on canvas and assets tab', async () => {
      await expect(
        mainPage.viewport,
        'Viewport should match screenshot with complex ellipse component on canvas',
      ).toHaveScreenshot('ellipse-complex-component-canvas.png', {
        mask: mainPage.maskViewport(),
      });
      await layersPanelPage.isMainComponentOnLayersTabVisibleWithName('Component 1');
      await assetsPanelPage.clickAssetsTab();
      await assetsPanelPage.expandComponentsBlockOnAssetsTab();
      await assetsPanelPage.isComponentAddedToFileLibraryComponents();
      await expect(
        assetsPanelPage.assetsPanel,
        'Assets panel should match screenshot with complex ellipse component',
      ).toHaveScreenshot('ellipse-complex-component-asset.png', {
        mask: [assetsPanelPage.librariesOpenModalButton],
      });
    });
  },
);

mainTest(
  qase([1621], 'Create a group with component and check its name'),
  async () => {
    const groupName = 'Test Group';

    await mainTest.step(
      'Create board component and create group in assets tab',
      async () => {
        await mainPage.createDefaultBoardByCoordinates(200, 300);
        await mainPage.createComponentViaRightClick();
        await mainPage.waitForChangeIsSaved();
        await assetsPanelPage.clickAssetsTab();
        await assetsPanelPage.expandComponentsBlockOnAssetsTab();
        await assetsPanelPage.createGroupFileLibraryAssets('Components', groupName);
      },
    );

    await mainTest.step(
      `Verify group "${groupName}" is displayed in layers panel and canvas`,
      async () => {
        await assetsPanelPage.isFileLibraryGroupCreated(groupName);
        await layersPanelPage.openLayersTab();
        await layersPanelPage.isLayerNameDisplayed(groupName + ' / Board');
        await expect(
          mainPage.viewport,
          'Viewport should match screenshot with component group on canvas',
        ).toHaveScreenshot('component-group-canvas.png', {
          mask: mainPage.maskViewport(),
        });
      },
    );
  },
);

mainTest(qase([1453], 'Rename component with valid name'), async () => {
  const newName = 'Renamed ellipse name';

  await mainTest.step(
    `Create ellipse component and rename to "${newName}"`,
    async () => {
      await mainPage.createDefaultEllipseByCoordinates(400, 600);
      await mainPage.createComponentViaRightClick();
      await mainPage.waitForChangeIsSaved();
      await assetsPanelPage.clickAssetsTab();
      await assetsPanelPage.expandComponentsBlockOnAssetsTab();
      await assetsPanelPage.renameFileLibraryComponent(newName);
      await mainPage.waitForChangeIsSaved();
    },
  );

  await mainTest.step(`Verify component is renamed to "${newName}"`, async () => {
    await layersPanelPage.openLayersTab();
    await expect(
      mainPage.viewport,
      'Viewport should match screenshot with renamed component on canvas',
    ).toHaveScreenshot('component-new-name-canvas.png', {
      mask: mainPage.maskViewport(),
    });
    await layersPanelPage.isLayerNameDisplayed(newName);
    await expect(
      layersPanelPage.layersSidebar,
      'Layers sidebar should match screenshot with renamed component',
    ).toHaveScreenshot('component-new-name-layer.png');
  });
});

mainTest(qase([966], 'Filter Components from All Assets drop-down'), async () => {
  await mainTest.step('Filter assets by Components type', async () => {
    await assetsPanelPage.clickAssetsTab();
    await assetsPanelPage.selectTypeFromAllAssetsDropdown('Components');
  });

  await mainTest.step(
    'Verify Components section is displayed with 0 items',
    async () => {
      await assetsPanelPage.isAssetsSectionNameDisplayed('Components', '0');
    },
  );
});

mainTest.describe(() => {
  mainTest.beforeEach(async () => {
    await mainTest.slow();
    await mainPage.createDefaultEllipseByCoordinates(200, 300);
    await mainPage.createComponentViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await mainPage.duplicateLayerViaRightClick();
    await mainPage.waitForChangeIsSaved();
    await layersPanelPage.clickCopyComponentOnLayersTab();
    await designPanelPage.changeAxisXAndYForLayer('400', '300');
  });

  mainTest(qase([1411], 'Click Show main component on copy'), async () => {
    await mainTest.step(
      'Select copy and show main component via right-click',
      async () => {
        await layersPanelPage.clickCopyComponentOnLayersTab();
        await basePage.showMainComponentViaRightClick();
        await mainPage.waitForChangeIsSaved();
      },
    );

    await mainTest.step('Verify main component is shown on canvas', async () => {
      await expect(
        mainPage.viewport,
        'Viewport should match screenshot after showing main component from copy',
      ).toHaveScreenshot('main-copies-component-show-main.png', {
        mask: mainPage.maskViewport(),
      });
    });
  });

  mainTest(qase([1412], 'Change copy and click Reset overrides'), async () => {
    await mainTest.step('Resize copy component and reset overrides', async () => {
      await layersPanelPage.clickCopyComponentOnLayersTab();
      await designPanelPage.changeHeightAndWidthForLayer('100', '150');
      await basePage.resetOverridesViaRightClick();
      await mainPage.waitForChangeIsSaved();
    });

    await mainTest.step('Verify overrides are reset on canvas', async () => {
      await expect(
        mainPage.viewport,
        'Viewport should match screenshot after resetting copy component overrides',
      ).toHaveScreenshot('main-copies-component-reset-overrides.png', {
        mask: mainPage.maskViewport(),
      });
    });
  });

  mainTest(qase([1300], 'Restore main component via context menu'), async () => {
    await mainTest.step('Delete main component and restore from copy', async () => {
      await layersPanelPage.clickMainComponentOnLayersTab();
      await layersPanelPage.deleteMainComponentViaRightClick();
      await mainPage.waitForChangeIsSaved();
      await layersPanelPage.clickCopyComponentOnLayersTab();
      await layersPanelPage.restoreMainComponentViaRightClick();
      await mainPage.waitForChangeIsSaved();
      await layersPanelPage.waitForMainComponentIsSelected();
    });

    await mainTest.step('Verify restored main component on canvas', async () => {
      await expect(
        mainPage.viewport,
        'Viewport should match screenshot with restored main component',
      ).toHaveScreenshot('main-component-restore-main.png', {
        mask: mainPage.maskViewport(),
      });
    });
  });

  mainTest(qase([1296], 'Detach instance from context menu'), async () => {
    await mainTest.step(
      'Detach copy instance via right-click and resize',
      async () => {
        await layersPanelPage.clickCopyComponentOnLayersTab();
        await layersPanelPage.detachInstanceCopyComponentViaRightClick();
        await designPanelPage.changeHeightAndWidthForLayer('300', '300');
        await designPanelPage.changeAxisXAndYForLayer('400', '300');
        await mainPage.waitForChangeIsSaved();
        await mainPage.waitForResizeHandlerVisible();
      },
    );

    await mainTest.step('Verify detached instance on canvas', async () => {
      await expect(
        mainPage.viewport,
        'Viewport should match screenshot after detaching copy instance via right-click',
      ).toHaveScreenshot('main-copies-component-detach-instance-right-click.png', {
        mask: mainPage.maskViewport(),
      });
    });
  });

  mainTest(qase([1297], 'Detach instance from "Design" tab'), async () => {
    await mainTest.step(
      'Detach copy instance from Design tab and resize',
      async () => {
        await designPanelPage.clickOnComponentMenuButton();
        await designPanelPage.clickOnDetachInstanceOption();
        await mainPage.waitForChangeIsSaved();
        await designPanelPage.changeHeightAndWidthForLayer('300', '300');
        await mainPage.waitForResizeHandlerVisible();
      },
    );

    await mainTest.step('Verify detached instance on canvas', async () => {
      await expect(
        mainPage.viewport,
        'Viewport should match screenshot after detaching copy instance from Design tab',
      ).toHaveScreenshot('main-copies-component-detach-instance-right-click.png', {
        mask: mainPage.maskViewport(),
      });
    });
  });

  mainTest(qase([1298], 'Reset overrides via context menu'), async () => {
    await mainTest.step('Resize, add fill and blur to copy component', async () => {
      await layersPanelPage.clickCopyComponentOnLayersTab();
      await designPanelPage.changeHeightAndWidthForLayer('100', '150');
      await designPanelPage.clickAddFillButton();
      await mainPage.waitForChangeIsSaved();
      await designPanelPage.clickFillColorIcon();
      await colorPalettePage.setHex('#460EA2');
      await layersPanelPage.clickCopyComponentOnLayersTab();
      await mainPage.waitForChangeIsSaved();
      await designPanelPage.isFillHexCodeSet('#460EA2');

      await layersPanelPage.clickCopyComponentOnLayersTab();
      await designPanelPage.clickAddBlurButton();
      await designPanelPage.changeValueForBlur('2');
      await mainPage.waitForChangeIsSaved();
    });

    await mainTest.step(
      'Reset overrides on copy component via right-click',
      async () => {
        await layersPanelPage.clickCopyComponentOnLayersTab();
        await basePage.resetOverridesViaRightClick();
        await mainPage.waitForChangeIsSaved();
      },
    );

    await mainTest.step('Verify overrides are reset on canvas', async () => {
      await expect(
        mainPage.viewport,
        'Viewport should match screenshot after resetting all overrides on copy component',
      ).toHaveScreenshot('main-copies-component-reset-overrides.png', {
        mask: mainPage.maskViewport(),
      });
    });
  });
});
