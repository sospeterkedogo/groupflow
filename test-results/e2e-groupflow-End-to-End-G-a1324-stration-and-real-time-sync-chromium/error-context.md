# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: e2e-groupflow.spec.ts >> End-to-End: GroupFlow Control Station >> Simulate 4 scholars: signup, team formation, task orchestration, and real-time sync
- Location: tests\e2e-groupflow.spec.ts:5:7

# Error details

```
Test timeout of 120000ms exceeded.
```

# Page snapshot

```yaml
- generic [ref=e1]:
  - generic [ref=e4]:
    - generic [ref=e5]:
      - img [ref=e7]
      - heading "Create an account" [level=1] [ref=e9]
      - paragraph [ref=e10]: Create an account to join your project team.
    - generic [ref=e11]:
      - generic [ref=e12]:
        - generic [ref=e13]: Email
        - generic [ref=e14]:
          - img [ref=e15]
          - textbox "school.email@edu.com" [ref=e18]: scholar1_680034@edu.com
      - generic [ref=e19]:
        - generic [ref=e20]:
          - generic [ref=e21]: Password
          - generic [ref=e22]: "Strength: Secure"
        - generic [ref=e23]:
          - img [ref=e24]
          - textbox "••••••••" [ref=e27]: Test1234!
      - generic [ref=e28]:
        - generic [ref=e29]: ID Number
        - textbox "ID-001234" [ref=e30]: ID-S1-680034
      - generic [ref=e31]:
        - checkbox "I accept the Terms , Privacy , and Cookies ." [checked] [active] [ref=e32]
        - generic [ref=e33]:
          - text: I accept the
          - button "Terms" [ref=e34] [cursor=pointer]
          - text: ","
          - button "Privacy" [ref=e35] [cursor=pointer]
          - text: ", and"
          - button "Cookies" [ref=e36] [cursor=pointer]
          - text: .
      - generic [ref=e37]:
        - button "Create account" [ref=e38] [cursor=pointer]
        - button "Already have an account? Sign in" [ref=e39] [cursor=pointer]
  - button "Open Next.js Dev Tools" [ref=e45] [cursor=pointer]:
    - img [ref=e46]
  - alert [ref=e49]
```