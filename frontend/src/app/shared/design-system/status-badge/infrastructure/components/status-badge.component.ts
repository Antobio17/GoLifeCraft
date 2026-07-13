import { Component, Input } from "@angular/core";

type StatusTone = "accent" | "neutral" | "brand";

@Component({
  selector: "ds-status-badge",
  standalone: true,
  template: `
    <span class="ds-status">
      <span class="ds-status__dot"></span>
      <ng-content></ng-content>
    </span>
  `,
  styles: [
    `
      :host {
        display: inline-flex;
      }
      .ds-status {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 4px 12px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 600;
        letter-spacing: 0.3px;
        background: var(--ds-surface-inset);
        color: var(--ds-text-meta);
        border: 1px solid var(--ds-border);
      }
      .ds-status__dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: currentColor;
      }
      :host([tone="accent"]) .ds-status {
        background: var(--ds-accent-soft);
        color: var(--ds-accent-soft-text);
        border-color: var(--ds-accent-soft-border);
      }
      :host([tone="brand"]) .ds-status {
        background: var(--ds-primary-soft);
        color: var(--ds-primary-soft-text);
        border-color: var(--ds-primary-soft-border);
      }
    `,
  ],
  host: {
    "[attr.tone]": "tone",
  },
})
export class StatusBadgeComponent {
  @Input() tone: StatusTone = "neutral";
}
