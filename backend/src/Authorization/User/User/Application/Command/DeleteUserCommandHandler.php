<?php

namespace Authorization\User\User\Application\Command;

use Authorization\User\User\Domain\Exception\DeleteUserException;
use Authorization\User\User\Domain\Model\User;
use Authorization\User\User\Domain\Model\UserRepository;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final readonly class DeleteUserCommandHandler
{
    public function __construct(
        private UserRepository $userRepository,
        private DomainEventCollectorService $domainEventCollectorService,
        private DateTimeGenerator $dateTimeGenerator,
    ) {
    }

    public function __invoke(DeleteUserCommand $command): void
    {
        if (User::ROLE_USER === $command->deletedByUserRole) {
            throw DeleteUserException::accessDeniedForReadOnlyRole();
        }

        $user = $this->userRepository->findById(id: $command->userId);
        if (null === $user) {
            throw DeleteUserException::userNotFound(userId: $command->userId);
        }

        $user->delete(
            deletedByUserId: $command->deletedByUserId,
            dateTimeGenerator: $this->dateTimeGenerator,
        );

        $this->userRepository->delete(user: $user);
        $this->domainEventCollectorService->register(aggregate: $user);
    }
}
