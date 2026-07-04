<?php

namespace Nutrition\Catalog\Supermarket\Application\Query;

use Nutrition\Catalog\Supermarket\Domain\Exception\GetSupermarketException;
use Nutrition\Catalog\Supermarket\Domain\QueryModel\GetSupermarketNeedleDataQuery;
use Shared\Shared\Shared\Application\Query\QueryResult;

final readonly class GetSupermarketQueryHandler
{
    public function __construct(
        private GetSupermarketNeedleDataQuery $needleDataQuery,
        private GetSupermarketDataTransform $dataTransform,
    ) {
    }

    public function __invoke(GetSupermarketQuery $query): QueryResult
    {
        $supermarket = $this->needleDataQuery->findSupermarketById(
            supermarketId: $query->supermarketId,
        );

        if (null === $supermarket) {
            throw GetSupermarketException::notFound(supermarketId: $query->supermarketId);
        }

        return $this->dataTransform->transform(supermarket: $supermarket);
    }
}
