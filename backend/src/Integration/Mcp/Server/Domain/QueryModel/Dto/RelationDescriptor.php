<?php

namespace Integration\Mcp\Server\Domain\QueryModel\Dto;

final readonly class RelationDescriptor
{
    public function __construct(
        public string $name,
        public string $target,
        public string $targetClass,
        public string $kind,
        public bool $writable,
        public bool $expandable,
        public ?string $foreignField = null,
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
            'foreignField' => $this->foreignField,
        ];
    }
}
