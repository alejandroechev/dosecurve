import { test, expect } from '@playwright/test';

// Helper: wait for results panel to show IC50 (scoped to avoid SVG ambiguity)
const resultsLabel = (page: import('@playwright/test').Page) =>
  page.locator('.result-label', { hasText: 'IC50' });

// ── 1. Page Load ──────────────────────────────────────────────────────
test('page loads with correct title', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/DoseCurve/);
});

test('sample data is pre-filled in textarea', async ({ page }) => {
  await page.goto('/');
  const textarea = page.locator('textarea');
  await expect(textarea).not.toBeEmpty();
  await expect(textarea).toContainText('Concentration');
});

// ── 2. Fit Curve ──────────────────────────────────────────────────────
test('fit curve shows chart and results', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /Fit Curve/i }).click();

  await expect(resultsLabel(page)).toBeVisible({ timeout: 10000 });
  await expect(page.locator('.result-label', { hasText: 'R²' })).toBeVisible();
  await expect(page.locator('.result-label', { hasText: 'Hill Slope' })).toBeVisible();
  await expect(page.locator('.recharts-wrapper svg')).toBeVisible({ timeout: 10000 });
});

// ── 3. Samples Dropdown ──────────────────────────────────────────────
const sampleNames = [
  'Classic Inhibitor',
  'Weak Inhibitor',
  'Biphasic Response',
  'Agonist Dose-Response',
  'Noisy Clinical Data',
];

for (const name of sampleNames) {
  test(`load and fit sample: ${name}`, async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /Samples/i }).click();
    await page.getByRole('button', { name: new RegExp(name) }).click();
    await page.getByRole('button', { name: /Fit Curve/i }).click();

    await expect(resultsLabel(page)).toBeVisible({ timeout: 10000 });
    await expect(page.locator('.result-label', { hasText: 'R²' })).toBeVisible();
    await expect(page.locator('.recharts-wrapper svg')).toBeVisible({ timeout: 10000 });
  });
}

// ── 4. Data Entry ─────────────────────────────────────────────────────
test('empty data shows error on fit', async ({ page }) => {
  await page.goto('/');
  const textarea = page.locator('textarea');
  await textarea.fill('');
  await page.getByRole('button', { name: /Fit Curve/i }).click();
  await expect(page.getByText(/⚠/)).toBeVisible({ timeout: 5000 });
});

test('paste new valid data and fit', async ({ page }) => {
  await page.goto('/');
  const textarea = page.locator('textarea');
  await textarea.fill(`Concentration\tResponse
0.1\t100
1\t80
10\t50
100\t20
1000\t5`);

  await page.getByRole('button', { name: /Fit Curve/i }).click();
  await expect(resultsLabel(page)).toBeVisible({ timeout: 10000 });
});

// ── 5. In-place Export Buttons ────────────────────────────────────────
test('in-place export buttons: CSV on data entry always visible', async ({ page }) => {
  await page.goto('/');
  // CSV button on data entry panel is always visible
  const dataPanel = page.locator('.panel').first();
  await expect(dataPanel.getByRole('button', { name: /CSV/i })).toBeVisible();
});

test('in-place export buttons appear after fitting', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /Fit Curve/i }).click();
  await expect(resultsLabel(page)).toBeVisible({ timeout: 10000 });

  // PNG and SVG on chart panel
  await expect(page.getByRole('button', { name: /PNG/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /SVG/i })).toBeVisible();

  // CSV on results panel
  const csvButtons = page.getByRole('button', { name: /CSV/i });
  await expect(csvButtons).toHaveCount(2); // data entry + results
});

// ── 6. Theme Toggle ──────────────────────────────────────────────────
test('theme toggle switches between light and dark', async ({ page }) => {
  await page.goto('/');
  const app = page.locator('[data-theme]').first();
  await expect(app).toHaveAttribute('data-theme', 'light');

  await page.getByRole('button', { name: '🌙' }).click();
  await expect(app).toHaveAttribute('data-theme', 'dark');

  await page.getByRole('button', { name: '☀️' }).click();
  await expect(app).toHaveAttribute('data-theme', 'light');
});

// ── 7. Dark Theme Renders Correctly ──────────────────────────────────
test('dark theme applies correct background colors', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: '🌙' }).click();

  // html element should have data-theme="dark"
  const html = page.locator('html');
  await expect(html).toHaveAttribute('data-theme', 'dark');

  // body should have dark background
  const bodyBg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  expect(bodyBg).not.toBe('rgb(255, 255, 255)');

  // panels should use dark surface
  const panelBg = await page.evaluate(() => {
    const panel = document.querySelector('.panel');
    return panel ? getComputedStyle(panel).backgroundColor : '';
  });
  expect(panelBg).not.toBe('rgb(255, 255, 255)');

  // textarea should have dark background
  const textareaBg = await page.evaluate(() => {
    const ta = document.querySelector('textarea');
    return ta ? getComputedStyle(ta).backgroundColor : '';
  });
  expect(textareaBg).not.toBe('rgb(255, 255, 255)');
});

// ── 8. Theme localStorage Persistence ────────────────────────────────
test('theme preference persists via localStorage', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: '🌙' }).click();
  const stored = await page.evaluate(() => localStorage.getItem('dosecurve-theme'));
  expect(stored).toBe('dark');

  // Reload and verify
  await page.reload();
  const html = page.locator('html');
  await expect(html).toHaveAttribute('data-theme', 'dark');
});

// ── 9. File Upload ───────────────────────────────────────────────────
test('upload button is visible in toolbar', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('button', { name: /Upload/i })).toBeVisible();
});

test('file upload loads CSV data into textarea', async ({ page }) => {
  await page.goto('/');
  const csvContent = `Concentration,Response\n0.1,100\n1,80\n10,50\n100,20\n1000,5`;

  // Set file on hidden input
  const fileInput = page.locator('[data-testid="file-input"]');
  await fileInput.setInputFiles({
    name: 'test.csv',
    mimeType: 'text/csv',
    buffer: Buffer.from(csvContent),
  });

  // Verify textarea was updated
  const textarea = page.locator('textarea');
  await expect(textarea).toHaveValue(csvContent);
});

// ── 10. Guide Button ─────────────────────────────────────────────────
test('guide button opens new tab', async ({ page, context }) => {
  await page.goto('/');
  const [newPage] = await Promise.all([
    context.waitForEvent('page'),
    page.getByRole('button', { name: /Guide/i }).click(),
  ]);
  await newPage.waitForLoadState();
  expect(newPage.url()).toContain('intro.html');
});

// ── 11. Edge Cases ────────────────────────────────────────────────────
test('single data point shows error', async ({ page }) => {
  await page.goto('/');
  const textarea = page.locator('textarea');
  await textarea.fill(`Concentration\tResponse
10\t50`);
  await page.getByRole('button', { name: /Fit Curve/i }).click();
  await expect(page.getByText(/⚠/)).toBeVisible({ timeout: 5000 });
});

test('all same response values shows error or degenerate fit', async ({ page }) => {
  await page.goto('/');
  const textarea = page.locator('textarea');
  await textarea.fill(`Concentration\tResponse
0.1\t50
1\t50
10\t50
100\t50
1000\t50`);
  await page.getByRole('button', { name: /Fit Curve/i }).click();

  // Wait a moment then check: either error or results should appear
  await page.waitForTimeout(2000);
  const hasError = await page.getByText(/⚠/).isVisible().catch(() => false);
  const hasResults = await resultsLabel(page).isVisible().catch(() => false);
  expect(hasError || hasResults).toBe(true);
});

// ── 12. State Persistence ────────────────────────────────────────────
test('textarea data persists across page reload', async ({ page }) => {
  await page.goto('/');
  const textarea = page.locator('textarea');
  const customData = `Concentration\tResponse\n1\t90\n10\t50\n100\t10`;
  await textarea.fill(customData);
  // Wait for debounced save
  await page.waitForTimeout(700);
  // Verify saved
  const stored = await page.evaluate(() => localStorage.getItem('dosecurve-state'));
  expect(stored).toBeTruthy();
  // Reload and verify textarea contains our data
  await page.reload();
  await expect(page.locator('textarea')).toContainText('1\t90');
});

// ── 13. Button Order ─────────────────────────────────────────────────
test('toolbar button order: Upload, Samples, Fit Curve', async ({ page }) => {
  await page.goto('/');
  const actions = page.locator('.toolbar-actions > *');
  const texts = await actions.allTextContents();
  const uploadIdx = texts.findIndex(t => t.includes('Upload'));
  const samplesIdx = texts.findIndex(t => t.includes('Samples'));
  const fitIdx = texts.findIndex(t => t.includes('Fit Curve'));
  expect(uploadIdx).toBeLessThan(samplesIdx);
  expect(samplesIdx).toBeLessThan(fitIdx);
});
