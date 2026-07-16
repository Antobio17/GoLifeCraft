<?php

namespace Authorization\User\EmailVerificationToken\Domain\Model;

interface EmailVerificationTokenRepository
{
    public function nextId(): string;

    public function findByHash(string $tokenHash): ?EmailVerificationToken;

    public function save(EmailVerificationToken $token): void;
}
