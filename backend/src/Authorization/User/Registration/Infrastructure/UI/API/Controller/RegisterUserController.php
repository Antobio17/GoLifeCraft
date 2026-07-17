<?php

namespace Authorization\User\Registration\Infrastructure\UI\API\Controller;

use Authorization\User\Registration\Application\Command\RegisterUser\RegisterUserCommand;
use Authorization\User\Registration\Domain\Exception\RegisterUserException;
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

final class RegisterUserController
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
            $email = RequestExtractor::getStringRequestValue(request: $request, fieldName: 'email');
            $name = RequestExtractor::getNullableStringRequestValue(request: $request, fieldName: 'name');
            $lastname = RequestExtractor::getNullableStringRequestValue(request: $request, fieldName: 'lastname');

            $this->handle(message: new RegisterUserCommand(
                email: $email,
                password: RequestExtractor::getStringRequestValue(request: $request, fieldName: 'password'),
                name: $name ?? strstr(haystack: $email, needle: '@', before_needle: true) ?: $email,
                lastname: $lastname ?? '',
            ));

            return new JsonResponse(data: null, status: Response::HTTP_ACCEPTED);
        } catch (HandlerFailedException $e) {
            ExceptionLogger::log(logger: $this->logger, exception: $e, source: self::class);

            return JsonResponseBuilder::buildResponseFromBaseHandlerFailedException(
                exception: $e,
                exceptionStatusMap: [
                    RegisterUserException::class => Response::HTTP_BAD_REQUEST,
                ]
            );
        } catch (ArgumentRequestException|RegisterUserException $e) {
            ExceptionLogger::log(logger: $this->logger, exception: $e, source: self::class, level: 'info');

            return JsonResponseBuilder::buildResponseFromBaseException(
                exception: $e,
                status: Response::HTTP_BAD_REQUEST
            );
        }
    }
}
