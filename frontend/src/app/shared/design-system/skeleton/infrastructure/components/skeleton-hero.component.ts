import { Component, Input } from "@angular/core";

@Component({
  selector: "ds-skeleton-hero",
  template: `
    <div class="skhero" [style.height]="height">
      <span class="ds-sk skhero__shape"></span>
      @if (badge) {
        <span class="ds-sk skhero__badge"></span>
      }
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .skhero {
        position: relative;
        border-radius: var(--ds-radius-xl);
        background: var(--ds-surface-inset);
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
      }
      .skhero__shape {
        width: 3.625rem;
        height: 3.625rem;
        border-radius: var(--ds-radius-xl);
      }
      .skhero__badge {
        position: absolute;
        bottom: 0.625rem;
        right: 0.625rem;
        width: 4.25rem;
        height: 1.625rem;
        border-radius: var(--ds-radius-md);
      }
    `,
  ],
})
export class SkeletonHeroComponent {
  @Input() height = "7.375rem";
  @Input() badge = true;
}
