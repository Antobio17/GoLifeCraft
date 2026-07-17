<?php

namespace Shared\Tenant\Tenant\Domain\Service;

interface TenantProvisioner
{
    /**
     * Ensures the tenant database exists and its schema (tables) is up to date.
     * Idempotent: safe to call when the database already exists.
     */
    public function provision(string $tenantId): void;
}
