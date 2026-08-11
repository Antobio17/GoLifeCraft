<?php

namespace Nutrition\Diary\Diary\Application\Command;

use Nutrition\Diary\Diary\Domain\Model\DiaryEntry;
use Nutrition\Diary\Diary\Domain\Model\DiaryEntryNode;
use Nutrition\Diary\Diary\Domain\Model\DiaryEntryRepository;
use Nutrition\Diary\Diary\Domain\Model\DiaryEntrySnapshot;
use Nutrition\Diary\Diary\Domain\Service\DiaryEntrySnapshotCalculator;
use Nutrition\Diary\Diary\Domain\Service\DiaryEntryTreeBuilder;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final readonly class CreateDiaryEntryCommandHandler
{
    public function __construct(
        private DiaryEntryRepository $diaryEntryRepository,
        private DiaryEntrySnapshotCalculator $snapshotCalculator,
        private DiaryEntryTreeBuilder $treeBuilder,
        private DomainEventCollectorService $domainEventCollectorService,
        private DateTimeGenerator $dateTimeGenerator,
    ) {
    }

    public function __invoke(CreateDiaryEntryCommand $command): void
    {
        $id = $this->diaryEntryRepository->nextId();
        $reference = $this->snapshotCalculator->calculate(
            kind: $command->kind,
            refId: $command->refId,
            quantity: $command->quantity,
            unit: $command->unit,
        );

        $nodes = DiaryEntry::KIND_RECIPE === $command->kind
            ? $this->treeBuilder->materialize(
                diaryEntryId: $id,
                recipeId: $command->refId,
                servings: $command->quantity,
                existingNodes: [],
                userId: $command->createdByUserId,
            )
            : [];

        $diaryEntry = DiaryEntry::create(
            id: $id,
            entryDate: $command->entryDate,
            meal: $command->meal,
            kind: $command->kind,
            refId: $command->refId,
            quantity: $command->quantity,
            unit: $command->unit,
            snapshot: $this->snapshotFor(reference: $reference, nodes: $nodes),
            createdByUserId: $command->createdByUserId,
            dateTimeGenerator: $this->dateTimeGenerator,
            nodes: $nodes,
        );

        $this->diaryEntryRepository->save(diaryEntry: $diaryEntry);
        $this->domainEventCollectorService->register(aggregate: $diaryEntry);
    }

    /** @param DiaryEntryNode[] $nodes */
    private function snapshotFor(DiaryEntrySnapshot $reference, array $nodes): DiaryEntrySnapshot
    {
        if ([] === $nodes) {
            return $reference;
        }

        return new DiaryEntrySnapshot(
            name: $reference->name,
            emoji: $reference->emoji,
            macros: DiaryEntry::macrosOf(nodes: $nodes),
        );
    }
}
