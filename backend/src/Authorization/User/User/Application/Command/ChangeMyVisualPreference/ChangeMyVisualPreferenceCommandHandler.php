<?php

namespace Authorization\User\User\Application\Command\ChangeMyVisualPreference;

use Authorization\User\User\Domain\Exception\ChangeMyVisualPreferenceException;
use Authorization\User\User\Domain\Model\UserRepository;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final readonly class ChangeMyVisualPreferenceCommandHandler
{
    public function __construct(
        private UserRepository $userRepository,
        private DomainEventCollectorService $domainEventCollectorService,
        private DateTimeGenerator $dateTimeGenerator,
    ) {
    }

    public function __invoke(ChangeMyVisualPreferenceCommand $command): void
    {
        $user = $this->userRepository->findById(id: $command->userSessionId);
        if (null === $user) {
            throw ChangeMyVisualPreferenceException::notFound(userId: $command->userSessionId);
        }

        $user->changeVisualPreference(
            surface: $command->surface,
            mode: $command->mode,
            updatedByUserId: $command->userSessionId,
            dateTimeGenerator: $this->dateTimeGenerator,
        );

        $this->userRepository->save(user: $user);
        $this->domainEventCollectorService->register(aggregate: $user);
    }
}
