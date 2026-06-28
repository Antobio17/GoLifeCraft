<?php

namespace Mcp\Server\Mcp\Domain\Service;

use Mcp\Server\Mcp\Domain\Exception\ModelValidationException;
use Mcp\Server\Mcp\Domain\QueryModel\Dto\FieldDescriptor;
use Mcp\Server\Mcp\Domain\QueryModel\Dto\ModelDescriptor;
use Mcp\Server\Mcp\Domain\QueryModel\WriteModelNeedleDataQuery;

final readonly class ModelValidator
{
    public function __construct(
        private WriteModelNeedleDataQuery $writeModelNeedleDataQuery,
    ) {
    }

    public function validate(
        ModelDescriptor $descriptor,
        array $data,
        bool $isCreate,
        ?string $currentId = null,
    ): void {
        $errors = $this->validateStructure(descriptor: $descriptor, data: $data, isCreate: $isCreate);

        if ([] !== $errors) {
            throw ModelValidationException::failed(errors: $errors);
        }

        $errors = $this->validateUniqueness(descriptor: $descriptor, data: $data, currentId: $currentId);

        if ([] !== $errors) {
            throw ModelValidationException::failed(errors: $errors);
        }
    }

    private function validateStructure(ModelDescriptor $descriptor, array $data, bool $isCreate): array
    {
        $errors = [];

        foreach (array_keys($data) as $key) {
            if ($this->isWritableField($descriptor, $key) || $this->isWritableRelation($descriptor, $key)) {
                continue;
            }

            $errors[$key] = 'unknown or read-only field';
        }

        foreach ($descriptor->fields as $field) {
            $error = $this->validateField(field: $field, data: $data, isCreate: $isCreate);
            if (null !== $error) {
                $errors[$field->name] = $error;
            }
        }

        return $errors;
    }

    private function validateField(FieldDescriptor $field, array $data, bool $isCreate): ?string
    {
        if (!$field->writable) {
            return null;
        }

        $present = array_key_exists($field->name, $data);

        if ($isCreate && $field->required && (!$present || null === $data[$field->name])) {
            return 'is required';
        }

        if (!$present || null === $data[$field->name]) {
            return null;
        }

        return $this->validateValue(field: $field, value: $data[$field->name]);
    }

    private function validateValue(FieldDescriptor $field, mixed $value): ?string
    {
        if (null !== $field->enum && !in_array($value, $field->enum, true)) {
            return sprintf("value '%s' is not in enum [%s]", $value, implode(', ', $field->enum));
        }

        $size = in_array($field->type, ['int', 'float'], true) ? $value : mb_strlen((string) $value);

        if (null !== $field->min && $size < $field->min) {
            return sprintf('must be at least %d', $field->min);
        }

        if (null !== $field->max && $size > $field->max) {
            return sprintf('must be at most %d', $field->max);
        }

        if (null !== $field->regex && 1 !== preg_match('/'.str_replace('/', '\/', $field->regex).'/', (string) $value)) {
            return 'does not match the required pattern';
        }

        return null;
    }

    private function validateUniqueness(ModelDescriptor $descriptor, array $data, ?string $currentId): array
    {
        $errors = [];

        foreach ($descriptor->fields as $field) {
            if (!$field->writable || !$field->unique || !array_key_exists($field->name, $data) || null === $data[$field->name]) {
                continue;
            }

            if (!$this->writeModelNeedleDataQuery->alreadyExists($descriptor->class, $field->name, $data[$field->name], $currentId)) {
                continue;
            }

            $errors[$field->name] = 'must be unique';
        }

        return $errors;
    }

    private function isWritableField(ModelDescriptor $descriptor, string $name): bool
    {
        $field = $descriptor->field($name);

        return null !== $field && $field->writable;
    }

    private function isWritableRelation(ModelDescriptor $descriptor, string $name): bool
    {
        $relation = $descriptor->relation($name);

        return null !== $relation && $relation->writable;
    }
}
