<?php

namespace Nutrition\Kitchen\Production\Infrastructure\UI\API\Controller;

use Nutrition\Kitchen\Production\Application\Command\StartProductionCommand;
use Nutrition\Kitchen\Production\Domain\Exception\StartProductionException;
use Shared\Tool\Tool\Domain\Exception\ArgumentRequestException;
use Shared\Tool\Tool\Infrastructure\Domain\Service\JsonResponse\JsonResponseBuilder;
use Shared\Tool\Tool\Infrastructure\Domain\Service\Request\RequestExtractor;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Messenger\Exception\HandlerFailedException;
use Symfony\Component\Messenger\HandleTrait;
use Symfony\Component\Messenger\MessageBusInterface;

final class StartProductionController
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
            $this->handle(message: new StartProductionCommand(
                fromDate: RequestExtractor::getStringRequestValue(request: $request, fieldName: 'fromDate'),
                toDate: RequestExtractor::getStringRequestValue(request: $request, fieldName: 'toDate'),
                items: $this->items(request: $request),
                startedByUserId: RequestExtractor::getUserSessionId(request: $request),
            ));

            return new JsonResponse(data: null, status: Response::HTTP_CREATED);
        } catch (HandlerFailedException $e) {
            return JsonResponseBuilder::buildResponseFromBaseHandlerFailedException(
                exception: $e,
                exceptionStatusMap: [
                    StartProductionException::class => Response::HTTP_BAD_REQUEST,
                ]
            );
        } catch (ArgumentRequestException $e) {
            return JsonResponseBuilder::buildResponseFromBaseException(
                exception: $e,
                status: Response::HTTP_BAD_REQUEST
            );
        }
    }

    /**
     * @return array<int, array{recipeId: string, servings: float}>
     */
    private function items(Request $request): array
    {
        $items = [];

        foreach (RequestExtractor::getArrayRequestValue(request: $request, fieldName: 'items') as $item) {
            if (!is_array(value: $item)) {
                throw ArgumentRequestException::argumentMustBeArray(argumentName: 'items');
            }

            $items[] = [
                'recipeId' => (string) ($item['recipeId'] ?? ''),
                'servings' => (float) ($item['servings'] ?? 0),
            ];
        }

        return $items;
    }
}
