<?php

namespace App\Tests\Nutrition\Diary\Diary\Application\Command;

use Nutrition\Diary\Diary\Application\Command\CreateDiaryEntryCommand;
use Nutrition\Diary\Diary\Application\Command\CreateDiaryEntryCommandHandler;
use Nutrition\Diary\Diary\Application\Command\DeleteDiaryEntryCommand;
use Nutrition\Diary\Diary\Application\Command\DeleteDiaryEntryCommandHandler;
use Nutrition\Diary\Diary\Domain\Exception\DeleteDiaryEntryException;
use Nutrition\Diary\Diary\Domain\Model\DiaryEntry;
use Nutrition\Diary\Diary\Infrastructure\Domain\Model\InMemory\InMemoryDiaryEntryRepository;
use PHPUnit\Framework\TestCase;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final class DeleteDiaryEntryCommandHandlerTest extends TestCase
{
    private InMemoryDiaryEntryRepository $repository;
    private DeleteDiaryEntryCommandHandler $handler;

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
            meal: DiaryEntry::MEAL_DINNER,
            kind: DiaryEntry::KIND_RECIPE,
            refId: 'recipe-1',
            quantity: 1.0,
            createdByUserId: 'god-user-id',
        ));

        $this->handler = new DeleteDiaryEntryCommandHandler(
            diaryEntryRepository: $this->repository,
            domainEventCollectorService: $domainEventCollectorService,
            dateTimeGenerator: $dateTimeGenerator,
        );
    }

    public function testItDeletesDiaryEntry(): void
    {
        ($this->handler)(new DeleteDiaryEntryCommand(
            diaryEntryId: 'diary-entry-1',
            deletedByUserId: 'god-user-id',
        ));

        $this->assertNull(actual: $this->repository->findById(id: 'diary-entry-1'));
    }

    public function testItThrowsWhenDiaryEntryNotFound(): void
    {
        $this->expectException(exception: DeleteDiaryEntryException::class);

        ($this->handler)(new DeleteDiaryEntryCommand(
            diaryEntryId: 'missing-id',
            deletedByUserId: 'god-user-id',
        ));
    }
}
