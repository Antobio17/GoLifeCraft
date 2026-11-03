import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, map } from "rxjs";
import { GetAchievementsPort } from "../../domain/ports/get-achievements.port";
import { Achievement } from "../../domain/models/achievement.model";
import { GetAchievementsResponse } from "../../domain/models/get-achievements-response.model";

@Injectable()
export class HttpGetAchievementsAdapter extends GetAchievementsPort {
  private http = inject(HttpClient);

  private readonly apiUrl = "/api/v1/gamification/achievements";

  getAchievements(): Observable<Achievement[]> {
    return this.http
      .get<GetAchievementsResponse>(this.apiUrl)
      .pipe(
        map((response) =>
          response.data.map((item) => ({ key: item.id, ...item.attributes })),
        ),
      );
  }
}
