<?php

namespace Nutrition\Diary\Diary\Infrastructure\UI\API\Controller;

use Nutrition\Diary\Diary\Application\Command\DeleteDiaryEntryCommand;
use Nutrition\Diary\Diary\Domain\Exception\DeleteDiaryEntryException;
use Shared\Tool\Tool\Infrastructure\Domain\Service\JsonResponse\JsonResponseBuilder;
use Shared\Tool\Tool\Infrastructure\Domain\Service\Request\RequestExtractor;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Messenger\Exception\HandlerFailedException;
use Symfony\Component\Messenger\HandleTrait;
use Symfony\Component\Messenger\MessageBusInterface;

final class DeleteDiaryEntryController
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
            $this->handle(message: new DeleteDiaryEntryCommand(
                diaryEntryId: $request->attributes->get(key: 'diaryEntryId'),
                deletedByUserId: RequestExtractor::getUserSessionId(request: $request),
            ));

            return new JsonResponse(data: null, status: Response::HTTP_NO_CONTENT);
        } catch (HandlerFailedException $e) {
            return JsonResponseBuilder::buildResponseFromBaseHandlerFailedException(
                exception: $e,
                exceptionStatusMap: [
                    DeleteDiaryEntryException::class => Response::HTTP_BAD_REQUEST,
                ]
            );
        }
    }
}
