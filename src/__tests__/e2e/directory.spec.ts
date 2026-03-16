import { test, expect } from '@playwright/test';

test.describe('Directory Page E2E', () => {
  test('should load the directory page', async ({ page }) => {
    await page.goto('/directory');
    await page.screenshot({ path: 'test-results/directory-load.png' });
    await expect(page.locator('h1')).toContainText('Talent Discovery');
  });

  test('should show AI Top Picks when location is shared', async ({ page, context }) => {
    // Mock the maximizer API response
    await page.route('**/api/ai/maximizer*', async route => {
      const json = { 
        data: [
          { id: '1', name: 'Mock Venue 1', bio: 'Great place for jazz.' },
          { id: '2', name: 'Mock Venue 2', bio: 'Loud rock club.' }
        ] 
      };
      await route.fulfill({ json });
    });

    // Grant geolocation permissions
    await context.grantPermissions(['geolocation']);
    // Set a mock location (Austin, TX)
    await context.setGeolocation({ latitude: 30.2672, longitude: -97.7431 });

    await page.goto('/directory');
    await page.screenshot({ path: 'test-results/directory-before-sync.png' });
    
    // Trigger "Sync Location"
    const syncButton = page.getByRole('button', { name: /Sync Location/i });
    await syncButton.click();

    // The MaximizerPicks component should eventually appear
    const aiSection = page.locator('text=AI Top Picks');
    await expect(aiSection).toBeVisible({ timeout: 15000 });
    await page.screenshot({ path: 'test-results/directory-after-sync.png' });
  });
});
