<?php

namespace Nutrition\Catalog\Supermarket\Application\Query;

use Shared\Shared\Shared\Application\Query\Query;

final readonly class GetSupermarketQuery implements Query
{
    public function __construct(
        public string $supermarketId,
    ) {
    }

    public static function getName(): string
    {
        return 'golifecraft.nutrition.query.1.supermarket.get';
    }
}
