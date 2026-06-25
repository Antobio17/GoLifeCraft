<?php

namespace Shared\Shared\DomainEventLog\Domain\Exception;

use Shared\Shared\Shared\Domain\Exception\BaseException;

final class GetDomainEventLogException extends BaseException
{
    public static function notFound(): self
    {
        return new static(
            title: 'Domain event log not found.',
            keyTranslation: 'domain.event.log.not.found',
            details: []
        );
    }

    public static function accessDeniedForReadOnlyRole(): self
    {
        return new static(
            title: 'Access denied: read-only users cannot read domain event logs.',
            keyTranslation: 'access.denied.read.only.role',
            details: []
        );
    }
}
