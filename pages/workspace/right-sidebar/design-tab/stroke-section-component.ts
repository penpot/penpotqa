import { BaseComponent } from '@pages/base-component';
import { expect, type Locator, type Page } from '@playwright/test';

export const STROKE_WIDTH = 'Stroke width';

export const StrokeSide = {
  Top: 'Top (block start)',
  Right: 'Right (inline end)',
  Bottom: 'Bottom (block end)',
  Left: 'Left (inline start)',
} as const;

export type StrokeSideName = (typeof StrokeSide)[keyof typeof StrokeSide];
export type StrokeWidthFieldName = StrokeSideName | typeof STROKE_WIDTH;

/** The Stroke section of the Design tab. */
export class StrokeSectionComponent extends BaseComponent {
  readonly strokeRow: Locator;
  readonly strokeColorBullet: Locator;
  readonly strokeOpacityInput: Locator;
  readonly strokeAlignmentField: Locator;
  readonly strokeTypeField: Locator;
  readonly strokePerSideButton: Locator;

  constructor(page: Page, root: Locator) {
    super(page, root);

    this.strokeRow = root.locator('div[class*="stroke-color-actions"]').last();
    this.strokeColorBullet = this.strokeRow
      .locator('div[class*="color-bullet-wrapper"]')
      .last();
    this.strokeOpacityInput = this.strokeRow.getByTestId('opacity-input');
    this.strokeAlignmentField = root.getByTestId('stroke.alignment');
    this.strokeTypeField = root.getByTestId('stroke.style');
    this.strokePerSideButton = root.getByRole('button', {
      name: 'Stroke per side',
    });
  }

  getStrokeWidthField(label: StrokeWidthFieldName): Locator {
    return this.root
      .getByTestId('numeric-input-wrapper')
      .filter({ has: this.page.getByLabel(label, { exact: true }) });
  }

  async clickStrokePerSideButton() {
    await this.strokePerSideButton.click();
  }

  async setStrokeSideWidth(side: StrokeSideName, value: string) {
    const input = this.getStrokeWidthField(side).getByRole('textbox');
    await input.fill(value);
    await input.press('Enter');
  }

  async detachStrokeWidthToken(field: StrokeWidthFieldName) {
    const widthField = this.getStrokeWidthField(field);
    await widthField.hover();
    await widthField.getByRole('button', { name: 'Detach token' }).click();
  }

  async checkStrokeRowFieldsAreVisible() {
    await expect(this.strokeColorBullet, 'Stroke color is visible').toBeVisible();
    await expect(this.strokeOpacityInput, 'Stroke opacity is visible').toBeVisible();
    await expect(
      this.strokeAlignmentField,
      'Stroke position is visible',
    ).toBeVisible();
    await expect(this.strokeTypeField, 'Stroke style is visible').toBeVisible();
  }

  async checkStrokePerSideButtonPressed(pressed = true) {
    await expect(
      this.strokePerSideButton,
      `"Stroke per side" button is ${pressed ? '' : 'not '}pressed`,
    ).toHaveAttribute('aria-pressed', pressed ? 'true' : 'false');
  }

  async checkStrokePerSideTooltip() {
    await this.page.mouse.move(0, 0);
    await this.root.getByLabel('Stroke per side', { exact: true }).hover();
    await expect(
      this.page.getByRole('tooltip').filter({ hasText: 'Stroke per side' }),
      '"Stroke per side" tooltip is shown',
    ).toHaveText('Stroke per side');
  }

  async checkStrokeSideTooltip(side: StrokeSideName) {
    await this.getStrokeWidthField(side).getByRole('textbox').hover();
    await expect(
      this.page.getByRole('tooltip').filter({ hasText: side }),
      `"${side}" tooltip is shown`,
    ).toHaveText(side);
  }

  async checkStrokeSideWidth(side: StrokeSideName, value: string) {
    await expect(
      this.getStrokeWidthField(side).getByRole('textbox'),
      `"${side}" is ${value}`,
    ).toHaveValue(value);
  }

  async checkStrokeSideWidths(widths: Record<StrokeSideName, string>) {
    for (const side of Object.values(StrokeSide)) {
      await this.checkStrokeSideWidth(side, widths[side]);
    }
  }

  async checkStrokeWidthTokenPillIsVisible(
    field: StrokeWidthFieldName,
    tokenName: string,
  ) {
    await expect(
      this.getStrokeWidthField(field).getByRole('button', {
        name: tokenName,
        exact: true,
      }),
      `"${field}" shows the "${tokenName}" token pill`,
    ).toBeVisible();
  }

  async checkStrokeWidthIsMixed() {
    const input = this.getStrokeWidthField(STROKE_WIDTH).getByRole('textbox');
    await expect(input, 'Stroke width input is empty').toHaveValue('');
    await expect(input, 'Stroke width input shows "Mixed"').toHaveAttribute(
      'placeholder',
      'Mixed',
    );
  }

  /** The four side inputs show only while "Stroke per side" is on. */
  async checkStrokeSideFieldsAreVisible(visible = true) {
    const top = this.getStrokeWidthField(StrokeSide.Top);
    visible
      ? await expect(top, 'Stroke side fields are visible').toBeVisible()
      : await expect(top, 'Stroke side fields are hidden').toHaveCount(0);
  }
}
