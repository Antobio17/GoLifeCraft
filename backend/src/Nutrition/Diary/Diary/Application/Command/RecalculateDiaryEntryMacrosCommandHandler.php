<?php

namespace Nutrition\Diary\Diary\Application\Command;

use Nutrition\Diary\Diary\Domain\Model\DiaryEntry;
use Nutrition\Diary\Diary\Domain\Model\DiaryEntryRepository;
use Nutrition\Diary\Diary\Domain\Model\DiaryEntrySnapshot;
use Nutrition\Diary\Diary\Domain\Service\DiaryEntrySnapshotCalculator;
use Nutrition\Diary\Diary\Domain\Service\DiaryEntryTreeBuilder;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final readonly class RecalculateDiaryEntryMacrosCommandHandler
{
    public function __construct(
        private DiaryEntryRepository $diaryEntryRepository,
        private DiaryEntrySnapshotCalculator $snapshotCalculator,
        private DiaryEntryTreeBuilder $treeBuilder,
        private DomainEventCollectorService $domainEventCollectorService,
        private DateTimeGenerator $dateTimeGenerator,
    ) {
    }

    public function __invoke(RecalculateDiaryEntryMacrosCommand $command): void
    {
        $diaryEntry = $this->diaryEntryRepository->findById(id: $command->diaryEntryId);
        if (null === $diaryEntry) {
            return;
        }

        $snapshot = $this->snapshotFor(diaryEntry: $diaryEntry);

        if ($diaryEntry->matchesSnapshot(snapshot: $snapshot)) {
            $this->diaryEntryRepository->save(diaryEntry: $diaryEntry);

            return;
        }

        $diaryEntry->applySnapshot(
            snapshot: $snapshot,
            updatedByUserId: $diaryEntry->createdByUserId,
            dateTimeGenerator: $this->dateTimeGenerator,
        );

        $this->diaryEntryRepository->save(diaryEntry: $diaryEntry);
        $this->domainEventCollectorService->register(aggregate: $diaryEntry);
    }

    private function snapshotFor(DiaryEntry $diaryEntry): DiaryEntrySnapshot
    {
        if ($diaryEntry->isQuick()) {
            return $diaryEntry->quickSnapshot(quantity: $diaryEntry->quantity);
        }

        $reference = $this->snapshotCalculator->calculate(
            kind: $diaryEntry->kind,
            refId: $diaryEntry->refId ?? '',
            quantity: $diaryEntry->quantity,
            unit: $diaryEntry->unit,
        );

        if (!$diaryEntry->isRecipe()) {
            return $reference;
        }

        if (!$diaryEntry->customized) {
            $diaryEntry->replaceTree(
                nodes: $this->treeBuilder->materialize(
                    diaryEntryId: $diaryEntry->id,
                    recipeId: $diaryEntry->refId ?? '',
                    servings: $diaryEntry->quantity,
                    existingNodes: $diaryEntry->nodes,
                    userId: $diaryEntry->createdByUserId,
                    productionItemId: $diaryEntry->productionItemId,
                ),
                customized: false,
            );
        }

        if (!$diaryEntry->hasTree()) {
            return $reference;
        }

        return new DiaryEntrySnapshot(
            name: $reference->name,
            emoji: $reference->emoji,
            macros: $this->treeBuilder->refresh(nodes: $diaryEntry->nodes),
        );
    }
}
