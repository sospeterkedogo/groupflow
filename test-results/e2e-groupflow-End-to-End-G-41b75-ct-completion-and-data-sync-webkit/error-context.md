# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: e2e-groupflow.spec.ts >> End-to-End: Group Project Flow >> Simulate 4 users: signup, group creation, project completion, and data sync
- Location: tests\e2e-groupflow.spec.ts:4:7

# Error details

```
Error: page.goto: Could not connect to server
Call log:
  - navigating to "http://localhost:3000/login", waiting until "load"

```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('End-to-End: Group Project Flow', () => {
  4  |   test('Simulate 4 users: signup, group creation, project completion, and data sync', async ({ page, browser }) => {
  5  |     // Simulate 4 users in parallel
  6  |     const users = [
  7  |       { email: 'user1@example.com', password: 'Test1234!' },
  8  |       { email: 'user2@example.com', password: 'Test1234!' },
  9  |       { email: 'user3@example.com', password: 'Test1234!' },
  10 |       { email: 'user4@example.com', password: 'Test1234!' },
  11 |     ];
  12 |     const contexts = await Promise.all(users.map(() => browser.newContext()));
  13 |     const pages = await Promise.all(contexts.map(ctx => ctx.newPage()));
  14 | 
  15 |     // 1. Each user signs up (on /login, toggle to signup mode)
  16 |     for (let i = 0; i < users.length; i++) {
> 17 |       await pages[i].goto('/login');
     |                      ^ Error: page.goto: Could not connect to server
  18 |       // Toggle to signup mode if not already
  19 |       const signupToggle = pages[i].locator('button', { hasText: "Sign up" });
  20 |       if (await signupToggle.isVisible()) {
  21 |         await signupToggle.click();
  22 |       }
  23 |       await pages[i].fill('input[name="email"]', users[i].email);
  24 |       await pages[i].fill('input[name="password"]', users[i].password);
  25 |       // Fill required ID field for signup
  26 |       await pages[i].fill('input[name="school_id"]', `ID-00${i + 1}`);
  27 |       // Accept legal terms
  28 |       const legalCheckbox = pages[i].locator('input[name="legal_accepted"]');
  29 |       if (await legalCheckbox.isVisible()) {
  30 |         await legalCheckbox.check();
  31 |       }
  32 |       await pages[i].click('button[type="submit"]');
  33 |       await expect(pages[i].locator('text=Dashboard')).toBeVisible();
  34 |     }
  35 | 
  36 |     // 2. User 1 creates a group
  37 |     await pages[0].click('button:has-text("Create Group")');
  38 |     await pages[0].fill('input[name="groupName"]', 'Test Group');
  39 |     await pages[0].click('button:has-text("Save")');
  40 |     await expect(pages[0].locator('text=Test Group')).toBeVisible();
  41 | 
  42 |     // 3. User 1 invites others
  43 |     for (let i = 1; i < users.length; i++) {
  44 |       await pages[0].click('button:has-text("Invite Members")');
  45 |       await pages[0].fill('input[name="inviteEmail"]', users[i].email);
  46 |       await pages[0].click('button:has-text("Send Invite")');
  47 |       await expect(pages[0].locator(`text=Invitation sent to ${users[i].email}`)).toBeVisible();
  48 |     }
  49 | 
  50 |     // 4. Other users accept invite
  51 |     for (let i = 1; i < users.length; i++) {
  52 |       await pages[i].goto('/groups');
  53 |       await pages[i].click('button:has-text("Accept Invite")');
  54 |       await expect(pages[i].locator('text=Test Group')).toBeVisible();
  55 |     }
  56 | 
  57 |     // 5. All users add tasks and complete project
  58 |     for (let i = 0; i < users.length; i++) {
  59 |       await pages[i].goto('/groups/test-group');
  60 |       await pages[i].click('button:has-text("Add Task")');
  61 |       await pages[i].fill('input[name="taskName"]', `Task for ${users[i].email}`);
  62 |       await pages[i].click('button:has-text("Save Task")');
  63 |       await expect(pages[i].locator(`text=Task for ${users[i].email}`)).toBeVisible();
  64 |       await pages[i].click(`button:has-text("Complete")`);
  65 |       await expect(pages[i].locator('text=Completed')).toBeVisible();
  66 |     }
  67 | 
  68 |     // 6. Validate all data is synced and visible to all users
  69 |     for (let i = 0; i < users.length; i++) {
  70 |       await pages[i].goto('/groups/test-group');
  71 |       for (let j = 0; j < users.length; j++) {
  72 |         await expect(pages[i].locator(`text=Task for ${users[j].email}`)).toBeVisible();
  73 |         await expect(pages[i].locator('text=Completed')).toBeVisible();
  74 |       }
  75 |     }
  76 | 
  77 |     // Cleanup: close all contexts
  78 |     await Promise.all(contexts.map(ctx => ctx.close()));
  79 |   });
  80 | });
  81 | 
```