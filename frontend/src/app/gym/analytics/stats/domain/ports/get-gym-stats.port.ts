import { Observable } from "rxjs";
import { GymStats } from "../models/gym-stats.model";

export abstract class GetGymStatsPort {
  abstract getGymStats(): Observable<GymStats>;
}
