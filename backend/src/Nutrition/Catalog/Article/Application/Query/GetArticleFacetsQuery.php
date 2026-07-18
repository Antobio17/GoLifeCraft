<?php

namespace Nutrition\Catalog\Article\Application\Query;

use Shared\Shared\Shared\Application\Query\Query;

final readonly class GetArticleFacetsQuery implements Query
{
    public static function getName(): string
    {
        return 'golifecraft.nutrition.query.1.article.facets.get';
    }
}
