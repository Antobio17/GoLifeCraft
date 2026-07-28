import { Observable } from "rxjs";
import { GetSessionStatsPort } from "../../domain/ports/get-session-stats.port";
import { SessionStats } from "../../domain/models/session-stats.model";

export class GetSessionStatsService {
  constructor(private getSessionStatsPort: GetSessionStatsPort) {}

  getSessionStats(id: string): Observable<SessionStats> {
    return this.getSessionStatsPort.getSessionStats(id);
  }
}
