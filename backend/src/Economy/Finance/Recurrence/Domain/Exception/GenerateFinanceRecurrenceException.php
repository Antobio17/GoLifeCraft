<?php

namespace Economy\Finance\Recurrence\Domain\Exception;

use Shared\Shared\Shared\Domain\Exception\BaseException;

final class GenerateFinanceRecurrenceException extends BaseException
{
    public static function notFound(string $financeRecurrenceId): self
    {
        return new static(
            title: 'The recurring movement does not exist.',
            keyTranslation: 'finance.recurrence.not.found',
            details: ['financeRecurrenceId' => $financeRecurrenceId]
        );
    }
}
