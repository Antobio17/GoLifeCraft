import { NgTemplateOutlet } from "@angular/common";
import { Component, EventEmitter, Input, Output } from "@angular/core";
import { BarComponent } from "../../../bar/infrastructure/components/bar.component";
import { IconComponent } from "@shared/design-system/icon/infrastructure/components/icon.component";
import { DatedRowTone } from "../../domain/models/dated-row-tone.enum";

@Component({
  selector: "ds-dated-row",
  imports: [IconComponent, NgTemplateOutlet, BarComponent],
  template: `
    <ng-template #content>
      <span class="ds-drow__date">
        <span class="ds-drow__weekday">{{ weekday }}</span>
        <span class="ds-drow__day">{{ day }}</span>
      </span>

      <span class="ds-drow__body">
        <span class="ds-drow__title">
          <span class="ds-drow__name">{{ title }}</span>
          @if (tag) {
            <span
              class="ds-drow__tag"
              [class.ds-drow__tag--warning]="tagTone === tones.Warning"
              [class.ds-drow__tag--success]="tagTone === tones.Success"
              >{{ tag }}</span
            >
          }
        </span>
        @if (duration || meta) {
          <span class="ds-drow__meta">
            @if (duration) {
              <span class="ds-drow__duration">
                <ds-icon name="clock" [size]="12" [stroke]="2.4" />
                {{ duration }}
              </span>
            }
            @if (meta) {
              <span class="ds-drow__meta-text">{{ meta }}</span>
            }
          </span>
        }
        @if (progress !== null) {
          <ds-bar [value]="progress" />
        }
      </span>

      @if (value) {
        <span
          class="ds-drow__value"
          [class.ds-drow__value--pill]="valueTone !== tones.Plain"
          [class.ds-drow__value--success]="valueTone === tones.Success"
          [class.ds-drow__value--warning]="valueTone === tones.Warning"
          >{{ value }}</span
        >
      }
    </ng-template>

    @if (interactive) {
      <button
        type="button"
        class="ds-drow ds-drow--interactive"
        [attr.aria-label]="ariaLabel || null"
        (click)="activated.emit()"
      >
        <ng-container [ngTemplateOutlet]="content" />
      </button>
    } @else {
      <div class="ds-drow">
        <ng-container [ngTemplateOutlet]="content" />
      </div>
    }
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .ds-drow {
        appearance: none;
        box-sizing: border-box;
        width: 100%;
        display: flex;
        align-items: center;
        gap: var(--ds-space-3);
        padding: var(--ds-space-3) var(--ds-space-4) var(--ds-space-3)
          var(--ds-space-3);
        background: var(--ds-surface);
        border: 1px solid var(--ds-border);
        border-radius: var(--ds-radius-surface);
        box-shadow: var(--ds-shadow-card);
        color: var(--ds-text);
        font-family: var(--ds-font-body);
        text-align: left;
      }
      .ds-drow--interactive {
        cursor: pointer;
        -webkit-tap-highlight-color: transparent;
        transition:
          border-color var(--ds-transition-fast),
          transform var(--ds-transition-fast);
      }
      .ds-drow--interactive:hover {
        border-color: var(--ds-primary-soft-border);
      }
      .ds-drow--interactive:active {
        transform: scale(0.99);
      }
      .ds-drow--interactive:focus-visible {
        outline: none;
        border-color: var(--ds-border-focus);
        box-shadow: var(--ds-focus-ring);
      }
      .ds-drow__date {
        flex: 0 0 auto;
        width: 3.125rem;
        height: 3.375rem;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        border-radius: var(--ds-radius-inner);
        background: var(--ds-surface-inset);
      }
      .ds-drow__weekday {
        font-size: var(--ds-text-xs);
        font-weight: var(--ds-weight-extrabold);
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: var(--ds-text-muted);
      }
      .ds-drow__day {
        font-family: var(--ds-font-display);
        font-size: var(--ds-text-xl);
        font-weight: var(--ds-weight-bold);
        line-height: var(--ds-leading-tight);
        font-variant-numeric: tabular-nums;
      }
      .ds-drow__body {
        flex: 1 1 auto;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: var(--ds-space-1-5);
      }
      .ds-drow__title {
        display: flex;
        align-items: center;
        gap: var(--ds-space-2);
        min-width: 0;
      }
      .ds-drow__name {
        font-size: var(--ds-text-lg);
        font-weight: var(--ds-weight-bold);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .ds-drow__tag {
        flex: 0 0 auto;
        padding: 1px var(--ds-space-1-5);
        border-radius: var(--ds-radius-pill);
        background: var(--ds-surface-inset);
        color: var(--ds-text-muted);
        font-size: var(--ds-text-xs);
        font-weight: var(--ds-weight-extrabold);
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }
      .ds-drow__tag--warning {
        background: var(--ds-warning-soft);
        color: var(--ds-warning);
      }
      .ds-drow__tag--success {
        background: var(--ds-primary-soft);
        color: var(--ds-primary-soft-text);
      }
      .ds-drow__meta {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: var(--ds-space-1) var(--ds-space-3);
        font-size: var(--ds-text-base);
        color: var(--ds-text-muted);
        min-width: 0;
      }
      .ds-drow__duration {
        display: inline-flex;
        align-items: center;
        gap: var(--ds-space-1);
      }
      .ds-drow__meta-text {
        font-variant-numeric: tabular-nums;
        overflow-wrap: anywhere;
      }
      .ds-drow__value {
        flex: 0 0 auto;
        font-family: var(--ds-font-display);
        font-size: var(--ds-text-lg);
        font-weight: var(--ds-weight-bold);
        font-variant-numeric: tabular-nums;
        white-space: nowrap;
      }
      .ds-drow__value--pill {
        padding: var(--ds-space-1) var(--ds-space-2);
        border-radius: var(--ds-radius-pill);
        font-size: var(--ds-text-base);
      }
      .ds-drow__value--success {
        background: var(--ds-primary-soft);
        color: var(--ds-primary-soft-text);
      }
      .ds-drow__value--warning {
        background: var(--ds-warning-soft);
        color: var(--ds-warning);
      }
    `,
  ],
})
export class DatedRowComponent {
  @Input() weekday = "";
  @Input() day = "";
  @Input() title = "";
  @Input() tag = "";
  @Input() tagTone: DatedRowTone = DatedRowTone.Plain;
  @Input() duration = "";
  @Input() meta = "";
  @Input() value = "";
  @Input() valueTone: DatedRowTone = DatedRowTone.Plain;
  @Input() progress: number | null = null;
  @Input() interactive = false;
  @Input() ariaLabel = "";

  @Output() activated = new EventEmitter<void>();

  protected readonly tones = DatedRowTone;
}
