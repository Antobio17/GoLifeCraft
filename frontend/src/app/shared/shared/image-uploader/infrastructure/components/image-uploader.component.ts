import {
  Component,
  Input,
  Output,
  EventEmitter,
  forwardRef,
  ViewChild,
  ElementRef,
  OnDestroy,
  ViewEncapsulation,
  HostListener,
  Renderer2,
  DOCUMENT,
  inject,
} from "@angular/core";

import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import {
  ImageUploadConfig,
  ImageSelectedEvent,
  DEFAULT_IMAGE_UPLOAD_CONFIG,
} from "../../domain/models/image-upload.model";
import { Observable } from "rxjs/internal/Observable";
import { take } from "rxjs/operators";
import { ContextualTranslatePipe } from "../../../i18n/infrastructure/pipes/contextual-translate.pipe";
import { FloatingToastService } from "../../../floating-toasts/application/services/floating-toast.service";

interface Annotation {
  type: "number" | "text";
  text: string;
  x: number;
  y: number;
  color: string;
  fontSize: number;
}

@Component({
  selector: "app-image-uploader",
  templateUrl: "./image-uploader.component.html",
  styleUrls: ["./image-uploader.component.css"],
  encapsulation: ViewEncapsulation.None,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ImageUploaderComponent),
      multi: true,
    },
  ],
  imports: [ContextualTranslatePipe],
})
export class ImageUploaderComponent implements ControlValueAccessor, OnDestroy {
  private renderer = inject(Renderer2);
  private document = inject<Document>(DOCUMENT);
  private floatingToastService = inject(FloatingToastService);

  @Input() config: Partial<ImageUploadConfig> = {};
  @Input() imagePreview: string | null = null;
  @Input() disabled: boolean = false;
  @Input() showRequired: boolean = false;
  @Input() viewImageHandler: (() => Observable<Blob>) | null = null;
  @Input() saveImageHandler: ((file: File) => Observable<void>) | null = null;
  @Input() restoreImageHandler: (() => Observable<void>) | null = null;
  @Output() imageSelected = new EventEmitter<ImageSelectedEvent>();
  @Output() imageRemoved = new EventEmitter<void>();
  @Output() imageViewed = new EventEmitter<{ src: string; title: string }>();
  @Output() imageSaved = new EventEmitter<void>();
  @Output() imageRestored = new EventEmitter<void>();
  @ViewChild("fileInput") fileInput!: ElementRef<HTMLInputElement>;

  showImageModal: boolean = false;
  private modalImageSrc: string | null = null;
  private modalImageTitle: string = "";
  private modalImageLoading: boolean = false;
  private modalElement: HTMLElement | null = null;
  private modalBodyEl: HTMLElement | null = null;
  private onChange: (value: File | null) => void = () => {};
  private onTouched: () => void = () => {};
  private readonly uniqueId: string = `image-uploader-${Math.random().toString(36).substr(2, 9)}`;
  private modalObjectUrl: string | null = null;

  private isEditMode: boolean = false;
  private annotations: Annotation[] = [];
  private annotationCounter: number = 1;
  private annotationMode: "number" | "text" = "number";
  private annotationColor: string = "#ef4444";
  private annotationFontSize: number = 28;
  private annotationText: string = "";
  private canvasElement: HTMLCanvasElement | null = null;
  private editToolbarEl: HTMLElement | null = null;
  private editBtnEl: HTMLElement | null = null;
  private counterInputEl: HTMLInputElement | null = null;
  private isSavingAnnotation: boolean = false;
  private isRestoringImage: boolean = false;

  get mergedConfig(): Required<ImageUploadConfig> {
    return {
      ...DEFAULT_IMAGE_UPLOAD_CONFIG,
      ...this.config,
    };
  }

  get inputId(): string {
    return this.uniqueId;
  }

  @HostListener("document:keydown.escape")
  onEscapeKey(): void {
    if (!this.showImageModal) {
      return;
    }
    if (this.isEditMode) {
      this.exitEditMode();
      return;
    }
    this.closeImageModal();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.processFile(input.files[0]);
    }
  }

  private processFile(file: File): void {
    if (!this.validateFile(file)) {
      return;
    }

    this.createImagePreview(file, (preview) => {
      this.imagePreview = preview;
      const event: ImageSelectedEvent = { file, preview };
      this.imageSelected.emit(event);
      this.onChange(file);
      this.onTouched();
    });
  }

  private validateFile(file: File): boolean {
    if (!file.type.startsWith("image/")) {
      this.emitError("Please select a valid image file");
      return false;
    }

    if (file.size > this.mergedConfig.maxSizeBytes) {
      const maxSizeMB = (
        this.mergedConfig.maxSizeBytes /
        (1024 * 1024)
      ).toFixed(0);
      this.emitError(`Image cannot exceed ${maxSizeMB}MB`);
      return false;
    }

    return true;
  }

  private createImagePreview(
    file: File,
    callback: (preview: string) => void,
  ): void {
    const reader = new FileReader();
    reader.onload = (e) => {
      callback(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  }

  removeImage(): void {
    this.imagePreview = null;
    this.imageRemoved.emit();
    this.onChange(null);
    this.onTouched();

    if (this.fileInput && this.fileInput.nativeElement) {
      this.fileInput.nativeElement.value = "";
    }
  }

  get isLocalPreview(): boolean {
    return !!this.imagePreview?.startsWith("data:");
  }

  openImageModal(): void {
    this.modalImageTitle = this.mergedConfig.modalTitle;

    if (this.viewImageHandler) {
      this.modalImageLoading = true;
      this.modalImageSrc = null;
      this.showImageModal = true;
      this.createModalInBody();

      this.viewImageHandler()
        .pipe(take(1))
        .subscribe({
          next: (blob: Blob) => {
            if (!(blob instanceof Blob)) {
              this.modalImageLoading = false;
              this.renderBodyContent();
              return;
            }
            this.setModalImageFromBlob(blob);
          },
          error: (err) => {
            console.error(err);
            this.modalImageLoading = false;
            this.renderBodyContent();
          },
        });
      return;
    }

    if (!this.imagePreview) {
      return;
    }

    this.modalImageSrc = this.imagePreview;
    this.modalImageLoading = false;
    this.showImageModal = true;
    this.createModalInBody();
    this.imageViewed.emit({
      src: this.modalImageSrc,
      title: this.modalImageTitle,
    });
  }

  private setModalImageFromBlob(blob: Blob): void {
    this.revokeCurrentUrl();

    const objectUrl = URL.createObjectURL(blob);
    this.modalObjectUrl = objectUrl;
    this.modalImageSrc = objectUrl;
    this.modalImageLoading = false;
    this.renderBodyContent();

    this.imageViewed.emit({
      src: this.modalImageSrc,
      title: this.modalImageTitle,
    });
  }

  private revokeCurrentUrl(): void {
    if (!this.modalObjectUrl) {
      return;
    }

    URL.revokeObjectURL(this.modalObjectUrl);
    this.modalObjectUrl = null;
  }

  closeImageModal(): void {
    this.showImageModal = false;
    this.modalImageLoading = false;
    this.modalImageSrc = null;
    this.modalImageTitle = "";
    this.isEditMode = false;
    this.annotations = [];
    this.annotationCounter = 1;
    this.canvasElement = null;
    this.editToolbarEl = null;
    this.editBtnEl = null;
    this.isSavingAnnotation = false;
    this.isRestoringImage = false;
    if (this.modalObjectUrl) {
      URL.revokeObjectURL(this.modalObjectUrl);
      this.modalObjectUrl = null;
    }
    this.removeModalFromBody();
  }

  private createModalInBody(): void {
    if (this.modalElement) {
      return;
    }

    const overlay = this.renderer.createElement("div");
    this.renderer.addClass(overlay, "imu-preview-overlay");
    this.renderer.listen(overlay, "click", () => {
      if (!this.isEditMode) {
        this.closeImageModal();
      }
    });

    const toolbar = this.renderer.createElement("div");
    this.renderer.addClass(toolbar, "imu-preview-toolbar");
    this.renderer.listen(toolbar, "click", (e: Event) => e.stopPropagation());

    const fileInfo = this.renderer.createElement("div");
    this.renderer.addClass(fileInfo, "imu-preview-file-info");
    fileInfo.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="currentColor" stroke-width="2"/><circle cx="8.5" cy="8.5" r="1.5" stroke="currentColor" stroke-width="2"/><polyline points="21 15 16 10 5 21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

    const filename = this.renderer.createElement("span");
    this.renderer.addClass(filename, "imu-preview-filename");
    this.renderer.appendChild(
      filename,
      this.renderer.createText(this.modalImageTitle),
    );
    this.renderer.appendChild(fileInfo, filename);

    const actions = this.renderer.createElement("div");
    this.renderer.addClass(actions, "imu-preview-toolbar-actions");

    if (this.restoreImageHandler) {
      const restoreBtn = this.renderer.createElement("button");
      this.renderer.addClass(restoreBtn, "imu-preview-btn");
      this.renderer.addClass(restoreBtn, "imu-preview-btn-restore");
      this.renderer.setAttribute(restoreBtn, "type", "button");
      this.renderer.setAttribute(
        restoreBtn,
        "title",
        "Restaurar imagen original",
      );
      this.renderer.listen(restoreBtn, "click", () =>
        this.restoreOriginalImage(restoreBtn),
      );
      restoreBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/></svg><span>Restaurar original</span>`;
      this.renderer.appendChild(actions, restoreBtn);
    }

    if (this.saveImageHandler) {
      const editBtn = this.renderer.createElement("button");
      this.renderer.addClass(editBtn, "imu-preview-btn");
      this.renderer.addClass(editBtn, "imu-preview-btn-edit");
      this.renderer.setAttribute(editBtn, "type", "button");
      this.renderer.setAttribute(editBtn, "title", "Anotar imagen");
      this.renderer.listen(editBtn, "click", () => this.enterEditMode());
      editBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg><span>Anotar</span>`;
      this.editBtnEl = editBtn;
      this.renderer.appendChild(actions, editBtn);
    }

    const closeBtn = this.renderer.createElement("button");
    this.renderer.addClass(closeBtn, "imu-preview-btn");
    this.renderer.addClass(closeBtn, "imu-preview-btn-close");
    this.renderer.setAttribute(closeBtn, "type", "button");
    this.renderer.setAttribute(closeBtn, "title", "Cerrar (Esc)");
    this.renderer.listen(closeBtn, "click", () => {
      if (this.isEditMode) {
        this.exitEditMode();
        return;
      }
      this.closeImageModal();
    });
    closeBtn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg>`;

    this.renderer.appendChild(actions, closeBtn);
    this.renderer.appendChild(toolbar, fileInfo);
    this.renderer.appendChild(toolbar, actions);

    const body = this.renderer.createElement("div");
    this.renderer.addClass(body, "imu-preview-body");
    this.renderer.listen(body, "click", (e: Event) => e.stopPropagation());
    this.modalBodyEl = body;
    this.renderBodyContent();

    this.renderer.appendChild(overlay, toolbar);
    this.renderer.appendChild(overlay, body);
    this.renderer.appendChild(this.document.body, overlay);

    this.modalElement = overlay;
    this.renderer.setStyle(this.document.body, "overflow", "hidden");
  }

  private renderBodyContent(): void {
    if (!this.modalBodyEl) {
      return;
    }

    this.modalBodyEl.innerHTML = "";

    if (this.modalImageLoading) {
      this.modalBodyEl.innerHTML = `<div class="imu-preview-loading"><div class="imu-preview-spinner"></div><span>Cargando imagen...</span></div>`;
      return;
    }

    if (this.modalImageSrc) {
      const img = this.renderer.createElement("img");
      this.renderer.addClass(img, "imu-preview-img");
      this.renderer.setAttribute(img, "src", this.modalImageSrc);
      this.renderer.setAttribute(img, "alt", this.modalImageTitle);
      this.renderer.appendChild(this.modalBodyEl, img);
      return;
    }

    this.modalBodyEl.innerHTML = `<div class="imu-preview-error"><svg width="48" height="48" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="#9aa0a6" stroke-width="1.5"/><line x1="9" y1="9" x2="15" y2="15" stroke="#9aa0a6" stroke-width="1.5" stroke-linecap="round"/><line x1="15" y1="9" x2="9" y2="15" stroke="#9aa0a6" stroke-width="1.5" stroke-linecap="round"/></svg><span>No se pudo cargar la imagen</span></div>`;
  }

  private enterEditMode(): void {
    if (!this.modalImageSrc || !this.modalBodyEl || !this.modalElement) {
      return;
    }

    this.isEditMode = true;
    this.annotations = [];
    this.annotationCounter = 1;
    this.annotationMode = "number";
    this.annotationColor = "#ef4444";
    this.annotationFontSize = 28;

    if (this.editBtnEl) {
      this.renderer.setStyle(this.editBtnEl, "display", "none");
    }

    this.buildEditToolbar();

    const img = new Image();
    img.onload = () => {
      this.modalBodyEl!.innerHTML = "";

      const canvas = this.document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      canvas.className = "imu-annotation-canvas";
      this.canvasElement = canvas;

      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0);

      this.renderer.listen(canvas, "click", (e: MouseEvent) =>
        this.onCanvasClick(e),
      );
      this.renderer.listen(canvas, "touchend", (e: TouchEvent) => {
        e.preventDefault();
        const touch = e.changedTouches[0];
        this.onCanvasClick(touch as unknown as MouseEvent);
      });

      this.modalBodyEl!.appendChild(canvas);
    };
    img.src = this.modalImageSrc;
  }

  private buildEditToolbar(): void {
    if (!this.modalElement) {
      return;
    }

    const toolbar = this.document.createElement("div");
    toolbar.className = "imu-edit-toolbar";
    this.editToolbarEl = toolbar;

    const modeGroup = this.document.createElement("div");
    modeGroup.className = "imu-edit-group";

    const numBtn = this.document.createElement("button");
    numBtn.type = "button";
    numBtn.className = "imu-edit-mode-btn imu-edit-mode-btn--active";
    numBtn.title = "Numerar (clic para colocar número)";
    numBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><text x="12" y="16" text-anchor="middle" font-size="11" fill="currentColor" stroke="none">N</text></svg><span>Número</span>`;
    numBtn.addEventListener("click", () => {
      this.annotationMode = "number";
      numBtn.classList.add("imu-edit-mode-btn--active");
      txtBtn.classList.remove("imu-edit-mode-btn--active");
      if (textInput) textInput.style.display = "none";
      counterWrapper.style.display = "flex";
    });
    modeGroup.appendChild(numBtn);

    const txtBtn = this.document.createElement("button");
    txtBtn.type = "button";
    txtBtn.className = "imu-edit-mode-btn";
    txtBtn.title = "Texto (escribe y clic para colocar)";
    txtBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg><span>Texto</span>`;
    txtBtn.addEventListener("click", () => {
      this.annotationMode = "text";
      txtBtn.classList.add("imu-edit-mode-btn--active");
      numBtn.classList.remove("imu-edit-mode-btn--active");
      if (textInput) textInput.style.display = "block";
      counterWrapper.style.display = "none";
    });
    modeGroup.appendChild(txtBtn);

    const textInput = this.document.createElement("input");
    textInput.type = "text";
    textInput.placeholder = "Texto a colocar...";
    textInput.className = "imu-edit-text-input";
    textInput.style.display = "none";
    textInput.addEventListener("input", () => {
      this.annotationText = textInput.value;
    });
    textInput.addEventListener("click", (e) => e.stopPropagation());
    modeGroup.appendChild(textInput);

    const counterWrapper = this.document.createElement("div");
    counterWrapper.className = "imu-edit-counter-wrapper";
    counterWrapper.style.display = "flex";

    const counterLabel = this.document.createElement("label");
    counterLabel.className = "imu-edit-counter-label";
    counterLabel.textContent = "Desde:";

    const counterInput = this.document.createElement("input");
    counterInput.type = "number";
    counterInput.className = "imu-edit-counter-input";
    counterInput.value = String(this.annotationCounter);
    counterInput.min = "0";
    counterInput.addEventListener("input", () => {
      const val = parseInt(counterInput.value, 10);
      if (!isNaN(val)) {
        this.annotationCounter = val;
      }
    });
    counterInput.addEventListener("click", (e) => e.stopPropagation());
    this.counterInputEl = counterInput;

    counterWrapper.appendChild(counterLabel);
    counterWrapper.appendChild(counterInput);
    modeGroup.appendChild(counterWrapper);

    toolbar.appendChild(modeGroup);

    const colorGroup = this.document.createElement("div");
    colorGroup.className = "imu-edit-group";

    const colors = [
      { hex: "#ef4444", label: "Rojo" },
      { hex: "#f97316", label: "Naranja" },
      { hex: "#facc15", label: "Amarillo" },
      { hex: "#22c55e", label: "Verde" },
      { hex: "#3b82f6", label: "Azul" },
      { hex: "#ffffff", label: "Blanco" },
    ];

    colors.forEach((c) => {
      const swatch = this.document.createElement("button");
      swatch.type = "button";
      swatch.className = "imu-edit-color-swatch";
      swatch.title = c.label;
      swatch.style.background = c.hex;
      if (c.hex === this.annotationColor) {
        swatch.classList.add("imu-edit-color-swatch--active");
      }
      swatch.addEventListener("click", () => {
        this.annotationColor = c.hex;
        colorGroup
          .querySelectorAll(".imu-edit-color-swatch")
          .forEach((s) => s.classList.remove("imu-edit-color-swatch--active"));
        swatch.classList.add("imu-edit-color-swatch--active");
      });
      colorGroup.appendChild(swatch);
    });

    toolbar.appendChild(colorGroup);

    const sizeGroup = this.document.createElement("div");
    sizeGroup.className = "imu-edit-group";

    const sizes = [
      { label: "S", size: 18 },
      { label: "M", size: 28 },
      { label: "L", size: 40 },
    ];

    sizes.forEach((s) => {
      const sizeBtn = this.document.createElement("button");
      sizeBtn.type = "button";
      sizeBtn.className =
        "imu-edit-size-btn" +
        (s.size === this.annotationFontSize
          ? " imu-edit-size-btn--active"
          : "");
      sizeBtn.textContent = s.label;
      sizeBtn.addEventListener("click", () => {
        this.annotationFontSize = s.size;
        sizeGroup
          .querySelectorAll(".imu-edit-size-btn")
          .forEach((b) => b.classList.remove("imu-edit-size-btn--active"));
        sizeBtn.classList.add("imu-edit-size-btn--active");
      });
      sizeGroup.appendChild(sizeBtn);
    });

    toolbar.appendChild(sizeGroup);

    const undoGroup = this.document.createElement("div");
    undoGroup.className = "imu-edit-group";

    const undoBtn = this.document.createElement("button");
    undoBtn.type = "button";
    undoBtn.className = "imu-edit-undo-btn";
    undoBtn.title = "Deshacer última anotación";
    undoBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/></svg><span>Deshacer</span>`;
    undoBtn.addEventListener("click", () => this.undoLastAnnotation());
    undoGroup.appendChild(undoBtn);

    toolbar.appendChild(undoGroup);

    const actionGroup = this.document.createElement("div");
    actionGroup.className = "imu-edit-group imu-edit-group--right";

    const cancelBtn = this.document.createElement("button");
    cancelBtn.type = "button";
    cancelBtn.className = "imu-edit-cancel-btn";
    cancelBtn.innerHTML = `<span>Cancelar</span>`;
    cancelBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      this.exitEditMode();
    });
    actionGroup.appendChild(cancelBtn);

    const saveBtn = this.document.createElement("button");
    saveBtn.type = "button";
    saveBtn.className = "imu-edit-save-btn";
    saveBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg><span>Guardar</span>`;
    saveBtn.addEventListener("click", () => this.saveAnnotatedImage(saveBtn));
    actionGroup.appendChild(saveBtn);

    toolbar.appendChild(actionGroup);

    const mainToolbar = this.modalElement!.children[0];
    mainToolbar.after(toolbar);
  }

  private onCanvasClick(event: MouseEvent): void {
    if (!this.canvasElement) {
      return;
    }

    if (this.annotationMode === "text" && !this.annotationText.trim()) {
      return;
    }

    const rect = this.canvasElement.getBoundingClientRect();
    const scaleX = this.canvasElement.width / rect.width;
    const scaleY = this.canvasElement.height / rect.height;
    const x = (event.clientX - rect.left) * scaleX;
    const y = (event.clientY - rect.top) * scaleY;

    const text =
      this.annotationMode === "number"
        ? String(this.annotationCounter++)
        : this.annotationText.trim();

    if (this.annotationMode === "number" && this.counterInputEl) {
      this.counterInputEl.value = String(this.annotationCounter);
    }

    this.annotations.push({
      type: this.annotationMode,
      text,
      x,
      y,
      color: this.annotationColor,
      fontSize: this.annotationFontSize,
    });

    this.redrawCanvas();
  }

  private redrawCanvas(): void {
    if (!this.canvasElement || !this.modalImageSrc) {
      return;
    }

    const canvas = this.canvasElement;
    const ctx = canvas.getContext("2d")!;

    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);

      this.annotations.forEach((ann) => {
        if (ann.type === "number") {
          this.drawNumberAnnotation(ctx, ann);
        } else {
          this.drawTextAnnotation(ctx, ann);
        }
      });
    };
    img.src = this.modalImageSrc;
  }

  private drawNumberAnnotation(
    ctx: CanvasRenderingContext2D,
    ann: Annotation,
  ): void {
    const radius = ann.fontSize * 0.75;

    ctx.beginPath();
    ctx.arc(ann.x, ann.y, radius, 0, Math.PI * 2);
    ctx.fillStyle = ann.color;
    ctx.fill();
    ctx.strokeStyle = "rgba(0,0,0,0.4)";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.font = `bold ${ann.fontSize}px sans-serif`;
    ctx.fillStyle = this.getContrastColor(ann.color);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(ann.text, ann.x, ann.y);
  }

  private drawTextAnnotation(
    ctx: CanvasRenderingContext2D,
    ann: Annotation,
  ): void {
    ctx.font = `bold ${ann.fontSize}px sans-serif`;
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";

    ctx.strokeStyle = "rgba(0,0,0,0.8)";
    ctx.lineWidth = ann.fontSize * 0.15;
    ctx.strokeText(ann.text, ann.x, ann.y);

    ctx.fillStyle = ann.color;
    ctx.fillText(ann.text, ann.x, ann.y);
  }

  private getContrastColor(hexColor: string): string {
    const hex = hexColor.replace("#", "");
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? "#000000" : "#ffffff";
  }

  private undoLastAnnotation(): void {
    if (!this.annotations.length) {
      return;
    }

    const last = this.annotations[this.annotations.length - 1];
    if (last.type === "number") {
      this.annotationCounter--;
      if (this.counterInputEl) {
        this.counterInputEl.value = String(this.annotationCounter);
      }
    }
    this.annotations.pop();
    this.redrawCanvas();
  }

  private saveAnnotatedImage(saveBtn: HTMLButtonElement): void {
    if (
      !this.canvasElement ||
      !this.saveImageHandler ||
      this.isSavingAnnotation
    ) {
      return;
    }

    this.isSavingAnnotation = true;
    saveBtn.disabled = true;
    saveBtn.innerHTML = `<div class="imu-edit-saving-spinner"></div><span>Guardando...</span>`;

    this.canvasElement.toBlob(
      (blob) => {
        if (!blob) {
          this.isSavingAnnotation = false;
          saveBtn.disabled = false;
          saveBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg><span>Guardar</span>`;
          return;
        }

        const file = new File([blob], this.modalImageTitle || "image.jpg", {
          type: blob.type || "image/jpeg",
        });

        this.saveImageHandler!(file)
          .pipe(take(1))
          .subscribe({
            next: () => {
              this.isSavingAnnotation = false;
              this.closeImageModal();
              this.floatingToastService.showToast({
                status: 200,
                keyTranslation: "imageUploader.messages.image.save.success",
                details: [],
              });
              this.imageSaved.emit();
            },
            error: () => {
              this.isSavingAnnotation = false;
              saveBtn.disabled = false;
              saveBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg><span>Guardar</span>`;
            },
          });
      },
      "image/jpeg",
      0.92,
    );
  }

  private restoreOriginalImage(restoreBtn: HTMLButtonElement): void {
    if (!this.restoreImageHandler || this.isRestoringImage) {
      return;
    }

    this.isRestoringImage = true;
    restoreBtn.disabled = true;
    restoreBtn.innerHTML = `<div class="imu-edit-saving-spinner"></div><span>Restaurando...</span>`;

    this.restoreImageHandler()
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.isRestoringImage = false;
          this.closeImageModal();
          this.floatingToastService.showToast({
            status: 200,
            keyTranslation: "imageUploader.messages.image.restore.success",
            details: [],
          });
          this.imageRestored.emit();
        },
        error: () => {
          this.isRestoringImage = false;
          restoreBtn.disabled = false;
          restoreBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/></svg><span>Restaurar original</span>`;
        },
      });
  }

  private exitEditMode(): void {
    this.isEditMode = false;
    this.annotations = [];
    this.annotationCounter = 1;
    this.canvasElement = null;
    this.counterInputEl = null;

    if (this.editToolbarEl) {
      this.editToolbarEl.remove();
      this.editToolbarEl = null;
    }

    if (this.editBtnEl) {
      this.renderer.removeStyle(this.editBtnEl, "display");
    }

    this.renderBodyContent();
  }

  private removeModalFromBody(): void {
    if (!this.modalElement) {
      return;
    }

    this.renderer.removeChild(this.document.body, this.modalElement);
    this.modalElement = null;
    this.modalBodyEl = null;
    this.renderer.removeStyle(this.document.body, "overflow");
  }

  private emitError(message: string): void {
    console.error("ImageUploader Error:", message);
  }

  writeValue(value: File | null): void {
    if (value instanceof File) {
      this.createImagePreview(value, (preview) => {
        this.imagePreview = preview;
      });
    } else {
      this.imagePreview = null;
    }
  }

  registerOnChange(fn: (value: File | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  ngOnDestroy(): void {
    if (this.showImageModal) {
      this.closeImageModal();
    }
  }
}
