import { SelectOption } from "@shared/design-system/select/domain/models/select-option.model";

export interface NotificationPreferenceRow {
  type: string;
  icon: string;
  title: string;
  subtitle: string;
  enabled: boolean;
  time: string | null;
  leadMinutes: string | null;
  leadOptions: SelectOption[];
  testId: string;
}
