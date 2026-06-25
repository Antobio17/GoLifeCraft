<?php

namespace Shared\Shared\DomainEventLog\Application\Query;

use Shared\Shared\Shared\Application\Query\Query;

final readonly class GetDomainEventLogsQuery implements Query
{
    public function __construct(
        public string $userRole,
        public int $page,
        public int $pageSize,
        public ?string $filterEventName = null,
        public ?string $filterDateFrom = null,
        public ?string $filterDateTo = null,
    ) {
    }

    public static function getName(): string
    {
        return 'golifecraft.shared.query.1.domain_event_log.get';
    }
}
