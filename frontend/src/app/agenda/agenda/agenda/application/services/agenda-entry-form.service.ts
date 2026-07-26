import { Injectable, inject } from "@angular/core";
import {
  AgendaEntryKind,
  AgendaEntryView,
} from "../../domain/models/agenda.model";
import { AgendaEntryPayload } from "../../domain/models/agenda-entry-payload.model";
import { AgendaCategoryCatalogService } from "./agenda-category-catalog.service";

export interface AgendaEntryForm {
  entryDate: string;
  time: string;
  title: string;
  kind: AgendaEntryKind;
  category: string;
  notes: string;
}

@Injectable()
export class AgendaEntryFormService {
  private categoryCatalog = inject(AgendaCategoryCatalogService);

  empty(entryDate: string): AgendaEntryForm {
    return {
      entryDate,
      time: "",
      title: "",
      kind: "task",
      category: "",
      notes: "",
    };
  }

  fromEntry(entry: AgendaEntryView): AgendaEntryForm {
    return {
      entryDate: entry.entryDate,
      time: entry.time ?? "",
      title: entry.title,
      kind: entry.kind,
      category: entry.category,
      notes: entry.notes,
    };
  }

  withKind(form: AgendaEntryForm, kind: AgendaEntryKind): AgendaEntryForm {
    const category = this.categoryCatalog.belongsTo(kind, form.category)
      ? form.category
      : "";

    return { ...form, kind, category };
  }

  isValid(form: AgendaEntryForm): boolean {
    if (form.title.trim() === "") return false;

    if (!/^\d{4}-\d{2}-\d{2}$/.test(form.entryDate)) return false;

    if (form.time !== "" && !/^([01]\d|2[0-3]):[0-5]\d$/.test(form.time)) {
      return false;
    }

    return this.categoryCatalog.belongsTo(form.kind, form.category);
  }

  toPayload(form: AgendaEntryForm): AgendaEntryPayload {
    return {
      entryDate: form.entryDate,
      time: form.time === "" ? null : form.time,
      title: form.title.trim(),
      kind: form.kind,
      category: form.category,
      notes: form.notes.trim(),
    };
  }
}
