import { Component, Input } from "@angular/core";

@Component({
  selector: "ds-skeleton-screen-header",
  template: `
    <div class="skhead">
      @if (leading) {
        <span class="ds-sk skhead__lead"></span>
      }

      <div class="skhead__text">
        @if (eyebrow) {
          <span class="ds-sk skhead__eyebrow"></span>
        }
        <span class="ds-sk skhead__title"></span>
        @if (subtitle) {
          <span class="ds-sk skhead__subtitle"></span>
        }
      </div>

      @if (actions > 0) {
        <div class="skhead__actions">
          @for (action of actionArray; track action) {
            <span class="ds-sk skhead__action"></span>
          }
        </div>
      }
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .skhead {
        display: flex;
        align-items: center;
        gap: 0.6875rem;
      }
      .skhead__lead {
        flex: 0 0 auto;
        width: 2.5rem;
        height: 2.5rem;
        border-radius: var(--ds-radius-xl);
      }
      .skhead__text {
        flex: 1 1 auto;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 0.4375rem;
      }
      .skhead__eyebrow {
        width: 5.25rem;
        max-width: 100%;
        height: 0.5625rem;
      }
      .skhead__title {
        width: var(--skhead-title, 62%);
        max-width: 100%;
        height: 1.375rem;
        border-radius: var(--ds-radius-md);
      }
      .skhead__subtitle {
        width: var(--skhead-subtitle, 44%);
        max-width: 100%;
        height: 0.6875rem;
      }
      .skhead__actions {
        flex: 0 0 auto;
        display: flex;
        align-items: center;
        gap: 0.5625rem;
      }
      .skhead__action {
        width: var(--skhead-action, 2.5rem);
        height: 2.5rem;
        border-radius: var(--ds-radius-xl);
      }
    `,
  ],
  host: {
    "[style.--skhead-title]": "titleWidth",
    "[style.--skhead-subtitle]": "subtitleWidth",
    "[style.--skhead-action]": "actionWidth",
  },
})
export class SkeletonScreenHeaderComponent {
  @Input() leading = false;
  @Input() eyebrow = false;
  @Input() subtitle = true;
  @Input() titleWidth = "62%";
  @Input() subtitleWidth = "44%";
  @Input() actions = 0;
  @Input() actionWidth = "2.5rem";

  get actionArray(): number[] {
    return Array.from({ length: this.actions }, (_, index) => index);
  }
}
