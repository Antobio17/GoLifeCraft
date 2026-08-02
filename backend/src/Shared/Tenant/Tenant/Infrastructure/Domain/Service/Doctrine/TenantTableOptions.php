<?php

namespace Shared\Tenant\Tenant\Infrastructure\Domain\Service\Doctrine;

final class TenantTableOptions
{
    public const string CHARSET = 'utf8mb4';

    public const string COLLATION = 'utf8mb4_unicode_ci';

    public const array DEFAULTS = [
        'charset' => self::CHARSET,
        'collation' => self::COLLATION,
    ];
}
