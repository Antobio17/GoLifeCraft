<?php

namespace Nutrition\GlobalCatalog\Article\Infrastructure\UI\API\DataTransform;

use Nutrition\GlobalCatalog\Article\Application\Query\GetGlobalArticleDataTransform;
use Nutrition\GlobalCatalog\Article\Domain\QueryModel\Dto\GetGlobalArticleResult;
use Shared\Shared\Shared\Application\Query\QueryResult;
use Shared\Shared\Shared\Domain\QueryModel\Dto\QuerySingleResult;

final class ApiGetGlobalArticleDataTransform implements GetGlobalArticleDataTransform
{
    public function transform(GetGlobalArticleResult $globalArticle): QueryResult
    {
        return new QuerySingleResult(item: $globalArticle);
    }
}
