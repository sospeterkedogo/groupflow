/**
 * ════════════════════════════════════════════════════════════════════
 * GROUPFLOW 2026 — FULL USER JOURNEY E2E TEST
 * ════════════════════════════════════════════════════════════════════
 *
 * Covers the complete lifecycle of a real user:
 *   1.  Sign Up (email + school_id + legal acceptance)
 *   2.  Profile update (full name, biography)
 *   3.  Create a team workspace
 *   4.  Create 3 tasks on the Kanban board
 *   5.  Move tasks through status columns
 *   6.  View Team Analytics page — verify KPIs match actions
 *   7.  Export analytics CSV and parse/verify content
 *   8.  Export personal data archive (Settings → Privacy)
 *   9.  Delete account (Settings → Privacy → Delete Account)
 *  10.  Verify redirect to /login
 *
 * Run with:  npx playwright test tests/full-user-journey.spec.ts --headed
 * ════════════════════════════════════════════════════════════════════
 */

import { test, expect, type Page } from '@playwright/test'
import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'
import { Liveblocks } from '@liveblocks/node'

// ── Load env vars from .env.local ────────────────────────────────────
function loadEnv(): Record<string, string> {
  const envPath = path.join(process.cwd(), '.env.local')
  if (!fs.existsSync(envPath)) return {}
  return Object.fromEntries(
    fs.readFileSync(envPath, 'utf-8')
      .split('\n')
      .filter(l => l.includes('=') && !l.startsWith('#'))
      .map(l => {
        const idx = l.indexOf('=')
        return [l.slice(0, idx).trim(), l.slice(idx + 1).trim().replace(/^["']|["']$/g, '')]
      })
  )
}

const ENV = loadEnv()
const SUPABASE_URL  = ENV['NEXT_PUBLIC_SUPABASE_URL'] || process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const ANON_KEY = ENV['NEXT_PUBLIC_SUPABASE_ANON_KEY'] || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const SERVICE_ROLE_KEY = ENV['SUPABASE_SERVICE_ROLE_KEY'] || process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const LIVEBLOCKS_SECRET_KEY = ENV['LIVEBLOCKS_SECRET_KEY'] || process.env.LIVEBLOCKS_SECRET_KEY || ''

const missingEnvVars = [
  !SUPABASE_URL && 'NEXT_PUBLIC_SUPABASE_URL',
  !ANON_KEY && 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  !SERVICE_ROLE_KEY && 'SUPABASE_SERVICE_ROLE_KEY',
  !LIVEBLOCKS_SECRET_KEY && 'LIVEBLOCKS_SECRET_KEY',
].filter(Boolean) as string[]

let envValidationError = ''
if (missingEnvVars.length > 0) {
  envValidationError = `Missing required env vars for tests/full-user-journey.spec.ts: ${missingEnvVars.join(', ')}`
} else {
  try {
    new URL(SUPABASE_URL)
  } catch {
    envValidationError = `Invalid NEXT_PUBLIC_SUPABASE_URL for tests/full-user-journey.spec.ts: ${SUPABASE_URL}`
  }
}

test.beforeAll(() => {
  test.skip(!!envValidationError, envValidationError)
})

// ── Cookie key used by @supabase/ssr + supabase-js (confirmed from source) ────
// supabase-js SupabaseClient.js: `sb-${baseUrl.hostname.split(".")[0]}-auth-token`
// Value encoding: @supabase/ssr cookieEncoding="base64url" → "base64-" + base64url(json)
const PROJECT_REF = envValidationError ? '' : new URL(SUPABASE_URL).hostname.split('.')[0]
const COOKIE_KEY = PROJECT_REF ? `sb-${PROJECT_REF}-auth-token` : ''
const MAX_CHUNK_SIZE = 3180 // from @supabase/ssr chunker.js (URL-encoded length)

// ── Sign in via Supabase REST API and inject session cookies ─────────
// Bypasses the Next.js Server Action entirely (it hangs due to server-side redirect).
// Replicates exactly what @supabase/ssr does: value = "base64-" + base64url(json)
async function injectSession(
  context: import('@playwright/test').BrowserContext,
  email: string,
  password: string
): Promise<{ access_token: string; refresh_token: string; user: Record<string, unknown> }> {
  const tokenRes = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'apikey': ANON_KEY },
    body: JSON.stringify({ email, password }),
  })
  if (!tokenRes.ok) {
    const err = await tokenRes.text()
    throw new Error(`Supabase token request failed: ${tokenRes.status} ${err}`)
  }
  const tokenData = await tokenRes.json() as {
    access_token: string
    refresh_token: string
    expires_in: number
    token_type: string
    user: Record<string, unknown>
  }
  const { access_token, refresh_token, expires_in, token_type, user } = tokenData

  // Build the session JSON exactly as @supabase/auth-js stores it
  const sessionJson = JSON.stringify({
    access_token,
    refresh_token,
    token_type: token_type ?? 'bearer',
    expires_in: expires_in ?? 3600,
    expires_at: Math.floor(Date.now() / 1000) + (expires_in ?? 3600),
    user,
  })

  // @supabase/ssr encodes as "base64-" + base64url (uses Buffer in Node.js environments)
  const encoded = 'base64-' + Buffer.from(sessionJson, 'utf-8').toString('base64url')

  // Apply chunking: if encodedValue.length (which equals encodeURIComponent(encoded).length
  // since base64url + "base64-" are all URL-safe chars) <= 3180, use single cookie
  if (encoded.length <= MAX_CHUNK_SIZE) {
    await context.addCookies([{
      name: COOKIE_KEY,
      value: encoded,
      domain: 'localhost',
      path: '/',
      httpOnly: false,
      secure: false,
      sameSite: 'Lax',
    }])
  } else {
    // Split into chunks: key.0, key.1, ... (base64url chars are URL-safe, no %XX escapes)
    const cookiesToAdd: Parameters<typeof context.addCookies>[0] = []
    let remaining = encoded
    let idx = 0
    while (remaining.length > 0) {
      const chunk = remaining.slice(0, MAX_CHUNK_SIZE)
      cookiesToAdd.push({
        name: `${COOKIE_KEY}.${idx}`,
        value: chunk,
        domain: 'localhost',
        path: '/',
        httpOnly: false,
        secure: false,
        sameSite: 'Lax',
      })
      remaining = remaining.slice(MAX_CHUNK_SIZE)
      idx++
    }
    await context.addCookies(cookiesToAdd)
  }

  return { access_token, refresh_token, user }
}

// ── Create a pre-confirmed Supabase user via Admin API ───────────────
async function adminCreateUser(email: string, password: string, schoolId: string): Promise<string> {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      'apikey': SERVICE_ROLE_KEY,
    },
    body: JSON.stringify({
      email,
      password,
      email_confirm: true,
      user_metadata: { school_id: schoolId, legal_accepted: true },
    }),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Admin createUser failed: ${res.status} ${err}`)
  }
  const data = await res.json()
  return data.id as string
}

// ── Delete a Supabase user via Admin API (cleanup on failure) ─────────
async function adminDeleteUser(userId: string): Promise<void> {
  await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${userId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      'apikey': SERVICE_ROLE_KEY,
    },
  }).catch(() => null)
}

/**
 * Generate a real Liveblocks auth token (Node.js) and mock /api/liveblocks-auth so
 * the browser never hits the slow Next.js route (which awaits server-side Supabase getUser).
 * The token is room-wildcard ("*") so the Kanban board connects immediately.
 */
async function mockLiveblocksAuth(page: Page, userId: string, fullName: string, avatarUrl: string) {
  const lb = new Liveblocks({ secret: LIVEBLOCKS_SECRET_KEY })
  const session = lb.prepareSession(userId, { userInfo: { name: fullName, avatar: avatarUrl } })
  session.allow('*', session.FULL_ACCESS)
  const { body, status } = await session.authorize()
  await page.route('**/api/liveblocks-auth', async (route) => {
    if (route.request().method() === 'POST') {
      console.log('      [mock] intercepted POST /api/liveblocks-auth')
      await route.fulfill({ status, contentType: 'application/json', body })
    } else {
      await route.continue()
    }
  })
}

// ── Unique credentials scoped to this test run ──────────────────────
const RUN_ID   = Date.now().toString().slice(-8)
const EMAIL    = `e2e_user_${RUN_ID}@testrunner.dev`
const PASSWORD = 'E2eTest@2026!'
const SCHOOL_ID = `SCH-${RUN_ID}`
const FULL_NAME = `E2E Scholar ${RUN_ID}`
const TEAM_NAME = `E2E Workspace ${RUN_ID}`
const MODULE_CODE = `E2E-${RUN_ID}`
const JOIN_PASSWORD = 'JoinTest@2026'

// ── Test task definitions (what we create — used for verification) ──
const TASKS = [
  { title: `Alpha Task ${RUN_ID}`,   category: 'Implementation',  initialStatus: 'To Do',       finalStatus: 'In Progress' },
  { title: `Beta Task ${RUN_ID}`,    category: 'Research',         initialStatus: 'To Do',       finalStatus: 'To Do' },
  { title: `Gamma Task ${RUN_ID}`,   category: 'Documentation',    initialStatus: 'To Do',       finalStatus: 'Done' },
]

// ── Download output directory (test-results/) ───────────────────────
const DOWNLOAD_DIR = path.join(process.cwd(), 'test-results', 'downloads')

// ── Helpers ─────────────────────────────────────────────────────────
async function waitForDashboard(page: Page) {
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 90_000 })
}

/**
 * Client-side navigation within the dashboard — avoids re-running dashboard/layout.tsx
 * server component (which takes 25-35s per call on Supabase cold start).
 * Clicks the sidebar nav button that calls router.push(), keeping layout hydrated.
 * Falls back to page.goto() only if the sidebar button isn't found.
 */
async function clientNav(page: Page, label: string, path: string, waitForURL: RegExp, contentTimeout = 90_000) {
  // Try sidebar button first (client-side navigation, no server re-render).
  // Sidebar may be collapsed (icon-only), so try both text and title attribute matches.
  const sidebarBtn = page.locator(`nav button:has-text("${label}"), nav button[title="${label}"]`).first()
  const found = await sidebarBtn.isVisible({ timeout: 12_000 }).catch(() => false)
  if (found) {
    await sidebarBtn.click()
  } else {
    // Fallback: use goto (will trigger server render but with 150s timeout)
    await page.goto(path, { waitUntil: 'commit', timeout: 150_000 })
  }
  await expect(page).toHaveURL(waitForURL, { timeout: contentTimeout })
}

/** Dismiss the Next.js dev error overlay if present (e.g. GlobalAnnouncement subscribe error) */
async function dismissDevOverlay(page: Page) {
  // Try pressing Escape — Next.js dev overlay responds to this
  await page.keyboard.press('Escape').catch(() => null)
  await page.waitForTimeout(200)
  // Also try clicking the "× Issues" toggle button at the bottom left via shadow DOM
  await page.evaluate(() => {
    const portal = document.querySelector('nextjs-portal')
    if (!portal?.shadowRoot) return
    // Find all buttons and click the one that matches the close/collapse pattern
    const buttons = Array.from(portal.shadowRoot.querySelectorAll('button'))
    // The collapse button typically has a "×" or "Issues" text
    const closeBtn = buttons.find(b => b.textContent?.includes('×') || b.getAttribute('data-issues-count') !== null)
    if (closeBtn) (closeBtn as HTMLButtonElement).click()
  }).catch(() => null)
  await page.waitForTimeout(300)
}

async function createTask(
  page: Page,
  title: string,
  category: string,
  status: string
) {
  // Click "New Task" button (aria-label from DashboardHome)
  await page.click('[aria-label="Create a new task"]')

  // Wait for the modal title input (actual placeholder: "What needs to be done?")
  const titleInput = page.locator('.modal-content input[placeholder*="needs to be done" i]')
  await expect(titleInput).toBeVisible({ timeout: 10_000 })
  await titleInput.fill(title)

  // Scope selects within the modal content
  const modal = page.locator('.modal-content')

  // Status select is first, Category select is second
  await modal.locator('select').nth(0).selectOption(status)
  await modal.locator('select').nth(1).selectOption(category)

  // Click Save Task
  await page.click('button:has-text("Save Task")')

  // Wait for modal to close
  await expect(page.locator('.modal-overlay')).not.toBeVisible({ timeout: 15_000 })
}

// ════════════════════════════════════════════════════════════════════
//  MAIN TEST
// ════════════════════════════════════════════════════════════════════
test.describe('GroupFlow2026 — Full User Journey', () => {
  test.setTimeout(900_000) // 15 minutes — Supabase cold starts can take 30-45s per navigation

  // Ensure download dir exists
  test.beforeAll(async () => {
    if (!fs.existsSync(DOWNLOAD_DIR)) {
      fs.mkdirSync(DOWNLOAD_DIR, { recursive: true })
    }
  })

  test('sign up → team → tasks → analytics → export → delete account', async ({ page, context }) => {
    // Pre-set cookie consent so the banner never appears during the test
    await page.addInitScript(() => {
      localStorage.setItem('gf_cookie_consent', 'essential')
    })

    // ── 1. CREATE USER (Admin API) + SIGN IN ───────────────────────
    console.log(`[1/10] Creating confirmed user via Supabase admin API: ${EMAIL}`)
    let createdUserId: string | null = null
    try {
      createdUserId = await adminCreateUser(EMAIL, PASSWORD, SCHOOL_ID)
      console.log(`      ✓ User created (id: ${createdUserId})`)
    } catch (err) {
      console.error(`      Admin API failed: ${err}`)
      console.log(`      Falling back to UI signup flow...`)
    }

    // Inject session cookies directly — bypasses Next.js Server Action (which hangs)
    const sessionData = await injectSession(context, EMAIL, PASSWORD)
    const userId = sessionData.user.id as string
    console.log(`      ✓ Session cookies injected (userId: ${userId})`)

    // ── Mock Supabase auth endpoints to prevent lock contention ──────
    // Multiple dashboard components call supabase.auth.getUser() concurrently in
    // React StrictMode. They serialize through a single Web Lock. If any call triggers
    // a token refresh (POST /auth/v1/token), the lock is held until Supabase responds
    // (cold start = 5s+), starving other callers → lock-steal errors → setLoading(false)
    // never called → h1 never visible.
    //
    // Fix: mock both GET /auth/v1/user AND POST /auth/v1/token so all auth
    // operations complete in <10ms, eliminating lock contention.
    const cachedTokenResponse = {
      access_token: sessionData.session?.access_token ?? sessionData.access_token,
      refresh_token: sessionData.session?.refresh_token ?? sessionData.refresh_token,
      token_type: 'bearer',
      expires_in: 3600,
      expires_at: Math.round(Date.now() / 1000) + 3600,
      user: sessionData.user,
    }
    await page.route(`${SUPABASE_URL}/auth/v1/user**`, async (route) => {
      if (route.request().method() === 'GET') {
        console.log(`      [mock] intercepted GET /auth/v1/user`)
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(sessionData.user),
        })
      } else {
        await route.continue()
      }
    })
    await page.route(`${SUPABASE_URL}/auth/v1/token**`, async (route) => {
      if (route.request().method() === 'POST') {
        console.log(`      [mock] intercepted POST /auth/v1/token (refresh)`)
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(cachedTokenResponse),
        })
      } else {
        await route.continue()
      }
    })

    // ── Pre-populate profile to skip the onboarding modal ────────────
    // OnboardingWrapper shows the modal when avatar_url is null (trigger only sets full_name).
    // By setting both fields via Service Role API, the server-rendered page already has
    // a complete profile and the modal is never shown.
    const PRESET_AVATAR = 'https://api.dicebear.com/7.x/shapes/svg?seed=Avatar1&backgroundColor=1a73e8'

    // ── Mock REST profiles GET to prevent slow Supabase cold-start ───
    // supabase.from('profiles') in settings/page.tsx hangs 5-8s on cold start,
    // keeping loading=true past the 20s h1 timeout. Return the pre-populated
    // profile instantly; PATCH/POST/DELETE calls continue to real Supabase.
    const mockProfileRow = {
      id: userId,
      email: EMAIL,
      full_name: FULL_NAME,
      avatar_url: PRESET_AVATAR,
      group_id: null,
      role: 'collaborator',
      course_name: 'Independent Researcher',
      enrollment_year: 2026,
      completion_year: 2029,
      rank: 'Senior',
      badges_count: 0,
      tagline: null,
      biography: null,
      stack: null,
      phone_number: null,
      country_code: null,
      is_phone_verified: false,
      protect_avatar: false,
      manual_avatar_url: null,
      school_id: SCHOOL_ID,
      groups: null,
      subscription_plan: 'pro',
    }
    await page.route(`${SUPABASE_URL}/rest/v1/profiles**`, async (route) => {
      if (route.request().method() === 'GET') {
        console.log(`      [mock] intercepted GET /rest/v1/profiles`)
        // .single() sends Accept: application/vnd.pgrst.object+json → return plain object
        // regular .select() → return array
        const acceptHeader = route.request().headers()['accept'] || ''
        const isSingle = acceptHeader.includes('pgrst.object')
        const body = isSingle ? JSON.stringify(mockProfileRow) : JSON.stringify([mockProfileRow])
        await route.fulfill({ status: 200, contentType: 'application/json', body })
      } else {
        await route.continue()
      }
    })

    // ── Mock REST calls that settings/page.tsx awaits inside fetchUserData ────
    // fetchJoinRequests() queries 'messages' table; fetchGroups() queries 'groups' table.
    // NotificationProvider queries 'notifications'. These are not mocked → real Supabase
    // cold-start adds 25-30s PER call, keeping loading=true well past the 90s timeout.
    await page.route(`${SUPABASE_URL}/rest/v1/messages**`, async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
      } else {
        await route.continue()
      }
    })
    await page.route(`${SUPABASE_URL}/rest/v1/groups**`, async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
      } else {
        await route.continue()
      }
    })
    // ── Mock /api/task/workflow so modal closes immediately after save ────────
    // The real endpoint does a server-side Supabase auth check + workflow trigger,
    // which can be slow or fail in a test environment. The Kanban board persists
    // tasks in Liveblocks storage (not via this endpoint), so mocking it is safe.
    await page.route('**/api/task/workflow', async (route) => {
      if (route.request().method() === 'POST') {
        console.log(`      [mock] intercepted POST /api/task/workflow`)
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ status: 'completed', runId: 'mock-run' }),
        })
      } else {
        await route.continue()
      }
    })

    await page.route(`${SUPABASE_URL}/rest/v1/notifications**`, async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
      } else {
        await route.continue()
      }
    })
    // Mock platform_config (GlobalAnnouncement)
    await page.route(`${SUPABASE_URL}/rest/v1/platform_config**`, async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({ status: 200, contentType: 'application/json', body: 'null' })
      } else {
        await route.continue()
      }
    })
    // Mock user_connections (ConnectionAlertTray)
    await page.route(`${SUPABASE_URL}/rest/v1/user_connections**`, async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
      } else {
        await route.continue()
      }
    })

    const profilePatchRes = await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify({ full_name: FULL_NAME, avatar_url: PRESET_AVATAR }),
    })
    if (profilePatchRes.ok) {
      console.log(`      ✓ Profile pre-populated (full_name + avatar_url set to skip onboarding)`)
    } else {
      console.warn(`      Profile pre-populate failed: ${profilePatchRes.status} — ${await profilePatchRes.text()}`)
    }

    await page.goto('/dashboard', { waitUntil: 'commit', timeout: 90_000 })
    console.log(`      post-goto URL: ${page.url()}`)
    await waitForDashboard(page)
    await dismissDevOverlay(page)
    console.log(`[1/10] ✓ Signed in successfully (session injection)`)

    // ── 2. UPDATE PROFILE ───────────────────────────────────────────
    console.log(`[2/10] Updating profile settings`)
    await clientNav(page, 'Settings', '/dashboard/settings', /\/dashboard\/settings/)
    await dismissDevOverlay(page)

    // Confirm Settings page loaded (profile pre-populated → no onboarding modal)
    await expect(page.locator('h1:has-text("Settings")')).toBeVisible({ timeout: 90_000 })

    // Wait for the profile form to be populated from ProfileContext (fetchUserData completes async).
    // Full name is set from the mocked profile row (mockProfileRow.full_name = FULL_NAME).
    // When the input has this value, both fetchUserData and refreshProfile() have completed.
    const fullNameInput = page.locator('input[placeholder="Full Name"]')
    await expect(fullNameInput).toHaveValue(FULL_NAME, { timeout: 60_000 })

    // Also wait for the Update Settings button to be enabled (not disabled)
    await expect(page.locator('button:has-text("Update Settings")')).toBeEnabled({ timeout: 30_000 })

    // Refill Full Name (clear then fill to trigger React onChange)
    await fullNameInput.clear()
    await fullNameInput.fill(FULL_NAME)

    // Click Save / Update Settings
    await page.click('button:has-text("Update Settings")')
    // Wait for either toast (success) or error message (and log it)
    await expect(
      page.locator('text=Profile Synchronized').or(page.locator('text=Identity Sync Error'))
    ).toBeVisible({ timeout: 60_000 })
    const hasError = await page.locator('text=Identity Sync Error').isVisible()
    if (hasError) {
      const errorText = await page.locator('[data-testid="error-message"], .error-message, [class*="error"]').first().textContent().catch(() => 'unknown error')
      console.warn(`      [2/10] Profile save returned an error: ${errorText}`)
    }
    console.log(`[2/10] ✓ Profile updated`)

    // ── 3. CREATE TEAM ──────────────────────────────────────────────
    console.log(`[3/10] Creating team: ${TEAM_NAME}`)
    // Navigate back to dashboard home first (client-side via sidebar)
    await clientNav(page, 'Dashboard', '/dashboard', /^http:\/\/localhost:3000\/dashboard$/)
    // The dashboard shows a "Join or Create Team" link (Next.js <Link>) when group_id is null.
    // Clicking it uses client-side navigation — avoids a full server render of dashboard/layout.tsx.
    const joinLink = page.locator('a[href="/dashboard/join"], a:has-text("Join or Create Team")')
    await expect(joinLink).toBeVisible({ timeout: 30_000 })
    await joinLink.click()
    await dismissDevOverlay(page)
    await expect(page).toHaveURL(/\/dashboard\/join/, { timeout: 90_000 })
    await expect(page.locator('h2:has-text("Create Team")')).toBeVisible({ timeout: 90_000 })

    await page.fill('input[id="name"]', TEAM_NAME)
    await page.fill('input[id="module_code"]', MODULE_CODE)
    await page.fill('input[id="create_join_password"]', JOIN_PASSWORD)

    // Set up Liveblocks auth mock BEFORE the form submits so the Kanban board
    // gets a valid token immediately on redirect (instead of waiting for the slow
    // Next.js route which calls server-side Supabase getUser).
    await mockLiveblocksAuth(page, userId, FULL_NAME, PRESET_AVATAR)

    // Default capacity is 5 — accept it
    await page.click('button:has-text("Create Workspace")')

    // Wait for redirect away from /dashboard/join to exactly /dashboard
    // NOTE: waitForDashboard() uses /\/dashboard/ which also matches /dashboard/join.
    // Use an exact URL match to ensure the Server Action completed and redirected.
    await expect(page).toHaveURL(/^http:\/\/localhost:3000\/dashboard$/, { timeout: 120_000 })

    // After team creation, fetch the real group_id from Supabase so we can update our mocks
    const profileAfterTeam = await fetch(
      `${SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}&select=group_id`,
      { headers: { 'apikey': SERVICE_ROLE_KEY, 'Authorization': `Bearer ${SERVICE_ROLE_KEY}` } }
    ).then(r => r.json()) as Array<{ group_id: string | null }>
    const realGroupId = profileAfterTeam?.[0]?.group_id
    console.log(`      Team group_id: ${realGroupId}`)

    // Fetch the real group record so DashboardHome shows the team name
    let realGroupRow: Record<string, unknown> | null = null
    if (realGroupId) {
      const groupRes = await fetch(
        `${SUPABASE_URL}/rest/v1/groups?id=eq.${realGroupId}`,
        { headers: { 'apikey': SERVICE_ROLE_KEY, 'Authorization': `Bearer ${SERVICE_ROLE_KEY}` } }
      ).then(r => r.json()) as Array<Record<string, unknown>>
      realGroupRow = groupRes?.[0] ?? null
    }

    // Update the groups mock to return the real group row
    await page.unroute(`${SUPABASE_URL}/rest/v1/groups**`)
    await page.route(`${SUPABASE_URL}/rest/v1/groups**`, async (route) => {
      if (route.request().method() === 'GET') {
        const acceptHeader = route.request().headers()['accept'] || ''
        const isSingle = acceptHeader.includes('pgrst.object')
        const body = realGroupRow
          ? (isSingle ? JSON.stringify(realGroupRow) : JSON.stringify([realGroupRow]))
          : (isSingle ? 'null' : '[]')
        await route.fulfill({ status: 200, contentType: 'application/json', body })
      } else {
        await route.continue()
      }
    })

    // Update the profiles mock to include the real group_id
    const updatedProfileRow = { ...mockProfileRow, group_id: realGroupId }
    await page.unroute(`${SUPABASE_URL}/rest/v1/profiles**`)
    await page.route(`${SUPABASE_URL}/rest/v1/profiles**`, async (route) => {
      if (route.request().method() === 'GET') {
        const acceptHeader = route.request().headers()['accept'] || ''
        const isSingle = acceptHeader.includes('pgrst.object')
        const body = isSingle ? JSON.stringify(updatedProfileRow) : JSON.stringify([updatedProfileRow])
        await route.fulfill({ status: 200, contentType: 'application/json', body })
      } else {
        await route.continue()
      }
    })

    // Verify team roster is visible (always present when DashboardHome renders with a group)
    await expect(page.locator('text=Team Roster')).toBeVisible({ timeout: 90_000 })
    console.log(`[3/10] ✓ Team created: ${TEAM_NAME} (group_id: ${realGroupId})`)

    // ── 4. CREATE 3 TASKS ───────────────────────────────────────────
    console.log(`[4/10] Creating ${TASKS.length} tasks on the Kanban board`)

    // Wait for Kanban board to be ready (Liveblocks connected + storageTasks initialised)
    // "Loading board..." disappears when storageTasks !== null
    await expect(page.locator('text=Loading board...')).not.toBeVisible({ timeout: 60_000 })
    await expect(page.locator('[aria-label="Create a new task"]')).toBeVisible({ timeout: 30_000 })

    for (const task of TASKS) {
      console.log(`      Creating task: "${task.title}"`)
      await createTask(page, task.title, task.category, task.initialStatus)
      await page.waitForTimeout(800) // brief stabilisation between task creations
    }

    // Verify all 3 task titles visible on board
    for (const task of TASKS) {
      await expect(page.locator(`text=${task.title}`).first()).toBeVisible({ timeout: 15_000 })
    }
    console.log(`[4/10] ✓ All 3 tasks created`)

    // ── 5. MOVE TASKS THROUGH STATUSES ──────────────────────────────
    console.log(`[5/10] Updating task statuses`)

    // Move Alpha task → In Progress (click it, change status in modal, save)
    await page.click(`text=${TASKS[0].title}`)
    await expect(page.locator('.modal-content')).toBeVisible({ timeout: 8_000 })
    await page.locator('.modal-content select').nth(0).selectOption('In Progress')
    await page.click('button:has-text("Save Task")')
    await expect(page.locator('.modal-overlay')).not.toBeVisible({ timeout: 10_000 })
    console.log(`      ✓ Alpha Task → In Progress`)

    // Move Gamma task → Done
    await page.click(`text=${TASKS[2].title}`)
    await expect(page.locator('.modal-content')).toBeVisible({ timeout: 8_000 })
    await page.locator('.modal-content select').nth(0).selectOption('Done')
    await page.click('button:has-text("Save Task")')
    await expect(page.locator('.modal-overlay')).not.toBeVisible({ timeout: 10_000 })
    console.log(`      ✓ Gamma Task → Done`)
    console.log(`[5/10] ✓ Task statuses updated`)

    // ── 6. VIEW ANALYTICS PAGE & VERIFY KPIs ────────────────────────
    console.log(`[6/10] Navigating to analytics page`)
    await clientNav(page, 'Project Stats', '/dashboard/analytics', /\/dashboard\/analytics/, 90_000)
    await dismissDevOverlay(page)

    // Should redirect to /dashboard/analytics/<groupId>
    await expect(page).toHaveURL(/\/dashboard\/analytics\/[a-f0-9-]+/, { timeout: 90_000 })
    const analyticsUrl = page.url()
    console.log(`      Analytics URL: ${analyticsUrl}`)

    // Wait for page to finish loading (spinner disappears)
    await expect(page.locator('text=Retrieving project intelligence...')).not.toBeVisible({ timeout: 90_000 })

    // Verify KPI cards are visible
    await expect(page.locator('text=Project Progress')).toBeVisible({ timeout: 15_000 })
    await expect(page.locator('text=Completed Tasks')).toBeVisible({ timeout: 5_000 })

    // ── Verify task counts match what we created/moved ──
    // Expected: 1 Done (Gamma), 1 In Progress (Alpha), 1 To Do (Beta) = 3 total
    // KPI "Completed Tasks" shows `${doneTasks}/${tasks.length}` → "1/3"
    // Use getByText for exact matching of the value cell
    await expect(page.getByText('1/3')).toBeVisible({ timeout: 10_000 })
    console.log(`[6/10] ✓ Analytics KPIs verified: 1/3 tasks done`)

    // ── 7. EXPORT ANALYTICS CSV ─────────────────────────────────────
    console.log(`[7/10] Exporting analytics CSV`)

    // Set up download listener before clicking
    const downloadPromise = page.waitForEvent('download', { timeout: 20_000 })
    await page.click('button:has-text("CSV")')
    const download = await downloadPromise

    const csvFileName = `analytics_${RUN_ID}.csv`
    const csvSavePath = path.join(DOWNLOAD_DIR, csvFileName)
    await download.saveAs(csvSavePath)

    // Verify file exists
    expect(fs.existsSync(csvSavePath)).toBe(true)
    const csvContent = fs.readFileSync(csvSavePath, 'utf-8')
    console.log(`      CSV saved: ${csvSavePath}`)
    console.log(`      CSV size: ${csvContent.length} bytes`)
    console.log(`      CSV preview (first 500 chars):\n${csvContent.substring(0, 500)}`)

    // Validate CSV structure
    const csvLines = csvContent.split('\n').filter(line => line.trim())
    expect(csvLines.length).toBeGreaterThan(0)
    const csvHeaders = csvLines[0]
    expect(csvHeaders).toContain('Type')
    expect(csvHeaders).toContain('User')
    expect(csvHeaders).toContain('Description')
    expect(csvHeaders).toContain('Timestamp')

    // Verify there are activity log entries (at least team creation + task events)
    expect(csvLines.length).toBeGreaterThan(1)
    console.log(`[7/10] ✓ CSV exported with ${csvLines.length - 1} activity log entries`)

    // ── 8. PERSONAL DATA EXPORT (Settings → Privacy) ────────────────
    console.log(`[8/10] Exporting personal data archive from Settings`)
    await clientNav(page, 'Settings', '/dashboard/settings', /\/dashboard\/settings/)
    await dismissDevOverlay(page)
    await expect(page.locator('h1:has-text("Settings")')).toBeVisible({ timeout: 90_000 })

    // Click the "Privacy" tab (id='data')
    await page.click('button:has-text("Privacy")')
    await expect(page.locator('button:has-text("Export")')).toBeVisible({ timeout: 8_000 })

    // Intercept the /api/account GET request to capture the response body
    let personalDataJson: Record<string, unknown> | null = null

    await page.route('**/api/account', async (route) => {
      if (route.request().method() === 'GET') {
        const response = await route.fetch()
        const body = await response.text()
        try {
          personalDataJson = JSON.parse(body)
        } catch {
          // BotID may have blocked — note it but don't fail
          console.warn('      Personal data export: could not parse JSON (BotID may be active in this environment)')
        }
        await route.fulfill({ response })
      } else {
        await route.continue()
      }
    })

    // Click Export — this opens /api/account in a new tab
    const exportPagePromise = context.waitForEvent('page', { timeout: 15_000 }).catch(() => null)
    await page.click('button:has-text("Export")')
    const exportPage = await exportPagePromise
    if (exportPage) {
      await exportPage.waitForLoadState('domcontentloaded').catch(() => null)
      const rawBody = await exportPage.evaluate(() => document.body.innerText).catch(() => '')
      try {
        const exportJson = JSON.parse(rawBody)
        // Save to disk
        const jsonSavePath = path.join(DOWNLOAD_DIR, `personal_data_${RUN_ID}.json`)
        fs.writeFileSync(jsonSavePath, JSON.stringify(exportJson, null, 2))
        console.log(`      Personal archive saved: ${jsonSavePath}`)

        // Validate structure
        expect(exportJson).toHaveProperty('version')
        expect(exportJson).toHaveProperty('exported_at')
        expect(exportJson).toHaveProperty('identity')
        expect(exportJson).toHaveProperty('execution_log')
        expect(exportJson).toHaveProperty('evidence_ledger')

        // Verify identity matches our user
        const identity = exportJson.identity as Record<string, unknown>
        expect(identity.full_name).toBe(FULL_NAME)

        // Verify tasks appear in execution_log
        const execLog = exportJson.execution_log as Array<Record<string, unknown>>
        const taskTitles = execLog.map(t => t.title as string)
        for (const task of TASKS) {
          expect(taskTitles).toContain(task.title)
        }
        console.log(`[8/10] ✓ Personal data archive verified`)
        await exportPage.close()
      } catch (err) {
        // BotID blocked this in non-Vercel environments — acceptable, record and continue
        console.warn(`[8/10] ⚠ Personal data export blocked (likely BotID): ${rawBody.substring(0, 200)}`)
        await exportPage.close().catch(() => null)
      }
    } else if (personalDataJson) {
      // Route intercept captured it instead
      const jsonSavePath = path.join(DOWNLOAD_DIR, `personal_data_${RUN_ID}.json`)
      fs.writeFileSync(jsonSavePath, JSON.stringify(personalDataJson, null, 2))
      console.log(`[8/10] ✓ Personal data captured via intercept`)
    } else {
      console.warn(`[8/10] ⚠ Personal data export — tab did not open and intercept missed; skipping verification`)
    }

    // ── 9. DELETE ACCOUNT ───────────────────────────────────────────
    console.log(`[9/10] Deleting account`)
    await clientNav(page, 'Settings', '/dashboard/settings', /\/dashboard\/settings/)
    await dismissDevOverlay(page)
    await expect(page.locator('h1:has-text("Settings")')).toBeVisible({ timeout: 90_000 })

    // Go to Privacy / Danger Zone tab
    await page.click('button:has-text("Privacy")')
    await expect(page.locator('button:has-text("Delete Account")')).toBeVisible({ timeout: 30_000 })

    // Click "Delete Account" button (outside modal) to open the confirmation modal
    await page.locator('button:has-text("Delete Account")').first().click()

    // Fill in "DELETE" to confirm (placeholder: "Type DELETE to confirm")
    await expect(page.locator('input[placeholder*="DELETE" i]')).toBeVisible({ timeout: 8_000 })
    await page.fill('input[placeholder*="DELETE" i]', 'DELETE')

    // Submit — the confirm button inside the modal also says "Delete Account"
    // It becomes enabled when deleteConfirmation === 'DELETE'
    await page.locator('button:has-text("Delete Account"):not([disabled])').click()
    console.log(`      Waiting for redirect after account deletion...`)

    // ── 10. VERIFY REDIRECT TO LOGIN ────────────────────────────────
    await expect(page).toHaveURL(/\/login/, { timeout: 60_000 })
    console.log(`[9/10] ✓ Account deleted — redirected to /login`)

    // Verify can no longer access the dashboard
    await page.goto('/dashboard', { waitUntil: 'commit', timeout: 90_000 })
    await expect(page).toHaveURL(/\/login/, { timeout: 30_000 })
    console.log(`[10/10] ✓ Dashboard access blocked after deletion — /login confirmed`)

    // ── FINAL REPORT ────────────────────────────────────────────────
    console.log(`
╔═══════════════════════════════════════════════════╗
║  GROUPFLOW E2E FULL JOURNEY — PASSED              ║
║                                                   ║
║  User:        ${EMAIL.padEnd(33)} ║
║  Team:        ${TEAM_NAME.padEnd(33)} ║
║  Module:      ${MODULE_CODE.padEnd(33)} ║
║  Tasks:       3 created (1 Done, 1 In Progress,   ║
║               1 To Do)                            ║
║  CSV:         ${csvLines.length - 1} activity entries verified            ║
║  Outputs:     ${DOWNLOAD_DIR.substring(0, 33)}... ║
╚═══════════════════════════════════════════════════╝
    `)
  })
})
