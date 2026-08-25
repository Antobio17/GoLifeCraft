import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
  computed,
  signal,
} from "@angular/core";
import { ButtonComponent } from "@shared/design-system/button/infrastructure/components/button.component";
import { IconComponent } from "@shared/design-system/icon/infrastructure/components/icon.component";
import { ModalSheetComponent } from "@shared/design-system/modal-sheet/infrastructure/components/modal-sheet.component";
import { StackComponent } from "@shared/design-system/stack/infrastructure/components/stack.component";
import { TextComponent } from "@shared/design-system/text/infrastructure/components/text.component";
import { ReorderSheetItem } from "../../domain/models/reorder-sheet-item.model";

@Component({
  selector: "ds-reorder-sheet",
  templateUrl: "./reorder-sheet.component.html",
  styleUrls: ["./reorder-sheet.component.css"],
  imports: [
    ButtonComponent,
    IconComponent,
    ModalSheetComponent,
    StackComponent,
    TextComponent,
  ],
})
export class ReorderSheetComponent {
  @ViewChild("list") private list?: ElementRef<HTMLElement>;

  private isOpen = false;

  @Input()
  set show(value: boolean) {
    if (value === this.isOpen) {
      return;
    }

    this.isOpen = value;
    this.reset();
  }

  get show(): boolean {
    return this.isOpen;
  }

  @Input() items: ReorderSheetItem[] = [];
  @Input() currentId = "";
  @Input() title = "";
  @Input() body = "";
  @Input() saveLabel = "";
  @Input() cancelLabel = "";
  @Input() dragLabel = "";

  @Output() saved = new EventEmitter<string[]>();
  @Output() cancelled = new EventEmitter<void>();

  readonly draft = signal<ReorderSheetItem[]>([]);
  readonly dragIndex = signal<number | null>(null);

  private readonly dragOffset = signal(0);
  private readonly step = signal(0);
  private pointerId: number | null = null;
  private startY = 0;

  readonly dirty = computed(
    () => this.orderedIds().join() !== this.items.map((item) => item.id).join(),
  );

  orderedIds(): string[] {
    return this.draft().map((item) => item.id);
  }

  /**
   * La fila arrastrada sigue al dedo y las que quedan entre su origen y el destino se
   * desplazan un hueco, así que el orden que se ve durante el gesto ya es el resultado.
   */
  rowTransform(index: number): string {
    const from = this.dragIndex();

    if (null === from) {
      return "none";
    }

    if (index === from) {
      return `translateY(${this.dragOffset()}px)`;
    }

    const to = this.targetIndex();

    if (from < to && index > from && index <= to) {
      return `translateY(${-this.step()}px)`;
    }

    if (from > to && index >= to && index < from) {
      return `translateY(${this.step()}px)`;
    }

    return "none";
  }

  onGripDown(event: PointerEvent, index: number): void {
    if (this.draft().length < 2) {
      return;
    }

    event.preventDefault();
    (event.currentTarget as Element).setPointerCapture(event.pointerId);

    this.pointerId = event.pointerId;
    this.startY = event.clientY;
    this.step.set(this.measureStep());
    this.dragOffset.set(0);
    this.dragIndex.set(index);
  }

  onGripMove(event: PointerEvent): void {
    if (this.pointerId !== event.pointerId || null === this.dragIndex()) {
      return;
    }

    this.dragOffset.set(event.clientY - this.startY);
  }

  onGripUp(): void {
    const from = this.dragIndex();

    if (null === from) {
      return;
    }

    const to = this.targetIndex();

    this.pointerId = null;
    this.dragIndex.set(null);
    this.dragOffset.set(0);

    if (from === to) {
      return;
    }

    this.draft.update((list) => this.moved(list, from, to));
  }

  private targetIndex(): number {
    const from = this.dragIndex();
    const step = this.step();

    if (null === from || step <= 0) {
      return from ?? 0;
    }

    const shift = Math.round(this.dragOffset() / step);

    return Math.min(Math.max(from + shift, 0), this.draft().length - 1);
  }

  private measureStep(): number {
    const rows = this.list?.nativeElement.children;

    if (!rows || rows.length < 2) {
      return 0;
    }

    return (
      (rows[1] as HTMLElement).offsetTop - (rows[0] as HTMLElement).offsetTop
    );
  }

  private moved(
    list: ReorderSheetItem[],
    from: number,
    to: number,
  ): ReorderSheetItem[] {
    const next = [...list];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);

    return next;
  }

  private reset(): void {
    this.pointerId = null;
    this.dragIndex.set(null);
    this.dragOffset.set(0);
    this.draft.set([...this.items]);
  }
}
