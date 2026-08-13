import { Component, Input } from "@angular/core";

@Component({
  selector: "ds-skeleton",
  template: `<span class="ds-sk"></span>`,
  styles: [
    `
      :host {
        display: block;
      }
      .ds-sk {
        width: 100%;
        height: var(--skeleton-h, 6rem);
        border-radius: var(--skeleton-r, var(--ds-radius-xl));
      }
    `,
  ],
  host: {
    "[style.--skeleton-h]": "height",
    "[style.--skeleton-r]": "radius",
    "[style.--ds-sk-delay]": "delay",
  },
})
export class SkeletonComponent {
  @Input() height = "6rem";
  @Input() radius = "var(--ds-radius-xl)";
  @Input() delay = "0s";
}
