import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
} from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Subject } from "rxjs";
import { debounceTime, takeUntil } from "rxjs/operators";
import {
  FilterField,
  FilterValue,
} from "../../domain/models/list-filters.model";
import { ContextualTranslatePipe } from "@shared/i18n/infrastructure/pipes/contextual-translate.pipe";
import { ButtonComponent } from "@shared/design-system/button/infrastructure/components/button.component";

@Component({
  selector: "ds-list-filters",
  templateUrl: "./list-filters.component.html",
  styleUrls: ["./list-filters.component.css"],
  imports: [FormsModule, ContextualTranslatePipe, ButtonComponent],
})
export class ListFiltersComponent implements OnInit, OnChanges, OnDestroy {
  @Input() fields: FilterField[] = [];
  @Input() loading: boolean = false;
  @Input() loadingFields: number = 2;
  @Output() filtersApplied = new EventEmitter<Record<string, FilterValue>>();
  @Output() filtersCleared = new EventEmitter<void>();

  get loadingFieldsArray(): number[] {
    return Array.from({ length: this.loadingFields }, (_, i) => i);
  }

  values: Record<string, FilterValue> = {};

  private textChange$ = new Subject<void>();
  private destroy$ = new Subject<void>();

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["fields"]) {
      (changes["fields"].currentValue as FilterField[]).forEach((field) => {
        if (!(field.key in this.values)) {
          this.values[field.key] =
            field.defaultValue ?? (field.type === "toggle" ? false : "");
        }
      });
    }
  }

  ngOnInit(): void {
    this.fields.forEach((field) => {
      this.values[field.key] =
        field.defaultValue ?? (field.type === "toggle" ? false : "");
    });

    this.textChange$
      .pipe(debounceTime(600), takeUntil(this.destroy$))
      .subscribe(() => {
        this.apply();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get activeFiltersCount(): number {
    return this.fields.filter((field) => {
      const val = this.values[field.key];
      if (field.type === "toggle") return val === true;
      return val !== "" && val !== null && val !== undefined;
    }).length;
  }

  selectSegment(key: string, value: string): void {
    if (this.values[key] === value) return;
    this.values[key] = value;
    this.apply();
  }

  onTextChange(): void {
    this.textChange$.next();
  }

  onInstantChange(): void {
    this.apply();
  }

  toggleChip(key: string, value: string): void {
    this.values[key] = this.values[key] === value ? "" : value;
    this.apply();
  }

  apply(): void {
    this.filtersApplied.emit({ ...this.values });
  }

  clear(): void {
    this.fields.forEach((field) => {
      this.values[field.key] =
        field.defaultValue ?? (field.type === "toggle" ? false : "");
    });
    this.filtersCleared.emit();
  }
}
