import { Observable } from "rxjs";
import { SessionStats } from "../models/session-stats.model";

export abstract class GetSessionStatsPort {
  abstract getSessionStats(id: string): Observable<SessionStats>;
}
