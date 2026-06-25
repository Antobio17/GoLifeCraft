<?php

namespace Authorization\User\User\Application\Command\ChangeMyPassword;

use Authorization\User\User\Domain\Exception\ChangeMyPasswordException;
use Authorization\User\User\Domain\Model\UserRepository;
use Authorization\User\User\Domain\Service\PasswordHasher;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final readonly class ChangeMyPasswordCommandHandler
{
    public function __construct(
        private UserRepository $userRepository,
        private PasswordHasher $passwordHasher,
        private DomainEventCollectorService $domainEventCollectorService,
        private DateTimeGenerator $dateTimeGenerator,
    ) {
    }

    public function __invoke(ChangeMyPasswordCommand $command): void
    {
        $user = $this->userRepository->findById(id: $command->userSessionId);
        if (null === $user) {
            throw ChangeMyPasswordException::notFound(userId: $command->userSessionId);
        }

        if (!$this->passwordHasher->isPasswordValid(user: $user, plainPassword: $command->currentPassword)) {
            throw ChangeMyPasswordException::currentPasswordInvalid();
        }

        if (!preg_match('/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,}$/', $command->newPassword)) {
            throw ChangeMyPasswordException::weakPassword();
        }

        $hashedPassword = $this->passwordHasher->hash(user: $user, plainPassword: $command->newPassword);

        $user->changePassword(
            hashedPassword: $hashedPassword,
            updatedByUserId: $command->userSessionId,
            dateTimeGenerator: $this->dateTimeGenerator,
        );

        $this->userRepository->save(user: $user);
        $this->domainEventCollectorService->register(aggregate: $user);
    }
}
