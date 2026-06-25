import { Observable } from "rxjs";

export abstract class DeleteUserPort {
  abstract deleteUser(userId: string): Observable<void>;
}
