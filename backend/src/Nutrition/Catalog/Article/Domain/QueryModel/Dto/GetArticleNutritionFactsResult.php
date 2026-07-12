<?php

namespace Nutrition\Catalog\Article\Domain\QueryModel\Dto;

use Shared\Shared\Shared\Domain\QueryModel\Dto\QueryRelationshipResult;

final class GetArticleNutritionFactsResult extends QueryRelationshipResult
{
    public function __construct(
        string $id,
        string $aggregateName,
        ?string $relationshipName,
        public readonly float $referenceAmount,
        public readonly ?float $calories,
        public readonly ?float $protein,
        public readonly ?float $carbs,
        public readonly ?float $sugars,
        public readonly ?float $fat,
        public readonly ?float $saturatedFat,
        public readonly ?float $fiber,
        public readonly ?float $salt,
    ) {
        parent::__construct(id: $id, aggregateName: $aggregateName, relationshipName: $relationshipName);
    }
}
