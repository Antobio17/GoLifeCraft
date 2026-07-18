<?php

namespace Authorization\User\RefreshToken\Infrastructure\Domain\Service;

use Authorization\User\RefreshToken\Domain\Model\RefreshToken;
use Authorization\User\RefreshToken\Domain\Model\RefreshTokenRepository;
use Authorization\User\RefreshToken\Domain\Service\RefreshTokenGrant;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final readonly class RefreshTokenManager
{
    public function __construct(
        private RefreshTokenRepository $repository,
        private DateTimeGenerator $dateTimeGenerator,
    ) {
    }

    public function issue(string $userId, ?string $clientId, int $ttlDays): string
    {
        $rawToken = bin2hex(string: random_bytes(length: 32));

        $token = RefreshToken::issue(
            id: $this->repository->nextId(),
            userId: $userId,
            clientId: $clientId,
            rawToken: $rawToken,
            now: $this->dateTimeGenerator->now(),
            ttlDays: $ttlDays,
        );

        $this->repository->save(token: $token);

        return $rawToken;
    }

    public function rotate(string $rawToken, ?string $clientId, int $ttlDays): ?RefreshTokenGrant
    {
        $now = $this->dateTimeGenerator->now();
        $token = $this->repository->findByHash(tokenHash: RefreshToken::hash(rawToken: $rawToken));

        if (null === $token || !$token->isUsable(now: $now) || $token->clientId !== $clientId) {
            return null;
        }

        $token->revoke(now: $now);
        $this->repository->save(token: $token);

        return new RefreshTokenGrant(
            userId: $token->userId,
            rawToken: $this->issue(userId: $token->userId, clientId: $clientId, ttlDays: $ttlDays),
            clientId: $clientId,
        );
    }
}
