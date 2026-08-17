<?php

namespace Economy\Finance\Account\Infrastructure\Domain\Service\Doctrine;

use Doctrine\DBAL\Connection;
use Economy\Finance\Account\Domain\Service\FinanceBalanceReader;
use Economy\Finance\Transaction\Domain\Model\FinanceTransaction;

final readonly class DoctrineFinanceBalanceReader implements FinanceBalanceReader
{
    public function __construct(
        private Connection $connection,
    ) {
    }

    public function balancesAt(string $date): array
    {
        return $this->buildBalances(date: $date, financeAccountId: null);
    }

    public function balanceAt(string $financeAccountId, string $date): float
    {
        $balances = $this->buildBalances(date: $date, financeAccountId: $financeAccountId);

        return $balances[$financeAccountId] ?? 0.0;
    }

    /**
     * @return array<string, float>
     */
    private function buildBalances(string $date, ?string $financeAccountId): array
    {
        $anchors = $this->findAnchors(date: $date, financeAccountId: $financeAccountId);
        $balances = [];

        foreach ($anchors as $accountId => $anchor) {
            $balances[$accountId] = $anchor['amount'];
        }

        foreach ($this->findMovements(date: $date, financeAccountId: $financeAccountId) as $accountId => $movement) {
            $balances[$accountId] ??= 0.0;
            $balances[$accountId] += $movement;
        }

        return array_map(callback: static fn (float $balance): float => round(num: $balance, precision: 2), array: $balances);
    }

    /**
     * @return array<string, array{date: string, amount: float}>
     */
    private function findAnchors(string $date, ?string $financeAccountId): array
    {
        $accountFilter = null === $financeAccountId ? '' : ' AND c.account_id = :accountId';
        $latestFilter = null === $financeAccountId ? '' : ' AND account_id = :accountId';

        $sql = <<<SQL
            SELECT c.account_id, c.check_date, c.amount
            FROM finance_balance_check c
            INNER JOIN (
                SELECT account_id, MAX(check_date) AS anchor_date
                FROM finance_balance_check
                WHERE check_date <= :date{$latestFilter}
                GROUP BY account_id
            ) latest ON latest.account_id = c.account_id AND latest.anchor_date = c.check_date
            WHERE 1 = 1{$accountFilter}
            SQL;

        $rows = $this->connection
            ->executeQuery(sql: $sql, params: $this->buildParameters(date: $date, financeAccountId: $financeAccountId))
            ->fetchAllAssociative();

        $anchors = [];

        foreach ($rows as $row) {
            $anchors[(string) $row['account_id']] = [
                'date' => (string) $row['check_date'],
                'amount' => (float) $row['amount'],
            ];
        }

        return $anchors;
    }

    /**
     * @return array<string, float>
     */
    private function findMovements(string $date, ?string $financeAccountId): array
    {
        $accountFilter = null === $financeAccountId ? '' : ' AND t.account_id = :accountId';
        $latestFilter = null === $financeAccountId ? '' : ' AND account_id = :accountId';

        $sql = <<<SQL
            SELECT t.account_id, t.kind, SUM(t.amount) AS total
            FROM finance_transaction t
            LEFT JOIN (
                SELECT account_id, MAX(check_date) AS anchor_date
                FROM finance_balance_check
                WHERE check_date <= :date{$latestFilter}
                GROUP BY account_id
            ) latest ON latest.account_id = t.account_id
            WHERE t.transaction_date <= :date{$accountFilter}
              AND (latest.anchor_date IS NULL OR t.transaction_date >= latest.anchor_date)
            GROUP BY t.account_id, t.kind
            SQL;

        $rows = $this->connection
            ->executeQuery(sql: $sql, params: $this->buildParameters(date: $date, financeAccountId: $financeAccountId))
            ->fetchAllAssociative();

        $movements = [];

        foreach ($rows as $row) {
            $accountId = (string) $row['account_id'];
            $total = (float) $row['total'];
            $movements[$accountId] ??= 0.0;
            $movements[$accountId] += FinanceTransaction::KIND_INCOME === $row['kind'] ? $total : -$total;
        }

        return $movements;
    }

    /**
     * @return array<string, string>
     */
    private function buildParameters(string $date, ?string $financeAccountId): array
    {
        $parameters = ['date' => $date];

        if (null !== $financeAccountId) {
            $parameters['accountId'] = $financeAccountId;
        }

        return $parameters;
    }
}
