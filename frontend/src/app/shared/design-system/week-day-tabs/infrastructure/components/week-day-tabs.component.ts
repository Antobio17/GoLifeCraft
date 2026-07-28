import { Component, EventEmitter, Input, Output } from "@angular/core";
import { WeekDayTab } from "../../domain/models/week-day-tab.model";

@Component({
  selector: "ds-week-day-tabs",
  standalone: true,
  template: `
    <div class="ds-wdays" role="tablist">
      @for (day of days; track day.key) {
        <button
          type="button"
          class="ds-wdays__tab"
          role="tab"
          [class.is-active]="day.active"
          [class.is-enabled]="day.enabled && !day.active"
          [class.is-off]="!day.enabled"
          [disabled]="disabled"
          [attr.aria-selected]="day.active"
          (click)="selected.emit(day.key)"
        >
          <span class="ds-wdays__label">{{ day.label }}</span>
          <span class="ds-wdays__dot" [class.is-on]="day.hasItems"></span>
        </button>
      }
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .ds-wdays {
        display: flex;
        gap: 5px;
      }
      .ds-wdays__tab {
        flex: 1 1 0;
        min-width: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
        appearance: none;
        border: 1px solid transparent;
        cursor: pointer;
        border-radius: 12px;
        padding: 8px 2px;
        font: inherit;
        font-size: 11px;
        font-weight: 800;
        transition:
          background var(--ds-transition-fast),
          color var(--ds-transition-fast);
      }
      .ds-wdays__tab:disabled {
        cursor: default;
      }
      .ds-wdays__tab.is-active {
        background: var(--ds-primary);
        color: var(--ds-on-primary);
      }
      .ds-wdays__tab.is-enabled {
        background: var(--ds-surface-inset);
        color: var(--ds-text);
      }
      .ds-wdays__tab.is-off {
        background: transparent;
        border: 1px dashed var(--ds-border-strong);
        color: var(--ds-text-meta);
      }
      .ds-wdays__tab.is-off.is-active {
        background: var(--ds-primary-soft);
        border-color: var(--ds-primary);
        color: var(--ds-primary);
      }
      .ds-wdays__dot {
        width: 5px;
        height: 5px;
        border-radius: 50%;
        background: transparent;
      }
      .ds-wdays__tab.is-enabled .ds-wdays__dot.is-on {
        background: var(--ds-primary);
      }
      .ds-wdays__tab.is-active .ds-wdays__dot.is-on {
        background: var(--ds-on-primary);
      }
    `,
  ],
})
export class WeekDayTabsComponent {
  @Input() days: WeekDayTab[] = [];
  @Input() disabled = false;

  @Output() selected = new EventEmitter<string>();
}
