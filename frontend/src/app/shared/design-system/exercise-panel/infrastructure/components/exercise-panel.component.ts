import {
  Component,
  DestroyRef,
  ElementRef,
  EventEmitter,
  Input,
  NgZone,
  Output,
  afterNextRender,
  inject,
  viewChild,
} from "@angular/core";
import { ContentRevealService } from "@shared/design-system/reveal/application/services/content-reveal.service";
import { IconComponent } from "@shared/design-system/icon/infrastructure/components/icon.component";
import { ExercisePanelState } from "../../domain/models/exercise-panel-state.enum";

@Component({
  selector: "ds-exercise-panel",
  imports: [IconComponent],
  providers: [ContentRevealService],
  template: `
    <article
      class="ds-xpanel"
      [class.ds-xpanel--open]="expanded"
      [class.ds-xpanel--current]="state === states.Current"
      [class.ds-xpanel--done]="state === states.Done"
    >
      <div class="ds-xpanel__head">
        <span
          class="ds-xpanel__position"
          [class.ds-xpanel__position--ring]="progress !== null"
          aria-hidden="true"
        >
          @if (progress !== null) {
            <svg class="ds-xpanel__ring" viewBox="0 0 36 36">
              <circle class="ds-xpanel__ring-track" cx="18" cy="18" r="16" />
              <circle
                class="ds-xpanel__ring-fill"
                cx="18"
                cy="18"
                r="16"
                pathLength="100"
                [style.stroke-dashoffset]="100 - ringPercent"
              />
            </svg>
          }
          @if (state === states.Done) {
            <ds-icon name="check" [size]="14" [stroke]="2.5" />
          } @else {
            {{ position }}
          }
        </span>
        <button
          type="button"
          class="ds-xpanel__toggle"
          [attr.aria-expanded]="expanded"
          (click)="toggled.emit()"
        >
          <span class="ds-xpanel__text">
            <span class="ds-xpanel__name">{{ name }}</span>
            @if (meta) {
              <span class="ds-xpanel__meta">{{ meta }}</span>
            }
            @if (summary) {
              <span class="ds-xpanel__summary">
                <span class="ds-xpanel__value">{{ summary }}</span>
                @if (detail) {
                  <span class="ds-xpanel__detail">· {{ detail }}</span>
                }
              </span>
            }
          </span>
          @if (progressLabel) {
            <span class="ds-xpanel__sr">{{ progressLabel }}</span>
          }
        </button>
        <span class="ds-xpanel__actions">
          <ng-content select="[panelActions]"></ng-content>
        </span>
      </div>

      <div
        class="ds-xpanel__collapse"
        [class.ds-xpanel__collapse--open]="expanded"
        [attr.inert]="expanded ? null : ''"
        [attr.aria-hidden]="expanded ? null : 'true'"
      >
        <div #clip class="ds-xpanel__clip">
          <div #body class="ds-xpanel__body" data-ds-reveal>
            <ng-content></ng-content>
          </div>
        </div>
      </div>
    </article>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .ds-xpanel {
        background: var(--ds-surface);
        border: 1px solid var(--ds-border);
        border-radius: var(--ds-radius-surface);
        box-shadow: var(--ds-shadow-card);
        transition:
          border-color var(--ds-dur-2) var(--ds-ease-out),
          background var(--ds-dur-2) var(--ds-ease-out);
      }
      .ds-xpanel--current {
        border-color: var(--ds-primary-soft-border);
      }
      .ds-xpanel__head {
        display: flex;
        align-items: center;
        gap: var(--ds-space-3);
        padding: var(--ds-space-3) var(--ds-space-3) var(--ds-space-3)
          var(--ds-space-4);
      }
      .ds-xpanel__position {
        flex: 0 0 auto;
        width: 2rem;
        height: 2rem;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border-radius: var(--ds-radius-inner);
        background: var(--ds-surface-inset);
        color: var(--ds-text);
        font-family: var(--ds-font-display);
        font-size: var(--ds-text-base);
        font-weight: 800;
        font-variant-numeric: tabular-nums;
        transition:
          background var(--ds-dur-2) var(--ds-ease-out),
          color var(--ds-dur-2) var(--ds-ease-out);
      }
      .ds-xpanel__position--ring {
        position: relative;
        background: transparent;
      }
      .ds-xpanel__ring {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        transform: rotate(-90deg);
      }
      .ds-xpanel__ring-track,
      .ds-xpanel__ring-fill {
        fill: none;
        stroke-width: 2.5;
      }
      .ds-xpanel__ring-track {
        stroke: var(--ds-border);
      }
      .ds-xpanel__ring-fill {
        stroke: var(--ds-primary);
        stroke-dasharray: 100;
        stroke-linecap: round;
        transition: stroke-dashoffset var(--ds-dur-3) var(--ds-ease-out);
      }
      .ds-xpanel--done .ds-xpanel__position {
        color: var(--ds-primary-soft-text);
      }
      .ds-xpanel--done .ds-xpanel__ring-fill {
        stroke: var(--ds-primary-soft-border);
      }
      .ds-xpanel__sr {
        position: absolute;
        width: 1px;
        height: 1px;
        overflow: hidden;
        clip-path: inset(50%);
        white-space: nowrap;
      }
      .ds-xpanel__toggle {
        appearance: none;
        flex: 1 1 auto;
        min-width: 0;
        display: flex;
        align-items: center;
        gap: var(--ds-space-3);
        padding: 0;
        border: none;
        background: transparent;
        color: var(--ds-text);
        font-family: var(--ds-font-body);
        text-align: left;
        cursor: pointer;
        -webkit-tap-highlight-color: transparent;
      }
      .ds-xpanel__toggle:focus-visible {
        outline: 2px solid var(--ds-border-focus);
        outline-offset: 4px;
        border-radius: var(--ds-radius-mark);
      }
      .ds-xpanel__text {
        flex: 1 1 auto;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
      .ds-xpanel__name {
        font-size: var(--ds-text-lg);
        font-weight: var(--ds-weight-bold);
        line-height: var(--ds-leading-tight);
        overflow-wrap: anywhere;
      }
      .ds-xpanel--done .ds-xpanel__name {
        color: var(--ds-text-muted);
      }
      .ds-xpanel__meta {
        font-size: var(--ds-text-base);
        color: var(--ds-text-muted);
      }
      .ds-xpanel__summary {
        display: flex;
        flex-wrap: wrap;
        align-items: baseline;
        column-gap: var(--ds-space-1);
        margin-top: 2px;
      }
      .ds-xpanel__value {
        font-family: var(--ds-font-display);
        font-size: var(--ds-text-sm);
        font-weight: var(--ds-weight-bold);
        font-variant-numeric: tabular-nums;
        white-space: nowrap;
      }
      .ds-xpanel__detail {
        font-size: var(--ds-text-sm);
        color: var(--ds-text-muted);
        white-space: nowrap;
      }
      .ds-xpanel--done .ds-xpanel__value {
        color: var(--ds-text-muted);
      }
      .ds-xpanel__actions {
        flex: 0 0 auto;
        display: flex;
        align-items: center;
      }
      .ds-xpanel__actions:empty {
        display: none;
      }
      .ds-xpanel__collapse {
        display: grid;
        grid-template-rows: 0fr;
        transition: grid-template-rows var(--ds-dur-4) var(--ds-ease-in-out);
      }
      .ds-xpanel__collapse--open {
        grid-template-rows: 1fr;
      }
      .ds-xpanel__clip {
        min-height: 0;
        overflow: hidden;
      }
      .ds-xpanel__collapse--open > .ds-xpanel__clip--sizing {
        height: var(--ds-xpanel-clip-height);
        transition: height var(--ds-dur-3) var(--ds-ease-in-out);
      }
      .ds-xpanel__body {
        display: flex;
        flex-direction: column;
        gap: var(--ds-space-2);
        padding: 0 var(--ds-space-3) var(--ds-space-3);
        opacity: 0;
        transform: translateY(calc(-1 * var(--ds-space-2)));
        transition:
          opacity var(--ds-dur-3) var(--ds-ease-out),
          transform var(--ds-dur-4) var(--ds-ease-in-out);
      }
      .ds-xpanel__collapse--open .ds-xpanel__body {
        opacity: 1;
        transform: none;
      }
      @media (prefers-reduced-motion: reduce) {
        .ds-xpanel__ring-fill,
        .ds-xpanel__collapse,
        .ds-xpanel__clip--sizing,
        .ds-xpanel__body {
          transition-duration: 0.01ms;
        }
      }
    `,
  ],
})
export class ExercisePanelComponent {
  @Input() position = 0;
  @Input() name = "";
  @Input() meta = "";
  @Input() summary = "";
  @Input() detail = "";
  @Input() progressLabel = "";
  @Input() progress: number | null = null;
  @Input() state: ExercisePanelState = ExercisePanelState.Idle;
  @Input() expanded = false;

  @Output() toggled = new EventEmitter<void>();

  protected readonly states = ExercisePanelState;

  private clip = viewChild.required<ElementRef<HTMLElement>>("clip");
  private body = viewChild.required<ElementRef<HTMLElement>>("body");
  private zone = inject(NgZone);
  private destroyRef = inject(DestroyRef);
  private contentRevealService = inject(ContentRevealService);
  private bodyHeight = 0;

  constructor() {
    afterNextRender(() => {
      const body = this.body().nativeElement;
      const clip = this.clip().nativeElement;

      this.bodyHeight = body.offsetHeight;
      this.contentRevealService.observe(body);

      const observer = new ResizeObserver(() => this.followBody(body, clip));
      const release = (event: TransitionEvent) => {
        if (event.target !== clip || "height" !== event.propertyName) return;

        this.releaseClip(clip);
      };

      this.zone.runOutsideAngular(() => {
        observer.observe(body);
        clip.addEventListener("transitionend", release);
      });
      this.destroyRef.onDestroy(() => {
        observer.disconnect();
        clip.removeEventListener("transitionend", release);
      });
    });
  }

  private followBody(body: HTMLElement, clip: HTMLElement): void {
    const previous = this.bodyHeight;
    const next = body.offsetHeight;
    this.bodyHeight = next;

    if (!this.expanded || previous === next) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const from = clip.classList.contains("ds-xpanel__clip--sizing")
      ? clip.getBoundingClientRect().height
      : previous;

    this.releaseClip(clip);
    if (Math.abs(from - next) < 1) return;

    clip.style.setProperty("--ds-xpanel-clip-height", `${from}px`);
    clip.classList.add("ds-xpanel__clip--sizing");
    void clip.offsetHeight;
    clip.style.setProperty("--ds-xpanel-clip-height", `${next}px`);
  }

  private releaseClip(clip: HTMLElement): void {
    clip.classList.remove("ds-xpanel__clip--sizing");
    clip.style.removeProperty("--ds-xpanel-clip-height");
  }

  protected get ringPercent(): number {
    return Math.round(Math.min(Math.max(this.progress ?? 0, 0), 1) * 100);
  }
}
