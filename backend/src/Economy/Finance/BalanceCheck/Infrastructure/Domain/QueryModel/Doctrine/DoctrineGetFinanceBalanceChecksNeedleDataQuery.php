<?php

namespace Economy\Finance\BalanceCheck\Infrastructure\Domain\QueryModel\Doctrine;

use Doctrine\DBAL\Connection;
use Economy\Finance\Account\Domain\Service\FinanceBalanceReader;
use Economy\Finance\BalanceCheck\Domain\QueryModel\Dto\FinanceBalanceCheckView;
use Economy\Finance\BalanceCheck\Domain\QueryModel\Dto\GetFinanceBalanceChecksResult;
use Economy\Finance\BalanceCheck\Domain\QueryModel\GetFinanceBalanceChecksNeedleDataQuery;

final readonly class DoctrineGetFinanceBalanceChecksNeedleDataQuery implements GetFinanceBalanceChecksNeedleDataQuery
{
    private const MAX_CHECKS = 60;

    public function __construct(
        private Connection $connection,
        private FinanceBalanceReader $financeBalanceReader,
    ) {
    }

    public function findChecks(?string $financeAccountId): GetFinanceBalanceChecksResult
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

        $rows = $queryBuilder->executeQuery()->fetchAllAssociative();
        $checks = [];

        foreach ($rows as $row) {
            $accountId = (string) $row['account_id'];
            $checkDate = (string) $row['check_date'];
            $amount = round(num: (float) $row['amount'], precision: 2);
            $expectedAmount = $this->financeBalanceReader->balanceAt(
                financeAccountId: $accountId,
                date: $this->previousDay(date: $checkDate),
            );

            $checks[] = new FinanceBalanceCheckView(
                id: (string) $row['id'],
                accountId: $accountId,
                accountName: (string) $row['account_name'],
                checkDate: $checkDate,
                amount: $amount,
                note: (string) $row['note'],
                expectedAmount: round(num: $expectedAmount, precision: 2),
                drift: round(num: $amount - $expectedAmount, precision: 2),
            );
        }

        return new GetFinanceBalanceChecksResult(
            id: $financeAccountId ?? 'all',
            aggregateName: 'FinanceBalanceChecks',
            accountId: $financeAccountId,
            checks: $checks,
        );
    }

    private function previousDay(string $date): string
    {
        return (new \DateTimeImmutable(datetime: $date))
            ->modify(modifier: '-1 day')
            ->format(format: 'Y-m-d');
    }
}
