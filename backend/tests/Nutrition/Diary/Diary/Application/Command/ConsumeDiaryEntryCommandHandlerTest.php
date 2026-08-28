<?php

namespace App\Tests\Nutrition\Diary\Diary\Application\Command;

use Nutrition\Diary\Diary\Application\Command\ConsumeDiaryEntryCommand;
use Nutrition\Diary\Diary\Application\Command\ConsumeDiaryEntryCommandHandler;
use Nutrition\Diary\Diary\Domain\Event\DiaryEntryConsumed;
use Nutrition\Diary\Diary\Domain\Exception\UpdateDiaryEntryException;
use Nutrition\Diary\Diary\Domain\Model\DiaryEntry;
use Nutrition\Diary\Diary\Domain\Model\DiaryEntrySnapshot;
use Nutrition\Diary\Diary\Infrastructure\Domain\Model\InMemory\InMemoryDiaryEntryRepository;
use Nutrition\Recipe\Recipe\Domain\QueryModel\Dto\MacroBreakdown;
use PHPUnit\Framework\TestCase;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final class ConsumeDiaryEntryCommandHandlerTest extends TestCase
{
    private InMemoryDiaryEntryRepository $diaryEntryRepository;
    private DomainEventCollectorService $domainEventCollectorService;
    private ConsumeDiaryEntryCommandHandler $handler;

    protected function setUp(): void
    {
        $dateTimeGenerator = new DateTimeGenerator();
        $this->diaryEntryRepository = new InMemoryDiaryEntryRepository();
        $this->domainEventCollectorService = new DomainEventCollectorService();
        $this->handler = new ConsumeDiaryEntryCommandHandler(
            diaryEntryRepository: $this->diaryEntryRepository,
            domainEventCollectorService: $this->domainEventCollectorService,
            dateTimeGenerator: $dateTimeGenerator,
        );

        $this->diaryEntryRepository->save(diaryEntry: DiaryEntry::create(
            id: 'entry-1',
            entryDate: '2026-08-26',
            meal: DiaryEntry::MEAL_DINNER,
            kind: DiaryEntry::KIND_RECIPE,
            refId: 'recipe-1',
            quantity: 2.0,
            unit: null,
            snapshot: new DiaryEntrySnapshot(
                name: 'Lentejas con chorizo',
                emoji: '🍲',
                macros: MacroBreakdown::zero(),
            ),
            createdByUserId: 'god-user-id',
            dateTimeGenerator: $dateTimeGenerator,
        ));
        $this->domainEventCollectorService->reset();
    }

    public function testItMarksTheEntryAsEatenAndSaysSoInTheEvent(): void
    {
        ($this->handler)(new ConsumeDiaryEntryCommand(
            entryId: 'entry-1',
            consumed: true,
            updatedByUserId: 'god-user-id',
        ));

        $entry = $this->diaryEntryRepository->findById(id: 'entry-1');

        $this->assertTrue(condition: $entry->consumed);

        $event = $this->firstEventOf(class: DiaryEntryConsumed::class);

        $this->assertNotNull(actual: $event);
        $this->assertTrue(condition: $event->consumed);
        $this->assertSame(expected: 'recipe-1', actual: $event->refId);
        $this->assertSame(expected: 2.0, actual: $event->quantity);
    }

    public function testUntickingGivesTheServingsBack(): void
    {
        ($this->handler)(new ConsumeDiaryEntryCommand(
            entryId: 'entry-1',
            consumed: true,
            updatedByUserId: 'god-user-id',
        ));
        $this->domainEventCollectorService->pullEvents();

        ($this->handler)(new ConsumeDiaryEntryCommand(
            entryId: 'entry-1',
            consumed: false,
            updatedByUserId: 'god-user-id',
        ));

        $this->assertFalse(condition: $this->diaryEntryRepository->findById(id: 'entry-1')->consumed);
        $this->assertFalse(condition: $this->firstEventOf(class: DiaryEntryConsumed::class)->consumed);
    }

    public function testTickingTwiceMovesTheBalanceOnlyOnce(): void
    {
        ($this->handler)(new ConsumeDiaryEntryCommand(
            entryId: 'entry-1',
            consumed: true,
            updatedByUserId: 'god-user-id',
        ));
        $this->domainEventCollectorService->pullEvents();

        ($this->handler)(new ConsumeDiaryEntryCommand(
            entryId: 'entry-1',
            consumed: true,
            updatedByUserId: 'god-user-id',
        ));

        $this->assertNull(actual: $this->firstEventOf(class: DiaryEntryConsumed::class));
    }

    public function testItThrowsWhenTheEntryDoesNotExist(): void
    {
        $this->expectException(exception: UpdateDiaryEntryException::class);

        ($this->handler)(new ConsumeDiaryEntryCommand(
            entryId: 'missing',
            consumed: true,
            updatedByUserId: 'god-user-id',
        ));
    }

    private function firstEventOf(string $class): ?object
    {
        $found = null;

        foreach ($this->domainEventCollectorService->pullEvents() as $event) {
            if ($event instanceof $class) {
                $found = $event;
            }
        }

        return $found;
    }
}
