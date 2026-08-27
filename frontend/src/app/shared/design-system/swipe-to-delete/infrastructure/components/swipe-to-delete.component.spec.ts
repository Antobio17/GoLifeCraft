import { Component } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { SwipeToDeleteComponent } from "./swipe-to-delete.component";
import { CardComponent } from "../../../card/infrastructure/components/card.component";

@Component({
  imports: [SwipeToDeleteComponent, CardComponent],
  template: `<ds-swipe-to-delete
    [reveal]="66"
    removeLabel="x"
    (remove)="removed = removed + 1"
  >
    <ds-card>contenido</ds-card>
  </ds-swipe-to-delete>`,
})
class HostComponent {
  removed = 0;
}

describe("SwipeToDeleteComponent", () => {
  function render() {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    return fixture;
  }

  it("no pinta el boton de borrado en reposo", () => {
    const fixture = render();
    const deleteButton = fixture.nativeElement.querySelector(".swipe__delete");

    expect(getComputedStyle(deleteButton).opacity).toBe("0");
  });

  it("pinta el boton de borrado cuando la fila esta desplazada", () => {
    const fixture = render();
    const deleteButton = fixture.nativeElement.querySelector(".swipe__delete");
    deleteButton.classList.add("swipe__delete--revealed");

    expect(getComputedStyle(deleteButton).opacity).toBe("1");
  });

  it("recorta con el mismo radio que la superficie que envuelve", () => {
    const fixture = render();
    const swipe = fixture.nativeElement.querySelector(".swipe");
    const card = fixture.nativeElement.querySelector(".ds-card");

    expect(getComputedStyle(swipe).overflow).toBe("hidden");
    expect(getComputedStyle(swipe).borderRadius).toBe(
      getComputedStyle(card).borderRadius,
    );
  });

  function pointerUpOn(element: HTMLElement, offsetX = 0, offsetY = 0): void {
    const rect = element.getBoundingClientRect();
    element.dispatchEvent(
      new PointerEvent("pointerup", {
        bubbles: true,
        clientX: rect.left + rect.width / 2 + offsetX,
        clientY: rect.top + rect.height / 2 + offsetY,
      }),
    );
  }

  it("borra al levantar el dedo sobre el boton, sin esperar al click", () => {
    const fixture = render();
    const deleteButton = fixture.nativeElement.querySelector(".swipe__delete");

    pointerUpOn(deleteButton);

    expect(fixture.componentInstance.removed).toBe(1);
  });

  it("no borra dos veces cuando el click sintetico llega tras el pointerup", () => {
    const fixture = render();
    const deleteButton = fixture.nativeElement.querySelector(".swipe__delete");

    pointerUpOn(deleteButton);
    deleteButton.dispatchEvent(
      new MouseEvent("click", { bubbles: true, detail: 1 }),
    );

    expect(fixture.componentInstance.removed).toBe(1);
  });

  it("se traga el click que llega tras el pointerup, ya sin la fila debajo", () => {
    const fixture = render();
    const deleteButton = fixture.nativeElement.querySelector(".swipe__delete");
    const neighbour = document.createElement("button");
    let neighbourClicks = 0;
    neighbour.addEventListener("click", () => (neighbourClicks += 1));
    document.body.appendChild(neighbour);

    pointerUpOn(deleteButton);
    neighbour.dispatchEvent(
      new MouseEvent("click", { bubbles: true, detail: 1 }),
    );
    neighbour.remove();

    expect(neighbourClicks).toBe(0);
  });

  it("deja de tragarse clicks pasada la ventana del click fantasma", () => {
    const fixture = render();
    const deleteButton = fixture.nativeElement.querySelector(".swipe__delete");
    const neighbour = document.createElement("button");
    let neighbourClicks = 0;
    neighbour.addEventListener("click", () => (neighbourClicks += 1));
    document.body.appendChild(neighbour);

    jasmine.clock().install();
    pointerUpOn(deleteButton);
    jasmine.clock().tick(400);
    jasmine.clock().uninstall();

    neighbour.dispatchEvent(
      new MouseEvent("click", { bubbles: true, detail: 1 }),
    );
    neighbour.remove();

    expect(neighbourClicks).toBe(1);
  });

  it("no borra si el dedo se sale del boton antes de levantarlo", () => {
    const fixture = render();
    const deleteButton = fixture.nativeElement.querySelector(".swipe__delete");

    pointerUpOn(deleteButton, -200);

    expect(fixture.componentInstance.removed).toBe(0);
  });

  it("borra con el teclado, que no emite pointerup", () => {
    const fixture = render();
    const deleteButton = fixture.nativeElement.querySelector(".swipe__delete");

    deleteButton.dispatchEvent(
      new MouseEvent("click", { bubbles: true, detail: 0 }),
    );

    expect(fixture.componentInstance.removed).toBe(1);
  });
});
