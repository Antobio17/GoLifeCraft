<?php

namespace App\Tests\Integration\Mcp\Server\Support;

use Integration\Mcp\Server\Domain\Exception\ModelNotExposedException;
use Integration\Mcp\Server\Domain\QueryModel\Dto\CascadeDeleteDescriptor;
use Integration\Mcp\Server\Domain\QueryModel\Dto\FieldDescriptor;
use Integration\Mcp\Server\Domain\QueryModel\Dto\ModelDescriptor;
use Integration\Mcp\Server\Domain\Service\ModelMetadataProvider;

final class FakeModelMetadata implements ModelMetadataProvider
{
    public static function descriptor(): ModelDescriptor
    {
        return new ModelDescriptor(
            alias: 'fake_model',
            class: FakeModel::class,
            label: 'Fake model',
            fields: [
                new FieldDescriptor(name: 'name', type: 'string', writable: true, required: true, filterable: true, sortable: true, unique: true, min: 3, max: 255),
                new FieldDescriptor(name: 'status', type: 'string', writable: true, required: true, filterable: true, sortable: false, unique: false, enum: ['draft', 'published']),
                new FieldDescriptor(name: 'calories', type: 'int', writable: true, required: false, filterable: true, sortable: false, unique: false, min: 0),
                new FieldDescriptor(name: 'performedAt', type: 'datetime', writable: true, required: false, filterable: false, sortable: true, unique: false),
                new FieldDescriptor(name: 'tags', type: 'array', writable: true, required: false, filterable: false, sortable: false, unique: false, max: 30),
            ],
            relations: [],
            readRoles: ['ROLE_GOD'],
            writeRoles: ['ROLE_GOD'],
            deleteRoles: ['ROLE_GOD'],
            cascadeDeletes: [new CascadeDeleteDescriptor(resource: 'fake_child', foreignField: 'parentId')],
        );
    }

    public static function childDescriptor(): ModelDescriptor
    {
        return new ModelDescriptor(
            alias: 'fake_child',
            class: FakeChildModel::class,
            label: 'Fake child',
            fields: [
                new FieldDescriptor(name: 'parentId', type: 'string', writable: true, required: true, filterable: true, sortable: false, unique: false, max: 36),
                new FieldDescriptor(name: 'label', type: 'string', writable: true, required: true, filterable: false, sortable: false, unique: false, max: 255),
            ],
            relations: [],
            readRoles: ['ROLE_GOD'],
            writeRoles: ['ROLE_GOD'],
            deleteRoles: ['ROLE_GOD'],
        );
    }

    public function aliases(): array
    {
        return ['fake_model', 'fake_child'];
    }

    public function has(string $alias): bool
    {
        return in_array($alias, $this->aliases(), true);
    }

    public function describe(string $alias): ModelDescriptor
    {
        if ('fake_model' === $alias) {
            return self::descriptor();
        }

        if ('fake_child' === $alias) {
            return self::childDescriptor();
        }

        throw ModelNotExposedException::alias(alias: $alias);
    }
}
