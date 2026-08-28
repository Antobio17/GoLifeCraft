<?php

namespace Nutrition\Kitchen\Production\Application\Query;

use Shared\Shared\Shared\Application\Query\Query;

final readonly class GetProductionProposalQuery implements Query
{
    public function __construct(
        public string $fromDate,
        public string $toDate,
    ) {
    }

    public static function getName(): string
    {
        return 'golifecraft.nutrition.query.1.production_proposal.get';
    }
}
