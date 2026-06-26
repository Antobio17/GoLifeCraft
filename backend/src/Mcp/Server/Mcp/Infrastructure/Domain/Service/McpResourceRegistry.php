<?php

namespace Mcp\Server\Mcp\Infrastructure\Domain\Service;

final readonly class McpResourceRegistry
{
    public function __construct(
        private array $resources,
    ) {
    }

    /**
     * @return string[]
     */
    public function aliases(): array
    {
        return array_keys($this->resources);
    }

    public function has(string $alias): bool
    {
        return isset($this->resources[$alias]);
    }

    public function get(string $alias): array
    {
        return $this->resources[$alias];
    }

    public function classOf(string $alias): string
    {
        return $this->resources[$alias]['class'];
    }
}
