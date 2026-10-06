import { Component, EventEmitter, Input, Output } from "@angular/core";
import { IconBadgeComponent } from "../../../icon-badge/infrastructure/components/icon-badge.component";
import { IconButtonComponent } from "../../../icon-button/infrastructure/components/icon-button.component";
import { PressableComponent } from "../../../pressable/infrastructure/components/pressable.component";
import { StackComponent } from "../../../stack/infrastructure/components/stack.component";
import { SwipeToDeleteComponent } from "../../../swipe-to-delete/infrastructure/components/swipe-to-delete.component";
import { TextComponent } from "../../../text/infrastructure/components/text.component";
import { DsIconName } from "../../../icon/domain/models/icon.model";

@Component({
  selector: "ds-notification-item",
  imports: [
    IconBadgeComponent,
    IconButtonComponent,
    PressableComponent,
    StackComponent,
    SwipeToDeleteComponent,
    TextComponent,
  ],
  template: `
    <ds-swipe-to-delete
      pad="var(--ds-space-2)"
      #swipe
      [reveal]="66"
      pad="var(--ds-space-2)"
      [removeLabel]="removeLabel"
      (remove)="removed.emit()"
    >
      <ds-stack
        class="notice"
        direction="row"
        align="stretch"
        [gap]="'var(--ds-space-2)'"
        [class.notice--unread]="unread"
        [class.notice--slid]="swipe.slid"
      >
        <ds-pressable
          class="notice__open"
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
          <ds-stack
            class="notice__text"
            [gap]="'var(--ds-space-1)'"
            [grow]="true"
          >
            <ds-text class="notice__title" variant="strong">{{
              title
            }}</ds-text>
            @if (body) {
              <ds-text class="notice__body" variant="muted">{{ body }}</ds-text>
            }
          </ds-stack>
        </ds-pressable>
        <ds-stack
          class="notice__side"
          align="end"
          justify="between"
          [gap]="'var(--ds-space-1)'"
        >
          <ds-text class="notice__time" variant="meta">{{ time }}</ds-text>
          <ds-icon-button
            [icon]="unread ? 'mail' : 'mailOpen'"
            [size]="34"
            [iconSize]="17"
            [color]="unread ? 'var(--ds-primary)' : null"
            [ariaLabel]="unread ? markReadLabel : markUnreadLabel"
            (clicked)="readToggled.emit()"
          />
        </ds-stack>
      </ds-stack>
    </ds-swipe-to-delete>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .notice {
        box-sizing: border-box;
        width: 100%;
        --ds-pad: var(--ds-space-2);
        padding: var(--ds-space-3) var(--ds-space-2) var(--ds-space-3)
          var(--ds-space-3);
        border: 1px solid var(--ds-border);
        border-radius: var(--ds-radius-surface);
        background: var(--ds-surface);
      }
      .notice--slid {
        border-top-right-radius: 0;
        border-bottom-right-radius: 0;
      }
      .notice__open {
        min-width: 0;
      }
      .notice__side {
        flex: none;
        text-align: right;
      }
      .notice__time {
        padding-right: var(--ds-space-2);
        white-space: nowrap;
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
      .notice__body {
        --ds-text-base: 0.78125rem;
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
  @Input() markReadLabel = "";
  @Input() markUnreadLabel = "";
  @Input() removeLabel = "";
  @Output() opened = new EventEmitter<void>();
  @Output() readToggled = new EventEmitter<void>();
  @Output() removed = new EventEmitter<void>();
}
