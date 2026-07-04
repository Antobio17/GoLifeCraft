<?php

namespace Nutrition\Catalog\Article\Application\Query;

use Shared\Shared\Shared\Application\Query\Query;

final readonly class GetArticleQuery implements Query
{
    public function __construct(
        public string $articleId,
    ) {
    }

    public static function getName(): string
    {
        return 'golifecraft.nutrition.query.1.article.get';
    }
}
