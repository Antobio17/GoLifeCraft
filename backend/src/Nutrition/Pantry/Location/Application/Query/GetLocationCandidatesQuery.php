<?php

namespace Nutrition\Pantry\Location\Application\Query;

use Shared\Shared\Shared\Application\Query\Query;

final readonly class GetLocationCandidatesQuery implements Query
{
    public function __construct(
        public string $locationId,
        public int $pageNumber,
        public int $pageSize,
        public ?string $filterName = null,
        public ?string $filterKind = null,
    ) {
    }

    public static function getName(): string
    {
        return 'golifecraft.nutrition.query.1.pantry_location_candidates.get';
    }
}
