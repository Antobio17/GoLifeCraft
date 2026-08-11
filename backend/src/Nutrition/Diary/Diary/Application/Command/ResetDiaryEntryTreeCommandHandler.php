<?php

namespace Nutrition\Diary\Diary\Application\Command;

use Nutrition\Diary\Diary\Domain\Exception\UpdateDiaryEntryException;
use Nutrition\Diary\Diary\Domain\Model\DiaryEntryRepository;
use Nutrition\Diary\Diary\Domain\Model\DiaryEntrySnapshot;
use Nutrition\Diary\Diary\Domain\Service\DiaryEntrySnapshotCalculator;
use Nutrition\Diary\Diary\Domain\Service\DiaryEntryTreeBuilder;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final readonly class ResetDiaryEntryTreeCommandHandler
{
    public function __construct(
        private DiaryEntryRepository $diaryEntryRepository,
        private DiaryEntryTreeBuilder $treeBuilder,
        private DiaryEntrySnapshotCalculator $snapshotCalculator,
        private DomainEventCollectorService $domainEventCollectorService,
        private DateTimeGenerator $dateTimeGenerator,
    ) {
    }

    public function __invoke(ResetDiaryEntryTreeCommand $command): void
    {
        $diaryEntry = $this->diaryEntryRepository->findById(id: $command->diaryEntryId);
        if (null === $diaryEntry) {
            throw UpdateDiaryEntryException::diaryEntryNotFound(diaryEntryId: $command->diaryEntryId);
        }

        if (!$diaryEntry->isRecipe()) {
            throw UpdateDiaryEntryException::notARecipeEntry(diaryEntryId: $command->diaryEntryId);
        }

        $diaryEntry->replaceTree(
            nodes: $this->treeBuilder->materialize(
                diaryEntryId: $diaryEntry->id,
                recipeId: $diaryEntry->refId ?? '',
                servings: $diaryEntry->quantity,
                existingNodes: $diaryEntry->nodes,
                userId: $command->updatedByUserId,
            ),
            customized: false,
        );

        $reference = $this->snapshotCalculator->calculate(
            kind: $diaryEntry->kind,
            refId: $diaryEntry->refId ?? '',
            quantity: $diaryEntry->quantity,
            unit: $diaryEntry->unit,
        );

        $diaryEntry->applyTreeSnapshot(
            snapshot: new DiaryEntrySnapshot(
                name: $reference->name,
                emoji: $reference->emoji,
                macros: $diaryEntry->treeMacros(),
            ),
            updatedByUserId: $command->updatedByUserId,
            dateTimeGenerator: $this->dateTimeGenerator,
        );

        $this->diaryEntryRepository->save(diaryEntry: $diaryEntry);
        $this->domainEventCollectorService->register(aggregate: $diaryEntry);
    }
}
