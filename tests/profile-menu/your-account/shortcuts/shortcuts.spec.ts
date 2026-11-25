import { type ShortcutRef } from '@pages/your-account/shortcuts-section-component';
import { shortcutsTest } from '@tests/profile-menu/your-account/your-account-fixture';
import { qase } from 'playwright-qase-reporter/playwright';

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
  async ({ yourAccountPage }) => {
    const { shortcuts } = yourAccountPage;
    await shortcutsTest.step('Click the search field', async () => {
      await shortcuts.searchInput.click();
      await shortcuts.isSearchInputFocused();
    });

    await shortcutsTest.step(
      'Type a partial name ("Zoom") → only matching shortcuts are listed',
      async () => {
        await shortcuts.search('Zoom');
        await shortcuts.areAllListedShortcutsMatching('Zoom');
        await shortcuts.isShortcutListed(zoomLenseIncrease);
      },
    );

    await shortcutsTest.step(
      'Type a full action name ("Zoom in") → only that action is listed',
      async () => {
        await shortcuts.search('Zoom in');
        await shortcuts.areAllListedShortcutsMatching('Zoom in');
        await shortcuts.isShortcutListed(workspaceZoomIn);
        await shortcuts.isShortcutListed(viewerZoomIn);
        await shortcuts.isShortcutListed(zoomLenseIncrease, false);
      },
    );
  },
);

shortcutsTest(
  qase([3616], 'Resolve a shortcut conflict by displacing the existing binding'),
  async ({ yourAccountPage }) => {
    const { shortcuts } = yourAccountPage;
    await shortcutsTest.step(
      'Press "z" (already used by "Zoom lense increase") for "Cut" → conflict message',
      async () => {
        await shortcuts.startEditingShortcut(cut);
        await shortcuts.pressShortcutKeys('z');
        await shortcuts.isConflictMessageVisible(cut, zoomLenseIncrease.action);
      },
    );

    await shortcutsTest.step('Save to keep the new binding', async () => {
      await shortcuts.saveShortcut(cut);
      await shortcuts.hasShortcutKeys(cut, ['z']);
    });

    await shortcutsTest.step(
      'Reopen the Shortcuts panel → "Cut" uses "z" and "Zoom lense increase" no longer does',
      async () => {
        await shortcuts.reload();
        await shortcuts.search(cut.action);
        await shortcuts.hasShortcutKeys(cut, ['z']);
        await shortcuts.search(zoomLenseIncrease.action);
        await shortcuts.hasNoShortcutKeys(zoomLenseIncrease);
      },
    );
  },
);

shortcutsTest(
  qase(
    [3661],
    'Two shortcuts can share the same key combination in different contexts',
  ),
  async ({ yourAccountPage }) => {
    const { shortcuts } = yourAccountPage;
    await shortcutsTest.step('Assign "q" to Workspace > Edit > Cut', async () => {
      await shortcuts.assignShortcut(cut, 'q');
      await shortcuts.hasShortcutKeys(cut, ['q']);
    });

    await shortcutsTest.step(
      'Press "q" for Viewer > Zoom > Zoom in → no conflict warning, it can be saved',
      async () => {
        await shortcuts.startEditingShortcut(viewerZoomIn);
        await shortcuts.pressShortcutKeys('q');
        await shortcuts.isShortcutAvailableMessageVisible(viewerZoomIn);
        await shortcuts.saveShortcut(viewerZoomIn);
      },
    );

    await shortcutsTest.step(
      'Reopen the Shortcuts panel → both actions keep "q"',
      async () => {
        await shortcuts.reload();
        await shortcuts.search(cut.action);
        await shortcuts.hasShortcutKeys(cut, ['q']);
        await shortcuts.search(viewerZoomIn.action);
        await shortcuts.hasShortcutKeys(viewerZoomIn, ['q']);
      },
    );
  },
);

shortcutsTest(
  qase(
    [3647],
    'Applying an import updates shortcuts to the imported key combinations',
  ),
  async ({ yourAccountPage }, testInfo) => {
    const { shortcuts } = yourAccountPage;
    const exportedFile = testInfo.outputPath('shortcuts.json');

    await shortcutsTest.step(
      'Setup: export a file with "Cut" set to "q", then reset all shortcuts to default',
      async () => {
        await shortcuts.assignShortcut(cut, 'q');
        await shortcuts.search('');
        const download = await shortcuts.exportShortcuts();
        await download.saveAs(exportedFile);
        await shortcuts.clickResetAll();
        await shortcuts.confirmResetAll();
      },
    );

    await shortcutsTest.step(
      'Import the file → the preview lists Action, Current and Imported keys',
      async () => {
        await shortcuts.importShortcuts(exportedFile);
        await shortcuts.isDialogRowVisible(shortcuts.importDialog, [
          'Action',
          'Current',
          'Imported',
        ]);
        await shortcuts.isDialogRowVisible(shortcuts.importDialog, [
          'Cut',
          'ctrl x',
          'q',
        ]);
      },
    );

    await shortcutsTest.step('Confirm the import → the dialog closes', async () => {
      await shortcuts.confirmImport();
    });

    await shortcutsTest.step(
      'Reopen the Shortcuts panel → "Cut" uses the imported "q"',
      async () => {
        await shortcuts.reload();
        await shortcuts.search(cut.action);
        await shortcuts.hasShortcutKeys(cut, ['q']);
      },
    );
  },
);

shortcutsTest(
  qase(
    [3654],
    'Restore All resets every personalized and disabled shortcut to its default',
  ),
  async ({ yourAccountPage }) => {
    const { shortcuts } = yourAccountPage;
    await shortcutsTest.step(
      'Setup: reassign "Cut" to "q" and disable "Copy properties"',
      async () => {
        await shortcuts.assignShortcut(cut, 'q');
        await shortcuts.disableShortcut(copyProperties);
        await shortcuts.hasNoShortcutKeys(copyProperties);
        await shortcuts.reload();
        await shortcuts.openTab('Custom');
        await shortcuts.isShortcutListed(cut);
        await shortcuts.openTab('Disabled');
        await shortcuts.isShortcutListed(copyProperties);
        await shortcuts.openTab('All');
      },
    );

    await shortcutsTest.step(
      'Click "Reset all" → confirmation lists both shortcuts with their defaults',
      async () => {
        await shortcuts.clickResetAll();
        await shortcuts.isDialogRowVisible(shortcuts.resetAllDialog, [
          'Cut',
          'q',
          'ctrl x',
        ]);
        await shortcuts.isDialogRowVisible(shortcuts.resetAllDialog, [
          'Copy properties',
          '-',
          'ctrl alt c',
        ]);
      },
    );

    await shortcutsTest.step(
      'Confirm → both are back to their defaults',
      async () => {
        await shortcuts.confirmResetAll();
        await shortcuts.search(cut.action);
        await shortcuts.hasShortcutKeys(cut, ['ctrl', 'x']);
        await shortcuts.search(copyProperties.action);
        await shortcuts.hasShortcutKeys(copyProperties, ['ctrl', 'alt', 'c']);
        await shortcuts.search('');
      },
    );

    await shortcutsTest.step('The Custom and Disabled tabs are empty', async () => {
      await shortcuts.openTab('Custom');
      await shortcuts.isTabEmpty();
      await shortcuts.openTab('Disabled');
      await shortcuts.isTabEmpty();
    });
  },
);
