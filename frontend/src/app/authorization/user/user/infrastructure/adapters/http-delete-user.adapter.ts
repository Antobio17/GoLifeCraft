import { Injectable, inject } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { DeleteUserPort } from "../../domain/ports/delete-user.port";

@Injectable()
export class HttpDeleteUserAdapter extends DeleteUserPort {
  private http = inject(HttpClient);

  private readonly apiUrl = "/api/v1/authorization/user";

  deleteUser(userId: string): Observable<void> {
    const token = localStorage.getItem("token");
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    });

    return this.http
      .delete(`${this.apiUrl}/${userId}`, { headers })
      .pipe(map(() => undefined));
  }
}
