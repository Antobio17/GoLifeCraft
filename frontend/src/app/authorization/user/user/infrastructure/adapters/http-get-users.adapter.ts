import { inject, Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { GetUsersPort } from "../../domain/ports/get-users.port";
import { GetUsersResponse } from "../../domain/models/get-users-response.model";

@Injectable()
export class HttpGetUsersAdapter implements GetUsersPort {
  private http = inject(HttpClient);

  getUsers(page: number, pageSize: number): Observable<GetUsersResponse> {
    const params = new HttpParams()
      .set("page[number]", page.toString())
      .set("page[size]", pageSize.toString());

    return this.http.get<GetUsersResponse>("/api/v1/authorization/users", {
      params,
    });
  }
}
