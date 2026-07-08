import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, map } from "rxjs";
import { GetGymStatsPort } from "../../domain/ports/get-gym-stats.port";
import { GymStats } from "../../domain/models/gym-stats.model";

interface GymStatsSingleResponse {
  data: {
    id: string;
    type: string;
    attributes: GymStats;
  } | null;
}

@Injectable()
export class HttpGetGymStatsAdapter extends GetGymStatsPort {
  private http = inject(HttpClient);

  private readonly apiUrl = "/api/v1/gym/stats";

  getGymStats(): Observable<GymStats> {
    return this.http
      .get<GymStatsSingleResponse>(this.apiUrl)
      .pipe(map((response) => response.data?.attributes ?? this.emptyStats()));
  }

  private emptyStats(): GymStats {
    return {
      totalSessions: 0,
      totalExercises: 0,
      totalSets: 0,
      totalVolumeKg: 0,
      totalPlannedMinutes: 0,
      sessionVolumes: [],
      muscleDistribution: [],
      volumeProgression: [],
    };
  }
}
