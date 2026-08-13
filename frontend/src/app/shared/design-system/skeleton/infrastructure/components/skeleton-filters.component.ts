import { Component, Input } from "@angular/core";

@Component({
  selector: "ds-skeleton-filters",
  template: `
    <div class="skfil">
      @if (search) {
        <span class="ds-sk skfil__search"></span>
      }

      @if (selects > 0) {
        <div class="skfil__row">
          @for (select of selectArray; track select; let i = $index) {
            <span
              class="ds-sk skfil__select"
              [style.--ds-sk-delay]="delayFor(i)"
            ></span>
          }
        </div>
      }

      @if (segments > 0) {
        <span class="ds-sk skfil__segmented"></span>
      }

      @if (caption) {
        <span class="ds-sk skfil__caption"></span>
      }
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .skfil {
        display: flex;
        flex-direction: column;
        gap: var(--skfil-gap, var(--ds-space-3));
      }
      .skfil__search {
        width: 100%;
        height: 2.75rem;
        border-radius: var(--ds-radius-lg);
      }
      .skfil__row {
        display: flex;
        gap: var(--ds-space-1-5);
      }
      .skfil__select {
        flex: 1 1 0;
        min-width: 0;
        height: 2.125rem;
        border-radius: var(--ds-radius-md);
      }
      .skfil__segmented {
        width: 100%;
        height: 2.5rem;
        border-radius: var(--ds-radius-lg);
      }
      .skfil__caption {
        width: 10.5rem;
        height: 0.6875rem;
      }
    `,
  ],
  host: {
    "[style.--skfil-gap]": "gap",
  },
})
export class SkeletonFiltersComponent {
  @Input() search = true;
  @Input() selects = 0;
  @Input() segments = 0;
  @Input() caption = false;
  @Input() gap = "var(--ds-space-3)";

  get selectArray(): number[] {
    return Array.from({ length: this.selects }, (_, index) => index);
  }

  delayFor(index: number): string {
    return `${index * 0.08}s`;
  }
}
