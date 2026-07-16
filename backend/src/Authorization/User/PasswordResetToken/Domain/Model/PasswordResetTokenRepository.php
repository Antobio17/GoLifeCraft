<?php

namespace Authorization\User\PasswordResetToken\Domain\Model;

interface PasswordResetTokenRepository
{
    public function nextId(): string;

    public function findByHash(string $tokenHash): ?PasswordResetToken;

    public function save(PasswordResetToken $token): void;
}
