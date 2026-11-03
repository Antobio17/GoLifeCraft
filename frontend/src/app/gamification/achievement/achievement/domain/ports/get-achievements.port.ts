import { Observable } from "rxjs";
import { Achievement } from "../models/achievement.model";

export abstract class GetAchievementsPort {
  abstract getAchievements(): Observable<Achievement[]>;
}
