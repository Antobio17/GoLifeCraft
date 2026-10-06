import { Component } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { ModalSheetComponent } from "./modal-sheet.component";

@Component({
  imports: [ModalSheetComponent],
  template: `<ds-modal-sheet
    [open]="true"
    title="Descartar"
    confirmLabel="Descartar"
    confirmArmedLabel="Pulsa otra vez"
    confirmIcon="trash"
    confirmTone="danger"
    [confirmTwice]="confirmTwice"
    (confirmed)="confirmed = confirmed + 1"
  />`,
})
class HostComponent {
  confirmTwice = true;
  confirmed = 0;
}

describe("ModalSheetComponent", () => {
  function render(confirmTwice = true) {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.componentInstance.confirmTwice = confirmTwice;
    fixture.detectChanges();
    return fixture;
  }

  function confirmButton(): HTMLButtonElement {
    return document.querySelector(
      "[data-testid='sheet-confirm']",
    ) as HTMLButtonElement;
  }

  it("no confirma con el primer toque cuando pide doble confirmacion", () => {
    const fixture = render();

    confirmButton().click();
    fixture.detectChanges();

    expect(fixture.componentInstance.confirmed).toBe(0);
    expect(confirmButton().getAttribute("aria-label")).toBe("Pulsa otra vez");
  });

  it("confirma con el segundo toque", () => {
    const fixture = render();

    confirmButton().click();
    fixture.detectChanges();
    confirmButton().click();

    expect(fixture.componentInstance.confirmed).toBe(1);
  });

  it("se desarma si no llega el segundo toque a tiempo", () => {
    jasmine.clock().install();
    const fixture = render();

    confirmButton().click();
    jasmine.clock().tick(3000);
    fixture.detectChanges();
    confirmButton().click();
    jasmine.clock().uninstall();

    expect(fixture.componentInstance.confirmed).toBe(0);
  });

  it("confirma con un solo toque si no pide doble confirmacion", () => {
    const fixture = render(false);

    confirmButton().click();

    expect(fixture.componentInstance.confirmed).toBe(1);
  });
});
