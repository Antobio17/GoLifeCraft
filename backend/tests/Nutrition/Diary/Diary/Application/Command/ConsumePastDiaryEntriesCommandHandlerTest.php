<?php

namespace App\Tests\Nutrition\Diary\Diary\Application\Command;

use Nutrition\Diary\Diary\Application\Command\ConsumeDiaryEntryCommand;
use Nutrition\Diary\Diary\Application\Command\ConsumePastDiaryEntriesCommand;
use Nutrition\Diary\Diary\Application\Command\ConsumePastDiaryEntriesCommandHandler;
use Nutrition\Diary\Diary\Domain\Model\DiaryEntry;
use Nutrition\Diary\Diary\Domain\Model\DiaryEntrySnapshot;
use Nutrition\Diary\Diary\Infrastructure\Domain\QueryModel\InMemory\InMemoryConsumePastDiaryEntriesNeedleDataQuery;
use Nutrition\Recipe\Recipe\Domain\QueryModel\Dto\MacroBreakdown;
use PHPUnit\Framework\TestCase;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;
use Symfony\Component\Messenger\Envelope;
use Symfony\Component\Messenger\MessageBusInterface;

final class ConsumePastDiaryEntriesCommandHandlerTest extends TestCase
{
    private const string SYSTEM_USER_ID = '00000000-0000-0000-0000-000000000000';

    public function testItTicksEveryPendingEntryOfTheWindowOldestFirst(): void
    {
        $messageBus = $this->givenMessageBus();
        $handler = new ConsumePastDiaryEntriesCommandHandler(
            needleDataQuery: new InMemoryConsumePastDiaryEntriesNeedleDataQuery(entries: [
                $this->entry(id: 'yesterday-dinner', entryDate: '2026-10-17'),
                $this->entry(id: 'two-days-ago-lunch', entryDate: '2026-10-16'),
            ]),
            messageBus: $messageBus,
        );

        $handler(new ConsumePastDiaryEntriesCommand(
            fromDate: '2026-10-11',
            toDate: '2026-10-17',
            updatedByUserId: self::SYSTEM_USER_ID,
        ));

        $this->assertCount(expectedCount: 2, haystack: $messageBus->dispatched);
        $this->assertSame(expected: 'two-days-ago-lunch', actual: $messageBus->dispatched[0]->entryId);
        $this->assertSame(expected: 'yesterday-dinner', actual: $messageBus->dispatched[1]->entryId);
        $this->assertTrue(condition: $messageBus->dispatched[0]->consumed);
        $this->assertSame(expected: self::SYSTEM_USER_ID, actual: $messageBus->dispatched[0]->updatedByUserId);
    }

    public function testItLeavesTodayAndTheDaysBeforeTheWindowPending(): void
    {
        $messageBus = $this->givenMessageBus();
        $handler = new ConsumePastDiaryEntriesCommandHandler(
            needleDataQuery: new InMemoryConsumePastDiaryEntriesNeedleDataQuery(entries: [
                $this->entry(id: 'today-breakfast', entryDate: '2026-10-18'),
                $this->entry(id: 'last-month-dinner', entryDate: '2026-09-20'),
                $this->entry(id: 'yesterday-dinner', entryDate: '2026-10-17'),
            ]),
            messageBus: $messageBus,
        );

        $handler(new ConsumePastDiaryEntriesCommand(
            fromDate: '2026-10-11',
            toDate: '2026-10-17',
            updatedByUserId: self::SYSTEM_USER_ID,
        ));

        $this->assertSame(
            expected: ['yesterday-dinner'],
            actual: array_map(static fn (ConsumeDiaryEntryCommand $command): string => $command->entryId, $messageBus->dispatched),
        );
    }

    public function testItSkipsTheEntriesAlreadyTicked(): void
    {
        $ticked = $this->entry(id: 'yesterday-lunch', entryDate: '2026-10-17');
        $ticked->consume(consumed: true, updatedByUserId: 'god-user-id', dateTimeGenerator: new DateTimeGenerator());

        $messageBus = $this->givenMessageBus();
        $handler = new ConsumePastDiaryEntriesCommandHandler(
            needleDataQuery: new InMemoryConsumePastDiaryEntriesNeedleDataQuery(entries: [$ticked]),
            messageBus: $messageBus,
        );

        $handler(new ConsumePastDiaryEntriesCommand(
            fromDate: '2026-10-11',
            toDate: '2026-10-17',
            updatedByUserId: self::SYSTEM_USER_ID,
        ));

        $this->assertCount(expectedCount: 0, haystack: $messageBus->dispatched);
    }

    private function entry(string $id, string $entryDate): DiaryEntry
    {
        return DiaryEntry::create(
            id: $id,
            entryDate: $entryDate,
            meal: DiaryEntry::MEAL_DINNER,
            kind: DiaryEntry::KIND_RECIPE,
            refId: 'recipe-1',
            quantity: 1.0,
            unit: null,
            snapshot: new DiaryEntrySnapshot(
                name: 'Lentejas con chorizo',
                emoji: '🍲',
                macros: MacroBreakdown::zero(),
            ),
            createdByUserId: 'god-user-id',
            dateTimeGenerator: new DateTimeGenerator(),
        );
    }

    private function givenMessageBus(): MessageBusInterface
    {
        return new class implements MessageBusInterface {
            /** @var array<int, ConsumeDiaryEntryCommand> */
            public array $dispatched = [];

            public function dispatch(object $message, array $stamps = []): Envelope
            {
                $this->dispatched[] = $message;

                return new Envelope(message: $message);
            }
        };
    }
}
