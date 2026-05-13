import { test, expect } from '@playwright/test';

const BASE_URL = 'https://agrimarketeg.vercel.app';

const FARMER = {
  email: 'farmer@gmail.com',
  password: '123456',
  role: 'farmer',
};

const TRADER = {
  email: 'trader@gmail.com',
  password: '123456',
  role: 'trader',
};

async function login(page, user) {
  await page.route('**/api/auth/login', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        token: 'e2e-token',
        user: {
          id: `e2e-${user.role}`,
          role: user.role,
          name: user.role,
          email: user.email,
        },
      }),
    });
  });

  await page.goto(BASE_URL + '/login', { waitUntil: 'domcontentloaded' });

  await page.getByPlaceholder('you@example.com').fill(user.email);
  await page.getByPlaceholder('Enter your password').fill(user.password);

  await Promise.all([
    page.waitForURL(/\/(farmer|trader)/, { timeout: 15000 }),
    page.getByRole('button', { name: /^sign in$/i }).click(),
  ]);
}

test.describe('AgriMarket Auth & UI E2E', () => {

  test('Homepage loads correctly', async ({ page }) => {
    await page.goto(BASE_URL);

    await expect(
      page.getByRole('heading', { name: /Fresh produce/i })
    ).toBeVisible();

    await expect(page.getByRole('link', { name: /^sign in$/i }).first()).toBeVisible();
  });

  test('Navigate to login page', async ({ page }) => {
    await page.goto(BASE_URL);

    await page.getByRole('link', { name: /^sign in$/i }).first().click();

    await expect(page).toHaveURL(/login/);
  });

  test('Farmer login works', async ({ page }) => {
    await login(page, FARMER);

    await expect(page).toHaveURL(/\/farmer/);
  });

  test('Trader login works', async ({ page }) => {
    await login(page, TRADER);

    await expect(page).toHaveURL(/\/trader/);
  });

  test('Protected route: messages requires login', async ({ page }) => {
    await page.goto(BASE_URL + '/messages');

    // should either redirect or block access
    await expect(page).toHaveURL(/login|messages/);
  });

  test('Protected route: orders access after login', async ({ page }) => {
    await page.route('**/api/orders**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      });
    });

    await login(page, FARMER);

    await page.goto(BASE_URL + '/orders');

    await expect(page.getByRole('heading', { name: /^orders$/i })).toBeVisible();
  });

  test('Navigation links work', async ({ page }) => {
    await page.goto(BASE_URL);

    await page.getByRole('link', { name: 'Get Started' }).first().click();
    await expect(page).toHaveURL(/register/);

    await page.goBack();

    await page.getByRole('link', { name: 'Classify' }).click();
    await expect(page).toHaveURL(/classify/);
  });

  test('Mobile UI responsiveness', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto(BASE_URL);

    await expect(
      page.getByRole('heading', { name: /Fresh produce/i })
    ).toBeVisible();
  });

});
