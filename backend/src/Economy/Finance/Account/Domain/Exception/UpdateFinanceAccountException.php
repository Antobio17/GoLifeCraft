<?php

namespace Economy\Finance\Account\Domain\Exception;

use Shared\Shared\Shared\Domain\Exception\BaseException;

final class UpdateFinanceAccountException extends BaseException
{
    public static function notFound(string $financeAccountId): self
    {
        return new static(
            title: 'The account does not exist.',
            keyTranslation: 'finance.account.not.found',
            details: ['financeAccountId' => $financeAccountId]
        );
    }

    public static function invalidName(int $maxLength): self
    {
        return new static(
            title: 'The account name is required and must be shorter than the allowed length.',
            keyTranslation: 'finance.account.invalid.name',
            details: ['maxLength' => $maxLength]
        );
    }

    public static function invalidType(string $type): self
    {
        return new static(
            title: 'The account type is not supported.',
            keyTranslation: 'finance.account.invalid.type',
            details: ['type' => $type]
        );
    }

    public static function alreadyExists(string $name): self
    {
        return new static(
            title: 'There is already an account with that name.',
            keyTranslation: 'finance.account.already.exists',
            details: ['name' => $name]
        );
    }
}
