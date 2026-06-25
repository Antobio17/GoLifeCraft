export interface DomainEventLog {
  id: string;
  eventName: string;
  aggregateId: string;
  payload: Record<string, unknown>;
  occurredOn: string;
  recordedAt: string;
  user: DomainEventLogUser;
}

export interface DomainEventLogUser {
  id: string;
  username: string;
  name: string;
  lastname: string;
}

export interface PreventionPlanIncluded {
  id: string;
  centerId: string;
  revisionNumber: string | null;
  executeAt: string | null;
}

export interface CenterIncluded {
  id: string;
  name: string;
}

export const KNOWN_EVENT_NAMES: string[] = [
  "user.created",
  "user.updated",
  "user.deleted",
  "user.my_theme_changed",
  "permission.created",
  "center.created",
  "center.updated",
  "center.deleted",
  "central.created",
  "preventionPlan.initialized",
  "preventionPlan.basicInformationEdited",
  "preventionPlan.deleted",
  "preventionPlan.validationStarted",
  "preventionPlan.approved",
  "preventionPlan.rejected",
  "technicalTeam.created",
  "technicalTeam.edited",
  "technicalTeam.deleted",
  "building.created",
  "building.edited",
  "building.deleted",
  "companyAndLab.created",
  "companyAndLab.edited",
  "initialDiagnosis.created",
  "initialDiagnosis.edited",
  "domesticHotWater.created",
  "domesticHotWater.edited",
  "coldWaterHumanConsumption.created",
  "coldWaterHumanConsumption.edited",
  "usePoints.created",
  "usePoints.edited",
  "reservoirsOrCisterns.created",
  "reservoirsOrCisterns.edited",
  "accumulatorsOrTerms.created",
  "accumulatorsOrTerms.edited",
  "fireProtectionSystem.created",
  "fireProtectionSystem.edited",
  "sprayIrrigation.created",
  "sprayIrrigation.edited",
  "towersAndEvaporativeCondensers.created",
  "towersAndEvaporativeCondensers.edited",
  "evaporativeCoolingSystems.created",
  "evaporativeCoolingSystems.edited",
  "file.deleted",
  "folder.deleted",
];
