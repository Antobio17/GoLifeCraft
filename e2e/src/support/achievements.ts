import { Page } from "@playwright/test";

export const ACHIEVEMENTS_PATH = "/api/v1/gamification/achievements";

interface AchievementsBody {
  data: { attributes: { unseenTiers: string[] } }[];
}

export async function silenceAchievementCelebrations(page: Page): Promise<void> {
  await page.route(`**${ACHIEVEMENTS_PATH}`, async (route) => {
    const response = await route.fetch();
    const body = (await response.json()) as AchievementsBody;

    body.data.forEach((item) => {
      item.attributes.unseenTiers = [];
    });

    await route.fulfill({ response, json: body });
  });
}
