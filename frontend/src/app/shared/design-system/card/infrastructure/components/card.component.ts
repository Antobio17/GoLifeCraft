import { Component, EventEmitter, Input, Output } from "@angular/core";

type CardVariant = "plain" | "brand" | "inset";

@Component({
  selector: "ds-card",
  standalone: true,
  template: `
    <div
      class="ds-card"
      [class.ds-card--interactive]="interactive"
      [attr.tabindex]="interactive ? 0 : null"
      [attr.role]="interactive ? 'button' : null"
      (click)="onActivate()"
      (keydown.enter)="onActivate()"
      (keydown.space)="onActivate()"
    >
      <ng-content></ng-content>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .ds-card {
        display: flex;
        flex-direction: column;
        gap: var(--card-gap, 12px);
        padding: var(--card-pad, 16px);
        border-radius: var(--ds-radius-3xl);
        background: var(--card-bg, var(--ds-surface));
        border: 1px solid var(--card-border, var(--ds-border-hairline));
        box-shadow: var(--ds-shadow-card);
      }
      :host([variant="brand"]) .ds-card {
        --card-bg: var(--ds-surface-brand);
        --card-border: transparent;
        color: var(--ds-on-surface-brand);
      }
      :host([variant="inset"]) .ds-card {
        --card-bg: var(--ds-surface-inset);
        --card-border: transparent;
        box-shadow: none;
      }
      .ds-card--interactive {
        cursor: pointer;
        transition:
          transform var(--ds-transition-fast),
          box-shadow var(--ds-transition-fast),
          border-color var(--ds-transition-fast);
      }
      .ds-card--interactive:hover {
        border-color: var(--ds-primary-soft-border);
        box-shadow: var(--ds-shadow-lg);
      }
      .ds-card--interactive:focus-visible {
        outline: none;
        border-color: var(--ds-border-focus);
        box-shadow: var(--ds-focus-ring);
      }
    `,
  ],
  host: {
    "[attr.variant]": "variant",
    "[style.--card-pad]": "padding",
    "[style.--card-gap]": "gap",
  },
})
export class CardComponent {
  @Input() variant: CardVariant = "plain";
  @Input() padding = "16px";
  @Input() gap = "12px";
  @Input() interactive = false;

  @Output() activated = new EventEmitter<void>();

  onActivate(): void {
    if (!this.interactive) return;
    this.activated.emit();
  }
}
