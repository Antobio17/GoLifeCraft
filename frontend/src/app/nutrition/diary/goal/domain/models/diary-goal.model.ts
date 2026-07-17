export interface DiaryGoalConfig {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
}

export interface DiaryGoalResource {
  id: string;
  type: string;
  attributes: DiaryGoalConfig;
}

export interface GetDiaryGoalResponse {
  data: DiaryGoalResource;
}
