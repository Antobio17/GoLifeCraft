import { Component, OnInit, computed, inject, signal } from "@angular/core";
import { Location } from "@angular/common";
import { GetUsersService } from "../../application/services/get-users.service";
import { SetUserAccessService } from "../../application/services/set-user-access.service";
import { GetUsersProvider } from "../providers/get-users.provider";
import { SetUserAccessProvider } from "../providers/set-user-access.provider";
import { UserListItem } from "../../domain/models/get-users-response.model";
import { FloatingToastService } from "@shared/floating-toasts/application/services/floating-toast.service";
import { TranslationService } from "@shared/i18n/application/services/translation.service";
import { ContextualTranslatePipe } from "@shared/i18n/infrastructure/pipes/contextual-translate.pipe";
import { PageWrapperComponent } from "@shared/design-system/page-wrapper/infrastructure/components/page-wrapper.component";
import { ScreenHeaderComponent } from "@shared/design-system/screen-header/infrastructure/components/screen-header.component";
import { StackComponent } from "@shared/design-system/stack/infrastructure/components/stack.component";
import { TextComponent } from "@shared/design-system/text/infrastructure/components/text.component";
import { SkeletonComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton.component";
import { EmptyStateComponent } from "@shared/design-system/empty-state/infrastructure/components/empty-state.component";
import { MetricCardComponent } from "@shared/design-system/metric-card/infrastructure/components/metric-card.component";
import { UserAccessRowComponent } from "@shared/design-system/user-access-row/infrastructure/components/user-access-row.component";

interface UserRowViewModel {
  id: string;
  initial: string;
  name: string;
  email: string;
  verified: boolean;
  active: boolean;
  saving: boolean;
}

@Component({
  selector: "app-users",
  templateUrl: "./users.component.html",
  styles: [
    `
      .users-admin-badge {
        display: inline-flex;
        align-items: center;
        background: var(--ds-surface-brand);
        color: var(--ds-on-surface-brand);
        border-radius: var(--ds-radius-sm);
        padding: 3px 8px;
        font-size: var(--ds-text-xs);
        font-weight: var(--ds-weight-extrabold);
        letter-spacing: 0.06em;
        text-transform: uppercase;
        white-space: nowrap;
      }
      .users-note {
        display: flex;
        align-items: flex-start;
        gap: 9px;
        margin: 2px;
        color: var(--ds-text-muted);
      }
      .users-note svg {
        flex: 0 0 auto;
        margin-top: 1px;
      }
      .users-note span {
        font-size: var(--ds-text-sm);
        line-height: 1.5;
      }
    `,
  ],
  providers: [
    ...GetUsersProvider.getProviders(),
    ...SetUserAccessProvider.getProviders(),
  ],
  imports: [
    ContextualTranslatePipe,
    PageWrapperComponent,
    ScreenHeaderComponent,
    StackComponent,
    TextComponent,
    SkeletonComponent,
    EmptyStateComponent,
    MetricCardComponent,
    UserAccessRowComponent,
  ],
})
export class UsersComponent implements OnInit {
  private getUsersService = inject(GetUsersService);
  private setUserAccessService = inject(SetUserAccessService);
  private floatingToastService = inject(FloatingToastService);
  private translationService = inject(TranslationService);
  private location = inject(Location);

  private readonly MODULE_PATH = "authorization/user/user";

  loading = signal(true);
  rows = signal<UserRowViewModel[]>([]);
  total = signal(0);

  readonly verifiedCount = computed(
    () => this.rows().filter((row) => row.verified).length,
  );
  readonly activeCount = computed(
    () => this.rows().filter((row) => row.active).length,
  );

  ngOnInit(): void {
    this.translationService
      .loadModuleTranslations(this.MODULE_PATH)
      .then(() => this.loadUsers());
  }

  private loadUsers(): void {
    this.loading.set(true);
    this.getUsersService.getUsers().subscribe({
      next: (response) => {
        this.total.set(response.meta.total);
        this.rows.set(response.data.map((item) => this.toViewModel(item)));
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  private toViewModel(item: UserListItem): UserRowViewModel {
    const attrs = item.attributes;
    const composed = `${attrs.name ?? ""} ${attrs.lastname ?? ""}`.trim();
    const displayName = composed || attrs.username || attrs.email;
    const initialSource = displayName.trim() || attrs.email.trim();

    return {
      id: item.id,
      initial: initialSource ? initialSource.charAt(0).toUpperCase() : "?",
      name: displayName,
      email: attrs.email,
      verified: attrs.emailVerified,
      active: attrs.isActive,
      saving: false,
    };
  }

  back(): void {
    this.location.back();
  }

  onToggle(row: UserRowViewModel): void {
    if (row.saving) return;

    const nextActive = !row.active;
    this.patchRow(row.id, { active: nextActive, saving: true });

    this.setUserAccessService
      .setUserAccess({ userId: row.id, isActive: nextActive })
      .subscribe({
        next: () => {
          this.patchRow(row.id, { saving: false });
          this.floatingToastService.showToast({
            status: 200,
            keyTranslation: nextActive
              ? "users.toast.granted"
              : "users.toast.revoked",
            details: [],
          });
        },
        error: () => {
          this.patchRow(row.id, { active: !nextActive, saving: false });
          this.floatingToastService.showToast({
            status: 400,
            keyTranslation: "users.toast.error",
            details: [],
          });
        },
      });
  }

  private patchRow(id: string, patch: Partial<UserRowViewModel>): void {
    this.rows.update((rows) =>
      rows.map((row) => (row.id === id ? { ...row, ...patch } : row)),
    );
  }
}
