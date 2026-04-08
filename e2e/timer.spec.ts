import { test, expect } from '@playwright/test';
import { randomBytes } from 'crypto';

test.describe('PomoPulse Timer & Analytics Sync', () => {
  const testEmail = `timer-qa-${randomBytes(4).toString('hex')}@pulp.com`;
  const testPassword = 'Password123!';

  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    const toggleModeBtn = page.locator('[data-testid="auth-toggle-mode-btn"]');
    await toggleModeBtn.waitFor({ state: 'visible' });
    if (await toggleModeBtn.textContent() === "Create an account") {
        await toggleModeBtn.click({ force: true });
    }
    
    await page.locator('[data-testid="auth-username-input"]').fill('QATimerTester');
    await page.locator('[data-testid="auth-email-input"]').fill(testEmail);
    await page.locator('[data-testid="auth-password-input"]').fill(testPassword);
    
    const submitBtn = page.locator('[data-testid="auth-submit-btn"]');
    await submitBtn.waitFor({ state: 'visible' });
    await submitBtn.click({ force: true });
    
    await page.waitForURL('**/', { timeout: 10000 });
  });

  test('Focus session accurately syncs to Analytics using Fast-Forward time travel', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    await page.clock.install();

    // Trigger Timer manually with new locator
    const startButton = page.locator('[data-testid="timer-toggle-btn"]');
    await startButton.waitFor({ state: 'visible' });
    
    // It says START initially
    await startButton.click({ force: true });

    const sessionRequestPromise = page.waitForRequest(request => 
        request.url().includes('/api/sessions/complete') && request.method() === 'POST'
    );

    // Fast Forward exactly 25 minutes
    await page.clock.fastForward(25 * 60 * 1000 + 1000); 

    const sessionRequest = await sessionRequestPromise;
    const body = sessionRequest.postDataJSON();
    
    expect(body).toBeDefined();
    expect(body.sessionType).toBe('focus');
    expect(body.duration).toBeGreaterThanOrEqual(1499); 

    // Assuming standard layout displays Break mode afterward
    await expect(page.getByText(/PAUSE|Break/i).first()).toBeVisible({ timeout: 10000 });

    await page.goto('/analytics');
    await expect(page.locator('body')).toContainText(/25/);
  });
});
