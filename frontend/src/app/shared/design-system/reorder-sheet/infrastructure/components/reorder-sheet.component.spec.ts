import { Component } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { ReorderSheetComponent } from "./reorder-sheet.component";
import { ReorderSheetItem } from "../../domain/models/reorder-sheet-item.model";

@Component({
  imports: [ReorderSheetComponent],
  template: `<ds-reorder-sheet
    [items]="items"
    [show]="show"
    saveLabel="Guardar"
    cancelLabel="Cancelar"
    (saved)="savedOrder = $event"
  />`,
})
class HostComponent {
  items: ReorderSheetItem[] = [
    { id: "a", label: "Press banca", meta: "Pecho" },
    { id: "b", label: "Curl", meta: "Bíceps" },
    { id: "c", label: "Sentadilla", meta: "Pierna" },
  ];
  show = true;
  savedOrder: string[] | null = null;
}

describe("ReorderSheetComponent", () => {
  function render() {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    return fixture;
  }

  function rows(): HTMLElement[] {
    return Array.from(document.querySelectorAll(".ds-reorder__row"));
  }

  function labels(): string[] {
    return rows().map(
      (row) => row.querySelector(".ds-reorder__label")!.textContent!,
    );
  }

  function grip(index: number): HTMLElement {
    return rows()[index].querySelector(".ds-reorder__grip")!;
  }

  function saveButton(): HTMLButtonElement {
    return Array.from(document.querySelectorAll("button")).find(
      (button) => button.textContent?.trim() === "Guardar",
    ) as HTMLButtonElement;
  }

  function drag(index: number, deltaY: number): void {
    const handle = grip(index);
    handle.setPointerCapture = () => undefined;
    handle.dispatchEvent(
      new PointerEvent("pointerdown", {
        bubbles: true,
        pointerId: 1,
        clientY: 0,
      }),
    );
    handle.dispatchEvent(
      new PointerEvent("pointermove", {
        bubbles: true,
        pointerId: 1,
        clientY: deltaY,
      }),
    );
    handle.dispatchEvent(
      new PointerEvent("pointerup", { bubbles: true, pointerId: 1 }),
    );
  }

  afterEach(() => {
    document
      .querySelectorAll(".ds-sheet__overlay")
      .forEach((overlay) => overlay.remove());
  });

  it("parte del orden recibido", () => {
    render();

    expect(labels()).toEqual(["Press banca", "Curl", "Sentadilla"]);
  });

  it("recoloca al soltar el asa un hueco mas abajo", () => {
    const fixture = render();
    const step = rows()[1].offsetTop - rows()[0].offsetTop;

    drag(0, step);
    fixture.detectChanges();

    expect(labels()).toEqual(["Curl", "Press banca", "Sentadilla"]);
  });

  it("no recoloca si el arrastre no llega a medio hueco", () => {
    const fixture = render();
    const step = rows()[1].offsetTop - rows()[0].offsetTop;

    drag(0, Math.floor(step / 3));
    fixture.detectChanges();

    expect(labels()).toEqual(["Press banca", "Curl", "Sentadilla"]);
  });

  it("no deja arrastrar mas alla del final de la lista", () => {
    const fixture = render();
    const step = rows()[1].offsetTop - rows()[0].offsetTop;

    drag(0, step * 9);
    fixture.detectChanges();

    expect(labels()).toEqual(["Curl", "Sentadilla", "Press banca"]);
  });

  it("no guarda mientras el orden no cambie", () => {
    render();

    expect(saveButton().disabled).toBe(true);
  });

  it("emite el orden completo al guardar", () => {
    const fixture = render();

    drag(1, rows()[1].offsetTop - rows()[0].offsetTop);
    fixture.detectChanges();
    saveButton().click();

    expect(fixture.componentInstance.savedOrder).toEqual(["a", "c", "b"]);
  });

  it("descarta el borrador al cerrar y volver a abrir", () => {
    const fixture = render();
    const sheet = fixture.debugElement.children[0]
      .componentInstance as ReorderSheetComponent;

    drag(0, rows()[1].offsetTop - rows()[0].offsetTop);
    fixture.detectChanges();
    expect(sheet.orderedIds()).toEqual(["b", "a", "c"]);

    sheet.show = false;
    sheet.show = true;

    expect(sheet.orderedIds()).toEqual(["a", "b", "c"]);
  });
});
