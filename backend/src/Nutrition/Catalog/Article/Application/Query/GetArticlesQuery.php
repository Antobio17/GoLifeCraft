<?php

namespace Nutrition\Catalog\Article\Application\Query;

use Shared\Shared\Shared\Application\Query\Query;

final readonly class GetArticlesQuery implements Query
{
    public function __construct(
        public int $pageNumber,
        public int $pageSize,
        public ?string $filterName = null,
        public ?string $filterCategory = null,
        public ?string $filterBrand = null,
        public ?string $filterStore = null,
        public ?string $orderBy = null,
    ) {
    }

    public static function getName(): string
    {
        return 'golifecraft.nutrition.query.1.articles.get';
    }
}
