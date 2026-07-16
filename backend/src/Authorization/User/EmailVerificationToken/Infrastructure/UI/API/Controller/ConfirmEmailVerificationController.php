<?php

namespace Authorization\User\EmailVerificationToken\Infrastructure\UI\API\Controller;

use Authorization\User\EmailVerificationToken\Application\Command\ConfirmEmailVerification\ConfirmEmailVerificationCommand;
use Authorization\User\EmailVerificationToken\Domain\Exception\ConfirmEmailVerificationException;
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

final class ConfirmEmailVerificationController
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
            $this->handle(message: new ConfirmEmailVerificationCommand(
                rawToken: RequestExtractor::getStringRequestValue(request: $request, fieldName: 'token'),
            ));

            return new JsonResponse(data: null, status: Response::HTTP_NO_CONTENT);
        } catch (HandlerFailedException $e) {
            ExceptionLogger::log(logger: $this->logger, exception: $e, source: self::class);

            return JsonResponseBuilder::buildResponseFromBaseHandlerFailedException(
                exception: $e,
                exceptionStatusMap: [
                    ConfirmEmailVerificationException::class => Response::HTTP_BAD_REQUEST,
                ]
            );
        } catch (ArgumentRequestException|ConfirmEmailVerificationException $e) {
            ExceptionLogger::log(logger: $this->logger, exception: $e, source: self::class, level: 'info');

            return JsonResponseBuilder::buildResponseFromBaseException(
                exception: $e,
                status: Response::HTTP_BAD_REQUEST
            );
        }
    }
}
