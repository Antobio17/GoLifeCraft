<?php

namespace Gym\Training\Session\Domain\Model;

use Gym\Training\Session\Domain\Event\SessionCreated;
use Gym\Training\Session\Domain\Event\SessionDeleted;
use Gym\Training\Session\Domain\Event\SessionDetailsUpdated;
use Gym\Training\Session\Domain\Event\SessionExerciseAdded;
use Gym\Training\Session\Domain\Event\SessionExerciseRemoved;
use Gym\Training\Session\Domain\Event\SessionExercisesReordered;
use Gym\Training\Session\Domain\Event\SessionExerciseUpdated;
use Gym\Training\Session\Domain\Event\SessionUpdated;
use Gym\Training\Session\Domain\Exception\CreateSessionException;
use Gym\Training\Session\Domain\Exception\UpdateSessionException;
use Integration\Mcp\Server\Domain\Model\GenericAggregate;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

class Session extends GenericAggregate
{
    public const string SYNC_MODE_EXERCISES = 'exercises';
    public const string SYNC_MODE_SETS = 'sets';

    public string $name;
    public int $estimatedDurationMinutes;

    /** @var SessionExercise[] */
    public array $exercises = [];

    /**
     * @param SessionExercise[] $exercises
     */
    public static function create(
        string $id,
        string $name,
        int $estimatedDurationMinutes,
        array $exercises,
        string $createdByUserId,
        DateTimeGenerator $dateTimeGenerator,
    ): self {
        if (!self::hasValidDuration(estimatedDurationMinutes: $estimatedDurationMinutes)) {
            throw CreateSessionException::durationMustNotBeNegative();
        }

        $now = $dateTimeGenerator->now();

        $session = new self();
        $session->id = $id;
        $session->name = $name;
        $session->estimatedDurationMinutes = $estimatedDurationMinutes;
        $session->exercises = $exercises;
        $session->stampCreation(userId: $createdByUserId, now: $now);

        $session->record(event: new SessionCreated(
            aggregateId: $id,
            occurredOn: $now,
            name: $name,
        ));

        return $session;
    }

    /**
     * @param SessionExercise[] $exercises
     */
    public function syncExercises(
        array $exercises,
        string $updatedByUserId,
        DateTimeGenerator $dateTimeGenerator,
    ): void {
        $now = $dateTimeGenerator->now();

        $this->exercises = $exercises;
        $this->stampUpdate(userId: $updatedByUserId, now: $now);

        $this->record(event: new SessionUpdated(
            aggregateId: $this->id,
            occurredOn: $now,
            name: $this->name,
        ));
    }

    /**
     * @param SessionExercise[] $exercises
     */
    public function syncExerciseSets(
        array $exercises,
        string $updatedByUserId,
        DateTimeGenerator $dateTimeGenerator,
    ): void {
        $now = $dateTimeGenerator->now();

        $this->exercises = array_map(
            callback: fn (SessionExercise $templateExercise): SessionExercise => $this->replayExercise(
                templateExercise: $templateExercise,
                performedExercise: self::findByExerciseId(
                    exercises: $exercises,
                    exerciseId: $templateExercise->exerciseId,
                ),
                updatedByUserId: $updatedByUserId,
                dateTimeGenerator: $dateTimeGenerator,
            ),
            array: $this->exercises,
        );

        $this->stampUpdate(userId: $updatedByUserId, now: $now);

        $this->record(event: new SessionUpdated(
            aggregateId: $this->id,
            occurredOn: $now,
            name: $this->name,
        ));
    }

    public function delete(
        string $deletedByUserId,
        DateTimeGenerator $dateTimeGenerator,
    ): void {
        $now = $dateTimeGenerator->now();
        $this->stampUpdate(userId: $deletedByUserId, now: $now);

        $this->record(event: new SessionDeleted(
            aggregateId: $this->id,
            occurredOn: $now,
        ));
    }

    public function updateDetails(
        string $name,
        int $estimatedDurationMinutes,
        string $updatedByUserId,
        DateTimeGenerator $dateTimeGenerator,
    ): void {
        if (!self::hasValidDuration(estimatedDurationMinutes: $estimatedDurationMinutes)) {
            throw UpdateSessionException::durationMustNotBeNegative();
        }

        $now = $dateTimeGenerator->now();

        $this->name = $name;
        $this->estimatedDurationMinutes = $estimatedDurationMinutes;
        $this->stampUpdate(userId: $updatedByUserId, now: $now);

        $this->record(event: new SessionDetailsUpdated(
            aggregateId: $this->id,
            occurredOn: $now,
            name: $this->name,
            estimatedDurationMinutes: $this->estimatedDurationMinutes,
            exercises: $this->exercisesPayload(),
            createdAt: $this->createdAt,
            updatedAt: $now,
            createdByUserId: $this->createdByUserId,
            updatedByUserId: $updatedByUserId,
        ));
    }

    public function addExercise(
        SessionExercise $sessionExercise,
        string $addedByUserId,
        DateTimeGenerator $dateTimeGenerator,
    ): void {
        if (null !== $this->findExercise(sessionExerciseId: $sessionExercise->id)) {
            throw UpdateSessionException::sessionExerciseAlreadyExists(sessionExerciseId: $sessionExercise->id);
        }

        $now = $dateTimeGenerator->now();

        $this->exercises[] = $sessionExercise;
        $this->repositionExercises(updatedByUserId: $addedByUserId, dateTimeGenerator: $dateTimeGenerator);
        $this->stampUpdate(userId: $addedByUserId, now: $now);

        $this->record(event: new SessionExerciseAdded(
            aggregateId: $this->id,
            occurredOn: $now,
            sessionExerciseId: $sessionExercise->id,
            exerciseId: $sessionExercise->exerciseId,
            name: $this->name,
            estimatedDurationMinutes: $this->estimatedDurationMinutes,
            exercises: $this->exercisesPayload(),
            createdAt: $this->createdAt,
            updatedAt: $now,
            createdByUserId: $this->createdByUserId,
            updatedByUserId: $addedByUserId,
        ));
    }

    /**
     * @param ExerciseSet[] $sets
     */
    public function updateExercise(
        string $sessionExerciseId,
        ?string $note,
        array $sets,
        string $updatedByUserId,
        DateTimeGenerator $dateTimeGenerator,
    ): void {
        $sessionExercise = $this->exercise(sessionExerciseId: $sessionExerciseId);
        $now = $dateTimeGenerator->now();

        $sessionExercise->replaceSets(
            sets: $sets,
            note: $note,
            updatedByUserId: $updatedByUserId,
            dateTimeGenerator: $dateTimeGenerator,
        );
        $this->stampUpdate(userId: $updatedByUserId, now: $now);

        $this->record(event: new SessionExerciseUpdated(
            aggregateId: $this->id,
            occurredOn: $now,
            sessionExerciseId: $sessionExercise->id,
            exerciseId: $sessionExercise->exerciseId,
            name: $this->name,
            estimatedDurationMinutes: $this->estimatedDurationMinutes,
            exercises: $this->exercisesPayload(),
            createdAt: $this->createdAt,
            updatedAt: $now,
            createdByUserId: $this->createdByUserId,
            updatedByUserId: $updatedByUserId,
        ));
    }

    /**
     * @param string[] $orderedSessionExerciseIds
     */
    public function reorderExercises(
        array $orderedSessionExerciseIds,
        string $reorderedByUserId,
        DateTimeGenerator $dateTimeGenerator,
    ): void {
        $previousOrder = $this->exerciseIds();

        if (!self::isSameSet(current: $previousOrder, ordered: $orderedSessionExerciseIds)) {
            throw UpdateSessionException::sessionExerciseOrderMismatch(sessionId: $this->id);
        }

        $now = $dateTimeGenerator->now();

        $this->exercises = array_map(
            callback: fn (string $sessionExerciseId): SessionExercise => $this->exercise(
                sessionExerciseId: $sessionExerciseId,
            ),
            array: $orderedSessionExerciseIds,
        );
        $this->repositionExercises(updatedByUserId: $reorderedByUserId, dateTimeGenerator: $dateTimeGenerator);
        $this->stampUpdate(userId: $reorderedByUserId, now: $now);

        $this->record(event: new SessionExercisesReordered(
            aggregateId: $this->id,
            occurredOn: $now,
            previousOrder: $previousOrder,
            currentOrder: $this->exerciseIds(),
            name: $this->name,
            estimatedDurationMinutes: $this->estimatedDurationMinutes,
            exercises: $this->exercisesPayload(),
            createdAt: $this->createdAt,
            updatedAt: $now,
            createdByUserId: $this->createdByUserId,
            updatedByUserId: $reorderedByUserId,
        ));
    }

    public function removeExercise(
        string $sessionExerciseId,
        string $removedByUserId,
        DateTimeGenerator $dateTimeGenerator,
    ): void {
        $sessionExercise = $this->exercise(sessionExerciseId: $sessionExerciseId);
        $now = $dateTimeGenerator->now();

        $this->exercises = array_values(array: array_filter(
            array: $this->exercises,
            callback: static fn (SessionExercise $candidate): bool => $candidate->id !== $sessionExerciseId,
        ));
        $this->repositionExercises(updatedByUserId: $removedByUserId, dateTimeGenerator: $dateTimeGenerator);
        $this->stampUpdate(userId: $removedByUserId, now: $now);

        $this->record(event: new SessionExerciseRemoved(
            aggregateId: $this->id,
            occurredOn: $now,
            sessionExerciseId: $sessionExercise->id,
            exerciseId: $sessionExercise->exerciseId,
            name: $this->name,
            estimatedDurationMinutes: $this->estimatedDurationMinutes,
            exercises: $this->exercisesPayload(),
            createdAt: $this->createdAt,
            updatedAt: $now,
            createdByUserId: $this->createdByUserId,
            updatedByUserId: $removedByUserId,
        ));
    }

    public function exercise(string $sessionExerciseId): SessionExercise
    {
        $sessionExercise = $this->findExercise(sessionExerciseId: $sessionExerciseId);

        if (null === $sessionExercise) {
            throw UpdateSessionException::sessionExerciseNotFound(sessionExerciseId: $sessionExerciseId);
        }

        return $sessionExercise;
    }

    /**
     * @return string[]
     */
    public function exerciseIds(): array
    {
        return array_map(
            callback: static fn (SessionExercise $sessionExercise): string => $sessionExercise->id,
            array: array_values(array: $this->exercises),
        );
    }

    public function nextExercisePosition(): int
    {
        return count(value: $this->exercises) + 1;
    }

    public function findExercise(string $sessionExerciseId): ?SessionExercise
    {
        foreach ($this->exercises as $sessionExercise) {
            if ($sessionExercise->id === $sessionExerciseId) {
                return $sessionExercise;
            }
        }

        return null;
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function exercisesPayload(): array
    {
        return array_map(
            callback: static fn (SessionExercise $sessionExercise): array => $sessionExercise->toPayload(),
            array: array_values(array: $this->exercises),
        );
    }

    private function repositionExercises(string $updatedByUserId, DateTimeGenerator $dateTimeGenerator): void
    {
        foreach (array_values(array: $this->exercises) as $index => $sessionExercise) {
            $sessionExercise->moveTo(
                position: $index + 1,
                updatedByUserId: $updatedByUserId,
                dateTimeGenerator: $dateTimeGenerator,
            );
        }
    }

    private function replayExercise(
        SessionExercise $templateExercise,
        ?SessionExercise $performedExercise,
        string $updatedByUserId,
        DateTimeGenerator $dateTimeGenerator,
    ): SessionExercise {
        $sessionExercise = SessionExercise::create(
            sessionId: $this->id,
            exerciseId: $templateExercise->exerciseId,
            position: $templateExercise->position,
            note: $templateExercise->note,
            createdByUserId: $updatedByUserId,
            dateTimeGenerator: $dateTimeGenerator,
        );

        $sets = null === $performedExercise ? $templateExercise->sets : $performedExercise->sets;

        foreach (array_values($sets) as $index => $set) {
            $sessionExercise->addSet(exerciseSet: ExerciseSet::create(
                sessionExerciseId: $sessionExercise->id,
                position: $index + 1,
                reps: $set->reps,
                weight: $set->weight,
                createdByUserId: $updatedByUserId,
                dateTimeGenerator: $dateTimeGenerator,
            ));
        }

        return $sessionExercise;
    }

    /**
     * @param SessionExercise[] $exercises
     */
    private static function findByExerciseId(array $exercises, string $exerciseId): ?SessionExercise
    {
        foreach ($exercises as $exercise) {
            if ($exercise->exerciseId === $exerciseId) {
                return $exercise;
            }
        }

        return null;
    }

    /**
     * @param string[] $current
     * @param string[] $ordered
     */
    private static function isSameSet(array $current, array $ordered): bool
    {
        sort(array: $current);
        sort(array: $ordered);

        return $current === $ordered;
    }

    private static function hasValidDuration(int $estimatedDurationMinutes): bool
    {
        return $estimatedDurationMinutes >= 0;
    }
}
