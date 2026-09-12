<?php

namespace App\Tests\Nutrition\Pantry\Movement\Application\Command;

use Nutrition\Pantry\Movement\Application\Command\RegisterStockMovementCommand;
use Nutrition\Pantry\Movement\Application\Command\RegisterStockMovementCommandHandler;
use Nutrition\Pantry\Movement\Application\Command\RevokeStockMovementsCommand;
use Nutrition\Pantry\Movement\Application\Command\RevokeStockMovementsCommandHandler;
use Nutrition\Pantry\Movement\Domain\Model\StockMovement;
use Nutrition\Pantry\Movement\Infrastructure\Domain\Model\InMemory\InMemoryStockMovementRepository;
use Nutrition\Pantry\Movement\Infrastructure\Domain\QueryModel\InMemory\InMemoryRegisterStockMovementNeedleDataQuery;
use Nutrition\Pantry\Movement\Infrastructure\Domain\Service\InMemory\InMemoryStockBalanceCalculator;
use Nutrition\Pantry\Movement\Infrastructure\Domain\Service\InMemory\InMemoryStockMovementUnitConverter;
use PHPUnit\Framework\TestCase;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final class StockLedgerTest extends TestCase
{
    private InMemoryStockMovementRepository $stockMovementRepository;
    private InMemoryStockBalanceCalculator $balanceCalculator;
    private InMemoryStockMovementUnitConverter $unitConverter;
    private RegisterStockMovementCommandHandler $register;
    private RevokeStockMovementsCommandHandler $revoke;

    protected function setUp(): void
    {
        $dateTimeGenerator = new DateTimeGenerator();
        $this->stockMovementRepository = new InMemoryStockMovementRepository();
        $this->balanceCalculator = new InMemoryStockBalanceCalculator(
            stockMovementRepository: $this->stockMovementRepository,
        );
        $this->unitConverter = new InMemoryStockMovementUnitConverter();
        $this->register = new RegisterStockMovementCommandHandler(
            stockMovementRepository: $this->stockMovementRepository,
            needleDataQuery: new InMemoryRegisterStockMovementNeedleDataQuery(
                articleIds: ['article-1'],
                recipeIds: ['recipe-1'],
            ),
            unitConverter: $this->unitConverter,
            domainEventCollectorService: new DomainEventCollectorService(),
            dateTimeGenerator: $dateTimeGenerator,
        );
        $this->revoke = new RevokeStockMovementsCommandHandler(
            stockMovementRepository: $this->stockMovementRepository,
            domainEventCollectorService: new DomainEventCollectorService(),
            dateTimeGenerator: $dateTimeGenerator,
        );
    }

    public function testItAddsUpTheDeltasWhenNothingHasBeenCountedYet(): void
    {
        $this->receiveTicket(itemId: 'ticket-item-1', purchasedOn: '2026-01-01', quantity: 1000.0);
        $this->receiveTicket(itemId: 'ticket-item-2', purchasedOn: '2026-01-05', quantity: 500.0);

        $this->assertSame(expected: 1500.0, actual: $this->articleBalance());
    }

    public function testABackdatedTicketBeforeTheLastCountLeavesTheStockUntouched(): void
    {
        $this->countInventory(inventoryId: 'inventory-1', countedOn: '2026-01-30', shift: 'morning', quantity: 300.0);

        $this->receiveTicket(itemId: 'ticket-item-1', purchasedOn: '2026-01-01', quantity: 1000.0);

        $this->assertSame(expected: 300.0, actual: $this->articleBalance());
    }

    public function testAMovementAfterTheLastCountIsAddedOnTopOfIt(): void
    {
        $this->countInventory(inventoryId: 'inventory-1', countedOn: '2026-01-30', shift: 'morning', quantity: 300.0);

        $this->receiveTicket(itemId: 'ticket-item-1', purchasedOn: '2026-01-31', quantity: 1000.0);

        $this->assertSame(expected: 1300.0, actual: $this->articleBalance());
    }

    public function testAMorningCountIsBeatenByTheMovementsOfItsOwnDay(): void
    {
        $this->countInventory(inventoryId: 'inventory-1', countedOn: '2026-01-30', shift: 'morning', quantity: 300.0);

        $this->receiveTicket(itemId: 'ticket-item-1', purchasedOn: '2026-01-30', quantity: 1000.0);

        $this->assertSame(expected: 1300.0, actual: $this->articleBalance());
    }

    public function testAnAfternoonCountBeatsTheMovementsOfItsOwnDay(): void
    {
        $this->countInventory(inventoryId: 'inventory-1', countedOn: '2026-01-30', shift: 'afternoon', quantity: 300.0);

        $this->receiveTicket(itemId: 'ticket-item-1', purchasedOn: '2026-01-30', quantity: 1000.0);

        $this->assertSame(expected: 300.0, actual: $this->articleBalance());
    }

    public function testTheLatestCountIsTheOneThatCuts(): void
    {
        $this->countInventory(inventoryId: 'inventory-1', countedOn: '2026-01-10', shift: 'morning', quantity: 800.0);
        $this->receiveTicket(itemId: 'ticket-item-1', purchasedOn: '2026-01-20', quantity: 1000.0);
        $this->countInventory(inventoryId: 'inventory-2', countedOn: '2026-01-30', shift: 'morning', quantity: 250.0);

        $this->assertSame(expected: 250.0, actual: $this->articleBalance());
    }

    public function testTheBalanceGoesNegativeWhenMoreLeavesThanEverCameIn(): void
    {
        $this->eatDiaryEntry(entryId: 'diary-entry-1', entryDate: '2026-02-01', quantity: 250.0);

        $this->assertSame(expected: -250.0, actual: $this->articleBalance());
    }

    public function testRegisteringTheSameSourceTwiceRestatesItInsteadOfAddingUp(): void
    {
        $this->receiveTicket(itemId: 'ticket-item-1', purchasedOn: '2026-01-01', quantity: 1000.0);
        $this->receiveTicket(itemId: 'ticket-item-1', purchasedOn: '2026-01-01', quantity: 400.0);

        $this->assertSame(expected: 400.0, actual: $this->articleBalance());
    }

    public function testRevokingASourceTakesItsMovementBackOut(): void
    {
        $this->receiveTicket(itemId: 'ticket-item-1', purchasedOn: '2026-01-01', quantity: 1000.0);

        ($this->revoke)(new RevokeStockMovementsCommand(
            sourceKind: StockMovement::SOURCE_TICKET_ITEM,
            sourceId: 'ticket-item-1',
            revokedByUserId: 'god-user-id',
        ));

        $this->assertSame(expected: 0.0, actual: $this->articleBalance());
    }

    public function testItConvertsTheDeclaredUnitIntoBaseUnits(): void
    {
        $this->unitConverter->setFactor(articleId: 'article-1', unit: 'pack', factor: 500.0);

        ($this->register)(new RegisterStockMovementCommand(
            kind: StockMovement::KIND_ARTICLE,
            refId: 'article-1',
            type: StockMovement::TYPE_DELTA,
            effectiveAt: StockMovement::deltaMomentOf(businessDate: '2026-01-01'),
            entries: RegisterStockMovementCommand::singleEntry(quantity: 2.0, unit: 'pack'),
            sourceKind: StockMovement::SOURCE_TICKET_ITEM,
            sourceId: 'ticket-item-1',
            registeredByUserId: 'god-user-id',
        ));

        $this->assertSame(expected: 1000.0, actual: $this->articleBalance());
    }

    public function testACountSumsUpEveryLineOfTheSameReference(): void
    {
        $this->unitConverter->setFactor(articleId: 'article-1', unit: 'pack', factor: 500.0);

        ($this->register)(new RegisterStockMovementCommand(
            kind: StockMovement::KIND_ARTICLE,
            refId: 'article-1',
            type: StockMovement::TYPE_COUNT,
            effectiveAt: StockMovement::countMomentOf(countedOn: '2026-01-30', closesTheDay: false),
            entries: [
                ['quantity' => 1.0, 'unit' => 'pack'],
                ['quantity' => 240.0, 'unit' => null],
            ],
            sourceKind: StockMovement::SOURCE_INVENTORY,
            sourceId: 'inventory-1',
            registeredByUserId: 'god-user-id',
        ));

        $this->assertSame(expected: 740.0, actual: $this->articleBalance());
    }

    public function testItIgnoresAMovementWhoseReferenceDoesNotExist(): void
    {
        ($this->register)(new RegisterStockMovementCommand(
            kind: StockMovement::KIND_ARTICLE,
            refId: 'missing-article',
            type: StockMovement::TYPE_DELTA,
            effectiveAt: StockMovement::deltaMomentOf(businessDate: '2026-01-01'),
            entries: RegisterStockMovementCommand::singleEntry(quantity: 1000.0),
            sourceKind: StockMovement::SOURCE_TICKET_ITEM,
            sourceId: 'ticket-item-1',
            registeredByUserId: 'god-user-id',
        ));

        $this->assertSame(
            expected: [],
            actual: $this->stockMovementRepository->findAllByReference(
                kind: StockMovement::KIND_ARTICLE,
                refId: 'missing-article',
            ),
        );
    }

    private function receiveTicket(string $itemId, string $purchasedOn, float $quantity): void
    {
        ($this->register)(new RegisterStockMovementCommand(
            kind: StockMovement::KIND_ARTICLE,
            refId: 'article-1',
            type: StockMovement::TYPE_DELTA,
            effectiveAt: StockMovement::deltaMomentOf(businessDate: $purchasedOn),
            entries: RegisterStockMovementCommand::singleEntry(quantity: $quantity),
            sourceKind: StockMovement::SOURCE_TICKET_ITEM,
            sourceId: $itemId,
            registeredByUserId: 'god-user-id',
        ));
    }

    private function eatDiaryEntry(string $entryId, string $entryDate, float $quantity): void
    {
        ($this->register)(new RegisterStockMovementCommand(
            kind: StockMovement::KIND_ARTICLE,
            refId: 'article-1',
            type: StockMovement::TYPE_DELTA,
            effectiveAt: StockMovement::deltaMomentOf(businessDate: $entryDate),
            entries: RegisterStockMovementCommand::singleEntry(quantity: -$quantity),
            sourceKind: StockMovement::SOURCE_DIARY_ENTRY,
            sourceId: $entryId,
            registeredByUserId: 'god-user-id',
        ));
    }

    private function countInventory(string $inventoryId, string $countedOn, string $shift, float $quantity): void
    {
        ($this->register)(new RegisterStockMovementCommand(
            kind: StockMovement::KIND_ARTICLE,
            refId: 'article-1',
            type: StockMovement::TYPE_COUNT,
            effectiveAt: StockMovement::countMomentOf(countedOn: $countedOn, closesTheDay: 'afternoon' === $shift),
            entries: RegisterStockMovementCommand::singleEntry(quantity: $quantity),
            sourceKind: StockMovement::SOURCE_INVENTORY,
            sourceId: $inventoryId,
            registeredByUserId: 'god-user-id',
        ));
    }

    private function articleBalance(): float
    {
        return $this->balanceCalculator->balanceFor(
            kind: StockMovement::KIND_ARTICLE,
            refId: 'article-1',
        );
    }
}
