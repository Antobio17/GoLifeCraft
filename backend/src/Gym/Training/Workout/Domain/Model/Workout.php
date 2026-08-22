<?php

namespace Gym\Training\Workout\Domain\Model;

use Gym\Training\Workout\Domain\Event\WorkoutFinished;
use Gym\Training\Workout\Domain\Event\WorkoutStarted;
use Gym\Training\Workout\Domain\Exception\FinishWorkoutException;
use Gym\Training\Workout\Domain\Exception\UpdateWorkoutException;
use Integration\Mcp\Server\Domain\Model\GenericAggregate;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

class Workout extends GenericAggregate
{
    public const string STATUS_IN_PROGRESS = 'in_progress';
    public const string STATUS_COMPLETED = 'completed';

    public const array TEMPLATE_SYNC_MODES = [
        WorkoutFinished::TEMPLATE_SYNC_EXERCISES,
        WorkoutFinished::TEMPLATE_SYNC_SETS,
        WorkoutFinished::TEMPLATE_SYNC_NONE,
    ];

    public ?string $sessionId = null;
    public string $sessionName;
    public string $status;
    public \DateTime $startedAt;
    public ?\DateTime $finishedAt = null;
    public int $durationSeconds = 0;

    /** @var WorkoutExercise[] */
    public array $exercises = [];

    /**
     * @param WorkoutExercise[] $exercises
     */
    public static function start(
        string $id,
        ?string $sessionId,
        string $sessionName,
        array $exercises,
        string $startedByUserId,
        DateTimeGenerator $dateTimeGenerator,
    ): self {
        $now = $dateTimeGenerator->now();

        $workout = new self();
        $workout->id = $id;
        $workout->sessionId = $sessionId;
        $workout->sessionName = $sessionName;
        $workout->status = self::STATUS_IN_PROGRESS;
        $workout->startedAt = $now;
        $workout->finishedAt = null;
        $workout->durationSeconds = 0;
        $workout->exercises = $exercises;
        $workout->stampCreation(userId: $startedByUserId, now: $now);

        $workout->record(event: new WorkoutStarted(
            aggregateId: $id,
            occurredOn: $now,
            sessionName: $sessionName,
        ));

        return $workout;
    }

    /**
     * @param WorkoutExercise[] $exercises
     */
    public function saveProgress(
        array $exercises,
        int $durationSeconds,
        string $updatedByUserId,
        DateTimeGenerator $dateTimeGenerator,
        ?string $sessionName = null,
    ): void {
        if (self::STATUS_COMPLETED === $this->status) {
            throw UpdateWorkoutException::workoutAlreadyFinished(workoutId: $this->id);
        }

        if (null !== $sessionName && '' !== trim($sessionName)) {
            $this->sessionName = trim($sessionName);
        }

        $this->exercises = $exercises;
        $this->durationSeconds = max(0, $durationSeconds);
        $this->stampUpdate(userId: $updatedByUserId, now: $dateTimeGenerator->now());
    }

    /**
     * @param WorkoutExercise[] $exercises
     */
    public function finish(
        array $exercises,
        int $durationSeconds,
        string $templateSyncMode,
        string $finishedByUserId,
        DateTimeGenerator $dateTimeGenerator,
        ?string $linkedSessionId = null,
    ): void {
        if (self::STATUS_COMPLETED === $this->status) {
            throw FinishWorkoutException::workoutAlreadyFinished(workoutId: $this->id);
        }

        if (!in_array($templateSyncMode, self::TEMPLATE_SYNC_MODES, true)) {
            throw FinishWorkoutException::invalidTemplateSyncMode(templateSyncMode: $templateSyncMode);
        }

        $now = $dateTimeGenerator->now();

        if (null !== $linkedSessionId) {
            $this->sessionId = $linkedSessionId;
        }

        $this->exercises = $exercises;
        $this->durationSeconds = max(0, $durationSeconds);
        $this->status = self::STATUS_COMPLETED;
        $this->finishedAt = $now;
        $this->stampUpdate(userId: $finishedByUserId, now: $now);

        $this->record(event: new WorkoutFinished(
            aggregateId: $this->id,
            occurredOn: $now,
            durationSeconds: $this->durationSeconds,
            sessionId: $this->sessionId,
            finishedByUserId: $finishedByUserId,
            templateSyncMode: $templateSyncMode,
            exercises: $this->exercisesSnapshot(),
        ));
    }

    /**
     * @return array<int, array{exerciseId: string, exerciseName: string, type: string, muscleGroups: string[], position: int, note: string|null, sets: array<int, array{position: int, reps: int, weight: float|null}>}>
     */
    private function exercisesSnapshot(): array
    {
        return array_map(
            callback: fn (WorkoutExercise $exercise): array => [
                'exerciseId' => $exercise->exerciseId,
                'exerciseName' => $exercise->exerciseName,
                'type' => $exercise->type,
                'muscleGroups' => $exercise->muscleGroups,
                'position' => $exercise->position,
                'note' => $exercise->note,
                'sets' => array_map(
                    callback: fn (WorkoutSet $set): array => [
                        'position' => $set->position,
                        'reps' => $set->reps,
                        'weight' => $set->weight,
                    ],
                    array: $exercise->sets,
                ),
            ],
            array: $this->exercises,
        );
    }
}
