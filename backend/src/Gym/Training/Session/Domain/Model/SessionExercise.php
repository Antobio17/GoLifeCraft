<?php

namespace Gym\Training\Session\Domain\Model;

use Gym\Training\Session\Domain\Exception\UpdateSessionException;
use Integration\Mcp\Server\Domain\Model\GenericAggregate;
use Ramsey\Uuid\Uuid;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

class SessionExercise extends GenericAggregate
{
    public const string PROGRESSION_NONE = 'none';
    public const string PROGRESSION_BLOCK = 'block';
    public const string PROGRESSION_CASCADE = 'cascade';

    public const array PROGRESSION_MODES = [
        self::PROGRESSION_NONE,
        self::PROGRESSION_BLOCK,
        self::PROGRESSION_CASCADE,
    ];

    public const int DEFAULT_REP_TOLERANCE = 2;

    public string $sessionId;
    public string $exerciseId;
    public int $position;
    public ?string $note = null;
    public string $progressionMode = self::PROGRESSION_NONE;
    public int $repTolerance = self::DEFAULT_REP_TOLERANCE;
    public ?float $incrementKg = null;
    public int $consecutiveHolds = 0;

    /** @var int[] */
    public array $repTargets = [];

    /** @var ExerciseSet[] */
    public array $sets = [];

    public static function createWithId(
        string $id,
        string $sessionId,
        string $exerciseId,
        int $position,
        ?string $note,
        string $createdByUserId,
        DateTimeGenerator $dateTimeGenerator,
    ): self {
        $sessionExercise = self::create(
            sessionId: $sessionId,
            exerciseId: $exerciseId,
            position: $position,
            note: $note,
            createdByUserId: $createdByUserId,
            dateTimeGenerator: $dateTimeGenerator,
        );
        $sessionExercise->id = $id;

        return $sessionExercise;
    }

    public static function create(
        string $sessionId,
        string $exerciseId,
        int $position,
        ?string $note,
        string $createdByUserId,
        DateTimeGenerator $dateTimeGenerator,
    ): self {
        $now = $dateTimeGenerator->now();

        $sessionExercise = new self();
        $sessionExercise->id = Uuid::uuid4()->toString();
        $sessionExercise->sessionId = $sessionId;
        $sessionExercise->exerciseId = $exerciseId;
        $sessionExercise->position = $position;
        $sessionExercise->note = $note;
        $sessionExercise->stampCreation(userId: $createdByUserId, now: $now);

        return $sessionExercise;
    }

    /**
     * @param int[] $repTargets
     */
    public function configureProgression(
        string $mode,
        array $repTargets,
        int $repTolerance,
        ?float $incrementKg,
        string $updatedByUserId,
        DateTimeGenerator $dateTimeGenerator,
    ): void {
        self::guardProgression(
            mode: $mode,
            repTargets: $repTargets,
            repTolerance: $repTolerance,
            incrementKg: $incrementKg,
        );

        $this->progressionMode = $mode;
        $this->repTargets = array_values(array: $repTargets);
        $this->repTolerance = $repTolerance;
        $this->incrementKg = $incrementKg;
        $this->stampUpdate(userId: $updatedByUserId, now: $dateTimeGenerator->now());
    }

    /**
     * El entreno no lleva la configuración de progresión, así que al sincronizar
     * la plantilla con lo entrenado hay que recuperarla del ejercicio que ya estaba.
     */
    public function adoptProgressionFrom(self $previous): void
    {
        $this->progressionMode = $previous->progressionMode;
        $this->repTargets = $previous->repTargets;
        $this->repTolerance = $previous->repTolerance;
        $this->incrementKg = $previous->incrementKg;
        $this->consecutiveHolds = $previous->consecutiveHolds;
    }

    public function holdOnce(): void
    {
        ++$this->consecutiveHolds;
    }

    public function clearHolds(): void
    {
        $this->consecutiveHolds = 0;
    }

    public function progresses(): bool
    {
        return self::PROGRESSION_NONE !== $this->progressionMode;
    }

    public function addSet(ExerciseSet $exerciseSet): void
    {
        $this->sets[] = $exerciseSet;
    }

    /**
     * @param ExerciseSet[] $sets
     */
    public function replaceSets(
        array $sets,
        ?string $note,
        string $updatedByUserId,
        DateTimeGenerator $dateTimeGenerator,
    ): void {
        $this->note = $note;
        $this->sets = array_values(array: $sets);
        $this->stampUpdate(userId: $updatedByUserId, now: $dateTimeGenerator->now());
    }

    public function moveTo(int $position, string $updatedByUserId, DateTimeGenerator $dateTimeGenerator): void
    {
        if ($this->position === $position) {
            return;
        }

        $this->position = $position;
        $this->stampUpdate(userId: $updatedByUserId, now: $dateTimeGenerator->now());
    }

    /**
     * @param int[] $repTargets
     */
    private static function guardProgression(
        string $mode,
        array $repTargets,
        int $repTolerance,
        ?float $incrementKg,
    ): void {
        if (!in_array($mode, self::PROGRESSION_MODES, true)) {
            throw UpdateSessionException::invalidProgressionMode(mode: $mode);
        }

        if ($repTolerance < 0) {
            throw UpdateSessionException::repToleranceMustNotBeNegative();
        }

        if (null !== $incrementKg && $incrementKg <= 0) {
            throw UpdateSessionException::incrementMustBePositive();
        }

        foreach ($repTargets as $repTarget) {
            if ($repTarget < 1) {
                throw UpdateSessionException::repTargetMustBePositive(repTarget: $repTarget);
            }
        }

        if (self::PROGRESSION_NONE === $mode) {
            return;
        }

        if ([] === $repTargets) {
            throw UpdateSessionException::progressionNeedsRepTargets();
        }

        if (null === $incrementKg) {
            throw UpdateSessionException::progressionNeedsIncrement();
        }
    }
}
