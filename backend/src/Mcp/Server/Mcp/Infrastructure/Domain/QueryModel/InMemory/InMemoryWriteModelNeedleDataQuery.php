<?php

namespace Mcp\Server\Mcp\Infrastructure\Domain\QueryModel\InMemory;

use Mcp\Server\Mcp\Domain\QueryModel\WriteModelNeedleDataQuery;

final class InMemoryWriteModelNeedleDataQuery implements WriteModelNeedleDataQuery
{
    /** @var array<int, array{class: string, field: string, value: mixed, id: string}> */
    private array $records = [];

    public function add(string $class, string $field, mixed $value, string $id): void
    {
        $this->records[] = ['class' => $class, 'field' => $field, 'value' => $value, 'id' => $id];
    }

    public function modelAlreadyExists(string $class, string $field, mixed $value, ?string $excludeId): bool
    {
        foreach ($this->records as $record) {
            if ($record['class'] !== $class) {
                continue;
            }

            if ($record['field'] !== $field) {
                continue;
            }

            if ($record['value'] !== $value) {
                continue;
            }

            if ($record['id'] === $excludeId) {
                continue;
            }

            return true;
        }

        return false;
    }
}
