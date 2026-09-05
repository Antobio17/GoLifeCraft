<?php

namespace App\Tests\Nutrition\Pantry\Inventory\Application\Command;

use Nutrition\Pantry\Inventory\Application\Command\DiscardInventoryCommand;
use Nutrition\Pantry\Inventory\Application\Command\DiscardInventoryCommandHandler;
use Nutrition\Pantry\Inventory\Domain\Exception\DiscardInventoryException;
use Nutrition\Pantry\Inventory\Domain\Model\Inventory;
use Nutrition\Pantry\Inventory\Domain\Model\InventoryLine;
use Nutrition\Pantry\Inventory\Infrastructure\Domain\Model\InMemory\InMemoryInventoryRepository;
use PHPUnit\Framework\TestCase;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final class DiscardInventoryCommandHandlerTest extends TestCase
{
    private InMemoryInventoryRepository $inventoryRepository;
    private DateTimeGenerator $dateTimeGenerator;
    private DiscardInventoryCommandHandler $handler;

    protected function setUp(): void
    {
        $this->dateTimeGenerator = new DateTimeGenerator();
        $this->inventoryRepository = new InMemoryInventoryRepository();
        $this->handler = new DiscardInventoryCommandHandler(
            inventoryRepository: $this->inventoryRepository,
            domainEventCollectorService: new DomainEventCollectorService(),
            dateTimeGenerator: $this->dateTimeGenerator,
        );
    }

    public function testItThrowsTheDraftAway(): void
    {
        $this->givenInventory();

        ($this->handler)(new DiscardInventoryCommand(
            inventoryId: 'inventory-1',
            discardedByUserId: 'god-user-id',
        ));

        $this->assertNull(actual: $this->inventoryRepository->findById(id: 'inventory-1'));
    }

    public function testItKeepsAValidatedCount(): void
    {
        $inventory = $this->givenInventory();
        $inventory->countLine(
            lineId: $inventory->lines[0]->id,
            countedQuantity: 780.0,
            countedByUserId: 'god-user-id',
            dateTimeGenerator: $this->dateTimeGenerator,
        );
        $inventory->validate(validatedByUserId: 'god-user-id', dateTimeGenerator: $this->dateTimeGenerator);

        $this->expectException(exception: DiscardInventoryException::class);

        ($this->handler)(new DiscardInventoryCommand(
            inventoryId: 'inventory-1',
            discardedByUserId: 'god-user-id',
        ));
    }

    public function testItRefusesAnUnknownCount(): void
    {
        $this->expectException(exception: DiscardInventoryException::class);

        ($this->handler)(new DiscardInventoryCommand(
            inventoryId: 'missing-inventory',
            discardedByUserId: 'god-user-id',
        ));
    }

    private function givenInventory(): Inventory
    {
        $inventory = Inventory::start(
            id: 'inventory-1',
            countedOn: '2026-09-05',
            shift: Inventory::SHIFT_AFTERNOON,
            locationId: null,
            note: '',
            lines: [
                InventoryLine::plan(
                    inventoryId: 'inventory-1',
                    position: 1,
                    kind: InventoryLine::KIND_ARTICLE,
                    refId: 'article-1',
                    locationId: null,
                    nameSnapshot: 'Arroz',
                    emojiSnapshot: '🍚',
                    unit: 'g',
                    expectedQuantity: 1000.0,
                    createdByUserId: 'god-user-id',
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
