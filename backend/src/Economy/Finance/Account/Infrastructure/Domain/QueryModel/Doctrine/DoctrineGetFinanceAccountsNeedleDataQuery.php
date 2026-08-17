<?php

namespace Economy\Finance\Account\Infrastructure\Domain\QueryModel\Doctrine;

use Doctrine\DBAL\Connection;
use Economy\Finance\Account\Domain\QueryModel\Dto\FinanceAccountView;
use Economy\Finance\Account\Domain\QueryModel\Dto\GetFinanceAccountsResult;
use Economy\Finance\Account\Domain\QueryModel\GetFinanceAccountsNeedleDataQuery;

final readonly class DoctrineGetFinanceAccountsNeedleDataQuery implements GetFinanceAccountsNeedleDataQuery
{
    private const KIND_INCOME = 'income';

    public function __construct(
        private Connection $connection,
    ) {
    }

    public function findAccounts(string $date): GetFinanceAccountsResult
    {
        $rows = $this->connection->createQueryBuilder()
            ->select('a.id', 'a.name', 'a.type')
            ->from(table: 'finance_account', alias: 'a')
            ->orderBy('a.name', 'ASC')
            ->executeQuery()
            ->fetchAllAssociative();

        $lastChecks = $this->findLastChecks(date: $date);
        $movements = $this->findMovements(date: $date);
        $transactionCounts = $this->findTransactionCounts();

        $accounts = [];
        $balance = 0.0;

        foreach ($rows as $row) {
            $accountId = (string) $row['id'];
            $lastCheck = $lastChecks[$accountId] ?? null;
            $accountBalance = $this->buildBalance(
                lastCheck: $lastCheck,
                movements: $movements[$accountId] ?? [],
            );
            $balance += $accountBalance;

            $accounts[] = new FinanceAccountView(
                id: $accountId,
                name: (string) $row['name'],
                type: (string) $row['type'],
                balance: round(num: $accountBalance, precision: 2),
                lastCheckDate: $lastCheck['date'] ?? null,
                lastCheckAmount: $lastCheck['amount'] ?? null,
                transactionCount: $transactionCounts[$accountId] ?? 0,
            );
        }

        return new GetFinanceAccountsResult(
            id: $date,
            aggregateName: 'FinanceAccounts',
            date: $date,
            accounts: $accounts,
            balance: round(num: $balance, precision: 2),
        );
    }

    /**
     * The checked amount is the balance at the start of the check day, so the
     * movements of that same day are applied on top of it. Accounts that were
     * never counted fall back to the sum of every movement they hold.
     *
     * @param array{date: string, amount: float}|null $lastCheck
     * @param array<string, float>                    $movements
     */
    private function buildBalance(?array $lastCheck, array $movements): float
    {
        $balance = $lastCheck['amount'] ?? 0.0;

        foreach ($movements as $movementDate => $net) {
            if (null !== $lastCheck && $movementDate < $lastCheck['date']) {
                continue;
            }

            $balance += $net;
        }

        return $balance;
    }

    /**
     * @return array<string, array{date: string, amount: float}>
     */
    private function findLastChecks(string $date): array
    {
        $sql = <<<SQL
            SELECT c.account_id, c.check_date, c.amount
            FROM finance_balance_check c
            INNER JOIN (
                SELECT account_id, MAX(check_date) AS anchor_date
                FROM finance_balance_check
                WHERE check_date <= :date
                GROUP BY account_id
            ) latest ON latest.account_id = c.account_id AND latest.anchor_date = c.check_date
            SQL;

        $rows = $this->connection
            ->executeQuery(sql: $sql, params: ['date' => $date])
            ->fetchAllAssociative();

        $checks = [];

        foreach ($rows as $row) {
            $checks[(string) $row['account_id']] = [
                'date' => (string) $row['check_date'],
                'amount' => round(num: (float) $row['amount'], precision: 2),
            ];
        }

        return $checks;
    }

    /**
     * @return array<string, array<string, float>> net amount per account and day
     */
    private function findMovements(string $date): array
    {
        $rows = $this->connection->createQueryBuilder()
            ->select('t.account_id', 't.transaction_date', 't.kind', 'SUM(t.amount) AS total')
            ->from(table: 'finance_transaction', alias: 't')
            ->where('t.transaction_date <= :date')
            ->setParameter(key: 'date', value: $date)
            ->groupBy('t.account_id', 't.transaction_date', 't.kind')
            ->executeQuery()
            ->fetchAllAssociative();

        $movements = [];

        foreach ($rows as $row) {
            $accountId = (string) $row['account_id'];
            $movementDate = (string) $row['transaction_date'];
            $total = (float) $row['total'];

            $movements[$accountId][$movementDate] ??= 0.0;
            $movements[$accountId][$movementDate] += self::KIND_INCOME === $row['kind'] ? $total : -$total;
        }

        return $movements;
    }

    /**
     * @return array<string, int>
     */
    private function findTransactionCounts(): array
    {
        $rows = $this->connection->createQueryBuilder()
            ->select('t.account_id', 'COUNT(t.id) AS movements')
            ->from(table: 'finance_transaction', alias: 't')
            ->groupBy('t.account_id')
            ->executeQuery()
            ->fetchAllAssociative();

        $counts = [];

        foreach ($rows as $row) {
            $counts[(string) $row['account_id']] = (int) $row['movements'];
        }

        return $counts;
    }
}
