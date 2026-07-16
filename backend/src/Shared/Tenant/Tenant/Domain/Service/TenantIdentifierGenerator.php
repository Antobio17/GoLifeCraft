<?php

namespace Shared\Tenant\Tenant\Domain\Service;

interface TenantIdentifierGenerator
{
    public function next(): string;
}
