<?php

namespace Economy\Finance\BalanceCheck\Infrastructure\Domain\QueryModel\Doctrine;

use Doctrine\DBAL\ArrayParameterType;
use Doctrine\DBAL\Connection;
use Economy\Finance\BalanceCheck\Domain\QueryModel\Dto\FinanceBalanceCheckView;
use Economy\Finance\BalanceCheck\Domain\QueryModel\Dto\GetFinanceBalanceChecksResult;
use Economy\Finance\BalanceCheck\Domain\QueryModel\GetFinanceBalanceChecksNeedleDataQuery;

final readonly class DoctrineGetFinanceBalanceChecksNeedleDataQuery implements GetFinanceBalanceChecksNeedleDataQuery
{
    private const MAX_CHECKS = 60;
    private const KIND_INCOME = 'income';

    public function __construct(
        private Connection $connection,
    ) {
    }

    public function findChecks(?string $financeAccountId): GetFinanceBalanceChecksResult
    {
        $rows = $this->findRows(financeAccountId: $financeAccountId);

        if ([] === $rows) {
            return $this->buildResult(financeAccountId: $financeAccountId, checks: []);
        }

        $accountIds = array_values(array: array_unique(array: array_map(
            callback: static fn (array $row): string => (string) $row['account_id'],
            array: $rows,
        )));
        $lastDate = (string) $rows[0]['check_date'];

        $expectedAmounts = $this->buildExpectedAmounts(
            accountIds: $accountIds,
            lastDate: $lastDate,
        );

        $checks = [];

        foreach ($rows as $row) {
            $id = (string) $row['id'];
            $amount = round(num: (float) $row['amount'], precision: 2);
            $expectedAmount = round(num: $expectedAmounts[$id] ?? 0.0, precision: 2);

            $checks[] = new FinanceBalanceCheckView(
                id: $id,
                accountId: (string) $row['account_id'],
                accountName: (string) $row['account_name'],
                checkDate: (string) $row['check_date'],
                amount: $amount,
                note: (string) $row['note'],
                expectedAmount: $expectedAmount,
                drift: round(num: $amount - $expectedAmount, precision: 2),
            );
        }

        return $this->buildResult(financeAccountId: $financeAccountId, checks: $checks);
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function findRows(?string $financeAccountId): array
    {
        $queryBuilder = $this->connection->createQueryBuilder()
            ->select('c.id', 'c.account_id', 'c.check_date', 'c.amount', 'c.note', 'a.name AS account_name')
            ->from(table: 'finance_balance_check', alias: 'c')
            ->innerJoin('c', 'finance_account', 'a', 'a.id = c.account_id')
            ->orderBy('c.check_date', 'DESC')
            ->addOrderBy('a.name', 'ASC')
            ->setMaxResults(self::MAX_CHECKS);

        if (null !== $financeAccountId) {
            $queryBuilder
                ->where('c.account_id = :accountId')
                ->setParameter(key: 'accountId', value: $financeAccountId);
        }

        return $queryBuilder->executeQuery()->fetchAllAssociative();
    }

    /**
     * What the app believed the account held at the start of each check day: the
     * previous check of that account plus the movements booked in between. The
     * first check of an account is compared against every earlier movement.
     *
     * @param array<int, string> $accountIds
     *
     * @return array<string, float> check id indexed expectations
     */
    private function buildExpectedAmounts(array $accountIds, string $lastDate): array
    {
        $checksByAccount = $this->findChecksByAccount(accountIds: $accountIds);
        $movementsByAccount = $this->findMovementsByAccount(
            accountIds: $accountIds,
            lastDate: $lastDate,
        );

        $expectedAmounts = [];

        foreach ($checksByAccount as $accountId => $checks) {
            $movements = $movementsByAccount[$accountId] ?? [];
            $anchorAmount = 0.0;
            $anchorDate = null;

            foreach ($checks as $check) {
                $expected = $anchorAmount;

                foreach ($movements as $movementDate => $net) {
                    $isBeforeAnchor = null !== $anchorDate && $movementDate < $anchorDate;

                    if ($isBeforeAnchor || $movementDate >= $check['date']) {
                        continue;
                    }

                    $expected += $net;
                }

                $expectedAmounts[$check['id']] = $expected;
                $anchorAmount = $check['amount'];
                $anchorDate = $check['date'];
            }
        }

        return $expectedAmounts;
    }

    /**
     * @param array<int, string> $accountIds
     *
     * @return array<string, array<int, array{id: string, date: string, amount: float}>>
     */
    private function findChecksByAccount(array $accountIds): array
    {
        $rows = $this->connection->createQueryBuilder()
            ->select('c.id', 'c.account_id', 'c.check_date', 'c.amount')
            ->from(table: 'finance_balance_check', alias: 'c')
            ->where('c.account_id IN (:accountIds)')
            ->setParameter(key: 'accountIds', value: $accountIds, type: ArrayParameterType::STRING)
            ->orderBy('c.check_date', 'ASC')
            ->executeQuery()
            ->fetchAllAssociative();

        $checks = [];

        foreach ($rows as $row) {
            $checks[(string) $row['account_id']][] = [
                'id' => (string) $row['id'],
                'date' => (string) $row['check_date'],
                'amount' => round(num: (float) $row['amount'], precision: 2),
            ];
        }

        return $checks;
    }

    /**
     * @param array<int, string> $accountIds
     *
     * @return array<string, array<string, float>> net amount per account and day
     */
    private function findMovementsByAccount(array $accountIds, string $lastDate): array
    {
        $rows = $this->connection->createQueryBuilder()
            ->select('t.account_id', 't.transaction_date', 't.kind', 'SUM(t.amount) AS total')
            ->from(table: 'finance_transaction', alias: 't')
            ->where('t.account_id IN (:accountIds)')
            ->andWhere('t.transaction_date < :lastDate')
            ->setParameter(key: 'accountIds', value: $accountIds, type: ArrayParameterType::STRING)
            ->setParameter(key: 'lastDate', value: $lastDate)
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
     * @param array<int, FinanceBalanceCheckView> $checks
     */
    private function buildResult(?string $financeAccountId, array $checks): GetFinanceBalanceChecksResult
    {
        return new GetFinanceBalanceChecksResult(
            id: $financeAccountId ?? 'all',
            aggregateName: 'FinanceBalanceChecks',
            accountId: $financeAccountId,
            checks: $checks,
        );
    }
}
