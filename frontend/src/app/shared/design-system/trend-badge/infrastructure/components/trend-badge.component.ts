import { Component, Input } from "@angular/core";

@Component({
  selector: "ds-trend-badge",
  template: `
    <span class="ds-trend" [class.ds-trend--down]="!positive">
      <span class="ds-trend__arrow">{{ positive ? "↗" : "↘" }}</span>
      {{ label }}
    </span>
  `,
  styles: [
    `
      :host {
        display: inline-flex;
        flex: 0 0 auto;
      }
      .ds-trend {
        display: inline-flex;
        align-items: center;
        gap: var(--ds-space-1);
        background: color-mix(in srgb, var(--ds-accent) 20%, transparent);
        color: var(--ds-accent);
        border-radius: var(--ds-radius-pill);
        padding: var(--ds-space-1) var(--ds-space-2);
        font-size: var(--ds-text-sm);
        font-weight: 800;
      }
      .ds-trend__arrow {
        font-size: var(--ds-text-base);
      }
    `,
  ],
})
export class TrendBadgeComponent {
  @Input() positive = true;
  @Input() label = "";
}
