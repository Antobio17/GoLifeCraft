import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ProgressionEditorComponent } from "./progression-editor.component";

describe("ProgressionEditorComponent", () => {
  let fixture: ComponentFixture<ProgressionEditorComponent>;
  let component: ProgressionEditorComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProgressionEditorComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ProgressionEditorComponent);
    component = fixture.componentInstance;
    fixture.nativeElement.style.width = "360px";
  });

  function configure(rows = 3): void {
    component.configured = true;
    component.setLabel = "Serie";
    component.nowLabel = "Hoy";
    component.targetLabel = "Objetivo";
    component.targets = Array.from({ length: rows }, (_, index) => ({
      index,
      label: `${index + 1}`,
      now: 12 - index,
      reps: 12 - index,
    }));
    fixture.detectChanges();
  }

  it("gives every target input a usable width", () => {
    configure();

    const inputs: HTMLElement[] = Array.from(
      fixture.nativeElement.querySelectorAll(".pe-tbl .ds-num__field"),
    );

    expect(inputs.length).toBe(3);
    inputs.forEach((input) =>
      expect(input.getBoundingClientRect().width).toBeGreaterThan(40),
    );
  });

  it("grows a row per effective set without squeezing the inputs", () => {
    configure(6);

    const inputs: HTMLElement[] = Array.from(
      fixture.nativeElement.querySelectorAll(".pe-tbl .ds-num__field"),
    );

    expect(inputs.length).toBe(6);
    inputs.forEach((input) =>
      expect(input.getBoundingClientRect().width).toBeGreaterThan(40),
    );
  });

  it("shows what each set does today next to the target being set", () => {
    configure();

    const now: HTMLElement[] = Array.from(
      fixture.nativeElement.querySelectorAll(".pe-tbl__now"),
    );

    expect(now.map((cell) => cell.textContent?.trim())).toEqual([
      "12",
      "11",
      "10",
    ]);
  });

  it("leaves only the mode selector while progression is off", () => {
    component.configured = false;
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector("ds-select")).not.toBeNull();
    expect(fixture.nativeElement.querySelector(".pe-tbl")).toBeNull();
    expect(fixture.nativeElement.querySelector(".pe-pair")).toBeNull();
  });

  it("emits the edited target keeping its position", () => {
    configure();
    const emitted: { index: number; reps: number }[] = [];
    component.targetChange.subscribe((row) =>
      emitted.push({ index: row.index, reps: row.reps }),
    );

    component.onTargetChange(component.targets[1], 12);

    expect(emitted).toEqual([{ index: 1, reps: 12 }]);
  });
});
