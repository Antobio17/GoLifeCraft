import { Injectable, inject } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { GetInventoriesPort } from "../../domain/ports/get-inventories.port";
import { GetInventoriesResponse } from "../../domain/models/get-inventories-response.model";

@Injectable()
export class HttpGetInventoriesAdapter extends GetInventoriesPort {
  private http = inject(HttpClient);

  private readonly apiUrl = "/api/v1/nutrition/pantry/inventories";

  getInventories(
    page: number = 1,
    pageSize: number = 20,
    filterShift?: string,
    filterStatus?: string,
  ): Observable<GetInventoriesResponse> {
    let params = new HttpParams()
      .set("page[number]", page.toString())
      .set("page[size]", pageSize.toString());

    if (filterShift) {
      params = params.set("filter[shift]", filterShift);
    }

    if (filterStatus) {
      params = params.set("filter[status]", filterStatus);
    }

    return this.http.get<GetInventoriesResponse>(this.apiUrl, { params });
  }
}
