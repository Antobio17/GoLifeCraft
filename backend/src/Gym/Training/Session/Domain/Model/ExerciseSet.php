<?php

namespace Gym\Training\Session\Domain\Model;

use Gym\Training\Session\Domain\Exception\UpdateSessionException;
use Integration\Mcp\Server\Domain\Model\GenericAggregate;
use Ramsey\Uuid\Uuid;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

class ExerciseSet extends GenericAggregate
{
    public const string KIND_WARMUP = 'warmup';
    public const string KIND_EFFECTIVE = 'effective';

    public const array KINDS = [
        self::KIND_WARMUP,
        self::KIND_EFFECTIVE,
    ];

    public string $sessionExerciseId;
    public int $position;
    public int $reps;
    public ?float $weight = null;
    public string $kind = self::KIND_EFFECTIVE;
    public ?float $warmupPercent = null;

    public static function create(
        string $sessionExerciseId,
        int $position,
        int $reps,
        ?float $weight,
        string $createdByUserId,
        DateTimeGenerator $dateTimeGenerator,
        string $kind = self::KIND_EFFECTIVE,
    ): self {
        if (!in_array($kind, self::KINDS, true)) {
            throw UpdateSessionException::invalidSetKind(kind: $kind);
        }

        $now = $dateTimeGenerator->now();

        $exerciseSet = new self();
        $exerciseSet->id = Uuid::uuid4()->toString();
        $exerciseSet->sessionExerciseId = $sessionExerciseId;
        $exerciseSet->position = $position;
        $exerciseSet->reps = $reps;
        $exerciseSet->weight = $weight;
        $exerciseSet->kind = $kind;
        $exerciseSet->stampCreation(userId: $createdByUserId, now: $now);

        return $exerciseSet;
    }

    public function isEffective(): bool
    {
        return self::KIND_EFFECTIVE === $this->kind;
    }

    public function planFor(int $reps, ?float $weight): void
    {
        $this->reps = $reps;
        $this->weight = $weight;
    }

    public function captureWarmupPercent(float $workingWeight): void
    {
        if ($this->isEffective()) {
            $this->warmupPercent = null;

            return;
        }

        if ($workingWeight <= 0.0 || null === $this->weight) {
            return;
        }

        $this->warmupPercent = $this->weight / $workingWeight;
    }

    public function followWorkingWeight(float $workingWeight, float $increment): void
    {
        if (null === $this->warmupPercent || $increment <= 0.0) {
            return;
        }

        $this->weight = max($increment, round($this->warmupPercent * $workingWeight / $increment) * $increment);
    }
}
