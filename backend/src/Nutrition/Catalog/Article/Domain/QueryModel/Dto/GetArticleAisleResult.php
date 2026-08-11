<?php

namespace Nutrition\Catalog\Article\Domain\QueryModel\Dto;

use Shared\Shared\Shared\Domain\QueryModel\Dto\QueryRelationshipResult;

final class GetArticleAisleResult extends QueryRelationshipResult
{
    public function __construct(
        string $id,
        string $aggregateName,
        ?string $relationshipName,
        public readonly string $name,
        public readonly int $position,
    ) {
        parent::__construct(id: $id, aggregateName: $aggregateName, relationshipName: $relationshipName);
    }
}
