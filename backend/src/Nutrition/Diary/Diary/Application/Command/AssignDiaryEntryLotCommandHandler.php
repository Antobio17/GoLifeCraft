<?php

namespace Nutrition\Diary\Diary\Application\Command;

use Nutrition\Diary\Diary\Domain\Exception\UpdateDiaryEntryException;
use Nutrition\Diary\Diary\Domain\Model\DiaryEntryRepository;
use Nutrition\Diary\Diary\Domain\Model\DiaryEntrySnapshot;
use Nutrition\Diary\Diary\Domain\Service\DiaryEntrySnapshotCalculator;
use Nutrition\Diary\Diary\Domain\Service\DiaryEntryTreeBuilder;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final readonly class AssignDiaryEntryLotCommandHandler
{
    public function __construct(
        private DiaryEntryRepository $diaryEntryRepository,
        private DiaryEntrySnapshotCalculator $snapshotCalculator,
        private DiaryEntryTreeBuilder $treeBuilder,
        private DomainEventCollectorService $domainEventCollectorService,
        private DateTimeGenerator $dateTimeGenerator,
    ) {
    }

    public function __invoke(AssignDiaryEntryLotCommand $command): void
    {
        $diaryEntry = $this->diaryEntryRepository->findById(id: $command->diaryEntryId);
        if (null === $diaryEntry) {
            throw UpdateDiaryEntryException::diaryEntryNotFound(diaryEntryId: $command->diaryEntryId);
        }

        if (!$diaryEntry->isRecipe()) {
            throw UpdateDiaryEntryException::notARecipeEntry(diaryEntryId: $command->diaryEntryId);
        }

        $reference = $this->snapshotCalculator->calculate(
            kind: $diaryEntry->kind,
            refId: $diaryEntry->refId ?? '',
            quantity: $diaryEntry->quantity,
            unit: $diaryEntry->unit,
        );

        $diaryEntry->replaceTree(
            nodes: $this->treeBuilder->materialize(
                diaryEntryId: $diaryEntry->id,
                recipeId: $diaryEntry->refId ?? '',
                servings: $diaryEntry->quantity,
                existingNodes: $diaryEntry->nodes,
                userId: $command->updatedByUserId,
                productionItemId: $command->productionItemId,
            ),
            customized: false,
        );

        $diaryEntry->assignLot(
            productionItemId: $command->productionItemId,
            snapshot: new DiaryEntrySnapshot(
                name: $reference->name,
                emoji: $reference->emoji,
                macros: $this->treeBuilder->refresh(nodes: $diaryEntry->nodes),
            ),
            updatedByUserId: $command->updatedByUserId,
            dateTimeGenerator: $this->dateTimeGenerator,
        );

        $this->diaryEntryRepository->save(diaryEntry: $diaryEntry);
        $this->domainEventCollectorService->register(aggregate: $diaryEntry);
    }
}
