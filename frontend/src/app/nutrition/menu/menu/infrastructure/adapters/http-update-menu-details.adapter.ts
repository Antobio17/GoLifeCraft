import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { UpdateMenuDetailsPort } from "../../domain/ports/update-menu-details.port";
import { UpdateMenuDetailsRequest } from "../../domain/models/update-menu-details-request.model";

@Injectable()
export class HttpUpdateMenuDetailsAdapter extends UpdateMenuDetailsPort {
  private http = inject(HttpClient);

  private readonly apiUrl = "/api/v1/nutrition/menu";

  updateMenuDetails(
    menuId: string,
    request: UpdateMenuDetailsRequest,
  ): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${menuId}/details`, request);
  }
}
