import { Component, Input } from "@angular/core";

type ChipTone = "neutral" | "brand" | "brand-solid" | "accent" | "warning";

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
        font-weight: var(--chip-weight, var(--ds-weight-bold));
        line-height: 1.3;
        white-space: nowrap;
      }
      :host([tone="brand"]) .ds-chip {
        --chip-bg: var(--ds-primary-soft);
        --chip-text: var(--ds-primary-soft-text);
      }
      :host([tone="brand-solid"]) .ds-chip {
        --chip-bg: var(--ds-surface-brand);
        --chip-text: var(--ds-on-surface-brand);
      }
      :host([tone="accent"]) .ds-chip {
        --chip-bg: var(--ds-accent-soft);
        --chip-text: var(--ds-accent-soft-text);
      }
      :host([tone="warning"]) .ds-chip {
        --chip-bg: var(--ds-warning-soft);
        --chip-text: var(--ds-warning);
      }
      :host([uppercase]) .ds-chip {
        --chip-weight: var(--ds-weight-extrabold);
        text-transform: uppercase;
        letter-spacing: 0.06em;
      }
    `,
  ],
  host: {
    "[attr.tone]": "tone",
    "[attr.uppercase]": "uppercase ? '' : null",
  },
})
export class ChipComponent {
  @Input() tone: ChipTone = "neutral";
  @Input() uppercase = false;
}
