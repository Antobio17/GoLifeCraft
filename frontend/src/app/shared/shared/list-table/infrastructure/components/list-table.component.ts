import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
} from "@angular/core";
import { NgClass, DatePipe } from "@angular/common";
import { ContextualTranslatePipe } from "@shared/shared/i18n/infrastructure/pipes/contextual-translate.pipe";
import { SkeletonTableComponent } from "@shared/shared/skeleton/infrastructure/components/skeleton-table.component";
import { ButtonComponent } from "@shared/shared/button/infrastructure/components/button.component";
import {
  ListAction,
  ListActionEvent,
  ListCellClickEvent,
  ListColumn,
} from "../../domain/models/list-table.model";

@Component({
  selector: "app-list-table",
  templateUrl: "./list-table.component.html",
  styleUrls: ["./list-table.component.css"],
  imports: [
    NgClass,
    DatePipe,
    ContextualTranslatePipe,
    SkeletonTableComponent,
    ButtonComponent,
  ],
})
export class ListTableComponent<T = any> implements OnChanges {
  @Input() items: T[] = [];
  @Input() columns: ListColumn<T>[] = [];
  @Input() actions: ListAction[] = [];
  @Input() loading = false;

  hasLoaded = false;

  ngOnChanges(): void {
    if (this.loading) {
      this.hasLoaded = true;
    }
  }
  @Input() emptyTitle = "No hay elementos";
  @Input() emptyMessage = "No se han encontrado resultados";
  @Input() canWrite = true;

  @Output() actionClick = new EventEmitter<ListActionEvent<T>>();
  @Output() cellClick = new EventEmitter<ListCellClickEvent<T>>();

  get gridTemplate(): string {
    const cols = this.columns.map((c) => c.width ?? "1fr").join(" ");
    if (this.actions.length === 0) return cols;
    const count = this.primaryActions.length + this.dangerActions.length;
    const actionsColWidth = Math.max(
      count * 30 + Math.max(count - 1, 0) * 6 + 24,
      90,
    );
    return `${cols} ${actionsColWidth}px`;
  }

  get tableMinWidth(): string | null {
    const hasAnyMinWidth = this.columns.some((c) => c.minWidth);
    if (!hasAnyMinWidth) return null;

    const colMins = this.columns.reduce((sum, c) => {
      if (!c.minWidth) return sum;
      const px = parseInt(c.minWidth, 10);
      return sum + (isNaN(px) ? 0 : px);
    }, 0);

    const gaps = this.columns.length * 16;
    const padding = 48;
    const count = this.primaryActions.length + this.dangerActions.length;
    const actionWidth =
      this.actions.length > 0
        ? Math.max(count * 30 + Math.max(count - 1, 0) * 6 + 24, 90)
        : 0;

    return `${colMins + gaps + padding + actionWidth}px`;
  }

  get primaryColumn(): ListColumn<T> | undefined {
    return this.columns.find((c) => c.cardPrimary);
  }

  get badgeColumns(): ListColumn<T>[] {
    return this.columns.filter(
      (c) => c.badge && !c.hideInCard && !c.cardPrimary,
    );
  }

  get cardDetailColumns(): ListColumn<T>[] {
    return this.columns.filter(
      (c) => !c.cardPrimary && !c.badge && !c.hideInCard,
    );
  }

  get primaryActions(): ListAction[] {
    return this.actions
      .filter((a) => !a.danger)
      .filter((a) => {
        if (a.icon === "edit") return this.canWrite;
        if (a.icon === "view") return !this.canWrite;
        return true;
      });
  }

  get dangerActions(): ListAction[] {
    return this.actions.filter((a) => a.danger);
  }

  visibleActions(row: T): ListAction[] {
    const all = this.primaryActions.concat(this.dangerActions);
    return all.filter((a) => !a.visible || a.visible(row));
  }

  visiblePrimaryActions(row: T): ListAction[] {
    return this.primaryActions.filter((a) => !a.visible || a.visible(row));
  }

  visibleDangerActions(row: T): ListAction[] {
    return this.dangerActions.filter((a) => !a.visible || a.visible(row));
  }

  emit(key: string, row: T): void {
    this.actionClick.emit({ key, row });
  }

  emitCell(column: string, row: T): void {
    this.cellClick.emit({ column, row });
  }
}
