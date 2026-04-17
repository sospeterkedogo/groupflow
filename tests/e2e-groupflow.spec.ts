import { test, expect } from '@playwright/test';

test.describe('End-to-End: Group Project Flow', () => {
  test('Simulate 4 users: signup, group creation, project completion, and data sync', async ({ page, browser }) => {
    // Simulate 4 users in parallel
    const users = [
      { email: 'user1@example.com', password: 'Test1234!' },
      { email: 'user2@example.com', password: 'Test1234!' },
      { email: 'user3@example.com', password: 'Test1234!' },
      { email: 'user4@example.com', password: 'Test1234!' },
    ];
    const contexts = await Promise.all(users.map(() => browser.newContext()));
    const pages = await Promise.all(contexts.map(ctx => ctx.newPage()));

    // 1. Each user signs up (on /login, toggle to signup mode)
    for (let i = 0; i < users.length; i++) {
      await pages[i].goto('/login');
      // Toggle to signup mode if not already
      const signupToggle = pages[i].locator('button', { hasText: "Sign up" });
      if (await signupToggle.isVisible()) {
        await signupToggle.click();
      }
      await pages[i].fill('input[name="email"]', users[i].email);
      await pages[i].fill('input[name="password"]', users[i].password);
      // Fill required ID field for signup
      await pages[i].fill('input[name="school_id"]', `ID-00${i + 1}`);
      // Accept legal terms
      const legalCheckbox = pages[i].locator('input[name="legal_accepted"]');
      if (await legalCheckbox.isVisible()) {
        await legalCheckbox.check();
      }
      await pages[i].click('button[type="submit"]');
      await expect(pages[i].locator('text=Dashboard')).toBeVisible();
    }

    // 2. User 1 creates a group
    await pages[0].click('button:has-text("Create Group")');
    await pages[0].fill('input[name="groupName"]', 'Test Group');
    await pages[0].click('button:has-text("Save")');
    await expect(pages[0].locator('text=Test Group')).toBeVisible();

    // 3. User 1 invites others
    for (let i = 1; i < users.length; i++) {
      await pages[0].click('button:has-text("Invite Members")');
      await pages[0].fill('input[name="inviteEmail"]', users[i].email);
      await pages[0].click('button:has-text("Send Invite")');
      await expect(pages[0].locator(`text=Invitation sent to ${users[i].email}`)).toBeVisible();
    }

    // 4. Other users accept invite
    for (let i = 1; i < users.length; i++) {
      await pages[i].goto('/groups');
      await pages[i].click('button:has-text("Accept Invite")');
      await expect(pages[i].locator('text=Test Group')).toBeVisible();
    }

    // 5. All users add tasks and complete project
    for (let i = 0; i < users.length; i++) {
      await pages[i].goto('/groups/test-group');
      await pages[i].click('button:has-text("Add Task")');
      await pages[i].fill('input[name="taskName"]', `Task for ${users[i].email}`);
      await pages[i].click('button:has-text("Save Task")');
      await expect(pages[i].locator(`text=Task for ${users[i].email}`)).toBeVisible();
      await pages[i].click(`button:has-text("Complete")`);
      await expect(pages[i].locator('text=Completed')).toBeVisible();
    }

    // 6. Validate all data is synced and visible to all users
    for (let i = 0; i < users.length; i++) {
      await pages[i].goto('/groups/test-group');
      for (let j = 0; j < users.length; j++) {
        await expect(pages[i].locator(`text=Task for ${users[j].email}`)).toBeVisible();
        await expect(pages[i].locator('text=Completed')).toBeVisible();
      }
    }

    // Cleanup: close all contexts
    await Promise.all(contexts.map(ctx => ctx.close()));
  });
});
