import { EditableIngredient } from "./editable-ingredient.model";
import { SelectOption } from "@shared/design-system/select/domain/models/select-option.model";

export interface EditableIngredientRow {
  ingredient: EditableIngredient;
  imageUrl: string | null;
  unitLabel: string;
  unitOptions: SelectOption[];
}
