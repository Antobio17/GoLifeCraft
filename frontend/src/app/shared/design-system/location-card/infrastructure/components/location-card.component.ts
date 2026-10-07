import { Component, EventEmitter, Input, Output } from "@angular/core";
import { GlyphComponent } from "../../../glyph/infrastructure/components/glyph.component";
import { DsGlyph } from "../../../glyph/domain/models/ds-glyph.enum";
import { MacroBadge } from "../../../macro-badges/domain/models/macro-badge.model";

@Component({
  selector: "ds-location-card",
  imports: [GlyphComponent],
  template: `
    <button
      type="button"
      class="ds-loccard"
      [style.--loc-color]="color || null"
      (click)="activated.emit()"
    >
      <ds-glyph
        [name]="glyph"
        [size]="32"
        [tile]="true"
        [color]="color"
        box="3.5rem"
      />
      <span class="ds-loccard__body">
        <span class="ds-loccard__name">{{ name }}</span>
        @if (description) {
          <span class="ds-loccard__meta">{{ description }}</span>
        }
        @if (badges.length) {
          <span class="ds-loccard__stats">
            @for (badge of badges; track badge.value) {
              <span class="ds-loccard__stat">
                <span class="ds-loccard__figure">{{ badge.label }}</span>
                {{ badge.value }}
              </span>
            }
          </span>
        }
      </span>
    </button>
  `,
  styles: [
    `
      :host {
        display: flex;
        flex-direction: column;
      }
      .ds-loccard {
        --loc-color: var(--ds-primary);
        --loc-wash: color-mix(in srgb, var(--loc-color) 13%, transparent);
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
        overflow: hidden;
        background:
          radial-gradient(
            90% 120% at 0% 0%,
            var(--loc-wash),
            transparent 65%
          ),
          var(--ds-surface);
        border: 1px solid var(--ds-border);
        border-radius: var(--ds-radius-surface);
        --ds-pad: var(--ds-space-3);
        padding: var(--ds-pad);
        box-shadow: var(--ds-elev);
        transition:
          border-color var(--ds-dur-2) var(--ds-ease-out),
          box-shadow var(--ds-dur-3) var(--ds-ease-in-out),
          transform var(--ds-dur-3) var(--ds-ease-in-out);
      }
      .ds-loccard:hover {
        border-color: color-mix(in srgb, var(--loc-color) 45%, var(--ds-border));
        box-shadow: var(--ds-elev-lg);
        transform: translateY(-2px);
      }
      .ds-loccard__body {
        flex: 1 1 auto;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
      .ds-loccard__name {
        font-size: var(--ds-text-md);
        font-weight: var(--ds-weight-bold);
        line-height: 1.2;
        color: var(--ds-text);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .ds-loccard__meta {
        font-size: var(--ds-text-sm);
        color: var(--ds-text-muted);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .ds-loccard__stats {
        display: flex;
        flex-wrap: wrap;
        gap: var(--ds-space-1-5) var(--ds-space-3);
        margin-top: var(--ds-space-1-5);
      }
      .ds-loccard__stat {
        display: inline-flex;
        align-items: baseline;
        gap: var(--ds-space-1);
        font-size: var(--ds-text-xs);
        font-weight: var(--ds-weight-semibold);
        color: var(--ds-text-muted);
      }
      .ds-loccard__figure {
        font-size: var(--ds-text-base);
        font-weight: var(--ds-weight-bold);
        font-variant-numeric: tabular-nums;
        color: var(--ds-text);
      }
    `,
  ],
})
export class LocationCardComponent {
  @Input() glyph: `${DsGlyph}` = DsGlyph.Box;
  @Input() color = "";
  @Input() name = "";
  @Input() description = "";
  @Input() badges: MacroBadge[] = [];

  @Output() activated = new EventEmitter<void>();
}
