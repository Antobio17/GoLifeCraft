<?php

namespace Nutrition\Catalog\Supermarket\Application\Query;

use Shared\Shared\Shared\Application\Query\Query;

final readonly class GetSupermarketsQuery implements Query
{
    public function __construct(
        public int $pageNumber,
        public int $pageSize,
        public ?string $filterName = null,
        public ?string $orderBy = null,
    ) {
    }

    public static function getName(): string
    {
        return 'golifecraft.nutrition.query.1.supermarkets.get';
    }
}
