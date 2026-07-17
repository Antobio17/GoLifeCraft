<?php

namespace Shared\Tenant\Tenant\Domain\Exception;

use Shared\Shared\Shared\Domain\Exception\BaseException;

final class ProvisionTenantException extends BaseException
{
    public static function invalidTenantId(string $tenantId): self
    {
        return new static(
            title: 'Invalid tenant identifier.',
            keyTranslation: 'tenant.invalid_identifier',
            details: ['tenantId' => $tenantId]
        );
    }
}
