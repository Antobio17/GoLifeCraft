<?php

namespace App\Tests\Integration\Mcp\Server\Infrastructure\UI\Mcp\Tool;

use Mcp\Capability\Attribute\McpTool;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\TestCase;

final class McpToolDescriptionTest extends TestCase
{
    #[DataProvider('toolProvider')]
    public function testEveryPublishedToolCarriesADescription(string $file): void
    {
        $attribute = self::attributeOf(file: $file);

        self::assertNotNull($attribute, sprintf('%s is missing its #[McpTool] attribute.', $file));
        self::assertNotNull(
            $attribute->description,
            sprintf('The %s tool reaches tools/list without a description, and a client may refuse the whole list.', $attribute->name ?? $file)
        );
        self::assertNotSame('', trim((string) $attribute->description));
    }

    public static function toolProvider(): array
    {
        $projectDir = \dirname(__DIR__, 8);
        $files = glob(sprintf('%s/src/*/*/*/Infrastructure/UI/Mcp/Tool/*Tool.php', $projectDir)) ?: [];

        $cases = [];

        foreach ($files as $file) {
            if ((new \ReflectionClass(self::classOf(file: $file)))->isAbstract()) {
                continue;
            }

            $cases[basename($file, '.php')] = [$file];
        }

        return $cases;
    }

    private static function attributeOf(string $file): ?McpTool
    {
        $class = self::classOf(file: $file);
        $attributes = (new \ReflectionClass($class))->getAttributes(McpTool::class);

        return [] === $attributes ? null : $attributes[0]->newInstance();
    }

    private static function classOf(string $file): string
    {
        $source = file_get_contents($file);

        preg_match('/namespace\s+([^;]+);/', $source, $namespace);
        preg_match('/(?:final\s+)?class\s+(\w+)/', $source, $name);

        return sprintf('%s\\%s', trim($namespace[1]), $name[1]);
    }
}
