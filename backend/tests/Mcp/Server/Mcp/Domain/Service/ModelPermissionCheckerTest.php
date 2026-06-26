<?php

namespace App\Tests\Mcp\Server\Mcp\Domain\Service;

use App\Tests\Mcp\Server\Mcp\Support\ProductMetadata;
use Mcp\Server\Mcp\Domain\Service\ModelPermissionChecker;
use PHPUnit\Framework\TestCase;

final class ModelPermissionCheckerTest extends TestCase
{
    public function testItAllowsConfiguredRoles(): void
    {
        $checker = new ModelPermissionChecker();
        $descriptor = ProductMetadata::descriptor();

        self::assertTrue($checker->canRead(role: 'ROLE_GOD', descriptor: $descriptor));
        self::assertTrue($checker->canWrite(role: 'ROLE_GOD', descriptor: $descriptor));
    }

    public function testItDeniesUnknownRoles(): void
    {
        $checker = new ModelPermissionChecker();
        $descriptor = ProductMetadata::descriptor();

        self::assertFalse($checker->canRead(role: 'ROLE_CENTER_TECHNICAL', descriptor: $descriptor));
        self::assertFalse($checker->canWrite(role: 'ROLE_CENTER_TECHNICAL', descriptor: $descriptor));
    }
}
