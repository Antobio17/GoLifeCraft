<?php

namespace Shared\Shared\DomainEventLog\Infrastructure\Domain\QueryModel\InMemory;

use Shared\Shared\DomainEventLog\Domain\QueryModel\Dto\DomainEventLogUserResult;
use Shared\Shared\DomainEventLog\Domain\QueryModel\Dto\GetDomainEventLogsResult;
use Shared\Shared\DomainEventLog\Domain\QueryModel\GetDomainEventLogsNeedleDataQuery;

final class InMemoryGetDomainEventLogsNeedleDataQuery implements GetDomainEventLogsNeedleDataQuery
{
    /** @var GetDomainEventLogsResult[] */
    private array $results = [];

    public function addResult(GetDomainEventLogsResult $result): void
    {
        $this->results[] = $result;
    }

    public function findDomainEventLogs(
        int $pageSize,
        int $pageNumber,
        ?string $filterEventName = null,
        ?string $filterDateFrom = null,
        ?string $filterDateTo = null,
    ): array {
        $filtered = $this->applyFilters(
            results: $this->results,
            filterEventName: $filterEventName,
            filterDateFrom: $filterDateFrom,
            filterDateTo: $filterDateTo,
        );

        return array_values(
            array: array_slice(
                array: $filtered,
                offset: ($pageNumber - 1) * $pageSize,
                length: $pageSize,
            )
        );
    }

    public function totalDomainEventLogs(
        ?string $filterEventName = null,
        ?string $filterDateFrom = null,
        ?string $filterDateTo = null,
    ): int {
        return count(value: $this->applyFilters(
            results: $this->results,
            filterEventName: $filterEventName,
            filterDateFrom: $filterDateFrom,
            filterDateTo: $filterDateTo,
        ));
    }

    public static function buildDefaultUserResult(): DomainEventLogUserResult
    {
        return new DomainEventLogUserResult(
            id: 'user-id-1',
            username: 'testuser',
            name: 'Test',
            lastname: 'User',
        );
    }

    /**
     * @param GetDomainEventLogsResult[] $results
     *
     * @return GetDomainEventLogsResult[]
     */
    private function applyFilters(
        array $results,
        ?string $filterEventName,
        ?string $filterDateFrom,
        ?string $filterDateTo,
    ): array {
        return array_filter(array: $results, callback: function (GetDomainEventLogsResult $result) use ($filterEventName, $filterDateFrom, $filterDateTo): bool {
            if (null !== $filterEventName && $result->eventName !== $filterEventName) {
                return false;
            }

            if (null !== $filterDateFrom && $result->occurredOn < $filterDateFrom) {
                return false;
            }

            if (null !== $filterDateTo && $result->occurredOn > $filterDateTo) {
                return false;
            }

            return true;
        });
    }
}
