<?php

namespace Nutrition\Diary\Diary\Domain\Model;

use Integration\Mcp\Server\Domain\Model\GenericAggregate;
use Nutrition\Diary\Diary\Domain\Event\DiaryEntryConsumed;
use Nutrition\Diary\Diary\Domain\Event\DiaryEntryCreated;
use Nutrition\Diary\Diary\Domain\Event\DiaryEntryDeleted;
use Nutrition\Diary\Diary\Domain\Event\DiaryEntryLotAssigned;
use Nutrition\Diary\Diary\Domain\Event\DiaryEntryMacrosRecalculated;
use Nutrition\Diary\Diary\Domain\Event\DiaryEntryQuantityUpdated;
use Nutrition\Diary\Diary\Domain\Event\DiaryEntryQuickUpdated;
use Nutrition\Diary\Diary\Domain\Event\DiaryEntryTreeAdjusted;
use Nutrition\Diary\Diary\Domain\Exception\CreateDiaryEntryException;
use Nutrition\Diary\Diary\Domain\Exception\UpdateDiaryEntryException;
use Nutrition\Recipe\Recipe\Domain\QueryModel\Dto\MacroBreakdown;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

class DiaryEntry extends GenericAggregate
{
    public const KIND_PRODUCT = 'product';

    public const KIND_RECIPE = 'recipe';

    public const KIND_QUICK = 'quick';

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

    public ?string $productionItemId = null;

    public float $quantity;

    public ?string $unit = null;

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

    public bool $customized = false;

    public bool $consumed = false;

    /** @var DiaryEntryNode[] */
    public array $nodes = [];

    /** @param DiaryEntryNode[] $nodes */
    public static function create(
        string $id,
        string $entryDate,
        string $meal,
        string $kind,
        string $refId,
        float $quantity,
        ?string $unit,
        DiaryEntrySnapshot $snapshot,
        string $createdByUserId,
        DateTimeGenerator $dateTimeGenerator,
        array $nodes = [],
        bool $customized = false,
        ?string $productionItemId = null,
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
        $entry->unit = $unit;
        $entry->nodes = $nodes;
        $entry->customized = $customized;
        $entry->productionItemId = $productionItemId;
        $entry->writeSnapshot(snapshot: $snapshot);
        $entry->stampCreation(userId: $createdByUserId, now: $now);

        $entry->record(event: new DiaryEntryCreated(
            aggregateId: $id,
            occurredOn: $now,
            entryDate: $entry->entryDate,
            meal: $entry->meal,
            kind: $entry->kind,
            refId: $entry->refId,
            productionItemId: $entry->productionItemId,
            quantity: $entry->quantity,
            unit: $entry->unit,
            name: $entry->nameSnapshot,
            emoji: $entry->emojiSnapshot,
            calories: $entry->caloriesSnapshot,
            protein: $entry->proteinSnapshot,
            fat: $entry->fatSnapshot,
            carbs: $entry->carbsSnapshot,
            quickName: $entry->quickName,
            quickEmoji: $entry->quickEmoji,
            quickCalories: $entry->quickCalories,
            quickProtein: $entry->quickProtein,
            quickFat: $entry->quickFat,
            quickCarbs: $entry->quickCarbs,
            customized: $entry->customized,
            consumed: $entry->consumed,
            tree: $entry->treePayload(),
            createdAt: $entry->createdAt,
            updatedAt: $entry->updatedAt,
            createdByUserId: $entry->createdByUserId,
            updatedByUserId: $entry->updatedByUserId,
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
            entryDate: $entry->entryDate,
            meal: $entry->meal,
            kind: $entry->kind,
            refId: $entry->refId,
            productionItemId: $entry->productionItemId,
            quantity: $entry->quantity,
            unit: $entry->unit,
            name: $entry->nameSnapshot,
            emoji: $entry->emojiSnapshot,
            calories: $entry->caloriesSnapshot,
            protein: $entry->proteinSnapshot,
            fat: $entry->fatSnapshot,
            carbs: $entry->carbsSnapshot,
            quickName: $entry->quickName,
            quickEmoji: $entry->quickEmoji,
            quickCalories: $entry->quickCalories,
            quickProtein: $entry->quickProtein,
            quickFat: $entry->quickFat,
            quickCarbs: $entry->quickCarbs,
            customized: $entry->customized,
            consumed: $entry->consumed,
            tree: $entry->treePayload(),
            createdAt: $entry->createdAt,
            updatedAt: $entry->updatedAt,
            createdByUserId: $entry->createdByUserId,
            updatedByUserId: $entry->updatedByUserId,
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
            kind: $this->kind,
            refId: $this->refId,
            productionItemId: $this->productionItemId,
            quantity: $this->quantity,
            unit: $this->unit,
            name: $this->nameSnapshot,
            emoji: $this->emojiSnapshot,
            calories: $this->caloriesSnapshot,
            protein: $this->proteinSnapshot,
            fat: $this->fatSnapshot,
            carbs: $this->carbsSnapshot,
            quickName: $this->quickName,
            quickEmoji: $this->quickEmoji,
            quickCalories: $this->quickCalories,
            quickProtein: $this->quickProtein,
            quickFat: $this->quickFat,
            quickCarbs: $this->quickCarbs,
            customized: $this->customized,
            consumed: $this->consumed,
            tree: $this->treePayload(),
            createdAt: $this->createdAt,
            updatedAt: $this->updatedAt,
            createdByUserId: $this->createdByUserId,
            updatedByUserId: $this->updatedByUserId,
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
        ?string $unit = null,
    ): void {
        if (!self::hasValidQuantity(quantity: $quantity)) {
            throw UpdateDiaryEntryException::quantityMustBePositive();
        }

        $now = $dateTimeGenerator->now();

        $this->quantity = $quantity;
        $this->unit = self::KIND_PRODUCT === $this->kind ? ($unit ?? $this->unit) : $this->unit;
        $this->writeSnapshot(snapshot: $snapshot);
        $this->stampUpdate(userId: $updatedByUserId, now: $now);

        $this->record(event: new DiaryEntryQuantityUpdated(
            aggregateId: $this->id,
            occurredOn: $now,
            entryDate: $this->entryDate,
            meal: $this->meal,
            kind: $this->kind,
            refId: $this->refId,
            productionItemId: $this->productionItemId,
            quantity: $this->quantity,
            unit: $this->unit,
            name: $this->nameSnapshot,
            emoji: $this->emojiSnapshot,
            calories: $this->caloriesSnapshot,
            protein: $this->proteinSnapshot,
            fat: $this->fatSnapshot,
            carbs: $this->carbsSnapshot,
            quickName: $this->quickName,
            quickEmoji: $this->quickEmoji,
            quickCalories: $this->quickCalories,
            quickProtein: $this->quickProtein,
            quickFat: $this->quickFat,
            quickCarbs: $this->quickCarbs,
            customized: $this->customized,
            consumed: $this->consumed,
            tree: $this->treePayload(),
            createdAt: $this->createdAt,
            updatedAt: $this->updatedAt,
            createdByUserId: $this->createdByUserId,
            updatedByUserId: $this->updatedByUserId,
        ));
    }

    public function consume(bool $consumed, string $updatedByUserId, DateTimeGenerator $dateTimeGenerator): void
    {
        if ($consumed === $this->consumed) {
            return;
        }

        $now = $dateTimeGenerator->now();

        $this->consumed = $consumed;
        $this->stampUpdate(userId: $updatedByUserId, now: $now);

        $this->record(event: new DiaryEntryConsumed(
            aggregateId: $this->id,
            occurredOn: $now,
            entryDate: $this->entryDate,
            meal: $this->meal,
            kind: $this->kind,
            refId: $this->refId,
            productionItemId: $this->productionItemId,
            quantity: $this->quantity,
            unit: $this->unit,
            name: $this->nameSnapshot,
            emoji: $this->emojiSnapshot,
            calories: $this->caloriesSnapshot,
            protein: $this->proteinSnapshot,
            fat: $this->fatSnapshot,
            carbs: $this->carbsSnapshot,
            quickName: $this->quickName,
            quickEmoji: $this->quickEmoji,
            quickCalories: $this->quickCalories,
            quickProtein: $this->quickProtein,
            quickFat: $this->quickFat,
            quickCarbs: $this->quickCarbs,
            customized: $this->customized,
            consumed: $this->consumed,
            tree: $this->treePayload(),
            createdAt: $this->createdAt,
            updatedAt: $this->updatedAt,
            createdByUserId: $this->createdByUserId,
            updatedByUserId: $this->updatedByUserId,
        ));
    }

    public function isRecipe(): bool
    {
        return self::KIND_RECIPE === $this->kind;
    }

    public function assignLot(
        ?string $productionItemId,
        DiaryEntrySnapshot $snapshot,
        string $updatedByUserId,
        DateTimeGenerator $dateTimeGenerator,
    ): void {
        if (!$this->isRecipe()) {
            throw UpdateDiaryEntryException::notARecipeEntry(diaryEntryId: $this->id);
        }

        $now = $dateTimeGenerator->now();

        if (null !== $productionItemId) {
            $this->releaseNodeLots(updatedByUserId: $updatedByUserId, dateTimeGenerator: $dateTimeGenerator);
        }

        $this->productionItemId = $productionItemId;
        $this->writeSnapshot(snapshot: $snapshot);
        $this->stampUpdate(userId: $updatedByUserId, now: $now);

        $this->record(event: new DiaryEntryLotAssigned(
            aggregateId: $this->id,
            occurredOn: $now,
            entryDate: $this->entryDate,
            meal: $this->meal,
            kind: $this->kind,
            refId: $this->refId,
            productionItemId: $this->productionItemId,
            quantity: $this->quantity,
            unit: $this->unit,
            name: $this->nameSnapshot,
            emoji: $this->emojiSnapshot,
            calories: $this->caloriesSnapshot,
            protein: $this->proteinSnapshot,
            fat: $this->fatSnapshot,
            carbs: $this->carbsSnapshot,
            quickName: $this->quickName,
            quickEmoji: $this->quickEmoji,
            quickCalories: $this->quickCalories,
            quickProtein: $this->quickProtein,
            quickFat: $this->quickFat,
            quickCarbs: $this->quickCarbs,
            customized: $this->customized,
            consumed: $this->consumed,
            tree: $this->treePayload(),
            createdAt: $this->createdAt,
            updatedAt: $this->updatedAt,
            createdByUserId: $this->createdByUserId,
            updatedByUserId: $this->updatedByUserId,
        ));
    }

    public function hasLot(): bool
    {
        return null !== $this->productionItemId;
    }

    /**
     * Nothing under the entry keeps a batch of its own: what the entry is served from already says
     * where every sub-recipe came from.
     */
    private function releaseNodeLots(string $updatedByUserId, DateTimeGenerator $dateTimeGenerator): void
    {
        foreach ($this->nodes as $node) {
            if (null === $node->productionItemId) {
                continue;
            }

            $node->assignLot(
                productionItemId: null,
                updatedByUserId: $updatedByUserId,
                dateTimeGenerator: $dateTimeGenerator,
            );
        }
    }

    public function hasTree(): bool
    {
        return [] !== $this->nodes;
    }

    /** @param DiaryEntryNode[] $nodes */
    public function replaceTree(array $nodes, bool $customized): void
    {
        $this->nodes = array_values(array: $nodes);
        $this->customized = $customized;
    }

    public function scaleTree(float $factor, string $updatedByUserId, DateTimeGenerator $dateTimeGenerator): void
    {
        foreach ($this->nodes as $node) {
            $node->scale(factor: $factor, updatedByUserId: $updatedByUserId, dateTimeGenerator: $dateTimeGenerator);
        }
    }

    public function adjustNode(
        string $nodeId,
        float $quantity,
        ?string $unit,
        string $updatedByUserId,
        DateTimeGenerator $dateTimeGenerator,
    ): void {
        if (!self::hasValidQuantity(quantity: $quantity)) {
            throw UpdateDiaryEntryException::quantityMustBePositive();
        }

        $node = $this->findNode(nodeId: $nodeId);
        if (null === $node) {
            throw UpdateDiaryEntryException::treeNodeNotFound(diaryEntryId: $this->id, nodeId: $nodeId);
        }

        $factor = $node->quantity > 0 ? $quantity / $node->quantity : 0.0;
        $node->adjust(quantity: $quantity, unit: $unit, updatedByUserId: $updatedByUserId, dateTimeGenerator: $dateTimeGenerator);

        if ($node->isRecipe() && $factor > 0) {
            $this->scaleDescendants(node: $node, factor: $factor, updatedByUserId: $updatedByUserId, dateTimeGenerator: $dateTimeGenerator);
        }

        $this->customized = true;
    }

    public function findNodeByPath(string $path): ?DiaryEntryNode
    {
        foreach ($this->nodes as $node) {
            if ($node->path === $path) {
                return $node;
            }
        }

        return null;
    }

    /**
     * Swaps everything hanging under a node, leaving the rest of the breakdown as the user left it.
     *
     * @param DiaryEntryNode[] $nodes
     */
    public function replaceSubtree(DiaryEntryNode $parent, array $nodes): void
    {
        $kept = array_filter(
            array: $this->nodes,
            callback: static fn (DiaryEntryNode $node): bool => !$node->isDescendantOf(other: $parent),
        );

        $this->nodes = array_values(array: array_merge($kept, array_values(array: $nodes)));
    }

    public function findNode(string $nodeId): ?DiaryEntryNode
    {
        foreach ($this->nodes as $node) {
            if ($node->id === $nodeId) {
                return $node;
            }
        }

        return null;
    }

    public function treeMacros(): MacroBreakdown
    {
        return self::macrosOf(nodes: $this->nodes);
    }

    /** @param DiaryEntryNode[] $nodes */
    public static function macrosOf(array $nodes): MacroBreakdown
    {
        $total = MacroBreakdown::zero();

        foreach ($nodes as $node) {
            if (null !== $node->parentNodeId) {
                continue;
            }

            $total = $total->add(other: $node->macros());
        }

        return $total;
    }

    /** @return array<int, array<string, mixed>> */
    public function treePayload(): array
    {
        return self::snapshotAll(aggregates: $this->nodes);
    }

    private function scaleDescendants(
        DiaryEntryNode $node,
        float $factor,
        string $updatedByUserId,
        DateTimeGenerator $dateTimeGenerator,
    ): void {
        foreach ($this->nodes as $candidate) {
            if (!$candidate->isDescendantOf(other: $node)) {
                continue;
            }

            $candidate->scale(factor: $factor, updatedByUserId: $updatedByUserId, dateTimeGenerator: $dateTimeGenerator);
        }
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
            productionItemId: $this->productionItemId,
            quantity: $this->quantity,
            unit: $this->unit,
            name: $this->nameSnapshot,
            emoji: $this->emojiSnapshot,
            calories: $this->caloriesSnapshot,
            protein: $this->proteinSnapshot,
            fat: $this->fatSnapshot,
            carbs: $this->carbsSnapshot,
            quickName: $this->quickName,
            quickEmoji: $this->quickEmoji,
            quickCalories: $this->quickCalories,
            quickProtein: $this->quickProtein,
            quickFat: $this->quickFat,
            quickCarbs: $this->quickCarbs,
            customized: $this->customized,
            consumed: $this->consumed,
            tree: $this->treePayload(),
            createdAt: $this->createdAt,
            updatedAt: $this->updatedAt,
            createdByUserId: $this->createdByUserId,
            updatedByUserId: $this->updatedByUserId,
        ));
    }

    public function applyTreeSnapshot(
        DiaryEntrySnapshot $snapshot,
        string $updatedByUserId,
        DateTimeGenerator $dateTimeGenerator,
    ): void {
        $now = $dateTimeGenerator->now();

        $this->writeSnapshot(snapshot: $snapshot);
        $this->stampUpdate(userId: $updatedByUserId, now: $now);

        $this->record(event: new DiaryEntryTreeAdjusted(
            aggregateId: $this->id,
            occurredOn: $now,
            entryDate: $this->entryDate,
            meal: $this->meal,
            kind: $this->kind,
            refId: $this->refId,
            productionItemId: $this->productionItemId,
            quantity: $this->quantity,
            unit: $this->unit,
            name: $this->nameSnapshot,
            emoji: $this->emojiSnapshot,
            calories: $this->caloriesSnapshot,
            protein: $this->proteinSnapshot,
            fat: $this->fatSnapshot,
            carbs: $this->carbsSnapshot,
            quickName: $this->quickName,
            quickEmoji: $this->quickEmoji,
            quickCalories: $this->quickCalories,
            quickProtein: $this->quickProtein,
            quickFat: $this->quickFat,
            quickCarbs: $this->quickCarbs,
            customized: $this->customized,
            consumed: $this->consumed,
            tree: $this->treePayload(),
            createdAt: $this->createdAt,
            updatedAt: $this->updatedAt,
            createdByUserId: $this->createdByUserId,
            updatedByUserId: $this->updatedByUserId,
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
            deletedByUserId: $deletedByUserId,
            entryDate: $this->entryDate,
            meal: $this->meal,
            kind: $this->kind,
            refId: $this->refId,
            productionItemId: $this->productionItemId,
            quantity: $this->quantity,
            unit: $this->unit,
            name: $this->nameSnapshot,
            emoji: $this->emojiSnapshot,
            calories: $this->caloriesSnapshot,
            protein: $this->proteinSnapshot,
            fat: $this->fatSnapshot,
            carbs: $this->carbsSnapshot,
            quickName: $this->quickName,
            quickEmoji: $this->quickEmoji,
            quickCalories: $this->quickCalories,
            quickProtein: $this->quickProtein,
            quickFat: $this->quickFat,
            quickCarbs: $this->quickCarbs,
            customized: $this->customized,
            consumed: $this->consumed,
            tree: $this->treePayload(),
            createdAt: $this->createdAt,
            updatedAt: $this->updatedAt,
            createdByUserId: $this->createdByUserId,
            updatedByUserId: $this->updatedByUserId,
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
            emoji: $definition->emoji,
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
