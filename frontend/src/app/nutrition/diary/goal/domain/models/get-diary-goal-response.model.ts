import { DiaryGoalConfig } from "./diary-goal.model";

export interface DiaryGoal {
  id: string;
  type: string;
  attributes: DiaryGoalConfig;
}

export interface GetDiaryGoalResponse {
  data: DiaryGoal;
}
