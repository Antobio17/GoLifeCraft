<?php

namespace Nutrition\Kitchen\Production\Domain\Model;

use Integration\Mcp\Server\Domain\Model\GenericAggregate;
use Ramsey\Uuid\Uuid;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

class ProductionItem extends GenericAggregate
{
    public const int SERVINGS_PRECISION = 2;

    public const string STATUS_PENDING = 'pending';
    public const string STATUS_DONE = 'done';

    public const int LABEL_MAX_LENGTH = 120;

    public string $productionId;
    public int $position;
    public string $recipeId;
    public string $status;
    public float $servingsPlanned;
    public float $servingsCooked = 0.0;
    public string $nameSnapshot;
    public string $emojiSnapshot;
    public ?string $code = null;
    public string $label = '';
    public bool $customized = false;

    /** @var string[] */
    public array $checkedArticleIds = [];

    /** @var int[] */
    public array $checkedStepPositions = [];

    /** @var ProductionItemConsumption[] */
    public array $consumptions = [];

    /**
     * @param ProductionCompositionLine[] $composition
     */
    public static function plan(
        string $productionId,
        int $position,
        string $recipeId,
        float $servingsPlanned,
        string $nameSnapshot,
        string $emojiSnapshot,
        array $composition,
        string $createdByUserId,
        DateTimeGenerator $dateTimeGenerator,
    ): self {
        $now = $dateTimeGenerator->now();

        $item = new self();
        $item->id = Uuid::uuid4()->toString();
        $item->productionId = $productionId;
        $item->position = $position;
        $item->recipeId = $recipeId;
        $item->status = self::STATUS_PENDING;
        $item->servingsPlanned = $servingsPlanned;
        $item->nameSnapshot = $nameSnapshot;
        $item->emojiSnapshot = $emojiSnapshot;
        $item->stampCreation(userId: $createdByUserId, now: $now);
        $item->writeComposition(composition: $composition, userId: $createdByUserId, now: $now);

        return $item;
    }

    /**
     * @param ProductionCompositionLine[] $composition
     */
    public function adjustComposition(
        array $composition,
        bool $customized,
        string $updatedByUserId,
        \DateTime $now,
    ): void {
        $this->customized = $customized;
        $this->writeComposition(
            composition: $this->keepingSources(composition: $composition),
            userId: $updatedByUserId,
            now: $now,
        );
        $this->stampUpdate(userId: $updatedByUserId, now: $now);
    }

    /**
     * Changing the ingredients does not forget which batch each sub-recipe was being served from.
     *
     * @param ProductionCompositionLine[] $composition
     *
     * @return ProductionCompositionLine[]
     */
    private function keepingSources(array $composition): array
    {
        $sources = [];

        foreach ($this->consumptions as $consumption) {
            if ($consumption->isArticle() || null === $consumption->sourceProductionItemId) {
                continue;
            }

            $sources[$consumption->refId] = $consumption->sourceProductionItemId;
        }

        return array_map(callback: static function (ProductionCompositionLine $line) use ($sources): ProductionCompositionLine {
            if ($line->isArticle() || null !== $line->sourceProductionItemId || !isset($sources[$line->refId])) {
                return $line;
            }

            return $line->servedBy(sourceProductionItemId: $sources[$line->refId]);
        }, array: array_values(array: $composition));
    }

    /**
     * Says which cooked batch of a sub-recipe this one is made with, so the diary can follow the
     * chain down to what was really put in the pot.
     */
    public function serveSubRecipeFrom(
        string $recipeId,
        ?string $sourceProductionItemId,
        string $updatedByUserId,
        \DateTime $now,
    ): void {
        $this->consumptions = array_map(
            callback: fn (ProductionItemConsumption $consumption): ProductionItemConsumption => $consumption->isArticle() || $consumption->refId !== $recipeId
                ? $consumption
                : ProductionItemConsumption::take(
                    productionItemId: $this->id,
                    line: $consumption->toLine()->servedBy(sourceProductionItemId: $sourceProductionItemId),
                    createdByUserId: $updatedByUserId,
                    now: $now,
                ),
            array: $this->consumptions,
        );

        $this->stampUpdate(userId: $updatedByUserId, now: $now);
    }

    public function usesSubRecipe(string $recipeId): bool
    {
        foreach ($this->consumptions as $consumption) {
            if (!$consumption->isArticle() && $consumption->refId === $recipeId) {
                return true;
            }
        }

        return false;
    }

    public function labelAs(string $label, string $updatedByUserId, \DateTime $now): void
    {
        $this->label = mb_substr(string: trim(string: $label), start: 0, length: self::LABEL_MAX_LENGTH);
        $this->stampUpdate(userId: $updatedByUserId, now: $now);
    }

    /**
     * @param ProductionCompositionLine[] $composition
     */
    public function cook(
        float $servingsCooked,
        array $composition,
        ?string $code,
        string $cookedByUserId,
        \DateTime $now,
    ): void {
        $this->status = self::STATUS_DONE;
        $this->servingsCooked = $servingsCooked;
        $this->code ??= $code;
        $this->writeComposition(composition: $composition, userId: $cookedByUserId, now: $now);
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
        $composition = ProductionCompositionLine::scaleAll(
            lines: $this->composition(),
            factor: $this->plannedFactor(),
        );

        $this->status = self::STATUS_PENDING;
        $this->servingsCooked = 0.0;
        $this->writeComposition(composition: $composition, userId: $uncookedByUserId, now: $now);
        $this->stampUpdate(userId: $uncookedByUserId, now: $now);
    }

    public function isDone(): bool
    {
        return self::STATUS_DONE === $this->status;
    }

    public function hasComposition(): bool
    {
        return [] !== $this->consumptions;
    }

    /**
     * @return ProductionCompositionLine[]
     */
    public function composition(): array
    {
        return array_values(array: array_map(
            callback: static fn (ProductionItemConsumption $consumption): ProductionCompositionLine => $consumption->toLine(),
            array: $this->consumptions,
        ));
    }

    /**
     * Servings the stored composition is expressed in: what was cooked once done, what was planned otherwise.
     */
    public function compositionServings(): float
    {
        return $this->isDone() ? $this->servingsCooked : $this->servingsPlanned;
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
     * @return array<int, array{kind: string, refId: string, quantity: float, unit: ?string, displayQuantity: float, displayUnit: ?string, sourceProductionItemId: ?string}>
     */
    public function recordedComposition(): array
    {
        return array_map(callback: static fn (ProductionCompositionLine $line): array => [
            'kind' => $line->kind,
            'refId' => $line->refId,
            'quantity' => $line->quantity,
            'unit' => $line->unit,
            'displayQuantity' => $line->displayQuantity,
            'displayUnit' => $line->displayUnit,
            'sourceProductionItemId' => $line->sourceProductionItemId,
        ], array: $this->composition());
    }

    /**
     * @return array{itemId: string, recipeId: string, position: int, status: string, servingsPlanned: float, servingsCooked: float, nameSnapshot: string, emojiSnapshot: string, code: ?string, label: string, customized: bool, checkedArticleIds: string[], checkedStepPositions: int[]}
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
            'code' => $this->code,
            'label' => $this->label,
            'customized' => $this->customized,
            'checkedArticleIds' => $this->checkedArticleIds,
            'checkedStepPositions' => $this->checkedStepPositions,
        ];
    }

    private function plannedFactor(): float
    {
        if ($this->servingsCooked <= 0.0 || $this->servingsPlanned <= 0.0) {
            return 1.0;
        }

        return $this->servingsPlanned / $this->servingsCooked;
    }

    /**
     * @param ProductionCompositionLine[] $composition
     */
    private function writeComposition(array $composition, string $userId, \DateTime $now): void
    {
        $this->consumptions = array_map(
            callback: fn (ProductionCompositionLine $line): ProductionItemConsumption => ProductionItemConsumption::take(
                productionItemId: $this->id,
                line: $line,
                createdByUserId: $userId,
                now: $now,
            ),
            array: array_values(array: $composition),
        );
    }
}
