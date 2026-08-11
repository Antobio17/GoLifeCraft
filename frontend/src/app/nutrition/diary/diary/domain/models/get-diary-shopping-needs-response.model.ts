import { DiaryShoppingNeedsAttributes } from "./diary-shopping-needs-attributes.model";

export interface GetDiaryShoppingNeedsResponse {
  data: {
    id: string;
    type: string;
    attributes: DiaryShoppingNeedsAttributes;
  };
}
