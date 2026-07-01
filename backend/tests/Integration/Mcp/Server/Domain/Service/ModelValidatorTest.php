<?php

namespace App\Tests\Integration\Mcp\Server\Domain\Service;

use App\Tests\Integration\Mcp\Server\Support\FakeModel;
use App\Tests\Integration\Mcp\Server\Support\FakeModelMetadata;
use Integration\Mcp\Server\Domain\Exception\ModelValidationException;
use Integration\Mcp\Server\Domain\Service\ModelValidator;
use Integration\Mcp\Server\Infrastructure\Domain\QueryModel\InMemory\InMemoryWriteModelNeedleDataQuery;
use PHPUnit\Framework\TestCase;

final class ModelValidatorTest extends TestCase
{
    private InMemoryWriteModelNeedleDataQuery $writeModelNeedleDataQuery;
    private ModelValidator $validator;

    protected function setUp(): void
    {
        $this->writeModelNeedleDataQuery = new InMemoryWriteModelNeedleDataQuery();
        $this->validator = new ModelValidator(writeModelNeedleDataQuery: $this->writeModelNeedleDataQuery);
    }

    public function testItPassesWithValidData(): void
    {
        $this->validator->validate(
            descriptor: FakeModelMetadata::descriptor(),
            data: ['name' => 'Barrita', 'status' => 'draft', 'calories' => 10],
            isCreate: true,
        );

        $this->addToAssertionCount(1);
    }

    public function testItRejectsValuesOutOfEnum(): void
    {
        $this->expectException(ModelValidationException::class);

        $this->validator->validate(
            descriptor: FakeModelMetadata::descriptor(),
            data: ['name' => 'Barrita', 'status' => 'archived'],
            isCreate: true,
        );
    }

    public function testItRejectsValuesBelowMinLength(): void
    {
        $this->expectException(ModelValidationException::class);

        $this->validator->validate(
            descriptor: FakeModelMetadata::descriptor(),
            data: ['name' => 'ab', 'status' => 'draft'],
            isCreate: true,
        );
    }

    public function testItRejectsDuplicatedUniqueValues(): void
    {
        $this->writeModelNeedleDataQuery->add(class: FakeModel::class, field: 'name', value: 'Barrita', id: 'other-id');

        $this->expectException(ModelValidationException::class);

        $this->validator->validate(
            descriptor: FakeModelMetadata::descriptor(),
            data: ['name' => 'Barrita', 'status' => 'draft'],
            isCreate: true,
        );
    }
}
