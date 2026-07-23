<?php

namespace Nutrition\Diary\Diary\Domain\Model;

use Integration\Mcp\Server\Domain\Model\GenericAggregate;
use Nutrition\Diary\Diary\Domain\Event\DiaryEntryCreated;
use Nutrition\Diary\Diary\Domain\Event\DiaryEntryDeleted;
use Nutrition\Diary\Diary\Domain\Event\DiaryEntryMacrosRecalculated;
use Nutrition\Diary\Diary\Domain\Event\DiaryEntryQuantityUpdated;
use Nutrition\Diary\Diary\Domain\Event\DiaryEntryQuickUpdated;
use Nutrition\Diary\Diary\Domain\Exception\CreateDiaryEntryException;
use Nutrition\Diary\Diary\Domain\Exception\UpdateDiaryEntryException;
use Nutrition\Recipe\Recipe\Domain\QueryModel\Dto\MacroBreakdown;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

class DiaryEntry extends GenericAggregate
{
    public const KIND_PRODUCT = 'product';
    public const KIND_RECIPE = 'recipe';
    public const KIND_QUICK = 'quick';

    public const QUICK_DEFAULT_EMOJI = '✏️';

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
        self::KIND_QUICK,
    ];

    /** @var array<int, string> */
    public const REFERENCE_KINDS = [
        self::KIND_PRODUCT,
        self::KIND_RECIPE,
    ];

    public string $entryDate;
    public string $meal;
    public string $kind;
    public ?string $refId = null;
    public float $quantity;
    public string $nameSnapshot = '';
    public string $emojiSnapshot = '';
    public float $caloriesSnapshot = 0.0;
    public float $proteinSnapshot = 0.0;
    public float $fatSnapshot = 0.0;
    public float $carbsSnapshot = 0.0;
    public string $quickName = '';
    public string $quickEmoji = '';
    public float $quickCalories = 0.0;
    public float $quickProtein = 0.0;
    public float $quickFat = 0.0;
    public float $quickCarbs = 0.0;

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

        if (!in_array(needle: $kind, haystack: self::REFERENCE_KINDS, strict: true)) {
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

    public static function createQuick(
        string $id,
        string $entryDate,
        string $meal,
        float $quantity,
        QuickEntryDefinition $definition,
        string $createdByUserId,
        DateTimeGenerator $dateTimeGenerator,
    ): self {
        if (!self::hasValidDate(entryDate: $entryDate)) {
            throw CreateDiaryEntryException::invalidDate(entryDate: $entryDate);
        }

        if (!in_array(needle: $meal, haystack: self::MEALS, strict: true)) {
            throw CreateDiaryEntryException::invalidMeal(meal: $meal);
        }

        if (!self::hasValidQuantity(quantity: $quantity)) {
            throw CreateDiaryEntryException::quantityMustBePositive();
        }

        if (!self::hasValidQuickName(definition: $definition)) {
            throw CreateDiaryEntryException::quickNameIsRequired();
        }

        if (!self::hasValidQuickCalories(definition: $definition)) {
            throw CreateDiaryEntryException::quickCaloriesMustBePositive();
        }

        $now = $dateTimeGenerator->now();
        $snapshot = self::snapshotFromDefinition(definition: $definition, quantity: $quantity);

        $entry = new self();
        $entry->id = $id;
        $entry->entryDate = $entryDate;
        $entry->meal = $meal;
        $entry->kind = self::KIND_QUICK;
        $entry->refId = null;
        $entry->quantity = $quantity;
        $entry->writeQuickDefinition(definition: $definition);
        $entry->writeSnapshot(snapshot: $snapshot);
        $entry->stampCreation(userId: $createdByUserId, now: $now);

        $entry->record(event: new DiaryEntryCreated(
            aggregateId: $id,
            occurredOn: $now,
            entryDate: $entryDate,
            meal: $meal,
            kind: self::KIND_QUICK,
            refId: null,
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

    public function updateQuick(
        float $quantity,
        QuickEntryDefinition $definition,
        string $updatedByUserId,
        DateTimeGenerator $dateTimeGenerator,
    ): void {
        if (!$this->isQuick()) {
            throw UpdateDiaryEntryException::notAQuickEntry(diaryEntryId: $this->id);
        }

        if (!self::hasValidQuantity(quantity: $quantity)) {
            throw UpdateDiaryEntryException::quantityMustBePositive();
        }

        if (!self::hasValidQuickName(definition: $definition)) {
            throw UpdateDiaryEntryException::quickNameIsRequired();
        }

        if (!self::hasValidQuickCalories(definition: $definition)) {
            throw UpdateDiaryEntryException::quickCaloriesMustBePositive();
        }

        $now = $dateTimeGenerator->now();
        $snapshot = self::snapshotFromDefinition(definition: $definition, quantity: $quantity);

        $this->quantity = $quantity;
        $this->writeQuickDefinition(definition: $definition);
        $this->writeSnapshot(snapshot: $snapshot);
        $this->stampUpdate(userId: $updatedByUserId, now: $now);

        $this->record(event: new DiaryEntryQuickUpdated(
            aggregateId: $this->id,
            occurredOn: $now,
            entryDate: $this->entryDate,
            meal: $this->meal,
            quantity: $quantity,
            quickName: $definition->name,
            quickEmoji: $definition->emoji,
            quickCalories: $definition->perUnit->calories,
            quickProtein: $definition->perUnit->protein,
            quickFat: $definition->perUnit->fat,
            quickCarbs: $definition->perUnit->carbs,
            name: $snapshot->name,
            emoji: $snapshot->emoji,
            calories: $snapshot->macros->calories,
            protein: $snapshot->macros->protein,
            fat: $snapshot->macros->fat,
            carbs: $snapshot->macros->carbs,
            updatedByUserId: $updatedByUserId,
        ));
    }

    public function isQuick(): bool
    {
        return self::KIND_QUICK === $this->kind;
    }

    public function quickSnapshot(float $quantity): DiaryEntrySnapshot
    {
        return self::snapshotFromDefinition(definition: $this->quickDefinition(), quantity: $quantity);
    }

    public function quickDefinition(): QuickEntryDefinition
    {
        return new QuickEntryDefinition(
            name: $this->quickName,
            emoji: $this->quickEmoji,
            perUnit: new MacroBreakdown(
                calories: $this->quickCalories,
                protein: $this->quickProtein,
                fat: $this->quickFat,
                carbs: $this->quickCarbs,
            ),
        );
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

    private function writeQuickDefinition(QuickEntryDefinition $definition): void
    {
        $this->quickName = $definition->name;
        $this->quickEmoji = $definition->emoji;
        $this->quickCalories = $definition->perUnit->calories;
        $this->quickProtein = $definition->perUnit->protein;
        $this->quickFat = $definition->perUnit->fat;
        $this->quickCarbs = $definition->perUnit->carbs;
    }

    private static function snapshotFromDefinition(QuickEntryDefinition $definition, float $quantity): DiaryEntrySnapshot
    {
        return new DiaryEntrySnapshot(
            name: $definition->name,
            emoji: '' !== $definition->emoji ? $definition->emoji : self::QUICK_DEFAULT_EMOJI,
            macros: $definition->perUnit->scale(factor: $quantity),
        );
    }

    private static function hasValidQuickName(QuickEntryDefinition $definition): bool
    {
        return '' !== trim(string: $definition->name);
    }

    private static function hasValidQuickCalories(QuickEntryDefinition $definition): bool
    {
        return $definition->perUnit->calories > 0;
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
