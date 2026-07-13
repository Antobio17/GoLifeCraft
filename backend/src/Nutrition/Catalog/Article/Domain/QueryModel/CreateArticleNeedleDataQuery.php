<?php

namespace Nutrition\Catalog\Article\Domain\QueryModel;

interface CreateArticleNeedleDataQuery
{
    public function articleWithNameAlreadyExists(
        string $name,
    ): bool;
}
