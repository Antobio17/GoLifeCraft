import { Observable } from "rxjs";
import { CreateMenuPort } from "../../domain/ports/create-menu.port";
import { CreateMenuRequest } from "../../domain/models/write-menu.model";

export class CreateMenuService {
  constructor(private createMenuPort: CreateMenuPort) {}

  createMenu(request: CreateMenuRequest): Observable<void> {
    return this.createMenuPort.createMenu(request);
  }
}
