<?php

namespace Authorization\User\EmailVerificationToken\Application\Command\ConfirmEmailVerification;

use Authorization\User\EmailVerificationToken\Domain\Exception\ConfirmEmailVerificationException;
use Authorization\User\EmailVerificationToken\Domain\Model\EmailVerificationTokenRepository;
use Authorization\User\User\Domain\Model\UserRepository;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final readonly class ConfirmEmailVerificationCommandHandler
{
    public function __construct(
        private EmailVerificationTokenRepository $repository,
        private UserRepository $userRepository,
        private DomainEventCollectorService $domainEventCollectorService,
        private DateTimeGenerator $dateTimeGenerator,
    ) {
    }

    public function __invoke(ConfirmEmailVerificationCommand $command): void
    {
        $tokenHash = hash(algo: 'sha256', data: $command->rawToken);
        $token = $this->repository->findByHash(tokenHash: $tokenHash);
        if (null === $token) {
            throw ConfirmEmailVerificationException::invalid();
        }

        $token->consume(now: $this->dateTimeGenerator->now());

        $user = $this->userRepository->findById(id: $token->userId);
        if (null === $user) {
            throw ConfirmEmailVerificationException::userNotFound(userId: $token->userId);
        }

        $user->verifyEmail(dateTimeGenerator: $this->dateTimeGenerator);

        $this->repository->save(token: $token);
        $this->userRepository->save(user: $user);
        $this->domainEventCollectorService->register(aggregate: $token);
        $this->domainEventCollectorService->register(aggregate: $user);
    }
}
