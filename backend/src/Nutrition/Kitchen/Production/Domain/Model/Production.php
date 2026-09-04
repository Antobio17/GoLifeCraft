<?php

namespace Nutrition\Kitchen\Production\Domain\Model;

use Integration\Mcp\Server\Domain\Model\GenericAggregate;
use Nutrition\Kitchen\Production\Domain\Event\ProductionDiscarded;
use Nutrition\Kitchen\Production\Domain\Event\ProductionFinished;
use Nutrition\Kitchen\Production\Domain\Event\ProductionItemChecked;
use Nutrition\Kitchen\Production\Domain\Event\ProductionItemCooked;
use Nutrition\Kitchen\Production\Domain\Event\ProductionItemIngredientsAdjusted;
use Nutrition\Kitchen\Production\Domain\Event\ProductionItemLabelled;
use Nutrition\Kitchen\Production\Domain\Event\ProductionItemSubRecipeServed;
use Nutrition\Kitchen\Production\Domain\Event\ProductionItemUncooked;
use Nutrition\Kitchen\Production\Domain\Event\ProductionReopened;
use Nutrition\Kitchen\Production\Domain\Event\ProductionStarted;
use Nutrition\Kitchen\Production\Domain\Exception\AdjustProductionItemException;
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
     * @param ProductionCompositionLine[] $composition
     */
    public function cookItem(
        string $itemId,
        float $servingsCooked,
        array $composition,
        ?string $code,
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
            composition: $composition,
            code: $code,
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
            status: $this->status,
            items: $this->recordedItems(),
            servingsPlanned: $item->servingsPlanned,
            servingsCooked: $servingsCooked,
            nameSnapshot: $item->nameSnapshot,
            emojiSnapshot: $item->emojiSnapshot,
            code: $item->code,
            label: $item->label,
            customized: $item->customized,
            composition: $item->recordedComposition(),
            consumedArticles: $item->consumedArticles(),
            consumedRecipes: $item->consumedRecipes(),
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

    /**
     * @param ProductionCompositionLine[] $composition
     */
    public function adjustItemIngredients(
        string $itemId,
        array $composition,
        bool $customized,
        string $adjustedByUserId,
        DateTimeGenerator $dateTimeGenerator,
    ): void {
        $item = $this->item(itemId: $itemId);

        if (null === $item) {
            throw AdjustProductionItemException::itemNotFound(productionId: $this->id, itemId: $itemId);
        }

        if ($item->isDone()) {
            throw AdjustProductionItemException::itemAlreadyCooked(productionId: $this->id, itemId: $itemId);
        }

        if ([] === $composition) {
            throw AdjustProductionItemException::emptyComposition(productionId: $this->id, itemId: $itemId);
        }

        $now = $dateTimeGenerator->now();

        $item->adjustComposition(
            composition: $composition,
            customized: $customized,
            updatedByUserId: $adjustedByUserId,
            now: $now,
        );
        $this->stampUpdate(userId: $adjustedByUserId, now: $now);

        $this->record(event: new ProductionItemIngredientsAdjusted(
            aggregateId: $this->id,
            occurredOn: $now,
            itemId: $item->id,
            recipeId: $item->recipeId,
            fromDate: $this->fromDate,
            toDate: $this->toDate,
            status: $this->status,
            items: $this->recordedItems(),
            itemStatus: $item->status,
            servingsPlanned: $item->servingsPlanned,
            servingsCooked: $item->servingsCooked,
            nameSnapshot: $item->nameSnapshot,
            emojiSnapshot: $item->emojiSnapshot,
            code: $item->code,
            label: $item->label,
            customized: $item->customized,
            composition: $item->recordedComposition(),
            createdAt: $this->createdAt,
            updatedAt: $now,
            createdByUserId: $this->createdByUserId,
            updatedByUserId: $adjustedByUserId,
        ));
    }

    public function serveItemSubRecipeFrom(
        string $itemId,
        string $recipeId,
        ?string $sourceProductionItemId,
        string $updatedByUserId,
        DateTimeGenerator $dateTimeGenerator,
    ): void {
        $item = $this->item(itemId: $itemId);

        if (null === $item) {
            throw AdjustProductionItemException::itemNotFound(productionId: $this->id, itemId: $itemId);
        }

        if ($item->isDone()) {
            throw AdjustProductionItemException::itemAlreadyCooked(productionId: $this->id, itemId: $itemId);
        }

        if (!$item->usesSubRecipe(recipeId: $recipeId)) {
            throw AdjustProductionItemException::subRecipeNotUsed(itemId: $itemId, recipeId: $recipeId);
        }

        $now = $dateTimeGenerator->now();

        $item->serveSubRecipeFrom(
            recipeId: $recipeId,
            sourceProductionItemId: $sourceProductionItemId,
            updatedByUserId: $updatedByUserId,
            now: $now,
        );
        $this->stampUpdate(userId: $updatedByUserId, now: $now);

        $this->record(event: new ProductionItemSubRecipeServed(
            aggregateId: $this->id,
            occurredOn: $now,
            itemId: $item->id,
            recipeId: $item->recipeId,
            subRecipeId: $recipeId,
            sourceProductionItemId: $sourceProductionItemId,
            fromDate: $this->fromDate,
            toDate: $this->toDate,
            status: $this->status,
            items: $this->recordedItems(),
            itemStatus: $item->status,
            servingsPlanned: $item->servingsPlanned,
            servingsCooked: $item->servingsCooked,
            nameSnapshot: $item->nameSnapshot,
            emojiSnapshot: $item->emojiSnapshot,
            code: $item->code,
            label: $item->label,
            customized: $item->customized,
            composition: $item->recordedComposition(),
            createdAt: $this->createdAt,
            updatedAt: $now,
            createdByUserId: $this->createdByUserId,
            updatedByUserId: $updatedByUserId,
        ));
    }

    public function labelItem(
        string $itemId,
        string $label,
        string $labelledByUserId,
        DateTimeGenerator $dateTimeGenerator,
    ): void {
        $item = $this->item(itemId: $itemId);

        if (null === $item) {
            throw AdjustProductionItemException::itemNotFound(productionId: $this->id, itemId: $itemId);
        }

        $now = $dateTimeGenerator->now();

        $item->labelAs(label: $label, updatedByUserId: $labelledByUserId, now: $now);
        $this->stampUpdate(userId: $labelledByUserId, now: $now);

        $this->record(event: new ProductionItemLabelled(
            aggregateId: $this->id,
            occurredOn: $now,
            itemId: $item->id,
            recipeId: $item->recipeId,
            fromDate: $this->fromDate,
            toDate: $this->toDate,
            status: $this->status,
            items: $this->recordedItems(),
            itemStatus: $item->status,
            servingsPlanned: $item->servingsPlanned,
            servingsCooked: $item->servingsCooked,
            nameSnapshot: $item->nameSnapshot,
            emojiSnapshot: $item->emojiSnapshot,
            code: $item->code,
            label: $item->label,
            createdAt: $this->createdAt,
            updatedAt: $now,
            createdByUserId: $this->createdByUserId,
            updatedByUserId: $labelledByUserId,
        ));
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
        $composition = $item->recordedComposition();

        $item->uncook(uncookedByUserId: $uncookedByUserId, now: $now);
        $this->stampUpdate(userId: $uncookedByUserId, now: $now);

        $this->record(event: new ProductionItemUncooked(
            aggregateId: $this->id,
            occurredOn: $now,
            itemId: $item->id,
            recipeId: $item->recipeId,
            fromDate: $this->fromDate,
            toDate: $this->toDate,
            status: $this->status,
            items: $this->recordedItems(),
            servingsPlanned: $item->servingsPlanned,
            servingsCooked: $servingsCooked,
            nameSnapshot: $item->nameSnapshot,
            emojiSnapshot: $item->emojiSnapshot,
            code: $item->code,
            label: $item->label,
            customized: $item->customized,
            composition: $composition,
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
            fromDate: $this->fromDate,
            toDate: $this->toDate,
            status: $this->status,
            items: $this->recordedItems(),
            itemStatus: $item->status,
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
     * @return array<int, array<string, mixed>>
     */
    public function recordedItems(): array
    {
        return self::snapshotAll(aggregates: $this->items);
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
