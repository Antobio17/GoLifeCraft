<?php

namespace Mcp\Server\Mcp\Domain\QueryModel\Dto;

final readonly class FieldDescriptor
{
    public function __construct(
        public string $name,
        public string $type,
        public bool $writable,
        public bool $required,
        public bool $filterable,
        public bool $sortable,
        public bool $unique,
        public ?int $min = null,
        public ?int $max = null,
        public ?array $enum = null,
        public ?string $regex = null,
    ) {
    }

    public function toArray(): array
    {
        return array_filter([
            'name' => $this->name,
            'type' => $this->type,
            'required' => $this->required,
            'writable' => $this->writable,
            'filterable' => $this->filterable,
            'sortable' => $this->sortable,
            'unique' => $this->unique,
            'min' => $this->min,
            'max' => $this->max,
            'enum' => $this->enum,
            'regex' => $this->regex,
        ], static fn ($value) => null !== $value);
    }
}
