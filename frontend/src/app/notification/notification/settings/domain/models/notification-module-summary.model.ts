import { DsGlyph } from "@shared/design-system/glyph/domain/models/ds-glyph.enum";

export interface NotificationModuleSummary {
  module: string;
  glyph: DsGlyph;
  title: string;
  subtitle: string;
  testId: string;
}
