<?php

namespace Gym\Training\Workout\Domain\Model;

use Gym\Training\Workout\Domain\Event\WorkoutFinished;
use Gym\Training\Workout\Domain\Event\WorkoutProgressSaved;
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
    public ?\DateTime $restStartedAt = null;

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
        $workout->restStartedAt = null;
        $workout->exercises = $exercises;
        $workout->stampCreation(userId: $startedByUserId, now: $now);

        $workout->record(event: new WorkoutStarted(
            aggregateId: $id,
            occurredOn: $now,
            sessionId: $sessionId,
            sessionName: $sessionName,
            status: $workout->status,
            startedAt: $workout->startedAt,
            finishedAt: $workout->finishedAt,
            durationSeconds: $workout->durationSeconds,
            restStartedAt: $workout->restStartedAt,
            exercises: $workout->exercisesSnapshot(),
            createdAt: $now,
            updatedAt: $now,
            createdByUserId: $startedByUserId,
            startedByUserId: $startedByUserId,
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
        ?\DateTime $restStartedAt = null,
    ): void {
        if (self::STATUS_COMPLETED === $this->status) {
            throw UpdateWorkoutException::workoutAlreadyFinished(workoutId: $this->id);
        }

        if (null !== $sessionName && '' !== trim($sessionName)) {
            $this->sessionName = trim($sessionName);
        }

        $now = $dateTimeGenerator->now();

        $this->exercises = $exercises;
        $this->durationSeconds = max(0, $durationSeconds);
        $this->restStartedAt = $restStartedAt;
        $this->stampUpdate(userId: $updatedByUserId, now: $now);

        $this->record(event: new WorkoutProgressSaved(
            aggregateId: $this->id,
            occurredOn: $now,
            sessionId: $this->sessionId,
            sessionName: $this->sessionName,
            status: $this->status,
            startedAt: $this->startedAt,
            finishedAt: $this->finishedAt,
            durationSeconds: $this->durationSeconds,
            restStartedAt: $this->restStartedAt,
            exercises: $this->exercisesSnapshot(),
            createdAt: $this->createdAt,
            updatedAt: $now,
            createdByUserId: $this->createdByUserId,
            updatedByUserId: $updatedByUserId,
        ));
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
        $this->restStartedAt = null;
        $this->stampUpdate(userId: $finishedByUserId, now: $now);

        $this->record(event: new WorkoutFinished(
            aggregateId: $this->id,
            occurredOn: $now,
            sessionId: $this->sessionId,
            sessionName: $this->sessionName,
            status: $this->status,
            startedAt: $this->startedAt,
            finishedAt: $this->finishedAt,
            durationSeconds: $this->durationSeconds,
            restStartedAt: $this->restStartedAt,
            exercises: $this->exercisesSnapshot(),
            createdAt: $this->createdAt,
            updatedAt: $now,
            createdByUserId: $this->createdByUserId,
            templateSyncMode: $templateSyncMode,
            finishedByUserId: $finishedByUserId,
        ));
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function exercisesSnapshot(): array
    {
        return self::snapshotAll(aggregates: $this->exercises);
    }
}
