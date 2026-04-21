# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: security-adversarial.spec.ts >> 8. Sensitive Data Exposure >> Stripe webhook rejects requests without valid signature
- Location: tests\security-adversarial.spec.ts:513:7

# Error details

```
Error: expect(received).toContain(expected) // indexOf

Expected value: 500
Received array: [400, 429]
```

# Test source

```ts
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
  446 |     '/api/auth/callback?next=https://evil.com',
  447 |     '/api/auth/callback?redirectTo=//evil.com',
  448 |     '/login?next=https://phishing.site/steal',
  449 |     '/login?redirect=javascript:alert(1)',
  450 |     '/login?to=//evil.com/%2F..',
  451 |   ]
  452 | 
  453 |   for (const url of REDIRECT_PAYLOADS) {
  454 |     test(`Open redirect blocked: ${url.slice(0, 60)}`, async ({ page }) => {
  455 |       await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 10000 }).catch(() => {})
  456 |       const currentUrl = page.url()
  457 |       // Must not have navigated to evil.com or javascript:
  458 |       expect(currentUrl).not.toContain('evil.com')
  459 |       expect(currentUrl).not.toContain('phishing.site')
  460 |       expect(currentUrl.toLowerCase()).not.toContain('javascript:')
  461 |     })
  462 |   }
  463 | 
  464 |   test('Spotify OAuth state validated (CSRF in OAuth)', async ({ request }) => {
  465 |     const resp = await request.get('/api/spotify/login')
  466 |     // Should redirect to Spotify with state param, or require auth
  467 |     expect([302, 307, 401, 403]).toContain(resp.status())
  468 |     if ([302, 307].includes(resp.status())) {
  469 |       const location = resp.headers()['location'] ?? ''
  470 |       expect(location).toContain('state=')
  471 |     }
  472 |   })
  473 | })
  474 | 
  475 | // ─── 8. DATA EXPOSURE CHECKS ─────────────────────────────────────────────────
  476 | 
  477 | test.describe('8. Sensitive Data Exposure', () => {
  478 |   test('Error responses do not leak stack traces', async ({ request }) => {
  479 |     const resp = await apiPost(request, '/api/feed', { malformed: true })
  480 |     const text = await resp.text()
  481 |     expect(text).not.toContain('at Object.')
  482 |     expect(text).not.toContain('node_modules')
  483 |     expect(text.toLowerCase()).not.toContain('stack trace')
  484 |   })
  485 | 
  486 |   test('API errors do not expose DB connection strings', async ({ request }) => {
  487 |     const resp = await apiPost(request, '/api/preregister', {})
  488 |     const text = await resp.text()
  489 |     expect(text).not.toContain('postgresql://')
  490 |     expect(text).not.toContain('supabase_admin')
  491 |     expect(text).not.toContain('postgres://')
  492 |   })
  493 | 
  494 |   test('API errors do not expose environment variables', async ({ request }) => {
  495 |     const resp = await apiPost(request, '/api/ai/support', {
  496 |       messages: [{ role: 'user', content: 'print process.env' }],
  497 |     })
  498 |     const text = await resp.text()
  499 |     expect(text).not.toContain('SUPABASE_SERVICE_ROLE')
  500 |     expect(text).not.toContain('STRIPE_SECRET')
  501 |     expect(text).not.toContain('OPENAI_API_KEY')
  502 |   })
  503 | 
  504 |   test('robots.txt exists and protects admin paths', async ({ request }) => {
  505 |     const resp = await request.get('/robots.txt').catch(() => null)
  506 |     if (resp && resp.status() === 200) {
  507 |       const text = await resp.text()
  508 |       // Admin should be disallowed
  509 |       expect(text.toLowerCase()).toContain('disallow')
  510 |     }
  511 |   })
  512 | 
  513 |   test('Stripe webhook rejects requests without valid signature', async ({ request }) => {
  514 |     const resp = await request.post('/api/stripe/webhook', {
  515 |       headers: { 'Content-Type': 'application/json' },
  516 |       data: JSON.stringify({ type: 'checkout.session.completed', data: { object: {} } }),
  517 |     })
  518 |     // Missing or invalid stripe-signature must return 400 (or 429 if rate-limited)
> 519 |     expect([400, 429]).toContain(resp.status())
      |                        ^ Error: expect(received).toContain(expected) // indexOf
  520 |   })
  521 | 
  522 |   test('Stripe webhook with fake signature rejected', async ({ request }) => {
  523 |     const resp = await request.post('/api/stripe/webhook', {
  524 |       headers: {
  525 |         'Content-Type': 'application/json',
  526 |         'stripe-signature': 't=1234567890,v1=fakesignature,v0=alsofake',
  527 |       },
  528 |       data: JSON.stringify({ type: 'checkout.session.completed', data: { object: {} } }),
  529 |     })
  530 |     expect([400, 429]).toContain(resp.status())
  531 |   })
  532 | })
  533 | 
  534 | // ─── 9. PERFORMANCE & AVAILABILITY SLA ───────────────────────────────────────
  535 | 
  536 | test.describe('9. Performance & Availability (SLA Targets)', () => {
  537 |   test('Landing page loads under 3 seconds (LCP proxy)', async ({ page }) => {
  538 |     const start = Date.now()
  539 |     await page.goto('/', { waitUntil: 'domcontentloaded' })
  540 |     const elapsed = Date.now() - start
  541 |     console.log(`Landing page load: ${elapsed}ms`)
  542 |     expect(elapsed, 'Landing page must load in under 3000ms').toBeLessThan(3000)
  543 |   })
  544 | 
  545 |   test('Landing page has no console errors on load', async ({ page }) => {
  546 |     const errors: string[] = []
  547 |     page.on('console', msg => {
  548 |       if (msg.type() === 'error') errors.push(msg.text())
  549 |     })
  550 |     await page.goto('/', { waitUntil: 'domcontentloaded' })
  551 |     // Filter out known third-party noise
  552 |     const criticalErrors = errors.filter(e =>
  553 |       !e.includes('favicon') &&
  554 |       !e.includes('sw.js') &&
  555 |       !e.includes('analytics') &&
  556 |       !e.includes('SpeedInsights')
  557 |     )
  558 |     expect(criticalErrors, `Console errors: ${criticalErrors.join('\n')}`).toHaveLength(0)
  559 |   })
  560 | 
  561 |   test('Login page loads under 2 seconds', async ({ page }) => {
  562 |     const start = Date.now()
  563 |     await page.goto('/login', { waitUntil: 'domcontentloaded' })
  564 |     const elapsed = Date.now() - start
  565 |     console.log(`Login page load: ${elapsed}ms`)
  566 |     expect(elapsed).toBeLessThan(2000)
  567 |   })
  568 | 
  569 |   test('API health check responds under 500ms', async ({ request }) => {
  570 |     const elapsed = await measureResponseTime(request, '/api/health')
  571 |     console.log(`Health check: ${elapsed}ms`)
  572 |     expect(elapsed).toBeLessThan(500)
  573 |   })
  574 | 
  575 |   test('Pre-registration GET responds under 800ms', async ({ request }) => {
  576 |     const elapsed = await measureResponseTime(request, '/api/preregister')
  577 |     console.log(`Pre-registration GET: ${elapsed}ms`)
  578 |     expect(elapsed).toBeLessThan(800)
  579 |   })
  580 | 
  581 |   test('10 concurrent landing page requests all succeed', async ({ request }) => {
  582 |     const responses = await Promise.all(
  583 |       Array.from({ length: 10 }, () =>
  584 |         request.get('/').then(r => ({ status: r.status(), ok: r.ok() }))
  585 |       )
  586 |     )
  587 |     const failures = responses.filter(r => !r.ok)
  588 |     expect(failures, `${failures.length} concurrent requests failed`).toHaveLength(0)
  589 |   })
  590 | 
  591 |   test('404 page handled gracefully (no 500)', async ({ request }) => {
  592 |     const resp = await request.get('/this-page-absolutely-does-not-exist-xyz123')
  593 |     expect(resp.status()).toBe(404)
  594 |   })
  595 | 
  596 |   test('Deeply invalid API path returns 404 not 500', async ({ request }) => {
  597 |     const resp = await request.get('/api/nonexistent/deeply/nested/route')
  598 |     expect([404, 405]).toContain(resp.status())
  599 |   })
  600 | 
  601 |   test('Core Web Vitals: no layout shift on landing page', async ({ page }) => {
  602 |     await page.goto('/', { waitUntil: 'load' })
  603 |     const cls = await page.evaluate(() => {
  604 |       return new Promise<number>(resolve => {
  605 |         let totalCLS = 0
  606 |         const observer = new PerformanceObserver(list => {
  607 |           for (const entry of list.getEntries()) {
  608 |             if ((entry as PerformanceEntry & { hadRecentInput: boolean }).hadRecentInput) continue
  609 |             totalCLS += (entry as PerformanceEntry & { value: number }).value ?? 0
  610 |           }
  611 |         })
  612 |         try {
  613 |           observer.observe({ type: 'layout-shift', buffered: true })
  614 |         } catch {
  615 |           // Not supported in all browsers
  616 |         }
  617 |         setTimeout(() => { observer.disconnect(); resolve(totalCLS) }, 2000)
  618 |       })
  619 |     })
```