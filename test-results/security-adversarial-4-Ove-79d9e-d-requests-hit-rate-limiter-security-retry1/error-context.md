# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: security-adversarial.spec.ts >> 4. Oversized Payload & DoS Resistance >> HTTP flood: 30 rapid requests hit rate limiter
- Location: tests\security-adversarial.spec.ts:336:7

# Error details

```
Error: Unexpected status in flood test: 500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500

expect(received).toBe(expected) // Object.is equality

Expected: true
Received: false
```

# Test source

```ts
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
  320 | 
  321 |   test('100KB+ body in feed POST rejected (requires auth)', async ({ request }) => {
  322 |     const resp = await apiPost(request, '/api/feed', {
  323 |       content: OVERSIZED_PAYLOAD,
  324 |     })
  325 |     expect([400, 401, 413, 422, 429]).toContain(resp.status())
  326 |   })
  327 | 
  328 |   test('Deeply nested JSON bomb rejected', async ({ request }) => {
  329 |     // JSON bomb: exponentially nested object
  330 |     let bomb: unknown = { x: 'value' }
  331 |     for (let i = 0; i < 100; i++) bomb = { nested: bomb }
  332 |     const resp = await apiPost(request, '/api/preregister', bomb)
  333 |     expect([400, 401, 413, 422, 429, 500]).toContain(resp.status())
  334 |   })
  335 | 
  336 |   test('HTTP flood: 30 rapid requests hit rate limiter', async ({ request }) => {
  337 |     const results = await Promise.all(
  338 |       Array.from({ length: 30 }, () =>
  339 |         request.get('/api/feed').then(r => r.status())
  340 |       )
  341 |     )
  342 |     // Either all 401 (no auth) or some 429 (rate limited) — both are safe
  343 |     const has429 = results.some(s => s === 429)
  344 |     const allSafe = results.every(s => [401, 403, 429].includes(s))
> 345 |     expect(allSafe, `Unexpected status in flood test: ${results}`).toBe(true)
      |                                                                    ^ Error: Unexpected status in flood test: 500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500
  346 |     // In production (non-dev), rate limiting should kick in
  347 |     // In dev mode, all will be 401 — that's acceptable
  348 |     console.log(`Flood test: ${results.filter(s => s === 429).length}/30 rate-limited, ${results.filter(s => s === 401).length}/30 auth-rejected`)
  349 |   })
  350 | 
  351 |   test('Negative amount_cents in payout blocked', async ({ request }) => {
  352 |     const resp = await apiPost(request, '/api/admin/payout', {
  353 |       recipient_id: 'some-uuid',
  354 |       amount_cents: -99999,
  355 |     })
  356 |     expect([400, 401, 403]).toContain(resp.status())
  357 |   })
  358 | 
  359 |   test('Zero amount_cents in payout blocked', async ({ request }) => {
  360 |     const resp = await apiPost(request, '/api/admin/payout', {
  361 |       recipient_id: 'some-uuid',
  362 |       amount_cents: 0,
  363 |     })
  364 |     expect([400, 401, 403, 429]).toContain(resp.status())
  365 |   })
  366 | 
  367 |   test('Amount_cents as string coercion blocked', async ({ request }) => {
  368 |     const resp = await apiPost(request, '/api/admin/payout', {
  369 |       recipient_id: 'some-uuid',
  370 |       amount_cents: '99999999; DROP TABLE admin_payouts',
  371 |     })
  372 |     expect([400, 401, 403, 429]).toContain(resp.status())
  373 |   })
  374 | })
  375 | 
  376 | // ─── 5. PATH TRAVERSAL & IDOR ────────────────────────────────────────────────
  377 | 
  378 | test.describe('5. Path Traversal & IDOR Resistance', () => {
  379 |   for (const payload of PATH_TRAVERSAL_PAYLOADS) {
  380 |     test(`Path traversal blocked in URL: ${payload.slice(0, 40)}`, async ({ request }) => {
  381 |       const encoded = encodeURIComponent(payload)
  382 |       const resp = await request.get(`/api/hustle/tasks/${encoded}`).catch(() => null)
  383 |       if (resp) {
  384 |         expect([400, 401, 404, 429]).toContain(resp.status())
  385 |         if (resp.status() === 200) {
  386 |           const text = await resp.text()
  387 |           expect(text).not.toContain('root:')
  388 |           expect(text).not.toContain('[boot loader]')
  389 |         }
  390 |       }
  391 |     })
  392 |   }
  393 | 
  394 |   test('IDOR: accessing another users task by UUID guessing (unauthenticated)', async ({ request }) => {
  395 |     // Try common UUID patterns
  396 |     const testIds = [
  397 |       '00000000-0000-0000-0000-000000000001',
  398 |       'ffffffff-ffff-ffff-ffff-ffffffffffff',
  399 |       '12345678-1234-1234-1234-123456789012',
  400 |     ]
  401 |     for (const id of testIds) {
  402 |       const resp = await request.get(`/api/hustle/tasks/${id}`)
  403 |       expect([401, 403, 404, 429]).toContain(resp.status())
  404 |     }
  405 |   })
  406 | 
  407 |   test('Admin task route blocks non-admin by UUID', async ({ request }) => {
  408 |     const resp = await request.get('/api/admin/tasks/00000000-0000-0000-0000-000000000001')
  409 |     expect([401, 403, 404, 429]).toContain(resp.status())
  410 |   })
  411 | })
  412 | 
  413 | // ─── 6. HTTP METHOD & CONTENT-TYPE ATTACKS ───────────────────────────────────
  414 | 
  415 | test.describe('6. HTTP Method & Content-Type Manipulation', () => {
  416 |   test('HTTP TRACE method rejected on API', async ({ request }) => {
  417 |     const resp = await request.fetch('/api/feed', { method: 'TRACE' }).catch(() => null)
  418 |     if (resp) expect([405, 400, 401]).toContain(resp.status())
  419 |   })
  420 | 
  421 |   test('HTTP PUT on POST-only endpoint handled safely', async ({ request }) => {
  422 |     const resp = await request.put('/api/preregister', { data: {} }).catch(() => null)
  423 |     if (resp) expect([404, 405, 429]).toContain(resp.status())
  424 |   })
  425 | 
  426 |   test('Wrong Content-Type (text/html) on JSON API rejected', async ({ request }) => {
  427 |     const resp = await request.post('/api/preregister', {
  428 |       headers: { 'Content-Type': 'text/html' },
  429 |       data: '<script>alert(1)</script>',
  430 |     })
  431 |     expect([400, 415, 422, 429]).toContain(resp.status())
  432 |   })
  433 | 
  434 |   test('Null byte injection in headers handled', async ({ request }) => {
  435 |     const resp = await request.get('/api/feed', {
  436 |       headers: { 'X-Custom-Header': 'value\x00injection' },
  437 |     }).catch(() => null)
  438 |     if (resp) expect(resp.status()).not.toBe(500)
  439 |   })
  440 | })
  441 | 
  442 | // ─── 7. OPEN REDIRECT & SSRF PREVENTION ──────────────────────────────────────
  443 | 
  444 | test.describe('7. Open Redirect & SSRF Prevention', () => {
  445 |   const REDIRECT_PAYLOADS = [
```