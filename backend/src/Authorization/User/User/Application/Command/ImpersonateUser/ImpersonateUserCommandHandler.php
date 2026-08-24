<?php

namespace Authorization\User\User\Application\Command\ImpersonateUser;

use Authorization\User\User\Domain\Exception\ImpersonateUserException;
use Authorization\User\User\Domain\Model\User;
use Authorization\User\User\Domain\Model\UserRepository;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final readonly class ImpersonateUserCommandHandler
{
    public function __construct(
        private UserRepository $userRepository,
        private DomainEventCollectorService $domainEventCollectorService,
        private DateTimeGenerator $dateTimeGenerator,
    ) {
    }

    public function __invoke(ImpersonateUserCommand $command): void
    {
        if (User::ROLE_GOD !== $command->userRole) {
            throw ImpersonateUserException::accessDenied();
        }

        if ($command->userId === $command->userSessionId) {
            throw ImpersonateUserException::cannotImpersonateYourself();
        }

        $user = $this->userRepository->findById(id: $command->userId);
        if (null === $user) {
            throw ImpersonateUserException::userNotFound(userId: $command->userId);
        }

        if (!$user->isActive) {
            throw ImpersonateUserException::userIsNotActive(userId: $command->userId);
        }

        $user->impersonate(
            impersonatorUserId: $command->userSessionId,
            dateTimeGenerator: $this->dateTimeGenerator,
        );

        $this->domainEventCollectorService->register(aggregate: $user);
    }
}
