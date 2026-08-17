<?php

namespace Economy\Finance\BalanceCheck\Domain\Exception;

use Shared\Shared\Shared\Domain\Exception\BaseException;

final class DeleteFinanceBalanceCheckException extends BaseException
{
    public static function notFound(string $financeBalanceCheckId): self
    {
        return new static(
            title: 'The balance check does not exist.',
            keyTranslation: 'finance.balance.check.not.found',
            details: ['financeBalanceCheckId' => $financeBalanceCheckId]
        );
    }
}
