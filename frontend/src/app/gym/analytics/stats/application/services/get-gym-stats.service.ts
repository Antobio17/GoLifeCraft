import { Observable } from "rxjs";
import { GetGymStatsPort } from "../../domain/ports/get-gym-stats.port";
import { GymStats } from "../../domain/models/gym-stats.model";

export class GetGymStatsService {
  constructor(private getGymStatsPort: GetGymStatsPort) {}

  getGymStats(): Observable<GymStats> {
    return this.getGymStatsPort.getGymStats();
  }
}
