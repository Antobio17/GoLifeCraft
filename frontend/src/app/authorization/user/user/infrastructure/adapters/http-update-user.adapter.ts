import { Injectable, inject } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { UpdateUserPort } from "../../domain/ports/update-user.port";
import { UpdateUserRequest } from "../../domain/models/update-user-request.model";
import { GetUserResponse } from "../../domain/models/get-user-response.model";

@Injectable()
export class HttpUpdateUserAdapter extends UpdateUserPort {
  private http = inject(HttpClient);

  private readonly apiUrl = "/api/v1/authorization/user";

  updateUser(userId: string, request: UpdateUserRequest): Observable<void> {
    const token = localStorage.getItem("token");
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    });

    return this.http
      .put(`${this.apiUrl}/${userId}`, request, { headers })
      .pipe(map(() => undefined));
  }

  getUser(userId: string): Observable<GetUserResponse> {
    const token = localStorage.getItem("token");
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http.get<GetUserResponse>(`${this.apiUrl}/${userId}`, {
      headers,
    });
  }
}
