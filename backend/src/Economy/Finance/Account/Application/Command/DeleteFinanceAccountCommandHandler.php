<?php

namespace Economy\Finance\Account\Application\Command;

use Economy\Finance\Account\Domain\Exception\DeleteFinanceAccountException;
use Economy\Finance\Account\Domain\Model\FinanceAccountRepository;
use Economy\Finance\Account\Domain\QueryModel\DeleteFinanceAccountNeedleDataQuery;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final readonly class DeleteFinanceAccountCommandHandler
{
    public function __construct(
        private FinanceAccountRepository $financeAccountRepository,
        private DeleteFinanceAccountNeedleDataQuery $needleDataQuery,
        private DomainEventCollectorService $domainEventCollectorService,
        private DateTimeGenerator $dateTimeGenerator,
    ) {
    }

    public function __invoke(DeleteFinanceAccountCommand $command): void
    {
        $financeAccount = $this->financeAccountRepository->findById(id: $command->financeAccountId);

        if (null === $financeAccount) {
            throw DeleteFinanceAccountException::notFound(financeAccountId: $command->financeAccountId);
        }

        if ($this->needleDataQuery->hasTransactions(financeAccountId: $command->financeAccountId)) {
            throw DeleteFinanceAccountException::hasTransactions(financeAccountId: $command->financeAccountId);
        }

        $financeAccount->delete(
            deletedByUserId: $command->deletedByUserId,
            dateTimeGenerator: $this->dateTimeGenerator,
        );

        $this->financeAccountRepository->delete(financeAccount: $financeAccount);
        $this->domainEventCollectorService->register(aggregate: $financeAccount);
    }
}
