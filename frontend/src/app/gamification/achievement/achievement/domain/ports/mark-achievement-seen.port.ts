import { Observable } from "rxjs";

export abstract class MarkAchievementSeenPort {
  abstract markSeen(key: string): Observable<void>;
}
