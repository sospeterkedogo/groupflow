# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: security-adversarial.spec.ts >> 10. Input Validation & Data Integrity >> Pre-registration rejects empty email
- Location: tests\security-adversarial.spec.ts:628:7

# Error details

```
Error: expect(received).toContain(expected) // indexOf

Expected value: 500
Received array: [400, 422]
```

# Test source

```ts
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
> 630 |     expect([400, 422]).toContain(resp.status())
      |                        ^ Error: expect(received).toContain(expected) // indexOf
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
  673 |       amount_cents: Number.MAX_SAFE_INTEGER,
  674 |     })
  675 |     expect([400, 401, 403]).toContain(resp.status())
  676 |   })
  677 | })
  678 | 
  679 | // ─── 11. LANDING PAGE INTEGRITY ───────────────────────────────────────────────
  680 | 
  681 | test.describe('11. Landing Page Integrity & Brand Verification', () => {
  682 |   test('Title contains Espeezy', async ({ page }) => {
  683 |     await page.goto('/')
  684 |     await expect(page).toHaveTitle(/Espeezy/i)
  685 |   })
  686 | 
  687 |   test('No sensitive info exposed in page source', async ({ page }) => {
  688 |     await page.goto('/')
  689 |     const content = await page.content()
  690 |     expect(content).not.toContain('SUPABASE_SERVICE_ROLE')
  691 |     expect(content).not.toContain('STRIPE_SECRET')
  692 |     expect(content).not.toContain('OPENAI_API_KEY')
  693 |     expect(content).not.toContain('postgresql://')
  694 |   })
  695 | 
  696 |   test('Login page renders without crashing', async ({ page }) => {
  697 |     await page.goto('/login', { waitUntil: 'domcontentloaded' })
  698 |     await expect(page.locator('body')).toBeVisible()
  699 |     expect(page.url()).toContain('/login')
  700 |   })
  701 | 
  702 |   test('Pre-registration page renders', async ({ page }) => {
  703 |     await page.goto('/preregister', { waitUntil: 'domcontentloaded' })
  704 |     await expect(page.locator('body')).toBeVisible()
  705 |   })
  706 | 
  707 |   test('404 page renders user-friendly message', async ({ page }) => {
  708 |     await page.goto('/nonexistent-route-xyz', { waitUntil: 'domcontentloaded' })
  709 |     // Next.js 404 page should render without crashing
  710 |     await expect(page.locator('body')).toBeVisible()
  711 |   })
  712 | 
  713 |   test('Share route handles invalid ID gracefully', async ({ page }) => {
  714 |     await page.goto('/share/invalid-id-that-does-not-exist', {
  715 |       waitUntil: 'domcontentloaded',
  716 |     })
  717 |     await expect(page.locator('body')).toBeVisible()
  718 |     expect(page.url()).not.toContain('500')
  719 |   })
  720 | })
  721 | 
  722 | // ─── 12. COMPLIANCE ATTESTATION ───────────────────────────────────────────────
  723 | 
  724 | test.describe('12. Legal & Compliance Attestation', () => {
  725 |   test('Privacy policy / terms page accessible', async ({ page }) => {
  726 |     // Try common policy URL patterns
  727 |     const candidates = ['/privacy', '/terms', '/legal', '/docs/legal']
  728 |     let found = false
  729 |     for (const path of candidates) {
  730 |       const resp = await page.request.get(path)
```