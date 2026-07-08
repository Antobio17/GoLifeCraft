import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { DeleteSessionPort } from "../../domain/ports/delete-session.port";

@Injectable()
export class HttpDeleteSessionAdapter extends DeleteSessionPort {
  private http = inject(HttpClient);

  private readonly apiUrl = "/api/v1/gym/session";

  deleteSession(id: string): Observable<void> {
    return this.http.delete<void>(this.apiUrl + "/" + id);
  }
}
