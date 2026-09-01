import { Component } from "@angular/core";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { TestBed } from "@angular/core/testing";
import { DurationChoiceComponent } from "./duration-choice.component";
import { DurationChoiceOption } from "../../domain/models/duration-choice-option.model";

@Component({
  imports: [ReactiveFormsModule, DurationChoiceComponent],
  template: `<ds-duration-choice
    [formControl]="control"
    [options]="options"
    customLabel="Otro"
    unit="seg"
    [min]="0"
    [max]="3600"
  />`,
})
class HostComponent {
  options: DurationChoiceOption[] = [
    { value: 60, label: "1:00" },
    { value: 120, label: "2:00" },
    { value: 180, label: "3:00" },
  ];
  control = new FormControl<number | null>(180);
}

describe("DurationChoiceComponent", () => {
  function render() {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    return fixture;
  }

  function chips(): HTMLButtonElement[] {
    return Array.from(document.querySelectorAll(".ds-duration-choice__chip"));
  }

  function customChip(): HTMLButtonElement {
    const all = chips();
    return all[all.length - 1];
  }

  function customField(): HTMLInputElement | null {
    return document.querySelector(".ds-duration-choice__field");
  }

  it("marks the preset matching the control value", () => {
    render();

    expect(chips()[2].classList).toContain("is-selected");
    expect(customField()).toBeNull();
  });

  it("writes the preset value into the control", () => {
    const fixture = render();

    chips()[0].click();
    fixture.detectChanges();

    expect(fixture.componentInstance.control.value).toBe(60);
  });

  it("opens the free input and writes what is typed", () => {
    const fixture = render();

    customChip().click();
    fixture.detectChanges();

    const field = customField()!;
    field.value = "200";
    field.dispatchEvent(new Event("input"));
    fixture.detectChanges();

    expect(fixture.componentInstance.control.value).toBe(200);
  });

  it("clamps the free input to the allowed range", () => {
    const fixture = render();

    customChip().click();
    fixture.detectChanges();

    const field = customField()!;
    field.value = "9000";
    field.dispatchEvent(new Event("input"));
    field.dispatchEvent(new Event("blur"));
    fixture.detectChanges();

    expect(fixture.componentInstance.control.value).toBe(3600);
  });

  it("opens the free input for a value outside the presets", () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.componentInstance.control = new FormControl<number | null>(200);
    fixture.detectChanges();

    expect(customChip().classList).toContain("is-selected");
    expect(customField()!.value).toBe("200");
  });

  it("blocks every mutation while disabled", () => {
    const fixture = render();

    fixture.componentInstance.control.disable();
    fixture.detectChanges();

    customChip().click();
    chips()[0].click();
    fixture.detectChanges();

    expect(fixture.componentInstance.control.value).toBe(180);
    expect(customField()).toBeNull();
  });
});
