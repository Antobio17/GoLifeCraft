import { Observable } from "rxjs";
import { UpdateMenuDetailsPort } from "../../domain/ports/update-menu-details.port";
import { UpdateMenuDetailsRequest } from "../../domain/models/update-menu-details-request.model";

export class UpdateMenuDetailsService {
  constructor(private updateMenuDetailsPort: UpdateMenuDetailsPort) {}

  updateMenuDetails(
    menuId: string,
    request: UpdateMenuDetailsRequest,
  ): Observable<void> {
    return this.updateMenuDetailsPort.updateMenuDetails(menuId, request);
  }
}
