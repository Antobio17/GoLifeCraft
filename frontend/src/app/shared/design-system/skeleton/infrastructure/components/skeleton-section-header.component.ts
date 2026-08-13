import { Component, Input } from "@angular/core";

@Component({
  selector: "ds-skeleton-section-header",
  template: `
    <div class="sksec">
      <div class="sksec__text">
        <span class="ds-sk sksec__title"></span>
        @if (subtitle) {
          <span class="ds-sk sksec__subtitle"></span>
        }
      </div>

      @if (count) {
        <span class="ds-sk sksec__count"></span>
      }

      @if (divider) {
        <span class="sksec__divider"></span>
      }

      @if (action) {
        <span class="ds-sk sksec__action"></span>
      }
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .sksec {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.625rem;
      }
      .sksec__text {
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
      }
      .sksec__title {
        width: var(--sksec-title, 8.25rem);
        height: 0.8125rem;
      }
      .sksec__subtitle {
        width: 6rem;
        height: 0.625rem;
      }
      .sksec__count {
        flex: 0 0 auto;
        width: 1.625rem;
        height: 1.25rem;
        border-radius: var(--ds-radius-pill);
      }
      .sksec__divider {
        flex: 1 1 auto;
        height: 1px;
        background: var(--ds-border);
      }
      .sksec__action {
        flex: 0 0 auto;
        width: var(--sksec-action, 4.25rem);
        height: 1.625rem;
        border-radius: var(--ds-radius-lg);
      }
    `,
  ],
  host: {
    "[style.--sksec-title]": "titleWidth",
    "[style.--sksec-action]": "actionWidth",
  },
})
export class SkeletonSectionHeaderComponent {
  @Input() titleWidth = "8.25rem";
  @Input() subtitle = false;
  @Input() count = false;
  @Input() divider = false;
  @Input() action = false;
  @Input() actionWidth = "4.25rem";
}
