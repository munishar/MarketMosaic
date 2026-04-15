import { test, expect } from '@playwright/test';
import { testUsers, API_URL } from '../fixtures/test-data';

test.describe('Config-Driven Architecture', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    const { email, password } = testUsers.admin;
    await page.getByLabel(/email/i).fill(email);
    await page.getByLabel(/password/i).fill(password);
    await page.getByRole('button', { name: /sign in|log in/i }).click();
    await expect(page).toHaveURL(/\/(dashboard|home)?$/);
  });

  test('should navigate to manifest settings', async ({ page }) => {
    await page.goto('/settings/manifest');
    await expect(page.getByText(/manifest|configuration/i)).toBeVisible();
  });

  test('should view entity field configuration', async ({ page }) => {
    await page.goto('/settings/manifest');

    await page.getByText(/client/i).first().click();

    await expect(page.getByText(/company_name|fields/i)).toBeVisible();
  });

  test('should toggle field visibility and see UI update', async ({ page }) => {
    await page.goto('/settings/manifest');

    // Navigate to entity config
    await page.getByText(/client/i).first().click();

    // Find a toggleable field and toggle it
    const fieldRow = page.locator('[data-testid="field-row"], table tbody tr')
      .filter({ hasText: /website/i });
    const toggle = fieldRow.getByRole('switch', { name: /visible|show/i })
      .or(fieldRow.getByRole('checkbox', { name: /visible|show/i }));
    await toggle.click();

    await page.getByRole('button', { name: /save|apply/i }).click();
    await expect(page.getByText(/saved|updated|success/i)).toBeVisible();

    // Navigate to clients and verify field is hidden
    await page.goto('/clients');
    await page.getByRole('button', { name: /new client|add client|create/i }).click();

    // The website field should not be visible
    await expect(page.getByLabel(/website/i)).not.toBeVisible();
  });

  test('should change field label and see UI update', async ({ page }) => {
    await page.goto('/settings/manifest');
    await page.getByText(/client/i).first().click();

    // Edit field label
    const fieldRow = page.locator('[data-testid="field-row"], table tbody tr')
      .filter({ hasText: /company_name/i });
    await fieldRow.getByRole('button', { name: /edit/i }).click();

    const labelInput = page.getByLabel(/label|display name/i);
    await labelInput.clear();
    await labelInput.fill('Business Name');

    await page.getByRole('button', { name: /save|apply/i }).click();
    await expect(page.getByText(/saved|updated|success/i)).toBeVisible();

    // Verify the label changed on the client form
    await page.goto('/clients');
    await page.getByRole('button', { name: /new client|add client|create/i }).click();
    await expect(page.getByLabel(/business name/i)).toBeVisible();
  });

  test('should update workflow definition', async ({ page }) => {
    await page.goto('/settings/manifest');

    await page.getByText(/workflow|submission/i).first().click();

    // Verify workflow stages are displayed
    await expect(page.getByText(/draft|submitted|quoted|bound/i)).toBeVisible();
  });

  test('should verify manifest changes via API', async ({ page, request }) => {
    // Fetch current manifest via API
    const response = await request.get(`${API_URL}/api/manifest`);
    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data).toHaveProperty('data');
  });

  test('should revert manifest changes', async ({ page }) => {
    await page.goto('/settings/manifest');

    await page.getByRole('button', { name: /reset|revert|defaults/i }).click();

    // Confirm reset
    await page.getByRole('button', { name: /confirm|yes|reset/i }).click();
    await expect(page.getByText(/reset|restored|default/i)).toBeVisible();
  });
});
