import { Component, EventEmitter, Input, Output } from "@angular/core";
import { IconBadgeComponent } from "../../../icon-badge/infrastructure/components/icon-badge.component";
import { PressableComponent } from "../../../pressable/infrastructure/components/pressable.component";
import { StackComponent } from "../../../stack/infrastructure/components/stack.component";
import { TextComponent } from "../../../text/infrastructure/components/text.component";
import { DsIconName } from "../../../icon/domain/models/icon.model";

@Component({
  selector: "ds-notification-item",
  imports: [
    IconBadgeComponent,
    PressableComponent,
    StackComponent,
    TextComponent,
  ],
  template: `
    <ds-pressable
      class="notice"
      [class.notice--unread]="unread"
      [grow]="true"
      [ariaLabel]="title"
      (press)="opened.emit()"
    >
      <ds-icon-badge
        [icon]="icon"
        [tone]="unread ? 'brand' : 'neutral'"
        [size]="38"
        [iconSize]="17"
      />
      <ds-stack class="notice__text" [gap]="'var(--ds-space-1)'" [grow]="true">
        <ds-stack
          direction="row"
          align="center"
          justify="between"
          [gap]="'var(--ds-space-2)'"
        >
          <ds-text class="notice__title" variant="strong">{{ title }}</ds-text>
          <ds-text class="notice__time" variant="meta">{{ time }}</ds-text>
        </ds-stack>
        @if (body) {
          <ds-text class="notice__body" variant="muted">{{ body }}</ds-text>
        }
      </ds-stack>
      @if (unread) {
        <span class="notice__dot" aria-hidden="true"></span>
      }
    </ds-pressable>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .notice {
        box-sizing: border-box;
        width: 100%;
        padding: var(--ds-space-3);
        border: 1px solid var(--ds-border);
        border-radius: var(--ds-radius-xl);
        background: var(--ds-surface);
      }
      .notice--unread {
        border-color: color-mix(
          in srgb,
          var(--ds-primary) 35%,
          var(--ds-border)
        );
      }
      .notice__text {
        min-width: 0;
      }
      .notice__title {
        --ds-text-base: 0.84375rem;
        --ds-leading-normal: 1.3;
        overflow-wrap: anywhere;
      }
      .notice__time {
        flex: none;
        white-space: nowrap;
      }
      .notice__body {
        --ds-text-base: 0.78125rem;
      }
      .notice__dot {
        flex: none;
        width: 0.5rem;
        height: 0.5rem;
        border-radius: var(--ds-radius-pill);
        background: var(--ds-primary);
      }
    `,
  ],
})
export class NotificationItemComponent {
  @Input({ required: true }) icon!: DsIconName;
  @Input() title = "";
  @Input() body = "";
  @Input() time = "";
  @Input() unread = false;
  @Output() opened = new EventEmitter<void>();
}
