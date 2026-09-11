import { DestroyRef, Injectable, NgZone, inject } from "@angular/core";

const STAGGER_CAP = 5;
const ANIMATION_NAME = "ds-reveal-in";
const REVEAL_CLASS = "ds-reveal";
const DELAY_PROPERTY = "--ds-reveal-delay";

@Injectable()
export class ContentRevealService {
  private zone = inject(NgZone);
  private destroyRef = inject(DestroyRef);

  observe(host: HTMLElement, revealCurrentChildren = false): void {
    if ("undefined" === typeof MutationObserver) return;

    if (revealCurrentChildren) this.reveal(Array.from(host.children));

    const observer = new MutationObserver((records) =>
      this.reveal(records.flatMap((record) => Array.from(record.addedNodes))),
    );

    this.zone.runOutsideAngular(() =>
      observer.observe(host, { childList: true }),
    );
    this.destroyRef.onDestroy(() => observer.disconnect());
  }

  private reveal(candidates: (Node | Element)[]): void {
    candidates
      .filter(
        (candidate): candidate is HTMLElement =>
          candidate instanceof HTMLElement && this.isRevealable(candidate),
      )
      .forEach((element, index) => this.revealOne(element, index));
  }

  private revealOne(element: HTMLElement, index: number): void {
    const step = Math.min(index, STAGGER_CAP);

    element.style.setProperty(
      DELAY_PROPERTY,
      `calc(var(--ds-reveal-stagger) * ${step})`,
    );
    element.classList.add(REVEAL_CLASS);

    const cleanUp = (event: AnimationEvent) => {
      if (event.target !== element) return;
      if (ANIMATION_NAME !== event.animationName) return;

      element.classList.remove(REVEAL_CLASS);
      element.style.removeProperty(DELAY_PROPERTY);
      element.removeEventListener("animationend", cleanUp);
    };

    element.addEventListener("animationend", cleanUp);
  }

  private isRevealable(element: HTMLElement): boolean {
    if (element.classList.contains(REVEAL_CLASS)) return false;

    /* El hijo se revela por dentro: revelarlo también como bloque
       encadenaría dos opacidades y lo dejaría lavado. */
    if (element.hasAttribute("data-ds-reveal")) return false;

    /* Un ancestro con transform deja de ser el viewport para un
       position: fixed y lo descolocaría mientras dura la entrada. */
    return "fixed" !== getComputedStyle(element).position;
  }
}
