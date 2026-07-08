import { MuscleRegion } from "@shared/design-system/muscle-picker/infrastructure/components/muscle-picker.component";

export const MUSCLE_GROUPS_BY_REGION: MuscleRegion[] = [
  {
    region: "Tren superior",
    items: [
      "Pecho",
      "Espalda",
      "Hombro",
      "Bíceps",
      "Tríceps",
      "Antebrazo",
      "Trapecio",
    ],
  },
  {
    region: "Core",
    items: ["Abdominales", "Core", "Lumbar"],
  },
  {
    region: "Tren inferior",
    items: ["Cuádriceps", "Femoral", "Glúteo", "Aductor", "Gemelo"],
  },
];

export const MUSCLE_GROUPS: string[] = MUSCLE_GROUPS_BY_REGION.flatMap(
  (group) => group.items,
);

export const EXERCISE_TYPES = {
  BILATERAL: "bilateral",
  UNILATERAL: "unilateral",
} as const;

export type ExerciseType = (typeof EXERCISE_TYPES)[keyof typeof EXERCISE_TYPES];
