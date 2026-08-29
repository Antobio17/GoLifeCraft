<?php

namespace Nutrition\Kitchen\Production\Domain\Model;

use Integration\Mcp\Server\Domain\Model\GenericAggregate;
use Nutrition\Kitchen\Production\Domain\Event\ProductionDiscarded;
use Nutrition\Kitchen\Production\Domain\Event\ProductionFinished;
use Nutrition\Kitchen\Production\Domain\Event\ProductionItemChecked;
use Nutrition\Kitchen\Production\Domain\Event\ProductionItemCooked;
use Nutrition\Kitchen\Production\Domain\Event\ProductionItemUncooked;
use Nutrition\Kitchen\Production\Domain\Event\ProductionReopened;
use Nutrition\Kitchen\Production\Domain\Event\ProductionStarted;
use Nutrition\Kitchen\Production\Domain\Exception\CookProductionItemException;
use Nutrition\Kitchen\Production\Domain\Exception\StartProductionException;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

class Production extends GenericAggregate
{
    public const string STATUS_COOKING = 'cooking';
    public const string STATUS_DONE = 'done';

    public string $fromDate;
    public string $toDate;
    public string $status;

    /** @var ProductionItem[] */
    public array $items = [];

    /**
     * @param ProductionItem[] $items
     */
    public static function start(
        string $id,
        string $fromDate,
        string $toDate,
        array $items,
        string $startedByUserId,
        DateTimeGenerator $dateTimeGenerator,
    ): self {
        self::guardRange(fromDate: $fromDate, toDate: $toDate);

        if ([] === $items) {
            throw StartProductionException::emptyProduction();
        }

        $now = $dateTimeGenerator->now();

        $production = new self();
        $production->id = $id;
        $production->fromDate = $fromDate;
        $production->toDate = $toDate;
        $production->status = self::STATUS_COOKING;
        $production->items = $items;
        $production->stampCreation(userId: $startedByUserId, now: $now);

        $production->record(event: new ProductionStarted(
            aggregateId: $id,
            occurredOn: $now,
            fromDate: $fromDate,
            toDate: $toDate,
            status: $production->status,
            items: $production->recordedItems(),
            createdAt: $now,
            updatedAt: $now,
            createdByUserId: $startedByUserId,
            updatedByUserId: $startedByUserId,
        ));

        return $production;
    }

    /**
     * @param array<int, array{articleId: string, quantity: float, unit: string}> $consumedArticles
     * @param array<int, array{recipeId: string, servings: float}>                $consumedRecipes
     */
    public function cookItem(
        string $itemId,
        float $servingsCooked,
        array $consumedArticles,
        array $consumedRecipes,
        array $stepPositions,
        string $cookedByUserId,
        DateTimeGenerator $dateTimeGenerator,
    ): void {
        $item = $this->item(itemId: $itemId);

        if (null === $item) {
            throw CookProductionItemException::itemNotFound(productionId: $this->id, itemId: $itemId);
        }

        if ($item->isDone()) {
            throw CookProductionItemException::itemAlreadyCooked(productionId: $this->id, itemId: $itemId);
        }

        if ($servingsCooked <= 0.0) {
            throw CookProductionItemException::servingsMustBePositive(servings: $servingsCooked);
        }

        $now = $dateTimeGenerator->now();

        $item->cook(
            servingsCooked: $servingsCooked,
            consumedArticles: $consumedArticles,
            consumedRecipes: $consumedRecipes,
            stepPositions: $stepPositions,
            cookedByUserId: $cookedByUserId,
            now: $now,
        );
        $this->stampUpdate(userId: $cookedByUserId, now: $now);

        $this->record(event: new ProductionItemCooked(
            aggregateId: $this->id,
            occurredOn: $now,
            itemId: $item->id,
            recipeId: $item->recipeId,
            fromDate: $this->fromDate,
            toDate: $this->toDate,
            servingsPlanned: $item->servingsPlanned,
            servingsCooked: $servingsCooked,
            nameSnapshot: $item->nameSnapshot,
            emojiSnapshot: $item->emojiSnapshot,
            consumedArticles: $consumedArticles,
            consumedRecipes: $consumedRecipes,
            createdAt: $this->createdAt,
            updatedAt: $now,
            createdByUserId: $this->createdByUserId,
            updatedByUserId: $cookedByUserId,
        ));

        if (!$this->allItemsCooked()) {
            return;
        }

        $this->close(finishedByUserId: $cookedByUserId, now: $now);
    }

    public function uncookItem(
        string $itemId,
        string $uncookedByUserId,
        DateTimeGenerator $dateTimeGenerator,
    ): void {
        $item = $this->item(itemId: $itemId);

        if (null === $item) {
            throw CookProductionItemException::itemNotFound(productionId: $this->id, itemId: $itemId);
        }

        if (!$item->isDone()) {
            throw CookProductionItemException::itemNotCooked(productionId: $this->id, itemId: $itemId);
        }

        $now = $dateTimeGenerator->now();
        $servingsCooked = $item->servingsCooked;
        $consumedArticles = $item->consumedArticles();
        $consumedRecipes = $item->consumedRecipes();

        $item->uncook(uncookedByUserId: $uncookedByUserId, now: $now);
        $this->stampUpdate(userId: $uncookedByUserId, now: $now);

        $this->record(event: new ProductionItemUncooked(
            aggregateId: $this->id,
            occurredOn: $now,
            itemId: $item->id,
            recipeId: $item->recipeId,
            fromDate: $this->fromDate,
            toDate: $this->toDate,
            servingsPlanned: $item->servingsPlanned,
            servingsCooked: $servingsCooked,
            nameSnapshot: $item->nameSnapshot,
            emojiSnapshot: $item->emojiSnapshot,
            consumedArticles: $consumedArticles,
            consumedRecipes: $consumedRecipes,
            createdAt: $this->createdAt,
            updatedAt: $now,
            createdByUserId: $this->createdByUserId,
            updatedByUserId: $uncookedByUserId,
        ));

        if (!$this->isDone()) {
            return;
        }

        $this->reopen(reopenedByUserId: $uncookedByUserId, now: $now);
    }

    /**
     * @param string[] $articleIds
     * @param int[]    $stepPositions
     */
    public function checkItem(
        string $itemId,
        array $articleIds,
        array $stepPositions,
        string $checkedByUserId,
        DateTimeGenerator $dateTimeGenerator,
    ): void {
        $item = $this->item(itemId: $itemId);

        if (null === $item) {
            throw CookProductionItemException::itemNotFound(productionId: $this->id, itemId: $itemId);
        }

        if ($item->isDone()) {
            throw CookProductionItemException::itemAlreadyCooked(productionId: $this->id, itemId: $itemId);
        }

        $now = $dateTimeGenerator->now();

        $item->check(
            articleIds: $articleIds,
            stepPositions: $stepPositions,
            checkedByUserId: $checkedByUserId,
            now: $now,
        );
        $this->stampUpdate(userId: $checkedByUserId, now: $now);

        $this->record(event: new ProductionItemChecked(
            aggregateId: $this->id,
            occurredOn: $now,
            itemId: $item->id,
            recipeId: $item->recipeId,
            checkedArticleIds: $item->checkedArticleIds,
            checkedStepPositions: $item->checkedStepPositions,
            createdAt: $this->createdAt,
            updatedAt: $now,
            createdByUserId: $this->createdByUserId,
            updatedByUserId: $checkedByUserId,
        ));
    }

    public function discard(string $discardedByUserId, DateTimeGenerator $dateTimeGenerator): void
    {
        $now = $dateTimeGenerator->now();
        $this->stampUpdate(userId: $discardedByUserId, now: $now);

        $this->record(event: new ProductionDiscarded(
            aggregateId: $this->id,
            occurredOn: $now,
            fromDate: $this->fromDate,
            toDate: $this->toDate,
            status: $this->status,
            items: $this->recordedItems(),
            createdAt: $this->createdAt,
            updatedAt: $now,
            createdByUserId: $this->createdByUserId,
            discardedByUserId: $discardedByUserId,
        ));
    }

    public function isDone(): bool
    {
        return self::STATUS_DONE === $this->status;
    }

    public function item(string $itemId): ?ProductionItem
    {
        foreach ($this->items as $item) {
            if ($item->id === $itemId) {
                return $item;
            }
        }

        return null;
    }

    /**
     * @return array<int, array{itemId: string, recipeId: string, position: int, status: string, servingsPlanned: float, servingsCooked: float, nameSnapshot: string, emojiSnapshot: string, checkedArticleIds: string[], checkedStepPositions: int[]}>
     */
    public function recordedItems(): array
    {
        return array_map(
            callback: static fn (ProductionItem $item): array => $item->toRecordedItem(),
            array: array_values(array: $this->items),
        );
    }

    private function reopen(string $reopenedByUserId, \DateTime $now): void
    {
        $this->status = self::STATUS_COOKING;
        $this->stampUpdate(userId: $reopenedByUserId, now: $now);

        $this->record(event: new ProductionReopened(
            aggregateId: $this->id,
            occurredOn: $now,
            fromDate: $this->fromDate,
            toDate: $this->toDate,
            status: $this->status,
            items: $this->recordedItems(),
            createdAt: $this->createdAt,
            updatedAt: $now,
            createdByUserId: $this->createdByUserId,
            updatedByUserId: $reopenedByUserId,
        ));
    }

    private function close(string $finishedByUserId, \DateTime $now): void
    {
        $this->status = self::STATUS_DONE;
        $this->stampUpdate(userId: $finishedByUserId, now: $now);

        $this->record(event: new ProductionFinished(
            aggregateId: $this->id,
            occurredOn: $now,
            fromDate: $this->fromDate,
            toDate: $this->toDate,
            status: $this->status,
            items: $this->recordedItems(),
            createdAt: $this->createdAt,
            updatedAt: $now,
            createdByUserId: $this->createdByUserId,
            updatedByUserId: $finishedByUserId,
        ));
    }

    private function allItemsCooked(): bool
    {
        foreach ($this->items as $item) {
            if (!$item->isDone()) {
                return false;
            }
        }

        return true;
    }

    private static function guardRange(string $fromDate, string $toDate): void
    {
        if (!self::isDate(date: $fromDate)) {
            throw StartProductionException::invalidDate(date: $fromDate);
        }

        if (!self::isDate(date: $toDate)) {
            throw StartProductionException::invalidDate(date: $toDate);
        }

        if ($toDate < $fromDate) {
            throw StartProductionException::invalidRange(fromDate: $fromDate, toDate: $toDate);
        }
    }

    private static function isDate(string $date): bool
    {
        if (1 !== preg_match(pattern: '/^\d{4}-\d{2}-\d{2}$/', subject: $date)) {
            return false;
        }

        return false !== \DateTimeImmutable::createFromFormat(format: '!Y-m-d', datetime: $date);
    }
}
