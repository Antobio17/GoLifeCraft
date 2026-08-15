import { Component, EventEmitter, Input, Output } from "@angular/core";

type CardVariant = "plain" | "brand" | "inset";

@Component({
  selector: "ds-card",
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
        justify-content: center;
        height: 100%;
        gap: var(--card-gap, var(--ds-space-3));
        padding: var(--card-pad, var(--ds-space-4));
        border-radius: var(--ds-radius-xl);
        border-top-right-radius: var(--ds-card-tr-radius, var(--ds-radius-xl));
        border-bottom-right-radius: var(
          --ds-card-br-radius,
          var(--ds-radius-xl)
        );
        background: var(--card-bg, var(--ds-surface));
        border: 1px solid var(--card-border, var(--ds-border-hairline));
        box-shadow: var(--ds-shadow-card);
      }
      :host([variant="brand"]) .ds-card {
        --card-bg: var(--ds-surface-brand);
        --card-border: transparent;
        --ds-accent: var(--ds-accent-on-brand);
        --ds-on-accent: var(--ds-on-accent-on-brand);
        --ds-primary: var(--ds-accent-on-brand);
        --ds-on-primary: var(--ds-on-accent-on-brand);
        color: var(--ds-on-surface-brand);
        box-shadow: var(--ds-elev-float);
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
        box-shadow: var(--ds-elev-lg);
        transform: translateY(-2px);
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
  @Input() padding = "var(--ds-space-4)";
  @Input() gap = "var(--ds-space-3)";
  @Input() interactive = false;

  @Output() activated = new EventEmitter<void>();

  onActivate(): void {
    if (!this.interactive) return;
    this.activated.emit();
  }
}
