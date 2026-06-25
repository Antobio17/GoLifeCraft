<?php

namespace Shared\Shared\DomainEventLog\Application\Query;

use Shared\Shared\Shared\Application\Query\Query;

final readonly class GetDomainEventLogQuery implements Query
{
    public function __construct(
        public string $domainEventLogId,
        public string $userRole,
    ) {
    }

    public static function getName(): string
    {
        return 'golifecraft.shared.query.1.domain_event_log.get_one';
    }
}
