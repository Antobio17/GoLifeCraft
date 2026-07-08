import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  forwardRef,
} from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import { Subject, Subscription } from "rxjs";
import { debounceTime, distinctUntilChanged } from "rxjs/operators";

@Component({
  selector: "ds-search-input",
  standalone: true,
  template: `
    <div class="ds-search" [class.is-focused]="isFocused">
      <svg
        class="ds-search__icon"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <circle cx="11" cy="11" r="7"></circle>
        <path d="M21 21l-4.3-4.3"></path>
      </svg>
      <input
        class="ds-search__input"
        type="text"
        [placeholder]="placeholder"
        [value]="value"
        [disabled]="disabled"
        (input)="onInput($event)"
        (focus)="isFocused = true"
        (blur)="onBlur()"
      />
      @if (value) {
        <button
          class="ds-search__clear"
          type="button"
          [attr.aria-label]="clearLabel"
          (click)="clear()"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.2"
            stroke-linecap="round"
          >
            <path d="M6 6l12 12M18 6L6 18"></path>
          </svg>
        </button>
      }
    </div>
  `,
  styles: [
    `
      .ds-search {
        display: flex;
        align-items: center;
        gap: 10px;
        background: var(--ds-surface);
        border: 1px solid var(--ds-border-input);
        border-radius: var(--ds-radius-xl);
        padding: 11px 14px;
        transition:
          border-color 0.15s ease,
          box-shadow 0.15s ease;
      }
      .ds-search.is-focused {
        border-color: var(--ds-border-focus);
        box-shadow: var(--ds-focus-ring);
      }
      .ds-search__icon {
        color: var(--ds-text-meta);
        flex: 0 0 auto;
      }
      .ds-search__input {
        flex: 1 1 auto;
        min-width: 0;
        border: none;
        outline: none;
        background: transparent;
        font: inherit;
        font-size: var(--ds-text-base);
        color: var(--ds-text);
      }
      .ds-search__input::placeholder {
        color: var(--ds-text-meta);
      }
      .ds-search__clear {
        appearance: none;
        border: none;
        background: transparent;
        color: var(--ds-text-muted);
        cursor: pointer;
        display: flex;
        padding: 2px;
        border-radius: var(--ds-radius-sm);
        flex: 0 0 auto;
      }
      .ds-search__clear:hover {
        color: var(--ds-text);
      }
    `,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SearchInputComponent),
      multi: true,
    },
  ],
})
export class SearchInputComponent
  implements ControlValueAccessor, OnInit, OnDestroy
{
  @Input() placeholder = "";
  @Input() clearLabel = "Clear";
  @Input() debounce = 300;
  @Output() searched = new EventEmitter<string>();

  value = "";
  disabled = false;
  isFocused = false;

  private input$ = new Subject<string>();
  private sub?: Subscription;
  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  ngOnInit(): void {
    this.sub = this.input$
      .pipe(debounceTime(this.debounce), distinctUntilChanged())
      .subscribe((value) => this.searched.emit(value));
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  writeValue(value: string | null): void {
    this.value = value ?? "";
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onInput(event: Event): void {
    this.value = (event.target as HTMLInputElement).value;
    this.onChange(this.value);
    this.input$.next(this.value);
  }

  onBlur(): void {
    this.isFocused = false;
    this.onTouched();
  }

  clear(): void {
    this.value = "";
    this.onChange("");
    this.input$.next("");
  }
}
