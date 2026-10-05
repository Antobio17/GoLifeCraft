import { Component, EventEmitter, Input, Output } from "@angular/core";
import { IconComponent } from "@shared/design-system/icon/infrastructure/components/icon.component";
import { DsIconName } from "@shared/design-system/icon/domain/models/icon.model";

@Component({
  selector: "ds-exercise-row",
  imports: [IconComponent],
  template: `
    <article class="ds-xrow">
      <button type="button" class="ds-xrow__main" (click)="opened.emit()">
        <span class="ds-xrow__icon" aria-hidden="true">
          <ds-icon [name]="icon" [size]="22" />
        </span>
        <span class="ds-xrow__text">
          <span class="ds-xrow__name">{{ name }}</span>
          @if (meta) {
            <span class="ds-xrow__meta">{{ meta }}</span>
          }
          @if (tags.length) {
            <span class="ds-xrow__tags">
              @for (tag of tags; track tag) {
                <span class="ds-xrow__tag">{{ tag }}</span>
              }
            </span>
          }
        </span>
      </button>

      <div class="ds-xrow__actions">
        <button
          type="button"
          class="ds-xrow__action"
          [attr.aria-label]="editAriaLabel"
          (click)="edited.emit()"
        >
          <ds-icon name="pencil" [size]="16" />
        </button>
        <button
          type="button"
          class="ds-xrow__action ds-xrow__action--danger"
          [attr.aria-label]="removeAriaLabel"
          (click)="removed.emit()"
        >
          <ds-icon name="trash" [size]="16" />
        </button>
      </div>
    </article>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .ds-xrow {
        height: 100%;
        box-sizing: border-box;
        display: flex;
        align-items: center;
        gap: var(--ds-space-2);
        padding: var(--ds-space-3);
        background: var(--ds-surface);
        border: 1px solid var(--ds-border);
        border-radius: var(--ds-radius-2xl);
        box-shadow: var(--ds-shadow-card);
        transition: border-color var(--ds-transition-fast);
      }
      .ds-xrow:hover {
        border-color: var(--ds-primary-soft-border);
      }
      .ds-xrow__main {
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
      .ds-xrow__icon {
        flex: 0 0 auto;
        width: 2.75rem;
        height: 2.75rem;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: var(--ds-radius-lg);
        background: var(--ds-primary-soft);
        color: var(--ds-primary-soft-text);
      }
      .ds-xrow__text {
        flex: 1 1 auto;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
      .ds-xrow__name {
        font-family: var(--ds-font-display);
        font-size: var(--ds-text-lg);
        font-weight: var(--ds-weight-bold);
        letter-spacing: -0.01em;
        line-height: var(--ds-leading-tight);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .ds-xrow__meta {
        font-size: var(--ds-text-base);
        color: var(--ds-text-muted);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .ds-xrow__tags {
        display: flex;
        overflow: hidden;
        gap: var(--ds-space-1);
        margin-top: var(--ds-space-1);
      }
      .ds-xrow__tag {
        flex: 0 0 auto;
        white-space: nowrap;
        padding: 1px var(--ds-space-2);
        border-radius: var(--ds-radius-pill);
        background: var(--ds-surface-inset);
        color: var(--ds-text-muted);
        font-size: var(--ds-text-xs);
        font-weight: var(--ds-weight-semibold);
      }
      .ds-xrow__actions {
        flex: 0 0 auto;
        display: flex;
        gap: var(--ds-space-1);
      }
      .ds-xrow__action {
        appearance: none;
        width: 2.25rem;
        height: 2.25rem;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0;
        border-radius: 50%;
        border: 1px solid var(--ds-border-hairline);
        background: var(--ds-surface-inset);
        color: var(--ds-text-muted);
        cursor: pointer;
        -webkit-tap-highlight-color: transparent;
        transition:
          background var(--ds-transition-fast),
          color var(--ds-transition-fast),
          transform var(--ds-dur-1) var(--ds-ease-out);
      }
      .ds-xrow__action:hover {
        background: var(--ds-primary-soft);
        color: var(--ds-primary-soft-text);
      }
      .ds-xrow__action--danger:hover {
        background: var(--ds-danger-soft);
        color: var(--ds-danger);
      }
      .ds-xrow__action:active {
        transform: scale(0.92);
      }
      .ds-xrow__main:focus-visible,
      .ds-xrow__action:focus-visible {
        outline: 2px solid var(--ds-border-focus);
        outline-offset: 2px;
        border-radius: var(--ds-radius-md);
      }
      .ds-xrow__action:focus-visible {
        border-radius: 50%;
      }
    `,
  ],
})
export class ExerciseRowComponent {
  @Input() icon: DsIconName = "dumbbell";
  @Input() name = "";
  @Input() meta = "";
  @Input() tags: string[] = [];
  @Input() editAriaLabel = "";
  @Input() removeAriaLabel = "";

  @Output() opened = new EventEmitter<void>();
  @Output() edited = new EventEmitter<void>();
  @Output() removed = new EventEmitter<void>();
}
