import { Injectable, inject } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { GetDiaryShoppingNeedsPort } from "@nutrition/diary/diary/domain/ports/get-diary-shopping-needs.port";
import { GetDiaryShoppingNeedsResponse } from "@nutrition/diary/diary/domain/models/get-diary-shopping-needs-response.model";

@Injectable()
export class HttpGetDiaryShoppingNeedsAdapter extends GetDiaryShoppingNeedsPort {
  private http = inject(HttpClient);

  private readonly apiUrl = "/api/v1/nutrition/diary/shopping-needs";

  getDiaryShoppingNeeds(
    fromDate: string,
    toDate: string,
  ): Observable<GetDiaryShoppingNeedsResponse> {
    const params = new HttpParams().set("from", fromDate).set("to", toDate);

    return this.http.get<GetDiaryShoppingNeedsResponse>(this.apiUrl, {
      params,
    });
  }
}
