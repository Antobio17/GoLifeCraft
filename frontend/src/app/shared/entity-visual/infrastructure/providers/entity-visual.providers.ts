import { Provider } from "@angular/core";
import { EntityVisualService } from "@shared/entity-visual/application/services/entity-visual.service";

export class EntityVisualProviders {
  static getProviders(): Provider[] {
    return [EntityVisualService];
  }
}
