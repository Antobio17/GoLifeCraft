import { Component, Input } from "@angular/core";
import { NutritionRow } from "../../domain/models/nutrition-row.model";

@Component({
  selector: "ds-nutrition-facts",
  standalone: true,
  template: `
    <div class="ds-ntable">
      @for (row of visibleRows; track $index; let last = $last) {
        <div
          class="ds-ntable__row"
          [class.ds-ntable__row--sub]="row.sub"
          [class.ds-ntable__row--last]="last"
        >
          <span class="ds-ntable__label">{{ row.label }}</span>
          <span class="ds-ntable__value">{{ row.value }}</span>
        </div>
      }
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .ds-ntable {
        display: flex;
        flex-direction: column;
      }
      .ds-ntable__row {
        display: flex;
        justify-content: space-between;
        padding: 9px 0;
        border-bottom: 1px solid var(--ds-border);
      }
      .ds-ntable__row--sub {
        padding-left: 12px;
      }
      .ds-ntable__row--last {
        border-bottom: none;
      }
      .ds-ntable__label {
        font-size: 13px;
        font-weight: 600;
        color: var(--ds-text);
      }
      .ds-ntable__row--sub .ds-ntable__label {
        font-size: 12px;
        font-weight: 500;
        color: var(--ds-text-muted);
      }
      .ds-ntable__value {
        font-size: 13px;
        font-weight: 700;
        color: var(--ds-text);
      }
      .ds-ntable__row--sub .ds-ntable__value {
        font-size: 12px;
        font-weight: 600;
        color: var(--ds-text-muted);
      }
    `,
  ],
})
export class NutritionFactsComponent {
  @Input() rows: NutritionRow[] = [];

  get visibleRows(): NutritionRow[] {
    return this.rows.filter((row) => !row.hidden);
  }
}
