<?php

namespace App\Tests\Economy\Finance\Transaction\Domain\Model;

use Economy\Finance\Transaction\Domain\Model\FinanceTransaction;
use PHPUnit\Framework\TestCase;
use Symfony\Component\Yaml\Yaml;

final class FinanceTransactionCategoriesTest extends TestCase
{
    private const SIDECAR_PATH = __DIR__.'/../../../../../../src/Economy/Finance/Transaction/Infrastructure/Domain/Model/Doctrine/Mapping/FinanceTransaction.mcp.yaml';

    public function testTheMcpSidecarExposesTheSameCategoriesAsTheAggregate(): void
    {
        $sidecar = Yaml::parseFile(filename: self::SIDECAR_PATH);

        $this->assertSame(
            expected: FinanceTransaction::CATEGORIES,
            actual: $sidecar['fields']['category']['enum'],
        );
    }

    public function testTheMcpSidecarExposesTheSameKindsAndSourcesAsTheAggregate(): void
    {
        $sidecar = Yaml::parseFile(filename: self::SIDECAR_PATH);

        $this->assertSame(
            expected: FinanceTransaction::KINDS,
            actual: $sidecar['fields']['kind']['enum'],
        );
        $this->assertSame(
            expected: FinanceTransaction::SOURCES,
            actual: $sidecar['fields']['source']['enum'],
        );
    }
}
