import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { MarkAchievementSeenPort } from "../../domain/ports/mark-achievement-seen.port";

@Injectable()
export class HttpMarkAchievementSeenAdapter extends MarkAchievementSeenPort {
  private http = inject(HttpClient);

  markSeen(key: string): Observable<void> {
    return this.http.post<void>(
      `/api/v1/gamification/achievements/${encodeURIComponent(key)}/seen`,
      null,
    );
  }
}
