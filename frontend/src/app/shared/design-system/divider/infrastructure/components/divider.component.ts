import { Component, Input } from "@angular/core";

@Component({
  selector: "ds-divider",
  standalone: true,
  template: ``,
  styles: [
    `
      :host {
        display: block;
        height: 1px;
        background: var(--ds-border-hairline);
      }
      :host([grow]) {
        flex: 1 1 auto;
      }
    `,
  ],
  host: {
    "[attr.grow]": "grow ? '' : null",
  },
})
export class DividerComponent {
  @Input() grow = false;
}
