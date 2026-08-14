<?php

namespace Nutrition\GlobalCatalog\Article\Application\Query;

use Nutrition\GlobalCatalog\Article\Domain\Exception\GetGlobalArticleException;
use Nutrition\GlobalCatalog\Article\Domain\QueryModel\GetGlobalArticleNeedleDataQuery;
use Shared\Shared\Shared\Application\Query\QueryResult;

final readonly class GetGlobalArticleQueryHandler
{
    public function __construct(
        private GetGlobalArticleNeedleDataQuery $needleDataQuery,
        private GetGlobalArticleDataTransform $dataTransform,
    ) {
    }

    public function __invoke(GetGlobalArticleQuery $query): QueryResult
    {
        $globalArticle = $this->needleDataQuery->findGlobalArticleById(
            globalArticleId: $query->globalArticleId,
        );

        if (null === $globalArticle) {
            throw GetGlobalArticleException::notFound(globalArticleId: $query->globalArticleId);
        }

        return $this->dataTransform->transform(globalArticle: $globalArticle);
    }
}
