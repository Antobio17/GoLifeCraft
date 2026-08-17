<?php

namespace Economy\Finance\BalanceCheck\Domain\Exception;

use Shared\Shared\Shared\Domain\Exception\BaseException;

final class CreateFinanceBalanceCheckException extends BaseException
{
    public static function accountRequired(): self
    {
        return new static(
            title: 'The balance check needs an account.',
            keyTranslation: 'finance.balance.check.account.required',
            details: []
        );
    }

    public static function accountNotFound(string $accountId): self
    {
        return new static(
            title: 'The account does not exist.',
            keyTranslation: 'finance.balance.check.account.not.found',
            details: ['accountId' => $accountId]
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
