import { computed, inject } from "@angular/core";
import { Observable } from "rxjs";
import { AggregateImageKind } from "@shared/aggregate-image/domain/models/aggregate-image-kind.enum";
import { AggregateImageService } from "@shared/aggregate-image/application/services/aggregate-image.service";
import { AuthSessionService } from "@shared/auth/application/services/auth-session.service";

const MY_AVATAR_ID = "me";

export class MyAvatarService {
  private aggregateImageService = inject(AggregateImageService);
  private authSessionService = inject(AuthSessionService);

  readonly url = computed<string | null>(() =>
    this.aggregateImageService.objectUrl(
      AggregateImageKind.User,
      MY_AVATAR_ID,
      this.authSessionService.getAvatar(),
    )(),
  );

  upload(file: File): Observable<void> {
    return this.aggregateImageService.upload(
      AggregateImageKind.User,
      MY_AVATAR_ID,
      file,
    );
  }

  remove(): Observable<void> {
    return this.aggregateImageService.remove(
      AggregateImageKind.User,
      MY_AVATAR_ID,
    );
  }
}
