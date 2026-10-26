import { MainPage } from '@pages/workspace/main-page';

/**
 * Main drawing toolbar at the top of the viewport (Move, Board, Rectangle, Text,
 * Image, Path, Plugins) and its tool flyouts.
 *
 * Its locators and methods still live in MainPage and move here progressively.
 * Pages for the modes entered from the toolbar (e.g. PathEditorPage) extend it.
 */
export class ToolbarPage extends MainPage {}
