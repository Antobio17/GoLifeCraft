<?php

namespace Nutrition\GlobalCatalog\Article\Application\Query;

use Shared\Shared\Shared\Application\Query\Query;

final readonly class GetGlobalArticleFacetsQuery implements Query
{
    public function __construct(
        public ?string $filterSource = null,
    ) {
    }

    public static function getName(): string
    {
        return 'golifecraft.nutrition.query.1.global_article.facets.get';
    }
}
