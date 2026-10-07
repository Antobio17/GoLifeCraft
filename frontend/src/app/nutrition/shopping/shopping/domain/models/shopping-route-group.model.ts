import { StepBadgeState } from "@shared/design-system/step-badge/domain/models/step-badge-state.enum";
import { ShoppingItemRow } from "@nutrition/shopping/shopping/application/services/shopping-list-view.service";

export interface ShoppingRouteGroup {
  key: string;
  domId: string;
  label: string;
  meta: string;
  badge: string | null;
  state: `${StepBadgeState}`;
  items: ShoppingItemRow[];
}
