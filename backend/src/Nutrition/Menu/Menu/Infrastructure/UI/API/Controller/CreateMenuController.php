<?php

namespace Nutrition\Menu\Menu\Infrastructure\UI\API\Controller;

use Nutrition\Menu\Menu\Application\Command\CreateMenuCommand;
use Nutrition\Menu\Menu\Application\Command\MenuItemData;
use Nutrition\Menu\Menu\Domain\Exception\CreateMenuException;
use Shared\Tool\Tool\Domain\Exception\ArgumentRequestException;
use Shared\Tool\Tool\Infrastructure\Domain\Service\JsonResponse\JsonResponseBuilder;
use Shared\Tool\Tool\Infrastructure\Domain\Service\Request\RequestExtractor;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Messenger\Exception\HandlerFailedException;
use Symfony\Component\Messenger\HandleTrait;
use Symfony\Component\Messenger\MessageBusInterface;

final class CreateMenuController
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
            $this->handle(message: new CreateMenuCommand(
                name: RequestExtractor::getStringRequestValue(request: $request, fieldName: 'name'),
                emoji: RequestExtractor::getStringRequestValue(request: $request, fieldName: 'emoji'),
                note: RequestExtractor::getStringRequestValue(request: $request, fieldName: 'note'),
                type: RequestExtractor::getStringRequestValue(request: $request, fieldName: 'type'),
                items: MenuItemData::listFromArray(
                    rawItems: RequestExtractor::getArrayRequestValue(request: $request, fieldName: 'items'),
                ),
                createdByUserId: RequestExtractor::getUserSessionId(request: $request),
            ));

            return new JsonResponse(data: null, status: Response::HTTP_CREATED);
        } catch (HandlerFailedException $e) {
            return JsonResponseBuilder::buildResponseFromBaseHandlerFailedException(
                exception: $e,
                exceptionStatusMap: [
                    CreateMenuException::class => Response::HTTP_BAD_REQUEST,
                ]
            );
        } catch (ArgumentRequestException $e) {
            return JsonResponseBuilder::buildResponseFromBaseException(
                exception: $e,
                status: Response::HTTP_BAD_REQUEST
            );
        }
    }
}
