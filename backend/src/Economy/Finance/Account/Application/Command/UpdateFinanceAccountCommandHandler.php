<?php

namespace Economy\Finance\Account\Application\Command;

use Economy\Finance\Account\Domain\Exception\UpdateFinanceAccountException;
use Economy\Finance\Account\Domain\Model\FinanceAccountRepository;
use Economy\Finance\Account\Domain\QueryModel\UpdateFinanceAccountNeedleDataQuery;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final readonly class UpdateFinanceAccountCommandHandler
{
    public function __construct(
        private FinanceAccountRepository $financeAccountRepository,
        private UpdateFinanceAccountNeedleDataQuery $needleDataQuery,
        private DomainEventCollectorService $domainEventCollectorService,
        private DateTimeGenerator $dateTimeGenerator,
    ) {
    }

    public function __invoke(UpdateFinanceAccountCommand $command): void
    {
        $financeAccount = $this->financeAccountRepository->findById(id: $command->financeAccountId);

        if (null === $financeAccount) {
            throw UpdateFinanceAccountException::notFound(financeAccountId: $command->financeAccountId);
        }

        $alreadyExists = $this->needleDataQuery->alreadyExists(
            name: trim(string: $command->name),
            financeAccountId: $command->financeAccountId,
        );

        if ($alreadyExists) {
            throw UpdateFinanceAccountException::alreadyExists(name: $command->name);
        }

        $financeAccount->update(
            name: $command->name,
            type: $command->type,
            updatedByUserId: $command->updatedByUserId,
            dateTimeGenerator: $this->dateTimeGenerator,
        );

        $this->financeAccountRepository->save(financeAccount: $financeAccount);
        $this->domainEventCollectorService->register(aggregate: $financeAccount);
    }
}
