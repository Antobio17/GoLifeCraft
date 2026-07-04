<?php

namespace Nutrition\Catalog\Category\Application\Query;

use Nutrition\Catalog\Category\Domain\Exception\GetCategoryException;
use Nutrition\Catalog\Category\Domain\QueryModel\GetCategoryNeedleDataQuery;
use Shared\Shared\Shared\Application\Query\QueryResult;

final readonly class GetCategoryQueryHandler
{
    public function __construct(
        private GetCategoryNeedleDataQuery $needleDataQuery,
        private GetCategoryDataTransform $dataTransform,
    ) {
    }

    public function __invoke(GetCategoryQuery $query): QueryResult
    {
        $category = $this->needleDataQuery->findCategoryById(
            categoryId: $query->categoryId,
        );

        if (null === $category) {
            throw GetCategoryException::notFound(categoryId: $query->categoryId);
        }

        return $this->dataTransform->transform(category: $category);
    }
}
