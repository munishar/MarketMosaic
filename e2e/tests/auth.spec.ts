import { test, expect } from '@playwright/test';
import { testUsers } from '../fixtures/test-data';

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('should display login page', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /sign in|log in/i })).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
  });

  test('should reject invalid credentials', async ({ page }) => {
    await page.getByLabel(/email/i).fill('invalid@example.com');
    await page.getByLabel(/password/i).fill('wrongpassword');
    await page.getByRole('button', { name: /sign in|log in/i }).click();

    await expect(page.getByText(/invalid|unauthorized|incorrect/i)).toBeVisible();
  });

  test('should login with admin credentials', async ({ page }) => {
    const { email, password } = testUsers.admin;
    await page.getByLabel(/email/i).fill(email);
    await page.getByLabel(/password/i).fill(password);
    await page.getByRole('button', { name: /sign in|log in/i }).click();

    await expect(page).toHaveURL(/\/(dashboard|home)?$/);
    await expect(page.getByText(/dashboard|welcome/i)).toBeVisible();
  });

  test('should login with servicer credentials', async ({ page }) => {
    const { email, password } = testUsers.servicer;
    await page.getByLabel(/email/i).fill(email);
    await page.getByLabel(/password/i).fill(password);
    await page.getByRole('button', { name: /sign in|log in/i }).click();

    await expect(page).toHaveURL(/\/(dashboard|home)?$/);
  });

  test('should redirect unauthenticated user to login', async ({ page }) => {
    await page.goto('/clients');
    await expect(page).toHaveURL(/\/login/);
  });

  test('should logout successfully', async ({ page }) => {
    const { email, password } = testUsers.admin;
    await page.getByLabel(/email/i).fill(email);
    await page.getByLabel(/password/i).fill(password);
    await page.getByRole('button', { name: /sign in|log in/i }).click();
    await expect(page).toHaveURL(/\/(dashboard|home)?$/);

    await page.getByRole('button', { name: /user|profile|menu/i }).click();
    await page.getByRole('menuitem', { name: /log\s?out|sign\s?out/i }).click();

    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe('Permission Enforcement', () => {
  test('viewer cannot access admin settings', async ({ page }) => {
    await page.goto('/login');
    const { email, password } = testUsers.viewer;
    await page.getByLabel(/email/i).fill(email);
    await page.getByLabel(/password/i).fill(password);
    await page.getByRole('button', { name: /sign in|log in/i }).click();
    await expect(page).toHaveURL(/\/(dashboard|home)?$/);

    await page.goto('/settings/admin');
    await expect(
      page.getByText(/forbidden|not authorized|access denied/i)
    ).toBeVisible();
  });

  test('servicer can access clients page', async ({ page }) => {
    await page.goto('/login');
    const { email, password } = testUsers.servicer;
    await page.getByLabel(/email/i).fill(email);
    await page.getByLabel(/password/i).fill(password);
    await page.getByRole('button', { name: /sign in|log in/i }).click();

    await page.goto('/clients');
    await expect(page.getByText(/clients/i)).toBeVisible();
  });
});
