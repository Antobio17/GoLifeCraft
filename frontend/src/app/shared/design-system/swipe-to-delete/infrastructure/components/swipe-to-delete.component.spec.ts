import { Component } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { SwipeToDeleteComponent } from "./swipe-to-delete.component";
import { CardComponent } from "../../../card/infrastructure/components/card.component";

@Component({
  imports: [SwipeToDeleteComponent, CardComponent],
  template: `<ds-swipe-to-delete [reveal]="66" removeLabel="x">
    <ds-card>contenido</ds-card>
  </ds-swipe-to-delete>`,
})
class HostComponent {}

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
});
