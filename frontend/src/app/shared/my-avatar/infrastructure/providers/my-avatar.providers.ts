import { Provider } from "@angular/core";
import { MyAvatarService } from "@shared/my-avatar/application/services/my-avatar.service";

export class MyAvatarProviders {
  static getProviders(): Provider[] {
    return [MyAvatarService];
  }
}
