import { Injectable, inject } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { GetMenusPort } from "@nutrition/menu/menu/domain/ports/get-menus.port";
import { GetMenusResponse } from "@nutrition/menu/menu/domain/models/get-menus-response.model";

@Injectable()
export class HttpGetMenusAdapter extends GetMenusPort {
  private http = inject(HttpClient);

  private readonly apiUrl = "/api/v1/nutrition/menus";

  getMenus(
    page: number = 1,
    pageSize: number = 100,
    filterName?: string,
    orderBy?: string,
  ): Observable<GetMenusResponse> {
    let params = new HttpParams()
      .set("page[number]", page.toString())
      .set("page[size]", pageSize.toString());

    if (filterName) {
      params = params.set("filter[name]", filterName);
    }

    if (orderBy) {
      params = params.set("orderBy", orderBy);
    }

    return this.http.get<GetMenusResponse>(this.apiUrl, { params });
  }
}
