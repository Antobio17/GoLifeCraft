import { Provider } from "@angular/core";
import { AddShoppingListItemPort } from "@nutrition/shopping/shopping/domain/ports/add-shopping-list-item.port";
import { UpdateShoppingListItemPort } from "@nutrition/shopping/shopping/domain/ports/update-shopping-list-item.port";
import { DeleteShoppingListItemPort } from "@nutrition/shopping/shopping/domain/ports/delete-shopping-list-item.port";
import { HttpAddShoppingListItemAdapter } from "@nutrition/shopping/shopping/infrastructure/adapters/http-add-shopping-list-item.adapter";
import { HttpUpdateShoppingListItemAdapter } from "@nutrition/shopping/shopping/infrastructure/adapters/http-update-shopping-list-item.adapter";
import { HttpDeleteShoppingListItemAdapter } from "@nutrition/shopping/shopping/infrastructure/adapters/http-delete-shopping-list-item.adapter";
import { AddShoppingListItemService } from "@nutrition/shopping/shopping/application/services/add-shopping-list-item.service";
import { UpdateShoppingListItemService } from "@nutrition/shopping/shopping/application/services/update-shopping-list-item.service";
import { DeleteShoppingListItemService } from "@nutrition/shopping/shopping/application/services/delete-shopping-list-item.service";

export class ShoppingWriteProviders {
  static getProviders(): Provider[] {
    return [
      {
        provide: AddShoppingListItemPort,
        useClass: HttpAddShoppingListItemAdapter,
      },
      {
        provide: AddShoppingListItemService,
        useFactory: (port: AddShoppingListItemPort) =>
          new AddShoppingListItemService(port),
        deps: [AddShoppingListItemPort],
      },
      {
        provide: UpdateShoppingListItemPort,
        useClass: HttpUpdateShoppingListItemAdapter,
      },
      {
        provide: UpdateShoppingListItemService,
        useFactory: (port: UpdateShoppingListItemPort) =>
          new UpdateShoppingListItemService(port),
        deps: [UpdateShoppingListItemPort],
      },
      {
        provide: DeleteShoppingListItemPort,
        useClass: HttpDeleteShoppingListItemAdapter,
      },
      {
        provide: DeleteShoppingListItemService,
        useFactory: (port: DeleteShoppingListItemPort) =>
          new DeleteShoppingListItemService(port),
        deps: [DeleteShoppingListItemPort],
      },
    ];
  }
}
