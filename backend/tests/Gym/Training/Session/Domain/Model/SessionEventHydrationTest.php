<?php

namespace App\Tests\Gym\Training\Session\Domain\Model;

use Gym\Training\Session\Domain\Event\SessionCreated;
use Gym\Training\Session\Domain\Event\SessionDeleted;
use Gym\Training\Session\Domain\Model\ExerciseSet;
use Gym\Training\Session\Domain\Model\Session;
use Gym\Training\Session\Domain\Model\SessionExercise;
use PHPUnit\Framework\TestCase;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final class SessionEventHydrationTest extends TestCase
{
    private DateTimeGenerator $dateTimeGenerator;

    protected function setUp(): void
    {
        $this->dateTimeGenerator = new DateTimeGenerator();
    }

    public function testCreatedCarriesTheWholeSessionWithItsExercisesAndSets(): void
    {
        $session = $this->session();

        /** @var SessionCreated $event */
        $event = $session->pullDomainEvents()[0];

        $this->assertInstanceOf(expected: SessionCreated::class, actual: $event);
        $this->assertSame(expected: 'Torso A', actual: $event->name);
        $this->assertSame(expected: 55, actual: $event->estimatedDurationMinutes);
        $this->assertSame(expected: 120, actual: $event->restSeconds);
        $this->assertSame(expected: 'god-user-id', actual: $event->createdByUserId);
        $this->assertSame(expected: $session->createdAt, actual: $event->createdAt);

        $this->assertCount(expectedCount: 1, haystack: $event->exercises);
        $this->assertSame(expected: 'session-exercise-1', actual: $event->exercises[0]['id']);
        $this->assertSame(expected: 'session-1', actual: $event->exercises[0]['sessionId']);
        $this->assertSame(expected: 'exercise-1', actual: $event->exercises[0]['exerciseId']);
        $this->assertSame(expected: 'Sin bloquear codos', actual: $event->exercises[0]['note']);
        $this->assertCount(expectedCount: 1, haystack: $event->exercises[0]['sets']);
        $this->assertSame(expected: 10, actual: $event->exercises[0]['sets'][0]['reps']);
        $this->assertSame(expected: 60.0, actual: $event->exercises[0]['sets'][0]['weight']);
    }

    public function testDeletedCarriesTheWholeSessionSoItCanBeRebuilt(): void
    {
        $session = $this->session();
        $session->pullDomainEvents();

        $session->delete(deletedByUserId: 'another-user-id', dateTimeGenerator: $this->dateTimeGenerator);

        /** @var SessionDeleted $event */
        $event = $session->pullDomainEvents()[0];

        $this->assertInstanceOf(expected: SessionDeleted::class, actual: $event);
        $this->assertSame(expected: 'Torso A', actual: $event->name);
        $this->assertSame(expected: 55, actual: $event->estimatedDurationMinutes);
        $this->assertSame(expected: 'god-user-id', actual: $event->createdByUserId);
        $this->assertSame(expected: 'another-user-id', actual: $event->deletedByUserId);
        $this->assertCount(expectedCount: 1, haystack: $event->exercises);
        $this->assertCount(expectedCount: 1, haystack: $event->exercises[0]['sets']);
    }

    private function session(): Session
    {
        $sessionExercise = SessionExercise::createWithId(
            id: 'session-exercise-1',
            sessionId: 'session-1',
            exerciseId: 'exercise-1',
            position: 1,
            note: 'Sin bloquear codos',
            createdByUserId: 'god-user-id',
            dateTimeGenerator: $this->dateTimeGenerator,
        );
        $sessionExercise->addSet(exerciseSet: ExerciseSet::create(
            sessionExerciseId: 'session-exercise-1',
            position: 1,
            reps: 10,
            weight: 60.0,
            createdByUserId: 'god-user-id',
            dateTimeGenerator: $this->dateTimeGenerator,
        ));

        return Session::create(
            id: 'session-1',
            name: 'Torso A',
            estimatedDurationMinutes: 55,
            restSeconds: 120,
            exercises: [$sessionExercise],
            createdByUserId: 'god-user-id',
            dateTimeGenerator: $this->dateTimeGenerator,
        );
    }
}
