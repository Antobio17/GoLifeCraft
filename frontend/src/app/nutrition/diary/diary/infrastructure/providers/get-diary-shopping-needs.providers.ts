import { Provider } from "@angular/core";
import { GetDiaryShoppingNeedsPort } from "@nutrition/diary/diary/domain/ports/get-diary-shopping-needs.port";
import { HttpGetDiaryShoppingNeedsAdapter } from "@nutrition/diary/diary/infrastructure/adapters/http-get-diary-shopping-needs.adapter";
import { GetDiaryShoppingNeedsService } from "@nutrition/diary/diary/application/services/get-diary-shopping-needs.service";

export class GetDiaryShoppingNeedsProviders {
  static getProviders(): Provider[] {
    return [
      {
        provide: GetDiaryShoppingNeedsPort,
        useClass: HttpGetDiaryShoppingNeedsAdapter,
      },
      {
        provide: GetDiaryShoppingNeedsService,
        useFactory: (port: GetDiaryShoppingNeedsPort) =>
          new GetDiaryShoppingNeedsService(port),
        deps: [GetDiaryShoppingNeedsPort],
      },
    ];
  }
}
