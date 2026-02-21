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

// ── 5. Export Buttons ─────────────────────────────────────────────────
test('export buttons appear after fitting', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /Fit Curve/i }).click();
  await expect(resultsLabel(page)).toBeVisible({ timeout: 10000 });

  await expect(page.getByRole('button', { name: /CSV/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /PNG/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /SVG/i })).toBeVisible();
});

// ── 6. Theme Toggle ──────────────────────────────────────────────────
test('theme toggle switches between light and dark', async ({ page }) => {
  await page.goto('/');
  const app = page.locator('[data-theme]');
  await expect(app).toHaveAttribute('data-theme', 'light');

  await page.getByRole('button', { name: '🌙' }).click();
  await expect(app).toHaveAttribute('data-theme', 'dark');

  await page.getByRole('button', { name: '☀️' }).click();
  await expect(app).toHaveAttribute('data-theme', 'light');
});

// ── 7. Guide Button ──────────────────────────────────────────────────
test('guide button opens new tab', async ({ page, context }) => {
  await page.goto('/');
  const [newPage] = await Promise.all([
    context.waitForEvent('page'),
    page.getByRole('button', { name: /Guide/i }).click(),
  ]);
  await newPage.waitForLoadState();
  expect(newPage.url()).toContain('intro.html');
});

// ── 8. Edge Cases ─────────────────────────────────────────────────────
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
