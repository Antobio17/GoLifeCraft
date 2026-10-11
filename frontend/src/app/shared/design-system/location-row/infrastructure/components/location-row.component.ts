import { Component, computed, input, output } from "@angular/core";
import { GlyphComponent } from "../../../glyph/infrastructure/components/glyph.component";
import { IconComponent } from "../../../icon/infrastructure/components/icon.component";
import { DsGlyph } from "../../../glyph/domain/models/ds-glyph.enum";

@Component({
  selector: "ds-location-row",
  imports: [GlyphComponent, IconComponent],
  template: `
    <button
      type="button"
      class="ds-locrow"
      [attr.aria-label]="label()"
      (click)="activated.emit()"
    >
      <ds-glyph
        [name]="glyph()"
        [size]="22"
        [tile]="true"
        [color]="color()"
        box="2.75rem"
      />
      <span class="ds-locrow__body">
        <span class="ds-locrow__name">{{ name() }}</span>
        @if (meta()) {
          <span class="ds-locrow__meta">{{ meta() }}</span>
        }
      </span>
      @if (figure()) {
        <span class="ds-locrow__figure">{{ figure() }}</span>
      }
      <ds-icon class="ds-locrow__chevron" name="chevronRight" [size]="16" />
    </button>
  `,
  styles: [
    `
      :host {
        display: flex;
        flex-direction: column;
      }
      .ds-locrow {
        display: flex;
        align-items: center;
        gap: var(--ds-space-3);
        width: 100%;
        height: 100%;
        text-align: left;
        appearance: none;
        font: inherit;
        color: inherit;
        cursor: pointer;
        background: var(--ds-surface);
        border: 1px solid var(--ds-border);
        border-radius: var(--ds-radius-surface);
        padding: var(--ds-space-2) var(--ds-space-3) var(--ds-space-2)
          var(--ds-space-2);
        -webkit-tap-highlight-color: transparent;
        transition:
          border-color var(--ds-dur-2) var(--ds-ease-out),
          background var(--ds-dur-2) var(--ds-ease-out);
      }
      .ds-locrow:hover {
        background: var(--ds-surface-hover);
      }
      .ds-locrow:focus-visible {
        outline: none;
        box-shadow: var(--ds-focus-ring);
      }
      .ds-locrow__body {
        flex: 1 1 auto;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
      .ds-locrow__name {
        font-size: var(--ds-text-md);
        font-weight: var(--ds-weight-bold);
        line-height: 1.2;
        color: var(--ds-text);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .ds-locrow__meta {
        font-size: var(--ds-text-sm);
        color: var(--ds-text-muted);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .ds-locrow__figure {
        flex: none;
        font-family: var(--ds-font-display);
        font-size: var(--ds-text-lg);
        font-weight: var(--ds-weight-bold);
        font-variant-numeric: tabular-nums;
        color: var(--ds-text);
      }
      .ds-locrow__chevron {
        flex: none;
        color: var(--ds-text-meta);
      }
    `,
  ],
})
export class LocationRowComponent {
  readonly glyph = input<`${DsGlyph}`>(DsGlyph.Box);
  readonly color = input("");
  readonly name = input("");
  readonly meta = input("");
  readonly figure = input("");
  readonly figureLabel = input("");

  readonly activated = output<void>();

  readonly label = computed(() =>
    this.figureLabel() ? `${this.name()}, ${this.figureLabel()}` : null,
  );
}
