import { test, expect } from "../../../support/test";
import { TicketsPage } from "./tickets.page";
import { SEED } from "../../../support/seed-data";

test.describe("tickets de compra", () => {
  test("la línea que la memoria ya conocía llega vinculada sola", async ({
    page,
  }) => {
    const tickets = new TicketsPage(page);
    await tickets.open(SEED.tickets.showcase.id);

    await expect(tickets.lines).toHaveCount(SEED.tickets.showcase.lineCount);
    await tickets.expectLinkedTo(
      SEED.tickets.showcase.remembered.rawName,
      SEED.articles.yogur.name,
    );
    await tickets.expectLinkedTo(
      SEED.tickets.showcase.catalogLinked.rawName,
      SEED.articles.arroz.name,
    );
    await tickets.expectPending(SEED.tickets.showcase.pending.rawName);

    await tickets.expectCannotReceive();
  });

  test("vincula las líneas sueltas, recepciona el ticket y deshace la recepción", async ({
    page,
  }, testInfo) => {
    const tickets = new TicketsPage(page);
    const ticketId = SEED.tickets.scratch[testInfo.project.name];
    await tickets.open(ticketId);

    await tickets.increaseQuantity(SEED.tickets.showcase.remembered.rawName);
    await tickets.open(ticketId);
    await tickets.expectAdds(
      SEED.tickets.showcase.remembered.rawName,
      "1,5 kg",
    );

    await tickets.linkThroughPicker(
      SEED.tickets.showcase.pending.rawName,
      SEED.articles.brocoli.name,
      "Vincular",
    );
    await tickets.expectLinkedTo(
      SEED.tickets.showcase.pending.rawName,
      SEED.articles.brocoli.name,
    );

    await tickets.receive();

    await expect(tickets.receiveButton).toHaveCount(0);
    await tickets.open(ticketId);
    await tickets.expectReceived(SEED.tickets.showcase.remembered.rawName);
    await tickets.expectReceived(SEED.tickets.showcase.pending.rawName);

    await tickets.unreceive();

    await expect(tickets.unreceiveButton).toHaveCount(0);
    await tickets.open(ticketId);
    await expect(
      tickets.lineNamed(SEED.tickets.showcase.remembered.rawName),
    ).toHaveAttribute("received", "false");
    await expect(tickets.receiveButton.locator("button")).toBeEnabled();
  });

  test("una línea que no era una compra se quita deslizándola", async ({
    page,
  }, testInfo) => {
    const tickets = new TicketsPage(page);
    const ticketId = SEED.tickets.removable[testInfo.project.name];
    await tickets.open(ticketId);

    await expect(tickets.lines).toHaveCount(2);

    await tickets.removeLine(SEED.tickets.showcase.pending.rawName);

    await expect(tickets.lines).toHaveCount(1);
    await tickets.open(ticketId);
    await expect(tickets.lines).toHaveCount(1);
    await expect(tickets.receiveButton.locator("button")).toBeEnabled();
  });

  test("el listado abre el ticket que se toca", async ({ page }) => {
    const tickets = new TicketsPage(page);
    await tickets.goto();

    await tickets.cards
      .filter({ hasText: SEED.supermarkets.mercadona.name })
      .first()
      .click();

    await expect(tickets.lines.first()).toBeVisible();
  });
});
