import { test, expect } from '@playwright/test';
import { loginAsAdultUser } from './helpers';

test.describe('Comments & Reflections Workflow', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdultUser(page);
  });

  test('should open comments drawer from dashboard and display quota', async ({ page }) => {
    // Open feedback/comments drawer from Dashboard
    const feedbackBtn = page.locator('#dashboard-feedback-btn');
    await expect(feedbackBtn).toBeVisible();
    await feedbackBtn.click();

    // Verify Comments Drawer opens with title and daily limit quota
    await expect(page.getByRole('heading', { name: /My Comments|Comentarios|Commenti|Opmerkingen/i })).toBeVisible();
    await expect(page.locator('text=left today').or(page.locator('text=restantes'))).toBeVisible();
  });

  test('should add, edit, and delete a reflection comment', async ({ page }) => {
    await page.locator('#dashboard-feedback-btn').click();

    // Type a comment into the input field
    const commentInput = page.getByPlaceholder(/Share your personal thoughts|reflection/i);
    await expect(commentInput).toBeVisible();

    const timestamp = Date.now();
    const testText = `Legendary thought ${timestamp}`;
    await commentInput.fill(testText);

    // Submit comment
    const submitBtn = page.locator('form button[type="submit"]');
    await submitBtn.click();

    // Verify comment appears in the list
    await expect(page.locator(`text=${testText}`)).toBeVisible();

    // Click Edit icon button on the comment
    const editBtn = page.locator('button[title*="Edit" i], button[title*="Editar" i], button[title*="Modifica" i]').first();
    await editBtn.click();

    // Edit textarea should appear
    const editTextarea = page.locator('textarea');
    await expect(editTextarea).toBeVisible();
    const updatedText = `Updated thought ${timestamp}`;
    await editTextarea.fill(updatedText);

    // Click Save button
    const saveBtn = page.getByRole('button', { name: /Save|Guardar|Salva|Opslaan/i });
    await saveBtn.click();

    // Verify updated text
    await expect(page.locator(`text=${updatedText}`)).toBeVisible();

    // Click Delete icon button
    const deleteBtn = page.locator('button[title*="Delete" i], button[title*="Eliminar" i], button[title*="Elimina" i]').first();
    await deleteBtn.click();

    // Verify comment is removed
    await expect(page.locator(`text=${updatedText}`)).not.toBeVisible();
  });
});
