<?php

namespace App\Tests\Nutrition\Pantry\Movement\Application\Subscriber;

use Nutrition\Pantry\Inventory\Domain\Event\InventoryValidated;
use Nutrition\Pantry\Inventory\Domain\Model\Inventory;
use Nutrition\Pantry\Inventory\Domain\Model\InventoryLocationItem;
use Nutrition\Pantry\Movement\Application\Command\RegisterStockMovementCommand;
use Nutrition\Pantry\Movement\Application\Subscriber\RegisterStockCountsOnInventoryValidated;
use Nutrition\Pantry\Movement\Domain\Model\StockMovement;
use PHPUnit\Framework\TestCase;
use Symfony\Component\Messenger\Envelope;
use Symfony\Component\Messenger\MessageBusInterface;

final class RegisterStockCountsOnInventoryValidatedTest extends TestCase
{
    public function testItRegistersTheCountInTheBaseUnitTheItemWasStoredIn(): void
    {
        $bus = $this->bus();

        (new RegisterStockCountsOnInventoryValidated(messageBus: $bus))($this->event(items: [
            [
                'kind' => InventoryLocationItem::KIND_ARTICLE,
                'refId' => 'article-yogurt',
                'unit' => 'g',
                'countedQuantity' => 400.0,
                'countedUnit' => 'glass',
            ],
        ]));

        $this->assertCount(expectedCount: 1, haystack: $bus->dispatched);
        $this->assertInstanceOf(expected: RegisterStockMovementCommand::class, actual: $bus->dispatched[0]);
        $this->assertSame(expected: StockMovement::KIND_ARTICLE, actual: $bus->dispatched[0]->kind);
        $this->assertSame(expected: 'article-yogurt', actual: $bus->dispatched[0]->refId);
        $this->assertSame(expected: [['quantity' => 400.0, 'unit' => 'g']], actual: $bus->dispatched[0]->entries);
    }

    public function testItSkipsItemsThatWereNotCounted(): void
    {
        $bus = $this->bus();

        (new RegisterStockCountsOnInventoryValidated(messageBus: $bus))($this->event(items: [
            [
                'kind' => InventoryLocationItem::KIND_ARTICLE,
                'refId' => 'article-yogurt',
                'unit' => 'g',
                'countedQuantity' => null,
                'countedUnit' => null,
            ],
        ]));

        $this->assertSame(expected: [], actual: $bus->dispatched);
    }

    /**
     * @param array<int, array<string, mixed>> $items
     */
    private function event(array $items): InventoryValidated
    {
        $now = new \DateTime();

        return new InventoryValidated(
            aggregateId: 'inventory-1',
            occurredOn: $now,
            countedOn: '2026-10-05',
            shift: Inventory::SHIFT_AFTERNOON,
            status: Inventory::STATUS_VALIDATED,
            note: '',
            locations: [['locationId' => 'location-1', 'items' => $items]],
            createdAt: $now,
            updatedAt: $now,
            createdByUserId: 'user-1',
            updatedByUserId: 'user-1',
        );
    }

    private function bus(): MessageBusInterface
    {
        return new class implements MessageBusInterface {
            /** @var object[] */
            public array $dispatched = [];

            public function dispatch(object $message, array $stamps = []): Envelope
            {
                $this->dispatched[] = $message;

                return new Envelope(message: $message);
            }
        };
    }
}
