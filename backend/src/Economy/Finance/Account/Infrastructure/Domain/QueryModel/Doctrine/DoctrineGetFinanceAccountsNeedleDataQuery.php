<?php

namespace Economy\Finance\Account\Infrastructure\Domain\QueryModel\Doctrine;

use Doctrine\DBAL\Connection;
use Economy\Finance\Account\Domain\QueryModel\Dto\FinanceAccountView;
use Economy\Finance\Account\Domain\QueryModel\Dto\GetFinanceAccountsResult;
use Economy\Finance\Account\Domain\QueryModel\GetFinanceAccountsNeedleDataQuery;
use Economy\Finance\Account\Domain\Service\FinanceBalanceReader;

final readonly class DoctrineGetFinanceAccountsNeedleDataQuery implements GetFinanceAccountsNeedleDataQuery
{
    public function __construct(
        private Connection $connection,
        private FinanceBalanceReader $financeBalanceReader,
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

        $balances = $this->financeBalanceReader->balancesAt(date: $date);
        $lastChecks = $this->findLastChecks(date: $date);
        $transactionCounts = $this->findTransactionCounts();

        $accounts = [];
        $balance = 0.0;

        foreach ($rows as $row) {
            $accountId = (string) $row['id'];
            $accountBalance = $balances[$accountId] ?? 0.0;
            $balance += $accountBalance;

            $accounts[] = new FinanceAccountView(
                id: $accountId,
                name: (string) $row['name'],
                type: (string) $row['type'],
                balance: round(num: $accountBalance, precision: 2),
                lastCheckDate: $lastChecks[$accountId]['date'] ?? null,
                lastCheckAmount: $lastChecks[$accountId]['amount'] ?? null,
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
