<?php

namespace App\Tests\Integration\Mcp\Server\Domain\Service;

use App\Tests\Integration\Mcp\Server\Support\FakeModelMetadata;
use Integration\Mcp\Server\Domain\Service\ModelPermissionChecker;
use PHPUnit\Framework\TestCase;

final class ModelPermissionCheckerTest extends TestCase
{
    public function testItAllowsConfiguredRoles(): void
    {
        $checker = new ModelPermissionChecker();
        $descriptor = FakeModelMetadata::descriptor();

        self::assertTrue($checker->canRead(role: 'ROLE_GOD', descriptor: $descriptor));
        self::assertTrue($checker->canWrite(role: 'ROLE_GOD', descriptor: $descriptor));
    }

    public function testItDeniesUnknownRoles(): void
    {
        $checker = new ModelPermissionChecker();
        $descriptor = FakeModelMetadata::descriptor();

        self::assertFalse($checker->canRead(role: 'ROLE_USER', descriptor: $descriptor));
        self::assertFalse($checker->canWrite(role: 'ROLE_USER', descriptor: $descriptor));
    }
}
