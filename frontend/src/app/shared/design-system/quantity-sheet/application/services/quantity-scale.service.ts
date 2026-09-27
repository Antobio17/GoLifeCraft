import { Injectable } from "@angular/core";
import { QuantityScale } from "../../domain/models/quantity-scale.model";

const BULK_UNITS = ["g", "ml"];
const STEP = 1;
const BULK_SCALE: QuantityScale = {
  min: 0,
  max: 1000,
  step: 1,
  spacing: 9,
  majorEvery: 10,
};
const COUNT_SCALE: QuantityScale = {
  min: 0,
  max: 20,
  step: 0.5,
  spacing: 22,
  majorEvery: 2,
};

@Injectable({ providedIn: "root" })
export class QuantityScaleService {
  scale(unit: string, value: number): QuantityScale {
    const base = this.isBulk(unit) ? BULK_SCALE : COUNT_SCALE;
    const room = base.step * base.majorEvery;

    return {
      ...base,
      max: Math.max(base.max, Math.ceil((value * 1.5) / room) * room),
    };
  }

  nudge(value: number, direction: 1 | -1): number {
    const next =
      direction > 0
        ? Math.floor(value / STEP + 1e-9) * STEP + STEP
        : Math.ceil(value / STEP - 1e-9) * STEP - STEP;

    return next > 0 ? this.round(next) : value;
  }

  canDecrease(value: number): boolean {
    return value > STEP;
  }

  round(value: number): number {
    return Math.round(value * 100) / 100;
  }

  private isBulk(unit: string): boolean {
    return BULK_UNITS.includes(unit.toLowerCase());
  }
}
