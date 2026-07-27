import { Component, Input } from "@angular/core";

@Component({
  selector: "ds-skeleton-section-header",
  standalone: true,
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
        gap: 10px;
      }
      .sksec__text {
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .sksec__title {
        width: var(--sksec-title, 132px);
        height: 13px;
      }
      .sksec__subtitle {
        width: 96px;
        height: 10px;
      }
      .sksec__count {
        flex: 0 0 auto;
        width: 26px;
        height: 20px;
        border-radius: var(--ds-radius-pill);
      }
      .sksec__divider {
        flex: 1 1 auto;
        height: 1px;
        background: var(--ds-border);
      }
      .sksec__action {
        flex: 0 0 auto;
        width: var(--sksec-action, 68px);
        height: 26px;
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
  @Input() titleWidth = "132px";
  @Input() subtitle = false;
  @Input() count = false;
  @Input() divider = false;
  @Input() action = false;
  @Input() actionWidth = "68px";
}
