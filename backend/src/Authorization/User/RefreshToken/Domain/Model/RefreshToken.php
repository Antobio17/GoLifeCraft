<?php

namespace Authorization\User\RefreshToken\Domain\Model;

use Shared\Shared\Shared\Domain\Model\Aggregate;

class RefreshToken extends Aggregate
{
    private int $version;

    public function __construct(
        public readonly string $id,
        public readonly string $userId,
        public readonly string $tokenHash,
        public readonly ?string $clientId,
        public readonly \DateTime $createdAt,
        public readonly \DateTime $expiresAt,
        public ?\DateTime $revokedAt = null,
    ) {
    }

    public static function issue(
        string $id,
        string $userId,
        ?string $clientId,
        string $rawToken,
        \DateTime $now,
        int $ttlDays,
    ): self {
        return new self(
            id: $id,
            userId: $userId,
            tokenHash: self::hash(rawToken: $rawToken),
            clientId: $clientId,
            createdAt: $now,
            expiresAt: (clone $now)->modify(modifier: "+{$ttlDays} days"),
        );
    }

    public static function hash(string $rawToken): string
    {
        return hash(algo: 'sha256', data: $rawToken);
    }

    public function isUsable(\DateTime $now): bool
    {
        return null === $this->revokedAt && !$this->isExpired(now: $now);
    }

    public function revoke(\DateTime $now): void
    {
        $this->revokedAt = $now;
    }

    private function isExpired(\DateTime $now): bool
    {
        return $this->expiresAt->format(format: 'Y-m-d H:i:s') < $now->format(format: 'Y-m-d H:i:s');
    }
}
