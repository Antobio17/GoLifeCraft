<?php

namespace App\Tests\Nutrition\Diary\Diary\Application\Command;

use Nutrition\Diary\Diary\Application\Command\CreateDiaryEntryCommand;
use Nutrition\Diary\Diary\Application\Command\CreateDiaryEntryCommandHandler;
use Nutrition\Diary\Diary\Application\Command\UpdateDiaryEntryQuantityCommand;
use Nutrition\Diary\Diary\Application\Command\UpdateDiaryEntryQuantityCommandHandler;
use Nutrition\Diary\Diary\Domain\Exception\UpdateDiaryEntryException;
use Nutrition\Diary\Diary\Domain\Model\DiaryEntry;
use Nutrition\Diary\Diary\Infrastructure\Domain\Model\InMemory\InMemoryDiaryEntryRepository;
use PHPUnit\Framework\TestCase;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final class UpdateDiaryEntryQuantityCommandHandlerTest extends TestCase
{
    private InMemoryDiaryEntryRepository $repository;
    private UpdateDiaryEntryQuantityCommandHandler $handler;

    protected function setUp(): void
    {
        $dateTimeGenerator = new DateTimeGenerator();
        $domainEventCollectorService = new DomainEventCollectorService();
        $this->repository = new InMemoryDiaryEntryRepository();

        $createHandler = new CreateDiaryEntryCommandHandler(
            diaryEntryRepository: $this->repository,
            domainEventCollectorService: $domainEventCollectorService,
            dateTimeGenerator: $dateTimeGenerator,
        );
        ($createHandler)(new CreateDiaryEntryCommand(
            entryDate: '2026-07-15',
            meal: DiaryEntry::MEAL_SNACK,
            kind: DiaryEntry::KIND_PRODUCT,
            refId: 'article-1',
            quantity: 30.0,
            createdByUserId: 'god-user-id',
        ));

        $this->handler = new UpdateDiaryEntryQuantityCommandHandler(
            diaryEntryRepository: $this->repository,
            domainEventCollectorService: $domainEventCollectorService,
            dateTimeGenerator: $dateTimeGenerator,
        );
    }

    public function testItUpdatesQuantity(): void
    {
        ($this->handler)(new UpdateDiaryEntryQuantityCommand(
            diaryEntryId: 'diary-entry-1',
            quantity: 55.0,
            updatedByUserId: 'god-user-id',
        ));

        $this->assertSame(expected: 55.0, actual: $this->repository->findById(id: 'diary-entry-1')->quantity);
    }

    public function testItThrowsWhenQuantityIsNotPositive(): void
    {
        $this->expectException(exception: UpdateDiaryEntryException::class);

        ($this->handler)(new UpdateDiaryEntryQuantityCommand(
            diaryEntryId: 'diary-entry-1',
            quantity: -5.0,
            updatedByUserId: 'god-user-id',
        ));
    }

    public function testItThrowsWhenDiaryEntryNotFound(): void
    {
        $this->expectException(exception: UpdateDiaryEntryException::class);

        ($this->handler)(new UpdateDiaryEntryQuantityCommand(
            diaryEntryId: 'missing-id',
            quantity: 55.0,
            updatedByUserId: 'god-user-id',
        ));
    }
}
