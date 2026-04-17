# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: e2e-groupflow.spec.ts >> End-to-End: Group Project Flow >> Simulate 4 users: signup, group creation, project completion, and data sync
- Location: tests\e2e-groupflow.spec.ts:4:7

# Error details

```
Test timeout of 60000ms exceeded.
```

# Page snapshot

```yaml
- generic [ref=e1]:
  - generic [active]:
    - generic [ref=e4]:
      - generic [ref=e5]:
        - generic [ref=e6]:
          - navigation [ref=e7]:
            - button "previous" [disabled] [ref=e8]:
              - img "previous" [ref=e9]
            - generic [ref=e11]:
              - generic [ref=e12]: 1/
              - text: "1"
            - button "next" [disabled] [ref=e13]:
              - img "next" [ref=e14]
          - img
        - generic [ref=e16]:
          - link "Next.js 16.2.3 (stale) Turbopack" [ref=e17] [cursor=pointer]:
            - /url: https://nextjs.org/docs/messages/version-staleness
            - img [ref=e18]
            - generic "There is a newer version (16.2.4) available, upgrade recommended!" [ref=e20]: Next.js 16.2.3 (stale)
            - generic [ref=e21]: Turbopack
          - img
      - dialog "Runtime ReferenceError" [ref=e23]:
        - generic [ref=e26]:
          - generic [ref=e27]:
            - generic [ref=e28]:
              - generic [ref=e29]:
                - generic [ref=e30]: Runtime ReferenceError
                - generic [ref=e31]: Server
              - generic [ref=e32]:
                - button "Copy Error Info" [ref=e33] [cursor=pointer]:
                  - img [ref=e34]
                - button "No related documentation found" [disabled] [ref=e36]:
                  - img [ref=e37]
                - button "Attach Node.js inspector" [ref=e39] [cursor=pointer]:
                  - img [ref=e40]
            - generic [ref=e49]: NotificationProvider is not defined
          - generic [ref=e50]:
            - generic [ref=e51]:
              - paragraph [ref=e53]:
                - img [ref=e55]
                - generic [ref=e58]: src\app\layout.tsx (21:10) @ RootLayout
                - button "Open in editor" [ref=e59] [cursor=pointer]:
                  - img [ref=e61]
              - generic [ref=e64]:
                - generic [ref=e65]: 19 | <body suppressHydrationWarning>
                - generic [ref=e66]: "20 | {/* Wrap all children in NotificationProvider for global access */}"
                - generic [ref=e67]: "> 21 | <NotificationProvider>{children}</NotificationProvider>"
                - generic [ref=e68]: "| ^"
                - generic [ref=e69]: 22 | </body>
                - generic [ref=e70]: 23 | </html>
                - generic [ref=e71]: 24 | );
            - generic [ref=e72]:
              - generic [ref=e73]:
                - paragraph [ref=e74]:
                  - text: Call Stack
                  - generic [ref=e75]: "31"
                - button "Show 30 ignore-listed frame(s)" [ref=e76] [cursor=pointer]:
                  - text: Show 30 ignore-listed frame(s)
                  - img [ref=e77]
              - generic [ref=e79]:
                - generic [ref=e80]:
                  - text: RootLayout
                  - button "Open RootLayout in editor" [ref=e81] [cursor=pointer]:
                    - img [ref=e82]
                - text: src\app\layout.tsx (21:10)
        - generic [ref=e84]: "1"
        - generic [ref=e85]: "2"
    - generic [ref=e90] [cursor=pointer]:
      - button "Open Next.js Dev Tools" [ref=e91]:
        - img [ref=e92]
      - generic [ref=e96]:
        - button "Open issues overlay" [ref=e97]:
          - generic [ref=e98]:
            - generic [ref=e99]: "0"
            - generic [ref=e100]: "1"
          - generic [ref=e101]: Issue
        - button "Collapse issues badge" [ref=e102]:
          - img [ref=e103]
  - generic [ref=e106]:
    - img [ref=e107]
    - heading "This page couldn’t load" [level=1] [ref=e109]
    - paragraph [ref=e110]: A server error occurred. Reload to try again.
    - button "Reload" [ref=e113] [cursor=pointer]
  - paragraph [ref=e114]: ERROR 3086279452
```