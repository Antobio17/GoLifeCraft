<?php

namespace Mcp\Server\Mcp\Domain\QueryModel\Dto;

final readonly class RelationDescriptor
{
    public function __construct(
        public string $name,
        public string $target,
        public string $targetClass,
        public string $kind,
        public bool $writable,
        public bool $expandable,
    ) {
    }

    public function toArray(): array
    {
        return [
            'name' => $this->name,
            'target' => $this->target,
            'kind' => $this->kind,
            'writable' => $this->writable,
            'expandable' => $this->expandable,
        ];
    }
}
