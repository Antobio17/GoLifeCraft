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

    /**
     * Ids of the articles already ticked off in the checklist. They survive the cooking so that
     * reopening a recipe shows the same ticks you left, instead of a blank list.
     *
     * @var string[]
     */
    public array $checkedArticleIds = [];

    /**
     * Positions of the steps already ticked off. Cooking the recipe fills this with every step:
     * you just did them all, and coming back to a finished recipe should show it that way.
     *
     * @var int[]
     */
    public array $checkedStepPositions = [];

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
     * @param int[] $stepPositions
     */
    public function cook(
        float $servingsCooked,
        array $stepPositions,
        string $cookedByUserId,
        \DateTime $now,
    ): void {
        $this->status = self::STATUS_DONE;
        $this->servingsCooked = $servingsCooked;
        $this->checkedStepPositions = array_values(array: array_unique(array: $stepPositions));
        $this->stampUpdate(userId: $cookedByUserId, now: $now);
    }

    /**
     * @param string[] $articleIds
     */
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
        $this->stampUpdate(userId: $uncookedByUserId, now: $now);
    }

    public function isDone(): bool
    {
        return self::STATUS_DONE === $this->status;
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
}
