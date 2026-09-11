import {
  Directive,
  ElementRef,
  Input,
  afterNextRender,
  inject,
} from "@angular/core";
import { ContentRevealService } from "../../application/services/content-reveal.service";

type RevealMode = "incoming" | "children";

@Directive({
  selector: "[dsReveal]",
  providers: [ContentRevealService],
  host: { "data-ds-reveal": "" },
})
export class RevealDirective {
  @Input() dsReveal: RevealMode | "" = "incoming";

  private host = inject(ElementRef<HTMLElement>).nativeElement;
  private contentRevealService = inject(ContentRevealService);

  constructor() {
    afterNextRender(() =>
      this.contentRevealService.observe(
        this.host,
        "children" === this.dsReveal,
      ),
    );
  }
}
