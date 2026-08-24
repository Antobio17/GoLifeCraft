<?php

namespace Authorization\User\User\Domain\Service;

interface ImpersonationTokenGenerator
{
    public function generate(string $impersonatorUserId, string $impersonatedUserId): ImpersonationToken;
}
