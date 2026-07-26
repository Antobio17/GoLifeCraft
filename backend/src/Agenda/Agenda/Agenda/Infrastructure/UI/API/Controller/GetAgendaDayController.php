<?php

namespace Agenda\Agenda\Agenda\Infrastructure\UI\API\Controller;

use Agenda\Agenda\Agenda\Application\Query\GetAgendaDayQuery;
use Shared\Tool\Tool\Infrastructure\Domain\Service\JsonResponse\JsonResponseBuilder;
use Shared\Tool\Tool\Infrastructure\Domain\Service\Request\RequestExtractor;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Messenger\Exception\HandlerFailedException;
use Symfony\Component\Messenger\HandleTrait;
use Symfony\Component\Messenger\MessageBusInterface;

final class GetAgendaDayController
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
                querySingleResult: $this->handle(message: new GetAgendaDayQuery(
                    date: $this->resolveDate(request: $request),
                )),
            );
        } catch (HandlerFailedException $e) {
            return JsonResponseBuilder::buildResponseFromBaseHandlerFailedException(
                exception: $e,
                exceptionStatusMap: []
            );
        }
    }

    private function resolveDate(Request $request): string
    {
        $today = (new \DateTime(datetime: 'now', timezone: new \DateTimeZone(timezone: 'Europe/Madrid')))
            ->format(format: 'Y-m-d');
        $date = RequestExtractor::getStringQueryParam(request: $request, param: 'date', default: $today);

        return 1 === preg_match(pattern: '/^\d{4}-\d{2}-\d{2}$/', subject: (string) $date) ? $date : $today;
    }
}
