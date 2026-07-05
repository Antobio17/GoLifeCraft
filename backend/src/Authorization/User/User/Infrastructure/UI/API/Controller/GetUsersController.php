<?php

namespace Authorization\User\User\Infrastructure\UI\API\Controller;

use Authorization\User\User\Application\Query\GetUsersQuery;
use Authorization\User\User\Domain\Exception\CreateUserException;
use Authorization\User\User\Domain\Exception\GetUserException;
use Shared\Tool\Tool\Infrastructure\Domain\Service\JsonResponse\JsonResponseBuilder;
use Shared\Tool\Tool\Infrastructure\Domain\Service\Request\RequestExtractor;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Messenger\Exception\HandlerFailedException;
use Symfony\Component\Messenger\HandleTrait;
use Symfony\Component\Messenger\MessageBusInterface;

final class GetUsersController
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
            return JsonResponseBuilder::buildCollectionResponse(
                queryCollectionResult: $this->handle(message: new GetUsersQuery(
                    tenantId: RequestExtractor::getTenantSessionId(request: $request),
                    userSessionId: RequestExtractor::getUserSessionId(request: $request),
                    userRole: RequestExtractor::getUserRole(request: $request),
                    pageSize: RequestExtractor::getPageSize(request: $request),
                    pageNumber: RequestExtractor::getPageNumber(request: $request),
                    filterUsername: RequestExtractor::getFilterParam(request: $request, filterName: 'username'),
                    filterEmail: RequestExtractor::getFilterParam(request: $request, filterName: 'email'),
                    filterRole: RequestExtractor::getFilterParam(request: $request, filterName: 'role'),
                    orderBy: RequestExtractor::getOrderByParam(request: $request),
                )),
            );
        } catch (HandlerFailedException $e) {
            return JsonResponseBuilder::buildResponseFromBaseHandlerFailedException(
                exception: $e,
                exceptionStatusMap: [
                    CreateUserException::class => Response::HTTP_BAD_REQUEST,
                    GetUserException::class => Response::HTTP_FORBIDDEN,
                ]
            );
        }
    }
}
