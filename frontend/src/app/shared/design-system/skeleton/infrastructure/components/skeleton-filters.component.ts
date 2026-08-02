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
        gap: var(--skfil-gap, 12px);
      }
      .skfil__search {
        width: 100%;
        height: 44px;
        border-radius: var(--ds-radius-xl);
      }
      .skfil__row {
        display: flex;
        gap: 7px;
      }
      .skfil__select {
        flex: 1 1 0;
        min-width: 0;
        height: 34px;
        border-radius: var(--ds-radius-lg);
      }
      .skfil__segmented {
        width: 100%;
        height: 40px;
        border-radius: var(--ds-radius-2xl);
      }
      .skfil__caption {
        width: 168px;
        height: 11px;
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
  @Input() gap = "12px";

  get selectArray(): number[] {
    return Array.from({ length: this.selects }, (_, index) => index);
  }

  delayFor(index: number): string {
    return `${index * 0.08}s`;
  }
}
