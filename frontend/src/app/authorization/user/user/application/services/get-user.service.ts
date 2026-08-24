import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { GetUserPort } from "../../domain/ports/get-user.port";
import { UserDetail } from "../../domain/models/user-detail.model";

export class GetUserService {
  constructor(private port: GetUserPort) {}

  getUser(userId: string): Observable<UserDetail> {
    return this.port.getUser(userId).pipe(
      map((response) => ({
        id: response.data.id,
        ...response.data.attributes,
      })),
    );
  }
}
