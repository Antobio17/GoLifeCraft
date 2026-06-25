<?php

namespace Authorization\User\User\Infrastructure\UI\API\Controller;

use Authorization\User\User\Application\Command\UpdateMyProfile\UpdateMyProfileCommand;
use Authorization\User\User\Domain\Exception\UpdateMyProfileException;
use Psr\Log\LoggerInterface;
use Shared\Tool\Tool\Domain\Exception\ArgumentRequestException;
use Shared\Tool\Tool\Infrastructure\Domain\Service\JsonResponse\JsonResponseBuilder;
use Shared\Tool\Tool\Infrastructure\Domain\Service\Logger\ExceptionLogger;
use Shared\Tool\Tool\Infrastructure\Domain\Service\Request\RequestExtractor;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Messenger\Exception\HandlerFailedException;
use Symfony\Component\Messenger\HandleTrait;
use Symfony\Component\Messenger\MessageBusInterface;

final class UpdateMyProfileController
{
    use HandleTrait;

    public function __construct(
        MessageBusInterface $messageBus,
        private LoggerInterface $logger,
    ) {
        $this->messageBus = $messageBus;
    }

    public function __invoke(Request $request): JsonResponse
    {
        try {
            $this->handle(message: new UpdateMyProfileCommand(
                userSessionId: RequestExtractor::getUserSessionId(request: $request),
                name: RequestExtractor::getStringRequestValue(request: $request, fieldName: 'name'),
                lastname: RequestExtractor::getStringRequestValue(request: $request, fieldName: 'lastname'),
                email: RequestExtractor::getStringRequestValue(request: $request, fieldName: 'email'),
            ));

            return new JsonResponse(data: null, status: Response::HTTP_NO_CONTENT);
        } catch (HandlerFailedException $e) {
            ExceptionLogger::log(logger: $this->logger, exception: $e, controller: self::class);

            return JsonResponseBuilder::buildResponseFromBaseHandlerFailedException(
                exception: $e,
                exceptionStatusMap: [
                    UpdateMyProfileException::class => Response::HTTP_BAD_REQUEST,
                ]
            );
        } catch (ArgumentRequestException $e) {
            ExceptionLogger::log(logger: $this->logger, exception: $e, controller: self::class, level: 'info');

            return JsonResponseBuilder::buildResponseFromBaseException(
                exception: $e,
                status: Response::HTTP_BAD_REQUEST
            );
        }
    }
}
