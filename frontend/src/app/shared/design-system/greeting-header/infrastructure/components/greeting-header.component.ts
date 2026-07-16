import { Component, EventEmitter, Input, Output } from "@angular/core";

@Component({
  selector: "ds-greeting-header",
  standalone: true,
  template: `
    <header class="dash__head">
      <div>
        <p class="dash__date">{{ date }}</p>
        <h1 class="dash__greeting">
          {{ greeting }}{{ name ? ", " + name : "" }}
        </h1>
      </div>
      <button
        type="button"
        class="dash__avatar"
        [attr.aria-label]="avatarLabel"
        (click)="avatarClick.emit()"
      >
        {{ initial }}
      </button>
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
        gap: 12px;
        padding: 6px 0 0;
      }
      .dash__date {
        margin: 0;
        font-size: 11.5px;
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
        font-size: 22px;
        line-height: 1.1;
        letter-spacing: -0.02em;
        color: var(--ds-text);
      }
      :host-context([data-theme="dark"]) .dash__greeting {
        font-weight: 700;
      }
      .dash__avatar {
        flex: none;
        width: 42px;
        height: 42px;
        border: none;
        padding: 0;
        cursor: pointer;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--ds-surface-brand);
        color: var(--ds-accent);
        font-family: var(--ds-font-display);
        font-weight: 800;
        font-size: 16px;
        transition: transform 0.15s ease;
      }
      .dash__avatar:hover {
        transform: scale(1.05);
      }
      .dash__avatar:active {
        transform: scale(0.96);
      }
      :host-context([data-theme="dark"]) .dash__avatar {
        background: var(--ds-accent);
        color: var(--ds-on-accent);
        font-weight: 700;
      }
      @media (min-width: 768px) {
        .dash__avatar {
          display: none;
        }
        .dash__date {
          font-size: 12.5px;
        }
        .dash__greeting {
          font-size: 30px;
        }
      }
    `,
  ],
})
export class GreetingHeaderComponent {
  @Input() date: string | null = "";
  @Input() greeting = "";
  @Input() name = "";
  @Input() initial = "";
  @Input() avatarLabel = "";
  @Output() avatarClick = new EventEmitter<void>();
}
