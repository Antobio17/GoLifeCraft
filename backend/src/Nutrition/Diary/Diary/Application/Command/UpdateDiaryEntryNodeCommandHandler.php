<?php

namespace Nutrition\Diary\Diary\Application\Command;

use Nutrition\Diary\Diary\Domain\Exception\UpdateDiaryEntryException;
use Nutrition\Diary\Diary\Domain\Model\DiaryEntryNode;
use Nutrition\Diary\Diary\Domain\Model\DiaryEntryRepository;
use Nutrition\Diary\Diary\Domain\Model\DiaryEntrySnapshot;
use Nutrition\Diary\Diary\Domain\Service\DiaryEntryTreeBuilder;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final readonly class UpdateDiaryEntryNodeCommandHandler
{
    public function __construct(
        private DiaryEntryRepository $diaryEntryRepository,
        private DiaryEntryTreeBuilder $treeBuilder,
        private DomainEventCollectorService $domainEventCollectorService,
        private DateTimeGenerator $dateTimeGenerator,
    ) {
    }

    public function __invoke(UpdateDiaryEntryNodeCommand $command): void
    {
        $diaryEntry = $this->diaryEntryRepository->findById(id: $command->diaryEntryId);
        if (null === $diaryEntry) {
            throw UpdateDiaryEntryException::diaryEntryNotFound(diaryEntryId: $command->diaryEntryId);
        }

        if (!$diaryEntry->isRecipe()) {
            throw UpdateDiaryEntryException::notARecipeEntry(diaryEntryId: $command->diaryEntryId);
        }

        if (!$diaryEntry->hasTree()) {
            $diaryEntry->replaceTree(
                nodes: $this->treeBuilder->materialize(
                    diaryEntryId: $diaryEntry->id,
                    recipeId: $diaryEntry->refId ?? '',
                    servings: $diaryEntry->quantity,
                    existingNodes: [],
                    userId: $command->updatedByUserId,
                ),
                customized: false,
            );
        }

        $diaryEntry->adjustNode(
            nodeId: DiaryEntryNode::buildId(diaryEntryId: $diaryEntry->id, path: $command->nodePath),
            quantity: $command->quantity,
            unit: $command->unit,
            updatedByUserId: $command->updatedByUserId,
            dateTimeGenerator: $this->dateTimeGenerator,
        );

        $macros = $this->treeBuilder->refresh(nodes: $diaryEntry->nodes);

        $diaryEntry->applyTreeSnapshot(
            snapshot: new DiaryEntrySnapshot(
                name: $diaryEntry->nameSnapshot,
                emoji: $diaryEntry->emojiSnapshot,
                macros: $macros,
            ),
            updatedByUserId: $command->updatedByUserId,
            dateTimeGenerator: $this->dateTimeGenerator,
        );

        $this->diaryEntryRepository->save(diaryEntry: $diaryEntry);
        $this->domainEventCollectorService->register(aggregate: $diaryEntry);
    }
}
