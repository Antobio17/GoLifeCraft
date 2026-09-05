<?php

namespace App\Tests\Nutrition\Pantry\Inventory\Application\Command;

use Nutrition\Pantry\Inventory\Application\Command\StartInventoryCommand;
use Nutrition\Pantry\Inventory\Application\Command\StartInventoryCommandHandler;
use Nutrition\Pantry\Inventory\Domain\Exception\StartInventoryException;
use Nutrition\Pantry\Inventory\Domain\Model\Inventory;
use Nutrition\Pantry\Inventory\Domain\Model\InventoryLocationItem;
use Nutrition\Pantry\Inventory\Domain\QueryModel\Dto\InventoryLocationPlan;
use Nutrition\Pantry\Inventory\Domain\QueryModel\Dto\InventoryStockLine;
use Nutrition\Pantry\Inventory\Infrastructure\Domain\Model\InMemory\InMemoryInventoryRepository;
use Nutrition\Pantry\Inventory\Infrastructure\Domain\QueryModel\InMemory\InMemoryStartInventoryNeedleDataQuery;
use PHPUnit\Framework\TestCase;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final class StartInventoryCommandHandlerTest extends TestCase
{
    private InMemoryInventoryRepository $inventoryRepository;

    protected function setUp(): void
    {
        $this->inventoryRepository = new InMemoryInventoryRepository();
    }

    public function testItPlansOneCountedLocationPerPantryLocationWithItsItems(): void
    {
        ($this->handlerWith())(new StartInventoryCommand(
            countedOn: '2026-09-05',
            shift: Inventory::SHIFT_MORNING,
            note: '',
            startedByUserId: 'god-user-id',
        ));

        $inventory = $this->inventoryRepository->findById(id: 'inventory-1');

        $this->assertCount(expectedCount: 2, haystack: $inventory->locations);
        $this->assertSame(expected: Inventory::STATUS_DRAFT, actual: $inventory->status);
        $this->assertSame(expected: 'Nevera', actual: $inventory->locations[0]->nameSnapshot);
        $this->assertCount(expectedCount: 2, haystack: $inventory->locations[0]->items);
        $this->assertCount(expectedCount: 1, haystack: $inventory->locations[1]->items);
        $this->assertCount(expectedCount: 3, haystack: $inventory->items());
    }

    public function testItSnapshotsWhatEachItemWasExpectedToHold(): void
    {
        ($this->handlerWith())(new StartInventoryCommand(
            countedOn: '2026-09-05',
            shift: Inventory::SHIFT_MORNING,
            note: '',
            startedByUserId: 'god-user-id',
        ));

        $item = $this->inventoryRepository->findById(id: 'inventory-1')->locations[0]->items[0];

        $this->assertSame(expected: InventoryLocationItem::KIND_ARTICLE, actual: $item->kind);
        $this->assertSame(expected: 'Arroz', actual: $item->nameSnapshot);
        $this->assertSame(expected: 1000.0, actual: $item->expectedQuantity);
        $this->assertNull(actual: $item->countedQuantity);
    }

    public function testItSkipsALocationHoldingNothing(): void
    {
        ($this->handlerWith(locationPlans: [
            new InventoryLocationPlan(locationId: 'location-1', name: 'Nevera', emoji: '🥶', items: []),
            self::pantry()[1],
        ]))(new StartInventoryCommand(
            countedOn: '2026-09-05',
            shift: Inventory::SHIFT_MORNING,
            note: '',
            startedByUserId: 'god-user-id',
        ));

        $inventory = $this->inventoryRepository->findById(id: 'inventory-1');

        $this->assertCount(expectedCount: 1, haystack: $inventory->locations);
        $this->assertSame(expected: 'Despensa', actual: $inventory->locations[0]->nameSnapshot);
    }

    public function testItRefusesASecondOpenCount(): void
    {
        $this->expectException(exception: StartInventoryException::class);

        ($this->handlerWith(openInventoryId: 'inventory-already-open'))(new StartInventoryCommand(
            countedOn: '2026-09-05',
            shift: Inventory::SHIFT_MORNING,
            note: '',
            startedByUserId: 'god-user-id',
        ));
    }

    public function testItRefusesAnInvalidShift(): void
    {
        $this->expectException(exception: StartInventoryException::class);

        ($this->handlerWith())(new StartInventoryCommand(
            countedOn: '2026-09-05',
            shift: 'madrugada',
            note: '',
            startedByUserId: 'god-user-id',
        ));
    }

    public function testItRefusesToStartWithNothingToCount(): void
    {
        $this->expectException(exception: StartInventoryException::class);

        ($this->handlerWith(locationPlans: []))(new StartInventoryCommand(
            countedOn: '2026-09-05',
            shift: Inventory::SHIFT_MORNING,
            note: '',
            startedByUserId: 'god-user-id',
        ));
    }

    /**
     * @param InventoryLocationPlan[]|null $locationPlans
     */
    private function handlerWith(?array $locationPlans = null, ?string $openInventoryId = null): StartInventoryCommandHandler
    {
        return new StartInventoryCommandHandler(
            inventoryRepository: $this->inventoryRepository,
            needleDataQuery: new InMemoryStartInventoryNeedleDataQuery(
                locationPlans: $locationPlans ?? self::pantry(),
                openInventoryId: $openInventoryId,
            ),
            domainEventCollectorService: new DomainEventCollectorService(),
            dateTimeGenerator: new DateTimeGenerator(),
        );
    }

    /**
     * @return InventoryLocationPlan[]
     */
    private static function pantry(): array
    {
        return [
            new InventoryLocationPlan(
                locationId: 'location-1',
                name: 'Nevera',
                emoji: '🥶',
                items: [
                    new InventoryStockLine(
                        locationId: 'location-1',
                        kind: InventoryLocationItem::KIND_ARTICLE,
                        refId: 'article-1',
                        name: 'Arroz',
                        emoji: '🍚',
                        unit: 'g',
                        quantity: 1000.0,
                    ),
                    new InventoryStockLine(
                        locationId: 'location-1',
                        kind: InventoryLocationItem::KIND_RECIPE,
                        refId: 'recipe-1',
                        name: 'Lentejas',
                        emoji: '🥘',
                        unit: 'serving',
                        quantity: 4.0,
                    ),
                ],
            ),
            new InventoryLocationPlan(
                locationId: 'location-2',
                name: 'Despensa',
                emoji: '🚪',
                items: [
                    new InventoryStockLine(
                        locationId: 'location-2',
                        kind: InventoryLocationItem::KIND_ARTICLE,
                        refId: 'article-2',
                        name: 'Leche',
                        emoji: '🥛',
                        unit: 'ml',
                        quantity: 500.0,
                    ),
                ],
            ),
        ];
    }
}
