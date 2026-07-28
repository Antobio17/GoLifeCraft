import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, map } from "rxjs";
import { GetSessionStatsPort } from "../../domain/ports/get-session-stats.port";
import { SessionStats } from "../../domain/models/session-stats.model";

interface SessionStatsSingleResponse {
  data: {
    id: string;
    type: string;
    attributes: SessionStats;
  } | null;
}

@Injectable()
export class HttpGetSessionStatsAdapter extends GetSessionStatsPort {
  private http = inject(HttpClient);

  private readonly apiUrl = "/api/v1/gym/session";

  getSessionStats(id: string): Observable<SessionStats> {
    return this.http
      .get<SessionStatsSingleResponse>(this.apiUrl + "/" + id + "/stats")
      .pipe(
        map(
          (response) =>
            response.data?.attributes ?? { sessionId: id, workouts: [] },
        ),
      );
  }
}
