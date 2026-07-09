<?php

namespace Gym\Training\Workout\Infrastructure\UI\API\Controller;

use Gym\Training\Workout\Application\Query\GetActiveWorkoutQuery;
use Gym\Training\Workout\Domain\Exception\GetWorkoutException;
use Shared\Tool\Tool\Infrastructure\Domain\Service\JsonResponse\JsonResponseBuilder;
use Shared\Tool\Tool\Infrastructure\Domain\Service\Request\RequestExtractor;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Messenger\Exception\HandlerFailedException;
use Symfony\Component\Messenger\HandleTrait;
use Symfony\Component\Messenger\MessageBusInterface;

final class GetActiveWorkoutController
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
            return JsonResponseBuilder::buildSingleResponse(
                querySingleResult: $this->handle(message: new GetActiveWorkoutQuery(
                    userId: RequestExtractor::getUserSessionId(request: $request),
                )),
            );
        } catch (HandlerFailedException $e) {
            if ($e->getPrevious() instanceof GetWorkoutException) {
                return new JsonResponse(data: null, status: Response::HTTP_NO_CONTENT);
            }

            return JsonResponseBuilder::buildResponseFromBaseHandlerFailedException(
                exception: $e,
                exceptionStatusMap: []
            );
        }
    }
}
