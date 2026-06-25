<?php

namespace Shared\Shared\Shared\Domain\QueryModel\Dto;

class QueryIncludedResult
{
    public function __construct(
        public readonly string $id,
        public readonly string $aggregateName,
    ) {
    }
}
