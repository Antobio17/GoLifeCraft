import { Component, computed, inject, input, signal } from "@angular/core";
import { Router } from "@angular/router";
import { toObservable, takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { switchMap } from "rxjs/operators";
import { GetUserService } from "../../application/services/get-user.service";
import { ImpersonateUserService } from "../../application/services/impersonate-user.service";
import { GetUserProvider } from "../providers/get-user.provider";
import { ImpersonateUserProvider } from "../providers/impersonate-user.provider";
import { UserDetail } from "../../domain/models/user-detail.model";
import { FloatingToastService } from "@shared/floating-toasts/application/services/floating-toast.service";
import { TranslationService } from "@shared/i18n/application/services/translation.service";
import { ContextualTranslatePipe } from "@shared/i18n/infrastructure/pipes/contextual-translate.pipe";
import { PageWrapperComponent } from "@shared/design-system/page-wrapper/infrastructure/components/page-wrapper.component";
import { ScreenHeaderComponent } from "@shared/design-system/screen-header/infrastructure/components/screen-header.component";
import { SplitViewComponent } from "@shared/design-system/split-view/infrastructure/components/split-view.component";
import { StackComponent } from "@shared/design-system/stack/infrastructure/components/stack.component";
import { TextComponent } from "@shared/design-system/text/infrastructure/components/text.component";
import { ProfileCardComponent } from "@shared/design-system/profile-card/infrastructure/components/profile-card.component";
import { ReadonlyStripComponent } from "@shared/design-system/readonly-strip/infrastructure/components/readonly-strip.component";
import { ButtonComponent } from "@shared/design-system/button/infrastructure/components/button.component";
import { NoteComponent } from "@shared/design-system/note/infrastructure/components/note.component";
import { ChipComponent } from "@shared/design-system/chip/infrastructure/components/chip.component";
import { ConfirmActionModalComponent } from "@shared/design-system/confirm-action-modal/infrastructure/components/confirm-action-modal.component";
import { SkeletonLineComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton-line.component";
import { SkeletonListComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton-list.component";
import { SkeletonListItemComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton-list-item.component";
import { SkeletonNoteComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton-note.component";

@Component({
  selector: "app-user-detail",
  templateUrl: "./user-detail.component.html",
  providers: [
    ...GetUserProvider.getProviders(),
    ...ImpersonateUserProvider.getProviders(),
  ],
  imports: [
    ContextualTranslatePipe,
    PageWrapperComponent,
    ScreenHeaderComponent,
    SplitViewComponent,
    StackComponent,
    TextComponent,
    ProfileCardComponent,
    ReadonlyStripComponent,
    ButtonComponent,
    NoteComponent,
    ChipComponent,
    ConfirmActionModalComponent,
    SkeletonLineComponent,
    SkeletonListComponent,
    SkeletonListItemComponent,
    SkeletonNoteComponent,
  ],
})
export class UserDetailComponent {
  private getUserService = inject(GetUserService);
  private impersonateUserService = inject(ImpersonateUserService);
  private floatingToastService = inject(FloatingToastService);
  private translationService = inject(TranslationService);
  private router = inject(Router);

  private readonly MODULE_PATH = "authorization/user/user";

  readonly id = input.required<string>();

  loading = signal(true);
  entering = signal(false);
  confirming = signal(false);
  user = signal<UserDetail | null>(null);

  readonly displayName = computed(() => {
    const user = this.user();
    if (!user) return "";

    const composed = `${user.name ?? ""} ${user.lastname ?? ""}`.trim();

    return composed || user.username || user.email;
  });

  readonly initial = computed(
    () => this.displayName().trim().charAt(0).toUpperCase() || "?",
  );

  readonly roleLabel = computed(() =>
    this.t(`userDetail.role.${this.user()?.role ?? "ROLE_USER"}`),
  );

  readonly accessLabel = computed(() =>
    this.t(
      this.user()?.isActive
        ? "userDetail.access.active"
        : "userDetail.access.inactive",
    ),
  );

  readonly verifiedLabel = computed(() =>
    this.t(
      this.user()?.emailVerified
        ? "userDetail.badge.verified"
        : "userDetail.badge.unverified",
    ),
  );

  readonly createdAtLabel = computed(() =>
    this.formatDate(this.user()?.createdAt),
  );
  readonly updatedAtLabel = computed(() =>
    this.formatDate(this.user()?.updatedAt),
  );

  readonly canImpersonate = computed(() => this.user()?.isActive === true);

  constructor() {
    toObservable(this.id)
      .pipe(
        switchMap((id) => {
          this.loading.set(true);
          return this.getUserService.getUser(id);
        }),
        takeUntilDestroyed(),
      )
      .subscribe({
        next: (user) => {
          this.user.set(user);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });

    this.translationService.loadModuleTranslations(this.MODULE_PATH);
  }

  back(): void {
    this.router.navigate(["/users"]);
  }

  askForImpersonation(): void {
    if (!this.canImpersonate()) return;

    this.confirming.set(true);
  }

  cancelImpersonation(): void {
    this.confirming.set(false);
  }

  confirmImpersonation(): void {
    const user = this.user();
    if (!user || this.entering()) return;

    this.entering.set(true);

    this.impersonateUserService.impersonate(user.id).subscribe({
      next: () => {
        this.entering.set(false);
        this.confirming.set(false);
        this.router.navigate(["/dashboard"]);
      },
      error: () => {
        this.entering.set(false);
        this.confirming.set(false);
        this.floatingToastService.showToast({
          status: 400,
          keyTranslation: "userDetail.toast.error",
          details: [],
        });
      },
    });
  }

  private t(key: string): string {
    return this.translationService.translate(key, this.MODULE_PATH);
  }

  private formatDate(value: string | undefined): string {
    if (!value) return "";

    return new Date(value).toLocaleDateString(
      this.translationService.getLocale(),
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      },
    );
  }
}
