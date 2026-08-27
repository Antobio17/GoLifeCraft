<?php

namespace Nutrition\Kitchen\Production\Infrastructure\UI\API\Controller;

use Nutrition\Kitchen\Production\Application\Query\GetKitchenDayQuery;
use Shared\Tool\Tool\Infrastructure\Domain\Service\JsonResponse\JsonResponseBuilder;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Messenger\Exception\HandlerFailedException;
use Symfony\Component\Messenger\HandleTrait;
use Symfony\Component\Messenger\MessageBusInterface;

final class GetKitchenDayController
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
                querySingleResult: $this->handle(message: new GetKitchenDayQuery(
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
        $date = (string) $request->query->get(key: 'date', default: '');

        return 1 === preg_match(pattern: '/^\d{4}-\d{2}-\d{2}$/', subject: $date)
            ? $date
            : (new \DateTimeImmutable())->format(format: 'Y-m-d');
    }
}
