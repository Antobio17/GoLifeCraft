<?php

namespace Nutrition\Menu\Menu\Domain\Model;

use Integration\Mcp\Server\Domain\Model\GenericAggregate;
use Nutrition\Menu\Menu\Domain\Event\MenuCreated;
use Nutrition\Menu\Menu\Domain\Event\MenuDeleted;
use Nutrition\Menu\Menu\Domain\Event\MenuDetailsUpdated;
use Nutrition\Menu\Menu\Domain\Event\MenuItemAdded;
use Nutrition\Menu\Menu\Domain\Event\MenuItemRemoved;
use Nutrition\Menu\Menu\Domain\Event\MenuItemTreeAdjusted;
use Nutrition\Menu\Menu\Domain\Event\MenuItemTreeReset;
use Nutrition\Menu\Menu\Domain\Event\MenuItemUpdated;
use Nutrition\Menu\Menu\Domain\Event\MenuLoadedIntoDiary;
use Nutrition\Menu\Menu\Domain\Exception\CreateMenuException;
use Nutrition\Menu\Menu\Domain\Exception\LoadMenuIntoDiaryException;
use Nutrition\Menu\Menu\Domain\Exception\UpdateMenuException;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

class Menu extends GenericAggregate
{
    public const TYPE_SINGLE = 'single';
    public const TYPE_WEEK = 'week';

    public const MAX_RANGE_DAYS = 90;

    /** @var array<int, string> */
    public const TYPES = [
        self::TYPE_SINGLE,
        self::TYPE_WEEK,
    ];

    public string $name;
    public string $emoji;
    public string $note;
    public string $type;
    public string $weekDays = '';

    /** @var MenuItem[] */
    public array $items = [];

    /**
     * @param MenuItem[] $items
     */
    public static function create(
        string $id,
        string $name,
        string $emoji,
        string $note,
        string $type,
        array $items,
        string $createdByUserId,
        DateTimeGenerator $dateTimeGenerator,
    ): self {
        if (!in_array(needle: $type, haystack: self::TYPES, strict: true)) {
            throw CreateMenuException::invalidType(type: $type);
        }

        $now = $dateTimeGenerator->now();

        $menu = new self();
        $menu->id = $id;
        $menu->name = $name;
        $menu->emoji = $emoji;
        $menu->note = $note;
        $menu->type = $type;
        $menu->items = $items;
        $menu->guardItems(items: $items);
        $menu->weekDays = $menu->packWeekDays();
        $menu->stampCreation(userId: $createdByUserId, now: $now);

        $menu->record(event: new MenuCreated(
            aggregateId: $id,
            occurredOn: $now,
            name: $name,
            emoji: $emoji,
            note: $note,
            type: $type,
            weekDays: $menu->weekDays,
            items: $menu->recordedItems(),
            createdAt: $now,
            updatedAt: $now,
            createdByUserId: $createdByUserId,
            updatedByUserId: $createdByUserId,
        ));

        return $menu;
    }

    public function delete(
        string $deletedByUserId,
        DateTimeGenerator $dateTimeGenerator,
    ): void {
        $now = $dateTimeGenerator->now();
        $this->stampUpdate(userId: $deletedByUserId, now: $now);

        $this->record(event: new MenuDeleted(
            aggregateId: $this->id,
            occurredOn: $now,
            name: $this->name,
            emoji: $this->emoji,
            note: $this->note,
            type: $this->type,
            weekDays: $this->weekDays,
            items: $this->recordedItems(),
            createdAt: $this->createdAt,
            updatedAt: $now,
            createdByUserId: $this->createdByUserId,
            deletedByUserId: $deletedByUserId,
        ));
    }

    public function loadIntoDiary(
        string $fromDate,
        string $toDate,
        ?string $dayKey,
        string $loadedByUserId,
        DateTimeGenerator $dateTimeGenerator,
    ): void {
        $dates = $this->rangeDates(fromDate: $fromDate, toDate: $toDate);
        $items = $this->itemsForLoad(dayKey: $dayKey);

        if ([] === $items) {
            throw LoadMenuIntoDiaryException::menuIsEmpty(menuId: $this->id);
        }

        $plannedItems = $this->plannedItems(items: $items);
        $plannedDays = array_map(
            callback: static fn (string $date): array => ['date' => $date, 'items' => $plannedItems],
            array: $dates,
        );

        $this->recordLoad(
            plannedDays: $plannedDays,
            dayKey: $dayKey,
            loadedByUserId: $loadedByUserId,
            dateTimeGenerator: $dateTimeGenerator,
        );
    }

    public function applyWeekIntoDiary(
        string $weekStartDate,
        string $loadedByUserId,
        DateTimeGenerator $dateTimeGenerator,
    ): void {
        if (!$this->isWeek()) {
            throw LoadMenuIntoDiaryException::notAWeekMenu(menuId: $this->id);
        }

        $weekStart = self::parseDate(date: $weekStartDate);
        if (null === $weekStart) {
            throw LoadMenuIntoDiaryException::invalidDate(date: $weekStartDate);
        }

        $plannedDays = [];

        foreach ($this->enabledWeekDays() as $dayKey) {
            $items = $this->itemsForDay(dayKey: $dayKey);
            if ([] === $items) {
                continue;
            }

            $date = (clone $weekStart)->modify(modifier: sprintf('+%d days', MenuWeekDay::offset(dayKey: $dayKey)));
            $plannedDays[] = ['date' => $date->format(format: 'Y-m-d'), 'items' => $this->plannedItems(items: $items)];
        }

        if ([] === $plannedDays) {
            throw LoadMenuIntoDiaryException::menuIsEmpty(menuId: $this->id);
        }

        $this->recordLoad(
            plannedDays: $plannedDays,
            dayKey: null,
            loadedByUserId: $loadedByUserId,
            dateTimeGenerator: $dateTimeGenerator,
        );
    }

    public function updateDetails(
        string $name,
        string $emoji,
        string $note,
        string $updatedByUserId,
        DateTimeGenerator $dateTimeGenerator,
    ): void {
        $now = $dateTimeGenerator->now();

        $this->name = $name;
        $this->emoji = $emoji;
        $this->note = $note;
        $this->stampUpdate(userId: $updatedByUserId, now: $now);

        $this->record(event: new MenuDetailsUpdated(
            aggregateId: $this->id,
            occurredOn: $now,
            name: $this->name,
            emoji: $this->emoji,
            note: $this->note,
            type: $this->type,
            weekDays: $this->weekDays,
            items: $this->recordedItems(),
            createdAt: $this->createdAt,
            updatedAt: $now,
            createdByUserId: $this->createdByUserId,
            updatedByUserId: $updatedByUserId,
        ));
    }

    public function addItem(
        MenuItem $item,
        string $addedByUserId,
        DateTimeGenerator $dateTimeGenerator,
    ): void {
        $now = $dateTimeGenerator->now();

        $this->items[] = $item;
        $this->guardItems(items: [$item], updating: true);
        $this->repositionItems(updatedByUserId: $addedByUserId, dateTimeGenerator: $dateTimeGenerator);
        $this->weekDays = $this->packWeekDays();
        $this->stampUpdate(userId: $addedByUserId, now: $now);

        $this->record(event: new MenuItemAdded(
            aggregateId: $this->id,
            occurredOn: $now,
            menuItemId: $item->id,
            name: $this->name,
            emoji: $this->emoji,
            note: $this->note,
            type: $this->type,
            weekDays: $this->weekDays,
            items: $this->recordedItems(),
            createdAt: $this->createdAt,
            updatedAt: $now,
            createdByUserId: $this->createdByUserId,
            updatedByUserId: $addedByUserId,
        ));
    }

    public function updateItem(
        string $menuItemId,
        float $quantity,
        ?string $unit,
        string $updatedByUserId,
        DateTimeGenerator $dateTimeGenerator,
    ): void {
        if ($quantity <= 0) {
            throw UpdateMenuException::quantityMustBePositive();
        }

        $item = $this->item(menuItemId: $menuItemId);
        $now = $dateTimeGenerator->now();

        $item->adjustQuantity(
            quantity: $quantity,
            unit: $unit,
            updatedByUserId: $updatedByUserId,
            dateTimeGenerator: $dateTimeGenerator,
        );
        $this->stampUpdate(userId: $updatedByUserId, now: $now);

        $this->record(event: new MenuItemUpdated(
            aggregateId: $this->id,
            occurredOn: $now,
            menuItemId: $item->id,
            name: $this->name,
            emoji: $this->emoji,
            note: $this->note,
            type: $this->type,
            weekDays: $this->weekDays,
            items: $this->recordedItems(),
            createdAt: $this->createdAt,
            updatedAt: $now,
            createdByUserId: $this->createdByUserId,
            updatedByUserId: $updatedByUserId,
        ));
    }

    public function removeItem(
        string $menuItemId,
        string $removedByUserId,
        DateTimeGenerator $dateTimeGenerator,
    ): void {
        $item = $this->item(menuItemId: $menuItemId);
        $now = $dateTimeGenerator->now();

        $this->items = array_values(array: array_filter(
            array: $this->items,
            callback: static fn (MenuItem $candidate): bool => $candidate->id !== $menuItemId,
        ));
        $this->repositionItems(updatedByUserId: $removedByUserId, dateTimeGenerator: $dateTimeGenerator);
        $this->weekDays = $this->packWeekDays();
        $this->stampUpdate(userId: $removedByUserId, now: $now);

        $this->record(event: new MenuItemRemoved(
            aggregateId: $this->id,
            occurredOn: $now,
            menuItemId: $item->id,
            name: $this->name,
            emoji: $this->emoji,
            note: $this->note,
            type: $this->type,
            weekDays: $this->weekDays,
            items: $this->recordedItems(),
            createdAt: $this->createdAt,
            updatedAt: $now,
            createdByUserId: $this->createdByUserId,
            updatedByUserId: $removedByUserId,
        ));
    }

    public function item(string $menuItemId): MenuItem
    {
        $item = $this->findItem(menuItemId: $menuItemId);

        if (null === $item) {
            throw UpdateMenuException::menuItemNotFound(menuId: $this->id, menuItemId: $menuItemId);
        }

        return $item;
    }

    public function nextItemPosition(): int
    {
        return count(value: $this->items) + 1;
    }

    private function repositionItems(string $updatedByUserId, DateTimeGenerator $dateTimeGenerator): void
    {
        foreach (array_values(array: $this->items) as $index => $item) {
            $item->moveTo(
                position: $index + 1,
                updatedByUserId: $updatedByUserId,
                dateTimeGenerator: $dateTimeGenerator,
            );
        }
    }

    public function recipeItem(string $menuItemId): MenuItem
    {
        $item = $this->findItem(menuItemId: $menuItemId);

        if (null === $item) {
            throw UpdateMenuException::menuItemNotFound(menuId: $this->id, menuItemId: $menuItemId);
        }

        if (!$item->isRecipe()) {
            throw UpdateMenuException::notARecipeItem(menuItemId: $menuItemId);
        }

        return $item;
    }

    public function adjustItemNode(
        string $menuItemId,
        string $nodePath,
        float $quantity,
        ?string $unit,
        string $updatedByUserId,
        DateTimeGenerator $dateTimeGenerator,
    ): void {
        $this->recipeItem(menuItemId: $menuItemId)->adjustNode(
            nodePath: $nodePath,
            quantity: $quantity,
            unit: $unit,
            updatedByUserId: $updatedByUserId,
            dateTimeGenerator: $dateTimeGenerator,
        );
    }

    public function applyItemTree(
        string $menuItemId,
        string $updatedByUserId,
        DateTimeGenerator $dateTimeGenerator,
    ): void {
        $item = $this->recipeItem(menuItemId: $menuItemId);
        $now = $dateTimeGenerator->now();
        $macros = $item->treeMacros();

        $this->stampUpdate(userId: $updatedByUserId, now: $now);

        $this->record(event: new MenuItemTreeAdjusted(
            aggregateId: $this->id,
            occurredOn: $now,
            name: $this->name,
            emoji: $this->emoji,
            note: $this->note,
            type: $this->type,
            weekDays: $this->weekDays,
            items: $this->recordedItems(),
            menuItemId: $item->id,
            dayKey: $item->dayKey,
            meal: $item->meal,
            kind: $item->kind,
            refId: $item->refId,
            quantity: $item->quantity,
            unit: $item->unit,
            position: $item->position,
            customized: $item->customized,
            tree: $item->treePayload(),
            calories: $macros->calories,
            protein: $macros->protein,
            fat: $macros->fat,
            carbs: $macros->carbs,
            createdAt: $this->createdAt,
            updatedAt: $now,
            createdByUserId: $this->createdByUserId,
            updatedByUserId: $updatedByUserId,
        ));
    }

    /** @param MenuItemNode[] $nodes */
    public function resetItemTree(
        string $menuItemId,
        array $nodes,
        string $updatedByUserId,
        DateTimeGenerator $dateTimeGenerator,
    ): void {
        $item = $this->recipeItem(menuItemId: $menuItemId);
        $item->replaceTree(nodes: $nodes, customized: false);

        $now = $dateTimeGenerator->now();
        $macros = $item->treeMacros();

        $this->stampUpdate(userId: $updatedByUserId, now: $now);

        $this->record(event: new MenuItemTreeReset(
            aggregateId: $this->id,
            occurredOn: $now,
            name: $this->name,
            emoji: $this->emoji,
            note: $this->note,
            type: $this->type,
            weekDays: $this->weekDays,
            items: $this->recordedItems(),
            menuItemId: $item->id,
            dayKey: $item->dayKey,
            meal: $item->meal,
            kind: $item->kind,
            refId: $item->refId,
            quantity: $item->quantity,
            unit: $item->unit,
            position: $item->position,
            customized: $item->customized,
            tree: $item->treePayload(),
            calories: $macros->calories,
            protein: $macros->protein,
            fat: $macros->fat,
            carbs: $macros->carbs,
            createdAt: $this->createdAt,
            updatedAt: $now,
            createdByUserId: $this->createdByUserId,
            updatedByUserId: $updatedByUserId,
        ));
    }

    public function findItem(string $menuItemId): ?MenuItem
    {
        foreach ($this->items as $item) {
            if ($item->id === $menuItemId) {
                return $item;
            }
        }

        return null;
    }

    public function isWeek(): bool
    {
        return self::TYPE_WEEK === $this->type;
    }

    /**
     * @return array<int, string>
     */
    public function enabledWeekDays(): array
    {
        if (!$this->isWeek()) {
            return [];
        }

        return MenuWeekDay::sort(dayKeys: array_map(
            callback: static fn (MenuItem $item): string => (string) $item->dayKey,
            array: $this->items,
        ));
    }

    /**
     * @return MenuItem[]
     */
    public function itemsForDay(?string $dayKey): array
    {
        return array_values(array: array_filter(
            array: $this->items,
            callback: static fn (MenuItem $item): bool => $item->dayKey === $dayKey,
        ));
    }

    /**
     * @param array<int, array{date: string, items: array<int, array<string, mixed>>}> $plannedDays
     */
    private function recordLoad(
        array $plannedDays,
        ?string $dayKey,
        string $loadedByUserId,
        DateTimeGenerator $dateTimeGenerator,
    ): void {
        $now = $dateTimeGenerator->now();
        $this->stampUpdate(userId: $loadedByUserId, now: $now);

        $this->record(event: new MenuLoadedIntoDiary(
            aggregateId: $this->id,
            occurredOn: $now,
            name: $this->name,
            emoji: $this->emoji,
            note: $this->note,
            type: $this->type,
            weekDays: $this->weekDays,
            items: $this->recordedItems(),
            dayKey: $dayKey,
            plannedDays: $plannedDays,
            createdAt: $this->createdAt,
            updatedAt: $now,
            createdByUserId: $this->createdByUserId,
            loadedByUserId: $loadedByUserId,
        ));
    }

    /**
     * @return MenuItem[]
     */
    private function itemsForLoad(?string $dayKey): array
    {
        if (!$this->isWeek()) {
            return $this->itemsForDay(dayKey: null);
        }

        if (null === $dayKey) {
            throw LoadMenuIntoDiaryException::dayKeyIsRequired(menuId: $this->id);
        }

        if (!in_array(needle: $dayKey, haystack: $this->enabledWeekDays(), strict: true)) {
            throw LoadMenuIntoDiaryException::dayNotInPlan(menuId: $this->id, dayKey: $dayKey);
        }

        return $this->itemsForDay(dayKey: $dayKey);
    }

    /**
     * @return array<int, string>
     */
    private function rangeDates(string $fromDate, string $toDate): array
    {
        $from = self::parseDate(date: $fromDate);
        $to = self::parseDate(date: $toDate);

        if (null === $from) {
            throw LoadMenuIntoDiaryException::invalidDate(date: $fromDate);
        }

        if (null === $to) {
            throw LoadMenuIntoDiaryException::invalidDate(date: $toDate);
        }

        if ($from > $to) {
            [$from, $to] = [$to, $from];
        }

        $dates = [];
        $cursor = clone $from;

        while ($cursor <= $to) {
            $dates[] = $cursor->format(format: 'Y-m-d');
            $cursor = $cursor->modify(modifier: '+1 day');

            if (count(value: $dates) > self::MAX_RANGE_DAYS) {
                throw LoadMenuIntoDiaryException::rangeIsTooLong(maxDays: self::MAX_RANGE_DAYS);
            }
        }

        return $dates;
    }

    /**
     * @param MenuItem[] $items
     */
    private function guardItems(array $items, bool $updating = false): void
    {
        foreach ($items as $item) {
            if (!in_array(needle: $item->meal, haystack: MenuItem::MEALS, strict: true)) {
                throw $updating
                    ? UpdateMenuException::invalidMeal(meal: $item->meal)
                    : CreateMenuException::invalidMeal(meal: $item->meal);
            }

            if (!in_array(needle: $item->kind, haystack: MenuItem::KINDS, strict: true)) {
                throw $updating
                    ? UpdateMenuException::invalidKind(kind: $item->kind)
                    : CreateMenuException::invalidKind(kind: $item->kind);
            }

            if ($item->quantity <= 0) {
                throw $updating
                    ? UpdateMenuException::quantityMustBePositive()
                    : CreateMenuException::quantityMustBePositive();
            }

            if (!$this->isWeek() && null !== $item->dayKey) {
                throw $updating
                    ? UpdateMenuException::dayKeyIsNotAllowed()
                    : CreateMenuException::dayKeyIsNotAllowed();
            }

            if ($this->isWeek() && !MenuWeekDay::isValid(dayKey: (string) $item->dayKey)) {
                throw $updating
                    ? UpdateMenuException::invalidDayKey(dayKey: (string) $item->dayKey)
                    : CreateMenuException::invalidDayKey(dayKey: (string) $item->dayKey);
            }
        }
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function recordedItems(): array
    {
        return self::snapshotAll(aggregates: $this->items);
    }

    /**
     * @param MenuItem[] $items
     *
     * @return array<int, array{meal: string, kind: string, refId: string, quantity: float, unit: ?string, tree: array<int, array<string, mixed>>}>
     */
    private function plannedItems(array $items): array
    {
        return array_map(
            callback: static fn (MenuItem $item): array => $item->toPlannedItem(),
            array: $items,
        );
    }

    /**
     * A weekly menu plans exactly the days that hold food: emptying a day drops it from the plan.
     */
    private function packWeekDays(): string
    {
        return implode(separator: ',', array: $this->enabledWeekDays());
    }

    private static function parseDate(string $date): ?\DateTimeImmutable
    {
        if (1 !== preg_match(pattern: '/^\d{4}-\d{2}-\d{2}$/', subject: $date)) {
            return null;
        }

        $parsed = \DateTimeImmutable::createFromFormat(format: '!Y-m-d', datetime: $date);

        return false === $parsed ? null : $parsed;
    }
}
