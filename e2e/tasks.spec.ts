import { test, expect } from '@playwright/test';
import { randomBytes } from 'crypto';

test.describe('PomoPulse Task Management CRUD', () => {
  const testEmail = `task-qa-${randomBytes(4).toString('hex')}@pulp.com`;
  const testPassword = 'Password123!';

  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    const toggleModeBtn = page.locator('[data-testid="auth-toggle-mode-btn"]');
    await toggleModeBtn.waitFor({ state: 'visible' });
    if (await toggleModeBtn.textContent() === "Create an account") {
        await toggleModeBtn.click({ force: true });
    }
    await page.locator('[data-testid="auth-username-input"]').fill('QATaskTester');
    await page.locator('[data-testid="auth-email-input"]').fill(testEmail);
    await page.locator('[data-testid="auth-password-input"]').fill(testPassword);
    
    const submitBtn = page.locator('[data-testid="auth-submit-btn"]');
    await submitBtn.waitFor({ state: 'visible' });
    await submitBtn.click({ force: true });
    
    await page.waitForURL('**/', { timeout: 10000 });
  });

  test('Create, Edit, and Delete Task correctly with Backend Sync', async ({ page }) => {
    const taskTitle = 'Refactor Auth Core';
    const editedTitle = 'Refactor Auth Core & DB';
    
    // Create Task
    const taskInput = page.getByPlaceholder(/Add a new task/i);
    await taskInput.fill(taskTitle);
    
    const createPromise = page.waitForResponse(response => 
      response.url().includes('/api/tasks') && response.request().method() === 'POST' && response.status() === 200
    );
    await taskInput.press('Enter');
    await createPromise;
    
    const taskItem = page.getByText(taskTitle).first();
    await expect(taskItem).toBeVisible();

    // Edit Task (using Power Menu trigger)
    const powerMenuBtn = page.locator('[data-testid="task-power-menu-btn"]').first();
    await powerMenuBtn.click({ force: true });
    
    const editMenu = page.locator('[data-testid="task-edit-menu"]');
    await editMenu.waitFor({ state: 'visible' });
    await editMenu.click({ force: true });
       
    const editInput = page.locator('input[type="text"]').last(); 
    await editInput.waitFor({ state: 'visible' });
    // Clear and type new title
    await editInput.clear();
    await editInput.fill(editedTitle);
    await editInput.press('Enter');
       
    await expect(page.getByText(editedTitle).first()).toBeVisible();

    // Delete Task
    const deletePromise = page.waitForResponse(response => 
       response.url().includes('/api/tasks/') && response.request().method() === 'DELETE'
    );
    
    // Power menu button may exist again for the edited task
    const nextPowerMenuBtn = page.locator('[data-testid="task-power-menu-btn"]').first();
    await nextPowerMenuBtn.click({ force: true });
    
    const deleteMenu = page.locator('[data-testid="task-delete-menu"]');
    // Ensure visibility despite framer-motion scaling
    await deleteMenu.waitFor({ state: 'visible' });
    await deleteMenu.click({ force: true });
        
    const confirmBtn = page.getByRole('button', { name: /Confirm|Delete/i });
    if (await confirmBtn.isVisible()) {
        await confirmBtn.click({ force: true });
    }
        
    await deletePromise;
    await expect(page.getByText(taskTitle).first()).toBeHidden();
    await expect(page.getByText(editedTitle).first()).toBeHidden();
  });
});
