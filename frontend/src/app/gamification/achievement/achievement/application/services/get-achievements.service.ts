import { inject } from "@angular/core";
import { Observable } from "rxjs";
import { GetAchievementsPort } from "../../domain/ports/get-achievements.port";
import { Achievement } from "../../domain/models/achievement.model";

export class GetAchievementsService {
  private port = inject(GetAchievementsPort);

  getAchievements(): Observable<Achievement[]> {
    return this.port.getAchievements();
  }
}
