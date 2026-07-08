import { Component, Input } from "@angular/core";

@Component({
  selector: "ds-skeleton",
  standalone: true,
  template: `<span class="ds-skeleton"></span>`,
  styles: [
    `
      :host {
        display: block;
      }
      .ds-skeleton {
        display: block;
        width: 100%;
        height: var(--skeleton-h, 96px);
        border-radius: var(--skeleton-r, var(--ds-radius-3xl));
        background: linear-gradient(
          100deg,
          var(--ds-skeleton-base) 30%,
          var(--ds-skeleton-highlight) 50%,
          var(--ds-skeleton-base) 70%
        );
        background-size: 200% 100%;
        animation: ds-skeleton-shimmer 1.4s ease-in-out infinite;
      }
      @keyframes ds-skeleton-shimmer {
        from {
          background-position: 200% 0;
        }
        to {
          background-position: -200% 0;
        }
      }
    `,
  ],
  host: {
    "[style.--skeleton-h]": "height",
    "[style.--skeleton-r]": "radius",
  },
})
export class SkeletonComponent {
  @Input() height = "96px";
  @Input() radius = "var(--ds-radius-3xl)";
}
