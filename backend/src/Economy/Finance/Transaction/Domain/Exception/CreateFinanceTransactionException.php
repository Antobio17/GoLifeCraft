<?php

namespace Economy\Finance\Transaction\Domain\Exception;

use Shared\Shared\Shared\Domain\Exception\BaseException;

final class CreateFinanceTransactionException extends BaseException
{
    public static function accountRequired(): self
    {
        return new static(
            title: 'The movement needs an account.',
            keyTranslation: 'finance.transaction.account.required',
            details: []
        );
    }

    public static function accountNotFound(string $accountId): self
    {
        return new static(
            title: 'The account does not exist.',
            keyTranslation: 'finance.transaction.account.not.found',
            details: ['accountId' => $accountId]
        );
    }

    public static function invalidDate(string $transactionDate): self
    {
        return new static(
            title: 'The transaction date must follow the YYYY-MM-DD format.',
            keyTranslation: 'finance.transaction.invalid.date',
            details: ['transactionDate' => $transactionDate]
        );
    }

    public static function invalidKind(string $kind): self
    {
        return new static(
            title: 'The transaction kind is not supported.',
            keyTranslation: 'finance.transaction.invalid.kind',
            details: ['kind' => $kind]
        );
    }

    public static function invalidAmount(float $amount): self
    {
        return new static(
            title: 'The transaction amount must be greater than zero.',
            keyTranslation: 'finance.transaction.invalid.amount',
            details: ['amount' => $amount]
        );
    }

    public static function invalidCategory(string $category): self
    {
        return new static(
            title: 'The transaction category is not supported.',
            keyTranslation: 'finance.transaction.invalid.category',
            details: ['category' => $category]
        );
    }

    public static function invalidSource(string $source): self
    {
        return new static(
            title: 'The transaction source is not supported.',
            keyTranslation: 'finance.transaction.invalid.source',
            details: ['source' => $source]
        );
    }

    public static function noteTooLong(int $maxLength): self
    {
        return new static(
            title: 'The transaction description is too long.',
            keyTranslation: 'finance.transaction.note.too.long',
            details: ['maxLength' => $maxLength]
        );
    }

    public static function storeTooLong(int $maxLength): self
    {
        return new static(
            title: 'The transaction store is too long.',
            keyTranslation: 'finance.transaction.store.too.long',
            details: ['maxLength' => $maxLength]
        );
    }
}
