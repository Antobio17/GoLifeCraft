<?php

namespace Gamification\Achievement\Achievement\Application\Command;

use Gamification\Achievement\Achievement\Domain\Exception\MarkAchievementSeenException;
use Gamification\Achievement\Achievement\Domain\Model\AchievementProgressRepository;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final readonly class MarkAchievementSeenCommandHandler
{
    public function __construct(
        private AchievementProgressRepository $achievementProgressRepository,
        private DomainEventCollectorService $domainEventCollectorService,
        private DateTimeGenerator $dateTimeGenerator,
    ) {
    }

    public function __invoke(MarkAchievementSeenCommand $command): void
    {
        $achievementProgress = $this->achievementProgressRepository->findByDefinitionKey(definitionKey: $command->definitionKey);

        if (null === $achievementProgress) {
            throw MarkAchievementSeenException::notFound(definitionKey: $command->definitionKey);
        }

        $achievementProgress->markSeen(
            seenByUserId: $command->seenByUserId,
            dateTimeGenerator: $this->dateTimeGenerator,
        );

        $this->achievementProgressRepository->save(achievementProgress: $achievementProgress);
        $this->domainEventCollectorService->register(aggregate: $achievementProgress);
    }
}
