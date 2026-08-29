<?php

namespace Nutrition\Kitchen\Production\Infrastructure\UI\API\Controller;

use Nutrition\Kitchen\Production\Application\Query\GetProductionProposalQuery;
use Nutrition\Kitchen\Production\Domain\Exception\GetProductionException;
use Shared\Tool\Tool\Infrastructure\Domain\Service\JsonResponse\JsonResponseBuilder;
use Shared\Tool\Tool\Infrastructure\Domain\Service\Request\RequestExtractor;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Messenger\Exception\HandlerFailedException;
use Symfony\Component\Messenger\HandleTrait;
use Symfony\Component\Messenger\MessageBusInterface;

final class GetProductionProposalController
{
    use HandleTrait;

    private const string TIMEZONE = 'Europe/Madrid';

    public function __construct(
        MessageBusInterface $messageBus,
    ) {
        $this->messageBus = $messageBus;
    }

    public function __invoke(Request $request): JsonResponse
    {
        $today = (new \DateTime(datetime: 'now', timezone: new \DateTimeZone(timezone: self::TIMEZONE)))
            ->format(format: 'Y-m-d');

        try {
            return JsonResponseBuilder::buildSingleResponse(
                querySingleResult: $this->handle(message: new GetProductionProposalQuery(
                    fromDate: RequestExtractor::getStringQueryParam(request: $request, param: 'from') ?: $today,
                    toDate: RequestExtractor::getStringQueryParam(request: $request, param: 'to') ?: $today,
                )),
            );
        } catch (HandlerFailedException $e) {
            return JsonResponseBuilder::buildResponseFromBaseHandlerFailedException(
                exception: $e,
                exceptionStatusMap: [
                    GetProductionException::class => Response::HTTP_BAD_REQUEST,
                ]
            );
        }
    }
}
