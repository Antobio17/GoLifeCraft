<?php

namespace Authorization\User\User\Infrastructure\UI\API\Controller;

use Authorization\User\User\Application\Command\DeleteUserCommand;
use Authorization\User\User\Domain\Exception\DeleteUserException;
use Shared\Tool\Tool\Infrastructure\Domain\Service\JsonResponse\JsonResponseBuilder;
use Shared\Tool\Tool\Infrastructure\Domain\Service\Request\RequestExtractor;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Messenger\Exception\HandlerFailedException;
use Symfony\Component\Messenger\HandleTrait;
use Symfony\Component\Messenger\MessageBusInterface;

final class DeleteUserController
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
            $this->handle(message: new DeleteUserCommand(
                userId: $request->attributes->get(key: 'userId'),
                deletedByUserId: RequestExtractor::getUserSessionId(request: $request),
                deletedByUserRole: RequestExtractor::getUserRole(request: $request),
            ));

            return new JsonResponse(data: null, status: Response::HTTP_NO_CONTENT);
        } catch (HandlerFailedException $e) {
            return JsonResponseBuilder::buildResponseFromBaseHandlerFailedException(
                exception: $e,
                exceptionStatusMap: [
                    DeleteUserException::class => Response::HTTP_BAD_REQUEST,
                ]
            );
        }
    }
}
