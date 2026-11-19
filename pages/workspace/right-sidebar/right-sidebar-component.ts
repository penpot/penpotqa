import { BaseComponent } from '@pages/base-component';
import { expect, type Locator, type Page } from '@playwright/test';
import { DesignTabComponent } from '@pages/workspace/right-sidebar/design-tab/design-tab-component';
import { HistoryActionsTabComponent } from '@pages/workspace/right-sidebar/history-actions-tab-component';
import { ExportProgressComponent } from '@pages/workspace/right-sidebar/export-progress-component';
import { InspectTabComponent } from '@pages/workspace/right-sidebar/inspect-tab-component';
import { PrototypeTabComponent } from '@pages/workspace/right-sidebar/prototype-tab/prototype-tab-component';

export class RightSidebarComponent extends BaseComponent {
  readonly design: DesignTabComponent;
  readonly prototype: PrototypeTabComponent;
  readonly inspectTabComponent: InspectTabComponent;
  readonly exportProgress: ExportProgressComponent;
  readonly viewerInspectComponent: InspectTabComponent;
  readonly historyActions: HistoryActionsTabComponent;
  readonly zoomWidget: Locator;
  readonly activeUsers: Locator;

  constructor(page: Page, root: Locator) {
    super(page, root);
    this.design = new DesignTabComponent(
      page,
      root.getByRole('tabpanel', { name: 'design' }),
    );
    this.prototype = new PrototypeTabComponent(
      page,
      root.getByRole('tabpanel', { name: 'prototype' }),
    );
    // Editors: the Inspect tab's panel.
    this.inspectTabComponent = new InspectTabComponent(
      page,
      root.getByRole('tabpanel', { name: 'inspect' }),
    );
    this.exportProgress = new ExportProgressComponent(
      page,
      root.locator('[class*="export-progress-modal"]'),
    );
    // Viewers have no tab switcher: the inspect content is the sidebar itself.
    this.viewerInspectComponent = new InspectTabComponent(page, root);
    this.historyActions = new HistoryActionsTabComponent(
      page,
      root.getByRole('tabpanel', { name: 'Actions' }),
    );
    // Header button that shows the zoom level, e.g. "100%"
    this.zoomWidget = root.getByTitle('Zoom', { exact: true });
    // Header avatars of the users who have the file open, named by user name
    this.activeUsers = root.getByTestId('active-users-list').getByRole('listitem');
  }

  /**
   * Returns the zoom level shown in the header.
   * @returns The zoom percentage, e.g. 100.
   */
  private async getZoomPercent(): Promise<number> {
    return parseFloat(await this.zoomWidget.innerText());
  }

  /**
   * Checks the zoom level shown in the header.
   * @param percent Expected zoom percentage, e.g. 100.
   */
  async checkZoom(percent: number) {
    await expect(this.zoomWidget, `Zoom is ${percent}%`).toHaveText(`${percent}%`);
  }

  /**
   * Checks that the zoom level shown in the header is above or below a value.
   * @param comparison 'above' or 'below'.
   * @param percent Zoom percentage to compare with, e.g. 100.
   */
  async checkZoomIs(comparison: 'above' | 'below', percent: number) {
    const poll = expect.poll(() => this.getZoomPercent(), {
      message: `Zoom is ${comparison} ${percent}%`,
    });
    await (comparison === 'above'
      ? poll.toBeGreaterThan(percent)
      : poll.toBeLessThan(percent));
  }

  /**
   * Opens a tab of the right sidebar.
   * @param name Tab name.
   */
  async clickTab(name: 'design' | 'prototype' | 'inspect') {
    await this.root.getByRole('tab', { name }).click();
  }

  /**
   * Checks that users are shown in the header as having the file open (one avatar each).
   * @param names User names, e.g. ['QA Tester', 'QA Editor'].
   */
  async checkActiveUsersAreVisible(names: string[]) {
    for (const name of names) {
      await expect(
        this.activeUsers.filter({
          has: this.page.getByAltText(name, { exact: true }),
        }),
        `${name} is shown as having the file open`,
      ).toBeVisible();
    }
  }
}
