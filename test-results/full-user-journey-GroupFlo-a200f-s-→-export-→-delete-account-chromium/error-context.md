# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: full-user-journey.spec.ts >> GroupFlow2026 — Full User Journey >> sign up → team → tasks → analytics → export → delete account
- Location: tests\full-user-journey.spec.ts:291:7

# Error details

```
Error: expect(page).toHaveURL(expected) failed

Expected pattern: /^http:\/\/localhost:3000\/dashboard$/
Received string:  "http://localhost:3000/dashboard/join"
Timeout: 120000ms

Call log:
  - Expect "toHaveURL" with timeout 120000ms
    102 × unexpected value "http://localhost:3000/dashboard/join"

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - complementary [ref=e4]:
      - generic [ref=e5]:
        - generic [ref=e6]:
          - button "GroupFlow" [ref=e7] [cursor=pointer]
          - generic [ref=e10]: 1 ACTIVE
          - button [ref=e13] [cursor=pointer]:
            - img [ref=e14]
        - button "Collapse Sidebar" [ref=e17] [cursor=pointer]:
          - img [ref=e18]
      - button "Search workspace... ⌘K" [ref=e21] [cursor=pointer]:
        - img [ref=e22]
        - generic [ref=e25]: Search workspace...
        - generic [ref=e26]: ⌘K
      - navigation [ref=e27]:
        - button "Dashboard" [ref=e28] [cursor=pointer]:
          - img [ref=e29]
          - generic [ref=e34]: Dashboard
        - button "Teammates" [ref=e35] [cursor=pointer]:
          - img [ref=e36]
          - generic [ref=e41]: Teammates
        - button "Resources" [ref=e42] [cursor=pointer]:
          - img [ref=e43]
          - generic [ref=e46]: Resources
        - button "Jukebox" [ref=e47] [cursor=pointer]:
          - img [ref=e48]
          - generic [ref=e52]: Jukebox
        - button "Break Room" [ref=e53] [cursor=pointer]:
          - img [ref=e54]
          - generic [ref=e57]: Break Room
        - button "Project Stats" [ref=e58] [cursor=pointer]:
          - img [ref=e59]
          - generic [ref=e61]: Project Stats
        - button "Plans" [ref=e62] [cursor=pointer]:
          - img [ref=e63]
          - generic [ref=e65]: Plans
        - button "My Profile" [ref=e66] [cursor=pointer]:
          - img [ref=e67]
          - generic [ref=e71]: My Profile
        - button "Settings" [ref=e72] [cursor=pointer]:
          - img [ref=e73]
          - generic [ref=e76]: Settings
      - generic [ref=e77]:
        - generic [ref=e78]:
          - img [ref=e80]
          - generic [ref=e83]:
            - generic [ref=e84]: Vault Verified
            - generic [ref=e85]: Optimal Connectivity
        - generic [ref=e86]:
          - generic [ref=e87]: "Node: GF-2026-X"
          - img [ref=e88]
      - generic [ref=e91]:
        - generic [ref=e92] [cursor=pointer]:
          - img "User avatar" [ref=e94]
          - generic [ref=e95]:
            - generic [ref=e96]: E2E Scholar 47050931
            - generic [ref=e97]: Session Active
        - generic [ref=e98]:
          - button "Toggle Aesthetics" [ref=e99] [cursor=pointer]:
            - img [ref=e100]
          - button "End Session" [ref=e102] [cursor=pointer]:
            - img [ref=e103]
    - main [ref=e106]:
      - main [ref=e107]:
        - generic [ref=e108]:
          - generic [ref=e109]:
            - generic [ref=e110]:
              - img [ref=e111]
              - heading "Create Team" [level=2] [ref=e112]
            - paragraph [ref=e113]: Start a new workspace for your academic module or project.
            - generic [ref=e114]:
              - generic [ref=e115]:
                - generic [ref=e116]: "Workspace Name:"
                - textbox "Workspace Name:" [ref=e117]:
                  - /placeholder: e.g. Apollo Project
                  - text: E2E Workspace 47050931
              - generic [ref=e118]:
                - generic [ref=e119]: "Module Code (e.g. CS50):"
                - textbox "Module Code (e.g. CS50):" [ref=e120]:
                  - /placeholder: e.g. CS-501-A
                  - text: E2E-47050931
              - generic [ref=e121]:
                - generic [ref=e122]: "Access Password:"
                - textbox "Access Password:" [ref=e123]:
                  - /placeholder: Set a workspace password
                  - text: JoinTest@2026
              - generic [ref=e124]:
                - generic [ref=e125]: "Max Capacity:"
                - spinbutton "Max Capacity:" [ref=e126]: "5"
              - button "Processing..." [disabled] [ref=e127]:
                - generic [ref=e129]: Processing...
          - generic [ref=e130]:
            - generic [ref=e131]:
              - img [ref=e132]
              - heading "Join Team" [level=2] [ref=e136]
            - paragraph [ref=e137]: Connect to an existing project team using the module code and password provided by your team lead.
            - generic [ref=e138]:
              - generic [ref=e139]:
                - generic [ref=e140]: "Module Code:"
                - textbox "Module Code:" [ref=e141]:
                  - /placeholder: e.g. CS-501-A
              - generic [ref=e142]:
                - generic [ref=e143]: "Join Password:"
                - textbox "Join Password:" [ref=e144]:
                  - /placeholder: Enter group password
              - button "Join Team" [ref=e145] [cursor=pointer]
    - generic [ref=e146] [cursor=pointer]:
      - img [ref=e147]
      - generic [ref=e151]: Connect Spotify
  - img
  - button "Open Next.js Dev Tools" [ref=e157] [cursor=pointer]:
    - generic [ref=e160]:
      - text: Rendering
      - generic [ref=e161]:
        - generic [ref=e162]: .
        - generic [ref=e163]: .
        - generic [ref=e164]: .
  - alert [ref=e165]
  - iframe
```

# Test source

```ts
  446 |     await page.route(`${SUPABASE_URL}/rest/v1/platform_config**`, async (route) => {
  447 |       if (route.request().method() === 'GET') {
  448 |         await route.fulfill({ status: 200, contentType: 'application/json', body: 'null' })
  449 |       } else {
  450 |         await route.continue()
  451 |       }
  452 |     })
  453 |     // Mock user_connections (ConnectionAlertTray)
  454 |     await page.route(`${SUPABASE_URL}/rest/v1/user_connections**`, async (route) => {
  455 |       if (route.request().method() === 'GET') {
  456 |         await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
  457 |       } else {
  458 |         await route.continue()
  459 |       }
  460 |     })
  461 | 
  462 |     const profilePatchRes = await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}`, {
  463 |       method: 'PATCH',
  464 |       headers: {
  465 |         'Content-Type': 'application/json',
  466 |         'apikey': SERVICE_ROLE_KEY,
  467 |         'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
  468 |         'Prefer': 'return=minimal',
  469 |       },
  470 |       body: JSON.stringify({ full_name: FULL_NAME, avatar_url: PRESET_AVATAR }),
  471 |     })
  472 |     if (profilePatchRes.ok) {
  473 |       console.log(`      ✓ Profile pre-populated (full_name + avatar_url set to skip onboarding)`)
  474 |     } else {
  475 |       console.warn(`      Profile pre-populate failed: ${profilePatchRes.status} — ${await profilePatchRes.text()}`)
  476 |     }
  477 | 
  478 |     await page.goto('/dashboard', { waitUntil: 'commit', timeout: 90_000 })
  479 |     console.log(`      post-goto URL: ${page.url()}`)
  480 |     await waitForDashboard(page)
  481 |     await dismissDevOverlay(page)
  482 |     console.log(`[1/10] ✓ Signed in successfully (session injection)`)
  483 | 
  484 |     // ── 2. UPDATE PROFILE ───────────────────────────────────────────
  485 |     console.log(`[2/10] Updating profile settings`)
  486 |     await clientNav(page, 'Settings', '/dashboard/settings', /\/dashboard\/settings/)
  487 |     await dismissDevOverlay(page)
  488 | 
  489 |     // Confirm Settings page loaded (profile pre-populated → no onboarding modal)
  490 |     await expect(page.locator('h1:has-text("Settings")')).toBeVisible({ timeout: 90_000 })
  491 | 
  492 |     // Wait for the profile form to be populated from ProfileContext (fetchUserData completes async).
  493 |     // Full name is set from the mocked profile row (mockProfileRow.full_name = FULL_NAME).
  494 |     // When the input has this value, both fetchUserData and refreshProfile() have completed.
  495 |     const fullNameInput = page.locator('input[placeholder="Full Name"]')
  496 |     await expect(fullNameInput).toHaveValue(FULL_NAME, { timeout: 60_000 })
  497 | 
  498 |     // Also wait for the Update Settings button to be enabled (not disabled)
  499 |     await expect(page.locator('button:has-text("Update Settings")')).toBeEnabled({ timeout: 30_000 })
  500 | 
  501 |     // Refill Full Name (clear then fill to trigger React onChange)
  502 |     await fullNameInput.clear()
  503 |     await fullNameInput.fill(FULL_NAME)
  504 | 
  505 |     // Click Save / Update Settings
  506 |     await page.click('button:has-text("Update Settings")')
  507 |     // Wait for either toast (success) or error message (and log it)
  508 |     await expect(
  509 |       page.locator('text=Profile Synchronized').or(page.locator('text=Identity Sync Error'))
  510 |     ).toBeVisible({ timeout: 60_000 })
  511 |     const hasError = await page.locator('text=Identity Sync Error').isVisible()
  512 |     if (hasError) {
  513 |       const errorText = await page.locator('[data-testid="error-message"], .error-message, [class*="error"]').first().textContent().catch(() => 'unknown error')
  514 |       console.warn(`      [2/10] Profile save returned an error: ${errorText}`)
  515 |     }
  516 |     console.log(`[2/10] ✓ Profile updated`)
  517 | 
  518 |     // ── 3. CREATE TEAM ──────────────────────────────────────────────
  519 |     console.log(`[3/10] Creating team: ${TEAM_NAME}`)
  520 |     // Navigate back to dashboard home first (client-side via sidebar)
  521 |     await clientNav(page, 'Dashboard', '/dashboard', /^http:\/\/localhost:3000\/dashboard$/)
  522 |     // The dashboard shows a "Join or Create Team" link (Next.js <Link>) when group_id is null.
  523 |     // Clicking it uses client-side navigation — avoids a full server render of dashboard/layout.tsx.
  524 |     const joinLink = page.locator('a[href="/dashboard/join"], a:has-text("Join or Create Team")')
  525 |     await expect(joinLink).toBeVisible({ timeout: 30_000 })
  526 |     await joinLink.click()
  527 |     await dismissDevOverlay(page)
  528 |     await expect(page).toHaveURL(/\/dashboard\/join/, { timeout: 90_000 })
  529 |     await expect(page.locator('h2:has-text("Create Team")')).toBeVisible({ timeout: 90_000 })
  530 | 
  531 |     await page.fill('input[id="name"]', TEAM_NAME)
  532 |     await page.fill('input[id="module_code"]', MODULE_CODE)
  533 |     await page.fill('input[id="create_join_password"]', JOIN_PASSWORD)
  534 | 
  535 |     // Set up Liveblocks auth mock BEFORE the form submits so the Kanban board
  536 |     // gets a valid token immediately on redirect (instead of waiting for the slow
  537 |     // Next.js route which calls server-side Supabase getUser).
  538 |     await mockLiveblocksAuth(page, userId, FULL_NAME, PRESET_AVATAR)
  539 | 
  540 |     // Default capacity is 5 — accept it
  541 |     await page.click('button:has-text("Create Workspace")')
  542 | 
  543 |     // Wait for redirect away from /dashboard/join to exactly /dashboard
  544 |     // NOTE: waitForDashboard() uses /\/dashboard/ which also matches /dashboard/join.
  545 |     // Use an exact URL match to ensure the Server Action completed and redirected.
> 546 |     await expect(page).toHaveURL(/^http:\/\/localhost:3000\/dashboard$/, { timeout: 120_000 })
      |                        ^ Error: expect(page).toHaveURL(expected) failed
  547 | 
  548 |     // After team creation, fetch the real group_id from Supabase so we can update our mocks
  549 |     const profileAfterTeam = await fetch(
  550 |       `${SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}&select=group_id`,
  551 |       { headers: { 'apikey': SERVICE_ROLE_KEY, 'Authorization': `Bearer ${SERVICE_ROLE_KEY}` } }
  552 |     ).then(r => r.json()) as Array<{ group_id: string | null }>
  553 |     const realGroupId = profileAfterTeam?.[0]?.group_id
  554 |     console.log(`      Team group_id: ${realGroupId}`)
  555 | 
  556 |     // Fetch the real group record so DashboardHome shows the team name
  557 |     let realGroupRow: Record<string, unknown> | null = null
  558 |     if (realGroupId) {
  559 |       const groupRes = await fetch(
  560 |         `${SUPABASE_URL}/rest/v1/groups?id=eq.${realGroupId}`,
  561 |         { headers: { 'apikey': SERVICE_ROLE_KEY, 'Authorization': `Bearer ${SERVICE_ROLE_KEY}` } }
  562 |       ).then(r => r.json()) as Array<Record<string, unknown>>
  563 |       realGroupRow = groupRes?.[0] ?? null
  564 |     }
  565 | 
  566 |     // Update the groups mock to return the real group row
  567 |     await page.unroute(`${SUPABASE_URL}/rest/v1/groups**`)
  568 |     await page.route(`${SUPABASE_URL}/rest/v1/groups**`, async (route) => {
  569 |       if (route.request().method() === 'GET') {
  570 |         const acceptHeader = route.request().headers()['accept'] || ''
  571 |         const isSingle = acceptHeader.includes('pgrst.object')
  572 |         const body = realGroupRow
  573 |           ? (isSingle ? JSON.stringify(realGroupRow) : JSON.stringify([realGroupRow]))
  574 |           : (isSingle ? 'null' : '[]')
  575 |         await route.fulfill({ status: 200, contentType: 'application/json', body })
  576 |       } else {
  577 |         await route.continue()
  578 |       }
  579 |     })
  580 | 
  581 |     // Update the profiles mock to include the real group_id
  582 |     const updatedProfileRow = { ...mockProfileRow, group_id: realGroupId }
  583 |     await page.unroute(`${SUPABASE_URL}/rest/v1/profiles**`)
  584 |     await page.route(`${SUPABASE_URL}/rest/v1/profiles**`, async (route) => {
  585 |       if (route.request().method() === 'GET') {
  586 |         const acceptHeader = route.request().headers()['accept'] || ''
  587 |         const isSingle = acceptHeader.includes('pgrst.object')
  588 |         const body = isSingle ? JSON.stringify(updatedProfileRow) : JSON.stringify([updatedProfileRow])
  589 |         await route.fulfill({ status: 200, contentType: 'application/json', body })
  590 |       } else {
  591 |         await route.continue()
  592 |       }
  593 |     })
  594 | 
  595 |     // Verify team roster is visible (always present when DashboardHome renders with a group)
  596 |     await expect(page.locator('text=Team Roster')).toBeVisible({ timeout: 90_000 })
  597 |     console.log(`[3/10] ✓ Team created: ${TEAM_NAME} (group_id: ${realGroupId})`)
  598 | 
  599 |     // ── 4. CREATE 3 TASKS ───────────────────────────────────────────
  600 |     console.log(`[4/10] Creating ${TASKS.length} tasks on the Kanban board`)
  601 | 
  602 |     // Wait for Kanban board to be ready (Liveblocks connected + storageTasks initialised)
  603 |     // "Loading board..." disappears when storageTasks !== null
  604 |     await expect(page.locator('text=Loading board...')).not.toBeVisible({ timeout: 60_000 })
  605 |     await expect(page.locator('[aria-label="Create a new task"]')).toBeVisible({ timeout: 30_000 })
  606 | 
  607 |     for (const task of TASKS) {
  608 |       console.log(`      Creating task: "${task.title}"`)
  609 |       await createTask(page, task.title, task.category, task.initialStatus)
  610 |       await page.waitForTimeout(800) // brief stabilisation between task creations
  611 |     }
  612 | 
  613 |     // Verify all 3 task titles visible on board
  614 |     for (const task of TASKS) {
  615 |       await expect(page.locator(`text=${task.title}`).first()).toBeVisible({ timeout: 15_000 })
  616 |     }
  617 |     console.log(`[4/10] ✓ All 3 tasks created`)
  618 | 
  619 |     // ── 5. MOVE TASKS THROUGH STATUSES ──────────────────────────────
  620 |     console.log(`[5/10] Updating task statuses`)
  621 | 
  622 |     // Move Alpha task → In Progress (click it, change status in modal, save)
  623 |     await page.click(`text=${TASKS[0].title}`)
  624 |     await expect(page.locator('.modal-content')).toBeVisible({ timeout: 8_000 })
  625 |     await page.locator('.modal-content select').nth(0).selectOption('In Progress')
  626 |     await page.click('button:has-text("Save Task")')
  627 |     await expect(page.locator('.modal-overlay')).not.toBeVisible({ timeout: 10_000 })
  628 |     console.log(`      ✓ Alpha Task → In Progress`)
  629 | 
  630 |     // Move Gamma task → Done
  631 |     await page.click(`text=${TASKS[2].title}`)
  632 |     await expect(page.locator('.modal-content')).toBeVisible({ timeout: 8_000 })
  633 |     await page.locator('.modal-content select').nth(0).selectOption('Done')
  634 |     await page.click('button:has-text("Save Task")')
  635 |     await expect(page.locator('.modal-overlay')).not.toBeVisible({ timeout: 10_000 })
  636 |     console.log(`      ✓ Gamma Task → Done`)
  637 |     console.log(`[5/10] ✓ Task statuses updated`)
  638 | 
  639 |     // ── 6. VIEW ANALYTICS PAGE & VERIFY KPIs ────────────────────────
  640 |     console.log(`[6/10] Navigating to analytics page`)
  641 |     await clientNav(page, 'Project Stats', '/dashboard/analytics', /\/dashboard\/analytics/, 90_000)
  642 |     await dismissDevOverlay(page)
  643 | 
  644 |     // Should redirect to /dashboard/analytics/<groupId>
  645 |     await expect(page).toHaveURL(/\/dashboard\/analytics\/[a-f0-9-]+/, { timeout: 90_000 })
  646 |     const analyticsUrl = page.url()
```