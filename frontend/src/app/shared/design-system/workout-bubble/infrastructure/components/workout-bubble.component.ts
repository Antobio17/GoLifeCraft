import { Component, EventEmitter, Input, Output } from "@angular/core";

@Component({
  selector: "ds-workout-bubble",
  template: `
    <button
      type="button"
      class="bubble"
      [class.bubble--paused]="paused"
      [attr.aria-label]="label"
      (click)="go.emit()"
    >
      <span class="bubble__pulse"></span>
      <span class="bubble__time">{{ elapsedLabel }}</span>
    </button>
  `,
  styles: [
    `
      :host {
        display: flex;
        flex: none;
        pointer-events: auto;
        animation: bubbleIn var(--ds-dur-4) var(--ds-ease-spring);
      }
      .bubble {
        appearance: none;
        box-sizing: border-box;
        display: flex;
        align-items: center;
        gap: var(--ds-space-1-5);
        height: 100%;
        min-height: 3rem;
        padding: 0 var(--ds-space-3) 0 var(--ds-space-2);
        border: 1px solid var(--ds-border);
        border-radius: var(--ds-radius-pill);
        background: var(--ds-glass-bg);
        box-shadow: var(--ds-glass-shadow);
        backdrop-filter: var(--ds-glass-blur);
        -webkit-backdrop-filter: var(--ds-glass-blur);
        color: var(--ds-text);
        font: inherit;
        cursor: pointer;
        -webkit-tap-highlight-color: transparent;
        transition: transform var(--ds-dur-1) var(--ds-ease-out);
      }
      .bubble:active {
        transform: scale(0.94);
      }
      .bubble:focus-visible {
        outline: 2px solid var(--ds-border-focus);
        outline-offset: 2px;
      }
      .bubble__pulse {
        width: 0.4375rem;
        height: 0.4375rem;
        border-radius: 50%;
        background: var(--ds-primary);
        box-shadow: 0 0 0 0.1875rem var(--ds-primary-soft);
        animation: bubblePulse 1.6s var(--ds-ease-in-out) infinite;
      }
      .bubble__time {
        font-size: var(--ds-text-lg);
        font-weight: 700;
        font-variant-numeric: tabular-nums;
        line-height: 1;
        white-space: nowrap;
      }
      .bubble--paused .bubble__pulse {
        animation: none;
        background: var(--ds-text-meta);
        box-shadow: none;
      }
      .bubble--paused .bubble__time {
        color: var(--ds-text-muted);
      }
      @keyframes bubblePulse {
        0%,
        100% {
          opacity: 1;
        }
        50% {
          opacity: 0.4;
        }
      }
      @keyframes bubbleIn {
        from {
          opacity: 0;
          transform: scale(0.6);
        }
      }
      @media (prefers-reduced-motion: reduce) {
        :host,
        .bubble__pulse {
          animation: none;
        }
      }
    `,
  ],
})
export class WorkoutBubbleComponent {
  @Input() paused = false;
  @Input() elapsedLabel = "";
  @Input() label = "";

  @Output() go = new EventEmitter<void>();
}
