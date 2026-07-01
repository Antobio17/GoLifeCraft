<?php

namespace Integration\Mcp\Server\Infrastructure\Domain\Service\Doctrine;

use Doctrine\ORM\EntityManagerInterface;
use Integration\Mcp\Server\Domain\Exception\ModelNotExposedException;
use Integration\Mcp\Server\Domain\QueryModel\Dto\FieldDescriptor;
use Integration\Mcp\Server\Domain\QueryModel\Dto\ModelDescriptor;
use Integration\Mcp\Server\Domain\QueryModel\Dto\RelationDescriptor;
use Integration\Mcp\Server\Domain\Service\ModelMetadataProvider;
use Integration\Mcp\Server\Infrastructure\Domain\Service\McpResourceRegistry;
use Integration\Mcp\Server\Infrastructure\Domain\Service\Sidecar\YamlSidecarReader;

final readonly class DoctrineModelMetadataProvider implements ModelMetadataProvider
{
    private const array EXCLUDED_FIELDS = [
        'id', 'version', 'createdAt', 'updatedAt', 'createdByUserId', 'updatedByUserId',
    ];

    private const array TYPE_MAP = [
        'string' => 'string', 'text' => 'string', 'guid' => 'uuid',
        'integer' => 'int', 'smallint' => 'int', 'bigint' => 'int',
        'float' => 'float', 'decimal' => 'float',
        'boolean' => 'bool',
        'datetime' => 'datetime', 'datetime_immutable' => 'datetime', 'date' => 'datetime',
    ];

    public function __construct(
        private McpResourceRegistry $registry,
        private YamlSidecarReader $sidecarReader,
        private EntityManagerInterface $entityManager,
    ) {
    }

    public function aliases(): array
    {
        return $this->registry->aliases();
    }

    public function has(string $alias): bool
    {
        return $this->registry->has(alias: $alias);
    }

    public function describe(string $alias): ModelDescriptor
    {
        if (!$this->registry->has(alias: $alias)) {
            throw ModelNotExposedException::alias(alias: $alias);
        }

        $resource = $this->registry->get(alias: $alias);
        $sidecar = $this->sidecarReader->read(path: $resource['sidecar']);
        $classMetadata = $this->entityManager->getClassMetadata(className: $resource['class']);

        return new ModelDescriptor(
            alias: $alias,
            class: $resource['class'],
            label: $sidecar['label'] ?? $alias,
            fields: $this->buildFields(sidecar: $sidecar, doctrineMetadata: $classMetadata),
            relations: $this->buildRelations(sidecar: $sidecar),
            readRoles: $resource['read_roles'] ?? [],
            writeRoles: $resource['write_roles'] ?? [],
        );
    }

    /**
     * @return FieldDescriptor[]
     */
    private function buildFields(array $sidecar, object $doctrineMetadata): array
    {
        $fields = [];

        foreach ($sidecar['fields'] ?? [] as $name => $rules) {
            if (in_array($name, self::EXCLUDED_FIELDS, true)) {
                continue;
            }

            $fields[] = new FieldDescriptor(
                name: $name,
                type: $this->resolveType(name: $name, rules: $rules, doctrineMetadata: $doctrineMetadata),
                writable: (bool) ($rules['writable'] ?? false),
                required: (bool) ($rules['required'] ?? false),
                filterable: (bool) ($rules['filterable'] ?? false),
                sortable: (bool) ($rules['sortable'] ?? false),
                unique: (bool) ($rules['unique'] ?? false),
                min: $rules['min'] ?? null,
                max: $rules['max'] ?? null,
                enum: $rules['enum'] ?? null,
                regex: $rules['regex'] ?? null,
            );
        }

        return $fields;
    }

    /**
     * @return RelationDescriptor[]
     */
    private function buildRelations(array $sidecar): array
    {
        $relations = [];

        foreach ($sidecar['relations'] ?? [] as $name => $rules) {
            $relations[] = new RelationDescriptor(
                name: $name,
                target: $rules['target'],
                targetClass: $this->registry->classOf(alias: $rules['target']),
                kind: $rules['kind'],
                writable: (bool) ($rules['writable'] ?? false),
                expandable: (bool) ($rules['expandable'] ?? false),
            );
        }

        return $relations;
    }

    private function resolveType(string $name, array $rules, object $doctrineMetadata): string
    {
        if (isset($rules['type'])) {
            return $rules['type'];
        }

        $doctrineType = $doctrineMetadata->getTypeOfField(fieldName: $name);

        return self::TYPE_MAP[$doctrineType] ?? 'string';
    }
}
