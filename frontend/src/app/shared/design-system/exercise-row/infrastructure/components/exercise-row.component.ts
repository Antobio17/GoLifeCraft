import { Component, EventEmitter, Input, Output } from "@angular/core";
import { IconBadgeComponent } from "@shared/design-system/icon-badge/infrastructure/components/icon-badge.component";
import { DsIconName } from "@shared/design-system/icon/domain/models/icon.model";

@Component({
  selector: "ds-exercise-row",
  imports: [IconBadgeComponent],
  template: `
    <button
      type="button"
      class="ds-xrow"
      [attr.aria-label]="openAriaLabel || null"
      (click)="opened.emit()"
    >
      <ds-icon-badge [icon]="icon" tone="brand" [size]="44" [iconSize]="21" />

      <span class="ds-xrow__body">
        <span class="ds-xrow__name">{{ name }}</span>
        @if (muscles) {
          <span class="ds-xrow__muscles">{{ muscles }}</span>
        }
      </span>

      @if (tags.length) {
        <span class="ds-xrow__tags">
          @for (tag of tags; track tag) {
            <span class="ds-xrow__tag">{{ tag }}</span>
          }
        </span>
      }
    </button>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .ds-xrow {
        appearance: none;
        width: 100%;
        display: flex;
        align-items: center;
        gap: var(--ds-space-3);
        padding: var(--ds-space-3);
        background: var(--ds-surface);
        border: 1px solid var(--ds-border);
        border-radius: var(--ds-radius-surface);
        box-shadow: var(--ds-shadow-card);
        color: var(--ds-text);
        font-family: var(--ds-font-body);
        text-align: left;
        cursor: pointer;
        -webkit-tap-highlight-color: transparent;
        transition:
          border-color var(--ds-transition-fast),
          transform var(--ds-dur-1) var(--ds-ease-out);
      }
      .ds-xrow:hover {
        border-color: var(--ds-primary-soft-border);
      }
      .ds-xrow:active {
        transform: scale(0.985);
      }
      .ds-xrow:focus-visible {
        outline: 2px solid var(--ds-border-focus);
        outline-offset: 2px;
      }
      .ds-xrow__body {
        flex: 1 1 auto;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: var(--ds-space-1);
      }
      .ds-xrow__name {
        font-family: var(--ds-font-display);
        font-size: var(--ds-text-md);
        font-weight: var(--ds-weight-bold);
        line-height: var(--ds-leading-tight);
        letter-spacing: -0.01em;
        overflow-wrap: anywhere;
        text-wrap: pretty;
      }
      .ds-xrow__muscles {
        font-size: var(--ds-text-sm);
        font-weight: var(--ds-weight-semibold);
        color: var(--ds-primary-soft-text);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .ds-xrow__tags {
        flex: 0 0 auto;
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: var(--ds-space-1);
      }
      .ds-xrow__tag {
        padding: 1px var(--ds-space-2);
        border-radius: var(--ds-radius-tag);
        background: var(--ds-surface-inset);
        color: var(--ds-text-muted);
        font-size: var(--ds-text-xs);
        font-weight: var(--ds-weight-semibold);
        white-space: nowrap;
      }
    `,
  ],
})
export class ExerciseRowComponent {
  @Input() icon: DsIconName = "dumbbell";
  @Input() name = "";
  @Input() muscles = "";
  @Input() tags: string[] = [];
  @Input() openAriaLabel = "";

  @Output() opened = new EventEmitter<void>();
}
