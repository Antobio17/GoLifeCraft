<?php

namespace Shared\Shared\Shared\Domain\QueryModel\Dto;

class QueryAggregateResult
{
    /**
     * @param QueryRelationshipResult[] $relationships
     */
    public function __construct(
        public readonly string $id,
        public readonly string $aggregateName,
        public array $relationships = [],
    ) {
    }
}
