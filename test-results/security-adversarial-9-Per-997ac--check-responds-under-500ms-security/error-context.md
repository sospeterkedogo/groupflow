# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: security-adversarial.spec.ts >> 9. Performance & Availability (SLA Targets) >> API health check responds under 500ms
- Location: tests\security-adversarial.spec.ts:569:7

# Error details

```
Error: expect(received).toBeLessThan(expected)

Expected: < 500
Received:   541
```

# Test source

```ts
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
  519 |     expect([400, 429]).toContain(resp.status())
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
> 572 |     expect(elapsed).toBeLessThan(500)
      |                     ^ Error: expect(received).toBeLessThan(expected)
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
  620 |     console.log(`CLS score: ${cls}`)
  621 |     expect(cls, 'Cumulative Layout Shift must be below 0.1 (Good)').toBeLessThan(0.1)
  622 |   })
  623 | })
  624 | 
  625 | // ─── 10. INPUT VALIDATION COMPLIANCE ─────────────────────────────────────────
  626 | 
  627 | test.describe('10. Input Validation & Data Integrity', () => {
  628 |   test('Pre-registration rejects empty email', async ({ request }) => {
  629 |     const resp = await apiPost(request, '/api/preregister', { email: '' })
  630 |     expect([400, 422]).toContain(resp.status())
  631 |   })
  632 | 
  633 |   test('Pre-registration rejects non-email string', async ({ request }) => {
  634 |     const resp = await apiPost(request, '/api/preregister', { email: 'not-an-email' })
  635 |     expect([400, 422]).toContain(resp.status())
  636 |   })
  637 | 
  638 |   test('Pre-registration rejects no body', async ({ request }) => {
  639 |     const resp = await request.post('/api/preregister', {
  640 |       headers: { 'Content-Type': 'application/json' },
  641 |       data: '',
  642 |     })
  643 |     expect([400, 422]).toContain(resp.status())
  644 |   })
  645 | 
  646 |   test('Pre-registration rejects array as email', async ({ request }) => {
  647 |     const resp = await apiPost(request, '/api/preregister', {
  648 |       email: ['admin@espeezy.com', 'hacker@evil.com'],
  649 |     })
  650 |     expect([400, 422]).toContain(resp.status())
  651 |   })
  652 | 
  653 |   test('Feed POST rejects content over 2000 chars', async ({ request }) => {
  654 |     // Note: will be 401 without auth, but if auth were present it would be 400
  655 |     const resp = await apiPost(request, '/api/feed', {
  656 |       content: 'X'.repeat(2001),
  657 |       visibility: 'public',
  658 |     })
  659 |     expect([400, 401, 422]).toContain(resp.status())
  660 |   })
  661 | 
  662 |   test('Task payout rejects non-UUID recipient_id', async ({ request }) => {
  663 |     const resp = await apiPost(request, '/api/admin/payout', {
  664 |       recipient_id: 'not-a-uuid!!!',
  665 |       amount_cents: 500,
  666 |     })
  667 |     expect([400, 401, 403]).toContain(resp.status())
  668 |   })
  669 | 
  670 |   test('Numeric overflow in amount_cents blocked', async ({ request }) => {
  671 |     const resp = await apiPost(request, '/api/admin/payout', {
  672 |       recipient_id: '00000000-0000-0000-0000-000000000001',
```