<?php

namespace Gym\Training\Session\Infrastructure\UI\API\Controller;

use Gym\Training\Session\Application\Command\UpdateSessionDetailsCommand;
use Gym\Training\Session\Domain\Exception\UpdateSessionException;
use Gym\Training\Session\Domain\Model\Session;
use Shared\Tool\Tool\Domain\Exception\ArgumentRequestException;
use Shared\Tool\Tool\Infrastructure\Domain\Service\JsonResponse\JsonResponseBuilder;
use Shared\Tool\Tool\Infrastructure\Domain\Service\Request\RequestExtractor;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Messenger\Exception\HandlerFailedException;
use Symfony\Component\Messenger\HandleTrait;
use Symfony\Component\Messenger\MessageBusInterface;

final class UpdateSessionDetailsController
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
            $this->handle(message: new UpdateSessionDetailsCommand(
                sessionId: $request->attributes->get(key: 'sessionId'),
                name: RequestExtractor::getStringRequestValue(request: $request, fieldName: 'name'),
                estimatedDurationMinutes: RequestExtractor::getIntRequestValue(request: $request, fieldName: 'estimatedDurationMinutes'),
                restSeconds: RequestExtractor::getIntRequestValue(request: $request, fieldName: 'restSeconds', required: false) ?? Session::DEFAULT_REST_SECONDS,
                updatedByUserId: RequestExtractor::getUserSessionId(request: $request),
            ));

            return new JsonResponse(data: null, status: Response::HTTP_NO_CONTENT);
        } catch (HandlerFailedException $e) {
            return JsonResponseBuilder::buildResponseFromBaseHandlerFailedException(
                exception: $e,
                exceptionStatusMap: [
                    UpdateSessionException::class => Response::HTTP_BAD_REQUEST,
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
