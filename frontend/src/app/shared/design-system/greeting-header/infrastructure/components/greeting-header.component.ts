import { Component, EventEmitter, Input, Output } from "@angular/core";

@Component({
  selector: "ds-greeting-header",
  template: `
    <header class="dash__head">
      <div>
        <p class="dash__date">{{ date }}</p>
        <h1 class="dash__greeting">
          {{ greeting }}{{ name ? ", " + name : "" }}
        </h1>
        @if (subtitle) {
          <p class="dash__subtitle">{{ subtitle }}</p>
        }
      </div>
      <div class="dash__actions">
        <ng-content select="[slot=actions]" />
        <button
          type="button"
          class="dash__avatar"
          [attr.aria-label]="avatarLabel"
          (click)="avatarClick.emit()"
        >
          @if (imageUrl) {
            <img class="dash__avatar-image" [src]="imageUrl" alt="" />
          } @else {
            {{ initial }}
          }
        </button>
      </div>
    </header>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .dash__head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--ds-space-3);
        padding: var(--ds-space-1-5) 0 0;
      }
      .dash__date {
        margin: 0;
        font-size: var(--ds-text-sm);
        font-weight: 600;
        color: var(--ds-text-muted);
        text-transform: capitalize;
      }
      :host-context([data-theme="dark"]) .dash__date {
        text-transform: uppercase;
        letter-spacing: 0.04em;
      }
      .dash__greeting {
        margin: 2px 0 0;
        font-family: var(--ds-font-display);
        font-weight: 800;
        font-size: var(--ds-text-2xl);
        line-height: 1.1;
        letter-spacing: -0.02em;
        color: var(--ds-text);
      }
      .dash__subtitle {
        margin: var(--ds-space-1) 0 0;
        font-family: var(--ds-font-display);
        font-weight: 700;
        font-size: var(--ds-text-xl);
        line-height: 1.2;
        letter-spacing: -0.01em;
        color: var(--ds-text-muted);
      }
      :host-context([data-theme="dark"]) .dash__greeting {
        font-weight: 700;
      }
      .dash__actions {
        display: flex;
        align-items: center;
        gap: var(--ds-space-2);
        flex: none;
      }
      .dash__avatar {
        box-sizing: border-box;
        flex: none;
        width: 2.625rem;
        height: 2.625rem;
        border: 1px solid var(--ds-avatar-ring);
        padding: 0;
        cursor: pointer;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--ds-primary-soft);
        color: var(--ds-primary-soft-text);
        font-family: var(--ds-font-display);
        font-weight: 800;
        font-size: var(--ds-text-lg);
        overflow: hidden;
        transition: transform var(--ds-dur-2) var(--ds-ease-out);
      }
      .dash__avatar-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }
      .dash__avatar:hover {
        transform: scale(1.05);
      }
      .dash__avatar:active {
        transform: scale(0.96);
      }
      :host-context([data-theme="dark"]) .dash__avatar {
        font-weight: 700;
      }
      @media (min-width: 768px) {
        .dash__avatar {
          display: none;
        }
        .dash__date {
          font-size: var(--ds-text-base);
        }
        .dash__greeting {
          font-size: var(--ds-text-3xl);
        }
      }
    `,
  ],
})
export class GreetingHeaderComponent {
  @Input() date: string | null = "";
  @Input() greeting = "";
  @Input() name = "";
  @Input() subtitle = "";
  @Input() initial = "";
  @Input() imageUrl: string | null = null;
  @Input() avatarLabel = "";
  @Output() avatarClick = new EventEmitter<void>();
}
