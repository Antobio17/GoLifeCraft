<?php

namespace App\Tests\Nutrition\Pantry\Inventory\Application\Command;

use Nutrition\Pantry\Inventory\Application\Command\CountInventoryLineCommand;
use Nutrition\Pantry\Inventory\Application\Command\CountInventoryLineCommandHandler;
use Nutrition\Pantry\Inventory\Domain\Exception\CountInventoryException;
use Nutrition\Pantry\Inventory\Domain\Model\Inventory;
use Nutrition\Pantry\Inventory\Domain\Model\InventoryLine;
use Nutrition\Pantry\Inventory\Infrastructure\Domain\Model\InMemory\InMemoryInventoryRepository;
use PHPUnit\Framework\TestCase;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final class CountInventoryLineCommandHandlerTest extends TestCase
{
    private InMemoryInventoryRepository $inventoryRepository;
    private DateTimeGenerator $dateTimeGenerator;
    private CountInventoryLineCommandHandler $handler;
    private string $lineId;

    protected function setUp(): void
    {
        $this->dateTimeGenerator = new DateTimeGenerator();
        $this->inventoryRepository = new InMemoryInventoryRepository();
        $this->handler = new CountInventoryLineCommandHandler(
            inventoryRepository: $this->inventoryRepository,
            domainEventCollectorService: new DomainEventCollectorService(),
            dateTimeGenerator: $this->dateTimeGenerator,
        );

        $inventory = $this->givenInventory();
        $this->lineId = $inventory->lines[0]->id;
    }

    public function testItWritesDownWhatWasFound(): void
    {
        ($this->handler)(new CountInventoryLineCommand(
            inventoryId: 'inventory-1',
            lineId: $this->lineId,
            countedQuantity: 780.0,
            countedByUserId: 'god-user-id',
        ));

        $line = $this->inventoryRepository->findById(id: 'inventory-1')->lines[0];

        $this->assertSame(expected: 780.0, actual: $line->countedQuantity);
        $this->assertSame(expected: -220.0, actual: $line->difference());
    }

    public function testItClearsACountWhenTheQuantityIsDroppedAgain(): void
    {
        ($this->handler)(new CountInventoryLineCommand(
            inventoryId: 'inventory-1',
            lineId: $this->lineId,
            countedQuantity: 780.0,
            countedByUserId: 'god-user-id',
        ));

        ($this->handler)(new CountInventoryLineCommand(
            inventoryId: 'inventory-1',
            lineId: $this->lineId,
            countedQuantity: null,
            countedByUserId: 'god-user-id',
        ));

        $this->assertFalse(condition: $this->inventoryRepository->findById(id: 'inventory-1')->lines[0]->isCounted());
    }

    public function testItRefusesANegativeQuantity(): void
    {
        $this->expectException(exception: CountInventoryException::class);

        ($this->handler)(new CountInventoryLineCommand(
            inventoryId: 'inventory-1',
            lineId: $this->lineId,
            countedQuantity: -1.0,
            countedByUserId: 'god-user-id',
        ));
    }

    public function testItRefusesAnUnknownLine(): void
    {
        $this->expectException(exception: CountInventoryException::class);

        ($this->handler)(new CountInventoryLineCommand(
            inventoryId: 'inventory-1',
            lineId: 'missing-line',
            countedQuantity: 10.0,
            countedByUserId: 'god-user-id',
        ));
    }

    public function testItRefusesToTouchAValidatedCount(): void
    {
        $inventory = $this->inventoryRepository->findById(id: 'inventory-1');
        $inventory->countLine(
            lineId: $this->lineId,
            countedQuantity: 780.0,
            countedByUserId: 'god-user-id',
            dateTimeGenerator: $this->dateTimeGenerator,
        );
        $inventory->validate(validatedByUserId: 'god-user-id', dateTimeGenerator: $this->dateTimeGenerator);

        $this->expectException(exception: CountInventoryException::class);

        ($this->handler)(new CountInventoryLineCommand(
            inventoryId: 'inventory-1',
            lineId: $this->lineId,
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
