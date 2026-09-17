<?php

namespace App\Tests\Gym\Training\Session\Domain\Model;

use Gym\Training\Session\Domain\Exception\UpdateSessionException;
use Gym\Training\Session\Domain\Model\SessionExercise;
use PHPUnit\Framework\TestCase;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final class SessionExerciseProgressionTest extends TestCase
{
    private DateTimeGenerator $dateTimeGenerator;

    protected function setUp(): void
    {
        $this->dateTimeGenerator = new DateTimeGenerator();
    }

    public function testAnExerciseDoesNotProgressByDefault(): void
    {
        $sessionExercise = $this->sessionExercise();

        $this->assertEquals(expected: SessionExercise::PROGRESSION_NONE, actual: $sessionExercise->progressionMode);
        $this->assertFalse(condition: $sessionExercise->progresses());
        $this->assertEquals(expected: SessionExercise::DEFAULT_REP_TOLERANCE, actual: $sessionExercise->repTolerance);
    }

    public function testItConfiguresACascadeProgression(): void
    {
        $sessionExercise = $this->sessionExercise();

        $sessionExercise->configureProgression(
            mode: SessionExercise::PROGRESSION_CASCADE,
            repTargets: [12, 11, 10],
            repTolerance: 2,
            incrementKg: 2.5,
            updatedByUserId: 'user-1',
            dateTimeGenerator: $this->dateTimeGenerator,
        );

        $this->assertTrue(condition: $sessionExercise->progresses());
        $this->assertEquals(expected: [12, 11, 10], actual: $sessionExercise->repTargets);
        $this->assertEquals(expected: 2.5, actual: $sessionExercise->incrementKg);
    }

    public function testItRejectsAnUnknownMode(): void
    {
        $this->expectException(exception: UpdateSessionException::class);

        $this->sessionExercise()->configureProgression(
            mode: 'waterfall',
            repTargets: [12],
            repTolerance: 2,
            incrementKg: 2.5,
            updatedByUserId: 'user-1',
            dateTimeGenerator: $this->dateTimeGenerator,
        );
    }

    public function testAProgressingExerciseNeedsRepTargets(): void
    {
        $this->expectException(exception: UpdateSessionException::class);

        $this->sessionExercise()->configureProgression(
            mode: SessionExercise::PROGRESSION_CASCADE,
            repTargets: [],
            repTolerance: 2,
            incrementKg: 2.5,
            updatedByUserId: 'user-1',
            dateTimeGenerator: $this->dateTimeGenerator,
        );
    }

    public function testAProgressingExerciseNeedsAnIncrement(): void
    {
        $this->expectException(exception: UpdateSessionException::class);

        $this->sessionExercise()->configureProgression(
            mode: SessionExercise::PROGRESSION_BLOCK,
            repTargets: [12, 11, 10],
            repTolerance: 2,
            incrementKg: null,
            updatedByUserId: 'user-1',
            dateTimeGenerator: $this->dateTimeGenerator,
        );
    }

    public function testItRejectsANonPositiveIncrement(): void
    {
        $this->expectException(exception: UpdateSessionException::class);

        $this->sessionExercise()->configureProgression(
            mode: SessionExercise::PROGRESSION_BLOCK,
            repTargets: [12],
            repTolerance: 2,
            incrementKg: 0.0,
            updatedByUserId: 'user-1',
            dateTimeGenerator: $this->dateTimeGenerator,
        );
    }

    public function testItRejectsANegativeTolerance(): void
    {
        $this->expectException(exception: UpdateSessionException::class);

        $this->sessionExercise()->configureProgression(
            mode: SessionExercise::PROGRESSION_NONE,
            repTargets: [],
            repTolerance: -1,
            incrementKg: null,
            updatedByUserId: 'user-1',
            dateTimeGenerator: $this->dateTimeGenerator,
        );
    }

    private function sessionExercise(): SessionExercise
    {
        return SessionExercise::create(
            sessionId: 'session-1',
            exerciseId: 'exercise-1',
            position: 1,
            note: null,
            createdByUserId: 'user-1',
            dateTimeGenerator: $this->dateTimeGenerator,
        );
    }
}
