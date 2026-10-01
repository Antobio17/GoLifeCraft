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

  readonly displayName = computed(() => {
    const name = this.authSessionService.getName();
    if (name) return name;

    const local = this.authSessionService.getUsername().trim().split("@")[0];
    if (!local) return "";
    return local.charAt(0).toUpperCase() + local.slice(1);
  });

  readonly initial = computed(() => {
    const value = this.displayName().trim();
    return value ? value.charAt(0).toUpperCase() : "?";
  });

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
