<?php

namespace Shared\Shared\Shared\Domain\QueryModel\Dto;

use Shared\Shared\Shared\Application\Query\QueryResult;

readonly class QueryCollectionResult implements QueryResult
{
    /**
     * @param QueryAggregateResult[] $items
     * @param QueryIncludedResult[]  $included
     */
    public function __construct(
        public array $items,
        public int $pageNumber,
        public int $pageSize,
        public int $total,
        public array $included = [],
    ) {
    }
}
