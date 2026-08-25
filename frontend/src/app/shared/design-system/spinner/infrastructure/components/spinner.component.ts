import { Component, Input } from "@angular/core";

@Component({
  selector: "ds-spinner",
  template: `<span class="ds-spinner"></span>`,
  styles: [
    `
      :host {
        display: inline-flex;
        flex: 0 0 auto;
      }
      .ds-spinner {
        width: var(--ds-spinner-size, 1.125rem);
        height: var(--ds-spinner-size, 1.125rem);
        border-radius: 50%;
        border: var(--ds-spinner-width, 2px) solid
          var(--ds-spinner-track, var(--ds-border));
        border-top-color: var(--ds-spinner-accent, var(--ds-primary));
        animation: ds-spinner-turn 0.7s linear infinite;
      }
      @keyframes ds-spinner-turn {
        to {
          transform: rotate(360deg);
        }
      }
      @media (prefers-reduced-motion: reduce) {
        .ds-spinner {
          animation-duration: 2.4s;
        }
      }
    `,
  ],
  host: {
    "[style.--ds-spinner-size]": "size",
    "[style.--ds-spinner-width]": "thickness",
    "[attr.role]": "'status'",
    "[attr.aria-label]": "ariaLabel || null",
  },
})
export class SpinnerComponent {
  @Input() size = "1.125rem";
  @Input() thickness = "2px";
  @Input() ariaLabel = "";
}
