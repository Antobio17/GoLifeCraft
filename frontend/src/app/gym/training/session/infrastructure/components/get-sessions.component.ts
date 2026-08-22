import { Component, computed, inject } from "@angular/core";
import { Observable } from "rxjs";
import { GetSessionsService } from "@gym/training/session/application/services/get-sessions.service";
import { Session } from "../../domain/models/session.model";
import { ContextualTranslatePipe } from "@shared/i18n/infrastructure/pipes/contextual-translate.pipe";
import { PageWrapperComponent } from "@shared/design-system/page-wrapper/infrastructure/components/page-wrapper.component";
import { ScreenHeaderComponent } from "@shared/design-system/screen-header/infrastructure/components/screen-header.component";
import { StackComponent } from "@shared/design-system/stack/infrastructure/components/stack.component";
import { GridComponent } from "@shared/design-system/grid/infrastructure/components/grid.component";
import { CardComponent } from "@shared/design-system/card/infrastructure/components/card.component";
import { HeadingComponent } from "@shared/design-system/heading/infrastructure/components/heading.component";
import { TextComponent } from "@shared/design-system/text/infrastructure/components/text.component";
import { ChipComponent } from "@shared/design-system/chip/infrastructure/components/chip.component";
import { ButtonComponent } from "@shared/design-system/button/infrastructure/components/button.component";
import { EmptyStateComponent } from "@shared/design-system/empty-state/infrastructure/components/empty-state.component";
import { SkeletonListComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton-list.component";
import { CtaRowComponent } from "@shared/design-system/cta-row/infrastructure/components/cta-row.component";
import {
  AbstractListPageComponent,
  PagedResult,
} from "@shared/design-system/list-page/abstract-list-page.component";

interface SessionRow {
  id: string;
  name: string;
  summary: string;
  muscleGroups: string[];
}

@Component({
  selector: "app-get-sessions",
  templateUrl: "./get-sessions.component.html",
  imports: [
    ContextualTranslatePipe,
    PageWrapperComponent,
    ScreenHeaderComponent,
    StackComponent,
    GridComponent,
    CardComponent,
    HeadingComponent,
    TextComponent,
    ChipComponent,
    ButtonComponent,
    EmptyStateComponent,
    SkeletonListComponent,
    CtaRowComponent,
  ],
})
export class GetSessionsComponent extends AbstractListPageComponent<Session> {
  private getSessionsService = inject(GetSessionsService);

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

  rows = computed<SessionRow[]>(() =>
    this.items().map((session) => ({
      id: session.id,
      name: session.attributes.name,
      summary: this.summaryText(session),
      muscleGroups: session.attributes.muscleGroups,
    })),
  );

  protected configureList(): void {
    this.pageSize.set(100);
  }

  protected fetch(
    page: number,
    pageSize: number,
  ): Observable<PagedResult<Session>> {
    return this.getSessionsService.getSessions(page, pageSize);
  }

  private summaryText(session: Session): string {
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

  onHistory(): void {
    this.router.navigate(["/gym/history"]);
  }

  onFreeWorkout(): void {
    this.router.navigate(["/gym/free"]);
  }

  onStart(id: string): void {
    this.router.navigate(["/gym/sessions", id], {
      queryParams: { start: 1 },
    });
  }
}
