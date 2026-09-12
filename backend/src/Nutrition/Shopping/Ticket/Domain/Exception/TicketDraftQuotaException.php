<?php

namespace Nutrition\Shopping\Ticket\Domain\Exception;

use Shared\Shared\Shared\Domain\Exception\BaseException;

final class TicketDraftQuotaException extends BaseException
{
    public static function dailyLimitReached(int $limit): self
    {
        return new static(
            title: 'The daily ticket scan limit has been reached.',
            keyTranslation: 'ticket.draft.daily.limit.reached',
            details: ['limit' => $limit]
        );
    }
}
