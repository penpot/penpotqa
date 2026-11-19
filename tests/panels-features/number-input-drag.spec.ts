import { WorkspacePage } from '@pages/workspace/workspace-page';
import { demoAccountFileTest } from 'fixtures';
import { qase } from 'playwright-qase-reporter/playwright';

demoAccountFileTest(
  qase([2847], 'Add drag-to-change for Number input (right sidebar)'),
  async ({ page, mainPage }) => {
    const { design } = new WorkspacePage(page).rightSidebar;

    await demoAccountFileTest.step(
      'Create a 100x100 rectangle: the W icon shows the drag cursor',
      async () => {
        await mainPage.createDefaultRectangleByCoordinates(300, 300);
        await design.checkNumberInputValue('Width', 100);
        await design.checkNumberInputDragCursor('Width');
      },
    );

    await demoAccountFileTest.step(
      'Drag right and then left: the width goes up and down 1 per pixel',
      async () => {
        await design.dragNumberInput('Width', 20);
        await design.checkNumberInputValue('Width', 120);
        await design.dragNumberInput('Width', -10);
        await design.checkNumberInputValue('Width', 110);
      },
    );

    await demoAccountFileTest.step(
      'Drag with Shift (10x faster) and with Ctrl (0.1x finer)',
      async () => {
        await design.dragNumberInput('Width', 5, 'Shift');
        await design.checkNumberInputValue('Width', 160);
        await design.dragNumberInput('Width', 20, 'Control');
        await design.checkNumberInputValue('Width', 162);
      },
    );

    await demoAccountFileTest.step(
      'Click the input without moving: it gets focus for typing',
      async () => {
        await design.checkNumberInputFocusedOnClick('Width');
      },
    );

    await demoAccountFileTest.step(
      'Drag other inputs: X axis, Rotation and Opacity change too',
      async () => {
        await design.dragNumberInput('X axis', 30);
        await design.checkNumberInputValue('X axis', 280);
        await design.dragNumberInput('Rotation', 15);
        await design.checkNumberInputValue('Rotation', 15);
        await design.dragNumberInput('Opacity', -10);
        await design.checkNumberInputValue('Opacity', 90);
      },
    );
  },
);
