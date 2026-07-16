<?php

namespace Authorization\User\PasswordResetToken\Infrastructure\UI\API\Controller;

use Authorization\User\PasswordResetToken\Application\Command\RequestPasswordReset\RequestPasswordResetCommand;
use Psr\Log\LoggerInterface;
use Shared\Tool\Tool\Domain\Exception\ArgumentRequestException;
use Shared\Tool\Tool\Infrastructure\Domain\Service\JsonResponse\JsonResponseBuilder;
use Shared\Tool\Tool\Infrastructure\Domain\Service\Logger\ExceptionLogger;
use Shared\Tool\Tool\Infrastructure\Domain\Service\Request\RequestExtractor;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Messenger\HandleTrait;
use Symfony\Component\Messenger\MessageBusInterface;

final class RequestPasswordResetController
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
            $this->handle(message: new RequestPasswordResetCommand(
                username: RequestExtractor::getStringRequestValue(request: $request, fieldName: 'username'),
            ));

            return new JsonResponse(data: null, status: Response::HTTP_ACCEPTED);
        } catch (ArgumentRequestException $e) {
            ExceptionLogger::log(logger: $this->logger, exception: $e, source: self::class, level: 'info');

            return JsonResponseBuilder::buildResponseFromBaseException(
                exception: $e,
                status: Response::HTTP_BAD_REQUEST
            );
        }
    }
}
