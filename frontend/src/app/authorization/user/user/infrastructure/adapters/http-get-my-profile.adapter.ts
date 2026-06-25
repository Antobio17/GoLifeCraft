import { inject, Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs";
import { GetMyProfilePort } from "../../domain/ports/get-my-profile.port";
import { GetMyProfileResponse } from "../../domain/models/get-my-profile-response.model";

@Injectable()
export class HttpGetMyProfileAdapter implements GetMyProfilePort {
  private http = inject(HttpClient);

  getMyProfile(): Observable<GetMyProfileResponse> {
    const token = localStorage.getItem("token");
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    return this.http.get<GetMyProfileResponse>("/api/v1/authorization/me", {
      headers,
    });
  }
}
