<?php

namespace App\Tests\Gym\Analytics\Stats\Infrastructure\Domain\QueryModel\Doctrine;

use Gym\Analytics\Stats\Infrastructure\Domain\QueryModel\Doctrine\EffectiveWeightExpression;
use PHPUnit\Framework\TestCase;

final class EffectiveWeightExpressionTest extends TestCase
{
    public function testItDoublesOnlyThePerSideWeightMode(): void
    {
        $this->assertSame(
            expected: "(COALESCE(ws.weight, 0) * CASE WHEN we.weight_mode = 'perSide' THEN 2 ELSE 1 END)",
            actual: EffectiveWeightExpression::sql(setAlias: 'ws', exerciseAlias: 'we'),
        );
    }

    public function testItSumsVolumeWithTheEffectiveWeight(): void
    {
        $this->assertSame(
            expected: "COALESCE(SUM(ws.reps * (COALESCE(ws.weight, 0) * CASE WHEN we.weight_mode = 'perSide' THEN 2 ELSE 1 END)), 0)",
            actual: EffectiveWeightExpression::volumeSql(setAlias: 'ws', exerciseAlias: 'we'),
        );
    }
}
