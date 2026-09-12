<?php

namespace Nutrition\Shopping\Ticket\Application\Query;

use Nutrition\Shopping\Ticket\Domain\QueryModel\Dto\TicketDraftPhoto;
use Shared\Shared\Shared\Application\Query\Query;

final readonly class GetTicketDraftQuery implements Query
{
    /**
     * @param TicketDraftPhoto[] $photos
     */
    public function __construct(
        public array $photos,
        public string $userSessionId,
    ) {
    }

    public static function getName(): string
    {
        return 'golifecraft.nutrition.query.1.ticket_draft.get';
    }
}
