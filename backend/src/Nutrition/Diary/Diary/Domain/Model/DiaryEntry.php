<?php

namespace Nutrition\Diary\Diary\Domain\Model;

use Integration\Mcp\Server\Domain\Model\GenericAggregate;
use Nutrition\Diary\Diary\Domain\Event\DiaryEntryCreated;
use Nutrition\Diary\Diary\Domain\Event\DiaryEntryDeleted;
use Nutrition\Diary\Diary\Domain\Event\DiaryEntryMacrosRecalculated;
use Nutrition\Diary\Diary\Domain\Event\DiaryEntryQuantityUpdated;
use Nutrition\Diary\Diary\Domain\Exception\CreateDiaryEntryException;
use Nutrition\Diary\Diary\Domain\Exception\UpdateDiaryEntryException;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

class DiaryEntry extends GenericAggregate
{
    public const KIND_PRODUCT = 'product';
    public const KIND_RECIPE = 'recipe';

    public const MEAL_BREAKFAST = 'breakfast';
    public const MEAL_LUNCH = 'lunch';
    public const MEAL_DINNER = 'dinner';
    public const MEAL_SNACK = 'snack';

    /** @var array<int, string> */
    public const MEALS = [
        self::MEAL_BREAKFAST,
        self::MEAL_LUNCH,
        self::MEAL_DINNER,
        self::MEAL_SNACK,
    ];

    /** @var array<int, string> */
    public const KINDS = [
        self::KIND_PRODUCT,
        self::KIND_RECIPE,
    ];

    public string $entryDate;
    public string $meal;
    public string $kind;
    public string $refId;
    public float $quantity;
    public string $nameSnapshot = '';
    public string $emojiSnapshot = '';
    public float $caloriesSnapshot = 0.0;
    public float $proteinSnapshot = 0.0;
    public float $fatSnapshot = 0.0;
    public float $carbsSnapshot = 0.0;

    public static function create(
        string $id,
        string $entryDate,
        string $meal,
        string $kind,
        string $refId,
        float $quantity,
        DiaryEntrySnapshot $snapshot,
        string $createdByUserId,
        DateTimeGenerator $dateTimeGenerator,
    ): self {
        if (!self::hasValidDate(entryDate: $entryDate)) {
            throw CreateDiaryEntryException::invalidDate(entryDate: $entryDate);
        }

        if (!in_array(needle: $meal, haystack: self::MEALS, strict: true)) {
            throw CreateDiaryEntryException::invalidMeal(meal: $meal);
        }

        if (!in_array(needle: $kind, haystack: self::KINDS, strict: true)) {
            throw CreateDiaryEntryException::invalidKind(kind: $kind);
        }

        if (!self::hasValidQuantity(quantity: $quantity)) {
            throw CreateDiaryEntryException::quantityMustBePositive();
        }

        $now = $dateTimeGenerator->now();

        $entry = new self();
        $entry->id = $id;
        $entry->entryDate = $entryDate;
        $entry->meal = $meal;
        $entry->kind = $kind;
        $entry->refId = $refId;
        $entry->quantity = $quantity;
        $entry->writeSnapshot(snapshot: $snapshot);
        $entry->stampCreation(userId: $createdByUserId, now: $now);

        $entry->record(event: new DiaryEntryCreated(
            aggregateId: $id,
            occurredOn: $now,
            entryDate: $entryDate,
            meal: $meal,
            kind: $kind,
            refId: $refId,
            quantity: $quantity,
            name: $snapshot->name,
            emoji: $snapshot->emoji,
            calories: $snapshot->macros->calories,
            protein: $snapshot->macros->protein,
            fat: $snapshot->macros->fat,
            carbs: $snapshot->macros->carbs,
            createdByUserId: $createdByUserId,
        ));

        return $entry;
    }

    public function updateQuantity(
        float $quantity,
        DiaryEntrySnapshot $snapshot,
        string $updatedByUserId,
        DateTimeGenerator $dateTimeGenerator,
    ): void {
        if (!self::hasValidQuantity(quantity: $quantity)) {
            throw UpdateDiaryEntryException::quantityMustBePositive();
        }

        $now = $dateTimeGenerator->now();

        $this->quantity = $quantity;
        $this->writeSnapshot(snapshot: $snapshot);
        $this->stampUpdate(userId: $updatedByUserId, now: $now);

        $this->record(event: new DiaryEntryQuantityUpdated(
            aggregateId: $this->id,
            occurredOn: $now,
            quantity: $quantity,
            name: $snapshot->name,
            emoji: $snapshot->emoji,
            calories: $snapshot->macros->calories,
            protein: $snapshot->macros->protein,
            fat: $snapshot->macros->fat,
            carbs: $snapshot->macros->carbs,
        ));
    }

    public function applySnapshot(
        DiaryEntrySnapshot $snapshot,
        string $updatedByUserId,
        DateTimeGenerator $dateTimeGenerator,
    ): void {
        $now = $dateTimeGenerator->now();

        $this->writeSnapshot(snapshot: $snapshot);
        $this->stampUpdate(userId: $updatedByUserId, now: $now);

        $this->record(event: new DiaryEntryMacrosRecalculated(
            aggregateId: $this->id,
            occurredOn: $now,
            entryDate: $this->entryDate,
            meal: $this->meal,
            kind: $this->kind,
            refId: $this->refId,
            quantity: $this->quantity,
            name: $snapshot->name,
            emoji: $snapshot->emoji,
            calories: $snapshot->macros->calories,
            protein: $snapshot->macros->protein,
            fat: $snapshot->macros->fat,
            carbs: $snapshot->macros->carbs,
        ));
    }

    public function matchesSnapshot(DiaryEntrySnapshot $snapshot): bool
    {
        return $this->nameSnapshot === $snapshot->name
            && $this->emojiSnapshot === $snapshot->emoji
            && $this->isClose(a: $this->caloriesSnapshot, b: $snapshot->macros->calories)
            && $this->isClose(a: $this->proteinSnapshot, b: $snapshot->macros->protein)
            && $this->isClose(a: $this->fatSnapshot, b: $snapshot->macros->fat)
            && $this->isClose(a: $this->carbsSnapshot, b: $snapshot->macros->carbs);
    }

    public function delete(
        string $deletedByUserId,
        DateTimeGenerator $dateTimeGenerator,
    ): void {
        $now = $dateTimeGenerator->now();
        $this->stampUpdate(userId: $deletedByUserId, now: $now);

        $this->record(event: new DiaryEntryDeleted(
            aggregateId: $this->id,
            occurredOn: $now,
        ));
    }

    private function writeSnapshot(DiaryEntrySnapshot $snapshot): void
    {
        $this->nameSnapshot = $snapshot->name;
        $this->emojiSnapshot = $snapshot->emoji;
        $this->caloriesSnapshot = $snapshot->macros->calories;
        $this->proteinSnapshot = $snapshot->macros->protein;
        $this->fatSnapshot = $snapshot->macros->fat;
        $this->carbsSnapshot = $snapshot->macros->carbs;
    }

    private static function hasValidDate(string $entryDate): bool
    {
        return 1 === preg_match(pattern: '/^\d{4}-\d{2}-\d{2}$/', subject: $entryDate);
    }

    private static function hasValidQuantity(float $quantity): bool
    {
        return $quantity > 0;
    }

    private function isClose(float $a, float $b): bool
    {
        return abs($a - $b) < 0.0001;
    }
}
