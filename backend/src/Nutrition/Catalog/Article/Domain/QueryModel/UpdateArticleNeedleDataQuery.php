<?php

namespace Nutrition\Catalog\Article\Domain\QueryModel;

interface UpdateArticleNeedleDataQuery
{
    public function articleWithNameAlreadyExists(
        string $name,
        string $excludingArticleId,
    ): bool;
}
