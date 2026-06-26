<?php

namespace App\Tests\Mcp\Server\Mcp\Support;

use Mcp\Server\Mcp\Domain\Exception\ModelNotExposedException;
use Mcp\Server\Mcp\Domain\QueryModel\Dto\FieldDescriptor;
use Mcp\Server\Mcp\Domain\QueryModel\Dto\ModelDescriptor;
use Mcp\Server\Mcp\Domain\QueryModel\Dto\RelationDescriptor;
use Mcp\Server\Mcp\Domain\Service\ModelMetadataProvider;
use Product\Catalog\Format\Domain\Model\Format;
use Product\Catalog\Product\Domain\Model\Product;

final class ProductMetadata implements ModelMetadataProvider
{
    public static function descriptor(): ModelDescriptor
    {
        return new ModelDescriptor(
            alias: 'product',
            class: Product::class,
            label: 'Product',
            fields: [
                new FieldDescriptor(name: 'name', type: 'string', writable: true, required: true, filterable: true, sortable: true, unique: true, min: 3, max: 255),
                new FieldDescriptor(name: 'status', type: 'string', writable: true, required: true, filterable: true, sortable: false, unique: false, enum: ['draft', 'published']),
                new FieldDescriptor(name: 'calories', type: 'int', writable: true, required: false, filterable: true, sortable: false, unique: false, min: 0),
            ],
            relations: [
                new RelationDescriptor(name: 'format', target: 'format', targetClass: Format::class, kind: 'manyToOne', writable: true, expandable: true),
            ],
            readRoles: ['ROLE_GOD'],
            writeRoles: ['ROLE_GOD'],
        );
    }

    public function aliases(): array
    {
        return ['product'];
    }

    public function has(string $alias): bool
    {
        return 'product' === $alias;
    }

    public function describe(string $alias): ModelDescriptor
    {
        if ('product' !== $alias) {
            throw ModelNotExposedException::alias(alias: $alias);
        }

        return self::descriptor();
    }
}
