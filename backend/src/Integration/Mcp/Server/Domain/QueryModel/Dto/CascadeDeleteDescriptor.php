<?php

namespace Integration\Mcp\Server\Domain\QueryModel\Dto;

final readonly class CascadeDeleteDescriptor
{
    public function __construct(
        public string $resource,
        public ?string $foreignField = null,
        public ?string $localField = null,
    ) {
    }
}
