import { Component, computed, inject, signal } from "@angular/core";
import { Observable } from "rxjs";
import { GetSessionsService } from "@gym/training/session/application/services/get-sessions.service";
import { DeleteSessionService } from "@gym/training/session/application/services/delete-session.service";
import { Session } from "../../domain/models/session.model";
import { FloatingToastService } from "@shared/floating-toasts/application/services/floating-toast.service";
import { ContextualTranslatePipe } from "@shared/i18n/infrastructure/pipes/contextual-translate.pipe";
import { ConfirmActionModalComponent } from "@shared/design-system/confirm-action-modal/infrastructure/components/confirm-action-modal.component";
import { PageWrapperComponent } from "@shared/design-system/page-wrapper/infrastructure/components/page-wrapper.component";
import { ScreenHeaderComponent } from "@shared/design-system/screen-header/infrastructure/components/screen-header.component";
import { StackComponent } from "@shared/design-system/stack/infrastructure/components/stack.component";
import { GridComponent } from "@shared/design-system/grid/infrastructure/components/grid.component";
import { CardComponent } from "@shared/design-system/card/infrastructure/components/card.component";
import { HeadingComponent } from "@shared/design-system/heading/infrastructure/components/heading.component";
import { TextComponent } from "@shared/design-system/text/infrastructure/components/text.component";
import { ChipComponent } from "@shared/design-system/chip/infrastructure/components/chip.component";
import { ButtonComponent } from "@shared/design-system/button/infrastructure/components/button.component";
import { IconButtonComponent } from "@shared/design-system/icon-button/infrastructure/components/icon-button.component";
import { FabComponent } from "@shared/design-system/fab/infrastructure/components/fab.component";
import { EmptyStateComponent } from "@shared/design-system/empty-state/infrastructure/components/empty-state.component";
import { SkeletonComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton.component";
import {
  AbstractListPageComponent,
  PagedResult,
} from "@shared/design-system/list-page/abstract-list-page.component";

@Component({
  selector: "app-get-sessions",
  templateUrl: "./get-sessions.component.html",
  imports: [
    ContextualTranslatePipe,
    ConfirmActionModalComponent,
    PageWrapperComponent,
    ScreenHeaderComponent,
    StackComponent,
    GridComponent,
    CardComponent,
    HeadingComponent,
    TextComponent,
    ChipComponent,
    ButtonComponent,
    IconButtonComponent,
    FabComponent,
    EmptyStateComponent,
    SkeletonComponent,
  ],
})
export class GetSessionsComponent extends AbstractListPageComponent<Session> {
  private getSessionsService = inject(GetSessionsService);
  private deleteSessionService = inject(DeleteSessionService);
  private floatingToastService = inject(FloatingToastService);

  protected readonly modulePath = "gym/training/session";
  protected readonly storageKey = "pageSize_sessions";

  exerciseCount = computed(() =>
    this.items().reduce(
      (total, session) => total + session.attributes.exerciseCount,
      0,
    ),
  );

  headerSubtitle = computed(() => {
    const sessions = this.t("getSessions.stats.sessions").toLowerCase();
    const exercises = this.t("getSessions.stats.exercises").toLowerCase();
    return `${this.totalItems()} ${sessions} · ${this.exerciseCount()} ${exercises}`;
  });

  showDeleteModal = signal(false);
  sessionToDelete = signal<Session | null>(null);
  isDeleting = signal(false);

  protected configureList(): void {
    this.pageSize.set(100);
  }

  protected fetch(
    page: number,
    pageSize: number,
  ): Observable<PagedResult<Session>> {
    return this.getSessionsService.getSessions(page, pageSize);
  }

  summaryText(session: Session): string {
    const exercises = this.t("getSessions.card.exercises");
    return `${session.attributes.exerciseCount} ${exercises} · ~${session.attributes.estimatedDurationMinutes} min`;
  }

  onOpen(id: string): void {
    this.router.navigate(["/gym/sessions", id]);
  }

  onCreate(): void {
    this.router.navigate(["/gym/sessions", "create"]);
  }

  onLibrary(): void {
    this.router.navigate(["/gym/exercises"]);
  }

  onStart(id: string): void {
    this.router.navigate(["/gym/sessions", id]);
  }

  onDelete(session: Session, event: Event): void {
    event.stopPropagation();
    this.sessionToDelete.set(session);
    this.showDeleteModal.set(true);
  }

  onConfirmDelete(): void {
    if (!this.sessionToDelete()) return;

    this.isDeleting.set(true);
    this.deleteSessionService
      .deleteSession(this.sessionToDelete()!.id)
      .subscribe({
        next: () => {
          this.isDeleting.set(false);
          this.showDeleteModal.set(false);
          this.sessionToDelete.set(null);
          this.floatingToastService.showToast({
            status: 200,
            keyTranslation: "session.delete.success",
            details: [],
          });
          this.load();
        },
        error: () => {
          this.isDeleting.set(false);
          this.showDeleteModal.set(false);
          this.sessionToDelete.set(null);
        },
      });
  }

  onCancelDelete(): void {
    this.showDeleteModal.set(false);
    this.sessionToDelete.set(null);
  }
}
