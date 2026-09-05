<?php

namespace App\Tests\Nutrition\Pantry\Inventory\Application\Command;

use Nutrition\Pantry\Inventory\Application\Command\StartInventoryCommand;
use Nutrition\Pantry\Inventory\Application\Command\StartInventoryCommandHandler;
use Nutrition\Pantry\Inventory\Domain\Exception\StartInventoryException;
use Nutrition\Pantry\Inventory\Domain\Model\Inventory;
use Nutrition\Pantry\Inventory\Domain\Model\InventoryLine;
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

    public function testItSnapshotsTheCurrentStockAsTheLinesToCount(): void
    {
        ($this->handlerWith())(new StartInventoryCommand(
            countedOn: '2026-09-05',
            shift: Inventory::SHIFT_MORNING,
            locationId: null,
            note: '',
            startedByUserId: 'god-user-id',
        ));

        $inventory = $this->inventoryRepository->findById(id: 'inventory-1');

        $this->assertCount(expectedCount: 3, haystack: $inventory->lines);
        $this->assertSame(expected: Inventory::STATUS_DRAFT, actual: $inventory->status);
        $this->assertSame(expected: 1000.0, actual: $inventory->lines[0]->expectedQuantity);
        $this->assertNull(actual: $inventory->lines[0]->countedQuantity);
        $this->assertSame(expected: InventoryLine::KIND_RECIPE, actual: $inventory->lines[2]->kind);
    }

    public function testItCountsOnlyTheChosenLocation(): void
    {
        ($this->handlerWith())(new StartInventoryCommand(
            countedOn: '2026-09-05',
            shift: Inventory::SHIFT_NIGHT,
            locationId: 'location-1',
            note: 'Solo la nevera',
            startedByUserId: 'god-user-id',
        ));

        $inventory = $this->inventoryRepository->findById(id: 'inventory-1');

        $this->assertCount(expectedCount: 2, haystack: $inventory->lines);
        $this->assertSame(expected: 'location-1', actual: $inventory->locationId);
        $this->assertSame(expected: 'Solo la nevera', actual: $inventory->note);
    }

    public function testItRefusesASecondOpenCount(): void
    {
        $this->expectException(exception: StartInventoryException::class);

        ($this->handlerWith(openInventoryId: 'inventory-already-open'))(new StartInventoryCommand(
            countedOn: '2026-09-05',
            shift: Inventory::SHIFT_MORNING,
            locationId: null,
            note: '',
            startedByUserId: 'god-user-id',
        ));
    }

    public function testItRefusesAnUnknownLocation(): void
    {
        $this->expectException(exception: StartInventoryException::class);

        ($this->handlerWith())(new StartInventoryCommand(
            countedOn: '2026-09-05',
            shift: Inventory::SHIFT_MORNING,
            locationId: 'missing-location',
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
            locationId: null,
            note: '',
            startedByUserId: 'god-user-id',
        ));
    }

    public function testItRefusesToStartWithNothingToCount(): void
    {
        $this->expectException(exception: StartInventoryException::class);

        ($this->handlerWith(stockLines: []))(new StartInventoryCommand(
            countedOn: '2026-09-05',
            shift: Inventory::SHIFT_MORNING,
            locationId: null,
            note: '',
            startedByUserId: 'god-user-id',
        ));
    }

    /**
     * @param InventoryStockLine[]|null $stockLines
     */
    private function handlerWith(?array $stockLines = null, ?string $openInventoryId = null): StartInventoryCommandHandler
    {
        return new StartInventoryCommandHandler(
            inventoryRepository: $this->inventoryRepository,
            needleDataQuery: new InMemoryStartInventoryNeedleDataQuery(
                stockLines: $stockLines ?? self::stockLines(),
                locationIds: ['location-1'],
                openInventoryId: $openInventoryId,
            ),
            domainEventCollectorService: new DomainEventCollectorService(),
            dateTimeGenerator: new DateTimeGenerator(),
        );
    }

    /**
     * @return InventoryStockLine[]
     */
    private static function stockLines(): array
    {
        return [
            new InventoryStockLine(
                kind: InventoryLine::KIND_ARTICLE,
                refId: 'article-1',
                locationId: 'location-1',
                name: 'Arroz',
                emoji: '🍚',
                unit: 'g',
                quantity: 1000.0,
            ),
            new InventoryStockLine(
                kind: InventoryLine::KIND_ARTICLE,
                refId: 'article-2',
                locationId: 'location-2',
                name: 'Leche',
                emoji: '🥛',
                unit: 'ml',
                quantity: 500.0,
            ),
            new InventoryStockLine(
                kind: InventoryLine::KIND_RECIPE,
                refId: 'recipe-1',
                locationId: 'location-1',
                name: 'Lentejas',
                emoji: '🥘',
                unit: 'serving',
                quantity: 4.0,
            ),
        ];
    }
}
