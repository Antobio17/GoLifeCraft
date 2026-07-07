<?php

namespace Gym\Training\Session\Infrastructure\UI\API\Controller;

use Gym\Training\Session\Application\Command\CreateSessionCommand;
use Gym\Training\Session\Application\Command\SessionExerciseData;
use Gym\Training\Session\Domain\Exception\CreateSessionException;
use Shared\Tool\Tool\Domain\Exception\ArgumentRequestException;
use Shared\Tool\Tool\Infrastructure\Domain\Service\JsonResponse\JsonResponseBuilder;
use Shared\Tool\Tool\Infrastructure\Domain\Service\Request\RequestExtractor;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Messenger\Exception\HandlerFailedException;
use Symfony\Component\Messenger\HandleTrait;
use Symfony\Component\Messenger\MessageBusInterface;

final class CreateSessionController
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
            $this->handle(message: new CreateSessionCommand(
                name: RequestExtractor::getStringRequestValue(request: $request, fieldName: 'name'),
                estimatedDurationMinutes: RequestExtractor::getIntRequestValue(request: $request, fieldName: 'estimatedDurationMinutes'),
                exercises: SessionExerciseData::listFromArray(
                    rawExercises: RequestExtractor::getArrayRequestValue(request: $request, fieldName: 'exercises'),
                ),
                createdByUserId: RequestExtractor::getUserSessionId(request: $request),
            ));

            return new JsonResponse(data: null, status: Response::HTTP_CREATED);
        } catch (HandlerFailedException $e) {
            return JsonResponseBuilder::buildResponseFromBaseHandlerFailedException(
                exception: $e,
                exceptionStatusMap: [
                    CreateSessionException::class => Response::HTTP_BAD_REQUEST,
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
