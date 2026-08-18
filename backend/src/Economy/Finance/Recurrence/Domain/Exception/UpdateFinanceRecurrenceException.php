<?php

namespace Economy\Finance\Recurrence\Domain\Exception;

use Shared\Shared\Shared\Domain\Exception\BaseException;

final class UpdateFinanceRecurrenceException extends BaseException
{
    public static function notFound(string $financeRecurrenceId): self
    {
        return new static(
            title: 'The recurring movement does not exist.',
            keyTranslation: 'finance.recurrence.not.found',
            details: ['financeRecurrenceId' => $financeRecurrenceId]
        );
    }

    public static function accountRequired(): self
    {
        return new static(
            title: 'The recurring movement needs an account.',
            keyTranslation: 'finance.recurrence.account.required',
            details: []
        );
    }

    public static function accountNotFound(string $accountId): self
    {
        return new static(
            title: 'The account does not exist.',
            keyTranslation: 'finance.recurrence.account.not.found',
            details: ['accountId' => $accountId]
        );
    }

    public static function invalidKind(string $kind): self
    {
        return new static(
            title: 'The recurring movement kind is not supported.',
            keyTranslation: 'finance.recurrence.invalid.kind',
            details: ['kind' => $kind]
        );
    }

    public static function invalidAmount(float $amount): self
    {
        return new static(
            title: 'The recurring movement amount must be greater than zero.',
            keyTranslation: 'finance.recurrence.invalid.amount',
            details: ['amount' => $amount]
        );
    }

    public static function invalidCategory(string $category): self
    {
        return new static(
            title: 'The recurring movement category is not supported.',
            keyTranslation: 'finance.recurrence.invalid.category',
            details: ['category' => $category]
        );
    }

    public static function invalidDayOfMonth(int $dayOfMonth): self
    {
        return new static(
            title: 'The charge day must be a day of the month between 1 and 31.',
            keyTranslation: 'finance.recurrence.invalid.day.of.month',
            details: ['dayOfMonth' => $dayOfMonth]
        );
    }

    public static function invalidMonth(string $month): self
    {
        return new static(
            title: 'The month must follow the YYYY-MM format.',
            keyTranslation: 'finance.recurrence.invalid.month',
            details: ['month' => $month]
        );
    }

    public static function endMonthBeforeStartMonth(string $startMonth, string $endMonth): self
    {
        return new static(
            title: 'The last month cannot be earlier than the first one.',
            keyTranslation: 'finance.recurrence.end.month.before.start.month',
            details: ['startMonth' => $startMonth, 'endMonth' => $endMonth]
        );
    }

    public static function noteTooLong(int $maxLength): self
    {
        return new static(
            title: 'The recurring movement description is too long.',
            keyTranslation: 'finance.recurrence.note.too.long',
            details: ['maxLength' => $maxLength]
        );
    }

    public static function storeTooLong(int $maxLength): self
    {
        return new static(
            title: 'The recurring movement store is too long.',
            keyTranslation: 'finance.recurrence.store.too.long',
            details: ['maxLength' => $maxLength]
        );
    }
}
