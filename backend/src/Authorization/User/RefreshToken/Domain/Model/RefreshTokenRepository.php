<?php

namespace Authorization\User\RefreshToken\Domain\Model;

interface RefreshTokenRepository
{
    public function nextId(): string;

    public function findByHash(string $tokenHash): ?RefreshToken;

    public function save(RefreshToken $token): void;
}
