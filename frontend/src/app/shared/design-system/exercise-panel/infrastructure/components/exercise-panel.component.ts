import { Component, EventEmitter, Input, Output } from "@angular/core";
import { IconComponent } from "@shared/design-system/icon/infrastructure/components/icon.component";
import { ExercisePanelState } from "../../domain/models/exercise-panel-state.enum";

@Component({
  selector: "ds-exercise-panel",
  imports: [IconComponent],
  template: `
    <article
      class="ds-xpanel"
      [class.ds-xpanel--open]="expanded"
      [class.ds-xpanel--current]="state === states.Current"
      [class.ds-xpanel--done]="state === states.Done"
    >
      <div class="ds-xpanel__head">
        <span class="ds-xpanel__position" aria-hidden="true">
          @if (state === states.Done) {
            <ds-icon name="check" [size]="15" [stroke]="3" />
          } @else {
            {{ position }}
          }
        </span>
        <button
          type="button"
          class="ds-xpanel__toggle"
          [attr.aria-expanded]="expanded"
          (click)="toggled.emit()"
        >
          <span class="ds-xpanel__text">
            <span class="ds-xpanel__name">{{ name }}</span>
            @if (meta) {
              <span class="ds-xpanel__meta">{{ meta }}</span>
            }
          </span>
          <span class="ds-xpanel__summary">
            @if (progressLabel) {
              <span class="ds-xpanel__progress">
                @if (state === states.Done) {
                  <ds-icon name="check" [size]="13" [stroke]="3" />
                }
                {{ progressLabel }}
              </span>
            } @else {
              <span class="ds-xpanel__value">{{ summary }}</span>
              @if (detail) {
                <span class="ds-xpanel__detail">{{ detail }}</span>
              }
            }
          </span>
          <span class="ds-xpanel__chevron" aria-hidden="true">
            <ds-icon name="chevronDown" [size]="18" [stroke]="2.2" />
          </span>
        </button>
      </div>

      <div
        class="ds-xpanel__collapse"
        [class.ds-xpanel__collapse--open]="expanded"
        [attr.inert]="expanded ? null : ''"
        [attr.aria-hidden]="expanded ? null : 'true'"
      >
        <div class="ds-xpanel__clip">
          <div class="ds-xpanel__body">
            <ng-content></ng-content>
          </div>
        </div>
      </div>
    </article>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .ds-xpanel {
        background: var(--ds-surface);
        border: 1px solid var(--ds-border);
        border-radius: var(--ds-radius-2xl);
        box-shadow: var(--ds-shadow-card);
        transition:
          border-color var(--ds-dur-2) var(--ds-ease-out),
          background var(--ds-dur-2) var(--ds-ease-out);
      }
      .ds-xpanel--open,
      .ds-xpanel--current {
        border-color: var(--ds-primary-soft-border);
      }
      .ds-xpanel__head {
        display: flex;
        align-items: center;
        gap: var(--ds-space-3);
        padding: var(--ds-space-3) var(--ds-space-3) var(--ds-space-3)
          var(--ds-space-4);
      }
      .ds-xpanel__position {
        flex: 0 0 auto;
        width: 2rem;
        height: 2rem;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border-radius: var(--ds-radius-md);
        background: var(--ds-surface-inset);
        color: var(--ds-text);
        font-family: var(--ds-font-display);
        font-size: var(--ds-text-base);
        font-weight: 800;
        font-variant-numeric: tabular-nums;
        transition:
          background var(--ds-dur-2) var(--ds-ease-out),
          color var(--ds-dur-2) var(--ds-ease-out);
      }
      .ds-xpanel--current .ds-xpanel__position {
        background: var(--ds-primary);
        color: var(--ds-on-primary);
      }
      .ds-xpanel--done .ds-xpanel__position {
        background: var(--ds-primary-soft);
        color: var(--ds-primary-soft-text);
      }
      .ds-xpanel__toggle {
        appearance: none;
        flex: 1 1 auto;
        min-width: 0;
        display: flex;
        align-items: center;
        gap: var(--ds-space-3);
        padding: 0;
        border: none;
        background: transparent;
        color: var(--ds-text);
        font-family: var(--ds-font-body);
        text-align: left;
        cursor: pointer;
        -webkit-tap-highlight-color: transparent;
      }
      .ds-xpanel__toggle:focus-visible {
        outline: 2px solid var(--ds-border-focus);
        outline-offset: 4px;
        border-radius: var(--ds-radius-md);
      }
      .ds-xpanel__text {
        flex: 1 1 auto;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
      .ds-xpanel__name {
        font-size: var(--ds-text-lg);
        font-weight: var(--ds-weight-bold);
        line-height: var(--ds-leading-tight);
        overflow-wrap: anywhere;
      }
      .ds-xpanel--done .ds-xpanel__name {
        color: var(--ds-text-muted);
      }
      .ds-xpanel__meta {
        font-size: var(--ds-text-base);
        color: var(--ds-text-muted);
      }
      .ds-xpanel__summary {
        flex: 0 0 auto;
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 2px;
      }
      .ds-xpanel__value {
        font-family: var(--ds-font-display);
        font-size: var(--ds-text-lg);
        font-weight: var(--ds-weight-bold);
        font-variant-numeric: tabular-nums;
        white-space: nowrap;
      }
      .ds-xpanel__detail {
        font-size: var(--ds-text-sm);
        color: var(--ds-text-muted);
        white-space: nowrap;
      }
      .ds-xpanel__progress {
        display: inline-flex;
        align-items: center;
        gap: var(--ds-space-1);
        padding: var(--ds-space-1) var(--ds-space-2);
        border-radius: var(--ds-radius-pill);
        background: var(--ds-surface-inset);
        color: var(--ds-text-muted);
        font-family: var(--ds-font-display);
        font-size: var(--ds-text-base);
        font-weight: var(--ds-weight-bold);
        font-variant-numeric: tabular-nums;
      }
      .ds-xpanel--current .ds-xpanel__progress,
      .ds-xpanel--done .ds-xpanel__progress {
        background: var(--ds-primary-soft);
        color: var(--ds-primary-soft-text);
      }
      .ds-xpanel__chevron {
        flex: 0 0 auto;
        display: flex;
        color: var(--ds-text-muted);
        transition: transform var(--ds-dur-3) var(--ds-ease-in-out);
      }
      .ds-xpanel--open .ds-xpanel__chevron {
        transform: rotate(180deg);
      }
      .ds-xpanel__collapse {
        display: grid;
        grid-template-rows: 0fr;
        transition: grid-template-rows var(--ds-dur-4) var(--ds-ease-in-out);
      }
      .ds-xpanel__collapse--open {
        grid-template-rows: 1fr;
      }
      .ds-xpanel__clip {
        min-height: 0;
        overflow: hidden;
      }
      .ds-xpanel__body {
        display: flex;
        flex-direction: column;
        gap: var(--ds-space-3);
        padding: 0 var(--ds-space-3) var(--ds-space-3);
        opacity: 0;
        transform: translateY(calc(-1 * var(--ds-space-2)));
        transition:
          opacity var(--ds-dur-3) var(--ds-ease-out),
          transform var(--ds-dur-4) var(--ds-ease-in-out);
      }
      .ds-xpanel__collapse--open .ds-xpanel__body {
        opacity: 1;
        transform: none;
      }
      @media (prefers-reduced-motion: reduce) {
        .ds-xpanel__chevron,
        .ds-xpanel__collapse,
        .ds-xpanel__body {
          transition-duration: 0.01ms;
        }
      }
    `,
  ],
})
export class ExercisePanelComponent {
  @Input() position = 0;
  @Input() name = "";
  @Input() meta = "";
  @Input() summary = "";
  @Input() detail = "";
  @Input() progressLabel = "";
  @Input() state: ExercisePanelState = ExercisePanelState.Idle;
  @Input() expanded = false;

  @Output() toggled = new EventEmitter<void>();

  protected readonly states = ExercisePanelState;
}
