import {
  Component,
  DestroyRef,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
  computed,
  inject,
  signal,
} from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { ModalSheetComponent } from "@shared/design-system/modal-sheet/infrastructure/components/modal-sheet.component";
import { ButtonComponent } from "@shared/design-system/button/infrastructure/components/button.component";
import { IconComponent } from "@shared/design-system/icon/infrastructure/components/icon.component";
import { SliderComponent } from "@shared/design-system/slider/infrastructure/components/slider.component";
import { ImageCropService } from "@shared/design-system/image-cropper/application/services/image-crop.service";
import { CropArea } from "@shared/design-system/image-cropper/domain/models/crop-area.model";
import { CropGesture } from "@shared/design-system/image-cropper/domain/models/crop-gesture.model";

const MIN_ZOOM = 1;
const MAX_ZOOM = 4;
const WHEEL_STEP = 0.0015;

@Component({
  selector: "ds-image-cropper",
  imports: [
    ReactiveFormsModule,
    ModalSheetComponent,
    ButtonComponent,
    IconComponent,
    SliderComponent,
  ],
  template: `
    <ds-modal-sheet
      [open]="open"
      [auto]="true"
      [title]="title"
      [closeLabel]="closeLabel"
      (closed)="cancel()"
    >
      <div class="ds-cropper">
        <div
          #stage
          class="ds-cropper__stage"
          (pointerdown)="onPointerDown($event)"
          (pointermove)="onPointerMove($event)"
          (pointerup)="onPointerEnd($event)"
          (pointercancel)="onPointerEnd($event)"
          (wheel)="onWheel($event)"
        >
          @if (imageUrl()) {
            <img
              class="ds-cropper__image"
              [src]="imageUrl()"
              [style.width.px]="displayWidth()"
              [style.height.px]="displayHeight()"
              [style.transform]="transform()"
              alt=""
              draggable="false"
              (load)="onImageLoaded($event)"
            />
          }
          <span class="ds-cropper__grid" aria-hidden="true"></span>
        </div>

        <p class="ds-cropper__hint">{{ hint }}</p>

        <div class="ds-cropper__zoom">
          <ds-icon name="minus" [size]="16" [stroke]="2.4" />
          <ds-slider
            class="ds-cropper__slider"
            [formControl]="zoomControl"
            [min]="minZoom"
            [max]="maxZoom"
            [step]="0.01"
            [ariaLabel]="zoomLabel"
          />
          <ds-icon name="plus" [size]="16" [stroke]="2.4" />
        </div>

        <div class="ds-cropper__actions">
          <ds-button variant="ghost" (clicked)="cancel()">
            {{ cancelLabel }}
          </ds-button>
          <ds-button
            variant="primary"
            [disabled]="!ready()"
            [loading]="cropping()"
            (clicked)="confirm()"
          >
            {{ confirmLabel }}
          </ds-button>
        </div>
      </div>
    </ds-modal-sheet>
  `,
  styles: [
    `
      :host {
        display: contents;
      }
      .ds-cropper {
        display: flex;
        flex-direction: column;
        gap: var(--ds-space-3);
      }
      .ds-cropper__stage {
        position: relative;
        width: 100%;
        max-width: 20rem;
        aspect-ratio: 1;
        margin: 0 auto;
        overflow: hidden;
        border-radius: var(--ds-radius-xl);
        border: 1px solid var(--ds-border);
        background: var(--ds-surface-inset);
        touch-action: none;
        cursor: grab;
        user-select: none;
      }
      .ds-cropper__stage:active {
        cursor: grabbing;
      }
      .ds-cropper__image {
        position: absolute;
        left: 50%;
        top: 50%;
        max-width: none;
        pointer-events: none;
        user-select: none;
        -webkit-user-drag: none;
      }
      .ds-cropper__grid {
        position: absolute;
        inset: 0;
        pointer-events: none;
      }
      .ds-cropper__grid::before,
      .ds-cropper__grid::after {
        content: "";
        position: absolute;
      }
      .ds-cropper__grid::before {
        top: 0;
        bottom: 0;
        left: 33.333%;
        right: 33.333%;
        border-left: 1px solid rgba(255, 255, 255, 0.35);
        border-right: 1px solid rgba(255, 255, 255, 0.35);
      }
      .ds-cropper__grid::after {
        left: 0;
        right: 0;
        top: 33.333%;
        bottom: 33.333%;
        border-top: 1px solid rgba(255, 255, 255, 0.35);
        border-bottom: 1px solid rgba(255, 255, 255, 0.35);
      }
      .ds-cropper__hint {
        margin: 0;
        text-align: center;
        font-size: var(--ds-text-sm);
        color: var(--ds-text-meta);
      }
      .ds-cropper__zoom {
        display: flex;
        align-items: center;
        gap: var(--ds-space-2);
        color: var(--ds-text-muted);
      }
      .ds-cropper__slider {
        flex: 1 1 auto;
      }
      .ds-cropper__actions {
        display: flex;
        justify-content: flex-end;
        gap: var(--ds-space-2);
      }
    `,
  ],
})
export class ImageCropperComponent {
  private imageCropService = inject(ImageCropService);
  private destroyRef = inject(DestroyRef);

  @Input() open = false;
  @Input() title = "Recorta la imagen";
  @Input() hint = "Arrastra y haz zoom. Se guardará cuadrada.";
  @Input() closeLabel = "Cerrar";
  @Input() cancelLabel = "Cancelar";
  @Input() confirmLabel = "Usar recorte";
  @Input() zoomLabel = "Zoom";

  @Input()
  set file(value: File | null) {
    this.revokeImageUrl();
    this.sourceFile = value;
    this.naturalWidth.set(0);
    this.naturalHeight.set(0);
    this.resetTransform();
    this.imageUrl.set(null === value ? null : URL.createObjectURL(value));
  }

  @Output() cropped = new EventEmitter<File>();
  @Output() cancelled = new EventEmitter<void>();

  readonly minZoom = MIN_ZOOM;
  readonly maxZoom = MAX_ZOOM;
  readonly zoomControl = new FormControl(MIN_ZOOM, { nonNullable: true });

  readonly imageUrl = signal<string | null>(null);
  readonly cropping = signal(false);

  private readonly naturalWidth = signal(0);
  private readonly naturalHeight = signal(0);
  private readonly stageSize = signal(0);
  private readonly zoom = signal(MIN_ZOOM);
  private readonly offsetX = signal(0);
  private readonly offsetY = signal(0);

  private sourceFile: File | null = null;
  private stageElement: HTMLElement | null = null;
  private stageObserver: ResizeObserver | null = null;
  private readonly pointers = new Map<number, PointerEvent>();
  private gesture: CropGesture | null = null;

  readonly ready = computed(
    () => this.naturalWidth() > 0 && this.stageSize() > 0,
  );

  readonly displayWidth = computed(() => this.naturalWidth() * this.scale());
  readonly displayHeight = computed(() => this.naturalHeight() * this.scale());

  readonly transform = computed(
    () =>
      `translate(-50%, -50%) translate(${this.offsetX()}px, ${this.offsetY()}px)`,
  );

  constructor() {
    this.zoomControl.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((value) => this.applyZoom(value));

    this.destroyRef.onDestroy(() => {
      this.detachStage();
      this.revokeImageUrl();
    });
  }

  @ViewChild("stage")
  set stage(reference: ElementRef<HTMLElement> | undefined) {
    this.attachStage(reference?.nativeElement ?? null);
  }

  onImageLoaded(event: Event): void {
    const image = event.target as HTMLImageElement;

    this.naturalWidth.set(image.naturalWidth);
    this.naturalHeight.set(image.naturalHeight);
    this.resetTransform();
  }

  onPointerDown(event: PointerEvent): void {
    if (!this.ready()) return;

    this.stageElement?.setPointerCapture(event.pointerId);
    this.pointers.set(event.pointerId, event);
    this.gesture = this.snapshotGesture();
  }

  onPointerMove(event: PointerEvent): void {
    if (!this.pointers.has(event.pointerId)) return;

    this.pointers.set(event.pointerId, event);

    const previous = this.gesture;
    const current = this.snapshotGesture();

    this.gesture = current;

    if (null === previous || null === current) return;

    this.applyPinch(previous, current);
    this.moveBy(
      current.centerX - previous.centerX,
      current.centerY - previous.centerY,
    );
  }

  onPointerEnd(event: PointerEvent): void {
    if (!this.pointers.delete(event.pointerId)) return;

    this.stageElement?.releasePointerCapture(event.pointerId);
    this.gesture = this.snapshotGesture();
  }

  onWheel(event: WheelEvent): void {
    if (!this.ready()) return;

    event.preventDefault();
    this.applyZoom(this.zoom() * Math.exp(-event.deltaY * WHEEL_STEP));
    this.syncZoomControl();
  }

  cancel(): void {
    this.cancelled.emit();
  }

  async confirm(): Promise<void> {
    if (null === this.sourceFile || !this.ready() || this.cropping()) return;

    this.cropping.set(true);

    try {
      const file = await this.imageCropService.cropToSquare(
        this.sourceFile,
        this.cropArea(),
      );

      this.cropped.emit(file);
    } finally {
      this.cropping.set(false);
    }
  }

  private cropArea(): CropArea {
    const scale = this.scale();
    const stage = this.stageSize();

    return {
      x: (this.displayWidth() / 2 - this.offsetX() - stage / 2) / scale,
      y: (this.displayHeight() / 2 - this.offsetY() - stage / 2) / scale,
      size: stage / scale,
    };
  }

  private scale(): number {
    const shortest = Math.min(this.naturalWidth(), this.naturalHeight());

    if (0 === shortest || 0 === this.stageSize()) return 1;

    return (this.stageSize() / shortest) * this.zoom();
  }

  private applyPinch(previous: CropGesture, current: CropGesture): void {
    if (0 === previous.distance || 0 === current.distance) return;

    this.applyZoom(this.zoom() * (current.distance / previous.distance));
    this.syncZoomControl();
  }

  private applyZoom(value: number): void {
    const next = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, value));
    const ratio = next / this.zoom();

    this.zoom.set(next);
    this.moveTo(this.offsetX() * ratio, this.offsetY() * ratio);
  }

  private syncZoomControl(): void {
    this.zoomControl.setValue(this.zoom(), { emitEvent: false });
  }

  private moveBy(deltaX: number, deltaY: number): void {
    this.moveTo(this.offsetX() + deltaX, this.offsetY() + deltaY);
  }

  private moveTo(x: number, y: number): void {
    const limitX = Math.max(0, (this.displayWidth() - this.stageSize()) / 2);
    const limitY = Math.max(0, (this.displayHeight() - this.stageSize()) / 2);

    this.offsetX.set(Math.min(limitX, Math.max(-limitX, x)));
    this.offsetY.set(Math.min(limitY, Math.max(-limitY, y)));
  }

  private resetTransform(): void {
    this.zoom.set(MIN_ZOOM);
    this.offsetX.set(0);
    this.offsetY.set(0);
    this.syncZoomControl();
  }

  private snapshotGesture(): CropGesture | null {
    const [first, second] = [...this.pointers.values()];

    if (undefined === first) return null;

    if (undefined === second) {
      return { centerX: first.clientX, centerY: first.clientY, distance: 0 };
    }

    return {
      centerX: (first.clientX + second.clientX) / 2,
      centerY: (first.clientY + second.clientY) / 2,
      distance: Math.hypot(
        first.clientX - second.clientX,
        first.clientY - second.clientY,
      ),
    };
  }

  private attachStage(element: HTMLElement | null): void {
    this.detachStage();

    if (null === element) return;

    this.stageElement = element;
    this.stageObserver = new ResizeObserver(() =>
      this.stageSize.set(element.clientWidth),
    );
    this.stageObserver.observe(element);
    this.stageSize.set(element.clientWidth);
  }

  private detachStage(): void {
    this.stageObserver?.disconnect();
    this.stageObserver = null;
    this.stageElement = null;
    this.pointers.clear();
    this.gesture = null;
  }

  private revokeImageUrl(): void {
    const url = this.imageUrl();

    if (null === url) return;

    URL.revokeObjectURL(url);
    this.imageUrl.set(null);
  }
}
