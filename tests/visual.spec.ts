import { test, expect } from '@playwright/test'

const FILLED_PROFILE = {
  bodyweightKg: 75,
}

test('main stat sheet matches CSS baseline', async ({ page }) => {
  await page.goto('/')

  await page.evaluate((profile) => {
    localStorage.setItem('vitae-ascend:sheet', JSON.stringify({
      profile,
      tests: {
        pushups: { history: [] },
        pullups: { history: [] },
        broadjump: { history: [] },
        vertical_jump: { history: [] },
        grip_dyno: { history: [] },
        grip_hang: { history: [] },
        bench: { history: [] },
        deadlift: { history: [] },
        reaction: { history: [] },
        finger_tap: { history: [] },
        balance: { history: [] },
        sprint20: { history: [] },
        shuttle_5105: { history: [] },
        line_hops: { history: [] },
      },
    }))
  }, FILLED_PROFILE)

  await page.reload()

  await expect(page).toHaveScreenshot('visual-baseline.png', { fullPage: true, animations: 'disabled' })
})
