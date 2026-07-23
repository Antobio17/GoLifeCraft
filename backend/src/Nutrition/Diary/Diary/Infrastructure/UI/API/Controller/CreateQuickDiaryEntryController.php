<?php

namespace Nutrition\Diary\Diary\Infrastructure\UI\API\Controller;

use Nutrition\Diary\Diary\Application\Command\CreateQuickDiaryEntryCommand;
use Nutrition\Diary\Diary\Domain\Exception\CreateDiaryEntryException;
use Shared\Tool\Tool\Domain\Exception\ArgumentRequestException;
use Shared\Tool\Tool\Infrastructure\Domain\Service\JsonResponse\JsonResponseBuilder;
use Shared\Tool\Tool\Infrastructure\Domain\Service\Request\RequestExtractor;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Messenger\Exception\HandlerFailedException;
use Symfony\Component\Messenger\HandleTrait;
use Symfony\Component\Messenger\MessageBusInterface;

final class CreateQuickDiaryEntryController
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
            $this->handle(message: new CreateQuickDiaryEntryCommand(
                entryDate: RequestExtractor::getStringRequestValue(request: $request, fieldName: 'entryDate'),
                meal: RequestExtractor::getStringRequestValue(request: $request, fieldName: 'meal'),
                quantity: RequestExtractor::getFloatRequestValue(request: $request, fieldName: 'quantity', required: false) ?? 1.0,
                name: RequestExtractor::getStringRequestValue(request: $request, fieldName: 'name'),
                emoji: RequestExtractor::getStringRequestValue(request: $request, fieldName: 'emoji'),
                calories: RequestExtractor::getFloatRequestValue(request: $request, fieldName: 'calories'),
                protein: RequestExtractor::getFloatRequestValue(request: $request, fieldName: 'protein', required: false) ?? 0.0,
                fat: RequestExtractor::getFloatRequestValue(request: $request, fieldName: 'fat', required: false) ?? 0.0,
                carbs: RequestExtractor::getFloatRequestValue(request: $request, fieldName: 'carbs', required: false) ?? 0.0,
                createdByUserId: RequestExtractor::getUserSessionId(request: $request),
            ));

            return new JsonResponse(data: null, status: Response::HTTP_CREATED);
        } catch (HandlerFailedException $e) {
            return JsonResponseBuilder::buildResponseFromBaseHandlerFailedException(
                exception: $e,
                exceptionStatusMap: [
                    CreateDiaryEntryException::class => Response::HTTP_BAD_REQUEST,
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
