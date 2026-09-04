<?php

namespace App\Tests\Nutrition\Diary\Diary\Domain\Model;

use Nutrition\Diary\Diary\Domain\Event\DiaryEntryDeleted;
use Nutrition\Diary\Diary\Domain\Model\DiaryEntry;
use Nutrition\Diary\Diary\Domain\Model\DiaryEntryNode;
use Nutrition\Diary\Diary\Domain\Model\DiaryEntrySnapshot;
use Nutrition\Recipe\Recipe\Domain\QueryModel\Dto\MacroBreakdown;
use PHPUnit\Framework\TestCase;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final class DiaryEntryEventHydrationTest extends TestCase
{
    private DateTimeGenerator $dateTimeGenerator;

    protected function setUp(): void
    {
        $this->dateTimeGenerator = new DateTimeGenerator();
    }

    public function testDeletedCarriesTheWholeEntrySoItCanBeRebuilt(): void
    {
        $entry = $this->entry();
        $entry->pullDomainEvents();

        $entry->delete(deletedByUserId: 'another-user-id', dateTimeGenerator: $this->dateTimeGenerator);

        /** @var DiaryEntryDeleted $event */
        $event = $entry->pullDomainEvents()[0];

        $this->assertInstanceOf(expected: DiaryEntryDeleted::class, actual: $event);
        $this->assertSame(expected: 'entry-1', actual: $event->aggregateId);
        $this->assertSame(expected: '2026-08-26', actual: $event->entryDate);
        $this->assertSame(expected: DiaryEntry::MEAL_DINNER, actual: $event->meal);
        $this->assertSame(expected: DiaryEntry::KIND_RECIPE, actual: $event->kind);
        $this->assertSame(expected: 'recipe-1', actual: $event->refId);
        $this->assertSame(expected: 2.0, actual: $event->quantity);
        $this->assertSame(expected: 'Lentejas con chorizo', actual: $event->name);
        $this->assertSame(expected: 420.0, actual: $event->calories);
        $this->assertSame(expected: 'god-user-id', actual: $event->createdByUserId);
        $this->assertSame(expected: 'another-user-id', actual: $event->deletedByUserId);
    }

    public function testDeletedCarriesTheBreakdownOfTheEntry(): void
    {
        $entry = $this->entry();
        $entry->pullDomainEvents();

        $entry->delete(deletedByUserId: 'god-user-id', dateTimeGenerator: $this->dateTimeGenerator);

        /** @var DiaryEntryDeleted $event */
        $event = $entry->pullDomainEvents()[0];

        $this->assertCount(expectedCount: 1, haystack: $event->tree);
        $this->assertSame(expected: 'entry-1#1', actual: $event->tree[0]['id']);
        $this->assertSame(expected: 'entry-1', actual: $event->tree[0]['diaryEntryId']);
        $this->assertSame(expected: 'article-1', actual: $event->tree[0]['refId']);
        $this->assertSame(expected: 250.0, actual: $event->tree[0]['quantity']);
        $this->assertSame(expected: 'Lentejas', actual: $event->tree[0]['nameSnapshot']);
        $this->assertSame(expected: 'god-user-id', actual: $event->tree[0]['createdByUserId']);
        $this->assertArrayHasKey(key: 'createdAt', array: $event->tree[0]);
    }

    private function entry(): DiaryEntry
    {
        return DiaryEntry::create(
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
                macros: new MacroBreakdown(calories: 420.0, protein: 22.0, fat: 14.0, carbs: 48.0),
            ),
            createdByUserId: 'god-user-id',
            dateTimeGenerator: $this->dateTimeGenerator,
            nodes: [
                DiaryEntryNode::create(
                    diaryEntryId: 'entry-1',
                    parentPath: null,
                    kind: DiaryEntryNode::KIND_PRODUCT,
                    refId: 'article-1',
                    quantity: 250.0,
                    unit: 'g',
                    position: 1,
                    snapshot: new DiaryEntrySnapshot(
                        name: 'Lentejas',
                        emoji: '🫘',
                        macros: new MacroBreakdown(calories: 310.0, protein: 20.0, fat: 2.0, carbs: 50.0),
                    ),
                    createdByUserId: 'god-user-id',
                    dateTimeGenerator: $this->dateTimeGenerator,
                ),
            ],
        );
    }
}
