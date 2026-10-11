import { Component, input, output } from "@angular/core";
import { ChipComponent } from "../../../chip/infrastructure/components/chip.component";
import { IconComponent } from "../../../icon/infrastructure/components/icon.component";
import { StepBadgeComponent } from "../../../step-badge/infrastructure/components/step-badge.component";

@Component({
  selector: "ds-step-row",
  imports: [ChipComponent, IconComponent, StepBadgeComponent],
  template: `
    <button
      type="button"
      class="ds-srow"
      [attr.aria-label]="ariaLabel() || null"
      (click)="pressed.emit()"
    >
      <ds-step-badge [label]="label()" />
      <span class="ds-srow__text">{{ text() }}</span>
      @if (meta()) {
        <ds-chip class="ds-srow__meta">{{ meta() }}</ds-chip>
      }
      <ds-icon
        class="ds-srow__chevron"
        name="chevronRight"
        [size]="16"
        [stroke]="2.2"
      />
    </button>
  `,
  styles: [
    `
      :host {
        display: block;
        min-width: 0;
      }
      .ds-srow {
        display: flex;
        align-items: flex-start;
        gap: var(--ds-space-3);
        width: 100%;
        min-width: 0;
        appearance: none;
        border: none;
        background: none;
        margin: 0;
        padding: var(--ds-space-3) 0;
        font: inherit;
        text-align: left;
        color: var(--ds-text);
        cursor: pointer;
        transition: opacity var(--ds-dur-1) var(--ds-ease-out);
      }
      .ds-srow:active {
        opacity: 0.6;
      }
      .ds-srow:focus-visible {
        outline: 2px solid var(--ds-border-focus);
        outline-offset: 2px;
        border-radius: var(--ds-radius-control);
      }
      .ds-srow__text {
        flex: 1 1 auto;
        min-width: 0;
        padding-top: 0.125rem;
        font-size: var(--ds-text-base);
        line-height: var(--ds-leading-snug);
        overflow-wrap: anywhere;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
      .ds-srow__meta {
        flex: none;
      }
      .ds-srow__chevron {
        flex: none;
        align-self: center;
        color: var(--ds-text-meta);
      }
    `,
  ],
})
export class StepRowComponent {
  readonly label = input("");
  readonly text = input("");
  readonly meta = input("");
  readonly ariaLabel = input("");

  readonly pressed = output<void>();
}
