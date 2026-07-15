<?php

namespace App\Tests\Nutrition\Diary\Diary\Application\Command;

use Nutrition\Diary\Diary\Application\Command\CreateDiaryEntryCommand;
use Nutrition\Diary\Diary\Application\Command\CreateDiaryEntryCommandHandler;
use Nutrition\Diary\Diary\Domain\Exception\CreateDiaryEntryException;
use Nutrition\Diary\Diary\Domain\Model\DiaryEntry;
use Nutrition\Diary\Diary\Infrastructure\Domain\Model\InMemory\InMemoryDiaryEntryRepository;
use PHPUnit\Framework\TestCase;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final class CreateDiaryEntryCommandHandlerTest extends TestCase
{
    private InMemoryDiaryEntryRepository $repository;
    private CreateDiaryEntryCommandHandler $handler;

    protected function setUp(): void
    {
        $this->repository = new InMemoryDiaryEntryRepository();
        $this->handler = new CreateDiaryEntryCommandHandler(
            diaryEntryRepository: $this->repository,
            domainEventCollectorService: new DomainEventCollectorService(),
            dateTimeGenerator: new DateTimeGenerator(),
        );
    }

    public function testItCreatesDiaryEntry(): void
    {
        ($this->handler)(new CreateDiaryEntryCommand(
            entryDate: '2026-07-15',
            meal: DiaryEntry::MEAL_BREAKFAST,
            kind: DiaryEntry::KIND_PRODUCT,
            refId: 'article-1',
            quantity: 120.0,
            createdByUserId: 'god-user-id',
        ));

        $entry = $this->repository->findById(id: 'diary-entry-1');

        $this->assertNotNull(actual: $entry);
        $this->assertSame(expected: '2026-07-15', actual: $entry->entryDate);
        $this->assertSame(expected: DiaryEntry::MEAL_BREAKFAST, actual: $entry->meal);
        $this->assertSame(expected: 120.0, actual: $entry->quantity);
    }

    public function testItThrowsWhenMealIsInvalid(): void
    {
        $this->expectException(exception: CreateDiaryEntryException::class);

        ($this->handler)(new CreateDiaryEntryCommand(
            entryDate: '2026-07-15',
            meal: 'brunch',
            kind: DiaryEntry::KIND_PRODUCT,
            refId: 'article-1',
            quantity: 120.0,
            createdByUserId: 'god-user-id',
        ));
    }

    public function testItThrowsWhenKindIsInvalid(): void
    {
        $this->expectException(exception: CreateDiaryEntryException::class);

        ($this->handler)(new CreateDiaryEntryCommand(
            entryDate: '2026-07-15',
            meal: DiaryEntry::MEAL_LUNCH,
            kind: 'ingredient',
            refId: 'article-1',
            quantity: 120.0,
            createdByUserId: 'god-user-id',
        ));
    }

    public function testItThrowsWhenQuantityIsNotPositive(): void
    {
        $this->expectException(exception: CreateDiaryEntryException::class);

        ($this->handler)(new CreateDiaryEntryCommand(
            entryDate: '2026-07-15',
            meal: DiaryEntry::MEAL_LUNCH,
            kind: DiaryEntry::KIND_PRODUCT,
            refId: 'article-1',
            quantity: 0.0,
            createdByUserId: 'god-user-id',
        ));
    }

    public function testItThrowsWhenDateIsInvalid(): void
    {
        $this->expectException(exception: CreateDiaryEntryException::class);

        ($this->handler)(new CreateDiaryEntryCommand(
            entryDate: '15-07-2026',
            meal: DiaryEntry::MEAL_LUNCH,
            kind: DiaryEntry::KIND_PRODUCT,
            refId: 'article-1',
            quantity: 120.0,
            createdByUserId: 'god-user-id',
        ));
    }
}
