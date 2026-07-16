<?php

namespace Authorization\User\PasswordResetToken\Application\Command\ConfirmPasswordReset;

use Authorization\User\PasswordResetToken\Domain\Exception\ConfirmPasswordResetException;
use Authorization\User\PasswordResetToken\Domain\Model\PasswordResetTokenRepository;
use Authorization\User\User\Domain\Model\UserRepository;
use Authorization\User\User\Domain\Service\PasswordHasher;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final readonly class ConfirmPasswordResetCommandHandler
{
    public function __construct(
        private PasswordResetTokenRepository $repository,
        private UserRepository $userRepository,
        private PasswordHasher $passwordHasher,
        private DomainEventCollectorService $domainEventCollectorService,
        private DateTimeGenerator $dateTimeGenerator,
    ) {
    }

    public function __invoke(ConfirmPasswordResetCommand $command): void
    {
        if (!preg_match(pattern: '/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,}$/', subject: $command->newPassword)) {
            throw ConfirmPasswordResetException::weakPassword();
        }

        $tokenHash = hash(algo: 'sha256', data: $command->rawToken);
        $token = $this->repository->findByHash(tokenHash: $tokenHash);
        if (null === $token) {
            throw ConfirmPasswordResetException::invalid();
        }

        $token->consume(now: $this->dateTimeGenerator->now());

        $user = $this->userRepository->findById(id: $token->userId);
        if (null === $user) {
            throw ConfirmPasswordResetException::userNotFound(userId: $token->userId);
        }

        $hashedPassword = $this->passwordHasher->hash(user: $user, plainPassword: $command->newPassword);

        $user->changePassword(
            hashedPassword: $hashedPassword,
            updatedByUserId: $user->id,
            dateTimeGenerator: $this->dateTimeGenerator,
        );

        $this->repository->save(token: $token);
        $this->userRepository->save(user: $user);
        $this->domainEventCollectorService->register(aggregate: $token);
        $this->domainEventCollectorService->register(aggregate: $user);
    }
}
