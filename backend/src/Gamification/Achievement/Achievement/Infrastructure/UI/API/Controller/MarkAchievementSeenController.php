<?php

namespace Gamification\Achievement\Achievement\Infrastructure\UI\API\Controller;

use Gamification\Achievement\Achievement\Application\Command\MarkAchievementSeenCommand;
use Gamification\Achievement\Achievement\Domain\Exception\MarkAchievementSeenException;
use Shared\Tool\Tool\Infrastructure\Domain\Service\JsonResponse\JsonResponseBuilder;
use Shared\Tool\Tool\Infrastructure\Domain\Service\Request\RequestExtractor;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Messenger\Exception\HandlerFailedException;
use Symfony\Component\Messenger\HandleTrait;
use Symfony\Component\Messenger\MessageBusInterface;

final class MarkAchievementSeenController
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
            $this->handle(message: new MarkAchievementSeenCommand(
                definitionKey: $request->attributes->get(key: 'definitionKey'),
                seenByUserId: RequestExtractor::getUserSessionId(request: $request),
            ));

            return new JsonResponse(data: null, status: Response::HTTP_NO_CONTENT);
        } catch (HandlerFailedException $e) {
            return JsonResponseBuilder::buildResponseFromBaseHandlerFailedException(
                exception: $e,
                exceptionStatusMap: [
                    MarkAchievementSeenException::class => Response::HTTP_NOT_FOUND,
                ]
            );
        }
    }
}
