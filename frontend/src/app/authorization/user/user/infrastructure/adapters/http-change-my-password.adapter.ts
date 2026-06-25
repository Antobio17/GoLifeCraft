import { inject, Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs";
import { ChangeMyPasswordPort } from "../../domain/ports/change-my-password.port";
import { ChangeMyPasswordRequest } from "../../domain/models/change-my-password-request.model";

@Injectable()
export class HttpChangeMyPasswordAdapter implements ChangeMyPasswordPort {
  private http = inject(HttpClient);

  changeMyPassword(request: ChangeMyPasswordRequest): Observable<void> {
    const token = localStorage.getItem("token");
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    return this.http.put<void>("/api/v1/authorization/me/password", request, {
      headers,
    });
  }
}
