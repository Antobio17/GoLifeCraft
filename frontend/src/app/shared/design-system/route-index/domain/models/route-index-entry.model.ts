import { StepBadgeState } from "@shared/design-system/step-badge/domain/models/step-badge-state.enum";

export interface RouteIndexEntry {
  key: string;
  label: string;
  badge: string;
  state: `${StepBadgeState}`;
  meta: string;
}
