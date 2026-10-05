import { Component, EventEmitter, Input, Output } from "@angular/core";
import { IconComponent } from "@shared/design-system/icon/infrastructure/components/icon.component";

@Component({
  selector: "ds-session-row",
  imports: [IconComponent],
  template: `
    <article class="ds-srow">
      <button type="button" class="ds-srow__main" (click)="opened.emit()">
        <span class="ds-srow__title">
          <span class="ds-srow__name">{{ name }}</span>
          @if (badge) {
            <span class="ds-srow__badge">{{ badge }}</span>
          }
        </span>
        @if (meta) {
          <span class="ds-srow__meta">{{ meta }}</span>
        }
        @if (muscles) {
          <span class="ds-srow__muscles">
            <span class="ds-srow__bars" aria-hidden="true">
              <span class="ds-srow__bar ds-srow__bar--1"></span>
              <span class="ds-srow__bar ds-srow__bar--2"></span>
              <span class="ds-srow__bar ds-srow__bar--3"></span>
            </span>
            <span class="ds-srow__muscles-text">{{ muscles }}</span>
          </span>
        }
      </button>

      <div class="ds-srow__aside">
        @if (lastLabel) {
          <span class="ds-srow__last">{{ lastLabel }}</span>
        }
        <button
          type="button"
          class="ds-srow__start"
          [attr.aria-label]="startAriaLabel"
          (click)="started.emit()"
        >
          <ds-icon name="play" [size]="16" />
        </button>
      </div>
    </article>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .ds-srow {
        display: flex;
        align-items: center;
        gap: var(--ds-space-3);
        padding: var(--ds-space-3) var(--ds-space-3) var(--ds-space-3)
          var(--ds-space-4);
        background: var(--ds-surface);
        border: 1px solid var(--ds-border);
        border-radius: var(--ds-radius-2xl);
        box-shadow: var(--ds-shadow-card);
        transition: border-color var(--ds-transition-fast);
      }
      .ds-srow:hover {
        border-color: var(--ds-primary-soft-border);
      }
      .ds-srow__main {
        appearance: none;
        flex: 1 1 auto;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: var(--ds-space-1-5);
        padding: 0;
        border: none;
        background: transparent;
        color: var(--ds-text);
        font-family: var(--ds-font-body);
        text-align: left;
        cursor: pointer;
        -webkit-tap-highlight-color: transparent;
      }
      .ds-srow__title {
        display: flex;
        align-items: center;
        gap: var(--ds-space-2);
        min-width: 0;
      }
      .ds-srow__name {
        font-family: var(--ds-font-display);
        font-size: var(--ds-text-lg);
        font-weight: var(--ds-weight-bold);
        letter-spacing: -0.01em;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .ds-srow__badge {
        flex: 0 0 auto;
        padding: 2px var(--ds-space-2);
        border-radius: var(--ds-radius-pill);
        background: var(--ds-primary);
        color: var(--ds-on-primary);
        font-size: var(--ds-text-xs);
        font-weight: var(--ds-weight-extrabold);
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }
      .ds-srow__meta {
        font-size: var(--ds-text-base);
        color: var(--ds-text-muted);
      }
      .ds-srow__muscles {
        display: flex;
        align-items: center;
        gap: var(--ds-space-1-5);
        min-width: 0;
      }
      .ds-srow__bars {
        flex: 0 0 auto;
        display: flex;
        gap: var(--ds-space-1);
      }
      .ds-srow__bar {
        height: 0.375rem;
        border-radius: var(--ds-radius-pill);
        background: var(--ds-primary);
      }
      .ds-srow__bar--1 {
        width: 1.125rem;
      }
      .ds-srow__bar--2 {
        width: 0.75rem;
        opacity: 0.55;
      }
      .ds-srow__bar--3 {
        width: 0.5rem;
        opacity: 0.25;
      }
      .ds-srow__muscles-text {
        font-size: var(--ds-text-base);
        color: var(--ds-text-body);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .ds-srow__aside {
        flex: 0 0 auto;
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: var(--ds-space-2);
      }
      .ds-srow__last {
        font-size: var(--ds-text-sm);
        color: var(--ds-text-muted);
        white-space: nowrap;
      }
      .ds-srow__start {
        appearance: none;
        width: 2.75rem;
        height: 2.75rem;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        border: 1px solid var(--ds-primary-soft-border);
        background: var(--ds-primary-soft);
        color: var(--ds-primary-soft-text);
        cursor: pointer;
        -webkit-tap-highlight-color: transparent;
        transition: transform var(--ds-dur-1) var(--ds-ease-out);
      }
      .ds-srow__start:active {
        transform: scale(0.92);
      }
      .ds-srow__main:focus-visible,
      .ds-srow__start:focus-visible {
        outline: 2px solid var(--ds-border-focus);
        outline-offset: 2px;
        border-radius: var(--ds-radius-md);
      }
      .ds-srow__start:focus-visible {
        border-radius: 50%;
      }
    `,
  ],
})
export class SessionRowComponent {
  @Input() name = "";
  @Input() badge = "";
  @Input() meta = "";
  @Input() muscles = "";
  @Input() lastLabel = "";
  @Input() startAriaLabel = "";

  @Output() opened = new EventEmitter<void>();
  @Output() started = new EventEmitter<void>();
}
