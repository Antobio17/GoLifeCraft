<?php

namespace Nutrition\Diary\Diary\Application\Command;

use Nutrition\Diary\Diary\Domain\Exception\DeleteDiaryEntryException;
use Nutrition\Diary\Diary\Domain\Model\DiaryEntryNode;
use Nutrition\Diary\Diary\Domain\Model\DiaryEntryRepository;
use Nutrition\Diary\Diary\Domain\Model\DiaryEntrySnapshot;
use Nutrition\Diary\Diary\Domain\Service\DiaryEntryTreeBuilder;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final readonly class DeleteDiaryEntryNodeCommandHandler
{
    public function __construct(
        private DiaryEntryRepository $diaryEntryRepository,
        private DiaryEntryTreeBuilder $treeBuilder,
        private DomainEventCollectorService $domainEventCollectorService,
        private DateTimeGenerator $dateTimeGenerator,
    ) {
    }

    public function __invoke(DeleteDiaryEntryNodeCommand $command): void
    {
        $diaryEntry = $this->diaryEntryRepository->findById(id: $command->diaryEntryId);
        if (null === $diaryEntry) {
            throw DeleteDiaryEntryException::diaryEntryNotFound(diaryEntryId: $command->diaryEntryId);
        }

        if (!$diaryEntry->isRecipe()) {
            throw DeleteDiaryEntryException::notARecipeEntry(diaryEntryId: $command->diaryEntryId);
        }

        $diaryEntry->removeNode(
            nodeId: DiaryEntryNode::buildId(diaryEntryId: $diaryEntry->id, path: $command->nodePath),
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
