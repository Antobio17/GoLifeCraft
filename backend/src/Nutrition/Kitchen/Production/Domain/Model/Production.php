<?php

namespace Nutrition\Kitchen\Production\Domain\Model;

use Integration\Mcp\Server\Domain\Model\GenericAggregate;
use Nutrition\Kitchen\Production\Domain\Event\ProductionCooked;
use Nutrition\Kitchen\Production\Domain\Event\ProductionDiscarded;
use Nutrition\Kitchen\Production\Domain\Event\ProductionStarted;
use Nutrition\Kitchen\Production\Domain\Exception\FinishProductionException;
use Nutrition\Kitchen\Production\Domain\Exception\StartProductionException;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

class Production extends GenericAggregate
{
    public const string STATUS_PENDING = 'pending';
    public const string STATUS_COOKING = 'cooking';
    public const string STATUS_DONE = 'done';

    public string $recipeId;
    public string $cookDate;
    public string $status;
    public float $servingsCooked = 0.0;
    public string $nameSnapshot;
    public string $emojiSnapshot;

    public static function start(
        string $id,
        string $recipeId,
        string $cookDate,
        float $servingsPlanned,
        string $nameSnapshot,
        string $emojiSnapshot,
        string $startedByUserId,
        DateTimeGenerator $dateTimeGenerator,
    ): self {
        if (!self::isCookDate(cookDate: $cookDate)) {
            throw StartProductionException::invalidCookDate(cookDate: $cookDate);
        }

        if ($servingsPlanned <= 0.0) {
            throw StartProductionException::servingsMustBePositive(servings: $servingsPlanned);
        }

        $now = $dateTimeGenerator->now();

        $production = new self();
        $production->id = $id;
        $production->recipeId = $recipeId;
        $production->cookDate = $cookDate;
        $production->status = self::STATUS_COOKING;
        $production->servingsCooked = $servingsPlanned;
        $production->nameSnapshot = $nameSnapshot;
        $production->emojiSnapshot = $emojiSnapshot;
        $production->stampCreation(userId: $startedByUserId, now: $now);

        $production->record(event: new ProductionStarted(
            aggregateId: $id,
            occurredOn: $now,
            recipeId: $recipeId,
            cookDate: $cookDate,
            status: $production->status,
            servingsPlanned: $servingsPlanned,
            nameSnapshot: $nameSnapshot,
            emojiSnapshot: $emojiSnapshot,
            createdAt: $now,
            updatedAt: $now,
            createdByUserId: $startedByUserId,
            updatedByUserId: $startedByUserId,
        ));

        return $production;
    }

    /**
     * @param array<int, array{articleId: string, quantity: float, unit: string}> $consumedArticles
     */
    public function finish(
        float $servingsCooked,
        array $consumedArticles,
        string $finishedByUserId,
        DateTimeGenerator $dateTimeGenerator,
    ): void {
        if (self::STATUS_DONE === $this->status) {
            throw FinishProductionException::productionAlreadyFinished(productionId: $this->id);
        }

        if ($servingsCooked <= 0.0) {
            throw FinishProductionException::servingsMustBePositive(servings: $servingsCooked);
        }

        $now = $dateTimeGenerator->now();

        $this->servingsCooked = $servingsCooked;
        $this->status = self::STATUS_DONE;
        $this->stampUpdate(userId: $finishedByUserId, now: $now);

        $this->record(event: new ProductionCooked(
            aggregateId: $this->id,
            occurredOn: $now,
            recipeId: $this->recipeId,
            cookDate: $this->cookDate,
            status: $this->status,
            servingsCooked: $servingsCooked,
            nameSnapshot: $this->nameSnapshot,
            emojiSnapshot: $this->emojiSnapshot,
            consumedArticles: $consumedArticles,
            createdAt: $this->createdAt,
            updatedAt: $now,
            createdByUserId: $this->createdByUserId,
            updatedByUserId: $finishedByUserId,
        ));
    }

    public function discard(
        string $discardedByUserId,
        DateTimeGenerator $dateTimeGenerator,
    ): void {
        $now = $dateTimeGenerator->now();
        $this->stampUpdate(userId: $discardedByUserId, now: $now);

        $this->record(event: new ProductionDiscarded(
            aggregateId: $this->id,
            occurredOn: $now,
            recipeId: $this->recipeId,
            cookDate: $this->cookDate,
            status: $this->status,
            servingsCooked: $this->servingsCooked,
            nameSnapshot: $this->nameSnapshot,
            emojiSnapshot: $this->emojiSnapshot,
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

    private static function isCookDate(string $cookDate): bool
    {
        if (1 !== preg_match(pattern: '/^\d{4}-\d{2}-\d{2}$/', subject: $cookDate)) {
            return false;
        }

        return false !== \DateTimeImmutable::createFromFormat(format: '!Y-m-d', datetime: $cookDate);
    }
}
