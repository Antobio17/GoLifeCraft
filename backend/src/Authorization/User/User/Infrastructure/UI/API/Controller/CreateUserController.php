<?php

namespace Authorization\User\User\Infrastructure\UI\API\Controller;

use Authorization\User\User\Application\Command\CreateUserCommand;
use Authorization\User\User\Domain\Exception\CreateUserException;
use Shared\Tool\Tool\Domain\Exception\ArgumentRequestException;
use Shared\Tool\Tool\Infrastructure\Domain\Service\JsonResponse\JsonResponseBuilder;
use Shared\Tool\Tool\Infrastructure\Domain\Service\Request\RequestExtractor;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Messenger\Exception\HandlerFailedException;
use Symfony\Component\Messenger\HandleTrait;
use Symfony\Component\Messenger\MessageBusInterface;

final class CreateUserController
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
            $email = RequestExtractor::getStringRequestValue(request: $request, fieldName: 'email');

            $this->handle(message: new CreateUserCommand(
                username: $email,
                email: $email,
                name: RequestExtractor::getStringRequestValue(request: $request, fieldName: 'name'),
                lastname: RequestExtractor::getStringRequestValue(request: $request, fieldName: 'lastname'),
                plainPassword: RequestExtractor::getStringRequestValue(request: $request, fieldName: 'password'),
                role: RequestExtractor::getStringRequestValue(request: $request, fieldName: 'role'),
                createdByUserId: RequestExtractor::getUserSessionId(request: $request),
                createdByUserRole: RequestExtractor::getUserRole(request: $request),
            ));

            return new JsonResponse(data: null, status: Response::HTTP_CREATED);
        } catch (HandlerFailedException $e) {
            return JsonResponseBuilder::buildResponseFromBaseHandlerFailedException(
                exception: $e,
                exceptionStatusMap: [
                    CreateUserException::class => Response::HTTP_BAD_REQUEST,
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
