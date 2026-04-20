# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: security-adversarial.spec.ts >> 2. Authentication & Authorisation Bypass >> Terminal page redirects unauthenticated users
- Location: tests\security-adversarial.spec.ts:215:7

# Error details

```
Error: expect(received).not.toContain(expected) // indexOf

Expected substring: not "/terminal"
Received string:        "http://localhost:3000/terminal"
```

# Page snapshot

```yaml
- generic [ref=e2]: Internal Server Error
```

# Test source

```ts
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
  174 |       ).toContain(resp.status())
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
> 219 |     expect(url).not.toContain('/terminal')
      |                     ^ Error: expect(received).not.toContain(expected) // indexOf
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
  275 |   test.describe('3c. XSS in pre-registration fields (stored XSS prevention)', () => {
  276 |     for (const payload of XSS_PAYLOADS.slice(0, 5)) {
  277 |       test(`XSS payload rejected/sanitised: ${payload.slice(0, 40)}`, async ({ request }) => {
  278 |         const resp = await apiPost(request, '/api/preregister', {
  279 |           email: 'xss@test.com',
  280 |           fullName: payload,
  281 |           institution: payload,
  282 |         })
  283 |         // Either rejected (400) or accepted but sanitised
  284 |         if (resp.status() === 200) {
  285 |           const body = await resp.json()
  286 |           const bodyStr = JSON.stringify(body)
  287 |           // Stored XSS script tags must not be reflected back verbatim
  288 |           expect(bodyStr).not.toContain('<script>')
  289 |           expect(bodyStr).not.toContain('onerror=')
  290 |           expect(bodyStr).not.toContain('javascript:')
  291 |         }
  292 |       })
  293 |     }
  294 |   })
  295 | 
  296 |   test.describe('3d. Prompt Injection against AI support endpoint', () => {
  297 |     for (const payload of PROMPT_INJECTION_PAYLOADS) {
  298 |       test(`Prompt injection resisted: ${payload.slice(0, 50)}`, async ({ request }) => {
  299 |         const resp = await apiPost(request, '/api/ai/support', {
  300 |           messages: [{ role: 'user', content: payload }],
  301 |         })
  302 |         // Without auth, must be 401 (or 429 if rate-limited — also blocks the attack)
  303 |         expect([401, 403, 429]).toContain(resp.status())
  304 |       })
  305 |     }
  306 |   })
  307 | })
  308 | 
  309 | // ─── 4. PAYLOAD SIZE & DoS PREVENTION ────────────────────────────────────────
  310 | 
  311 | test.describe('4. Oversized Payload & DoS Resistance', () => {
  312 |   test('100KB+ body in pre-registration rejected', async ({ request }) => {
  313 |     const resp = await apiPost(request, '/api/preregister', {
  314 |       email: 'dos@test.com',
  315 |       fullName: OVERSIZED_PAYLOAD,
  316 |       institution: OVERSIZED_PAYLOAD,
  317 |     })
  318 |     expect([400, 413, 422, 429]).toContain(resp.status())
  319 |   })
```