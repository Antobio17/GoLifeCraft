<?php

namespace Nutrition\Kitchen\Production\Infrastructure\UI\API\Controller;

use Nutrition\Kitchen\Production\Application\Command\CheckProductionItemCommand;
use Nutrition\Kitchen\Production\Domain\Exception\CookProductionItemException;
use Shared\Tool\Tool\Domain\Exception\ArgumentRequestException;
use Shared\Tool\Tool\Infrastructure\Domain\Service\JsonResponse\JsonResponseBuilder;
use Shared\Tool\Tool\Infrastructure\Domain\Service\Request\RequestExtractor;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Messenger\Exception\HandlerFailedException;
use Symfony\Component\Messenger\HandleTrait;
use Symfony\Component\Messenger\MessageBusInterface;

final class CheckProductionItemController
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
            $this->handle(message: new CheckProductionItemCommand(
                productionId: $request->attributes->get(key: 'productionId'),
                itemId: $request->attributes->get(key: 'itemId'),
                articleIds: $this->articleIds(request: $request),
                stepPositions: $this->stepPositions(request: $request),
                checkedByUserId: RequestExtractor::getUserSessionId(request: $request),
            ));

            return new JsonResponse(data: null, status: Response::HTTP_OK);
        } catch (HandlerFailedException $e) {
            return JsonResponseBuilder::buildResponseFromBaseHandlerFailedException(
                exception: $e,
                exceptionStatusMap: [
                    CookProductionItemException::class => Response::HTTP_BAD_REQUEST,
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
     * @return int[]
     */
    private function stepPositions(Request $request): array
    {
        return array_values(array: array_map(
            callback: static fn (mixed $position): int => (int) $position,
            array: RequestExtractor::getArrayRequestValue(request: $request, fieldName: 'stepPositions', required: false) ?? [],
        ));
    }

    /**
     * @return string[]
     */
    private function articleIds(Request $request): array
    {
        return array_values(array: array_map(
            callback: static fn (mixed $articleId): string => (string) $articleId,
            array: RequestExtractor::getArrayRequestValue(request: $request, fieldName: 'articleIds'),
        ));
    }
}
