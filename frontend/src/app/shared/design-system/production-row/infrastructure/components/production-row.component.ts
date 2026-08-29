import { Component, EventEmitter, Input, Output } from "@angular/core";
import { NgTemplateOutlet } from "@angular/common";
import { ButtonComponent } from "@shared/design-system/button/infrastructure/components/button.component";
import { EmojiTileComponent } from "@shared/design-system/emoji-tile/infrastructure/components/emoji-tile.component";
import { IconComponent } from "@shared/design-system/icon/infrastructure/components/icon.component";
import { StackComponent } from "@shared/design-system/stack/infrastructure/components/stack.component";
import { TextComponent } from "@shared/design-system/text/infrastructure/components/text.component";
import { ProductionRowState } from "@shared/design-system/production-row/domain/models/production-row-state.model";

@Component({
  selector: "ds-production-row",
  imports: [
    NgTemplateOutlet,
    ButtonComponent,
    EmojiTileComponent,
    IconComponent,
    StackComponent,
    TextComponent,
  ],
  template: `
    <ng-template #content>
      <ds-emoji-tile [emoji]="emoji" [size]="44" [radius]="12" />

      <ds-stack class="ds-prow__body" [gap]="'2px'" [grow]="true">
        <ds-text variant="strong" class="ds-prow__name" [truncate]="true">{{
          name
        }}</ds-text>
        <ds-text variant="meta" class="ds-prow__meta">{{ meta }}</ds-text>
        @if (tag) {
          <span class="ds-prow__tag">{{ tag }}</span>
        }
      </ds-stack>

      @if (!interactive && "expected" !== state && actionLabel) {
        <ds-button
          variant="soft"
          size="sm"
          [disabled]="busy"
          [loading]="busy"
          (clicked)="action.emit()"
          >{{ actionLabel }}</ds-button
        >
      }

      @if ("done" === state && doneLabel) {
        <span class="ds-prow__done">
          <ds-icon name="check" [size]="13" [stroke]="3" />
          {{ doneLabel }}
        </span>
      }

      @if (!interactive && "expected" === state && linkLabel) {
        <ds-button
          variant="link"
          size="sm"
          [disabled]="busy"
          (clicked)="linked.emit()"
          >{{ linkLabel }}</ds-button
        >
      }
    </ng-template>

    @if (interactive) {
      <button
        type="button"
        class="ds-prow ds-prow--interactive"
        [disabled]="busy"
        (click)="opened.emit()"
      >
        <ng-container [ngTemplateOutlet]="content" />
      </button>
    } @else {
      <ds-stack
        class="ds-prow"
        direction="row"
        align="center"
        [gap]="'var(--ds-space-3)'"
      >
        <ng-container [ngTemplateOutlet]="content" />
      </ds-stack>
    }
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .ds-prow {
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: var(--ds-space-3);
        width: 100%;
        box-sizing: border-box;
        background: var(--ds-surface);
        border: 1px solid var(--ds-border);
        border-radius: var(--ds-radius-xl);
        padding: var(--ds-space-2) var(--ds-space-3);
      }
      .ds-prow--interactive {
        appearance: none;
        font: inherit;
        color: inherit;
        text-align: left;
        cursor: pointer;
        transition:
          border-color var(--ds-transition-fast),
          background var(--ds-transition-fast);
      }
      .ds-prow--interactive:hover:not(:disabled) {
        border-color: var(--ds-border-strong);
      }
      .ds-prow--interactive:active:not(:disabled) {
        transform: scale(0.995);
      }
      .ds-prow--interactive:focus-visible {
        outline: none;
        border-color: var(--ds-border-focus);
        box-shadow: var(--ds-focus-ring);
      }
      :host([state="expected"]) .ds-prow,
      :host([state="done"]) .ds-prow {
        background: var(--ds-surface-subtle);
      }
      :host([state="expected"]) ds-emoji-tile,
      :host([state="expected"]) .ds-prow__body,
      :host([state="done"]) ds-emoji-tile,
      :host([state="done"]) .ds-prow__body {
        opacity: 0.62;
      }
      /* A status, not a control: the tick used to look like a checkbox that would untick, and it
         never did, because the whole row opens the recipe. */
      .ds-prow__done {
        flex: 0 0 auto;
        display: inline-flex;
        align-items: center;
        gap: var(--ds-space-1);
        border-radius: var(--ds-radius-pill);
        padding: 2px var(--ds-space-2);
        background: var(--ds-primary-soft);
        color: var(--ds-primary-soft-text);
        font-size: var(--ds-text-xs);
        font-weight: var(--ds-weight-bold);
        white-space: nowrap;
      }
      .ds-prow__body {
        min-width: 0;
      }
      .ds-prow__name {
        font-weight: 700;
        line-height: 1.25;
      }
      .ds-prow__tag {
        align-self: flex-start;
        max-width: 100%;
        margin-top: 3px;
        border-radius: var(--ds-radius-lg);
        padding: 1px var(--ds-space-2);
        background: var(--ds-surface-inset);
        color: var(--ds-text-meta);
        font-size: var(--ds-text-xs);
        font-weight: var(--ds-weight-semibold);
        line-height: 1.35;
        overflow-wrap: anywhere;
      }
      .ds-prow__meta {
        line-height: 1.3;
      }
      .ds-prow ds-button {
        flex: 0 0 auto;
      }
    `,
  ],
  host: {
    "[attr.state]": "state",
  },
})
export class ProductionRowComponent {
  @Input() state: ProductionRowState = "deficit";
  @Input() emoji = "";
  @Input() name = "";
  @Input() meta = "";
  @Input() tag = "";
  @Input() actionLabel = "";
  @Input() doneLabel = "";
  @Input() linkLabel = "";
  @Input() interactive = false;
  @Input() busy = false;

  @Output() action = new EventEmitter<void>();
  @Output() linked = new EventEmitter<void>();
  @Output() opened = new EventEmitter<void>();
}
