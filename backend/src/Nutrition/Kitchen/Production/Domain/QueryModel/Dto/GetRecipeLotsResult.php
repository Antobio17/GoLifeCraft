<?php

namespace Nutrition\Kitchen\Production\Domain\QueryModel\Dto;

use Shared\Shared\Shared\Domain\QueryModel\Dto\QueryAggregateResult;

final class GetRecipeLotsResult extends QueryAggregateResult
{
    public function __construct(
        string $id,
        string $aggregateName,
        public readonly string $productionId,
        public readonly string $recipeId,
        public readonly string $name,
        public readonly string $emoji,
        public readonly ?string $image,
        public readonly ?string $code,
        public readonly string $label,
        public readonly bool $customized,
        public readonly string $cookedOn,
        public readonly float $servingsCooked,
        public readonly float $servingsAssigned,
        public readonly float $servingsLeft,
        public readonly \DateTime $createdAt,
        public readonly \DateTime $updatedAt,
        public readonly string $createdByUserId,
        public readonly string $updatedByUserId,
    ) {
        parent::__construct(id: $id, aggregateName: $aggregateName);
    }
}
