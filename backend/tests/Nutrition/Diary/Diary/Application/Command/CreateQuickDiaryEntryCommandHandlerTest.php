<?php

namespace App\Tests\Nutrition\Diary\Diary\Application\Command;

use Nutrition\Diary\Diary\Application\Command\CreateQuickDiaryEntryCommand;
use Nutrition\Diary\Diary\Application\Command\CreateQuickDiaryEntryCommandHandler;
use Nutrition\Diary\Diary\Domain\Exception\CreateDiaryEntryException;
use Nutrition\Diary\Diary\Domain\Model\DiaryEntry;
use Nutrition\Diary\Diary\Infrastructure\Domain\Model\InMemory\InMemoryDiaryEntryRepository;
use PHPUnit\Framework\TestCase;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final class CreateQuickDiaryEntryCommandHandlerTest extends TestCase
{
    private InMemoryDiaryEntryRepository $repository;
    private CreateQuickDiaryEntryCommandHandler $handler;

    protected function setUp(): void
    {
        $this->repository = new InMemoryDiaryEntryRepository();
        $this->handler = new CreateQuickDiaryEntryCommandHandler(
            diaryEntryRepository: $this->repository,
            domainEventCollectorService: new DomainEventCollectorService(),
            dateTimeGenerator: new DateTimeGenerator(),
        );
    }

    public function testItCreatesQuickEntryWithSnapshotScaledByQuantity(): void
    {
        ($this->handler)($this->command(quantity: 2.0));

        $entry = $this->repository->findById(id: 'diary-entry-1');

        $this->assertNotNull(actual: $entry);
        $this->assertSame(expected: DiaryEntry::KIND_QUICK, actual: $entry->kind);
        $this->assertNull(actual: $entry->refId);
        $this->assertSame(expected: 'Café con leche', actual: $entry->quickName);
        $this->assertSame(expected: 120.0, actual: $entry->quickCalories);
        $this->assertSame(expected: 'Café con leche', actual: $entry->nameSnapshot);
        $this->assertSame(expected: '☕', actual: $entry->emojiSnapshot);
        $this->assertSame(expected: 240.0, actual: $entry->caloriesSnapshot);
        $this->assertSame(expected: 12.0, actual: $entry->proteinSnapshot);
    }

    public function testItThrowsWhenNameIsBlank(): void
    {
        $this->expectException(exception: CreateDiaryEntryException::class);

        ($this->handler)($this->command(name: '   '));
    }

    public function testItThrowsWhenCaloriesAreNotPositive(): void
    {
        $this->expectException(exception: CreateDiaryEntryException::class);

        ($this->handler)($this->command(calories: 0.0));
    }

    public function testItThrowsWhenMealIsInvalid(): void
    {
        $this->expectException(exception: CreateDiaryEntryException::class);

        ($this->handler)($this->command(meal: 'brunch'));
    }

    private function command(
        string $meal = DiaryEntry::MEAL_BREAKFAST,
        float $quantity = 1.0,
        string $name = 'Café con leche',
        string $emoji = '☕',
        float $calories = 120.0,
    ): CreateQuickDiaryEntryCommand {
        return new CreateQuickDiaryEntryCommand(
            entryDate: '2026-07-15',
            meal: $meal,
            quantity: $quantity,
            name: $name,
            emoji: $emoji,
            calories: $calories,
            protein: 6.0,
            fat: 4.0,
            carbs: 10.0,
            createdByUserId: 'god-user-id',
        );
    }
}
