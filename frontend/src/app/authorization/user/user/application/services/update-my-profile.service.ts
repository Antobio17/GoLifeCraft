import { Observable } from "rxjs";
import { UpdateMyProfilePort } from "../../domain/ports/update-my-profile.port";
import { UpdateMyProfileRequest } from "../../domain/models/update-my-profile-request.model";

export class UpdateMyProfileService {
  constructor(private port: UpdateMyProfilePort) {}

  updateMyProfile(request: UpdateMyProfileRequest): Observable<void> {
    return this.port.updateMyProfile(request);
  }
}
