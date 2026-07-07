<?php

namespace Gym\Training\Session\Domain\Model;

use Gym\Training\Session\Domain\Event\SessionCreated;
use Gym\Training\Session\Domain\Event\SessionDeleted;
use Gym\Training\Session\Domain\Event\SessionUpdated;
use Gym\Training\Session\Domain\Exception\CreateSessionException;
use Gym\Training\Session\Domain\Exception\UpdateSessionException;
use Integration\Mcp\Server\Domain\Model\GenericAggregate;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

class Session extends GenericAggregate
{
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
    public function update(
        string $name,
        int $estimatedDurationMinutes,
        array $exercises,
        string $updatedByUserId,
        DateTimeGenerator $dateTimeGenerator,
    ): void {
        if (!self::hasValidDuration(estimatedDurationMinutes: $estimatedDurationMinutes)) {
            throw UpdateSessionException::durationMustNotBeNegative();
        }

        $now = $dateTimeGenerator->now();

        $this->name = $name;
        $this->estimatedDurationMinutes = $estimatedDurationMinutes;
        $this->exercises = $exercises;
        $this->stampUpdate(userId: $updatedByUserId, now: $now);

        $this->record(event: new SessionUpdated(
            aggregateId: $this->id,
            occurredOn: $now,
            name: $name,
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

    private static function hasValidDuration(int $estimatedDurationMinutes): bool
    {
        return $estimatedDurationMinutes >= 0;
    }
}
