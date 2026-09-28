<?php

namespace Authorization\User\PushSubscription\Infrastructure\UI\API\Controller;

use Authorization\User\PushSubscription\Application\Command\SendPushNotification\SendPushNotificationCommand;
use Shared\Push\Push\Domain\Exception\SendPushNotificationException;
use Shared\Tool\Tool\Domain\Exception\ArgumentRequestException;
use Shared\Tool\Tool\Infrastructure\Domain\Service\JsonResponse\JsonResponseBuilder;
use Shared\Tool\Tool\Infrastructure\Domain\Service\Request\RequestExtractor;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Messenger\Exception\HandlerFailedException;
use Symfony\Component\Messenger\HandleTrait;
use Symfony\Component\Messenger\MessageBusInterface;

final class SendTestPushNotificationController
{
    use HandleTrait;

    private const string TEST_TAG = 'push-test';
    private const string TEST_URL = '/me';

    public function __construct(
        MessageBusInterface $messageBus,
    ) {
        $this->messageBus = $messageBus;
    }

    public function __invoke(Request $request): JsonResponse
    {
        try {
            $this->handle(message: new SendPushNotificationCommand(
                userId: RequestExtractor::getUserSessionId(request: $request),
                title: RequestExtractor::getStringRequestValue(request: $request, fieldName: 'title'),
                body: RequestExtractor::getStringRequestValue(request: $request, fieldName: 'body'),
                url: self::TEST_URL,
                tag: self::TEST_TAG,
            ));

            return new JsonResponse(data: null, status: Response::HTTP_ACCEPTED);
        } catch (HandlerFailedException $e) {
            return JsonResponseBuilder::buildResponseFromBaseHandlerFailedException(
                exception: $e,
                exceptionStatusMap: [
                    SendPushNotificationException::class => Response::HTTP_SERVICE_UNAVAILABLE,
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
