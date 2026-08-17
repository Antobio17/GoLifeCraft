<?php

namespace Economy\Finance\BalanceCheck\Domain\Exception;

use Shared\Shared\Shared\Domain\Exception\BaseException;

final class UpdateFinanceBalanceCheckException extends BaseException
{
    public static function notFound(string $financeBalanceCheckId): self
    {
        return new static(
            title: 'The balance check does not exist.',
            keyTranslation: 'finance.balance.check.not.found',
            details: ['financeBalanceCheckId' => $financeBalanceCheckId]
        );
    }

    public static function invalidDate(string $checkDate): self
    {
        return new static(
            title: 'The balance check date must follow the YYYY-MM-DD format.',
            keyTranslation: 'finance.balance.check.invalid.date',
            details: ['checkDate' => $checkDate]
        );
    }

    public static function invalidAmount(float $amount): self
    {
        return new static(
            title: 'The balance check amount is out of range.',
            keyTranslation: 'finance.balance.check.invalid.amount',
            details: ['amount' => $amount]
        );
    }

    public static function noteTooLong(int $maxLength): self
    {
        return new static(
            title: 'The balance check note is too long.',
            keyTranslation: 'finance.balance.check.note.too.long',
            details: ['maxLength' => $maxLength]
        );
    }

    public static function alreadyExists(string $accountId, string $checkDate): self
    {
        return new static(
            title: 'That account already has a balance check on that date.',
            keyTranslation: 'finance.balance.check.already.exists',
            details: ['accountId' => $accountId, 'checkDate' => $checkDate]
        );
    }
}
