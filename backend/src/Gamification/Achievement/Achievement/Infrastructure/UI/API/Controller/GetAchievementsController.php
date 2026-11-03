<?php

namespace Gamification\Achievement\Achievement\Infrastructure\UI\API\Controller;

use Gamification\Achievement\Achievement\Application\Query\GetAchievementsQuery;
use Gamification\Achievement\Achievement\Domain\Model\AchievementMetric;
use Shared\Tool\Tool\Infrastructure\Domain\Service\JsonResponse\JsonResponseBuilder;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Messenger\Exception\HandlerFailedException;
use Symfony\Component\Messenger\HandleTrait;
use Symfony\Component\Messenger\MessageBusInterface;

final class GetAchievementsController
{
    use HandleTrait;

    public function __construct(
        MessageBusInterface $messageBus,
    ) {
        $this->messageBus = $messageBus;
    }

    public function __invoke(): JsonResponse
    {
        try {
            return JsonResponseBuilder::buildCollectionResponse(
                queryCollectionResult: $this->handle(message: new GetAchievementsQuery(
                    today: (new \DateTimeImmutable(datetime: 'now', timezone: new \DateTimeZone(timezone: AchievementMetric::TIME_ZONE)))
                        ->format(format: 'Y-m-d'),
                )),
            );
        } catch (HandlerFailedException $e) {
            return JsonResponseBuilder::buildResponseFromBaseHandlerFailedException(
                exception: $e,
                exceptionStatusMap: []
            );
        }
    }
}
