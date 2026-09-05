<?php

namespace Nutrition\Pantry\Location\Infrastructure\UI\API\Controller;

use Nutrition\Pantry\Location\Application\Command\ReleaseLocationItemCommand;
use Nutrition\Pantry\Location\Domain\Exception\ReleaseLocationItemException;
use Shared\Tool\Tool\Infrastructure\Domain\Service\JsonResponse\JsonResponseBuilder;
use Shared\Tool\Tool\Infrastructure\Domain\Service\Request\RequestExtractor;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Messenger\Exception\HandlerFailedException;
use Symfony\Component\Messenger\HandleTrait;
use Symfony\Component\Messenger\MessageBusInterface;

final class ReleaseLocationItemController
{
    use HandleTrait;

    public function __construct(
        MessageBusInterface $messageBus,
    ) {
        $this->messageBus = $messageBus;
    }

    public function __invoke(Request $request, string $locationId, string $kind, string $refId): JsonResponse
    {
        try {
            $this->handle(message: new ReleaseLocationItemCommand(
                locationId: $locationId,
                kind: $kind,
                refId: $refId,
                releasedByUserId: RequestExtractor::getUserSessionId(request: $request),
            ));

            return new JsonResponse(data: null, status: Response::HTTP_NO_CONTENT);
        } catch (HandlerFailedException $e) {
            return JsonResponseBuilder::buildResponseFromBaseHandlerFailedException(
                exception: $e,
                exceptionStatusMap: [
                    ReleaseLocationItemException::class => Response::HTTP_NOT_FOUND,
                ]
            );
        }
    }
}
