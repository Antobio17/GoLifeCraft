import { Component, Input } from "@angular/core";

@Component({
  selector: "ds-skeleton-line",
  standalone: true,
  template: `<span class="ds-sk"></span>`,
  styles: [
    `
      :host {
        display: block;
        min-width: 0;
      }
      .ds-sk {
        width: var(--line-w, 100%);
        height: var(--line-h, 12px);
        border-radius: var(--line-r, var(--ds-radius-sm));
      }
    `,
  ],
  host: {
    "[style.--line-w]": "width",
    "[style.--line-h]": "height",
    "[style.--line-r]": "radius",
  },
})
export class SkeletonLineComponent {
  @Input() width = "100%";
  @Input() height = "12px";
  @Input() radius = "var(--ds-radius-sm)";
}
