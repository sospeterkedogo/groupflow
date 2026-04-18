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
      - heading "Create an account" [level=1] [ref=e10]
      - paragraph [ref=e11]: Create an account to join your project team.
    - generic [ref=e12]:
      - generic [ref=e13]:
        - generic [ref=e14]: Email
        - generic [ref=e15]:
          - img [ref=e16]
          - textbox "school.email@edu.com" [ref=e19]: scholar1_682816@edu.com
      - generic [ref=e20]:
        - generic [ref=e21]:
          - generic [ref=e22]: Password
          - generic [ref=e23]: "Strength: Secure"
        - generic [ref=e24]:
          - img [ref=e25]
          - textbox "••••••••" [ref=e28]: Test1234!
      - generic [ref=e29]:
        - generic [ref=e30]: ID Number
        - textbox "ID-001234" [ref=e31]: ID-S1-682816
      - generic [ref=e32]:
        - checkbox "I accept the Terms , Privacy , and Cookies ." [checked] [active] [ref=e33]
        - generic [ref=e34]:
          - text: I accept the
          - button "Terms" [ref=e35] [cursor=pointer]
          - text: ","
          - button "Privacy" [ref=e36] [cursor=pointer]
          - text: ", and"
          - button "Cookies" [ref=e37] [cursor=pointer]
          - text: .
      - generic [ref=e38]:
        - button "Create account" [ref=e39] [cursor=pointer]
        - button "Already have an account? Sign in" [ref=e40] [cursor=pointer]
  - button "Open Next.js Dev Tools" [ref=e46] [cursor=pointer]:
    - img [ref=e47]
  - alert [ref=e51]
```