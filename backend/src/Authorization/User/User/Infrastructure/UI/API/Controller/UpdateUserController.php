<?php

namespace Authorization\User\User\Infrastructure\UI\API\Controller;

use Authorization\User\User\Application\Command\UpdateUserCommand;
use Authorization\User\User\Domain\Exception\UpdateUserException;
use Psr\Log\LoggerInterface;
use Shared\Tool\Tool\Domain\Exception\ArgumentRequestException;
use Shared\Tool\Tool\Infrastructure\Domain\Service\JsonResponse\JsonResponseBuilder;
use Shared\Tool\Tool\Infrastructure\Domain\Service\Logger\ExceptionLogger;
use Shared\Tool\Tool\Infrastructure\Domain\Service\Request\RequestExtractor;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Messenger\Exception\HandlerFailedException;
use Symfony\Component\Messenger\HandleTrait;
use Symfony\Component\Messenger\MessageBusInterface;

final class UpdateUserController
{
    use HandleTrait;

    public function __construct(
        MessageBusInterface $messageBus,
        private LoggerInterface $logger,
    ) {
        $this->messageBus = $messageBus;
    }

    public function __invoke(Request $request): JsonResponse
    {
        try {
            $this->handle(message: new UpdateUserCommand(
                userId: $request->attributes->get(key: 'userId'),
                username: RequestExtractor::getStringRequestValue(request: $request, fieldName: 'username'),
                email: RequestExtractor::getStringRequestValue(request: $request, fieldName: 'email'),
                name: RequestExtractor::getStringRequestValue(request: $request, fieldName: 'name'),
                lastname: RequestExtractor::getStringRequestValue(request: $request, fieldName: 'lastname'),
                isActive: (bool) RequestExtractor::getStringRequestValue(request: $request, fieldName: 'isActive'),
                role: RequestExtractor::getStringRequestValue(request: $request, fieldName: 'role'),
                updatedByUserId: RequestExtractor::getUserSessionId(request: $request),
                canCreateFolder: RequestExtractor::getBooleanRequestValue(request: $request, fieldName: 'canCreateFolder', required: false, nullable: false) ?? false,
                canDeleteFolder: RequestExtractor::getBooleanRequestValue(request: $request, fieldName: 'canDeleteFolder', required: false, nullable: false) ?? false,
                canUploadFile: RequestExtractor::getBooleanRequestValue(request: $request, fieldName: 'canUploadFile', required: false, nullable: false) ?? false,
                canDeleteFile: RequestExtractor::getBooleanRequestValue(request: $request, fieldName: 'canDeleteFile', required: false, nullable: false) ?? false,
                canSignFile: RequestExtractor::getBooleanRequestValue(request: $request, fieldName: 'canSignFile', required: false, nullable: false) ?? false,
                canRollbackSign: RequestExtractor::getBooleanRequestValue(request: $request, fieldName: 'canRollbackSign', required: false, nullable: false) ?? false,
                canAccessUsers: RequestExtractor::getBooleanRequestValue(request: $request, fieldName: 'canAccessUsers', required: false, nullable: false) ?? false,
            ));

            return new JsonResponse(data: null, status: Response::HTTP_NO_CONTENT);
        } catch (HandlerFailedException $e) {
            ExceptionLogger::log(logger: $this->logger, exception: $e, controller: self::class);

            return JsonResponseBuilder::buildResponseFromBaseHandlerFailedException(
                exception: $e,
                exceptionStatusMap: [
                    UpdateUserException::class => Response::HTTP_BAD_REQUEST,
                ]
            );
        } catch (ArgumentRequestException $e) {
            ExceptionLogger::log(logger: $this->logger, exception: $e, controller: self::class, level: 'info');

            return JsonResponseBuilder::buildResponseFromBaseException(
                exception: $e,
                status: Response::HTTP_BAD_REQUEST
            );
        }
    }
}
