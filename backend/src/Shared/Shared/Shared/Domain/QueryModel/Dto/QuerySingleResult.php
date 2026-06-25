<?php

namespace Shared\Shared\Shared\Domain\QueryModel\Dto;

use Shared\Shared\Shared\Application\Query\QueryResult;

final readonly class QuerySingleResult implements QueryResult
{
    /**
     * @param QueryIncludedResult[] $included
     */
    public function __construct(
        public ?QueryAggregateResult $item,
        public array $included = [],
    ) {
    }
}
