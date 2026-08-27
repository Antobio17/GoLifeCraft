<?php

namespace Nutrition\Recipe\Recipe\Domain\Model;

use Integration\Mcp\Server\Domain\Model\GenericAggregate;
use Ramsey\Uuid\Uuid;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

class RecipeStep extends GenericAggregate
{
    public string $recipeId;
    public int $position;
    public string $text;
    public ?int $minutes = null;

    public static function create(
        string $recipeId,
        int $position,
        string $text,
        ?int $minutes,
        string $createdByUserId,
        DateTimeGenerator $dateTimeGenerator,
    ): self {
        $now = $dateTimeGenerator->now();

        $step = new self();
        $step->id = Uuid::uuid4()->toString();
        $step->recipeId = $recipeId;
        $step->position = $position;
        $step->text = $text;
        $step->minutes = $minutes;
        $step->stampCreation(userId: $createdByUserId, now: $now);

        return $step;
    }

    /**
     * @return array{position: int, text: string, minutes: ?int}
     */
    public function toRecordedStep(): array
    {
        return [
            'position' => $this->position,
            'text' => $this->text,
            'minutes' => $this->minutes,
        ];
    }
}
