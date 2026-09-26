<?php

namespace Authorization\User\User\Infrastructure\UI\API\Controller;

use Authorization\User\User\Application\Query\GetMyProfile\GetMyProfileQuery;
use Authorization\User\User\Domain\Exception\GetUserException;
use Authorization\User\User\Domain\QueryModel\Dto\GetMyProfileResult;
use Shared\Shared\Shared\Domain\QueryModel\Dto\QuerySingleResult;
use Shared\Tool\Tool\Domain\Service\ImageStorageService;
use Shared\Tool\Tool\Infrastructure\Domain\Service\JsonResponse\JsonResponseBuilder;
use Shared\Tool\Tool\Infrastructure\Domain\Service\Request\RequestExtractor;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Messenger\Exception\HandlerFailedException;
use Symfony\Component\Messenger\HandleTrait;
use Symfony\Component\Messenger\MessageBusInterface;

final class GetMyAvatarController
{
    use HandleTrait;

    private const string IMAGE_AGGREGATE = 'user';

    public function __construct(
        MessageBusInterface $messageBus,
        private readonly ImageStorageService $imageStorageService,
    ) {
        $this->messageBus = $messageBus;
    }

    public function __invoke(Request $request): Response
    {
        try {
            /** @var QuerySingleResult $result */
            $result = $this->handle(message: new GetMyProfileQuery(
                userSessionId: RequestExtractor::getUserSessionId(request: $request),
            ));
        } catch (HandlerFailedException $e) {
            return JsonResponseBuilder::buildResponseFromBaseHandlerFailedException(
                exception: $e,
                exceptionStatusMap: [
                    GetUserException::class => Response::HTTP_NOT_FOUND,
                ]
            );
        }

        /** @var GetMyProfileResult $profile */
        $profile = $result->item;

        if (null === $profile->avatar) {
            return new Response(status: Response::HTTP_NOT_FOUND);
        }

        $path = $this->imageStorageService->aggregateImagePath(
            aggregate: self::IMAGE_AGGREGATE,
            aggregateId: $profile->id,
            image: $profile->avatar,
        );

        if (null === $path) {
            return new Response(status: Response::HTTP_NOT_FOUND);
        }

        $response = new BinaryFileResponse(file: $path);
        $response->setPrivate();
        $response->setMaxAge(365 * 24 * 3600);

        return $response;
    }
}
