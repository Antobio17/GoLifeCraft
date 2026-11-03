<?php

namespace Gamification\Achievement\Achievement\Application\Command;

use Gamification\Achievement\Achievement\Domain\Exception\RecordAchievementProgressException;
use Gamification\Achievement\Achievement\Domain\Model\AchievementProgress;
use Gamification\Achievement\Achievement\Domain\Model\AchievementProgressRepository;
use Gamification\Achievement\Achievement\Domain\Service\AchievementCatalog;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final readonly class RecordAchievementProgressCommandHandler
{
    public function __construct(
        private AchievementProgressRepository $achievementProgressRepository,
        private AchievementCatalog $achievementCatalog,
        private DomainEventCollectorService $domainEventCollectorService,
        private DateTimeGenerator $dateTimeGenerator,
    ) {
    }

    public function __invoke(RecordAchievementProgressCommand $command): void
    {
        $definition = $this->achievementCatalog->find(key: $command->definitionKey);

        if (null === $definition) {
            throw RecordAchievementProgressException::unknownDefinition(definitionKey: $command->definitionKey);
        }

        $occurredAt = \DateTime::createFromFormat(format: \DateTimeInterface::ATOM, datetime: $command->occurredOn);

        if (false === $occurredAt) {
            throw RecordAchievementProgressException::invalidOccurrenceDate(occurredOn: $command->occurredOn);
        }

        $achievementProgress = $this->achievementProgressRepository->findByDefinitionKey(definitionKey: $definition->key)
            ?? AchievementProgress::start(
                id: $this->achievementProgressRepository->nextId(),
                definitionKey: $definition->key,
                createdByUserId: $command->recordedByUserId,
                dateTimeGenerator: $this->dateTimeGenerator,
            );

        $achievementProgress->registerOccurrence(
            definition: $definition,
            occurredAt: $occurredAt,
            celebrate: $command->celebrate,
            updatedByUserId: $command->recordedByUserId,
            dateTimeGenerator: $this->dateTimeGenerator,
        );

        $this->achievementProgressRepository->save(achievementProgress: $achievementProgress);
        $this->domainEventCollectorService->register(aggregate: $achievementProgress);
    }
}
