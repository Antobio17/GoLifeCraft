<?php

namespace Nutrition\Kitchen\Production\Domain\QueryModel;

use Nutrition\Kitchen\Production\Domain\QueryModel\Dto\GetProductionsResult;

interface GetProductionsNeedleDataQuery
{
    /**
     * @return GetProductionsResult[]
     */
    public function findProductions(int $pageSize, int $pageNumber, ?string $orderBy = null): array;

    public function totalProductions(): int;
}
