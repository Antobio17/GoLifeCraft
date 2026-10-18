<?php

namespace Nutrition\Diary\Diary\Application\Query;

use Shared\Shared\Shared\Application\Query\Query;

final readonly class GetPastPendingDiaryEntryIdsQuery implements Query
{
    public function __construct(
        public string $fromDate,
        public string $toDate,
    ) {
    }

    public static function getName(): string
    {
        return 'golifecraft.nutrition.query.1.diary_entry.get_past_pending_ids';
    }
}
