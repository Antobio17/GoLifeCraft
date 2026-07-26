import { Component, Input } from "@angular/core";

@Component({
  selector: "ds-skeleton-hero",
  standalone: true,
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
        border-radius: 20px;
        background: var(--ds-surface-inset);
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
      }
      .skhero__shape {
        width: 58px;
        height: 58px;
        border-radius: var(--ds-radius-3xl);
      }
      .skhero__badge {
        position: absolute;
        bottom: 10px;
        right: 10px;
        width: 68px;
        height: 26px;
        border-radius: 9px;
      }
    `,
  ],
})
export class SkeletonHeroComponent {
  @Input() height = "118px";
  @Input() badge = true;
}
