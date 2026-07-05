import { Injectable, inject } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs";
import { Theme } from "../../domain/models/theme.model";
import { UpdateThemePort } from "../../domain/ports/update-theme.port";

@Injectable()
export class HttpUpdateThemeAdapter implements UpdateThemePort {
  private http = inject(HttpClient);

  update(theme: Theme): Observable<void> {
    const token = localStorage.getItem("token");
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    return this.http.post<void>(
      "/api/v1/authorization/me/theme",
      { theme },
      { headers },
    );
  }
}
