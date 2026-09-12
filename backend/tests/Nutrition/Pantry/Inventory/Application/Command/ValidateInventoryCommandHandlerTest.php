<?php

namespace App\Tests\Nutrition\Pantry\Inventory\Application\Command;

use Nutrition\Pantry\Inventory\Application\Command\ValidateInventoryCommand;
use Nutrition\Pantry\Inventory\Application\Command\ValidateInventoryCommandHandler;
use Nutrition\Pantry\Inventory\Domain\Event\InventoryValidated;
use Nutrition\Pantry\Inventory\Domain\Exception\ValidateInventoryException;
use Nutrition\Pantry\Inventory\Domain\Model\Inventory;
use Nutrition\Pantry\Inventory\Domain\Model\InventoryLocationItem;
use Nutrition\Pantry\Inventory\Infrastructure\Domain\Model\InMemory\InMemoryInventoryRepository;
use PHPUnit\Framework\TestCase;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final class ValidateInventoryCommandHandlerTest extends TestCase
{
    private InMemoryInventoryRepository $inventoryRepository;
    private DateTimeGenerator $dateTimeGenerator;
    private ValidateInventoryCommandHandler $handler;

    protected function setUp(): void
    {
        $this->dateTimeGenerator = new DateTimeGenerator();
        $this->inventoryRepository = new InMemoryInventoryRepository();
        $this->handler = new ValidateInventoryCommandHandler(
            inventoryRepository: $this->inventoryRepository,
            domainEventCollectorService: new DomainEventCollectorService(),
            dateTimeGenerator: $this->dateTimeGenerator,
        );
    }

    public function testItTurnsTheCountIntoHistory(): void
    {
        $this->givenCountedInventory();

        ($this->handler)(new ValidateInventoryCommand(
            inventoryId: 'inventory-1',
            validatedByUserId: 'god-user-id',
        ));

        $this->assertSame(
            expected: Inventory::STATUS_VALIDATED,
            actual: $this->inventoryRepository->findById(id: 'inventory-1')->status,
        );
    }

    public function testItRecordsEveryItemSoTheStockCanBeOverwritten(): void
    {
        $inventory = $this->givenCountedInventory();

        ($this->handler)(new ValidateInventoryCommand(
            inventoryId: 'inventory-1',
            validatedByUserId: 'god-user-id',
        ));

        $events = array_filter(
            array: $inventory->pullDomainEvents(),
            callback: static fn (object $event): bool => $event instanceof InventoryValidated,
        );

        /** @var InventoryValidated $validated */
        $validated = array_values(array: $events)[0];

        $this->assertCount(expectedCount: 1, haystack: $validated->locations);
        $this->assertSame(expected: 'Nevera', actual: $validated->locations[0]['nameSnapshot']);
        $this->assertCount(expectedCount: 2, haystack: $validated->locations[0]['items']);
        $this->assertSame(expected: 780.0, actual: $validated->locations[0]['items'][0]['countedQuantity']);
        $this->assertNull(actual: $validated->locations[0]['items'][1]['countedQuantity']);
    }

    public function testItRefusesToValidateTwice(): void
    {
        $this->givenCountedInventory();

        ($this->handler)(new ValidateInventoryCommand(
            inventoryId: 'inventory-1',
            validatedByUserId: 'god-user-id',
        ));

        $this->expectException(exception: ValidateInventoryException::class);

        ($this->handler)(new ValidateInventoryCommand(
            inventoryId: 'inventory-1',
            validatedByUserId: 'god-user-id',
        ));
    }

    public function testItRefusesToValidateWithNothingCounted(): void
    {
        $this->givenInventory();

        $this->expectException(exception: ValidateInventoryException::class);

        ($this->handler)(new ValidateInventoryCommand(
            inventoryId: 'inventory-1',
            validatedByUserId: 'god-user-id',
        ));
    }

    public function testItRefusesAnUnknownCount(): void
    {
        $this->expectException(exception: ValidateInventoryException::class);

        ($this->handler)(new ValidateInventoryCommand(
            inventoryId: 'missing-inventory',
            validatedByUserId: 'god-user-id',
        ));
    }

    private function givenCountedInventory(): Inventory
    {
        $inventory = $this->givenInventory();

        $inventory->countItem(
            itemId: $inventory->locations[0]->items[0]->id,
            countedQuantity: 780.0,
            countedUnit: 'g',
            countedByUserId: 'god-user-id',
            dateTimeGenerator: $this->dateTimeGenerator,
        );

        return $inventory;
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
                    items: [
                        ['article-1', InventoryLocationItem::KIND_ARTICLE, 'Arroz', 'g', 1000.0],
                        ['recipe-1', InventoryLocationItem::KIND_RECIPE, 'Lentejas', 'serving', 4.0],
                    ],
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
