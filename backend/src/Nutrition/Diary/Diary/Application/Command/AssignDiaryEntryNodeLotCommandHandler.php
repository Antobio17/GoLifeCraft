<?php

namespace Nutrition\Diary\Diary\Application\Command;

use Nutrition\Diary\Diary\Domain\Exception\UpdateDiaryEntryException;
use Nutrition\Diary\Diary\Domain\Model\DiaryEntryRepository;
use Nutrition\Diary\Diary\Domain\Model\DiaryEntrySnapshot;
use Nutrition\Diary\Diary\Domain\Service\DiaryEntrySnapshotCalculator;
use Nutrition\Diary\Diary\Domain\Service\DiaryEntryTreeBuilder;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final readonly class AssignDiaryEntryNodeLotCommandHandler
{
    public function __construct(
        private DiaryEntryRepository $diaryEntryRepository,
        private DiaryEntrySnapshotCalculator $snapshotCalculator,
        private DiaryEntryTreeBuilder $treeBuilder,
        private DomainEventCollectorService $domainEventCollectorService,
        private DateTimeGenerator $dateTimeGenerator,
    ) {
    }

    public function __invoke(AssignDiaryEntryNodeLotCommand $command): void
    {
        $diaryEntry = $this->diaryEntryRepository->findById(id: $command->diaryEntryId);
        if (null === $diaryEntry) {
            throw UpdateDiaryEntryException::diaryEntryNotFound(diaryEntryId: $command->diaryEntryId);
        }

        $node = $diaryEntry->findNodeByPath(path: $command->nodePath);
        if (null === $node) {
            throw UpdateDiaryEntryException::treeNodeNotFound(
                diaryEntryId: $command->diaryEntryId,
                nodeId: $command->nodePath,
            );
        }

        if (!$node->isRecipe()) {
            throw UpdateDiaryEntryException::notARecipeNode(
                diaryEntryId: $command->diaryEntryId,
                nodeId: $command->nodePath,
            );
        }

        $node->assignLot(
            productionItemId: $command->productionItemId,
            updatedByUserId: $command->updatedByUserId,
            dateTimeGenerator: $this->dateTimeGenerator,
        );

        $diaryEntry->replaceSubtree(parent: $node, nodes: $this->treeBuilder->materializeSubtree(
            node: $node,
            existingNodes: $diaryEntry->nodes,
            userId: $command->updatedByUserId,
        ));

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
                macros: $this->treeBuilder->refresh(nodes: $diaryEntry->nodes),
            ),
            updatedByUserId: $command->updatedByUserId,
            dateTimeGenerator: $this->dateTimeGenerator,
        );

        $this->diaryEntryRepository->save(diaryEntry: $diaryEntry);
        $this->domainEventCollectorService->register(aggregate: $diaryEntry);
    }
}
