<?php

namespace Economy\Finance\Account\Domain\Exception;

use Shared\Shared\Shared\Domain\Exception\BaseException;

final class DeleteFinanceAccountException extends BaseException
{
    public static function notFound(string $financeAccountId): self
    {
        return new static(
            title: 'The account does not exist.',
            keyTranslation: 'finance.account.not.found',
            details: ['financeAccountId' => $financeAccountId]
        );
    }

    public static function hasTransactions(string $financeAccountId): self
    {
        return new static(
            title: 'The account still has movements attached to it.',
            keyTranslation: 'finance.account.has.transactions',
            details: ['financeAccountId' => $financeAccountId]
        );
    }
}
