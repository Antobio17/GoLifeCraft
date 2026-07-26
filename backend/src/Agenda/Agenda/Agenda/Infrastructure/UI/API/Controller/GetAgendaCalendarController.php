<?php

namespace Agenda\Agenda\Agenda\Infrastructure\UI\API\Controller;

use Agenda\Agenda\Agenda\Application\Query\GetAgendaCalendarQuery;
use Shared\Tool\Tool\Infrastructure\Domain\Service\JsonResponse\JsonResponseBuilder;
use Shared\Tool\Tool\Infrastructure\Domain\Service\Request\RequestExtractor;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Messenger\Exception\HandlerFailedException;
use Symfony\Component\Messenger\HandleTrait;
use Symfony\Component\Messenger\MessageBusInterface;

final class GetAgendaCalendarController
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
                querySingleResult: $this->handle(message: new GetAgendaCalendarQuery(
                    month: $this->resolveMonth(request: $request),
                )),
            );
        } catch (HandlerFailedException $e) {
            return JsonResponseBuilder::buildResponseFromBaseHandlerFailedException(
                exception: $e,
                exceptionStatusMap: []
            );
        }
    }

    private function resolveMonth(Request $request): string
    {
        $currentMonth = (new \DateTime(datetime: 'now', timezone: new \DateTimeZone(timezone: 'Europe/Madrid')))
            ->format(format: 'Y-m');
        $month = RequestExtractor::getStringQueryParam(request: $request, param: 'month', default: $currentMonth);

        return 1 === preg_match(pattern: '/^\d{4}-\d{2}$/', subject: (string) $month) ? $month : $currentMonth;
    }
}
