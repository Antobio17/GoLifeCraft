import { Injectable, inject } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { GetKitchenDayPort } from "../../domain/ports/get-kitchen-day.port";
import { GetKitchenDayResponse } from "../../domain/models/get-kitchen-day-response.model";

@Injectable()
export class HttpGetKitchenDayAdapter extends GetKitchenDayPort {
  private http = inject(HttpClient);

  private readonly apiUrl = "/api/v1/nutrition/kitchen/day";

  getKitchenDay(date: string): Observable<GetKitchenDayResponse> {
    const params = new HttpParams().set("date", date);

    return this.http.get<GetKitchenDayResponse>(this.apiUrl, { params });
  }
}
