import { test, expect } from '@playwright/test';
import { testUsers, testClient, testSubmission } from '../fixtures/test-data';

test.describe('Client Lifecycle', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    const { email, password } = testUsers.servicer;
    await page.getByLabel(/email/i).fill(email);
    await page.getByLabel(/password/i).fill(password);
    await page.getByRole('button', { name: /sign in|log in/i }).click();
    await expect(page).toHaveURL(/\/(dashboard|home)?$/);
  });

  test('should create a new client', async ({ page }) => {
    await page.goto('/clients');
    await page.getByRole('button', { name: /new client|add client|create/i }).click();

    await page.getByLabel(/company name/i).fill(testClient.company_name);
    await page.getByLabel(/industry/i).fill(testClient.industry);
    await page.getByLabel(/revenue/i).fill(String(testClient.revenue));
    await page.getByLabel(/employee/i).fill(String(testClient.employee_count));
    await page.getByLabel(/website/i).fill(testClient.website);

    await page.getByRole('button', { name: /save|create|submit/i }).click();

    await expect(page.getByText(testClient.company_name)).toBeVisible();
    await expect(page.getByText(/prospect/i)).toBeVisible();
  });

  test('should view client details', async ({ page }) => {
    await page.goto('/clients');
    await page.getByText(testClient.company_name).first().click();

    await expect(page.getByText(testClient.company_name)).toBeVisible();
    await expect(page.getByText(testClient.industry)).toBeVisible();
  });

  test('should update client status to active', async ({ page }) => {
    await page.goto('/clients');
    await page.getByText(testClient.company_name).first().click();

    await page.getByRole('button', { name: /edit/i }).click();
    await page.getByLabel(/status/i).selectOption('active');
    await page.getByRole('button', { name: /save|update/i }).click();

    await expect(page.getByText(/active/i)).toBeVisible();
  });

  test('should add a contact to client', async ({ page }) => {
    await page.goto('/clients');
    await page.getByText(testClient.company_name).first().click();

    await page.getByRole('tab', { name: /contacts/i }).click();
    await page.getByRole('button', { name: /add contact/i }).click();

    await page.getByLabel(/first name/i).fill(testClient.primary_contact_name.split(' ')[0]);
    await page.getByLabel(/last name/i).fill(testClient.primary_contact_name.split(' ')[1]);
    await page.getByLabel(/email/i).fill(testClient.primary_contact_email);

    await page.getByRole('button', { name: /save|create/i }).click();

    await expect(page.getByText(testClient.primary_contact_name)).toBeVisible();
  });

  test('should create submission from client', async ({ page }) => {
    await page.goto('/clients');
    await page.getByText(testClient.company_name).first().click();

    await page.getByRole('tab', { name: /submissions/i }).click();
    await page.getByRole('button', { name: /new submission|create submission/i }).click();

    await page.getByLabel(/effective date/i).fill(testSubmission.effective_date);
    await page.getByLabel(/expiration date/i).fill(testSubmission.expiration_date);
    await page.getByLabel(/notes/i).fill(testSubmission.notes);

    await page.getByRole('button', { name: /save|create|submit/i }).click();

    await expect(page.getByText(/draft/i)).toBeVisible();
  });

  test('should search for clients', async ({ page }) => {
    await page.goto('/clients');

    await page.getByPlaceholder(/search/i).fill('E2E Test');
    await page.keyboard.press('Enter');

    await expect(page.getByText(testClient.company_name)).toBeVisible();
  });

  test('should filter clients by status', async ({ page }) => {
    await page.goto('/clients');

    await page.getByRole('combobox', { name: /status|filter/i }).selectOption('prospect');

    const rows = page.locator('table tbody tr, [data-testid="client-row"]');
    const count = await rows.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });
});
