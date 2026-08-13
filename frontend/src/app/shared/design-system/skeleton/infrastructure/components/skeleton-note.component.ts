import { Component, Input } from "@angular/core";

@Component({
  selector: "ds-skeleton-note",
  template: `
    <div class="sknote">
      <span class="ds-sk sknote__icon"></span>
      <div class="sknote__text">
        @for (line of lineArray; track line) {
          <span class="ds-sk sknote__line"></span>
        }
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .sknote {
        --ds-skeleton-base: color-mix(
          in srgb,
          var(--ds-primary) 14%,
          transparent
        );
        --ds-skeleton-highlight: color-mix(
          in srgb,
          var(--ds-primary) 26%,
          transparent
        );
        box-sizing: border-box;
        display: flex;
        align-items: flex-start;
        gap: var(--ds-space-2);
        background: var(--ds-primary-soft);
        border-radius: var(--ds-radius-lg);
        padding: var(--ds-space-3);
      }
      .sknote__icon {
        flex: 0 0 auto;
        width: 1rem;
        height: 1rem;
        border-radius: var(--ds-radius-sm);
      }
      .sknote__text {
        flex: 1 1 auto;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: var(--ds-space-1-5);
      }
      .sknote__line {
        width: 100%;
        height: 0.5625rem;
      }
      .sknote__text .sknote__line:last-child {
        width: 62%;
      }
    `,
  ],
})
export class SkeletonNoteComponent {
  @Input() lines = 2;

  get lineArray(): number[] {
    return Array.from({ length: this.lines }, (_, index) => index);
  }
}
