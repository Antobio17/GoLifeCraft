<?php

namespace Nutrition\Menu\Menu\Domain\Model;

use Integration\Mcp\Server\Domain\Model\GenericAggregate;
use Nutrition\Menu\Menu\Domain\Event\MenuCreated;
use Nutrition\Menu\Menu\Domain\Event\MenuDeleted;
use Nutrition\Menu\Menu\Domain\Event\MenuLoadedIntoDiary;
use Nutrition\Menu\Menu\Domain\Event\MenuUpdated;
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
    public string $weekDays;

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
        $menu->weekDays = $menu->packWeekDays(items: $items);
        $menu->stampCreation(userId: $createdByUserId, now: $now);

        $menu->record(event: new MenuCreated(
            aggregateId: $id,
            occurredOn: $now,
            name: $name,
            emoji: $emoji,
            note: $note,
            type: $type,
            weekDays: $menu->weekDays,
            items: $menu->plannedItems(items: $items),
            createdAt: $now,
            updatedAt: $now,
            createdByUserId: $createdByUserId,
            updatedByUserId: $createdByUserId,
        ));

        return $menu;
    }

    /**
     * @param MenuItem[] $items
     */
    public function update(
        string $name,
        string $emoji,
        string $note,
        array $items,
        string $updatedByUserId,
        DateTimeGenerator $dateTimeGenerator,
    ): void {
        $now = $dateTimeGenerator->now();

        $this->name = $name;
        $this->emoji = $emoji;
        $this->note = $note;
        $this->items = $items;
        $this->guardItems(items: $items, updating: true);
        $this->weekDays = $this->packWeekDays(items: $items);
        $this->stampUpdate(userId: $updatedByUserId, now: $now);

        $this->record(event: new MenuUpdated(
            aggregateId: $this->id,
            occurredOn: $now,
            name: $name,
            emoji: $emoji,
            note: $note,
            type: $this->type,
            weekDays: $this->weekDays,
            items: $this->plannedItems(items: $items),
            createdAt: $this->createdAt,
            updatedAt: $now,
            createdByUserId: $this->createdByUserId,
            updatedByUserId: $updatedByUserId,
        ));
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
            type: $this->type,
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

        return MenuWeekDay::sort(dayKeys: array_filter(array: explode(separator: ',', string: $this->weekDays)));
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
            type: $this->type,
            dayKey: $dayKey,
            plannedDays: $plannedDays,
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
     * @param MenuItem[] $items
     *
     * @return array<int, array{meal: string, kind: string, refId: string, quantity: float, unit: ?string}>
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
     *
     * @param MenuItem[] $items
     */
    private function packWeekDays(array $items): string
    {
        if (!$this->isWeek()) {
            return '';
        }

        $dayKeys = array_map(
            callback: static fn (MenuItem $item): string => (string) $item->dayKey,
            array: $items,
        );

        return implode(separator: ',', array: MenuWeekDay::sort(dayKeys: $dayKeys));
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
