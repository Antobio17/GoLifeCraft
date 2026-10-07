import { Component, input, output } from "@angular/core";
import { IconComponent } from "@shared/design-system/icon/infrastructure/components/icon.component";
import { GlyphComponent } from "@shared/design-system/glyph/infrastructure/components/glyph.component";
import { DsIconName } from "@shared/design-system/icon/domain/models/icon.model";
import { DsGlyph } from "@shared/design-system/glyph/domain/models/ds-glyph.enum";

@Component({
  selector: "ds-link-row",
  imports: [IconComponent, GlyphComponent],
  template: `
    <button
      type="button"
      class="ds-lrow"
      [class.ds-lrow--done]="done()"
      (click)="clicked.emit()"
    >
      @if (glyph(); as name) {
        <span class="ds-lrow__tile">
          <ds-glyph [name]="name" [size]="22" />
        </span>
      } @else if (icon(); as name) {
        <span class="ds-lrow__tile">
          <ds-icon [name]="name" [size]="20" />
        </span>
      }
      <span class="ds-lrow__body">
        <span class="ds-lrow__title">{{ title() }}</span>
        @if (meta()) {
          <span class="ds-lrow__meta">{{ meta() }}</span>
        }
      </span>
      <ds-icon class="ds-lrow__chevron" name="chevronRight" [size]="16" />
    </button>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .ds-lrow {
        width: 100%;
        display: flex;
        align-items: center;
        gap: var(--ds-space-3);
        padding: var(--ds-space-1-5) var(--ds-space-2);
        border: none;
        border-radius: var(--ds-radius-inner);
        background: transparent;
        color: var(--ds-text);
        font: inherit;
        text-align: left;
        cursor: pointer;
        transition: background var(--ds-transition-fast);
      }
      .ds-lrow:hover {
        background: var(--ds-surface-hover);
      }
      .ds-lrow:focus-visible {
        outline: none;
        box-shadow: var(--ds-focus-ring);
      }
      .ds-lrow__tile {
        flex: none;
        width: 2.375rem;
        height: 2.375rem;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border-radius: var(--ds-radius-inner);
        background: color-mix(
          in srgb,
          var(--ds-module, var(--ds-primary)) 14%,
          transparent
        );
        color: var(--ds-module-text, var(--ds-primary));
      }
      .ds-lrow__body {
        flex: 1 1 auto;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 1px;
      }
      .ds-lrow__title {
        font-size: var(--ds-text-md);
        font-weight: var(--ds-weight-bold);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .ds-lrow--done .ds-lrow__title {
        color: var(--ds-text-muted);
        text-decoration: line-through;
      }
      .ds-lrow__meta {
        font-size: var(--ds-text-base);
        color: var(--ds-text-muted);
      }
      .ds-lrow__chevron {
        flex: none;
        color: var(--ds-text-meta);
      }
    `,
  ],
})
export class LinkRowComponent {
  readonly title = input("");
  readonly meta = input("");
  readonly icon = input<DsIconName | null>(null);
  readonly glyph = input<`${DsGlyph}` | null>(null);
  readonly done = input(false);

  readonly clicked = output<void>();
}
