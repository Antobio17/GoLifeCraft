<?php

namespace Nutrition\Catalog\Article\Application\Query;

use Nutrition\Catalog\Article\Domain\Exception\GetArticleException;
use Nutrition\Catalog\Article\Domain\QueryModel\GetArticleNeedleDataQuery;
use Shared\Shared\Shared\Application\Query\QueryResult;

final readonly class GetArticleQueryHandler
{
    public function __construct(
        private GetArticleNeedleDataQuery $needleDataQuery,
        private GetArticleDataTransform $dataTransform,
    ) {
    }

    public function __invoke(GetArticleQuery $query): QueryResult
    {
        $article = $this->needleDataQuery->findArticleById(
            articleId: $query->articleId,
        );

        if (null === $article) {
            throw GetArticleException::notFound(articleId: $query->articleId);
        }

        return $this->dataTransform->transform(article: $article);
    }
}
