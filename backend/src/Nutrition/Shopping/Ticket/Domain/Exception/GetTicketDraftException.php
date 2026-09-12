<?php

namespace Nutrition\Shopping\Ticket\Domain\Exception;

use Shared\Shared\Shared\Domain\Exception\BaseException;

final class GetTicketDraftException extends BaseException
{
    public static function extractorIsNotAvailable(): self
    {
        return new static(
            title: 'The ticket scan service is not available right now.',
            keyTranslation: 'ticket.draft.extractor.unavailable',
            details: []
        );
    }
}
