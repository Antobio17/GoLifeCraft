<?php

namespace Authorization\User\User\Application\Command\SetUserAccess;

use Authorization\User\User\Domain\Exception\SetUserAccessException;
use Authorization\User\User\Domain\Model\User;
use Authorization\User\User\Domain\Model\UserRepository;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final readonly class SetUserAccessCommandHandler
{
    public function __construct(
        private UserRepository $userRepository,
        private DomainEventCollectorService $domainEventCollectorService,
        private DateTimeGenerator $dateTimeGenerator,
    ) {
    }

    public function __invoke(SetUserAccessCommand $command): void
    {
        if (User::ROLE_GOD !== $command->userRole) {
            throw SetUserAccessException::accessDenied();
        }

        if ($command->userId === $command->userSessionId) {
            throw SetUserAccessException::cannotChangeOwnAccess();
        }

        $user = $this->userRepository->findById(id: $command->userId);
        if (null === $user) {
            throw SetUserAccessException::userNotFound(userId: $command->userId);
        }

        $command->isActive
            ? $user->grantAccess(updatedByUserId: $command->userSessionId, dateTimeGenerator: $this->dateTimeGenerator)
            : $user->revokeAccess(updatedByUserId: $command->userSessionId, dateTimeGenerator: $this->dateTimeGenerator);

        $this->userRepository->save(user: $user);
        $this->domainEventCollectorService->register(aggregate: $user);
    }
}
