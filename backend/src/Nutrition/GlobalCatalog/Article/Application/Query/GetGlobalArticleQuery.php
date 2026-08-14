<?php

namespace Nutrition\GlobalCatalog\Article\Application\Query;

use Shared\Shared\Shared\Application\Query\Query;

final readonly class GetGlobalArticleQuery implements Query
{
    public function __construct(
        public string $globalArticleId,
    ) {
    }

    public static function getName(): string
    {
        return 'golifecraft.nutrition.query.1.global_article.get';
    }
}
