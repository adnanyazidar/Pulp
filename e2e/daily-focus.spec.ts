import { test, expect } from '@playwright/test';
import { randomBytes } from 'crypto';

test.describe('PomoPulse Daily Focus Privacy Matrix', () => {
  const testEmail = `privacy-qa-${randomBytes(4).toString('hex')}@pulp.com`;
  const testPassword = 'Password123!';

  test('Daily Focus content strictly avoids network transmission and persists locally', async ({ page }) => {
    await page.goto('/login');
    const toggleModeBtn = page.locator('[data-testid="auth-toggle-mode-btn"]');
    await toggleModeBtn.waitFor({ state: 'visible' });
    if (await toggleModeBtn.textContent() === "Create an account") {
        await toggleModeBtn.click({ force: true });
    }
    
    await page.locator('[data-testid="auth-username-input"]').fill('QAPrivacyTester');
    await page.locator('[data-testid="auth-email-input"]').fill(testEmail);
    await page.locator('[data-testid="auth-password-input"]').fill(testPassword);
    
    const submitBtn = page.locator('[data-testid="auth-submit-btn"]');
    await submitBtn.waitFor({ state: 'visible' });
    await submitBtn.click({ force: true });
    
    await page.waitForURL('**/', { timeout: 10000 });

    let leakedToNetwork = false;
    const sensitiveString = "SUPER_SECRET_DIARY_ENTRY_" + Date.now();

    page.on('request', request => {
      const postData = request.postData();
      if (postData && postData.includes(sensitiveString)) {
        leakedToNetwork = true;
      }
    });

    const scratchpad = page.locator('[data-testid="daily-note-input"]');
    await scratchpad.waitFor({ state: 'visible' });
    await scratchpad.fill(sensitiveString);
    await scratchpad.press('Enter');
        
    await page.waitForTimeout(3000);
    expect(leakedToNetwork).toBe(false); 

    // Using precision item query
    await page.reload();
    const item = page.locator('[data-testid="daily-note-item"]').filter({ hasText: sensitiveString }).first();
    await expect(item).toBeVisible({ timeout: 5000 });
        
    await page.getByRole('button', { name: /Logout/i }).click({ force: true });
    await page.waitForURL('**/login', { timeout: 5000 });

    await page.goto('/');
    const localVal = await page.evaluate(() => {
        const allStorage = { ...localStorage };
        return JSON.stringify(allStorage);
    });
        
    expect(localVal).not.toContain(sensitiveString);
  });
});
