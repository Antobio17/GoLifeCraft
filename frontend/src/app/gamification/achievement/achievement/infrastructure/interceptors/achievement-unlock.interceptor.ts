import { inject } from "@angular/core";
import { HttpInterceptorFn, HttpResponse } from "@angular/common/http";
import { tap } from "rxjs";
import { AchievementCelebrationService } from "../../application/services/achievement-celebration.service";

const READ_METHODS = ["GET", "HEAD", "OPTIONS"];
const API_PREFIX = "/api/";
const ACHIEVEMENTS_URL = "/api/v1/gamification/achievements";

export const achievementUnlockInterceptor: HttpInterceptorFn = (req, next) => {
  if (READ_METHODS.includes(req.method)) return next(req);

  if (!req.url.includes(API_PREFIX)) return next(req);

  if (req.url.includes(ACHIEVEMENTS_URL)) return next(req);

  const celebrations = inject(AchievementCelebrationService);

  return next(req).pipe(
    tap((event) => {
      if (!(event instanceof HttpResponse)) return;

      celebrations.requestCheck();
    }),
  );
};
