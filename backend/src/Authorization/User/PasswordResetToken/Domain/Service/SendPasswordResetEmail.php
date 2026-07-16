<?php

namespace Authorization\User\PasswordResetToken\Domain\Service;

interface SendPasswordResetEmail
{
    public function send(
        string $email,
        string $name,
        string $languageCode,
        string $rawToken,
        \DateTime $requestedAt,
    ): void;
}
