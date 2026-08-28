<?php

namespace Nutrition\Diary\Diary\Application\Command;

use Nutrition\Diary\Diary\Domain\QueryModel\ConsumeDiaryMealNeedleDataQuery;
use Symfony\Component\Messenger\MessageBusInterface;

/**
 * Ticking off a whole meal is one gesture over several entries, so this one writes nothing itself:
 * it fans the gesture out into one command per entry, the way loading a menu into the diary does.
 * That keeps every write to a single aggregate.
 */
final readonly class ConsumeDiaryMealCommandHandler
{
    public function __construct(
        private ConsumeDiaryMealNeedleDataQuery $needleDataQuery,
        private MessageBusInterface $messageBus,
    ) {
    }

    public function __invoke(ConsumeDiaryMealCommand $command): void
    {
        $entryIds = $this->needleDataQuery->findEntryIds(
            date: $command->date,
            meal: $command->meal,
        );

        foreach ($entryIds as $entryId) {
            $this->messageBus->dispatch(new ConsumeDiaryEntryCommand(
                entryId: $entryId,
                consumed: $command->consumed,
                updatedByUserId: $command->updatedByUserId,
            ));
        }
    }
}
