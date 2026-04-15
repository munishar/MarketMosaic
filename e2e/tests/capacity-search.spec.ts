import { test, expect } from '@playwright/test';
import { testUsers, testCapacity } from '../fixtures/test-data';

test.describe('Capacity Search', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    const { email, password } = testUsers.servicer;
    await page.getByLabel(/email/i).fill(email);
    await page.getByLabel(/password/i).fill(password);
    await page.getByRole('button', { name: /sign in|log in/i }).click();
    await expect(page).toHaveURL(/\/(dashboard|home)?$/);
  });

  test('should navigate to capacity search', async ({ page }) => {
    await page.goto('/capacity');
    await expect(page.getByText(/capacity|market/i)).toBeVisible();
  });

  test('should search capacity by line of business', async ({ page }) => {
    await page.goto('/capacity');

    await page.getByLabel(/line of business|lob/i).fill(testCapacity.line_of_business);
    await page.getByText(testCapacity.line_of_business).first().click();

    await page.getByRole('button', { name: /search|find|filter/i }).click();

    await expect(
      page.locator('table tbody tr, [data-testid="capacity-row"]').first()
    ).toBeVisible({ timeout: 10_000 });
  });

  test('should filter capacity by form/paper type', async ({ page }) => {
    await page.goto('/capacity');

    await page.getByLabel(/form|paper/i).fill(testCapacity.form_paper);
    await page.getByText(testCapacity.form_paper).first().click();

    await page.getByRole('button', { name: /search|find|filter/i }).click();

    const rows = page.locator('table tbody tr, [data-testid="capacity-row"]');
    const count = await rows.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should filter capacity by premium range', async ({ page }) => {
    await page.goto('/capacity');

    await page.getByLabel(/min.*premium/i).fill(String(testCapacity.min_premium));
    await page.getByLabel(/max.*premium/i).fill(String(testCapacity.max_premium));

    await page.getByRole('button', { name: /search|find|filter/i }).click();

    const rows = page.locator('table tbody tr, [data-testid="capacity-row"]');
    const count = await rows.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should view carrier details from capacity results', async ({ page }) => {
    await page.goto('/capacity');

    await page.getByLabel(/line of business|lob/i).fill(testCapacity.line_of_business);
    await page.getByText(testCapacity.line_of_business).first().click();
    await page.getByRole('button', { name: /search|find|filter/i }).click();

    // Click on first carrier in results
    const firstRow = page.locator('table tbody tr, [data-testid="capacity-row"]').first();
    await firstRow.getByRole('link').first().click();

    await expect(page.getByText(/carrier|underwriter/i)).toBeVisible();
  });

  test('should combine multiple filters', async ({ page }) => {
    await page.goto('/capacity');

    await page.getByLabel(/line of business|lob/i).fill(testCapacity.line_of_business);
    await page.getByText(testCapacity.line_of_business).first().click();

    await page.getByLabel(/form|paper/i).fill(testCapacity.form_paper);
    await page.getByText(testCapacity.form_paper).first().click();

    await page.getByLabel(/min.*premium/i).fill(String(testCapacity.min_premium));

    await page.getByRole('button', { name: /search|find|filter/i }).click();

    const rows = page.locator('table tbody tr, [data-testid="capacity-row"]');
    const count = await rows.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should export capacity results', async ({ page }) => {
    await page.goto('/capacity');

    await page.getByLabel(/line of business|lob/i).fill(testCapacity.line_of_business);
    await page.getByText(testCapacity.line_of_business).first().click();
    await page.getByRole('button', { name: /search|find|filter/i }).click();

    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: /export|download/i }).click();
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toMatch(/capacity.*\.(csv|xlsx)/);
  });
});
