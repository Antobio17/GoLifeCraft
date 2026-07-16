<?php

namespace Authorization\User\EmailVerificationToken\Infrastructure\Domain\Model\InMemory;

use Authorization\User\EmailVerificationToken\Domain\Model\EmailVerificationToken;
use Authorization\User\EmailVerificationToken\Domain\Model\EmailVerificationTokenRepository;
use Ramsey\Uuid\Uuid;

final class InMemoryEmailVerificationTokenRepository implements EmailVerificationTokenRepository
{
    /** @var EmailVerificationToken[] */
    private array $tokens = [];

    public function nextId(): string
    {
        return Uuid::uuid4()->toString();
    }

    public function findByHash(string $tokenHash): ?EmailVerificationToken
    {
        foreach ($this->tokens as $token) {
            if ($token->tokenHash === $tokenHash) {
                return $token;
            }
        }

        return null;
    }

    public function save(EmailVerificationToken $token): void
    {
        $this->tokens[$token->id] = $token;
    }
}
