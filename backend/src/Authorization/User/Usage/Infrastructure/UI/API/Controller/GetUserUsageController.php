<?php

namespace Authorization\User\Usage\Infrastructure\UI\API\Controller;

use Authorization\User\Usage\Application\Query\GetUserUsage\GetUserUsageQuery;
use Authorization\User\Usage\Domain\Exception\GetUserUsageException;
use Shared\Tool\Tool\Infrastructure\Domain\Service\JsonResponse\JsonResponseBuilder;
use Shared\Tool\Tool\Infrastructure\Domain\Service\Request\RequestExtractor;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Messenger\Exception\HandlerFailedException;
use Symfony\Component\Messenger\HandleTrait;
use Symfony\Component\Messenger\MessageBusInterface;

final class GetUserUsageController
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
            return JsonResponseBuilder::buildSingleResponse(
                querySingleResult: $this->handle(message: new GetUserUsageQuery(
                    userId: $request->attributes->get(key: 'id'),
                    userRole: RequestExtractor::getUserRole(request: $request),
                )),
            );
        } catch (HandlerFailedException $e) {
            return JsonResponseBuilder::buildResponseFromBaseHandlerFailedException(
                exception: $e,
                exceptionStatusMap: [
                    GetUserUsageException::class => Response::HTTP_FORBIDDEN,
                ]
            );
        }
    }
}
