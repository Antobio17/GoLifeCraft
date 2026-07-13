import { Component, Input } from "@angular/core";

type ChipTone = "neutral" | "brand" | "accent" | "warning";

@Component({
  selector: "ds-chip",
  standalone: true,
  template: `<span class="ds-chip"><ng-content></ng-content></span>`,
  styles: [
    `
      :host {
        display: inline-flex;
      }
      .ds-chip {
        display: inline-flex;
        align-items: center;
        padding: var(--chip-pad, 3px 8px);
        border-radius: var(--chip-radius, 7px);
        background: var(--chip-bg, var(--ds-surface-inset));
        color: var(--chip-text, var(--ds-text-muted));
        font-size: var(--chip-size, 10px);
        font-weight: var(--ds-weight-bold);
        line-height: 1.3;
        white-space: nowrap;
      }
      :host([tone="brand"]) .ds-chip {
        --chip-bg: var(--ds-primary-soft);
        --chip-text: var(--ds-primary-soft-text);
      }
      :host([tone="accent"]) .ds-chip {
        --chip-bg: var(--ds-accent-soft);
        --chip-text: var(--ds-accent-soft-text);
      }
      :host([tone="warning"]) .ds-chip {
        --chip-bg: var(--ds-warning-soft);
        --chip-text: var(--ds-warning);
      }
    `,
  ],
  host: {
    "[attr.tone]": "tone",
  },
})
export class ChipComponent {
  @Input() tone: ChipTone = "neutral";
}
