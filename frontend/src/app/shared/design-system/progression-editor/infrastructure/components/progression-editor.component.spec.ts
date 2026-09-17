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

  function configure(): void {
    component.configured = true;
    component.targets = [
      { index: 0, label: "1", reps: 12 },
      { index: 1, label: "2", reps: 11 },
      { index: 2, label: "3", reps: 10 },
    ];
    fixture.detectChanges();
  }

  it("gives every rep target input a usable width", () => {
    configure();

    const inputs: HTMLElement[] = Array.from(
      fixture.nativeElement.querySelectorAll(".pe-target .ds-num__field"),
    );

    expect(inputs.length).toBe(3);
    inputs.forEach((input) =>
      expect(input.getBoundingClientRect().width).toBeGreaterThan(40),
    );
  });

  it("hides everything but the mode selector while progression is off", () => {
    component.configured = false;
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector(".pe-targets")).toBeNull();
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
