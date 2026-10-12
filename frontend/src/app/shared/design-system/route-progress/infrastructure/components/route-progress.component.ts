import { Component, Input } from "@angular/core";

@Component({
  selector: "ds-route-progress",
  template: `<span class="ds-route-progress__bar"></span>`,
  styles: [
    `
      :host {
        position: fixed;
        inset: 0 0 auto 0;
        z-index: var(--ds-z-toast);
        height: var(--ds-route-progress-height, 3px);
        pointer-events: none;
        opacity: 0;
        transition: opacity var(--ds-dur-2) var(--ds-ease-out);
      }
      :host(.is-active) {
        opacity: 1;
        transition-delay: var(--ds-route-progress-delay, 150ms);
      }
      .ds-route-progress__bar {
        display: block;
        height: 100%;
        background: var(--ds-primary);
        transform-origin: left center;
        transform: scaleX(1);
      }
      :host(.is-active) .ds-route-progress__bar {
        animation: ds-route-progress-trickle 8s cubic-bezier(0.1, 0.6, 0.2, 1)
          var(--ds-route-progress-delay, 150ms) both;
      }
      @keyframes ds-route-progress-trickle {
        from {
          transform: scaleX(0);
        }
        to {
          transform: scaleX(0.92);
        }
      }
      @media (prefers-reduced-motion: reduce) {
        :host(.is-active) .ds-route-progress__bar {
          animation: none;
          transform: scaleX(0.4);
        }
      }
    `,
  ],
  host: {
    "[class.is-active]": "active",
    "[attr.aria-hidden]": "'true'",
  },
})
export class RouteProgressComponent {
  @Input() active = false;
}
