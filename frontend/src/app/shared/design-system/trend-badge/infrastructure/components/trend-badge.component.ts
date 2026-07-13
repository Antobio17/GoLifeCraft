import { Component, Input } from "@angular/core";

@Component({
  selector: "ds-trend-badge",
  standalone: true,
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
        gap: 4px;
        background: color-mix(in srgb, var(--ds-accent) 20%, transparent);
        color: var(--ds-accent);
        border-radius: 999px;
        padding: 4px 9px;
        font-size: 11px;
        font-weight: 800;
      }
      .ds-trend__arrow {
        font-size: 12px;
      }
    `,
  ],
})
export class TrendBadgeComponent {
  @Input() positive = true;
  @Input() label = "";
}
