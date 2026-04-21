# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: security-adversarial.spec.ts >> 2. Authentication & Authorisation Bypass >> Unauthenticated POST rejected: /api/admin/payout
- Location: tests\security-adversarial.spec.ts:169:9

# Error details

```
Error: /api/admin/payout POST must reject unauthenticated requests (got 500)

expect(received).toContain(expected) // indexOf

Expected value: 500
Received array: [401, 403, 405]
```

# Test source

```ts
  74  |   request: APIRequestContext,
  75  |   path: string,
  76  |   body: unknown,
  77  |   headers: Record<string, string> = {}
  78  | ) {
  79  |   return request.post(path, {
  80  |     data: body,
  81  |     headers: { 'Content-Type': 'application/json', ...headers },
  82  |   })
  83  | }
  84  | 
  85  | async function measureResponseTime(
  86  |   request: APIRequestContext,
  87  |   path: string
  88  | ): Promise<number> {
  89  |   const start = Date.now()
  90  |   await request.get(path)
  91  |   return Date.now() - start
  92  | }
  93  | 
  94  | // ─── 1. SECURITY HEADERS ──────────────────────────────────────────────────────
  95  | 
  96  | test.describe('1. Security Response Headers', () => {
  97  |   test('HSTS header present and correct', async ({ request }) => {
  98  |     const resp = await request.get('/')
  99  |     const hsts = resp.headers()['strict-transport-security']
  100 |     expect(hsts, 'HSTS header missing').toBeTruthy()
  101 |     expect(hsts).toContain('max-age=')
  102 |     const maxAge = parseInt(hsts.match(/max-age=(\d+)/)?.[1] ?? '0')
  103 |     expect(maxAge, 'HSTS max-age must be at least 1 year').toBeGreaterThanOrEqual(31536000)
  104 |   })
  105 | 
  106 |   test('X-Frame-Options prevents clickjacking', async ({ request }) => {
  107 |     const resp = await request.get('/')
  108 |     const xfo = resp.headers()['x-frame-options']
  109 |     expect(xfo, 'X-Frame-Options missing').toBeTruthy()
  110 |     expect(['DENY', 'SAMEORIGIN']).toContain(xfo?.toUpperCase())
  111 |   })
  112 | 
  113 |   test('X-Content-Type-Options prevents MIME sniffing', async ({ request }) => {
  114 |     const resp = await request.get('/')
  115 |     const xcto = resp.headers()['x-content-type-options']
  116 |     expect(xcto, 'X-Content-Type-Options missing').toBe('nosniff')
  117 |   })
  118 | 
  119 |   test('Static assets served with immutable cache headers', async ({ request }) => {
  120 |     // Next.js static chunk — any _next/static URL
  121 |     const resp = await request.get('/_next/static/chunks/main.js').catch(() => null)
  122 |     if (resp && resp.status() === 200) {
  123 |       const cc = resp.headers()['cache-control']
  124 |       expect(cc).toContain('immutable')
  125 |     } else {
  126 |       test.skip() // Build artefacts not served in test mode
  127 |     }
  128 |   })
  129 | 
  130 |   test('API routes deny X-Frame-Options DENY', async ({ request }) => {
  131 |     const resp = await request.get('/api/health').catch(() =>
  132 |       request.get('/api/feed')
  133 |     )
  134 |     const xfo = resp.headers()['x-frame-options']
  135 |     if (xfo) expect(xfo?.toUpperCase()).toBe('DENY')
  136 |   })
  137 | 
  138 |   test('No server version disclosure in headers', async ({ request }) => {
  139 |     const resp = await request.get('/')
  140 |     const server = resp.headers()['server']
  141 |     const powered = resp.headers()['x-powered-by']
  142 |     // Should not reveal "Express", "Next.js vX.X", "Apache/2.4", etc.
  143 |     if (server) expect(server.toLowerCase()).not.toContain('express')
  144 |     expect(powered, 'X-Powered-By must be absent').toBeFalsy()
  145 |   })
  146 | })
  147 | 
  148 | // ─── 2. AUTHENTICATION BYPASS ATTEMPTS ───────────────────────────────────────
  149 | 
  150 | test.describe('2. Authentication & Authorisation Bypass', () => {
  151 |   const PROTECTED_ENDPOINTS = [
  152 |     '/api/feed',
  153 |     '/api/hustle/tasks',
  154 |     '/api/admin/payout',
  155 |     '/api/ai/support',
  156 |     '/api/support/ticket',
  157 |     '/api/account',
  158 |   ]
  159 | 
  160 |   for (const endpoint of PROTECTED_ENDPOINTS) {
  161 |     test(`Unauthenticated GET rejected: ${endpoint}`, async ({ request }) => {
  162 |       const resp = await request.get(endpoint)
  163 |       expect(
  164 |         [401, 403, 405],
  165 |         `${endpoint} must reject unauthenticated requests (got ${resp.status()})`
  166 |       ).toContain(resp.status())
  167 |     })
  168 | 
  169 |     test(`Unauthenticated POST rejected: ${endpoint}`, async ({ request }) => {
  170 |       const resp = await apiPost(request, endpoint, { test: true })
  171 |       expect(
  172 |         [401, 403, 405],
  173 |         `${endpoint} POST must reject unauthenticated requests (got ${resp.status()})`
> 174 |       ).toContain(resp.status())
      |         ^ Error: /api/admin/payout POST must reject unauthenticated requests (got 500)
  175 |     })
  176 |   }
  177 | 
  178 |   test('Admin endpoint rejects non-admin session (role escalation)', async ({ request }) => {
  179 |     // Crafted request with a fake Bearer token (invalid JWT)
  180 |     const resp = await apiPost(
  181 |       request,
  182 |       '/api/admin/payout',
  183 |       { recipient_id: 'fake-uuid', amount_cents: 9999999 },
  184 |       { Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJoYWNrZXIiLCJyb2xlIjoiYWRtaW4ifQ.fake_signature' }
  185 |     )
  186 |     expect([401, 403]).toContain(resp.status())
  187 |   })
  188 | 
  189 |   test('JWT with tampered payload rejected', async ({ request }) => {
  190 |     // Base64-encoded tampered JWT: role=admin injected
  191 |     const fakeJwt = 'eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJzdWIiOiI5OTk5IiwicmVzIjoiYWRtaW4iLCJleHAiOjk5OTk5OTk5OTl9.'
  192 |     const resp = await request.get('/api/feed', {
  193 |       headers: { Authorization: `Bearer ${fakeJwt}` },
  194 |     })
  195 |     expect([401, 403]).toContain(resp.status())
  196 |   })
  197 | 
  198 |   test('Cookie injection attempt rejected', async ({ request }) => {
  199 |     const resp = await request.get('/api/feed', {
  200 |       headers: {
  201 |         Cookie: 'sb-access-token=fake_token; sb-refresh-token=fake_refresh',
  202 |       },
  203 |     })
  204 |     expect([401, 403]).toContain(resp.status())
  205 |   })
  206 | 
  207 |   test('Admin dashboard redirects unauthenticated users', async ({ page }) => {
  208 |     await page.goto('/admin')
  209 |     // Should redirect to / or /login
  210 |     await page.waitForURL(/\/(login|$)/, { timeout: 5000 }).catch(() => {})
  211 |     const url = page.url()
  212 |     expect(url).not.toContain('/admin')
  213 |   })
  214 | 
  215 |   test('Terminal page redirects unauthenticated users', async ({ page }) => {
  216 |     await page.goto('/terminal')
  217 |     await page.waitForURL(/\/(login|$)/, { timeout: 5000 }).catch(() => {})
  218 |     const url = page.url()
  219 |     expect(url).not.toContain('/terminal')
  220 |   })
  221 | })
  222 | 
  223 | // ─── 3. INJECTION ATTACKS ────────────────────────────────────────────────────
  224 | 
  225 | test.describe('3. Injection Attack Resistance', () => {
  226 |   test.describe('3a. SQL Injection via public pre-registration endpoint', () => {
  227 |     for (const payload of SQL_INJECTION_PAYLOADS) {
  228 |       test(`SQL injection blocked: ${payload.slice(0, 40)}`, async ({ request }) => {
  229 |         const resp = await apiPost(request, '/api/preregister', {
  230 |           email: payload,
  231 |           fullName: payload,
  232 |         })
  233 |         // Must NOT return 200 with data leakage, must return 4xx or sanitised 200
  234 |         if (resp.status() === 200) {
  235 |           const body = await resp.json()
  236 |           // On 200, it must have rejected with a validation error or returned safe data
  237 |           expect(body.error ?? body.success).toBeTruthy()
  238 |           if (body.error) {
  239 |             // Error message must not reveal DB internals
  240 |             expect(JSON.stringify(body).toLowerCase()).not.toContain('pg_')
  241 |             expect(JSON.stringify(body).toLowerCase()).not.toContain('syntax error')
  242 |             expect(JSON.stringify(body).toLowerCase()).not.toContain('column')
  243 |             expect(JSON.stringify(body).toLowerCase()).not.toContain('table')
  244 |           }
  245 |         } else {
  246 |           expect([400, 422, 429]).toContain(resp.status())
  247 |         }
  248 |       })
  249 |     }
  250 |   })
  251 | 
  252 |   test.describe('3b. SQL Injection via query parameters', () => {
  253 |     const sqliQueryParams = [
  254 |       "/api/hustle/tasks?status=' OR 1=1--",
  255 |       "/api/hustle/tasks?category='; DROP TABLE hustle_tasks;--",
  256 |       "/api/feed?cursor=' UNION SELECT * FROM profiles--",
  257 |     ]
  258 | 
  259 |     for (const url of sqliQueryParams) {
  260 |       test(`Query param injection blocked: ${url.slice(0, 50)}`, async ({ request }) => {
  261 |         const resp = await request.get(url)
  262 |         // Must reject auth OR sanitise — no DB errors leaked
  263 |         if (resp.status() === 200) {
  264 |           const text = await resp.text()
  265 |           expect(text.toLowerCase()).not.toContain('syntax error')
  266 |           expect(text.toLowerCase()).not.toContain('pg_catalog')
  267 |           expect(text.toLowerCase()).not.toContain('information_schema')
  268 |         }
  269 |         // 401 is expected (no auth), any other status must not be 500
  270 |         expect(resp.status()).not.toBe(500)
  271 |       })
  272 |     }
  273 |   })
  274 | 
```