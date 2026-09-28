<?php

namespace Notification\Notification\PushSubscription\Infrastructure\UI\API\Controller;

use Notification\Notification\PushSubscription\Application\Command\SubscribeToPushNotifications\SubscribeToPushNotificationsCommand;
use Notification\Notification\PushSubscription\Domain\Exception\SubscribeToPushNotificationsException;
use Shared\Tool\Tool\Domain\Exception\ArgumentRequestException;
use Shared\Tool\Tool\Infrastructure\Domain\Service\JsonResponse\JsonResponseBuilder;
use Shared\Tool\Tool\Infrastructure\Domain\Service\Request\RequestExtractor;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Messenger\Exception\HandlerFailedException;
use Symfony\Component\Messenger\HandleTrait;
use Symfony\Component\Messenger\MessageBusInterface;

final class SubscribeToPushNotificationsController
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
            $this->handle(message: new SubscribeToPushNotificationsCommand(
                userSessionId: RequestExtractor::getUserSessionId(request: $request),
                endpoint: RequestExtractor::getStringRequestValue(request: $request, fieldName: 'endpoint'),
                publicKey: RequestExtractor::getStringRequestValue(request: $request, fieldName: 'publicKey'),
                authToken: RequestExtractor::getStringRequestValue(request: $request, fieldName: 'authToken'),
                contentEncoding: RequestExtractor::getStringRequestValue(request: $request, fieldName: 'contentEncoding'),
                userAgent: $request->headers->get(key: 'User-Agent'),
            ));

            return new JsonResponse(data: null, status: Response::HTTP_NO_CONTENT);
        } catch (HandlerFailedException $e) {
            return JsonResponseBuilder::buildResponseFromBaseHandlerFailedException(
                exception: $e,
                exceptionStatusMap: [
                    SubscribeToPushNotificationsException::class => Response::HTTP_BAD_REQUEST,
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
