const { test } = require('@playwright/test');

test('PERF Render shapes with blur', { tag: '@perf' }, async ({ page }) => {});

test(
  'PERF Render shapes with drop-shadow',
  { tag: '@perf' },
  async ({ page }) => {},
);
