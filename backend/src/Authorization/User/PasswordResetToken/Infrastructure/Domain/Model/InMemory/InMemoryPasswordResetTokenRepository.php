<?php

namespace Authorization\User\PasswordResetToken\Infrastructure\Domain\Model\InMemory;

use Authorization\User\PasswordResetToken\Domain\Model\PasswordResetToken;
use Authorization\User\PasswordResetToken\Domain\Model\PasswordResetTokenRepository;
use Ramsey\Uuid\Uuid;

final class InMemoryPasswordResetTokenRepository implements PasswordResetTokenRepository
{
    /** @var PasswordResetToken[] */
    private array $tokens = [];

    public function nextId(): string
    {
        return Uuid::uuid4()->toString();
    }

    public function findByHash(string $tokenHash): ?PasswordResetToken
    {
        foreach ($this->tokens as $token) {
            if ($token->tokenHash === $tokenHash) {
                return $token;
            }
        }

        return null;
    }

    public function save(PasswordResetToken $token): void
    {
        $this->tokens[$token->id] = $token;
    }
}
