import { inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { GetUserPort } from "../../domain/ports/get-user.port";
import { GetUserResponse } from "../../domain/models/get-user-response.model";

@Injectable()
export class HttpGetUserAdapter implements GetUserPort {
  private http = inject(HttpClient);

  getUser(userId: string): Observable<GetUserResponse> {
    return this.http.get<GetUserResponse>(
      `/api/v1/authorization/users/${userId}`,
    );
  }
}
