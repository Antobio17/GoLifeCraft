<?php

namespace Nutrition\Catalog\Supermarket\Infrastructure\UI\API\Controller;

use Nutrition\Catalog\Supermarket\Application\Command\SupermarketAisleData;
use Nutrition\Catalog\Supermarket\Application\Command\UpdateSupermarketAislesCommand;
use Nutrition\Catalog\Supermarket\Domain\Exception\UpdateSupermarketAislesException;
use Shared\Tool\Tool\Domain\Exception\ArgumentRequestException;
use Shared\Tool\Tool\Infrastructure\Domain\Service\JsonResponse\JsonResponseBuilder;
use Shared\Tool\Tool\Infrastructure\Domain\Service\Request\RequestExtractor;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Messenger\Exception\HandlerFailedException;
use Symfony\Component\Messenger\HandleTrait;
use Symfony\Component\Messenger\MessageBusInterface;

final class UpdateSupermarketAislesController
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
            $this->handle(message: new UpdateSupermarketAislesCommand(
                supermarketId: $request->attributes->get(key: 'supermarketId'),
                aisles: SupermarketAisleData::listFromArray(
                    rawAisles: RequestExtractor::getArrayRequestValue(request: $request, fieldName: 'aisles', required: false) ?? [],
                ),
                updatedByUserId: RequestExtractor::getUserSessionId(request: $request),
            ));

            return new JsonResponse(data: null, status: Response::HTTP_NO_CONTENT);
        } catch (HandlerFailedException $e) {
            return JsonResponseBuilder::buildResponseFromBaseHandlerFailedException(
                exception: $e,
                exceptionStatusMap: [
                    UpdateSupermarketAislesException::class => Response::HTTP_BAD_REQUEST,
                ]
            );
        } catch (ArgumentRequestException|UpdateSupermarketAislesException $e) {
            return JsonResponseBuilder::buildResponseFromBaseException(
                exception: $e,
                status: Response::HTTP_BAD_REQUEST
            );
        }
    }
}
