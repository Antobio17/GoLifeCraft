<?php

namespace Gym\Training\Workout\Infrastructure\UI\API\Controller;

use Gym\Training\Workout\Application\Command\StartWorkoutCommand;
use Gym\Training\Workout\Application\Command\WorkoutExerciseData;
use Gym\Training\Workout\Domain\Exception\StartWorkoutException;
use Shared\Tool\Tool\Domain\Exception\ArgumentRequestException;
use Shared\Tool\Tool\Infrastructure\Domain\Service\JsonResponse\JsonResponseBuilder;
use Shared\Tool\Tool\Infrastructure\Domain\Service\Request\RequestExtractor;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Messenger\Exception\HandlerFailedException;
use Symfony\Component\Messenger\HandleTrait;
use Symfony\Component\Messenger\MessageBusInterface;

final class StartWorkoutController
{
    use HandleTrait;

    public function __construct(
        MessageBusInterface $messageBus,
    ) {
        $this->messageBus = $messageBus;
    }

    public function __invoke(Request $request): JsonResponse
    {
        try {
            $this->handle(message: new StartWorkoutCommand(
                workoutId: RequestExtractor::getStringRequestValue(request: $request, fieldName: 'workoutId'),
                sessionId: RequestExtractor::getNullableStringRequestValue(request: $request, fieldName: 'sessionId'),
                sessionName: RequestExtractor::getStringRequestValue(request: $request, fieldName: 'sessionName'),
                exercises: WorkoutExerciseData::listFromArray(
                    rawExercises: RequestExtractor::getArrayRequestValue(request: $request, fieldName: 'exercises'),
                ),
                startedByUserId: RequestExtractor::getUserSessionId(request: $request),
            ));

            return new JsonResponse(data: null, status: Response::HTTP_CREATED);
        } catch (HandlerFailedException $e) {
            return JsonResponseBuilder::buildResponseFromBaseHandlerFailedException(
                exception: $e,
                exceptionStatusMap: [
                    StartWorkoutException::class => Response::HTTP_BAD_REQUEST,
                ]
            );
        } catch (ArgumentRequestException $e) {
            return JsonResponseBuilder::buildResponseFromBaseException(
                exception: $e,
                status: Response::HTTP_BAD_REQUEST
            );
        }
    }
}
