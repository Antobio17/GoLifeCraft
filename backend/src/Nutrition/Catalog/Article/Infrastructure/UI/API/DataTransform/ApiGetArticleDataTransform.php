<?php

namespace Nutrition\Catalog\Article\Infrastructure\UI\API\DataTransform;

use Nutrition\Catalog\Article\Application\Query\GetArticleDataTransform;
use Nutrition\Catalog\Article\Domain\QueryModel\Dto\GetArticleResult;
use Shared\Shared\Shared\Application\Query\QueryResult;
use Shared\Shared\Shared\Domain\QueryModel\Dto\QuerySingleResult;

final class ApiGetArticleDataTransform implements GetArticleDataTransform
{
    public function transform(GetArticleResult $article): QueryResult
    {
        return new QuerySingleResult(item: $article);
    }
}
