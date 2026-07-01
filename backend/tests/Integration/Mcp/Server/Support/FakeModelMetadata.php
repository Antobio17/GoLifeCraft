<?php

namespace App\Tests\Integration\Mcp\Server\Support;

use Integration\Mcp\Server\Domain\Exception\ModelNotExposedException;
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
            ],
            relations: [],
            readRoles: ['ROLE_GOD'],
            writeRoles: ['ROLE_GOD'],
        );
    }

    public function aliases(): array
    {
        return ['fake_model'];
    }

    public function has(string $alias): bool
    {
        return 'fake_model' === $alias;
    }

    public function describe(string $alias): ModelDescriptor
    {
        if ('fake_model' !== $alias) {
            throw ModelNotExposedException::alias(alias: $alias);
        }

        return self::descriptor();
    }
}
