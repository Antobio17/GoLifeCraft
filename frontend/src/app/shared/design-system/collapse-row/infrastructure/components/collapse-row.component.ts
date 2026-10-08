import { Component } from "@angular/core";

@Component({
  selector: "ds-collapse-row",
  template: `<div class="collapse-row__clip"><ng-content></ng-content></div>`,
  styles: [
    `
      :host {
        display: grid;
        grid-template-rows: 1fr;
        min-width: 0;
      }
      .collapse-row__clip {
        min-height: 0;
        overflow: hidden;
      }
      :host(.ds-collapse-row--in) {
        animation: collapse-row-in var(--ds-dur-3) var(--ds-ease-out);
      }
      :host(.ds-collapse-row--out) {
        pointer-events: none;
        animation: collapse-row-out var(--ds-dur-2) var(--ds-ease-in) forwards;
      }
      @keyframes collapse-row-in {
        from {
          grid-template-rows: 0fr;
          opacity: 0;
          transform: translateY(calc(-1 * var(--ds-space-2)));
        }
        to {
          grid-template-rows: 1fr;
          opacity: 1;
          transform: translateY(0);
        }
      }
      @keyframes collapse-row-out {
        from {
          grid-template-rows: 1fr;
          opacity: 1;
          transform: translateY(0);
        }
        to {
          grid-template-rows: 0fr;
          opacity: 0;
          transform: translateY(var(--ds-space-2));
        }
      }
      @media (prefers-reduced-motion: reduce) {
        :host(.ds-collapse-row--in),
        :host(.ds-collapse-row--out) {
          animation: none;
        }
      }
    `,
  ],
})
export class CollapseRowComponent {}
