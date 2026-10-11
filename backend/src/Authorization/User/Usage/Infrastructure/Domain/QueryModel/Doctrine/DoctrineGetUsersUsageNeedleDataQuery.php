<?php

namespace Authorization\User\Usage\Infrastructure\Domain\QueryModel\Doctrine;

use Authorization\User\Usage\Domain\QueryModel\Dto\GetUserUsageSummaryResult;
use Authorization\User\Usage\Domain\QueryModel\GetUsersUsageNeedleDataQuery;
use Doctrine\DBAL\ArrayParameterType;
use Doctrine\DBAL\Connection;
use Doctrine\DBAL\ParameterType;
use Shared\Tenant\Tenant\Infrastructure\Domain\Service\Doctrine\TenantReaderConnectionFactory;

final readonly class DoctrineGetUsersUsageNeedleDataQuery implements GetUsersUsageNeedleDataQuery
{
    private const int DAILY_DAYS = 30;

    public function __construct(
        private Connection $masterConnection,
        private TenantReaderConnectionFactory $connectionFactory,
    ) {
    }

    public function findTenantIdsByUserId(): array
    {
        $rows = $this->masterConnection
            ->createQueryBuilder()
            ->select('id', 'tenant_id')
            ->from(table: 'user')
            ->executeQuery()
            ->fetchAllAssociative();

        $tenantIdByUserId = [];

        foreach ($rows as $row) {
            $tenantIdByUserId[(string) $row['id']] = (string) $row['tenant_id'];
        }

        return $tenantIdByUserId;
    }

    public function fetchUsageSummary(string $userId, string $tenantId): GetUserUsageSummaryResult
    {
        $connection = $this->connectionFactory->connect(tenantId: $tenantId);
        if (null === $connection) {
            return GetUserUsageSummaryResult::notProvisioned(userId: $userId);
        }

        try {
            return $this->buildSummary(connection: $connection, userId: $userId, tenantId: $tenantId);
        } finally {
            $connection->close();
        }
    }

    private function buildSummary(Connection $connection, string $userId, string $tenantId): GetUserUsageSummaryResult
    {
        $tables = $connection
            ->executeQuery(
                sql: 'SELECT table_name FROM information_schema.tables WHERE table_schema = ?',
                params: [$tenantId],
            )
            ->fetchFirstColumn();

        $modules = $this->modules(connection: $connection, tables: $tables);
        $hasEventLog = in_array(
            needle: DoctrineGetUserUsageNeedleDataQuery::EVENT_LOG_TABLE,
            haystack: $tables,
            strict: true,
        );

        $lastActivityAt = $hasEventLog ? $this->lastEventAt(connection: $connection) : null;

        foreach ($modules as $module) {
            $lastActivityAt = $this->latest(current: $lastActivityAt, candidate: $module['lastActivityAt']);
        }

        return new GetUserUsageSummaryResult(
            id: $userId,
            provisioned: true,
            lastActivityAt: $lastActivityAt,
            activeModules: array_keys(array_filter(
                array: $modules,
                callback: static fn (array $module): bool => $module['records'] > 0,
            )),
            dailyActivity: $this->dailyActivity(connection: $connection, hasEventLog: $hasEventLog),
        );
    }

    /**
     * @param string[] $tables
     *
     * @return array<string, array{records: int, lastActivityAt: ?string}>
     */
    private function modules(Connection $connection, array $tables): array
    {
        $modules = [];
        $selects = [];

        foreach (DoctrineGetUserUsageNeedleDataQuery::MODULE_TABLES as $module => $moduleTables) {
            $modules[$module] = ['records' => 0, 'lastActivityAt' => null];

            foreach (array_intersect($moduleTables, $tables) as $table) {
                $selects[] = sprintf(
                    "SELECT '%s' AS module, COUNT(*) AS records, MAX(updated_at) AS last_activity FROM `%s`",
                    $module,
                    $table,
                );
            }
        }

        if ([] === $selects) {
            return $modules;
        }

        $rows = $connection
            ->executeQuery(sql: implode(separator: ' UNION ALL ', array: $selects))
            ->fetchAllAssociative();

        foreach ($rows as $row) {
            $module = (string) $row['module'];
            $modules[$module] = [
                'records' => $modules[$module]['records'] + (int) $row['records'],
                'lastActivityAt' => $this->latest(
                    current: $modules[$module]['lastActivityAt'],
                    candidate: $this->toAtom(value: $row['last_activity']),
                ),
            ];
        }

        return $modules;
    }

    private function lastEventAt(Connection $connection): ?string
    {
        $lastEventAt = $connection
            ->executeQuery(
                sql: sprintf(
                    'SELECT MAX(occurred_on) FROM `%s` WHERE event_name NOT IN (?)',
                    DoctrineGetUserUsageNeedleDataQuery::EVENT_LOG_TABLE,
                ),
                params: [DoctrineGetUserUsageNeedleDataQuery::SYSTEM_EVENT_NAMES],
                types: [ArrayParameterType::STRING],
            )
            ->fetchOne();

        return $this->toAtom(value: false !== $lastEventAt ? $lastEventAt : null);
    }

    /**
     * @return array<int, array{date: string, events: int}>
     */
    private function dailyActivity(Connection $connection, bool $hasEventLog): array
    {
        $buckets = [];
        $today = new \DateTimeImmutable(datetime: 'today', timezone: new \DateTimeZone(timezone: 'UTC'));

        for ($index = self::DAILY_DAYS - 1; $index >= 0; --$index) {
            $buckets[$today->modify(sprintf('-%d days', $index))->format('Y-m-d')] = 0;
        }

        $rows = $hasEventLog ? $connection
            ->executeQuery(
                sql: sprintf(
                    'SELECT DATE(occurred_on) AS bucket, COUNT(*) AS events FROM `%s` WHERE occurred_on >= ? AND event_name NOT IN (?) GROUP BY bucket',
                    DoctrineGetUserUsageNeedleDataQuery::EVENT_LOG_TABLE,
                ),
                params: [array_key_first($buckets).' 00:00:00', DoctrineGetUserUsageNeedleDataQuery::SYSTEM_EVENT_NAMES],
                types: [ParameterType::STRING, ArrayParameterType::STRING],
            )
            ->fetchAllAssociative() : [];

        foreach ($rows as $row) {
            $bucket = (string) $row['bucket'];

            if (!array_key_exists(key: $bucket, array: $buckets)) {
                continue;
            }

            $buckets[$bucket] = (int) $row['events'];
        }

        $series = [];

        foreach ($buckets as $date => $events) {
            $series[] = ['date' => $date, 'events' => $events];
        }

        return $series;
    }

    private function latest(?string $current, ?string $candidate): ?string
    {
        if (null === $candidate) {
            return $current;
        }

        if (null === $current) {
            return $candidate;
        }

        return $candidate > $current ? $candidate : $current;
    }

    private function toAtom(?string $value): ?string
    {
        if (null === $value || '' === $value) {
            return null;
        }

        return (new \DateTimeImmutable(datetime: $value, timezone: new \DateTimeZone(timezone: 'UTC')))
            ->format(format: \DateTimeInterface::ATOM);
    }
}
