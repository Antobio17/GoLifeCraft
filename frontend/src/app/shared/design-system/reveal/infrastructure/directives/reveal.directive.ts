import {
  Directive,
  ElementRef,
  Input,
  afterNextRender,
  inject,
} from "@angular/core";
import { ContentRevealService } from "../../application/services/content-reveal.service";

type RevealMode = "incoming" | "children";

/**
 * Da la entrada del design system al contenido de cualquier host.
 *
 * dsReveal="incoming" (por defecto) revela sólo lo que llega después del
 * primer render: el contenedor de un @if/@else que hoy conmuta de golpe.
 * dsReveal="children" revela además los hijos que ya trae al montarse,
 * escalonados: el contenedor de un @for que aparece con su lista hecha.
 *
 * No ponerlo en un contenedor que albergue el skeleton: el esqueleto
 * tiene que aparecer instantáneo, no entrar.
 *
 * El atributo estático data-ds-reveal marca el host como "me revelo por
 * dentro", para que el ContentRevealService del ancestro no lo revele
 * además como bloque y encadene dos opacidades.
 */
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
