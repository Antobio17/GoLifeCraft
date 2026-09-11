<?php

namespace Gym\Analytics\Stats\Infrastructure\UI\API\Controller;

use Gym\Analytics\Stats\Application\Query\GetExerciseTopSetsQuery;
use Shared\Tool\Tool\Infrastructure\Domain\Service\JsonResponse\JsonResponseBuilder;
use Shared\Tool\Tool\Infrastructure\Domain\Service\Request\RequestExtractor;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Messenger\Exception\HandlerFailedException;
use Symfony\Component\Messenger\HandleTrait;
use Symfony\Component\Messenger\MessageBusInterface;

final class GetExerciseTopSetsController
{
    use HandleTrait;

    private const string EXERCISE_IDS_SEPARATOR = ',';

    public function __construct(
        MessageBusInterface $messageBus,
    ) {
        $this->messageBus = $messageBus;
    }

    public function __invoke(Request $request): JsonResponse
    {
        try {
            return JsonResponseBuilder::buildSingleResponse(
                querySingleResult: $this->handle(message: new GetExerciseTopSetsQuery(
                    exerciseIds: $this->extractExerciseIds(request: $request),
                )),
            );
        } catch (HandlerFailedException $e) {
            return JsonResponseBuilder::buildResponseFromBaseHandlerFailedException(
                exception: $e,
                exceptionStatusMap: []
            );
        }
    }

    /**
     * @return array<int, string>
     */
    private function extractExerciseIds(Request $request): array
    {
        $filter = RequestExtractor::getFilterParam(request: $request, filterName: 'exerciseIds');

        if (null === $filter || '' === $filter) {
            return [];
        }

        return array_values(array: array_unique(array: array_filter(
            array: array_map(callback: 'trim', array: explode(separator: self::EXERCISE_IDS_SEPARATOR, string: $filter)),
        )));
    }
}
