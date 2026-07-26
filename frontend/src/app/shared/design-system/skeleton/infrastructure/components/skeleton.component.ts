import { Component, Input } from "@angular/core";

@Component({
  selector: "ds-skeleton",
  standalone: true,
  template: `<span class="ds-sk"></span>`,
  styles: [
    `
      :host {
        display: block;
      }
      .ds-sk {
        width: 100%;
        height: var(--skeleton-h, 96px);
        border-radius: var(--skeleton-r, var(--ds-radius-3xl));
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
  @Input() height = "96px";
  @Input() radius = "var(--ds-radius-3xl)";
  @Input() delay = "0s";
}
