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
        gap: var(--skfil-gap, 0.75rem);
      }
      .skfil__search {
        width: 100%;
        height: 2.75rem;
        border-radius: var(--ds-radius-xl);
      }
      .skfil__row {
        display: flex;
        gap: 0.4375rem;
      }
      .skfil__select {
        flex: 1 1 0;
        min-width: 0;
        height: 2.125rem;
        border-radius: var(--ds-radius-lg);
      }
      .skfil__segmented {
        width: 100%;
        height: 2.5rem;
        border-radius: var(--ds-radius-2xl);
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
  @Input() gap = "0.75rem";

  get selectArray(): number[] {
    return Array.from({ length: this.selects }, (_, index) => index);
  }

  delayFor(index: number): string {
    return `${index * 0.08}s`;
  }
}
