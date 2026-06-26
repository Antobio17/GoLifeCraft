<?php

namespace Mcp\Server\Mcp\Infrastructure\Domain\QueryModel\InMemory;

use Mcp\Server\Mcp\Domain\QueryModel\ModelExistsNeedleDataQuery;

final class InMemoryModelExistsNeedleDataQuery implements ModelExistsNeedleDataQuery
{
    /** @var array<int, array{field: string, value: mixed, id: string}> */
    private array $records = [];

    public function add(string $field, mixed $value, string $id): void
    {
        $this->records[] = ['field' => $field, 'value' => $value, 'id' => $id];
    }

    public function exists(string $class, string $field, mixed $value, ?string $excludeId): bool
    {
        foreach ($this->records as $record) {
            if ($record['field'] === $field && $record['value'] === $value && $record['id'] !== $excludeId) {
                return true;
            }
        }

        return false;
    }
}
