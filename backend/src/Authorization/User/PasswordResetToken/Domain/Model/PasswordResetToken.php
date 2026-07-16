<?php

namespace Authorization\User\PasswordResetToken\Domain\Model;

use Authorization\User\PasswordResetToken\Domain\Event\PasswordResetTokenConsumed;
use Authorization\User\PasswordResetToken\Domain\Event\PasswordResetTokenCreated;
use Authorization\User\PasswordResetToken\Domain\Exception\ConfirmPasswordResetException;
use Shared\Shared\Shared\Domain\Model\Aggregate;

class PasswordResetToken extends Aggregate
{
    private int $version;

    public function __construct(
        public readonly string $id,
        public readonly string $userId,
        public readonly string $tokenHash,
        public readonly \DateTime $createdAt,
        public readonly \DateTime $expiresAt,
        public ?\DateTime $consumedAt = null,
    ) {
    }

    public static function create(
        string $id,
        string $userId,
        string $rawToken,
        \DateTime $now,
        int $ttlMinutes,
    ): self {
        $tokenHash = hash(algo: 'sha256', data: $rawToken);
        $expiresAt = (clone $now)->modify(modifier: "+{$ttlMinutes} minutes");

        $token = new self(
            id: $id,
            userId: $userId,
            tokenHash: $tokenHash,
            createdAt: $now,
            expiresAt: $expiresAt,
        );

        $token->record(event: new PasswordResetTokenCreated(
            aggregateId: $id,
            occurredOn: $now,
            userId: $userId,
            rawToken: $rawToken,
            expiresAt: $expiresAt,
        ));

        return $token;
    }

    public function consume(\DateTime $now): void
    {
        if (null !== $this->consumedAt) {
            throw ConfirmPasswordResetException::alreadyUsed(tokenId: $this->id);
        }

        if ($this->isExpired(now: $now)) {
            throw ConfirmPasswordResetException::expired(tokenId: $this->id);
        }

        $this->consumedAt = $now;

        $this->record(event: new PasswordResetTokenConsumed(
            aggregateId: $this->id,
            occurredOn: $now,
            userId: $this->userId,
        ));
    }

    private function isExpired(\DateTime $now): bool
    {
        return $this->expiresAt->format(format: 'Y-m-d H:i:s') < $now->format(format: 'Y-m-d H:i:s');
    }
}
