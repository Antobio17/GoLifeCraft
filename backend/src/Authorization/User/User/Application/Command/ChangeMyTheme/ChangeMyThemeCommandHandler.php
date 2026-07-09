<?php

namespace Authorization\User\User\Application\Command\ChangeMyTheme;

use Authorization\User\User\Domain\Exception\ChangeMyThemeException;
use Authorization\User\User\Domain\Model\UserRepository;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final readonly class ChangeMyThemeCommandHandler
{
    public function __construct(
        private UserRepository $userRepository,
        private DomainEventCollectorService $domainEventCollectorService,
        private DateTimeGenerator $dateTimeGenerator,
    ) {
    }

    public function __invoke(ChangeMyThemeCommand $command): void
    {
        $user = $this->userRepository->findById(id: $command->userSessionId);
        if (null === $user) {
            throw ChangeMyThemeException::notFound(userId: $command->userSessionId);
        }

        $user->changeTheme(
            theme: $command->theme,
            updatedByUserId: $command->userSessionId,
            dateTimeGenerator: $this->dateTimeGenerator,
        );

        $this->userRepository->save(user: $user);
        $this->domainEventCollectorService->register(aggregate: $user);
    }
}
