<?php

namespace Gym\Training\Workout\Infrastructure\UI\Mcp\Tool;

use Gym\Training\Workout\Application\Command\MarkWorkoutSetDoneCommand;
use Integration\Mcp\Server\Infrastructure\UI\Mcp\Tool\McpMessengerTool;
use Mcp\Capability\Attribute\McpTool;
use Shared\Tool\Tool\Infrastructure\Domain\Service\Request\RequestExtractor;

#[McpTool(
    name: 'mark_workout_set_done',
    description: 'Tick a set of an already finished workout as done, or untick it. This is the way to repair the usual slip: a set that was really lifted but was never ticked in the app before closing the workout, which leaves it out of the volume, the top sets and every stat, because they all count ticked sets only. It works on finished workouts on purpose: the one in progress belongs to the app, which keeps saving over it. It changes nothing else of the set, so fix the reps or the weight with write_model on "workout_set". Find the set with query_model on "training_workout" (sorted by startedAt), then "workout_exercise" filtered by workoutId, then "workout_set" filtered by workoutExerciseId.',
)]
final class MarkWorkoutSetDoneTool extends McpMessengerTool
{
    /**
     * @param string $workoutId Id of the finished workout the set belongs to
     * @param string $setId     Id of the workout_set to tick
     * @param bool   $done      True to tick the set as done, false to undo it
     */
    public function __invoke(string $workoutId, string $setId, bool $done = true): array
    {
        return $this->dispatch(messageFactory: fn () => new MarkWorkoutSetDoneCommand(
            workoutId: $workoutId,
            setId: $setId,
            done: $done,
            updatedByUserId: RequestExtractor::getUserSessionId(request: $this->request()),
        ));
    }
}
