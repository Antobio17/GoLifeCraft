import {
  Component,
  computed,
  inject,
  input,
  linkedSignal,
  signal,
} from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { FormsModule } from "@angular/forms";
import { Router } from "@angular/router";
import { TranslationService } from "@shared/i18n/application/services/translation.service";
import { ContextualTranslatePipe } from "@shared/i18n/infrastructure/pipes/contextual-translate.pipe";
import { BackNavigationService } from "@shared/routing/application/services/back-navigation.service";
import { PageWrapperComponent } from "@shared/design-system/page-wrapper/infrastructure/components/page-wrapper.component";
import { ScreenHeaderComponent } from "@shared/design-system/screen-header/infrastructure/components/screen-header.component";
import { StackComponent } from "@shared/design-system/stack/infrastructure/components/stack.component";
import { TextComponent } from "@shared/design-system/text/infrastructure/components/text.component";
import {
  SegmentedOption,
  SegmentedToggleComponent,
} from "@shared/design-system/segmented-toggle/infrastructure/components/segmented-toggle.component";
import { EmptyStateComponent } from "@shared/design-system/empty-state/infrastructure/components/empty-state.component";
import { SkeletonListComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton-list.component";
import { NotificationItemComponent } from "@shared/design-system/notification-item/infrastructure/components/notification-item.component";
import { ButtonComponent } from "@shared/design-system/button/infrastructure/components/button.component";
import { NotificationSettingsComponent } from "@notification/notification/settings/infrastructure/components/notification-settings.component";
import { ChangeNotificationReadStateService } from "../../application/services/change-notification-read-state.service";
import { DismissNotificationService } from "../../application/services/dismiss-notification.service";
import { GetNotificationInboxService } from "../../application/services/get-notification-inbox.service";
import { MarkNotificationInboxSeenService } from "../../application/services/mark-notification-inbox-seen.service";
import { NotificationInboxViewService } from "../../application/services/notification-inbox-view.service";
import { UnreadNotificationsService } from "../../application/services/unread-notifications.service";
import { NotificationInboxEntry } from "../../domain/models/notification-inbox-entry.model";
import { NotificationDayGroup } from "../../domain/models/notification-day-group.model";
import { NotificationRow } from "../../domain/models/notification-row.model";
import { NotificationTab } from "../../domain/models/notification-tab.enum";

@Component({
  selector: "app-notifications",
  templateUrl: "./notifications.component.html",
  imports: [
    FormsModule,
    ContextualTranslatePipe,
    PageWrapperComponent,
    ScreenHeaderComponent,
    StackComponent,
    TextComponent,
    SegmentedToggleComponent,
    EmptyStateComponent,
    SkeletonListComponent,
    NotificationItemComponent,
    ButtonComponent,
    NotificationSettingsComponent,
  ],
})
export class NotificationsComponent {
  private getInboxService = inject(GetNotificationInboxService);
  private markSeenService = inject(MarkNotificationInboxSeenService);
  private changeReadStateService = inject(ChangeNotificationReadStateService);
  private dismissService = inject(DismissNotificationService);
  private inboxView = inject(NotificationInboxViewService);
  private unreadNotifications = inject(UnreadNotificationsService);
  private translationService = inject(TranslationService);
  private backNavigation = inject(BackNavigationService);
  private router = inject(Router);

  private readonly MODULE_PATH = "notification/notification/inbox";

  readonly tab = input<string | undefined>(undefined);

  readonly activeTab = linkedSignal<NotificationTab>(() =>
    NotificationTab.Settings === this.tab()
      ? NotificationTab.Settings
      : NotificationTab.Inbox,
  );

  readonly entries = signal<NotificationInboxEntry[] | null>(null);
  readonly loading = computed(() => null === this.entries());
  readonly isInbox = computed(() => NotificationTab.Inbox === this.activeTab());

  readonly groups = computed<NotificationDayGroup[]>(() =>
    this.inboxView.groups(this.entries() ?? [], new Date()),
  );

  readonly hasUnread = computed(() =>
    (this.entries() ?? []).some((entry) => entry.unread),
  );

  readonly empty = computed(
    () => !this.loading() && 0 === this.groups().length,
  );

  readonly tabOptions = computed<SegmentedOption[]>(() => [
    { value: NotificationTab.Inbox, label: this.t("notifications.tab.inbox") },
    {
      value: NotificationTab.Settings,
      label: this.t("notifications.tab.settings"),
    },
  ]);

  constructor() {
    this.translationService.loadModuleTranslations(this.MODULE_PATH);

    this.getInboxService
      .getInbox()
      .pipe(takeUntilDestroyed())
      .subscribe({
        next: (response) =>
          this.entries.set(
            response.data.map((item) => ({ id: item.id, ...item.attributes })),
          ),
        error: () => this.entries.update((entries) => entries ?? []),
      });
  }

  changeTab(tab: string): void {
    this.activeTab.set(tab as NotificationTab);
    this.router.navigate([], {
      queryParams: { tab: NotificationTab.Settings === tab ? tab : null },
      replaceUrl: true,
    });
  }

  open(row: NotificationRow): void {
    this.markRead(row);

    if (!row.url) return;

    this.router.navigateByUrl(row.url);
  }

  toggleRead(row: NotificationRow): void {
    this.changeReadState(row.id, row.unread);
  }

  dismiss(row: NotificationRow): void {
    const previous = this.entries();

    this.entries.update((entries) =>
      (entries ?? []).filter((entry) => entry.id !== row.id),
    );

    this.dismissService.dismiss(row.id).subscribe({
      next: () => this.unreadNotifications.refresh(),
      error: () => this.entries.set(previous),
    });
  }

  markAllRead(): void {
    const previous = this.entries();

    this.entries.update((entries) =>
      (entries ?? []).map((entry) => ({ ...entry, unread: false })),
    );

    this.markSeenService.markSeen().subscribe({
      next: () => this.unreadNotifications.clear(),
      error: () => this.entries.set(previous),
    });
  }

  back(): void {
    this.backNavigation.back(["/dashboard"]);
  }

  private markRead(row: NotificationRow): void {
    if (!row.unread) return;

    this.changeReadState(row.id, true);
  }

  private changeReadState(id: string, read: boolean): void {
    this.patchUnread(id, !read);

    this.changeReadStateService.changeReadState(id, read).subscribe({
      next: () => this.unreadNotifications.refresh(),
      error: () => this.patchUnread(id, read),
    });
  }

  private patchUnread(id: string, unread: boolean): void {
    this.entries.update((entries) =>
      (entries ?? []).map((entry) =>
        entry.id === id ? { ...entry, unread } : entry,
      ),
    );
  }

  private t(key: string): string {
    return this.translationService.translate(key, this.MODULE_PATH);
  }
}
