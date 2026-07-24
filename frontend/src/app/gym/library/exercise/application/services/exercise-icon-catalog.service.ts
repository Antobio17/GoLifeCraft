import { Injectable } from "@angular/core";
import { IconGroup } from "@shared/design-system/icon-picker/domain/models/icon-group.model";

@Injectable({ providedIn: "root" })
export class ExerciseIconCatalogService {
  groups(): IconGroup[] {
    return [
      {
        label: "Peso libre",
        items: [
          { icon: "dumbbell", label: "Mancuerna", keywords: ["curl", "peso"] },
          {
            icon: "barbell",
            label: "Barra",
            keywords: ["press", "peso muerto"],
          },
          { icon: "ezBar", label: "Barra Z", keywords: ["curl", "predicador"] },
          {
            icon: "kettlebell",
            label: "Kettlebell",
            keywords: ["pesa rusa", "swing"],
          },
          { icon: "weightPlate", label: "Disco", keywords: ["peso"] },
        ],
      },
      {
        label: "Bancos y estructuras",
        items: [
          {
            icon: "benchFlat",
            label: "Banco plano",
            keywords: ["press banca"],
          },
          {
            icon: "benchIncline",
            label: "Banco inclinado",
            keywords: ["press inclinado"],
          },
          {
            icon: "squatRack",
            label: "Rack sentadilla",
            keywords: ["jaula", "hack", "sentadilla"],
          },
          {
            icon: "pullUpBar",
            label: "Dominadas",
            keywords: ["chin up", "barra"],
          },
          { icon: "dipBars", label: "Paralelas", keywords: ["fondos", "dips"] },
        ],
      },
      {
        label: "Máquinas y poleas",
        items: [
          { icon: "machine", label: "Máquina", keywords: ["stack", "guiada"] },
          { icon: "cablePulley", label: "Polea", keywords: ["cable"] },
          {
            icon: "cableRope",
            label: "Cuerda",
            keywords: ["triceps", "jalón", "cable"],
          },
          {
            icon: "latPulldown",
            label: "Jalón al pecho",
            keywords: ["espalda", "cable"],
          },
          {
            icon: "seatedRow",
            label: "Remo sentado",
            keywords: ["espalda", "cable"],
          },
          {
            icon: "legPress",
            label: "Prensa",
            keywords: ["pierna", "cuádriceps"],
          },
          {
            icon: "legMachine",
            label: "Máquina de pierna",
            keywords: ["curl", "extensión", "femoral", "cuádriceps"],
          },
        ],
      },
      {
        label: "Músculos",
        items: [
          { icon: "bicep", label: "Bíceps", keywords: ["brazo", "curl"] },
          { icon: "chest", label: "Pecho", keywords: ["pectoral", "press"] },
          { icon: "back", label: "Espalda", keywords: ["dorsal", "remo"] },
          {
            icon: "shoulder",
            label: "Hombro",
            keywords: ["deltoides", "elevación"],
          },
          { icon: "abs", label: "Abdomen", keywords: ["core", "abdominales"] },
          {
            icon: "glute",
            label: "Glúteo",
            keywords: ["hip thrust", "cadera"],
          },
          {
            icon: "leg",
            label: "Pierna",
            keywords: ["cuádriceps", "femoral", "sentadilla"],
          },
        ],
      },
      {
        label: "Cardio y otros",
        items: [
          { icon: "treadmill", label: "Cinta", keywords: ["correr", "cardio"] },
          {
            icon: "stationaryBike",
            label: "Bici estática",
            keywords: ["spinning", "cardio"],
          },
          {
            icon: "rowingMachine",
            label: "Remo",
            keywords: ["remoergómetro", "cardio"],
          },
          { icon: "jumpRope", label: "Comba", keywords: ["saltar", "cardio"] },
          {
            icon: "stopwatch",
            label: "Cronómetro",
            keywords: ["tiempo", "isométrico", "plancha"],
          },
          {
            icon: "mat",
            label: "Esterilla",
            keywords: ["estiramiento", "movilidad", "suelo"],
          },
        ],
      },
    ];
  }
}
