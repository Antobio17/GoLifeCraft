<?php

namespace App\Tests\Nutrition\Pantry\Inventory\Application\Command;

use Nutrition\Pantry\Inventory\Application\Command\ReopenInventoryCommand;
use Nutrition\Pantry\Inventory\Application\Command\ReopenInventoryCommandHandler;
use Nutrition\Pantry\Inventory\Domain\Event\InventoryReopened;
use Nutrition\Pantry\Inventory\Domain\Exception\ReopenInventoryException;
use Nutrition\Pantry\Inventory\Domain\Model\Inventory;
use Nutrition\Pantry\Inventory\Domain\Model\InventoryLocationItem;
use Nutrition\Pantry\Inventory\Infrastructure\Domain\Model\InMemory\InMemoryInventoryRepository;
use Nutrition\Pantry\Inventory\Infrastructure\Domain\QueryModel\InMemory\InMemoryReopenInventoryNeedleDataQuery;
use PHPUnit\Framework\TestCase;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final class ReopenInventoryCommandHandlerTest extends TestCase
{
    private InMemoryInventoryRepository $inventoryRepository;
    private InMemoryReopenInventoryNeedleDataQuery $needleDataQuery;
    private DateTimeGenerator $dateTimeGenerator;
    private ReopenInventoryCommandHandler $handler;

    protected function setUp(): void
    {
        $this->dateTimeGenerator = new DateTimeGenerator();
        $this->inventoryRepository = new InMemoryInventoryRepository();
        $this->needleDataQuery = new InMemoryReopenInventoryNeedleDataQuery();
        $this->handler = new ReopenInventoryCommandHandler(
            inventoryRepository: $this->inventoryRepository,
            needleDataQuery: $this->needleDataQuery,
            domainEventCollectorService: new DomainEventCollectorService(),
            dateTimeGenerator: $this->dateTimeGenerator,
        );
    }

    public function testItPutsAValidatedCountBackInProgress(): void
    {
        $this->givenValidatedInventory();

        ($this->handler)(new ReopenInventoryCommand(
            inventoryId: 'inventory-1',
            reopenedByUserId: 'god-user-id',
        ));

        $this->assertTrue(condition: $this->inventoryRepository->findById(id: 'inventory-1')->isDraft());
    }

    public function testItKeepsEverythingThatWasCounted(): void
    {
        $this->givenValidatedInventory();

        ($this->handler)(new ReopenInventoryCommand(
            inventoryId: 'inventory-1',
            reopenedByUserId: 'god-user-id',
        ));

        $this->assertSame(
            expected: 780.0,
            actual: $this->inventoryRepository->findById(id: 'inventory-1')->locations[0]->items[0]->countedQuantity,
        );
    }

    public function testItRecordsTheReopening(): void
    {
        $inventory = $this->givenValidatedInventory();

        ($this->handler)(new ReopenInventoryCommand(
            inventoryId: 'inventory-1',
            reopenedByUserId: 'another-user-id',
        ));

        $events = array_values(array: array_filter(
            array: $inventory->pullDomainEvents(),
            callback: static fn (object $event): bool => $event instanceof InventoryReopened,
        ));

        $this->assertCount(expectedCount: 1, haystack: $events);
        $this->assertSame(expected: Inventory::STATUS_DRAFT, actual: $events[0]->status);
        $this->assertSame(expected: 'another-user-id', actual: $events[0]->updatedByUserId);
    }

    public function testItRefusesACountThatIsStillOpen(): void
    {
        $this->givenValidatedInventory();
        $this->inventoryRepository->findById(id: 'inventory-1')->reopen(
            reopenedByUserId: 'god-user-id',
            dateTimeGenerator: $this->dateTimeGenerator,
        );

        $this->expectException(exception: ReopenInventoryException::class);

        ($this->handler)(new ReopenInventoryCommand(
            inventoryId: 'inventory-1',
            reopenedByUserId: 'god-user-id',
        ));
    }

    public function testItRefusesWhenAnotherCountIsAlreadyOpen(): void
    {
        $this->givenValidatedInventory();
        $this->needleDataQuery->withOpenInventory(inventoryId: 'inventory-2');

        $this->expectException(exception: ReopenInventoryException::class);

        ($this->handler)(new ReopenInventoryCommand(
            inventoryId: 'inventory-1',
            reopenedByUserId: 'god-user-id',
        ));
    }

    public function testItRefusesACountThatDoesNotExist(): void
    {
        $this->expectException(exception: ReopenInventoryException::class);

        ($this->handler)(new ReopenInventoryCommand(
            inventoryId: 'missing-inventory',
            reopenedByUserId: 'god-user-id',
        ));
    }

    private function givenValidatedInventory(): Inventory
    {
        $inventory = Inventory::start(
            id: 'inventory-1',
            countedOn: '2026-09-05',
            shift: Inventory::SHIFT_MORNING,
            note: '',
            locations: [
                InventoryTestPantry::location(
                    position: 1,
                    locationId: 'location-1',
                    name: 'Nevera',
                    items: [['article-1', InventoryLocationItem::KIND_ARTICLE, 'Arroz', 'g', 1000.0]],
                    dateTimeGenerator: $this->dateTimeGenerator,
                ),
            ],
            startedByUserId: 'god-user-id',
            dateTimeGenerator: $this->dateTimeGenerator,
        );

        $inventory->countItem(
            itemId: $inventory->locations[0]->items[0]->id,
            countedQuantity: 780.0,
            countedUnit: 'g',
            countedByUserId: 'god-user-id',
            dateTimeGenerator: $this->dateTimeGenerator,
        );
        $inventory->validate(validatedByUserId: 'god-user-id', dateTimeGenerator: $this->dateTimeGenerator);

        $this->inventoryRepository->save(inventory: $inventory);

        return $inventory;
    }
}
