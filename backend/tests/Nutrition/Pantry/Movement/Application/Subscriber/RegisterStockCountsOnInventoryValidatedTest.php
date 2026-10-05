<?php

namespace App\Tests\Nutrition\Pantry\Movement\Application\Subscriber;

use Nutrition\Pantry\Inventory\Domain\Event\InventoryValidated;
use Nutrition\Pantry\Inventory\Domain\Model\Inventory;
use Nutrition\Pantry\Inventory\Domain\Model\InventoryLocationItem;
use Nutrition\Pantry\Movement\Application\Command\RegisterStockMovementCommand;
use Nutrition\Pantry\Movement\Application\Subscriber\RegisterStockCountsOnInventoryValidated;
use Nutrition\Pantry\Movement\Domain\Model\StockMovement;
use PHPUnit\Framework\TestCase;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;
use Symfony\Component\Messenger\Envelope;
use Symfony\Component\Messenger\MessageBusInterface;

final class RegisterStockCountsOnInventoryValidatedTest extends TestCase
{
    public function testItRegistersTheCountInTheBaseUnitTheItemWasStoredIn(): void
    {
        $bus = $this->bus();

        (new RegisterStockCountsOnInventoryValidated(messageBus: $bus, dateTimeGenerator: new DateTimeGenerator()))($this->event(items: [
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

        (new RegisterStockCountsOnInventoryValidated(messageBus: $bus, dateTimeGenerator: new DateTimeGenerator()))($this->event(items: [
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

    public function testAnAfternoonCountValidatedTheSameDayNeverLandsInTheFuture(): void
    {
        $bus = $this->bus();
        $today = (new \DateTime(datetime: 'now', timezone: new \DateTimeZone(timezone: 'UTC')))->format(format: 'Y-m-d');

        (new RegisterStockCountsOnInventoryValidated(messageBus: $bus, dateTimeGenerator: new DateTimeGenerator()))($this->event(
            items: [
                [
                    'kind' => InventoryLocationItem::KIND_ARTICLE,
                    'refId' => 'article-yogurt',
                    'unit' => 'g',
                    'countedQuantity' => 400.0,
                    'countedUnit' => 'glass',
                ],
            ],
            countedOn: $today,
        ));

        $effectiveAt = new \DateTime(datetime: $bus->dispatched[0]->effectiveAt, timezone: new \DateTimeZone(timezone: 'UTC'));
        $this->assertLessThanOrEqual(maximum: time(), actual: $effectiveAt->getTimestamp());
    }

    public function testAnAfternoonCountOfAPastDayClosesThatDay(): void
    {
        $bus = $this->bus();

        (new RegisterStockCountsOnInventoryValidated(messageBus: $bus, dateTimeGenerator: new DateTimeGenerator()))($this->event(
            items: [
                [
                    'kind' => InventoryLocationItem::KIND_ARTICLE,
                    'refId' => 'article-yogurt',
                    'unit' => 'g',
                    'countedQuantity' => 400.0,
                    'countedUnit' => 'glass',
                ],
            ],
            countedOn: '2026-01-30',
        ));

        $this->assertSame(expected: '2026-01-30 23:59:59', actual: $bus->dispatched[0]->effectiveAt);
    }

    /**
     * @param array<int, array<string, mixed>> $items
     */
    private function event(array $items, string $countedOn = '2026-10-05'): InventoryValidated
    {
        $now = new \DateTime();

        return new InventoryValidated(
            aggregateId: 'inventory-1',
            occurredOn: $now,
            countedOn: $countedOn,
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
