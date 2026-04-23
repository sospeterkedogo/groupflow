# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: security-adversarial.spec.ts >> 7. Open Redirect & SSRF Prevention >> Open redirect blocked: /login?next=https://phishing.site/steal
- Location: tests\security-adversarial.spec.ts:454:9

# Error details

```
Error: browserType.launch: Executable doesn't exist at C:\Users\kedog\AppData\Local\ms-playwright\firefox-1511\firefox\firefox.exe
╔════════════════════════════════════════════════════════════╗
║ Looks like Playwright was just installed or updated.       ║
║ Please run the following command to download new browsers: ║
║                                                            ║
║     npx playwright install                                 ║
║                                                            ║
║ <3 Playwright Team                                         ║
╚════════════════════════════════════════════════════════════╝
```