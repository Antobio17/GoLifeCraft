import { Injectable, inject } from "@angular/core";
import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { GetUsersPort } from "../../domain/ports/get-users.port";
import { GetUsersResponse } from "../../domain/models/get-users-response.model";

@Injectable()
export class HttpGetUsersAdapter extends GetUsersPort {
  private http = inject(HttpClient);

  private readonly apiUrl = "/api/v1/authorization/users";

  getUsers(
    page: number = 1,
    pageSize: number = 10,
    filterUsername?: string,
    filterEmail?: string,
    filterRole?: string,
  ): Observable<GetUsersResponse> {
    const token = localStorage.getItem("token");
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    let params = new HttpParams()
      .set("page[number]", page.toString())
      .set("page[size]", pageSize.toString());

    if (filterUsername) {
      params = params.set("filter[username]", filterUsername);
    }

    if (filterEmail) {
      params = params.set("filter[email]", filterEmail);
    }

    if (filterRole) {
      params = params.set("filter[role]", filterRole);
    }

    return this.http.get<GetUsersResponse>(this.apiUrl, { headers, params });
  }
}
