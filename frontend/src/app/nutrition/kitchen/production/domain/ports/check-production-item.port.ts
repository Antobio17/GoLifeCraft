import { Observable } from "rxjs";

export abstract class CheckProductionItemPort {
  abstract checkProductionItem(
    productionId: string,
    itemId: string,
    articleIds: string[],
    stepPositions: number[],
  ): Observable<void>;
}
