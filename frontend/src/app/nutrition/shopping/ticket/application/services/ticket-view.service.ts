import { Injectable, inject } from "@angular/core";
import { UnitCatalogService } from "@nutrition/catalog/article/application/services/unit-catalog.service";
import { AggregateImageKind } from "@shared/aggregate-image/domain/models/aggregate-image-kind.enum";
import { EntityVisualService } from "@shared/entity-visual/application/services/entity-visual.service";
import { VisualSurface } from "@shared/visual-preference/domain/models/visual-surface.enum";
import { TicketAttributes } from "../../domain/models/ticket-attributes.model";
import { TicketItem } from "../../domain/models/ticket-item.model";
import { TicketLineRow } from "../../domain/models/ticket-line-row.model";
import { TicketRow } from "../../domain/models/ticket-row.model";
import { TicketStatus } from "../../domain/models/ticket-status.model";
import { DatedRowTone } from "@shared/design-system/dated-row/domain/models/dated-row-tone.enum";

@Injectable({ providedIn: "root" })
export class TicketViewService {
  private unitCatalog = inject(UnitCatalogService);
  private entityVisual = inject(EntityVisualService);

  private readonly fallbackEmoji = "🧾";

  statusKey(status: TicketStatus | string): string {
    return `ticketStatus.${status}`;
  }

  storeLabel(attributes: TicketAttributes): string {
    return attributes.supermarketName ?? attributes.storeName;
  }

  dateLabel(purchasedOn: string): string {
    const [year, month, day] = purchasedOn.slice(0, 10).split("-").map(Number);
    const date = new Date(year, month - 1, day);

    if (Number.isNaN(date.getTime())) return purchasedOn;

    return date.toLocaleDateString(undefined, {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
  }

  money(value: number | null): string {
    const amount = Number.isFinite(value) ? (value as number) : 0;

    return `${new Intl.NumberFormat("es-ES", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)} €`;
  }

  progressPercent(linked: number, total: number): number {
    if (total <= 0) return 0;

    return Math.round((linked / total) * 100);
  }

  purchasedDate(purchasedOn: string): Date {
    const [year, month, day] = purchasedOn.slice(0, 10).split("-").map(Number);

    return new Date(year, month - 1, day);
  }

  monthKey(purchasedOn: string): string {
    return purchasedOn.slice(0, 7);
  }

  monthTitle(purchasedOn: string, locale: string): string {
    return this.capitalize(
      new Intl.DateTimeFormat(locale, {
        month: "long",
        year: "numeric",
      }).format(this.purchasedDate(purchasedOn)),
    );
  }

  weekdayLabel(purchasedOn: string, locale: string): string {
    return new Intl.DateTimeFormat(locale, { weekday: "short" })
      .format(this.purchasedDate(purchasedOn))
      .replace(".", "");
  }

  longDateLabel(purchasedOn: string, locale: string): string {
    return this.capitalize(
      new Intl.DateTimeFormat(locale, {
        weekday: "long",
        day: "numeric",
        month: "long",
      }).format(this.purchasedDate(purchasedOn)),
    );
  }

  rowOf(
    id: string,
    attributes: TicketAttributes,
    locale: string,
    t: (key: string) => string,
    count: (key: string, params: Record<string, unknown>) => string,
  ): TicketRow {
    const received = TicketStatus.RECEIVED === attributes.status;

    return {
      id,
      weekday: this.weekdayLabel(attributes.purchasedOn, locale),
      day: `${this.purchasedDate(attributes.purchasedOn).getDate()}`,
      title: this.storeLabel(attributes),
      meta: `${count("getTickets.card.linked", {
        linked: attributes.linkedItems,
        total: attributes.totalItems,
      })} · ${count("getTickets.card.pending", {
        count: attributes.pendingItems,
      })}`,
      value: this.money(attributes.total),
      tag: t(this.statusKey(attributes.status)),
      tagTone: received ? DatedRowTone.Success : DatedRowTone.Warning,
      progress: this.progressPercent(
        attributes.linkedItems,
        attributes.totalItems,
      ),
      ariaLabel: count("getTickets.row.open", {
        store: this.storeLabel(attributes),
        date: this.longDateLabel(attributes.purchasedOn, locale),
      }),
    };
  }

  lineRowOf(item: TicketItem, t: (key: string) => string): TicketLineRow {
    return {
      key: `${item.id}:${item.received}`,
      item,
      quantityLabel: this.decimal(item.quantity),
      unitLabel: this.unitLabel(item),
      priceLabel: this.priceLabel(item),
      totalPriceLabel: this.money(item.totalPrice),
      articleLabel: item.articleName,
      articleEmoji: item.articleEmoji ?? this.fallbackEmoji,
      articleImageUrl: this.entityVisual.urlOf(
        VisualSurface.Shopping,
        AggregateImageKind.Article,
        item.articleId,
        item.articleImage,
      ),
      stockLabel: this.stockLabel(item, t),
      linked: null !== item.articleId,
      received: item.received,
    };
  }

  withQuantity(item: TicketItem, quantity: number | undefined): TicketItem {
    if (undefined === quantity || quantity === item.quantity) return item;

    return {
      ...item,
      quantity: this.round(quantity, 3),
      totalPrice:
        null === item.unitPrice
          ? item.totalPrice
          : this.round(item.unitPrice * quantity, 2),
      baseQuantity:
        null === item.articleId
          ? null
          : this.round(quantity * this.packSize(item), 3),
    };
  }

  private unitLabel(item: TicketItem): string {
    if (null !== item.packUnit) {
      return this.unitCatalog.label(item.packUnit);
    }

    return item.rawUnit ?? "";
  }

  private priceLabel(item: TicketItem): string {
    if (null === item.unitPrice)
      return item.received ? "" : this.money(item.totalPrice);

    if (item.received) return this.money(item.unitPrice);

    return `${this.money(item.unitPrice)} · ${this.money(item.totalPrice)}`;
  }

  private stockLabel(
    item: TicketItem,
    t: (key: string) => string,
  ): string | null {
    if (null === item.baseQuantity || null === item.baseUnit) return null;

    const verb = item.received ? "getTicket.line.added" : "getTicket.line.adds";

    return `${t(verb)} ${this.unitCatalog.amountLabel(item.baseQuantity, item.baseUnit)}`;
  }

  private packSize(item: TicketItem): number {
    if (null === item.packSize || item.packSize <= 0) return 1;

    return item.packSize;
  }

  private round(value: number, decimals: number): number {
    const factor = 10 ** decimals;

    return Math.round(value * factor) / factor;
  }

  private capitalize(text: string): string {
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

  private decimal(value: number): string {
    return new Intl.NumberFormat("es-ES", { maximumFractionDigits: 2 }).format(
      value,
    );
  }
}
