<?php

namespace Agenda\Agenda\Agenda\Infrastructure\UI\API\Controller;

use Agenda\Agenda\Agenda\Application\Query\GetAgendaUpcomingQuery;
use Shared\Tool\Tool\Infrastructure\Domain\Service\JsonResponse\JsonResponseBuilder;
use Shared\Tool\Tool\Infrastructure\Domain\Service\Request\RequestExtractor;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Messenger\Exception\HandlerFailedException;
use Symfony\Component\Messenger\HandleTrait;
use Symfony\Component\Messenger\MessageBusInterface;

final class GetAgendaUpcomingController
{
    use HandleTrait;

    private const DEFAULT_DAYS = 7;
    private const MAX_DAYS = 31;

    public function __construct(
        MessageBusInterface $messageBus,
    ) {
        $this->messageBus = $messageBus;
    }

    public function __invoke(Request $request): JsonResponse
    {
        try {
            return JsonResponseBuilder::buildSingleResponse(
                querySingleResult: $this->handle(message: new GetAgendaUpcomingQuery(
                    fromDate: $this->resolveFromDate(request: $request),
                    days: $this->resolveDays(request: $request),
                )),
            );
        } catch (HandlerFailedException $e) {
            return JsonResponseBuilder::buildResponseFromBaseHandlerFailedException(
                exception: $e,
                exceptionStatusMap: []
            );
        }
    }

    private function resolveFromDate(Request $request): string
    {
        $today = (new \DateTime(datetime: 'now', timezone: new \DateTimeZone(timezone: 'Europe/Madrid')))
            ->format(format: 'Y-m-d');
        $date = RequestExtractor::getStringQueryParam(request: $request, param: 'from', default: $today);

        return 1 === preg_match(pattern: '/^\d{4}-\d{2}-\d{2}$/', subject: (string) $date) ? $date : $today;
    }

    private function resolveDays(Request $request): int
    {
        $days = RequestExtractor::getIntQueryParam(
            request: $request,
            param: 'days',
            default: self::DEFAULT_DAYS,
        );

        return min(max($days, 1), self::MAX_DAYS);
    }
}
