import { Component, EventEmitter, Input, Output } from "@angular/core";
import { ButtonComponent } from "@shared/design-system/button/infrastructure/components/button.component";
import { EmojiTileComponent } from "@shared/design-system/emoji-tile/infrastructure/components/emoji-tile.component";
import { IconComponent } from "@shared/design-system/icon/infrastructure/components/icon.component";
import { StackComponent } from "@shared/design-system/stack/infrastructure/components/stack.component";
import { TextComponent } from "@shared/design-system/text/infrastructure/components/text.component";
import { ProductionRowState } from "@shared/design-system/production-row/domain/models/production-row-state.model";

@Component({
  selector: "ds-production-row",
  imports: [
    ButtonComponent,
    EmojiTileComponent,
    IconComponent,
    StackComponent,
    TextComponent,
  ],
  template: `
    <ds-stack
      class="ds-prow"
      direction="row"
      align="center"
      [gap]="'var(--ds-space-3)'"
    >
      @if ("done" === state) {
        <span class="ds-prow__check" aria-hidden="true">
          <ds-icon name="check" [size]="15" [stroke]="3" />
        </span>
      }

      <ds-emoji-tile [emoji]="emoji" [size]="44" [radius]="12" />

      <ds-stack class="ds-prow__body" [gap]="'2px'" [grow]="true">
        <ds-text variant="strong" class="ds-prow__name" [truncate]="true">{{
          name
        }}</ds-text>
        <ds-text variant="meta" class="ds-prow__meta">{{ meta }}</ds-text>
      </ds-stack>

      @if ("deficit" === state && actionLabel) {
        <ds-button
          variant="soft"
          size="sm"
          [disabled]="busy"
          [loading]="busy"
          (clicked)="action.emit()"
          >{{ actionLabel }}</ds-button
        >
      }

      @if ("expected" === state && linkLabel) {
        <ds-button
          variant="link"
          size="sm"
          [disabled]="busy"
          (clicked)="linked.emit()"
          >{{ linkLabel }}</ds-button
        >
      }
    </ds-stack>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .ds-prow {
        width: 100%;
        box-sizing: border-box;
        background: var(--ds-surface);
        border: 1px solid var(--ds-border);
        border-radius: var(--ds-radius-xl);
        padding: var(--ds-space-2) var(--ds-space-3);
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
      .ds-prow__check {
        flex: 0 0 auto;
        width: 1.625rem;
        height: 1.625rem;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: var(--ds-radius-md);
        background: var(--ds-accent);
        border: 1.5px solid var(--ds-accent);
        color: var(--ds-on-accent);
      }
      .ds-prow__body {
        min-width: 0;
      }
      .ds-prow__name {
        font-weight: 700;
        line-height: 1.25;
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
  @Input() actionLabel = "";
  @Input() linkLabel = "";
  @Input() busy = false;

  @Output() action = new EventEmitter<void>();
  @Output() linked = new EventEmitter<void>();
}
