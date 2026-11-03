import { Achievement } from "./achievement.model";

export interface GetAchievementsResponse {
  meta: { pageNumber: number; pageSize: number; total: number };
  data: {
    id: string;
    type: string;
    attributes: Omit<Achievement, "key">;
  }[];
}
