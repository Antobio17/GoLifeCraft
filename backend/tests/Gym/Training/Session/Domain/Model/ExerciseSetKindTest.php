<?php

namespace App\Tests\Gym\Training\Session\Domain\Model;

use Gym\Training\Session\Application\Command\ExerciseSetData;
use Gym\Training\Session\Domain\Exception\UpdateSessionException;
use Gym\Training\Session\Domain\Model\ExerciseSet;
use PHPUnit\Framework\TestCase;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final class ExerciseSetKindTest extends TestCase
{
    public function testItDefaultsToEffectiveWhenNoKindIsGiven(): void
    {
        $exerciseSet = ExerciseSet::create(
            sessionExerciseId: 'session-exercise-1',
            position: 1,
            reps: 12,
            weight: 100.0,
            createdByUserId: 'user-1',
            dateTimeGenerator: new DateTimeGenerator(),
        );

        $this->assertEquals(expected: ExerciseSet::KIND_EFFECTIVE, actual: $exerciseSet->kind);
        $this->assertTrue(condition: $exerciseSet->isEffective());
    }

    public function testItKeepsTheWarmupKind(): void
    {
        $exerciseSet = ExerciseSet::create(
            sessionExerciseId: 'session-exercise-1',
            position: 1,
            reps: 4,
            weight: 85.0,
            createdByUserId: 'user-1',
            dateTimeGenerator: new DateTimeGenerator(),
            kind: ExerciseSet::KIND_WARMUP,
        );

        $this->assertEquals(expected: ExerciseSet::KIND_WARMUP, actual: $exerciseSet->kind);
        $this->assertFalse(condition: $exerciseSet->isEffective());
    }

    public function testItRejectsAnUnknownKind(): void
    {
        $this->expectException(exception: UpdateSessionException::class);

        ExerciseSet::create(
            sessionExerciseId: 'session-exercise-1',
            position: 1,
            reps: 12,
            weight: 100.0,
            createdByUserId: 'user-1',
            dateTimeGenerator: new DateTimeGenerator(),
            kind: 'approach',
        );
    }

    public function testItReadsTheKindFromTheRawRequestAndFallsBackToEffective(): void
    {
        $sets = ExerciseSetData::listFromArray(rawSets: [
            ['reps' => 12, 'weight' => 60.0, 'kind' => ExerciseSet::KIND_WARMUP],
            ['reps' => 12, 'weight' => 100.0],
        ]);

        $this->assertEquals(expected: ExerciseSet::KIND_WARMUP, actual: $sets[0]->kind);
        $this->assertEquals(expected: ExerciseSet::KIND_EFFECTIVE, actual: $sets[1]->kind);
    }
}
