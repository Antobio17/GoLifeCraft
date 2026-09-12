import { Component, EventEmitter, Input, Output } from "@angular/core";
import { ChipComponent } from "@shared/design-system/chip/infrastructure/components/chip.component";
import { EmojiTileComponent } from "@shared/design-system/emoji-tile/infrastructure/components/emoji-tile.component";
import { IconComponent } from "@shared/design-system/icon/infrastructure/components/icon.component";
import { IconButtonComponent } from "@shared/design-system/icon-button/infrastructure/components/icon-button.component";
import { StackComponent } from "@shared/design-system/stack/infrastructure/components/stack.component";
import { SwipeToDeleteComponent } from "@shared/design-system/swipe-to-delete/infrastructure/components/swipe-to-delete.component";
import { TextComponent } from "@shared/design-system/text/infrastructure/components/text.component";
import { PressableComponent } from "@shared/design-system/pressable/infrastructure/components/pressable.component";

@Component({
  selector: "ds-ticket-line",
  imports: [
    ChipComponent,
    EmojiTileComponent,
    IconComponent,
    IconButtonComponent,
    StackComponent,
    SwipeToDeleteComponent,
    TextComponent,
    PressableComponent,
  ],
  template: `
    <ds-swipe-to-delete
      #swipe
      [disabled]="received"
      [removeLabel]="removeLabel"
      (remove)="removed.emit()"
    >
      <ds-stack
        class="ds-tline"
        direction="row"
        align="stretch"
        [class.ds-tline--slid]="swipe.slid"
        [gap]="'var(--ds-space-2)'"
      >
        <ds-stack
          class="ds-tline__main"
          direction="row"
          align="center"
          [gap]="'var(--ds-space-3)'"
          [grow]="true"
        >
          <ds-emoji-tile
            [emoji]="emoji"
            [imageUrl]="imageUrl"
            [alt]="title"
            [size]="44"
            [radius]="12"
          />

          <ds-stack class="ds-tline__body" [gap]="'2px'" [grow]="true">
            @if (openable) {
              <ds-pressable
                class="ds-tline__open"
                [ariaLabel]="openLabel"
                (press)="opened.emit()"
              >
                <ds-text variant="strong" class="ds-tline__name">{{
                  title
                }}</ds-text>
              </ds-pressable>
            } @else {
              <ds-text variant="strong" class="ds-tline__name">{{
                title
              }}</ds-text>
            }

            <ds-stack
              direction="row"
              align="center"
              [gap]="'var(--ds-space-1-5)'"
              [wrap]="true"
            >
              <ds-text [inline]="true" class="ds-tline__price">{{
                priceLabel
              }}</ds-text>
              <ds-chip tone="brand" class="ds-tline__count">{{
                quantityLabel
              }}</ds-chip>
              @if (unitLabel) {
                <ds-text
                  variant="meta"
                  [inline]="true"
                  class="ds-tline__unit"
                  >{{ unitLabel }}</ds-text
                >
              }
            </ds-stack>

            @if (stockLabel && !received) {
              <ds-text variant="meta">{{ stockLabel }}</ds-text>
            }

            @if (linked) {
              <ds-stack
                class="ds-tline__raw"
                direction="row"
                align="center"
                [gap]="'var(--ds-space-1)'"
              >
                <ds-icon name="list" [size]="12" />
                <ds-text variant="meta" [inline]="true" [truncate]="true">{{
                  rawName
                }}</ds-text>
              </ds-stack>
            }
          </ds-stack>
        </ds-stack>

        <ds-stack
          class="ds-tline__side"
          [align]="received ? 'end' : 'center'"
          [justify]="received ? 'center' : 'between'"
          [gap]="'var(--ds-space-1-5)'"
        >
          @if (received) {
            <ds-text variant="strong" class="ds-tline__total">{{
              totalPriceLabel
            }}</ds-text>

            @if (stockLabel) {
              <ds-text variant="meta" class="ds-tline__added">{{
                stockLabel
              }}</ds-text>
            }
          } @else {
            <ds-stack class="ds-tline__stepper" align="center">
              <button
                type="button"
                class="ds-tline__step"
                [attr.aria-label]="incrementLabel"
                (click)="quantityChanged.emit(quantity + 1)"
              >
                +
              </button>
              <button
                type="button"
                class="ds-tline__step"
                [disabled]="quantity <= 1"
                [attr.aria-label]="decrementLabel"
                (click)="quantityChanged.emit(quantity - 1)"
              >
                −
              </button>
            </ds-stack>

            <ds-icon-button
              [icon]="linked ? 'repeat' : 'search'"
              [variant]="linked ? 'soft' : 'outlined'"
              [size]="32"
              [iconSize]="15"
              [ariaLabel]="linked ? changeLabel : linkLabel"
              (clicked)="searched.emit()"
            />
          }
        </ds-stack>
      </ds-stack>
    </ds-swipe-to-delete>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .ds-tline {
        width: 100%;
        box-sizing: border-box;
        background: var(--ds-surface);
        border: 1px solid var(--ds-border);
        border-radius: var(--ds-radius-xl);
        padding: var(--ds-space-2) var(--ds-space-3);
        transition: var(--ds-motion-tint);
      }
      :host([received="true"]) .ds-tline {
        background: var(--ds-surface-subtle);
      }
      :host([linked="false"]) .ds-tline {
        border-color: var(--ds-warning);
      }
      .ds-tline--slid {
        border-top-right-radius: 0;
        border-bottom-right-radius: 0;
      }
      .ds-tline__body {
        min-width: 0;
      }
      .ds-tline__name {
        font-weight: 700;
        line-height: 1.25;
        overflow-wrap: anywhere;
      }
      ds-pressable.ds-tline__open {
        align-self: flex-start;
        max-width: 100%;
      }
      ds-pressable.ds-tline__open:hover .ds-tline__name {
        text-decoration: underline;
        text-underline-offset: 2px;
      }
      .ds-tline__price {
        font-size: var(--ds-text-sm);
      }
      .ds-tline__count {
        --chip-radius: var(--ds-radius-pill);
        --chip-pad: 1px 0.5rem;
        --chip-size: 0.8125rem;
        --chip-weight: var(--ds-weight-extrabold);
        font-family: var(--ds-font-display);
      }
      .ds-tline__unit {
        --ds-text-base: 0.71875rem;
        font-weight: 700;
        white-space: nowrap;
      }
      .ds-tline__raw {
        min-width: 0;
        margin-top: 2px;
        color: var(--ds-text-meta);
      }
      .ds-tline__side {
        flex: 0 0 auto;
      }
      .ds-tline__stepper {
        flex: 0 0 auto;
        background: var(--ds-surface-inset);
        border-radius: var(--ds-radius-md);
        padding: 1px;
      }
      .ds-tline__step {
        width: 1.75rem;
        height: 1.1875rem;
        display: flex;
        align-items: center;
        justify-content: center;
        appearance: none;
        border: none;
        background: transparent;
        color: var(--ds-text-body);
        font: inherit;
        font-size: var(--ds-text-sm);
        font-weight: var(--ds-weight-bold);
        line-height: 1;
        cursor: pointer;
        border-radius: var(--ds-radius-sm);
        transition: var(--ds-motion-tint);
      }
      .ds-tline__step:hover:not(:disabled) {
        background: var(--ds-surface);
      }
      .ds-tline__step:disabled {
        color: var(--ds-text-muted);
        cursor: default;
      }
      .ds-tline__total {
        font-size: var(--ds-text-md);
        font-weight: var(--ds-weight-extrabold);
        font-family: var(--ds-font-display);
        white-space: nowrap;
      }
      .ds-tline__added {
        color: var(--ds-primary-soft-text);
        font-weight: var(--ds-weight-semibold);
        white-space: nowrap;
      }
      .ds-tline ds-icon-button {
        flex: 0 0 auto;
      }
    `,
  ],
  host: {
    "[attr.received]": "received",
    "[attr.linked]": "linked",
  },
})
export class TicketLineComponent {
  @Input() emoji = "";
  @Input() imageUrl: string | null = null;
  @Input() rawName = "";
  @Input() articleLabel: string | null = null;
  @Input() quantity = 1;
  @Input() quantityLabel = "";
  @Input() unitLabel = "";
  @Input() priceLabel = "";
  @Input() totalPriceLabel = "";
  @Input() linked = false;
  @Input() received = false;
  @Input() stockLabel: string | null = null;
  @Input() incrementLabel = "";
  @Input() decrementLabel = "";
  @Input() linkLabel = "";
  @Input() changeLabel = "";
  @Input() removeLabel = "";
  @Input() openable = false;
  @Input() openLabel = "";

  @Output() quantityChanged = new EventEmitter<number>();
  @Output() searched = new EventEmitter<void>();
  @Output() removed = new EventEmitter<void>();
  @Output() opened = new EventEmitter<void>();

  get title(): string {
    return this.articleLabel ?? this.rawName;
  }
}
