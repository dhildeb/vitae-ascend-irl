# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: visual.spec.ts >> main stat sheet matches CSS baseline
- Location: tests/visual.spec.ts:7:1

# Error details

```
Error: expect(page).toHaveScreenshot(expected) failed

  Expected an image 1280px by 1032px, received 1280px by 1318px. 447265 pixels (ratio 0.27 of all image pixels) are different.

  Snapshot: visual-baseline.png

Call log:
  - Expect "toHaveScreenshot(visual-baseline.png)" with timeout 10000ms
    - verifying given screenshot expectation
  - taking page screenshot
    - disabled all CSS animations
  - waiting for fonts to load...
  - fonts loaded
  - Expected an image 1280px by 1032px, received 1280px by 1318px. 447265 pixels (ratio 0.27 of all image pixels) are different.
  - waiting 100ms before taking screenshot
  - taking page screenshot
    - disabled all CSS animations
  - waiting for fonts to load...
  - fonts loaded
  - captured a stable screenshot
  - Expected an image 1280px by 1032px, received 1280px by 1318px. 447265 pixels (ratio 0.27 of all image pixels) are different.

```

# Page snapshot

```yaml
- generic [ref=f1e3]:
  - banner [ref=f1e4]:
    - generic [ref=f1e5]: Character Sheet
    - heading "Vitae Ascend" [level=1] [ref=f1e6]
    - paragraph [ref=f1e7]: "Bodyweight: 75kg · Testing 3 of 3 stats so far"
  - main [ref=f1e8]:
    - generic [ref=f1e9]:
      - generic [ref=f1e10]:
        - generic [ref=f1e11]: STR
        - generic [ref=f1e12]: Absolute force & power
      - generic [ref=f1e13]: —
      - heading "Strength" [level=3] [ref=f1e15]
      - paragraph [ref=f1e16]: Take all 4 core tests below to reveal this stat
      - generic [ref=f1e17]:
        - generic [ref=f1e18]:
          - generic [ref=f1e19]:
            - generic [ref=f1e20]: Push-Ups
            - generic [ref=f1e21]: Not tested
          - button "Test" [ref=f1e22]
        - generic [ref=f1e23]:
          - generic [ref=f1e24]:
            - generic [ref=f1e25]: Pull-Ups
            - generic [ref=f1e26]: Not tested
          - button "Test" [ref=f1e27]
        - generic [ref=f1e28]:
          - generic [ref=f1e29]:
            - generic [ref=f1e30]: Grip Strength
            - generic [ref=f1e31]: "Choose one:"
          - generic [ref=f1e32]:
            - button "Dynamometer" [ref=f1e33]
            - button "Dead Hang" [ref=f1e34]
        - generic [ref=f1e35]:
          - generic [ref=f1e36]:
            - generic [ref=f1e37]: Lower-Body Power
            - generic [ref=f1e38]: "Choose one:"
          - generic [ref=f1e39]:
            - button "Broad Jump" [ref=f1e40]
            - button "Vertical Jump" [ref=f1e41]
        - generic [ref=f1e42]: Optional — refines the score if you have the equipment
        - generic [ref=f1e43]:
          - generic [ref=f1e44]:
            - generic [ref=f1e45]: Bench Press 1RM
            - generic [ref=f1e46]: Not tested
          - button "Add" [ref=f1e47]
        - generic [ref=f1e48]:
          - generic [ref=f1e49]:
            - generic [ref=f1e50]: Deadlift 1RM
            - generic [ref=f1e51]: Not tested
          - button "Add" [ref=f1e52]
    - generic [ref=f1e53]:
      - generic [ref=f1e54]:
        - generic [ref=f1e55]: DEX
        - generic [ref=f1e56]: Speed, reflex & balance
      - generic [ref=f1e57]: —
      - heading "Dexterity" [level=3] [ref=f1e59]
      - paragraph [ref=f1e60]: Take all 5 core tests below to reveal this stat
      - generic [ref=f1e61]:
        - generic [ref=f1e62]:
          - generic [ref=f1e63]:
            - generic [ref=f1e64]: Reaction Time
            - generic [ref=f1e65]: Not tested
          - button "Test" [ref=f1e66]
        - generic [ref=f1e67]:
          - generic [ref=f1e68]:
            - generic [ref=f1e69]: Finger Tap Speed
            - generic [ref=f1e70]: Not tested
          - button "Test" [ref=f1e71]
        - generic [ref=f1e72]:
          - generic [ref=f1e73]:
            - generic [ref=f1e74]: Single-Leg Balance
            - generic [ref=f1e75]: Not tested
          - button "Test" [ref=f1e76]
        - generic [ref=f1e77]:
          - generic [ref=f1e78]:
            - generic [ref=f1e79]: 20m Sprint
            - generic [ref=f1e80]: Not tested
          - button "Test" [ref=f1e81]
        - generic [ref=f1e82]:
          - generic [ref=f1e83]:
            - generic [ref=f1e84]: Agility
            - generic [ref=f1e85]: "Choose one:"
          - generic [ref=f1e86]:
            - button "Shuttle Run" [ref=f1e87]
            - button "Line Hops" [ref=f1e88]
    - generic [ref=f1e89]:
      - generic [ref=f1e90]:
        - generic [ref=f1e91]: CON
        - generic [ref=f1e92]: Stamina & endurance
      - generic [ref=f1e93]: —
      - heading "Constitution" [level=3] [ref=f1e95]
      - paragraph [ref=f1e96]: Take all 7 core tests below to reveal this stat
      - generic [ref=f1e97]:
        - generic [ref=f1e98]:
          - generic [ref=f1e99]:
            - generic [ref=f1e100]: Plank Hold
            - generic [ref=f1e101]: Not tested
          - button "Test" [ref=f1e102]
        - generic [ref=f1e103]:
          - generic [ref=f1e104]:
            - generic [ref=f1e105]: Max Bodyweight Squats (60s)
            - generic [ref=f1e106]: Not tested
          - button "Test" [ref=f1e107]
        - generic [ref=f1e108]:
          - generic [ref=f1e109]:
            - generic [ref=f1e110]: Breath Hold
            - generic [ref=f1e111]: Not tested
          - button "Test" [ref=f1e112]
        - generic [ref=f1e113]:
          - generic [ref=f1e114]:
            - generic [ref=f1e115]: Heart Rate Recovery
            - generic [ref=f1e116]: Not tested
          - button "Test" [ref=f1e117]
        - generic [ref=f1e118]:
          - generic [ref=f1e119]:
            - generic [ref=f1e120]: Aerobic Endurance
            - generic [ref=f1e121]: "Choose one:"
          - generic [ref=f1e122]:
            - button "Mile Run" [ref=f1e123]
            - button "Step Test" [ref=f1e124]
        - generic [ref=f1e125]:
          - generic [ref=f1e126]:
            - generic [ref=f1e127]: Anaerobic Endurance
            - generic [ref=f1e128]: "Choose one:"
          - generic [ref=f1e129]:
            - button "Beep Test" [ref=f1e130]
            - button "Burpees" [ref=f1e131]
        - generic [ref=f1e132]:
          - generic [ref=f1e133]:
            - generic [ref=f1e134]: Resting Heart Rate
            - generic [ref=f1e135]: "Choose one:"
          - generic [ref=f1e136]:
            - button "Manual Pulse" [ref=f1e137]
            - button "Device Reading" [ref=f1e138]
        - generic [ref=f1e139]: Optional — refines the score if you have the equipment
        - generic [ref=f1e140]:
          - generic [ref=f1e141]:
            - generic [ref=f1e142]: Farmer's Carry
            - generic [ref=f1e143]: Not tested
          - button "Add" [ref=f1e144]
        - generic [ref=f1e145]:
          - generic [ref=f1e146]:
            - generic [ref=f1e147]: Illness Frequency
            - generic [ref=f1e148]: Not tested
          - button "Add" [ref=f1e149]
        - generic [ref=f1e150]:
          - generic [ref=f1e151]:
            - generic [ref=f1e152]: Cold Tolerance
            - generic [ref=f1e153]: Not tested
          - button "Add" [ref=f1e154]
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test'
  2  | 
  3  | const FILLED_PROFILE = {
  4  |   bodyweightKg: 75,
  5  | }
  6  | 
  7  | test('main stat sheet matches CSS baseline', async ({ page }) => {
  8  |   await page.goto('/')
  9  | 
  10 |   await page.evaluate((profile) => {
  11 |     localStorage.setItem('vitae-ascend:sheet', JSON.stringify({
  12 |       profile,
  13 |       tests: {
  14 |         pushups: { history: [] },
  15 |         pullups: { history: [] },
  16 |         broadjump: { history: [] },
  17 |         vertical_jump: { history: [] },
  18 |         grip_dyno: { history: [] },
  19 |         grip_hang: { history: [] },
  20 |         bench: { history: [] },
  21 |         deadlift: { history: [] },
  22 |         reaction: { history: [] },
  23 |         finger_tap: { history: [] },
  24 |         balance: { history: [] },
  25 |         sprint20: { history: [] },
  26 |         shuttle_5105: { history: [] },
  27 |         line_hops: { history: [] },
  28 |       },
  29 |     }))
  30 |   }, FILLED_PROFILE)
  31 | 
  32 |   await page.reload()
  33 | 
> 34 |   await expect(page).toHaveScreenshot('visual-baseline.png', { fullPage: true, animations: 'disabled' })
     |                      ^ Error: expect(page).toHaveScreenshot(expected) failed
  35 | })
  36 | 
```