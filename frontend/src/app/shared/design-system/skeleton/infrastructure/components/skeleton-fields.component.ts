import { Component, Input } from "@angular/core";

@Component({
  selector: "ds-skeleton-fields",
  standalone: true,
  template: `
    <div class="skfld">
      @for (row of rows; track $index; let r = $index) {
        <div class="skfld__row" [style.grid-template-columns]="template(row)">
          @for (field of columnArray(row); track field) {
            <div class="skfld__field" [style.--ds-sk-delay]="delayFor(r)">
              @if (labels) {
                <span class="ds-sk skfld__label"></span>
              }
              <span
                class="ds-sk skfld__control"
                [style.height]="controlHeight"
              ></span>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .skfld {
        display: flex;
        flex-direction: column;
        gap: var(--skfld-gap, 16px);
      }
      .skfld__row {
        display: grid;
        gap: 12px;
      }
      .skfld__field {
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .skfld__label {
        width: 96px;
        max-width: 60%;
        height: 11px;
      }
      .skfld__control {
        width: 100%;
        border-radius: var(--ds-radius-2xl);
      }
    `,
  ],
  host: {
    "[style.--skfld-gap]": "gap",
  },
})
export class SkeletonFieldsComponent {
  @Input() rows: number[] = [1, 2, 1];
  @Input() labels = true;
  @Input() controlHeight = "44px";
  @Input() gap = "16px";

  columnArray(columns: number): number[] {
    return Array.from({ length: columns }, (_, index) => index);
  }

  template(columns: number): string {
    return `repeat(${columns}, 1fr)`;
  }

  delayFor(index: number): string {
    return `${index * 0.08}s`;
  }
}
