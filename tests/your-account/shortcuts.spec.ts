import { qase } from 'playwright-qase-reporter/playwright';
import { type ShortcutRef } from '@pages/shortcuts-page';
import { shortcutsTest } from './your-account-fixture';

const cut: ShortcutRef = { context: 'workspace', subsection: 'Edit', action: 'Cut' };
// "Copy" itself is not customizable, so "Copy properties" is the one disabled.
const copyProperties: ShortcutRef = {
  context: 'workspace',
  subsection: 'Edit',
  action: 'Copy properties',
};
const workspaceZoomIn: ShortcutRef = {
  context: 'workspace',
  subsection: 'Zoom',
  action: 'Zoom in',
};
const viewerZoomIn: ShortcutRef = {
  context: 'viewer',
  subsection: 'Zoom',
  action: 'Zoom in',
};
const zoomLenseIncrease: ShortcutRef = {
  context: 'workspace',
  subsection: 'Zoom',
  action: 'Zoom lense increase',
};

shortcutsTest(
  qase([3609], 'Search for a shortcut by action name'),
  async ({ shortcutsPage }) => {
    await shortcutsTest.step('Click the search field', async () => {
      await shortcutsPage.searchInput.click();
      await shortcutsPage.isSearchInputFocused();
    });

    await shortcutsTest.step(
      'Type a partial name ("Zoom") → only matching shortcuts are listed',
      async () => {
        await shortcutsPage.search('Zoom');
        await shortcutsPage.areAllListedShortcutsMatching('Zoom');
        await shortcutsPage.isShortcutListed(zoomLenseIncrease);
      },
    );

    await shortcutsTest.step(
      'Type a full action name ("Zoom in") → only that action is listed',
      async () => {
        await shortcutsPage.search('Zoom in');
        await shortcutsPage.areAllListedShortcutsMatching('Zoom in');
        await shortcutsPage.isShortcutListed(workspaceZoomIn);
        await shortcutsPage.isShortcutListed(viewerZoomIn);
        await shortcutsPage.isShortcutListed(zoomLenseIncrease, false);
      },
    );
  },
);

shortcutsTest(
  qase([3616], 'Resolve a shortcut conflict by displacing the existing binding'),
  async ({ shortcutsPage }) => {
    await shortcutsTest.step(
      'Press "z" (already used by "Zoom lense increase") for "Cut" → conflict message',
      async () => {
        await shortcutsPage.startEditingShortcut(cut);
        await shortcutsPage.pressShortcutKeys('z');
        await shortcutsPage.isConflictMessageVisible(cut, zoomLenseIncrease.action);
      },
    );

    await shortcutsTest.step('Save to keep the new binding', async () => {
      await shortcutsPage.saveShortcut(cut);
      await shortcutsPage.hasShortcutKeys(cut, ['z']);
    });

    await shortcutsTest.step(
      'Reopen the Shortcuts panel → "Cut" uses "z" and "Zoom lense increase" no longer does',
      async () => {
        await shortcutsPage.reload();
        await shortcutsPage.search(cut.action);
        await shortcutsPage.hasShortcutKeys(cut, ['z']);
        await shortcutsPage.search(zoomLenseIncrease.action);
        await shortcutsPage.hasNoShortcutKeys(zoomLenseIncrease);
      },
    );
  },
);

shortcutsTest(
  qase(
    [3661],
    'Two shortcuts can share the same key combination in different contexts',
  ),
  async ({ shortcutsPage }) => {
    await shortcutsTest.step('Assign "q" to Workspace > Edit > Cut', async () => {
      await shortcutsPage.assignShortcut(cut, 'q');
      await shortcutsPage.hasShortcutKeys(cut, ['q']);
    });

    await shortcutsTest.step(
      'Press "q" for Viewer > Zoom > Zoom in → no conflict warning, it can be saved',
      async () => {
        await shortcutsPage.startEditingShortcut(viewerZoomIn);
        await shortcutsPage.pressShortcutKeys('q');
        await shortcutsPage.isShortcutAvailableMessageVisible(viewerZoomIn);
        await shortcutsPage.saveShortcut(viewerZoomIn);
      },
    );

    await shortcutsTest.step(
      'Reopen the Shortcuts panel → both actions keep "q"',
      async () => {
        await shortcutsPage.reload();
        await shortcutsPage.search(cut.action);
        await shortcutsPage.hasShortcutKeys(cut, ['q']);
        await shortcutsPage.search(viewerZoomIn.action);
        await shortcutsPage.hasShortcutKeys(viewerZoomIn, ['q']);
      },
    );
  },
);

shortcutsTest(
  qase(
    [3647],
    'Applying an import updates shortcuts to the imported key combinations',
  ),
  async ({ shortcutsPage }, testInfo) => {
    const exportedFile = testInfo.outputPath('shortcuts.json');

    await shortcutsTest.step(
      'Setup: export a file with "Cut" set to "q", then reset all shortcuts to default',
      async () => {
        await shortcutsPage.assignShortcut(cut, 'q');
        await shortcutsPage.search('');
        const download = await shortcutsPage.exportShortcuts();
        await download.saveAs(exportedFile);
        await shortcutsPage.clickResetAll();
        await shortcutsPage.confirmResetAll();
      },
    );

    await shortcutsTest.step(
      'Import the file → the preview lists Action, Current and Imported keys',
      async () => {
        await shortcutsPage.importShortcuts(exportedFile);
        await shortcutsPage.isDialogRowVisible(shortcutsPage.importDialog, [
          'Action',
          'Current',
          'Imported',
        ]);
        await shortcutsPage.isDialogRowVisible(shortcutsPage.importDialog, [
          'Cut',
          'ctrl x',
          'q',
        ]);
      },
    );

    await shortcutsTest.step('Confirm the import → the dialog closes', async () => {
      await shortcutsPage.confirmImport();
    });

    await shortcutsTest.step(
      'Reopen the Shortcuts panel → "Cut" uses the imported "q"',
      async () => {
        await shortcutsPage.reload();
        await shortcutsPage.search(cut.action);
        await shortcutsPage.hasShortcutKeys(cut, ['q']);
      },
    );
  },
);

shortcutsTest(
  qase(
    [3654],
    'Restore All resets every personalized and disabled shortcut to its default',
  ),
  async ({ shortcutsPage }) => {
    await shortcutsTest.step(
      'Setup: reassign "Cut" to "q" and disable "Copy properties"',
      async () => {
        await shortcutsPage.assignShortcut(cut, 'q');
        await shortcutsPage.disableShortcut(copyProperties);
        await shortcutsPage.hasNoShortcutKeys(copyProperties);
        await shortcutsPage.reload();
        await shortcutsPage.openTab('Custom');
        await shortcutsPage.isShortcutListed(cut);
        await shortcutsPage.openTab('Disabled');
        await shortcutsPage.isShortcutListed(copyProperties);
        await shortcutsPage.openTab('All');
      },
    );

    await shortcutsTest.step(
      'Click "Reset all" → confirmation lists both shortcuts with their defaults',
      async () => {
        await shortcutsPage.clickResetAll();
        await shortcutsPage.isDialogRowVisible(shortcutsPage.resetAllDialog, [
          'Cut',
          'q',
          'ctrl x',
        ]);
        await shortcutsPage.isDialogRowVisible(shortcutsPage.resetAllDialog, [
          'Copy properties',
          '-',
          'ctrl alt c',
        ]);
      },
    );

    await shortcutsTest.step(
      'Confirm → both are back to their defaults',
      async () => {
        await shortcutsPage.confirmResetAll();
        await shortcutsPage.search(cut.action);
        await shortcutsPage.hasShortcutKeys(cut, ['ctrl', 'x']);
        await shortcutsPage.search(copyProperties.action);
        await shortcutsPage.hasShortcutKeys(copyProperties, ['ctrl', 'alt', 'c']);
        await shortcutsPage.search('');
      },
    );

    await shortcutsTest.step('The Custom and Disabled tabs are empty', async () => {
      await shortcutsPage.openTab('Custom');
      await shortcutsPage.isTabEmpty();
      await shortcutsPage.openTab('Disabled');
      await shortcutsPage.isTabEmpty();
    });
  },
);
