<?php

namespace Nutrition\Diary\Diary\Application\Command;

use Nutrition\Diary\Diary\Domain\Model\DiaryEntry;
use Nutrition\Diary\Diary\Domain\Model\DiaryEntryNode;
use Nutrition\Diary\Diary\Domain\Model\DiaryEntryRepository;
use Nutrition\Diary\Diary\Domain\Model\DiaryEntrySnapshot;
use Nutrition\Diary\Diary\Domain\QueryModel\FindDiaryEntryLotNeedleDataQuery;
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
        private FindDiaryEntryLotNeedleDataQuery $lotNeedleDataQuery,
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

        $productionItemId = $this->lotFor(command: $command);
        $nodes = $this->nodesFor(command: $command, diaryEntryId: $id, productionItemId: $productionItemId);

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
            customized: [] !== $command->tree,
            productionItemId: $productionItemId,
        );

        $this->diaryEntryRepository->save(diaryEntry: $diaryEntry);
        $this->domainEventCollectorService->register(aggregate: $diaryEntry);
    }

    /**
     * A plate of a recipe eats from the batch that has been waiting the longest, so what it counts
     * is what that batch was actually cooked with. An entry that comes with its own breakdown, or
     * one with nothing cooked to eat from, keeps following the recipe.
     */
    private function lotFor(CreateDiaryEntryCommand $command): ?string
    {
        if (DiaryEntry::KIND_RECIPE !== $command->kind || [] !== $command->tree) {
            return null;
        }

        return $this->lotNeedleDataQuery->findLotWithRoom(
            recipeId: $command->refId,
            entryDate: $command->entryDate,
            servings: $command->quantity,
        );
    }

    /**
     * An entry planned from an adjusted menu is born with that same breakdown.
     *
     * @return DiaryEntryNode[]
     */
    private function nodesFor(CreateDiaryEntryCommand $command, string $diaryEntryId, ?string $productionItemId): array
    {
        if (DiaryEntry::KIND_RECIPE !== $command->kind) {
            return [];
        }

        if ([] !== $command->tree) {
            return $this->treeBuilder->fromPayload(
                diaryEntryId: $diaryEntryId,
                tree: $command->tree,
                userId: $command->createdByUserId,
            );
        }

        return $this->treeBuilder->materialize(
            diaryEntryId: $diaryEntryId,
            recipeId: $command->refId,
            servings: $command->quantity,
            existingNodes: [],
            userId: $command->createdByUserId,
            productionItemId: $productionItemId,
        );
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
