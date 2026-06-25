import { Observable } from "rxjs";
import { GetMyProfilePort } from "../../domain/ports/get-my-profile.port";
import { GetMyProfileResponse } from "../../domain/models/get-my-profile-response.model";

export class GetMyProfileService {
  constructor(private port: GetMyProfilePort) {}

  getMyProfile(): Observable<GetMyProfileResponse> {
    return this.port.getMyProfile();
  }
}
