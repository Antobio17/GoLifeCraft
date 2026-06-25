import { inject, Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs";
import { UpdateMyProfilePort } from "../../domain/ports/update-my-profile.port";
import { UpdateMyProfileRequest } from "../../domain/models/update-my-profile-request.model";

@Injectable()
export class HttpUpdateMyProfileAdapter implements UpdateMyProfilePort {
  private http = inject(HttpClient);

  updateMyProfile(request: UpdateMyProfileRequest): Observable<void> {
    const token = localStorage.getItem("token");
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    return this.http.put<void>("/api/v1/authorization/me", request, {
      headers,
    });
  }
}
