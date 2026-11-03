import { Provider } from "@angular/core";
import { GetAchievementsPort } from "../../domain/ports/get-achievements.port";
import { MarkAchievementSeenPort } from "../../domain/ports/mark-achievement-seen.port";
import { HttpGetAchievementsAdapter } from "../adapters/http-get-achievements.adapter";
import { HttpMarkAchievementSeenAdapter } from "../adapters/http-mark-achievement-seen.adapter";
import { AchievementCelebrationService } from "../../application/services/achievement-celebration.service";
import { AchievementViewService } from "../../application/services/achievement-view.service";

export class AchievementCelebrationProviders {
  static getProviders(): Provider[] {
    return [
      { provide: GetAchievementsPort, useClass: HttpGetAchievementsAdapter },
      {
        provide: MarkAchievementSeenPort,
        useClass: HttpMarkAchievementSeenAdapter,
      },
      AchievementCelebrationService,
      AchievementViewService,
    ];
  }
}
