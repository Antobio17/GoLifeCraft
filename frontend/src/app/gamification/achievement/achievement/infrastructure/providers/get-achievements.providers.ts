import { Provider } from "@angular/core";
import { GetAchievementsPort } from "../../domain/ports/get-achievements.port";
import { HttpGetAchievementsAdapter } from "../adapters/http-get-achievements.adapter";
import { GetAchievementsService } from "../../application/services/get-achievements.service";
import { AchievementViewService } from "../../application/services/achievement-view.service";

export class GetAchievementsProviders {
  static getProviders(): Provider[] {
    return [
      { provide: GetAchievementsPort, useClass: HttpGetAchievementsAdapter },
      GetAchievementsService,
      AchievementViewService,
    ];
  }
}
