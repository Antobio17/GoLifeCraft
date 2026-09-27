import { Component, Input } from "@angular/core";

@Component({
  selector: "ds-rail",
  template: `<ng-content></ng-content>`,
  styles: [
    `
      :host {
        position: relative;
        display: flex;
        flex-direction: column;
        gap: var(--rail-gap);
        min-width: 0;
        padding-left: var(--rail-indent);
      }
      :host::before {
        content: "";
        position: absolute;
        top: 0;
        bottom: 0;
        left: calc(var(--rail-indent) / 2 - 1px);
        width: 2px;
        border-radius: var(--ds-radius-pill);
        background: var(--ds-accent-soft-border);
      }
    `,
  ],
  host: {
    "[style.--rail-indent]": "indent",
    "[style.--rail-gap]": "gap",
  },
})
export class RailComponent {
  @Input() indent = "1.5rem";
  @Input() gap = "var(--ds-space-2)";
}
