import { NgTemplateOutlet } from "@angular/common";
import { Component, Input } from "@angular/core";

@Component({
  selector: "ds-skeleton-screen-header",
  imports: [NgTemplateOutlet],
  template: `
    <div class="skhead" [class.skhead--stacked]="stacked">
      @if (leading) {
        <span class="ds-sk skhead__lead"></span>
      }

      @if (!stacked) {
        <ng-container [ngTemplateOutlet]="text" />
      }

      @if (actions > 0) {
        <div class="skhead__actions">
          @for (action of actionArray; track action) {
            <span class="ds-sk skhead__action"></span>
          }
        </div>
      }

      @if (stacked) {
        <ng-container [ngTemplateOutlet]="text" />
      }
    </div>

    <ng-template #text>
      <div class="skhead__text">
        @if (eyebrow) {
          <span class="ds-sk skhead__eyebrow"></span>
        }
        <span class="ds-sk skhead__title"></span>
        @if (subtitle) {
          <span class="ds-sk skhead__subtitle"></span>
        }
      </div>
    </ng-template>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .skhead {
        display: flex;
        align-items: center;
        gap: var(--ds-space-3);
      }
      .skhead__lead {
        flex: 0 0 auto;
        width: 2.5rem;
        height: 2.5rem;
        border-radius: var(--ds-radius-inner);
      }
      .skhead__text {
        flex: 1 1 auto;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: var(--ds-space-1-5);
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
        border-radius: var(--ds-radius-mark);
      }
      .skhead__subtitle {
        width: var(--skhead-subtitle, 44%);
        max-width: 100%;
        height: 0.6875rem;
      }
      .skhead--stacked {
        flex-wrap: wrap;
        row-gap: var(--ds-space-3);
      }
      .skhead--stacked .skhead__text {
        flex-basis: 100%;
      }
      .skhead__actions {
        flex: 0 0 auto;
        margin-left: auto;
        display: flex;
        align-items: center;
        gap: var(--ds-space-2);
      }
      .skhead__action {
        width: var(--skhead-action, 2.5rem);
        height: 2.5rem;
        border-radius: var(--ds-radius-control);
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
  @Input() stacked = false;

  get actionArray(): number[] {
    return Array.from({ length: this.actions }, (_, index) => index);
  }
}
