<?php

namespace Economy\Finance\Transaction\Domain\Exception;

use Shared\Shared\Shared\Domain\Exception\BaseException;

final class DeleteFinanceTransactionException extends BaseException
{
    public static function notFound(string $financeTransactionId): self
    {
        return new static(
            title: 'The transaction to delete does not exist.',
            keyTranslation: 'finance.transaction.not.found',
            details: ['financeTransactionId' => $financeTransactionId]
        );
    }
}
