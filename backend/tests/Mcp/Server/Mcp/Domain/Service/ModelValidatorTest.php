<?php

namespace App\Tests\Mcp\Server\Mcp\Domain\Service;

use App\Tests\Mcp\Server\Mcp\Support\ProductMetadata;
use Mcp\Server\Mcp\Domain\Exception\ModelValidationException;
use Mcp\Server\Mcp\Domain\Service\ModelValidator;
use Mcp\Server\Mcp\Infrastructure\Domain\QueryModel\InMemory\InMemoryModelExistsNeedleDataQuery;
use PHPUnit\Framework\TestCase;

final class ModelValidatorTest extends TestCase
{
    private InMemoryModelExistsNeedleDataQuery $existsNeedleDataQuery;
    private ModelValidator $validator;

    protected function setUp(): void
    {
        $this->existsNeedleDataQuery = new InMemoryModelExistsNeedleDataQuery();
        $this->validator = new ModelValidator(existsNeedleDataQuery: $this->existsNeedleDataQuery);
    }

    public function testItPassesWithValidData(): void
    {
        $this->validator->validate(
            descriptor: ProductMetadata::descriptor(),
            data: ['name' => 'Barrita', 'status' => 'draft', 'calories' => 10],
            isCreate: true,
        );

        $this->addToAssertionCount(1);
    }

    public function testItRejectsValuesOutOfEnum(): void
    {
        $this->expectException(ModelValidationException::class);

        $this->validator->validate(
            descriptor: ProductMetadata::descriptor(),
            data: ['name' => 'Barrita', 'status' => 'archived'],
            isCreate: true,
        );
    }

    public function testItRejectsValuesBelowMinLength(): void
    {
        $this->expectException(ModelValidationException::class);

        $this->validator->validate(
            descriptor: ProductMetadata::descriptor(),
            data: ['name' => 'ab', 'status' => 'draft'],
            isCreate: true,
        );
    }

    public function testItRejectsDuplicatedUniqueValues(): void
    {
        $this->existsNeedleDataQuery->add(field: 'name', value: 'Barrita', id: 'other-id');

        $this->expectException(ModelValidationException::class);

        $this->validator->validate(
            descriptor: ProductMetadata::descriptor(),
            data: ['name' => 'Barrita', 'status' => 'draft'],
            isCreate: true,
        );
    }
}
