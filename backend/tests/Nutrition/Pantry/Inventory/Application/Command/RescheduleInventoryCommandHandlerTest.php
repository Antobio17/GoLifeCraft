<?php

namespace App\Tests\Nutrition\Pantry\Inventory\Application\Command;

use Nutrition\Pantry\Inventory\Application\Command\RescheduleInventoryCommand;
use Nutrition\Pantry\Inventory\Application\Command\RescheduleInventoryCommandHandler;
use Nutrition\Pantry\Inventory\Domain\Event\InventoryRescheduled;
use Nutrition\Pantry\Inventory\Domain\Exception\RescheduleInventoryException;
use Nutrition\Pantry\Inventory\Domain\Model\Inventory;
use Nutrition\Pantry\Inventory\Domain\Model\InventoryLocationItem;
use Nutrition\Pantry\Inventory\Infrastructure\Domain\Model\InMemory\InMemoryInventoryRepository;
use PHPUnit\Framework\TestCase;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final class RescheduleInventoryCommandHandlerTest extends TestCase
{
    private InMemoryInventoryRepository $inventoryRepository;
    private DateTimeGenerator $dateTimeGenerator;
    private RescheduleInventoryCommandHandler $handler;

    protected function setUp(): void
    {
        $this->dateTimeGenerator = new DateTimeGenerator();
        $this->inventoryRepository = new InMemoryInventoryRepository();
        $this->handler = new RescheduleInventoryCommandHandler(
            inventoryRepository: $this->inventoryRepository,
            domainEventCollectorService: new DomainEventCollectorService(),
            dateTimeGenerator: $this->dateTimeGenerator,
        );
    }

    public function testItMovesTheDraftToAnotherDateAndShift(): void
    {
        $this->givenInventory();

        ($this->handler)(new RescheduleInventoryCommand(
            inventoryId: 'inventory-1',
            countedOn: '2026-09-04',
            shift: Inventory::SHIFT_MORNING,
            rescheduledByUserId: 'other-user-id',
        ));

        $inventory = $this->inventoryRepository->findById(id: 'inventory-1');

        $this->assertSame(expected: '2026-09-04', actual: $inventory->countedOn);
        $this->assertSame(expected: Inventory::SHIFT_MORNING, actual: $inventory->shift);
        $this->assertSame(expected: 'other-user-id', actual: $inventory->updatedByUserId);
        $this->assertTrue(condition: $inventory->isDraft());
    }

    public function testItKeepsWhatWasAlreadyCounted(): void
    {
        $inventory = $this->givenInventory();
        $itemId = $inventory->locations[0]->items[0]->id;
        $inventory->countItem(
            itemId: $itemId,
            countedQuantity: 780.0,
            countedUnit: 'g',
            countedByUserId: 'god-user-id',
            dateTimeGenerator: $this->dateTimeGenerator,
        );

        ($this->handler)(new RescheduleInventoryCommand(
            inventoryId: 'inventory-1',
            countedOn: '2026-09-06',
            shift: Inventory::SHIFT_MORNING,
            rescheduledByUserId: 'god-user-id',
        ));

        $this->assertSame(
            expected: 780.0,
            actual: $this->inventoryRepository->findById(id: 'inventory-1')->item(itemId: $itemId)->countedQuantity,
        );
    }

    public function testItRecordsTheFullCountWithThePreviousSchedule(): void
    {
        $inventory = $this->givenInventory();
        $inventory->pullDomainEvents();

        $inventory->reschedule(
            countedOn: '2026-09-04',
            shift: Inventory::SHIFT_MORNING,
            rescheduledByUserId: 'god-user-id',
            dateTimeGenerator: $this->dateTimeGenerator,
        );

        $events = $inventory->pullDomainEvents();
        $event = $events[0];

        $this->assertCount(expectedCount: 1, haystack: $events);
        $this->assertInstanceOf(expected: InventoryRescheduled::class, actual: $event);
        $this->assertSame(expected: '2026-09-04', actual: $event->countedOn);
        $this->assertSame(expected: Inventory::SHIFT_MORNING, actual: $event->shift);
        $this->assertSame(expected: '2026-09-05', actual: $event->previousCountedOn);
        $this->assertSame(expected: Inventory::SHIFT_AFTERNOON, actual: $event->previousShift);
        $this->assertCount(expectedCount: 1, haystack: $event->locations);
    }

    public function testItRefusesAValidatedCount(): void
    {
        $inventory = $this->givenInventory();
        $inventory->countItem(
            itemId: $inventory->locations[0]->items[0]->id,
            countedQuantity: 780.0,
            countedUnit: 'g',
            countedByUserId: 'god-user-id',
            dateTimeGenerator: $this->dateTimeGenerator,
        );
        $inventory->validate(validatedByUserId: 'god-user-id', dateTimeGenerator: $this->dateTimeGenerator);

        $this->expectException(exception: RescheduleInventoryException::class);

        ($this->handler)(new RescheduleInventoryCommand(
            inventoryId: 'inventory-1',
            countedOn: '2026-09-04',
            shift: Inventory::SHIFT_MORNING,
            rescheduledByUserId: 'god-user-id',
        ));
    }

    public function testItRefusesAnInvalidDate(): void
    {
        $this->givenInventory();

        $this->expectException(exception: RescheduleInventoryException::class);

        ($this->handler)(new RescheduleInventoryCommand(
            inventoryId: 'inventory-1',
            countedOn: '04/09/2026',
            shift: Inventory::SHIFT_MORNING,
            rescheduledByUserId: 'god-user-id',
        ));
    }

    public function testItRefusesAnUnknownShift(): void
    {
        $this->givenInventory();

        $this->expectException(exception: RescheduleInventoryException::class);

        ($this->handler)(new RescheduleInventoryCommand(
            inventoryId: 'inventory-1',
            countedOn: '2026-09-04',
            shift: 'night',
            rescheduledByUserId: 'god-user-id',
        ));
    }

    public function testItRefusesAnUnknownCount(): void
    {
        $this->expectException(exception: RescheduleInventoryException::class);

        ($this->handler)(new RescheduleInventoryCommand(
            inventoryId: 'missing-inventory',
            countedOn: '2026-09-04',
            shift: Inventory::SHIFT_MORNING,
            rescheduledByUserId: 'god-user-id',
        ));
    }

    private function givenInventory(): Inventory
    {
        $inventory = Inventory::start(
            id: 'inventory-1',
            countedOn: '2026-09-05',
            shift: Inventory::SHIFT_AFTERNOON,
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

        $this->inventoryRepository->save(inventory: $inventory);

        return $inventory;
    }
}
