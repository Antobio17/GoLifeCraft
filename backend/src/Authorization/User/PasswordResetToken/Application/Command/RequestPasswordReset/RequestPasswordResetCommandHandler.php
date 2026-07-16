<?php

namespace Authorization\User\PasswordResetToken\Application\Command\RequestPasswordReset;

use Authorization\User\PasswordResetToken\Domain\Model\PasswordResetToken;
use Authorization\User\PasswordResetToken\Domain\Model\PasswordResetTokenRepository;
use Authorization\User\PasswordResetToken\Domain\QueryModel\RequestPasswordResetNeedleDataQuery;
use Authorization\User\PasswordResetToken\Domain\Service\SendPasswordResetEmail;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final readonly class RequestPasswordResetCommandHandler
{
    public function __construct(
        private PasswordResetTokenRepository $repository,
        private RequestPasswordResetNeedleDataQuery $needleDataQuery,
        private DomainEventCollectorService $domainEventCollectorService,
        private DateTimeGenerator $dateTimeGenerator,
        private SendPasswordResetEmail $sendPasswordResetEmail,
        private int $ttlMinutes,
    ) {
    }

    public function __invoke(RequestPasswordResetCommand $command): void
    {
        $user = $this->needleDataQuery->findUserByUsername(username: $command->username);
        if (null === $user) {
            return;
        }

        $rawToken = bin2hex(string: random_bytes(length: 32));
        $now = $this->dateTimeGenerator->now();

        $token = PasswordResetToken::create(
            id: $this->repository->nextId(),
            userId: $user->id,
            rawToken: $rawToken,
            now: $now,
            ttlMinutes: $this->ttlMinutes,
        );

        $this->sendPasswordResetEmail->send(
            email: $user->email,
            name: $user->name,
            languageCode: 'es',
            rawToken: $rawToken,
            requestedAt: $now,
        );

        $this->repository->save(token: $token);
        $this->domainEventCollectorService->register(aggregate: $token);
    }
}
