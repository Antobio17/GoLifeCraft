<?php

namespace Gym\Library\Exercise\Infrastructure\UI\API\Controller;

use Gym\Library\Exercise\Application\Command\CreateExerciseCommand;
use Gym\Library\Exercise\Domain\Exception\CreateExerciseException;
use Shared\Tool\Tool\Domain\Exception\ArgumentRequestException;
use Shared\Tool\Tool\Infrastructure\Domain\Service\JsonResponse\JsonResponseBuilder;
use Shared\Tool\Tool\Infrastructure\Domain\Service\Request\RequestExtractor;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Messenger\Exception\HandlerFailedException;
use Symfony\Component\Messenger\HandleTrait;
use Symfony\Component\Messenger\MessageBusInterface;

final class CreateExerciseController
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
            $this->handle(message: new CreateExerciseCommand(
                name: RequestExtractor::getStringRequestValue(request: $request, fieldName: 'name'),
                description: RequestExtractor::getNullableStringRequestValue(request: $request, fieldName: 'description'),
                type: RequestExtractor::getStringRequestValue(request: $request, fieldName: 'type'),
                muscleGroups: RequestExtractor::getArrayRequestValue(request: $request, fieldName: 'muscleGroups'),
                icon: RequestExtractor::getNullableStringRequestValue(request: $request, fieldName: 'icon'),
                createdByUserId: RequestExtractor::getUserSessionId(request: $request),
            ));

            return new JsonResponse(data: null, status: Response::HTTP_CREATED);
        } catch (HandlerFailedException $e) {
            return JsonResponseBuilder::buildResponseFromBaseHandlerFailedException(
                exception: $e,
                exceptionStatusMap: [
                    CreateExerciseException::class => Response::HTTP_BAD_REQUEST,
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
