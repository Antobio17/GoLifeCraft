import { VisualPreferences } from "@shared/visual-preference/domain/models/visual-preferences.model";

export interface GetMyProfileResponse {
  data: {
    id: string;
    type: string;
    attributes: {
      username: string;
      email: string;
      name: string | null;
      lastname: string | null;
      role: string;
      isActive: boolean;
      tenantId: string;
      theme: string;
      visualPreferences: Partial<VisualPreferences>;
    };
  };
}
