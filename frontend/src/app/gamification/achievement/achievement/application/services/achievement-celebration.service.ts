import { computed, inject, signal } from "@angular/core";
import { Subject, catchError, debounceTime, of, switchMap } from "rxjs";
import { AuthSessionService } from "@shared/auth/application/services/auth-session.service";
import { ImpersonationService } from "@shared/auth/application/services/impersonation.service";
import { GetAchievementsPort } from "../../domain/ports/get-achievements.port";
import { MarkAchievementSeenPort } from "../../domain/ports/mark-achievement-seen.port";
import { Achievement } from "../../domain/models/achievement.model";
import { AchievementTier } from "../../domain/models/achievement-tier.enum";
import { AchievementUnlock } from "../../domain/models/achievement-unlock.model";
import { CelebrationKind } from "../../domain/models/celebration-kind.enum";

const CHECK_DEBOUNCE_MS = 600;
const FULL_SCREEN_TIERS: AchievementTier[] = [
  AchievementTier.Gold,
  AchievementTier.Platinum,
];

export class AchievementCelebrationService {
  private getAchievementsPort = inject(GetAchievementsPort);
  private markSeenPort = inject(MarkAchievementSeenPort);
  private authSession = inject(AuthSessionService);
  private impersonation = inject(ImpersonationService);

  private readonly checks = new Subject<void>();
  private readonly queue = signal<AchievementUnlock[]>([]);

  readonly current = computed(() => this.queue()[0] ?? null);

  constructor() {
    this.checks
      .pipe(
        debounceTime(CHECK_DEBOUNCE_MS),
        switchMap(() =>
          this.getAchievementsPort
            .getAchievements()
            .pipe(catchError(() => of<Achievement[]>([]))),
        ),
      )
      .subscribe((achievements) => this.enqueue(achievements));
  }

  requestCheck(): void {
    if (!this.authSession.isAuthenticated()) return;

    if (this.impersonation.isImpersonating()) return;

    this.checks.next();
  }

  dismiss(key: string): void {
    const current = this.current();

    if (current?.key !== key) return;

    this.queue.update((queue) => queue.slice(1));
    this.markSeenPort
      .markSeen(key)
      .pipe(catchError(() => of(null)))
      .subscribe();
  }

  private enqueue(achievements: Achievement[]): void {
    const queued = new Set(this.queue().map((unlock) => unlock.key));
    const fresh = achievements
      .filter((achievement) => !queued.has(achievement.key))
      .map((achievement) => this.unlockOf(achievement))
      .filter((unlock): unlock is AchievementUnlock => null !== unlock);

    if (0 === fresh.length) return;

    this.queue.update((queue) => [...queue, ...fresh]);
  }

  private unlockOf(achievement: Achievement): AchievementUnlock | null {
    const highest = achievement.tiers
      .filter((tier) => achievement.unseenTiers.includes(tier.tier))
      .at(-1);

    if (!highest) return null;

    return {
      key: achievement.key,
      module: achievement.module,
      icon: achievement.icon,
      tier: highest.tier,
      threshold: highest.threshold,
      nextTier: achievement.nextTier,
      nextThreshold: achievement.nextThreshold,
      kind: FULL_SCREEN_TIERS.includes(highest.tier)
        ? CelebrationKind.FullScreen
        : CelebrationKind.Toast,
    };
  }
}
