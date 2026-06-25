<?php

namespace Shared\Shared\DomainEventLog\Infrastructure\UI\API\Controller;

use Psr\Log\LoggerInterface;
use Shared\Shared\DomainEventLog\Application\Query\GetDomainEventLogQuery;
use Shared\Shared\DomainEventLog\Domain\Exception\GetDomainEventLogException;
use Shared\Tool\Tool\Infrastructure\Domain\Service\JsonResponse\JsonResponseBuilder;
use Shared\Tool\Tool\Infrastructure\Domain\Service\Logger\ExceptionLogger;
use Shared\Tool\Tool\Infrastructure\Domain\Service\Request\RequestExtractor;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Messenger\Exception\HandlerFailedException;
use Symfony\Component\Messenger\HandleTrait;
use Symfony\Component\Messenger\MessageBusInterface;

final class GetDomainEventLogController
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
            return JsonResponseBuilder::buildSingleResponse(
                querySingleResult: $this->handle(message: new GetDomainEventLogQuery(
                    domainEventLogId: $request->attributes->get(key: 'domainEventLogId'),
                    userRole: RequestExtractor::getUserRole(request: $request),
                )),
            );
        } catch (HandlerFailedException $e) {
            ExceptionLogger::log(logger: $this->logger, exception: $e, controller: self::class);

            return JsonResponseBuilder::buildResponseFromBaseHandlerFailedException(
                exception: $e,
                exceptionStatusMap: [
                    GetDomainEventLogException::class => Response::HTTP_NOT_FOUND,
                ]
            );
        }
    }
}
