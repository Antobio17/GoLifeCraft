import { Directive, ElementRef, inject } from "@angular/core";

const INVALID_CONTROL = ".ng-invalid[formcontrolname]";
const FOCUSABLE = "input, textarea, select, button";

@Directive({
  selector: "form[dsEditorForm]",
  host: {
    "(document:keydown)": "onKeydown($event)",
    "(submit)": "revealFirstInvalid()",
  },
})
export class EditorFormDirective {
  private host: HTMLFormElement = inject(ElementRef<HTMLFormElement>)
    .nativeElement;

  onKeydown(event: KeyboardEvent): void {
    if (!(event.ctrlKey || event.metaKey) || event.key.toLowerCase() !== "s") {
      return;
    }

    event.preventDefault();
    this.submit();
  }

  submit(): void {
    this.host.requestSubmit();
  }

  revealFirstInvalid(): void {
    const invalid = this.host.querySelector<HTMLElement>(INVALID_CONTROL);

    if (!invalid) {
      return;
    }

    invalid.scrollIntoView({ block: "center", behavior: "smooth" });
    invalid
      .querySelector<HTMLElement>(FOCUSABLE)
      ?.focus({ preventScroll: true });
  }
}
