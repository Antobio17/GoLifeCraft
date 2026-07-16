<?php

namespace Authorization\User\EmailVerificationToken\Domain\Service;

interface SendVerificationEmail
{
    public function send(
        string $email,
        string $name,
        string $languageCode,
        string $rawToken,
    ): void;
}
