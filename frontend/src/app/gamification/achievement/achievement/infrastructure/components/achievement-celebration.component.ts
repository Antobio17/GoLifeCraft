import { Component, computed, inject } from "@angular/core";
import { takeUntilDestroyed, toObservable } from "@angular/core/rxjs-interop";
import { Router } from "@angular/router";
import { EMPTY, map, switchMap, timer } from "rxjs";
import { TranslationService } from "@shared/i18n/application/services/translation.service";
import { ContextualTranslatePipe } from "@shared/i18n/infrastructure/pipes/contextual-translate.pipe";
import { AchievementToastComponent } from "@shared/design-system/achievement-toast/infrastructure/components/achievement-toast.component";
import { AchievementCelebrationComponent as DsAchievementCelebrationComponent } from "@shared/design-system/achievement-celebration/infrastructure/components/achievement-celebration.component";
import { AchievementCelebrationService } from "../../application/services/achievement-celebration.service";
import { AchievementViewService } from "../../application/services/achievement-view.service";
import { CelebrationKind } from "../../domain/models/celebration-kind.enum";

const TOAST_DURATION_MS = 6000;

@Component({
  selector: "app-achievement-celebration",
  templateUrl: "./achievement-celebration.component.html",
  imports: [
    ContextualTranslatePipe,
    AchievementToastComponent,
    DsAchievementCelebrationComponent,
  ],
})
export class AchievementCelebrationComponent {
  private celebrations = inject(AchievementCelebrationService);
  private view = inject(AchievementViewService);
  private translationService = inject(TranslationService);
  private router = inject(Router);

  private readonly MODULE_PATH = "gamification/achievement/achievement";

  readonly current = this.celebrations.current;

  readonly isToast = computed(
    () => CelebrationKind.Toast === this.current()?.kind,
  );

  readonly isFullScreen = computed(
    () => CelebrationKind.FullScreen === this.current()?.kind,
  );

  readonly title = computed(() => {
    const current = this.current();

    if (!current) return "";

    return this.view.name(current, this.translate);
  });

  readonly eyebrow = computed(() => {
    const current = this.current();

    if (!current) return "";

    return this.t("achievements.celebration.eyebrow", {
      tier: this.view.tierLabel(current.tier, this.translate),
    });
  });

  readonly description = computed(() => {
    const current = this.current();

    if (!current) return "";

    return this.view.description(
      current.key,
      current.threshold,
      this.translate,
    );
  });

  readonly chips = computed(() => {
    const current = this.current();

    if (!current?.nextTier || null === current.nextThreshold) return [];

    return [
      this.t("achievements.celebration.next", {
        tier: this.view.tierLabel(current.nextTier, this.translate),
        target: current.nextThreshold,
      }),
    ];
  });

  private readonly translate = (
    key: string,
    params?: Record<string, unknown>,
  ): string => this.t(key, params);

  constructor() {
    this.translationService.loadModuleTranslations(this.MODULE_PATH);
    this.celebrations.requestCheck();

    toObservable(this.current)
      .pipe(
        switchMap((current) =>
          CelebrationKind.Toast === current?.kind
            ? timer(TOAST_DURATION_MS).pipe(map(() => current.key))
            : EMPTY,
        ),
        takeUntilDestroyed(),
      )
      .subscribe((key) => this.celebrations.dismiss(key));
  }

  dismiss(): void {
    const current = this.current();

    if (!current) return;

    this.celebrations.dismiss(current.key);
  }

  openAchievements(): void {
    this.dismiss();
    this.router.navigate(["/achievements"]);
  }

  private t(key: string, params?: Record<string, unknown>): string {
    return this.translationService.translate(key, this.MODULE_PATH, params);
  }
}
