import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { GetMenuShoppingNeedsPort } from "@nutrition/menu/menu/domain/ports/get-menu-shopping-needs.port";
import { GetMenuShoppingNeedsResponse } from "@nutrition/menu/menu/domain/models/menu-shopping-needs.model";

@Injectable()
export class HttpGetMenuShoppingNeedsAdapter extends GetMenuShoppingNeedsPort {
  private http = inject(HttpClient);

  private readonly apiUrl = "/api/v1/nutrition/menu";

  getMenuShoppingNeeds(
    menuId: string,
  ): Observable<GetMenuShoppingNeedsResponse> {
    return this.http.get<GetMenuShoppingNeedsResponse>(
      `${this.apiUrl}/${menuId}/shopping-needs`,
    );
  }
}
