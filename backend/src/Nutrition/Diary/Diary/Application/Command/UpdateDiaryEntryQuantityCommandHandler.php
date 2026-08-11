<?php

namespace Nutrition\Diary\Diary\Application\Command;

use Nutrition\Diary\Diary\Domain\Exception\UpdateDiaryEntryException;
use Nutrition\Diary\Diary\Domain\Model\DiaryEntry;
use Nutrition\Diary\Diary\Domain\Model\DiaryEntryRepository;
use Nutrition\Diary\Diary\Domain\Model\DiaryEntrySnapshot;
use Nutrition\Diary\Diary\Domain\Service\DiaryEntrySnapshotCalculator;
use Nutrition\Diary\Diary\Domain\Service\DiaryEntryTreeBuilder;
use Nutrition\Recipe\Recipe\Domain\QueryModel\Dto\MacroBreakdown;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final readonly class UpdateDiaryEntryQuantityCommandHandler
{
    public function __construct(
        private DiaryEntryRepository $diaryEntryRepository,
        private DiaryEntrySnapshotCalculator $snapshotCalculator,
        private DiaryEntryTreeBuilder $treeBuilder,
        private DomainEventCollectorService $domainEventCollectorService,
        private DateTimeGenerator $dateTimeGenerator,
    ) {
    }

    public function __invoke(UpdateDiaryEntryQuantityCommand $command): void
    {
        $diaryEntry = $this->diaryEntryRepository->findById(id: $command->diaryEntryId);
        if (null === $diaryEntry) {
            throw UpdateDiaryEntryException::diaryEntryNotFound(diaryEntryId: $command->diaryEntryId);
        }

        $snapshot = $this->snapshotFor(diaryEntry: $diaryEntry, command: $command);

        $diaryEntry->updateQuantity(
            quantity: $command->quantity,
            snapshot: $snapshot,
            updatedByUserId: $command->updatedByUserId,
            dateTimeGenerator: $this->dateTimeGenerator,
            unit: $command->unit,
        );

        $this->diaryEntryRepository->save(diaryEntry: $diaryEntry);
        $this->domainEventCollectorService->register(aggregate: $diaryEntry);
    }

    private function snapshotFor(DiaryEntry $diaryEntry, UpdateDiaryEntryQuantityCommand $command): DiaryEntrySnapshot
    {
        if ($diaryEntry->isQuick()) {
            return $diaryEntry->quickSnapshot(quantity: $command->quantity);
        }

        $reference = $this->snapshotCalculator->calculate(
            kind: $diaryEntry->kind,
            refId: $diaryEntry->refId ?? '',
            quantity: $command->quantity,
            unit: $command->unit ?? $diaryEntry->unit,
        );

        if (!$diaryEntry->isRecipe()) {
            return $reference;
        }

        return new DiaryEntrySnapshot(
            name: $reference->name,
            emoji: $reference->emoji,
            macros: $this->rescaleTree(diaryEntry: $diaryEntry, command: $command),
        );
    }

    private function rescaleTree(DiaryEntry $diaryEntry, UpdateDiaryEntryQuantityCommand $command): MacroBreakdown
    {
        if (!$diaryEntry->hasTree()) {
            $diaryEntry->replaceTree(
                nodes: $this->treeBuilder->materialize(
                    diaryEntryId: $diaryEntry->id,
                    recipeId: $diaryEntry->refId ?? '',
                    servings: $command->quantity,
                    existingNodes: [],
                    userId: $command->updatedByUserId,
                ),
                customized: false,
            );

            return $this->treeBuilder->refresh(nodes: $diaryEntry->nodes);
        }

        if ($diaryEntry->quantity > 0) {
            $diaryEntry->scaleTree(
                factor: $command->quantity / $diaryEntry->quantity,
                updatedByUserId: $command->updatedByUserId,
                dateTimeGenerator: $this->dateTimeGenerator,
            );
        }

        return $this->treeBuilder->refresh(nodes: $diaryEntry->nodes);
    }
}
