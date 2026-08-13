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
        gap: 0.25rem;
        background: color-mix(in srgb, var(--ds-accent) 20%, transparent);
        color: var(--ds-accent);
        border-radius: 62.4375rem;
        padding: 0.25rem 0.5625rem;
        font-size: 0.6875rem;
        font-weight: 800;
      }
      .ds-trend__arrow {
        font-size: 0.75rem;
      }
    `,
  ],
})
export class TrendBadgeComponent {
  @Input() positive = true;
  @Input() label = "";
}
