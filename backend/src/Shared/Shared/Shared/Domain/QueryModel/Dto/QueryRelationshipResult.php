<?php

namespace Shared\Shared\Shared\Domain\QueryModel\Dto;

class QueryRelationshipResult
{
    public function __construct(
        public readonly string $id,
        public readonly string $aggregateName,
        public readonly ?string $relationshipName = null,
    ) {
    }
}
