import { test, expect } from "../../../support/test";
import { ScanTicketPage } from "./scan-ticket.page";
import { TicketsPage } from "./tickets.page";
import { SEED } from "../../../support/seed-data";

const DRAFT = {
  storeName: "E2E MERCADONA S.A.",
  supermarketId: SEED.supermarkets.mercadona.id,
  purchasedOn: "2026-01-14",
  total: 3.4,
  lines: [
    {
      rawName: SEED.tickets.showcase.remembered.rawName,
      quantity: 2,
      rawUnit: null,
      unitPrice: 0.5,
      totalPrice: 1,
    },
    {
      rawName: SEED.tickets.showcase.catalogLinked.rawName,
      quantity: 1,
      rawUnit: null,
      unitPrice: 1.4,
      totalPrice: 1.4,
    },
    {
      rawName: SEED.tickets.showcase.pending.rawName,
      quantity: 1,
      rawUnit: null,
      unitPrice: 1,
      totalPrice: 1,
    },
  ],
};

test.describe("escanear un ticket", () => {
  test("lee la foto, deja revisar lo leído y guarda el ticket vinculado", async ({
    page,
  }) => {
    const scan = new ScanTicketPage(page);
    await scan.goto();
    await scan.stubDraft(DRAFT);

    await scan.addPhoto();
    await scan.analyze();

    await expect(scan.lines).toHaveCount(DRAFT.lines.length);
    await expect(scan.storeName).toHaveValue(DRAFT.storeName);

    await scan.removeLine(SEED.tickets.showcase.pending.rawName);
    await expect(scan.lines).toHaveCount(DRAFT.lines.length - 1);

    await scan.save();

    await expect(page).toHaveURL(/\/tickets\/[0-9a-f-]{36}$/);

    const tickets = new TicketsPage(page);
    await expect(tickets.lines).toHaveCount(DRAFT.lines.length - 1);
    await tickets.expectLinkedTo(
      SEED.tickets.showcase.remembered.rawName,
      SEED.articles.yogur.name,
    );
    await tickets.expectLinkedTo(
      SEED.tickets.showcase.catalogLinked.rawName,
      SEED.articles.arroz.name,
    );
  });

  test("no deja guardar un ticket sin líneas", async ({ page }) => {
    const scan = new ScanTicketPage(page);
    await scan.goto();
    await scan.stubDraft({ ...DRAFT, lines: [DRAFT.lines[0]] });

    await scan.addPhoto();
    await scan.analyze();

    await scan.removeLine(SEED.tickets.showcase.remembered.rawName);

    await expect(scan.saveButton).toBeDisabled();
  });
});
