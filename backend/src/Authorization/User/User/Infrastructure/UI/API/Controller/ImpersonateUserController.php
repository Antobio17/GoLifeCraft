<?php

namespace Authorization\User\User\Infrastructure\UI\API\Controller;

use Authorization\User\User\Application\Command\ImpersonateUser\ImpersonateUserCommand;
use Authorization\User\User\Domain\Exception\ImpersonateUserException;
use Authorization\User\User\Domain\Service\ImpersonationTokenGenerator;
use Shared\Tool\Tool\Infrastructure\Domain\Service\JsonResponse\JsonResponseBuilder;
use Shared\Tool\Tool\Infrastructure\Domain\Service\Request\RequestExtractor;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Messenger\Exception\HandlerFailedException;
use Symfony\Component\Messenger\HandleTrait;
use Symfony\Component\Messenger\MessageBusInterface;

final class ImpersonateUserController
{
    use HandleTrait;

    public function __construct(
        MessageBusInterface $messageBus,
        private readonly ImpersonationTokenGenerator $impersonationTokenGenerator,
    ) {
        $this->messageBus = $messageBus;
    }

    public function __invoke(Request $request): JsonResponse
    {
        $impersonatorUserId = RequestExtractor::getImpersonatorUserId(request: $request)
            ?? RequestExtractor::getUserSessionId(request: $request);
        $targetUserId = $request->attributes->get(key: 'id');

        try {
            $this->handle(message: new ImpersonateUserCommand(
                userId: $targetUserId,
                userSessionId: $impersonatorUserId,
                userRole: RequestExtractor::getUserRole(request: $request),
            ));
        } catch (HandlerFailedException $e) {
            return JsonResponseBuilder::buildResponseFromBaseHandlerFailedException(
                exception: $e,
                exceptionStatusMap: [
                    ImpersonateUserException::class => Response::HTTP_FORBIDDEN,
                ]
            );
        }

        $impersonationToken = $this->impersonationTokenGenerator->generate(
            impersonatorUserId: $impersonatorUserId,
            impersonatedUserId: $targetUserId,
        );

        return new JsonResponse(
            data: [
                'data' => [
                    'token' => $impersonationToken->token,
                    'expires_at' => $impersonationToken->expiresAt,
                    'token_type' => 'Bearer',
                    'user' => [
                        'id' => $impersonationToken->impersonatedUser->id,
                        'email' => $impersonationToken->impersonatedUser->email,
                        'name' => $impersonationToken->impersonatedUser->name,
                        'lastname' => $impersonationToken->impersonatedUser->lastname,
                        'roles' => $impersonationToken->impersonator->getRoles(),
                        'role' => $impersonationToken->impersonator->role,
                        'tenantId' => $impersonationToken->impersonatedUser->tenantId,
                    ],
                ],
            ],
            status: Response::HTTP_OK
        );
    }
}
