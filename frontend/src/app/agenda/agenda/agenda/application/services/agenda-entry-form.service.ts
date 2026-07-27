import { Injectable, inject } from "@angular/core";
import {
  AgendaEntryDateMode,
  AgendaEntryKind,
  AgendaEntryView,
} from "../../domain/models/agenda.model";
import { AgendaSeriesAttributes } from "../../domain/models/agenda-series.model";
import {
  AgendaEntryPayload,
  AgendaEntrySeriesPayload,
} from "../../domain/models/agenda-entry-payload.model";
import { AgendaCategoryCatalogService } from "./agenda-category-catalog.service";

export interface AgendaEntryForm {
  dateMode: AgendaEntryDateMode;
  entryDate: string;
  endDate: string;
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
      dateMode: "single",
      entryDate,
      endDate: entryDate,
      time: "",
      title: "",
      kind: "task",
      category: "",
      notes: "",
    };
  }

  fromEntry(entry: AgendaEntryView): AgendaEntryForm {
    return {
      dateMode: "single",
      entryDate: entry.entryDate,
      endDate: entry.entryDate,
      time: entry.time ?? "",
      title: entry.title,
      kind: entry.kind,
      category: entry.category,
      notes: entry.notes,
    };
  }

  fromSeriesEntry(entry: AgendaEntryView): AgendaEntryForm {
    return {
      ...this.fromEntry(entry),
      dateMode: "range",
      endDate: entry.entryDate,
      time: "",
    };
  }

  fromSeries(series: AgendaSeriesAttributes): AgendaEntryForm {
    return {
      dateMode: "range",
      entryDate: series.entryDate,
      endDate: series.endDate,
      time: "",
      title: series.title,
      kind: series.kind,
      category: series.category,
      notes: series.notes,
    };
  }

  withKind(form: AgendaEntryForm, kind: AgendaEntryKind): AgendaEntryForm {
    const category = this.categoryCatalog.belongsTo(kind, form.category)
      ? form.category
      : "";

    return { ...form, kind, category };
  }

  withDateMode(
    form: AgendaEntryForm,
    dateMode: AgendaEntryDateMode,
  ): AgendaEntryForm {
    if (dateMode === "single") return { ...form, dateMode };

    return { ...form, dateMode, time: "", endDate: this.clampEndDate(form) };
  }

  withField(
    form: AgendaEntryForm,
    field: keyof AgendaEntryForm,
    value: string,
  ): AgendaEntryForm {
    if (field !== "entryDate") return { ...form, [field]: value };

    const withEntryDate = { ...form, entryDate: value };

    return { ...withEntryDate, endDate: this.clampEndDate(withEntryDate) };
  }

  isRange(form: AgendaEntryForm): boolean {
    return form.dateMode === "range";
  }

  hasSeveralDays(form: AgendaEntryForm): boolean {
    return this.isRange(form) && form.endDate > form.entryDate;
  }

  isValid(form: AgendaEntryForm): boolean {
    if (form.title.trim() === "") return false;

    if (!this.isValidDate(form.entryDate)) return false;

    if (form.time !== "" && !/^([01]\d|2[0-3]):[0-5]\d$/.test(form.time)) {
      return false;
    }

    if (this.isRange(form) && !this.isValidDate(form.endDate)) return false;

    if (this.isRange(form) && form.endDate < form.entryDate) return false;

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

  toSeriesPayload(form: AgendaEntryForm): AgendaEntrySeriesPayload {
    return {
      entryDate: form.entryDate,
      endDate: form.endDate,
      title: form.title.trim(),
      kind: form.kind,
      category: form.category,
      notes: form.notes.trim(),
    };
  }

  private clampEndDate(form: AgendaEntryForm): string {
    if (form.endDate === "") return form.entryDate;

    return form.endDate < form.entryDate ? form.entryDate : form.endDate;
  }

  private isValidDate(date: string): boolean {
    return /^\d{4}-\d{2}-\d{2}$/.test(date);
  }
}
