import { Injectable, inject } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs";
import { CreateUserPort } from "../../domain/ports/create-user.port";
import { CreateUserRequest } from "../../domain/models/create-user.model";

@Injectable()
export class HttpCreateUserAdapter extends CreateUserPort {
  private http = inject(HttpClient);

  private readonly apiUrl = "/api/v1/authorization/user";

  createUser(request: CreateUserRequest): Observable<void> {
    const token = localStorage.getItem("token");
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    });

    return this.http.post<void>(this.apiUrl, request, { headers });
  }
}
