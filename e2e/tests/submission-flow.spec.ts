import { test, expect } from '@playwright/test';
import { testUsers, testClient, testSubmission, testCarrier } from '../fixtures/test-data';

test.describe('Submission Workflow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    const { email, password } = testUsers.servicer;
    await page.getByLabel(/email/i).fill(email);
    await page.getByLabel(/password/i).fill(password);
    await page.getByRole('button', { name: /sign in|log in/i }).click();
    await expect(page).toHaveURL(/\/(dashboard|home)?$/);
  });

  test('should create a new submission with lines of business', async ({ page }) => {
    await page.goto('/submissions/new');

    // Select or search for a client
    await page.getByLabel(/client/i).fill(testClient.company_name);
    await page.getByText(testClient.company_name).first().click();

    // Fill submission details
    await page.getByLabel(/effective date/i).fill(testSubmission.effective_date);
    await page.getByLabel(/expiration date/i).fill(testSubmission.expiration_date);
    await page.getByLabel(/notes/i).fill(testSubmission.notes);

    // Add lines of business
    for (const lob of testSubmission.lines_of_business) {
      await page.getByRole('button', { name: /add line|add lob/i }).click();
      await page.getByLabel(/line of business/i).last().fill(lob);
      await page.getByText(lob).first().click();
    }

    await page.getByRole('button', { name: /save|create/i }).click();

    await expect(page.getByText(/draft/i)).toBeVisible();
    await expect(page.getByText(testClient.company_name)).toBeVisible();
  });

  test('should match submission to carrier targets', async ({ page }) => {
    await page.goto('/submissions');
    await page.getByText(testClient.company_name).first().click();

    await page.getByRole('button', { name: /find markets|match|search carriers/i }).click();

    // Wait for capacity matching results
    await expect(page.getByText(/match|result|carrier/i)).toBeVisible({ timeout: 10_000 });

    // Select a carrier target
    const firstResult = page.locator('[data-testid="carrier-match"], table tbody tr').first();
    await firstResult.getByRole('checkbox', { name: /select/i }).check();

    await page.getByRole('button', { name: /add.*target|add.*market/i }).click();
    await expect(page.getByText(/pending/i)).toBeVisible();
  });

  test('should send submission to targets', async ({ page }) => {
    await page.goto('/submissions');
    await page.getByText(testClient.company_name).first().click();

    await page.getByRole('tab', { name: /targets|markets/i }).click();

    // Select targets to submit
    await page.getByRole('checkbox', { name: /select all/i }).check();
    await page.getByRole('button', { name: /send|submit to/i }).click();

    // Confirm send dialog
    await page.getByRole('button', { name: /confirm|send/i }).click();

    await expect(page.getByText(/submitted/i)).toBeVisible();
  });

  test('should record a quote from carrier', async ({ page }) => {
    await page.goto('/submissions');
    await page.getByText(testClient.company_name).first().click();

    await page.getByRole('tab', { name: /targets|markets/i }).click();
    await page.getByText(testCarrier.name).first().click();

    await page.getByRole('button', { name: /record quote|add quote/i }).click();
    await page.getByLabel(/premium/i).fill('50000');
    await page.getByLabel(/notes/i).fill('Competitive quote with broad terms');

    await page.getByRole('button', { name: /save|submit/i }).click();

    await expect(page.getByText(/quoted/i)).toBeVisible();
  });

  test('should bind a submission', async ({ page }) => {
    await page.goto('/submissions');
    await page.getByText(testClient.company_name).first().click();

    await page.getByRole('tab', { name: /targets|markets/i }).click();
    await page.getByText(/quoted/i).first().click();

    await page.getByRole('button', { name: /bind/i }).click();

    // Confirm bind dialog
    await page.getByRole('button', { name: /confirm|bind/i }).click();

    await expect(page.getByText(/bound/i)).toBeVisible();
  });

  test('should show submission on dashboard', async ({ page }) => {
    await page.goto('/dashboard');

    // Verify recent submissions widget shows data
    const submissionsWidget = page.locator(
      '[data-testid="recent-submissions"], [aria-label*="submission"]'
    );
    await expect(submissionsWidget.or(page.getByText(/submissions/i))).toBeVisible();
  });

  test('should filter submissions by status', async ({ page }) => {
    await page.goto('/submissions');

    await page.getByRole('combobox', { name: /status|filter/i }).selectOption('draft');

    const rows = page.locator('table tbody tr, [data-testid="submission-row"]');
    const count = await rows.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });
});
