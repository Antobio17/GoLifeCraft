<?php

namespace App\Tests\Nutrition\Pantry\Inventory\Application\Command;

use Nutrition\Pantry\Inventory\Application\Command\CountInventoryItemCommand;
use Nutrition\Pantry\Inventory\Application\Command\CountInventoryItemCommandHandler;
use Nutrition\Pantry\Inventory\Domain\Event\InventoryItemCounted;
use Nutrition\Pantry\Inventory\Domain\Exception\CountInventoryException;
use Nutrition\Pantry\Inventory\Domain\Model\Inventory;
use Nutrition\Pantry\Inventory\Domain\Model\InventoryLocationItem;
use Nutrition\Pantry\Inventory\Infrastructure\Domain\Model\InMemory\InMemoryInventoryRepository;
use PHPUnit\Framework\TestCase;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final class CountInventoryItemCommandHandlerTest extends TestCase
{
    private InMemoryInventoryRepository $inventoryRepository;
    private DateTimeGenerator $dateTimeGenerator;
    private CountInventoryItemCommandHandler $handler;
    private string $itemId;

    protected function setUp(): void
    {
        $this->dateTimeGenerator = new DateTimeGenerator();
        $this->inventoryRepository = new InMemoryInventoryRepository();
        $this->handler = new CountInventoryItemCommandHandler(
            inventoryRepository: $this->inventoryRepository,
            domainEventCollectorService: new DomainEventCollectorService(),
            dateTimeGenerator: $this->dateTimeGenerator,
        );

        $inventory = $this->givenInventory();
        $this->itemId = $inventory->locations[0]->items[0]->id;
    }

    public function testItWritesDownWhatWasFound(): void
    {
        ($this->handler)(new CountInventoryItemCommand(
            inventoryId: 'inventory-1',
            itemId: $this->itemId,
            countedQuantity: 780.0,
            countedByUserId: 'god-user-id',
        ));

        $item = $this->inventoryRepository->findById(id: 'inventory-1')->locations[0]->items[0];

        $this->assertSame(expected: 780.0, actual: $item->countedQuantity);
        $this->assertSame(expected: -220.0, actual: $item->difference());
    }

    public function testItFindsAnItemHeldByASecondLocation(): void
    {
        $inventory = $this->inventoryRepository->findById(id: 'inventory-1');

        ($this->handler)(new CountInventoryItemCommand(
            inventoryId: 'inventory-1',
            itemId: $inventory->locations[1]->items[0]->id,
            countedQuantity: 6.0,
            countedByUserId: 'god-user-id',
        ));

        $this->assertSame(
            expected: 6.0,
            actual: $this->inventoryRepository->findById(id: 'inventory-1')->locations[1]->items[0]->countedQuantity,
        );
    }

    public function testItRecordsOnlyTheCountedItemAndItsLocation(): void
    {
        $inventory = $this->inventoryRepository->findById(id: 'inventory-1');

        ($this->handler)(new CountInventoryItemCommand(
            inventoryId: 'inventory-1',
            itemId: $this->itemId,
            countedQuantity: 780.0,
            countedByUserId: 'god-user-id',
        ));

        $events = array_values(array: array_filter(
            array: $inventory->pullDomainEvents(),
            callback: static fn (object $event): bool => $event instanceof InventoryItemCounted,
        ));

        $this->assertSame(expected: $this->itemId, actual: $events[0]->itemId);
        $this->assertSame(expected: 'Arroz', actual: $events[0]->nameSnapshot);
        $this->assertSame(expected: 1000.0, actual: $events[0]->expectedQuantity);
        $this->assertSame(expected: 780.0, actual: $events[0]->countedQuantity);
        $this->assertSame(expected: 'location-1', actual: $events[0]->locationId);
        $this->assertSame(expected: 'Nevera', actual: $events[0]->locationNameSnapshot);
        $this->assertSame(expected: Inventory::STATUS_DRAFT, actual: $events[0]->status);
    }

    public function testItLeavesEveryOtherItemAlone(): void
    {
        ($this->handler)(new CountInventoryItemCommand(
            inventoryId: 'inventory-1',
            itemId: $this->itemId,
            countedQuantity: 780.0,
            countedByUserId: 'god-user-id',
        ));

        $inventory = $this->inventoryRepository->findById(id: 'inventory-1');

        $this->assertCount(expectedCount: 3, haystack: $inventory->items());
        $this->assertSame(expected: 780.0, actual: $inventory->locations[0]->items[0]->countedQuantity);
        $this->assertNull(actual: $inventory->locations[0]->items[1]->countedQuantity);
        $this->assertNull(actual: $inventory->locations[1]->items[0]->countedQuantity);
    }

    public function testItClearsACountWhenTheQuantityIsDroppedAgain(): void
    {
        ($this->handler)(new CountInventoryItemCommand(
            inventoryId: 'inventory-1',
            itemId: $this->itemId,
            countedQuantity: 780.0,
            countedByUserId: 'god-user-id',
        ));

        ($this->handler)(new CountInventoryItemCommand(
            inventoryId: 'inventory-1',
            itemId: $this->itemId,
            countedQuantity: null,
            countedByUserId: 'god-user-id',
        ));

        $this->assertFalse(
            condition: $this->inventoryRepository->findById(id: 'inventory-1')->locations[0]->items[0]->isCounted(),
        );
    }

    public function testItRefusesANegativeQuantity(): void
    {
        $this->expectException(exception: CountInventoryException::class);

        ($this->handler)(new CountInventoryItemCommand(
            inventoryId: 'inventory-1',
            itemId: $this->itemId,
            countedQuantity: -1.0,
            countedByUserId: 'god-user-id',
        ));
    }

    public function testItRefusesAnUnknownItem(): void
    {
        $this->expectException(exception: CountInventoryException::class);

        ($this->handler)(new CountInventoryItemCommand(
            inventoryId: 'inventory-1',
            itemId: 'missing-item',
            countedQuantity: 10.0,
            countedByUserId: 'god-user-id',
        ));
    }

    public function testItRefusesToTouchAValidatedCount(): void
    {
        $inventory = $this->inventoryRepository->findById(id: 'inventory-1');
        $inventory->countItem(
            itemId: $this->itemId,
            countedQuantity: 780.0,
            countedByUserId: 'god-user-id',
            dateTimeGenerator: $this->dateTimeGenerator,
        );
        $inventory->validate(validatedByUserId: 'god-user-id', dateTimeGenerator: $this->dateTimeGenerator);

        $this->expectException(exception: CountInventoryException::class);

        ($this->handler)(new CountInventoryItemCommand(
            inventoryId: 'inventory-1',
            itemId: $this->itemId,
            countedQuantity: 500.0,
            countedByUserId: 'god-user-id',
        ));
    }

    private function givenInventory(): Inventory
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
                    items: [
                        ['article-1', InventoryLocationItem::KIND_ARTICLE, 'Arroz', 'g', 1000.0],
                        ['article-2', InventoryLocationItem::KIND_ARTICLE, 'Leche', 'ml', 500.0],
                    ],
                    dateTimeGenerator: $this->dateTimeGenerator,
                ),
                InventoryTestPantry::location(
                    position: 2,
                    locationId: 'location-2',
                    name: 'Congelador',
                    items: [['recipe-1', InventoryLocationItem::KIND_RECIPE, 'Lentejas', 'serving', 4.0]],
                    dateTimeGenerator: $this->dateTimeGenerator,
                ),
            ],
            startedByUserId: 'god-user-id',
            dateTimeGenerator: $this->dateTimeGenerator,
        );

        $this->inventoryRepository->save(inventory: $inventory);

        return $inventory;
    }
}
