import { AssetsPanelPage } from '@pages/workspace/assets-panel-page';
import { expect } from '@playwright/test';
import { demoAccountFileTest } from 'fixtures';
import { qase } from 'playwright-qase-reporter/playwright';

let assetsPanelPage: AssetsPanelPage;

demoAccountFileTest.beforeEach(async ({ page }) => {
  assetsPanelPage = new AssetsPanelPage(page);
});

demoAccountFileTest(
  qase([947], 'Filter Typographies from All Assets drop-down'),
  async () => {
    await demoAccountFileTest.step(
      'Open assets tab and filter by Typographies',
      async () => {
        await assetsPanelPage.clickAssetsTab();
        await assetsPanelPage.selectTypeFromAllAssetsDropdown('Typographies');
      },
    );

    await demoAccountFileTest.step(
      'Verify Typographies section shows 0 items',
      async () => {
        await assetsPanelPage.isAssetsSectionNameDisplayed('Typographies', '0');
      },
    );
  },
);

demoAccountFileTest(
  qase([948], 'Typographic styles - add from Assets panel'),
  async ({ mainPage }) => {
    await demoAccountFileTest.step('Add typography from assets panel', async () => {
      await assetsPanelPage.clickAssetsTab();
      await assetsPanelPage.clickAddFileLibraryTypographyButton();
      await mainPage.waitForChangeIsSaved();
    });

    await demoAccountFileTest.step(
      'Verify typography added in expanded state',
      async () => {
        await expect(
          assetsPanelPage.assetsPanel,
          'Added typography should be visible in expanded state',
        ).toHaveScreenshot('typographies-add-typography-expanded.png', {
          maxDiffPixels: 10,
        });
      },
    );

    await demoAccountFileTest.step(
      'Minimize, expand and verify screenshots match',
      async () => {
        await assetsPanelPage.minimizeFileLibraryTypography();
        await mainPage.clickViewportTwice();
        await expect(
          assetsPanelPage.assetsPanel,
          'Minimized typography should match screenshot',
        ).toHaveScreenshot('typographies-add-typography-minimized.png');
        await assetsPanelPage.expandFileLibraryTypography();
        await mainPage.clickViewportTwice();
        await expect(
          assetsPanelPage.assetsPanel,
          'Expanded typography should match screenshot',
        ).toHaveScreenshot('typographies-add-typography-expanded.png');
      },
    );
  },
);

demoAccountFileTest.describe(() => {
  demoAccountFileTest.beforeEach(async ({ mainPage }) => {
    await assetsPanelPage.clickAssetsTab();
    await assetsPanelPage.clickAddFileLibraryTypographyButton();
    await mainPage.waitForChangeIsSaved();
    await assetsPanelPage.minimizeFileLibraryTypography();
  });

  demoAccountFileTest(
    qase([950], 'Edit Typography Asset After Applying to Element'),
    async ({ mainPage }) => {
      await demoAccountFileTest.step(
        'Create text layers and apply typography',
        async () => {
          await mainPage.createDefaultTextLayerByCoordinates(200, 200);
          await assetsPanelPage.clickFileLibraryTypographiesTypographyRecord();
          await mainPage.clickViewportTwice();
          await mainPage.createDefaultTextLayerByCoordinates(200, 400);
          await assetsPanelPage.clickFileLibraryTypographiesTypographyRecord();
          await mainPage.clickViewportTwice();
          await mainPage.waitForChangeIsSaved();
        },
      );

      await demoAccountFileTest.step(
        'Verify typography applied to text layers',
        async () => {
          await expect(
            mainPage.viewport,
            'Typography should be applied to text layers',
          ).toHaveScreenshot('apply-typography-to-text-from-assets.png', {
            mask: mainPage.maskViewport(),
          });
        },
      );

      await demoAccountFileTest.step('Edit typography font and size', async () => {
        await assetsPanelPage.editFileLibraryTypography();
        await assetsPanelPage.selectFont('Bellefair');
        await assetsPanelPage.selectFontSize('12');
        await mainPage.waitForChangeIsSaved();
        await mainPage.clickViewportTwice();
      });

      await demoAccountFileTest.step(
        'Verify edited typography screenshots',
        async () => {
          await expect(
            assetsPanelPage.assetsPanel,
            'Edited typography should match expanded screenshot',
          ).toHaveScreenshot('typographies-edit-typography-expanded.png');
          await assetsPanelPage.minimizeFileLibraryTypography();
          await mainPage.clickViewportTwice();
          await expect(
            assetsPanelPage.assetsPanel,
            'Edited typography should match minimized screenshot',
          ).toHaveScreenshot('typographies-edit-typography-minimized.png');
          await assetsPanelPage.expandFileLibraryTypography();
          await mainPage.clickViewportTwice();
          await expect(
            assetsPanelPage.assetsPanel,
            'Edited typography should match expanded screenshot',
          ).toHaveScreenshot('typographies-edit-typography-expanded.png');
          await expect(
            mainPage.viewport,
            'Edited typography should be reflected on text layers',
          ).toHaveScreenshot('edited-typography-to-text-from-assets.png', {
            mask: mainPage.maskViewport(),
          });
        },
      );
    },
  );

  demoAccountFileTest(
    qase([951], 'Typographic styles - rename'),
    async ({ mainPage }) => {
      await demoAccountFileTest.step('Rename typography and save', async () => {
        await assetsPanelPage.renameFileLibraryTypography('Test Font');
        await mainPage.waitForChangeIsSaved();
        await mainPage.clickViewportTwice();
      });

      await demoAccountFileTest.step(
        'Verify renamed typography screenshots',
        async () => {
          await expect(
            assetsPanelPage.assetsPanel,
            'Renamed typography should match minimized screenshot',
          ).toHaveScreenshot('typographies-rename-typography-minimized.png');
          await assetsPanelPage.expandFileLibraryTypography();
          await mainPage.waitForChangeIsSaved();
          await expect(
            assetsPanelPage.assetsPanel,
            'Renamed typography should match expanded screenshot',
          ).toHaveScreenshot('typographies-rename-typography-expanded.png');
        },
      );
    },
  );

  demoAccountFileTest(
    qase([952], 'Typographic styles - delete'),
    async ({ mainPage }) => {
      await demoAccountFileTest.step('Delete typography and save', async () => {
        await assetsPanelPage.deleteFileLibraryTypography();
        await mainPage.waitForChangeIsSaved();
      });

      await demoAccountFileTest.step('Verify typography is deleted', async () => {
        await expect(
          assetsPanelPage.assetsPanel,
          'Assets panel should show empty typographies',
        ).toHaveScreenshot('typographies-deleted-typography.png');
      });
    },
  );

  demoAccountFileTest(
    qase(
      [953, 2912, 2838],
      'Typographic styles - create group, add typography (+) and delete group',
    ),
    async ({ mainPage }) => {
      await demoAccountFileTest.step(
        '(953) Typographic styles - create group',
        async () => {
          await demoAccountFileTest.step('Create group for typography', async () => {
            await assetsPanelPage.createGroupFileLibraryAssets(
              'Typographies',
              'Test Group',
            );
            await mainPage.waitForChangeIsSaved();
          });

          await demoAccountFileTest.step(
            'Verify group is created and screenshot matches',
            async () => {
              await assetsPanelPage.isFileLibraryGroupCreated('Test Group');
              await expect(
                assetsPanelPage.assetsPanel,
                'Grouped typography should match screenshot',
              ).toHaveScreenshot('group-typographies.png');
            },
          );
        },
      );

      await demoAccountFileTest.step(
        '(2912) Add typography in a group via quick-create (+)',
        async () => {
          await demoAccountFileTest.step('Hover over the group name', async () => {
            await assetsPanelPage.hoverOnGroupFileLibrary();
          });

          await demoAccountFileTest.step('Add typography to the group', async () => {
            await assetsPanelPage.addTypographyToGroup();
            await assetsPanelPage.minimizeFileLibraryTypography();
          });

          await demoAccountFileTest.step(
            'Check the number of typographies in the group',
            async () => {
              const count: number = 2;
              await assetsPanelPage.checkTypographiesInGroupCount(count);
            },
          );
        },
      );

      await demoAccountFileTest.step(
        '(2838) Typographic styles - delete group',
        async () => {
          await demoAccountFileTest.step('Delete group', async () => {
            await assetsPanelPage.deleteGroupFileLibrary();
          });

          await demoAccountFileTest.step('Verify group is removed', async () => {
            await assetsPanelPage.isFileLibraryGroupRemoved();
          });
        },
      );
    },
  );

  demoAccountFileTest(
    qase([955], 'Typographic styles - rename group'),
    async ({ mainPage }) => {
      await demoAccountFileTest.step('Create and rename group', async () => {
        await assetsPanelPage.createGroupFileLibraryAssets(
          'Typographies',
          'Test Group',
        );
        await mainPage.waitForChangeIsSaved();
        await assetsPanelPage.renameGroupFileLibrary('New Group');
        await mainPage.waitForChangeIsSaved();
      });

      await demoAccountFileTest.step(
        'Verify renamed group and screenshot',
        async () => {
          await assetsPanelPage.isFileLibraryGroupCreated('New Group');
          await expect(
            assetsPanelPage.assetsPanel,
            'Renamed group typography should match screenshot',
          ).toHaveScreenshot('group-typographies-renamed.png');
        },
      );
    },
  );

  demoAccountFileTest(
    qase([958], 'Typographic styles - ungroup'),
    async ({ mainPage }) => {
      await demoAccountFileTest.step('Create group and ungroup', async () => {
        await assetsPanelPage.createGroupFileLibraryAssets(
          'Typographies',
          'Test Group',
        );
        await mainPage.waitForChangeIsSaved();
        await assetsPanelPage.ungroupFileLibrary();
        await mainPage.waitForChangeIsSaved();
      });

      await demoAccountFileTest.step('Verify group is removed', async () => {
        await assetsPanelPage.isFileLibraryGroupRemoved();
        await expect(
          assetsPanelPage.assetsPanel,
          'Assets panel should show ungrouped typography',
        ).toHaveScreenshot('typographies-add-typography-minimized.png');
      });
    },
  );

  demoAccountFileTest(
    qase([964], 'Typographic styles - apply style to text from Typographies panel'),
    async ({ mainPage }) => {
      await demoAccountFileTest.step('Edit typography font and size', async () => {
        await assetsPanelPage.editFileLibraryTypography();
        await assetsPanelPage.selectFont('Bad Script');
        await assetsPanelPage.selectFontSize('36');
        await mainPage.waitForChangeIsSaved();
        await assetsPanelPage.minimizeFileLibraryTypography();
      });

      await demoAccountFileTest.step(
        'Create text layer and apply typography from bottom panel',
        async () => {
          await mainPage.createDefaultTextLayer();
          await mainPage.pressOpenTypographiesBottomPanelShortcut();
          await mainPage.clickFontRecordOnTypographiesBottomPanel();
          await mainPage.waitForChangeIsSaved();
          await mainPage.clickViewportTwice();
        },
      );

      await demoAccountFileTest.step(
        'Verify typography applied to text',
        async () => {
          await expect(
            mainPage.viewport,
            'Typography should be applied to text layer',
          ).toHaveScreenshot('apply-typography-to-text.png', {
            mask: [
              mainPage.guides,
              mainPage.guidesFragment,
              mainPage.toolBarWindow,
              mainPage.typographiesColorsBottomPanel,
            ],
          });
        },
      );
    },
  );
});
