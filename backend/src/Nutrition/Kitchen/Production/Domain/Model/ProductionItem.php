<?php

namespace Nutrition\Kitchen\Production\Domain\Model;

use Integration\Mcp\Server\Domain\Model\GenericAggregate;
use Ramsey\Uuid\Uuid;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

class ProductionItem extends GenericAggregate
{
    public const string STATUS_PENDING = 'pending';
    public const string STATUS_DONE = 'done';

    public string $productionId;
    public int $position;
    public string $recipeId;
    public string $status;
    public float $servingsPlanned;
    public float $servingsCooked = 0.0;
    public string $nameSnapshot;
    public string $emojiSnapshot;

    /** @var string[] */
    public array $checkedArticleIds = [];

    /** @var int[] */
    public array $checkedStepPositions = [];

    /** @var ProductionItemConsumption[] */
    public array $consumptions = [];

    /** @var string[] */
    public array $releasedConsumptionIds = [];

    public static function plan(
        string $productionId,
        int $position,
        string $recipeId,
        float $servingsPlanned,
        string $nameSnapshot,
        string $emojiSnapshot,
        string $createdByUserId,
        DateTimeGenerator $dateTimeGenerator,
    ): self {
        $item = new self();
        $item->id = Uuid::uuid4()->toString();
        $item->productionId = $productionId;
        $item->position = $position;
        $item->recipeId = $recipeId;
        $item->status = self::STATUS_PENDING;
        $item->servingsPlanned = $servingsPlanned;
        $item->nameSnapshot = $nameSnapshot;
        $item->emojiSnapshot = $emojiSnapshot;
        $item->stampCreation(userId: $createdByUserId, now: $dateTimeGenerator->now());

        return $item;
    }

    /**
     * @param array<int, array{articleId: string, quantity: float, unit: string}> $consumedArticles
     * @param array<int, array{recipeId: string, servings: float}>                $consumedRecipes
     * @param int[]                                                               $stepPositions
     */
    public function cook(
        float $servingsCooked,
        array $consumedArticles,
        array $consumedRecipes,
        array $stepPositions,
        string $cookedByUserId,
        \DateTime $now,
    ): void {
        $this->status = self::STATUS_DONE;
        $this->servingsCooked = $servingsCooked;
        $this->checkedStepPositions = array_values(array: array_unique(array: $stepPositions));
        $this->consumptions = $this->takeConsumptions(
            consumedArticles: $consumedArticles,
            consumedRecipes: $consumedRecipes,
            cookedByUserId: $cookedByUserId,
            now: $now,
        );
        $this->stampUpdate(userId: $cookedByUserId, now: $now);
    }

    /**
     * @param string[] $articleIds
     * @param int[]    $stepPositions
     */
    public function check(
        array $articleIds,
        array $stepPositions,
        string $checkedByUserId,
        \DateTime $now,
    ): void {
        $this->checkedArticleIds = array_values(array: array_unique(array: $articleIds));
        $this->checkedStepPositions = array_values(array: array_unique(array: $stepPositions));
        $this->stampUpdate(userId: $checkedByUserId, now: $now);
    }

    public function uncook(string $uncookedByUserId, \DateTime $now): void
    {
        $this->status = self::STATUS_PENDING;
        $this->servingsCooked = 0.0;
        $this->releasedConsumptionIds = array_map(
            callback: static fn (ProductionItemConsumption $consumption): string => $consumption->id,
            array: $this->consumptions,
        );
        $this->consumptions = [];
        $this->stampUpdate(userId: $uncookedByUserId, now: $now);
    }

    public function isDone(): bool
    {
        return self::STATUS_DONE === $this->status;
    }

    /**
     * @return array<int, array{articleId: string, quantity: float, unit: string}>
     */
    public function consumedArticles(): array
    {
        return array_values(array: array_map(
            callback: static fn (ProductionItemConsumption $consumption): array => $consumption->toConsumedArticle(),
            array: array_filter(
                array: $this->consumptions,
                callback: static fn (ProductionItemConsumption $consumption): bool => $consumption->isArticle(),
            ),
        ));
    }

    /**
     * @return array<int, array{recipeId: string, servings: float}>
     */
    public function consumedRecipes(): array
    {
        return array_values(array: array_map(
            callback: static fn (ProductionItemConsumption $consumption): array => $consumption->toConsumedRecipe(),
            array: array_filter(
                array: $this->consumptions,
                callback: static fn (ProductionItemConsumption $consumption): bool => !$consumption->isArticle(),
            ),
        ));
    }

    /**
     * @return array{itemId: string, recipeId: string, position: int, status: string, servingsPlanned: float, servingsCooked: float, nameSnapshot: string, emojiSnapshot: string, checkedArticleIds: string[], checkedStepPositions: int[]}
     */
    public function toRecordedItem(): array
    {
        return [
            'itemId' => $this->id,
            'recipeId' => $this->recipeId,
            'position' => $this->position,
            'status' => $this->status,
            'servingsPlanned' => $this->servingsPlanned,
            'servingsCooked' => $this->servingsCooked,
            'nameSnapshot' => $this->nameSnapshot,
            'emojiSnapshot' => $this->emojiSnapshot,
            'checkedArticleIds' => $this->checkedArticleIds,
            'checkedStepPositions' => $this->checkedStepPositions,
        ];
    }

    /**
     * @param array<int, array{articleId: string, quantity: float, unit: string}> $consumedArticles
     * @param array<int, array{recipeId: string, servings: float}>                $consumedRecipes
     *
     * @return ProductionItemConsumption[]
     */
    private function takeConsumptions(
        array $consumedArticles,
        array $consumedRecipes,
        string $cookedByUserId,
        \DateTime $now,
    ): array {
        $consumptions = [];

        foreach ($consumedArticles as $consumed) {
            $consumptions[] = ProductionItemConsumption::take(
                productionItemId: $this->id,
                kind: ProductionItemConsumption::KIND_ARTICLE,
                refId: $consumed['articleId'],
                quantity: $consumed['quantity'],
                unit: $consumed['unit'],
                createdByUserId: $cookedByUserId,
                now: $now,
            );
        }

        foreach ($consumedRecipes as $consumed) {
            $consumptions[] = ProductionItemConsumption::take(
                productionItemId: $this->id,
                kind: ProductionItemConsumption::KIND_RECIPE,
                refId: $consumed['recipeId'],
                quantity: $consumed['servings'],
                unit: null,
                createdByUserId: $cookedByUserId,
                now: $now,
            );
        }

        return $consumptions;
    }
}
