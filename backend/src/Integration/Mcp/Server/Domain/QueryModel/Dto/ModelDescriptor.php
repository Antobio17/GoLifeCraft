<?php

namespace Integration\Mcp\Server\Domain\QueryModel\Dto;

final readonly class ModelDescriptor
{
    /**
     * @param FieldDescriptor[]         $fields
     * @param RelationDescriptor[]      $relations
     * @param CascadeDeleteDescriptor[] $cascadeDeletes
     */
    public function __construct(
        public string $alias,
        public string $class,
        public string $label,
        public array $fields,
        public array $relations,
        public array $readRoles,
        public array $writeRoles,
        public array $deleteRoles = [],
        public array $cascadeDeletes = [],
    ) {
    }

    public function field(string $name): ?FieldDescriptor
    {
        foreach ($this->fields as $field) {
            if ($field->name === $name) {
                return $field;
            }
        }

        return null;
    }

    public function relation(string $name): ?RelationDescriptor
    {
        foreach ($this->relations as $relation) {
            if ($relation->name === $name) {
                return $relation;
            }
        }

        return null;
    }

    public function toArray(bool $writable, bool $deletable = false): array
    {
        return [
            'alias' => $this->alias,
            'label' => $this->label,
            'writable' => $writable,
            'deletable' => $deletable,
            'deleteCascadesTo' => array_map(
                static fn (CascadeDeleteDescriptor $cascade) => $cascade->resource,
                $this->cascadeDeletes,
            ),
            'fields' => array_map(static fn (FieldDescriptor $field) => $field->toArray(), $this->fields),
            'relations' => array_map(static fn (RelationDescriptor $relation) => $relation->toArray(), $this->relations),
        ];
    }
}
