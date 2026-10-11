import { Component, computed, input, output } from "@angular/core";
import { IconComponent } from "../../../icon/infrastructure/components/icon.component";
import { UserActivityStatus } from "../../domain/models/user-activity-status.enum";
import { UserActivityBar } from "../../domain/models/user-activity-bar.model";

const MIN_BAR = 12;

@Component({
  selector: "ds-user-activity-row",
  imports: [IconComponent],
  template: `
    <button
      type="button"
      class="ds-uactrow"
      [class.ds-uactrow--inactive]="status() === 'inactive'"
      (click)="activated.emit()"
    >
      <span class="ds-uactrow__avatar" aria-hidden="true">
        {{ initial() }}
        <span
          class="ds-uactrow__status"
          [class.ds-uactrow__status--pending]="status() === 'pending'"
          [class.ds-uactrow__status--inactive]="status() === 'inactive'"
        ></span>
      </span>
      <span class="ds-uactrow__body">
        <span class="ds-uactrow__name">{{ name() }}</span>
        <span class="ds-uactrow__meta">
          <span class="ds-uactrow__when">{{ meta() }}</span>
          @if (modules().length) {
            <span class="ds-uactrow__modules" aria-hidden="true">
              @for (module of modules(); track module) {
                <span
                  class="ds-uactrow__module"
                  [style.background]="'var(--ds-module-' + module + ')'"
                ></span>
              }
            </span>
          }
        </span>
      </span>
      <span
        class="ds-uactrow__spark"
        role="img"
        [attr.aria-label]="sparkAriaLabel() || null"
      >
        @for (bar of bars(); track $index) {
          <span
            class="ds-uactrow__bar"
            [class.ds-uactrow__bar--low]="bar.tone === 'low'"
            [class.ds-uactrow__bar--peak]="bar.tone === 'peak'"
            [style.height.%]="bar.height"
          ></span>
        }
      </span>
      <ds-icon class="ds-uactrow__chevron" name="chevronRight" [size]="16" />
    </button>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .ds-uactrow {
        display: flex;
        align-items: center;
        gap: var(--ds-space-3);
        width: 100%;
        text-align: left;
        appearance: none;
        font: inherit;
        color: inherit;
        cursor: pointer;
        background: transparent;
        border: 0;
        border-radius: var(--ds-radius-inner);
        padding: var(--ds-space-2) var(--ds-space-1);
        -webkit-tap-highlight-color: transparent;
        transition:
          background var(--ds-dur-2) var(--ds-ease-out),
          opacity var(--ds-dur-2) var(--ds-ease-out);
      }
      .ds-uactrow:hover {
        background: var(--ds-surface-hover);
      }
      .ds-uactrow:focus-visible {
        outline: none;
        box-shadow: var(--ds-focus-ring);
      }
      .ds-uactrow--inactive {
        opacity: 0.55;
      }
      .ds-uactrow__avatar {
        position: relative;
        flex: none;
        width: 2.5rem;
        height: 2.5rem;
        border-radius: var(--ds-radius-inner);
        background: var(--ds-primary-soft);
        color: var(--ds-primary);
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: var(--ds-font-display);
        font-size: var(--ds-text-lg);
        font-weight: var(--ds-weight-bold);
      }
      .ds-uactrow__status {
        position: absolute;
        right: -2px;
        bottom: -2px;
        width: 0.75rem;
        height: 0.75rem;
        border-radius: var(--ds-radius-pill);
        border: 2px solid var(--ds-surface);
        background: var(--ds-success);
      }
      .ds-uactrow__status--pending {
        background: var(--ds-warning);
      }
      .ds-uactrow__status--inactive {
        background: var(--ds-text-meta);
      }
      .ds-uactrow__body {
        flex: 1 1 auto;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
      .ds-uactrow__name {
        font-size: var(--ds-text-md);
        font-weight: var(--ds-weight-bold);
        line-height: 1.2;
        color: var(--ds-text);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .ds-uactrow__meta {
        display: flex;
        align-items: center;
        gap: var(--ds-space-2);
        min-width: 0;
      }
      .ds-uactrow__when {
        min-width: 0;
        font-size: var(--ds-text-sm);
        color: var(--ds-text-muted);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .ds-uactrow__modules {
        flex: none;
        display: inline-flex;
        gap: 2px;
      }
      .ds-uactrow__module {
        width: 0.375rem;
        height: 0.375rem;
        border-radius: var(--ds-radius-pill);
      }
      .ds-uactrow__spark {
        flex: none;
        display: flex;
        align-items: flex-end;
        gap: 2px;
        height: 1.5rem;
      }
      .ds-uactrow__bar {
        width: 0.1875rem;
        border-radius: var(--ds-radius-pill);
        background: var(--ds-surface-inset);
      }
      .ds-uactrow__bar--low {
        background: color-mix(
          in srgb,
          var(--ds-module, var(--ds-primary)) 45%,
          transparent
        );
      }
      .ds-uactrow__bar--peak {
        background: var(--ds-module, var(--ds-primary));
      }
      .ds-uactrow__chevron {
        flex: none;
        color: var(--ds-text-meta);
      }
    `,
  ],
})
export class UserActivityRowComponent {
  readonly initial = input("?");
  readonly name = input("");
  readonly meta = input("");
  readonly status = input<`${UserActivityStatus}`>(UserActivityStatus.Active);
  readonly modules = input<string[]>([]);
  readonly spark = input<number[]>([]);
  readonly sparkAriaLabel = input("");

  readonly activated = output<void>();

  readonly bars = computed<UserActivityBar[]>(() => {
    const values = this.spark();
    const max = Math.max(0, ...values);

    return values.map((value) => {
      if (value === 0 || max === 0) return { height: MIN_BAR, tone: "idle" };

      return {
        height: Math.max(MIN_BAR, Math.round((value / max) * 100)),
        tone: value === max ? "peak" : "low",
      };
    });
  });
}
