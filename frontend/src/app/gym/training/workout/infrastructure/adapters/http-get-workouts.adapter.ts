import { Injectable, inject } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { GetWorkoutsPort } from "../../domain/ports/get-workouts.port";
import { GetWorkoutsResponse } from "../../domain/models/get-workouts-response.model";

@Injectable()
export class HttpGetWorkoutsAdapter extends GetWorkoutsPort {
  private http = inject(HttpClient);

  private readonly apiUrl = "/api/v1/gym/workouts";

  getWorkouts(
    page: number = 1,
    pageSize: number = 20,
  ): Observable<GetWorkoutsResponse> {
    const params = new HttpParams()
      .set("page[number]", page.toString())
      .set("page[size]", pageSize.toString());

    return this.http.get<GetWorkoutsResponse>(this.apiUrl, { params });
  }
}
