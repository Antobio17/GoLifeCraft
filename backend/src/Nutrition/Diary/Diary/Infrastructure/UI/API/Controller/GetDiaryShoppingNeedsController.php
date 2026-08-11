<?php

namespace Nutrition\Diary\Diary\Infrastructure\UI\API\Controller;

use Nutrition\Diary\Diary\Application\Query\GetDiaryShoppingNeedsQuery;
use Shared\Tool\Tool\Infrastructure\Domain\Service\JsonResponse\JsonResponseBuilder;
use Shared\Tool\Tool\Infrastructure\Domain\Service\Request\RequestExtractor;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Messenger\Exception\HandlerFailedException;
use Symfony\Component\Messenger\HandleTrait;
use Symfony\Component\Messenger\MessageBusInterface;

final class GetDiaryShoppingNeedsController
{
    use HandleTrait;

    private const string DATE_PATTERN = '/^\d{4}-\d{2}-\d{2}$/';

    public function __construct(
        MessageBusInterface $messageBus,
    ) {
        $this->messageBus = $messageBus;
    }

    public function __invoke(Request $request): JsonResponse
    {
        $today = (new \DateTime(datetime: 'now', timezone: new \DateTimeZone(timezone: 'Europe/Madrid')))
            ->format(format: 'Y-m-d');

        $fromDate = $this->resolveDate(request: $request, param: 'from', default: $today);
        $toDate = $this->resolveDate(request: $request, param: 'to', default: $fromDate);

        try {
            return JsonResponseBuilder::buildSingleResponse(
                querySingleResult: $this->handle(message: new GetDiaryShoppingNeedsQuery(
                    fromDate: min($fromDate, $toDate),
                    toDate: max($fromDate, $toDate),
                )),
            );
        } catch (HandlerFailedException $e) {
            return JsonResponseBuilder::buildResponseFromBaseHandlerFailedException(
                exception: $e,
                exceptionStatusMap: []
            );
        }
    }

    private function resolveDate(Request $request, string $param, string $default): string
    {
        $date = (string) RequestExtractor::getStringQueryParam(request: $request, param: $param, default: $default);

        return 1 === preg_match(pattern: self::DATE_PATTERN, subject: $date) ? $date : $default;
    }
}
