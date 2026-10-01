<?php

namespace Authorization\User\Usage\Infrastructure\Domain\QueryModel\Doctrine;

use Authorization\User\Usage\Domain\QueryModel\Dto\GetUserUsageResult;
use Authorization\User\Usage\Domain\QueryModel\GetUserUsageNeedleDataQuery;
use Doctrine\DBAL\Connection;
use Shared\Tenant\Tenant\Infrastructure\Domain\Service\Doctrine\TenantReaderConnectionFactory;

final readonly class DoctrineGetUserUsageNeedleDataQuery implements GetUserUsageNeedleDataQuery
{
    private const int DAILY_DAYS = 30;
    private const int MONTHLY_MONTHS = 12;
    private const string EVENT_LOG_TABLE = 'domain_event_log';
    private const string WORKOUT_TABLE = 'training_workout';
    private const string COMPLETED_STATUS = 'completed';

    private const array METRIC_TABLES = [
        'articles' => 'article',
        'recipes' => 'recipe',
        'menus' => 'menu',
        'productions' => 'production',
        'shoppingItems' => 'shopping_list_item',
        'diaryEntries' => 'diary_entry',
        'exercises' => 'exercise',
        'sessions' => 'training_session',
        'workouts' => self::WORKOUT_TABLE,
        'agendaEntries' => 'agenda_entry',
        'financeAccounts' => 'finance_account',
        'financeTransactions' => 'finance_transaction',
    ];

    private const array MODULE_TABLES = [
        'nutrition' => [
            'article',
            'nutrition_facts',
            'category',
            'supermarket',
            'recipe',
            'menu',
            'production',
            'article_stock',
            'recipe_stock',
            'shopping_list_item',
            'diary_entry',
            'diary_goal',
        ],
        'gym' => [
            'exercise',
            'training_session',
            self::WORKOUT_TABLE,
        ],
        'agenda' => [
            'agenda_entry',
        ],
        'finance' => [
            'finance_account',
            'finance_transaction',
            'finance_budget',
            'finance_recurrence',
            'finance_balance_check',
        ],
    ];

    public function __construct(
        private Connection $masterConnection,
        private TenantReaderConnectionFactory $connectionFactory,
    ) {
    }

    public function findTenantIdByUserId(string $userId): ?string
    {
        $tenantId = $this->masterConnection
            ->createQueryBuilder()
            ->select('tenant_id')
            ->from(table: 'user')
            ->where('id = :userId')
            ->setParameter(key: 'userId', value: $userId)
            ->executeQuery()
            ->fetchOne();

        return false !== $tenantId ? $tenantId : null;
    }

    public function fetchUsage(string $userId, string $tenantId): GetUserUsageResult
    {
        $connection = $this->connectionFactory->connect(tenantId: $tenantId);
        if (null === $connection) {
            return GetUserUsageResult::notProvisioned(userId: $userId, tenantId: $tenantId);
        }

        try {
            return $this->buildUsage(
                connection: $connection,
                userId: $userId,
                tenantId: $tenantId,
            );
        } finally {
            $connection->close();
        }
    }

    private function buildUsage(
        Connection $connection,
        string $userId,
        string $tenantId,
    ): GetUserUsageResult {
        $tables = $this->existingTables(connection: $connection, tenantId: $tenantId);
        $aggregates = $this->aggregates(connection: $connection, tables: $tables);
        $events = $this->eventTotals(connection: $connection, tables: $tables);
        $modules = $this->modules(aggregates: $aggregates);

        return new GetUserUsageResult(
            id: $userId,
            tenantId: $tenantId,
            provisioned: true,
            totalRecords: array_sum(array_column($modules, 'records')),
            totalEvents: $events['total'],
            firstActivityAt: $events['first'],
            lastActivityAt: $this->lastActivityAt(modules: $modules, events: $events),
            lastWorkoutAt: $this->lastWorkoutAt(connection: $connection, tables: $tables),
            metrics: $this->metrics(connection: $connection, tables: $tables, aggregates: $aggregates),
            modules: $modules,
            dailyActivity: $this->dailyActivity(connection: $connection, tables: $tables),
            monthlyActivity: $this->monthlyActivity(connection: $connection, tables: $tables),
        );
    }

    /**
     * @return string[]
     */
    private function existingTables(Connection $connection, string $tenantId): array
    {
        return $connection
            ->executeQuery(
                sql: 'SELECT table_name FROM information_schema.tables WHERE table_schema = ?',
                params: [$tenantId],
            )
            ->fetchFirstColumn();
    }

    /**
     * @param string[] $tables
     *
     * @return array<string, array{records: int, lastActivityAt: ?string}>
     */
    private function aggregates(Connection $connection, array $tables): array
    {
        $countable = array_values(array_intersect($this->countableTables(), $tables));
        if ([] === $countable) {
            return [];
        }

        $selects = array_map(
            callback: static fn (string $table): string => sprintf(
                "SELECT '%s' AS source, COUNT(*) AS records, MAX(updated_at) AS last_activity FROM `%s`",
                $table,
                $table,
            ),
            array: $countable,
        );

        $rows = $connection
            ->executeQuery(sql: implode(separator: ' UNION ALL ', array: $selects))
            ->fetchAllAssociative();

        $aggregates = [];

        foreach ($rows as $row) {
            $aggregates[$row['source']] = [
                'records' => (int) $row['records'],
                'lastActivityAt' => $this->toAtom(value: $row['last_activity']),
            ];
        }

        return $aggregates;
    }

    /**
     * @return string[]
     */
    private function countableTables(): array
    {
        return array_values(array_unique(array_merge(
            array_values(self::METRIC_TABLES),
            ...array_values(self::MODULE_TABLES),
        )));
    }

    /**
     * @param string[]                                                    $tables
     * @param array<string, array{records: int, lastActivityAt: ?string}> $aggregates
     *
     * @return array<int, array{metric: string, value: int}>
     */
    private function metrics(Connection $connection, array $tables, array $aggregates): array
    {
        $metrics = [];

        foreach (self::METRIC_TABLES as $metric => $table) {
            $metrics[] = [
                'metric' => $metric,
                'value' => $aggregates[$table]['records'] ?? 0,
            ];
        }

        $metrics[] = [
            'metric' => 'completedWorkouts',
            'value' => $this->completedWorkouts(connection: $connection, tables: $tables),
        ];

        return $metrics;
    }

    /**
     * @param array<string, array{records: int, lastActivityAt: ?string}> $aggregates
     *
     * @return array<int, array{module: string, records: int, lastActivityAt: ?string}>
     */
    private function modules(array $aggregates): array
    {
        $modules = [];

        foreach (self::MODULE_TABLES as $module => $tables) {
            $records = 0;
            $lastActivityAt = null;

            foreach ($tables as $table) {
                $records += $aggregates[$table]['records'] ?? 0;
                $lastActivityAt = $this->latest(
                    current: $lastActivityAt,
                    candidate: $aggregates[$table]['lastActivityAt'] ?? null,
                );
            }

            $modules[] = [
                'module' => $module,
                'records' => $records,
                'lastActivityAt' => $lastActivityAt,
            ];
        }

        return $modules;
    }

    /**
     * @param string[] $tables
     *
     * @return array{total: int, first: ?string, last: ?string}
     */
    private function eventTotals(Connection $connection, array $tables): array
    {
        if (!in_array(needle: self::EVENT_LOG_TABLE, haystack: $tables, strict: true)) {
            return ['total' => 0, 'first' => null, 'last' => null];
        }

        $row = $connection
            ->executeQuery(sql: sprintf(
                'SELECT COUNT(*) AS total, MIN(occurred_on) AS first_event, MAX(occurred_on) AS last_event FROM `%s`',
                self::EVENT_LOG_TABLE,
            ))
            ->fetchAssociative();

        return [
            'total' => (int) ($row['total'] ?? 0),
            'first' => $this->toAtom(value: $row['first_event'] ?? null),
            'last' => $this->toAtom(value: $row['last_event'] ?? null),
        ];
    }

    /**
     * @param string[] $tables
     */
    private function completedWorkouts(Connection $connection, array $tables): int
    {
        if (!in_array(needle: self::WORKOUT_TABLE, haystack: $tables, strict: true)) {
            return 0;
        }

        return (int) $connection
            ->executeQuery(
                sql: sprintf('SELECT COUNT(*) FROM `%s` WHERE status = ?', self::WORKOUT_TABLE),
                params: [self::COMPLETED_STATUS],
            )
            ->fetchOne();
    }

    /**
     * @param string[] $tables
     */
    private function lastWorkoutAt(Connection $connection, array $tables): ?string
    {
        if (!in_array(needle: self::WORKOUT_TABLE, haystack: $tables, strict: true)) {
            return null;
        }

        $lastWorkoutAt = $connection
            ->executeQuery(
                sql: sprintf('SELECT MAX(finished_at) FROM `%s` WHERE status = ?', self::WORKOUT_TABLE),
                params: [self::COMPLETED_STATUS],
            )
            ->fetchOne();

        return $this->toAtom(value: false !== $lastWorkoutAt ? $lastWorkoutAt : null);
    }

    /**
     * @param string[] $tables
     *
     * @return array<int, array{date: string, events: int}>
     */
    private function dailyActivity(Connection $connection, array $tables): array
    {
        $buckets = $this->emptyBuckets(
            anchor: 'today',
            count: self::DAILY_DAYS,
            step: 'days',
            format: 'Y-m-d',
        );

        if (!in_array(needle: self::EVENT_LOG_TABLE, haystack: $tables, strict: true)) {
            return $this->toSeries(buckets: $buckets, key: 'date');
        }

        $rows = $connection
            ->executeQuery(
                sql: sprintf(
                    'SELECT DATE(occurred_on) AS bucket, COUNT(*) AS events FROM `%s` WHERE occurred_on >= ? GROUP BY bucket',
                    self::EVENT_LOG_TABLE,
                ),
                params: [array_key_first($buckets).' 00:00:00'],
            )
            ->fetchAllAssociative();

        return $this->toSeries(buckets: $this->fill(buckets: $buckets, rows: $rows), key: 'date');
    }

    /**
     * @param string[] $tables
     *
     * @return array<int, array{month: string, events: int}>
     */
    private function monthlyActivity(Connection $connection, array $tables): array
    {
        $buckets = $this->emptyBuckets(
            anchor: 'first day of this month midnight',
            count: self::MONTHLY_MONTHS,
            step: 'months',
            format: 'Y-m',
        );

        if (!in_array(needle: self::EVENT_LOG_TABLE, haystack: $tables, strict: true)) {
            return $this->toSeries(buckets: $buckets, key: 'month');
        }

        $rows = $connection
            ->executeQuery(
                sql: sprintf(
                    "SELECT DATE_FORMAT(occurred_on, '%%Y-%%m') AS bucket, COUNT(*) AS events FROM `%s` WHERE occurred_on >= ? GROUP BY bucket",
                    self::EVENT_LOG_TABLE,
                ),
                params: [array_key_first($buckets).'-01 00:00:00'],
            )
            ->fetchAllAssociative();

        return $this->toSeries(buckets: $this->fill(buckets: $buckets, rows: $rows), key: 'month');
    }

    /**
     * @return array<string, int>
     */
    private function emptyBuckets(string $anchor, int $count, string $step, string $format): array
    {
        $buckets = [];
        $cursor = new \DateTimeImmutable(datetime: $anchor, timezone: new \DateTimeZone(timezone: 'UTC'));

        for ($index = $count - 1; $index >= 0; --$index) {
            $buckets[$cursor->modify(sprintf('-%d %s', $index, $step))->format($format)] = 0;
        }

        return $buckets;
    }

    /**
     * @param array<string, int>               $buckets
     * @param array<int, array<string, mixed>> $rows
     *
     * @return array<string, int>
     */
    private function fill(array $buckets, array $rows): array
    {
        foreach ($rows as $row) {
            $bucket = (string) $row['bucket'];

            if (!array_key_exists(key: $bucket, array: $buckets)) {
                continue;
            }

            $buckets[$bucket] = (int) $row['events'];
        }

        return $buckets;
    }

    /**
     * @param array<string, int> $buckets
     *
     * @return array<int, array<string, int|string>>
     */
    private function toSeries(array $buckets, string $key): array
    {
        $series = [];

        foreach ($buckets as $bucket => $events) {
            $series[] = [$key => $bucket, 'events' => $events];
        }

        return $series;
    }

    /**
     * @param array<int, array{module: string, records: int, lastActivityAt: ?string}> $modules
     * @param array{total: int, first: ?string, last: ?string}                         $events
     */
    private function lastActivityAt(array $modules, array $events): ?string
    {
        $lastActivityAt = $events['last'];

        foreach ($modules as $module) {
            $lastActivityAt = $this->latest(
                current: $lastActivityAt,
                candidate: $module['lastActivityAt'],
            );
        }

        return $lastActivityAt;
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
