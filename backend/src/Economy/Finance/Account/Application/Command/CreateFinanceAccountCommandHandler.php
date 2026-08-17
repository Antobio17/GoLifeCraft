<?php

namespace Economy\Finance\Account\Application\Command;

use Economy\Finance\Account\Domain\Exception\CreateFinanceAccountException;
use Economy\Finance\Account\Domain\Model\FinanceAccount;
use Economy\Finance\Account\Domain\Model\FinanceAccountRepository;
use Economy\Finance\Account\Domain\QueryModel\CreateFinanceAccountNeedleDataQuery;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final readonly class CreateFinanceAccountCommandHandler
{
    public function __construct(
        private FinanceAccountRepository $financeAccountRepository,
        private CreateFinanceAccountNeedleDataQuery $needleDataQuery,
        private DomainEventCollectorService $domainEventCollectorService,
        private DateTimeGenerator $dateTimeGenerator,
    ) {
    }

    public function __invoke(CreateFinanceAccountCommand $command): void
    {
        if ($this->needleDataQuery->alreadyExists(name: trim(string: $command->name))) {
            throw CreateFinanceAccountException::alreadyExists(name: $command->name);
        }

        $financeAccount = FinanceAccount::create(
            id: $this->financeAccountRepository->nextId(),
            name: $command->name,
            type: $command->type,
            createdByUserId: $command->createdByUserId,
            dateTimeGenerator: $this->dateTimeGenerator,
        );

        $this->financeAccountRepository->save(financeAccount: $financeAccount);
        $this->domainEventCollectorService->register(aggregate: $financeAccount);
    }
}
