<?php

namespace Nutrition\Diary\Diary\Application\Command;

use Nutrition\Diary\Diary\Domain\QueryModel\ConsumePastDiaryEntriesNeedleDataQuery;
use Symfony\Component\Messenger\MessageBusInterface;

final readonly class ConsumePastDiaryEntriesCommandHandler
{
    public function __construct(
        private ConsumePastDiaryEntriesNeedleDataQuery $needleDataQuery,
        private MessageBusInterface $messageBus,
    ) {
    }

    public function __invoke(ConsumePastDiaryEntriesCommand $command): void
    {
        $entryIds = $this->needleDataQuery->findPendingEntryIds(
            fromDate: $command->fromDate,
            toDate: $command->toDate,
        );

        foreach ($entryIds as $entryId) {
            $this->messageBus->dispatch(new ConsumeDiaryEntryCommand(
                entryId: $entryId,
                consumed: true,
                updatedByUserId: $command->updatedByUserId,
            ));
        }
    }
}
